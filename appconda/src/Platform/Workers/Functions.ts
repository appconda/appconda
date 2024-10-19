import { error } from "console";
import { API_KEY_DYNAMIC, APP_FUNCTION_CPUS_DEFAULT, APP_FUNCTION_MEMORY_DEFAULT, APP_FUNCTION_SPECIFICATION_DEFAULT, APP_VERSION_STABLE, FUNCTION_ALLOWLIST_HEADERS_REQUEST, FUNCTION_ALLOWLIST_HEADERS_RESPONSE, METRIC_EXECUTIONS, METRIC_EXECUTIONS_COMPUTE, METRIC_EXECUTIONS_MB_SECONDS, METRIC_FUNCTION_ID_EXECUTIONS, METRIC_FUNCTION_ID_EXECUTIONS_COMPUTE, METRIC_FUNCTION_ID_EXECUTIONS_MB_SECONDS } from "../../app/init";
import { Console } from "../../Tuval/CLI";
import { Config } from "../../Tuval/Config";
import { Document, Exception, ID, Permission, Role } from "../../Tuval/Core";
import { Database, Query } from "../../Tuval/Database";
import { Log } from "../../Tuval/Logger";
import { Action } from "../../Tuval/Platform/Action";
import { Message } from "../../Tuval/Queue";
import { Event } from "../../Appconda/Event/Event";
import { Func } from "../../Appconda/Event/Func";
import { Usage } from "../../Appconda/Event/Usage";
import { Executor } from "../../Appconda/Executor/Executor";
import { JWT } from "../../Appconda/JWT/JWT";
import { Realtime } from "../../Appconda/Messaging/Adapters/Realtime";
import { Execution } from "../../Appconda/Tuval/Response/Models/Execution";

export class Functions extends Action {
    public static getName(): string {
        return 'functions';
    }

    constructor() {
        super();
        this
            .desc('Functions worker')
            .groups(['functions'])
            .inject('message')
            .inject('dbForProject')
            .inject('queueForFunctions')
            .inject('queueForEvents')
            .inject('queueForUsage')
            .inject('log')
            .callback((message: Message, dbForProject: Database, queueForFunctions: Func, queueForEvents: Event, queueForUsage: Usage, log: Log) => this.action(message, dbForProject, queueForFunctions, queueForEvents, queueForUsage, log));
    }

    public async action(message: Message, dbForProject: Database, queueForFunctions: Func, queueForEvents: Event, queueForUsage: Usage, log: Log): Promise<void> {
        const payload = message.getPayload() || {};

        if (!payload) {
            throw new Exception('Missing payload');
        }

        const type = payload['type'] || '';
        const events = payload['events'] || [];
        const data = payload['body'] || '';
        const eventData = payload['payload'] || '';
        const project = new Document(payload['project'] || {});
        let functionDoc = new Document(payload['function'] || {});
        const functionId = payload['functionId'] || '';
        let user = new Document(payload['user'] || {});
        const userId = payload['userId'] || '';
        const method = payload['method'] || 'POST';
        const headers = payload['headers'] || [];
        const path = payload['path'] || '/';
        let jwt = payload['jwt'] || '';

        if (user.isEmpty() && userId) {
            user = await dbForProject.getDocument('users', userId);
        }

        if (!jwt && !user.isEmpty()) {
            const jwtExpiry = functionDoc.getAttribute('timeout', 900);
            const jwtObj = new JWT(process.env._APP_OPENSSL_KEY_V1, 'HS256', jwtExpiry);
            jwt = jwtObj.sign({
                userId: user.getId()
            });
        }

        if (project.getId() === 'console') {
            return;
        }

        if (functionDoc.isEmpty() && functionId) {
            functionDoc = await dbForProject.getDocument('functions', functionId);
        }

        log.addTag('functionId', functionDoc.getId());
        log.addTag('projectId', project.getId());
        log.addTag('type', type);

        if (events.length) {
            let limit = 30;
            let sum = 30;
            let offset = 0;
            while (sum >= limit) {
                const functions = await dbForProject.find('functions', [
                    Query.limit(limit),
                    Query.offset(offset),
                    Query.orderAsc('name'),
                ]);

                sum = functions.length;
                offset += limit;

                Console.log(`Fetched ${sum} functions...`);

                for (const functionDoc of functions) {
                    if (!events.some(event => functionDoc.getAttribute('events', []).includes(event))) {
                        continue;
                    }
                    Console.success(`Iterating function: ${functionDoc.getAttribute('name')}`);

                    await this.execute(
                        log,
                        dbForProject,
                        queueForFunctions,
                        queueForUsage,
                        queueForEvents,
                        project,
                        functionDoc,
                        'event',
                        '/',
                        'POST',
                        {
                            'user-agent': `Appconda/${APP_VERSION_STABLE}`,
                            'content-type': 'application/json'
                        },
                        null,
                        user,
                        null,
                        events[0],
                        typeof eventData === 'string' ? eventData : JSON.stringify(eventData),
                        null,
                    );
                    Console.success(`Triggered function: ${events[0]}`);
                }
            }
            return;
        }
        let execution;
        switch (type) {
            case 'http':
                execution = new Document(payload['execution'] || {});
                const user = new Document(payload['user'] || {});
                await this.execute(
                    log,
                    dbForProject,
                    queueForFunctions,
                    queueForUsage,
                    queueForEvents,
                    project,
                    functionDoc,
                    'http',
                    path,
                    method,
                    headers,
                    data,
                    user,
                    jwt,
                    null,
                    null,
                    execution.getId()
                );
                break;
            case 'schedule':
                execution = new Document(payload['execution'] || {});
                await this.execute(
                    log,
                    dbForProject,
                    queueForFunctions,
                    queueForUsage,
                    queueForEvents,
                    project,
                    functionDoc,
                    'schedule',
                    path,
                    method,
                    headers,
                    data,
                    user,
                    jwt,
                    null,
                    null,
                    execution.getId() || null
                );
                break;
        }
    }

    private async fail(
        message: string,
        dbForProject: Database,
        functionDoc: Document,
        trigger: string,
        path: string,
        method: string,
        user: Document,
        jwt: string | null = null,
        event: string | null = null,
    ): Promise<void> {
        const headers: Record<string, string> = {
            'x-appconda-trigger': trigger,
            'x-appconda-event': event || '',
            'x-appconda-user-id': user.getId() || '',
            'x-appconda-user-jwt': jwt || ''
        };

        const headersFiltered = Object.entries(headers)
            .filter(([key]) => FUNCTION_ALLOWLIST_HEADERS_REQUEST.includes(key.toLowerCase()))
            .map(([key, value]) => ({ name: key, value }));

        const executionId = ID.unique();
        const execution = new Document({
            '$id': executionId,
            '$permissions': user.isEmpty() ? [] : [Permission.read(Role.user(user.getId()))],
            'functionInternalId': functionDoc.getInternalId(),
            'functionId': functionDoc.getId(),
            'deploymentInternalId': '',
            'deploymentId': '',
            'trigger': trigger,
            'status': 'failed',
            'responseStatusCode': 0,
            'responseHeaders': [],
            'requestPath': path,
            'requestMethod': method,
            'requestHeaders': headersFiltered,
            'errors': message,
            'logs': '',
            'duration': 0.0,
            'search': [functionDoc.getId(), executionId].join(' '),
        });

        const createdExecution = await dbForProject.createDocument('executions', execution);

        if (createdExecution.isEmpty()) {
            throw new Exception('Failed to create execution');
        }
    }

    private async execute(
        log: Log,
        dbForProject: Database,
        queueForFunctions: Func,
        queueForUsage: Usage,
        queueForEvents: Event,
        project: Document,
        functionDoc: Document,
        trigger: string,
        path: string,
        method: string,
        headers: Record<string, string>,
        data: string | null = null,
        user: Document | null = null,
        jwt: string | null = null,
        event: string | null = null,
        eventData: string | null = null,
        executionId: string | null = null,
    ): Promise<void> {
        user = user || new Document();
        const functionId = functionDoc.getId();
        const deploymentId = functionDoc.getAttribute('deployment', '');
        const spec = Config.getParam('runtime-specifications')[functionDoc.getAttribute('specification', APP_FUNCTION_SPECIFICATION_DEFAULT)];

        log.addTag('deploymentId', deploymentId);

        const deployment = await dbForProject.getDocument('deployments', deploymentId);

        if (deployment.getAttribute('resourceId') !== functionId) {
            const errorMessage = 'The execution could not be completed because a corresponding deployment was not found. A function deployment needs to be created before it can be executed. Please create a deployment for your function and try again.';
            await this.fail(errorMessage, dbForProject, functionDoc, trigger, path, method, user, jwt, event);
            return;
        }

        if (deployment.isEmpty()) {
            const errorMessage = 'The execution could not be completed because a corresponding deployment was not found. A function deployment needs to be created before it can be executed. Please create a deployment for your function and try again.';
            await this.fail(errorMessage, dbForProject, functionDoc, trigger, path, method, user, jwt, event);
            return;
        }

        const buildId = deployment.getAttribute('buildId', '');

        log.addTag('buildId', buildId);

        const build = await dbForProject.getDocument('builds', buildId);
        if (build.isEmpty()) {
            const errorMessage = 'The execution could not be completed because a corresponding deployment was not found. A function deployment needs to be created before it can be executed. Please create a deployment for your function and try again.';
            await this.fail(errorMessage, dbForProject, functionDoc, trigger, path, method, user, jwt, event);
            return;
        }

        if (build.getAttribute('status') !== 'ready') {
            const errorMessage = 'The execution could not be completed because the build is not ready. Please wait for the build to complete and try again.';
            await this.fail(errorMessage, dbForProject, functionDoc, trigger, path, method, user, jwt, event);
            return;
        }

        const version = functionDoc.getAttribute('version', 'v2');
        const runtimes = Config.getParam(version === 'v2' ? 'runtimes-v2' : 'runtimes', {});

        if (!runtimes.hasOwnProperty(functionDoc.getAttribute('runtime'))) {
            throw new Exception(`Runtime "${functionDoc.getAttribute('runtime', '')}" is not supported`);
        }

        const runtime = runtimes[functionDoc.getAttribute('runtime')];

        const jwtExpiry = functionDoc.getAttribute('timeout', 900);
        const jwtObj = new JWT(process.env._APP_OPENSSL_KEY_V1, 'HS256', jwtExpiry);
        const apiKey = jwtObj.sign({
            projectId: project.getId(),
            scopes: functionDoc.getAttribute('scopes', [])
        });

        headers['x-appconda-key'] = `${API_KEY_DYNAMIC}_${apiKey}`;
        headers['x-appconda-trigger'] = trigger;
        headers['x-appconda-event'] = event || '';
        headers['x-appconda-user-id'] = user.getId() || '';
        headers['x-appconda-user-jwt'] = jwt || '';
        headers['x-appconda-country-code'] = '';
        headers['x-appconda-continent-code'] = '';
        headers['x-appconda-continent-eu'] = 'false';

        const execution = await dbForProject.getDocument('executions', executionId || '');
        if (execution.isEmpty()) {
            const headersFiltered = Object.entries(headers)
                .filter(([key]) => FUNCTION_ALLOWLIST_HEADERS_REQUEST.includes(key.toLowerCase()))
                .map(([key, value]) => ({ name: key, value }));

            const executionId = ID.unique();
            const execution = new Document({
                '$id': executionId,
                '$permissions': user.isEmpty() ? [] : [Permission.read(Role.user(user.getId()))],
                'functionInternalId': functionDoc.getInternalId(),
                'functionId': functionDoc.getId(),
                'deploymentInternalId': deployment.getInternalId(),
                'deploymentId': deployment.getId(),
                'trigger': trigger,
                'status': 'processing',
                'responseStatusCode': 0,
                'responseHeaders': [],
                'requestPath': path,
                'requestMethod': method,
                'requestHeaders': headersFiltered,
                'errors': '',
                'logs': '',
                'duration': 0.0,
                'search': [functionId, executionId].join(' '),
            });

            const createdExecution = await dbForProject.createDocument('executions', execution);

            if (createdExecution.isEmpty()) {
                throw new Exception('Failed to create or read execution');
            }
        }

        if (execution.getAttribute('status') !== 'processing') {
            execution.setAttribute('status', 'processing');

            dbForProject.updateDocument('executions', executionId, execution);
        }

        const durationStart = Date.now();

        let body = eventData || '';
        if (!body) {
            body = data || '';
        }

        const vars: Record<string, string> = {};

        if (version === 'v2') {
            Object.assign(vars, {
                'APPCONDA_FUNCTION_TRIGGER': headers['x-appconda-trigger'] || '',
                'APPCONDA_FUNCTION_DATA': body || '',
                'APPCONDA_FUNCTION_EVENT_DATA': body || '',
                'APPCONDA_FUNCTION_EVENT': headers['x-appconda-event'] || '',
                'APPCONDA_FUNCTION_USER_ID': headers['x-appconda-user-id'] || '',
                'APPCONDA_FUNCTION_JWT': headers['x-appconda-user-jwt'] || ''
            });
        }

        for (const varDoc of functionDoc.getAttribute('varsProject', [])) {
            vars[varDoc.getAttribute('key')] = varDoc.getAttribute('value', '');
        }

        for (const varDoc of functionDoc.getAttribute('vars', [])) {
            vars[varDoc.getAttribute('key')] = varDoc.getAttribute('value', '');
        }

        const protocol = process.env._APP_OPTIONS_FORCE_HTTPS === 'disabled' ? 'http' : 'https';
        const hostname = process.env._APP_DOMAIN;
        const endpoint = `${protocol}://${hostname}/v1`;

        Object.assign(vars, {
            'APPCONDA_FUNCTION_API_ENDPOINT': endpoint,
            'APPCONDA_FUNCTION_ID': functionId,
            'APPCONDA_FUNCTION_NAME': functionDoc.getAttribute('name'),
            'APPCONDA_FUNCTION_DEPLOYMENT': deploymentId,
            'APPCONDA_FUNCTION_PROJECT_ID': project.getId(),
            'APPCONDA_FUNCTION_RUNTIME_NAME': runtime['name'] || '',
            'APPCONDA_FUNCTION_RUNTIME_VERSION': runtime['version'] || '',
            'APPCONDA_FUNCTION_CPUS': spec['cpus'] || APP_FUNCTION_CPUS_DEFAULT,
            'APPCONDA_FUNCTION_MEMORY': spec['memory'] || APP_FUNCTION_MEMORY_DEFAULT,
            'APPCONDA_VERSION': APP_VERSION_STABLE,
            'APPCONDA_REGION': project.getAttribute('region'),
            'APPCONDA_DEPLOYMENT_TYPE': deployment.getAttribute('type', ''),
            'APPCONDA_VCS_REPOSITORY_ID': deployment.getAttribute('providerRepositoryId', ''),
            'APPCONDA_VCS_REPOSITORY_NAME': deployment.getAttribute('providerRepositoryName', ''),
            'APPCONDA_VCS_REPOSITORY_OWNER': deployment.getAttribute('providerRepositoryOwner', ''),
            'APPCONDA_VCS_REPOSITORY_URL': deployment.getAttribute('providerRepositoryUrl', ''),
            'APPCONDA_VCS_REPOSITORY_BRANCH': deployment.getAttribute('providerBranch', ''),
            'APPCONDA_VCS_REPOSITORY_BRANCH_URL': deployment.getAttribute('providerBranchUrl', ''),
            'APPCONDA_VCS_COMMIT_HASH': deployment.getAttribute('providerCommitHash', ''),
            'APPCONDA_VCS_COMMIT_MESSAGE': deployment.getAttribute('providerCommitMessage', ''),
            'APPCONDA_VCS_COMMIT_URL': deployment.getAttribute('providerCommitUrl', ''),
            'APPCONDA_VCS_COMMIT_AUTHOR_NAME': deployment.getAttribute('providerCommitAuthor', ''),
            'APPCONDA_VCS_COMMIT_AUTHOR_URL': deployment.getAttribute('providerCommitAuthorUrl', ''),
            'APPCONDA_VCS_ROOT_DIRECTORY': deployment.getAttribute('providerRootDirectory', ''),
        });

        let error;
        let errorCode;

        try {
            const version = functionDoc.getAttribute('version', 'v2');
            let command = runtime['startCommand'];
            const executor = new Executor(process.env._APP_EXECUTOR_HOST);
            command = version === 'v2' ? '' : `cp /tmp/code.tar.gz /mnt/code/code.tar.gz && nohup helpers/start.sh "${command}"`;
            const executionResponse = executor.createExecution({
                projectId: project.getId(),
                deploymentId: deploymentId,
                body: body.length > 0 ? body : null,
                variables: vars,
                timeout: functionDoc.getAttribute('timeout', 0),
                image: runtime['image'],
                source: build.getAttribute('path', ''),
                entrypoint: deployment.getAttribute('entrypoint', ''),
                version: version,
                path: path,
                method: method,
                headers: headers,
                runtimeEntrypoint: command,
                cpus: spec['cpus'] || APP_FUNCTION_CPUS_DEFAULT,
                memory: spec['memory'] || APP_FUNCTION_MEMORY_DEFAULT,
                requestTimeout: 10000
               // logging: functionDoc.getAttribute('logging', true),
            });



            const status = executionResponse['statusCode'] >= 500 ? 'failed' : 'completed';

            const headersFiltered = Object.entries(executionResponse['headers'])
                .filter(([key]) => FUNCTION_ALLOWLIST_HEADERS_RESPONSE.includes(key.toLowerCase()))
                .map(([key, value]) => ({ name: key, value }));

            execution
                .setAttribute('status', status)
                .setAttribute('responseStatusCode', executionResponse['statusCode'])
                .setAttribute('responseHeaders', headersFiltered)
                .setAttribute('logs', executionResponse['logs'])
                .setAttribute('errors', executionResponse['errors'])
                .setAttribute('duration', executionResponse['duration']);
        } catch (th) {
            const durationEnd = Date.now();
            execution
                .setAttribute('duration', durationEnd - durationStart)
                .setAttribute('status', 'failed')
                .setAttribute('responseStatusCode', 500)
                .setAttribute('errors', `${th.message}\nError Code: ${th.code}`);

            const error = th.message;
            const errorCode = th.code;
        } finally {
            queueForUsage
                .setProject(project)
                .addMetric(METRIC_EXECUTIONS, 1)
                .addMetric(METRIC_FUNCTION_ID_EXECUTIONS.replace('{functionInternalId}', functionDoc.getInternalId()), 1)
                .addMetric(METRIC_EXECUTIONS_COMPUTE, Math.floor(execution.getAttribute('duration') * 1000))
                .addMetric(METRIC_FUNCTION_ID_EXECUTIONS_COMPUTE.replace('{functionInternalId}', functionDoc.getInternalId()), Math.floor(execution.getAttribute('duration') * 1000))
                .addMetric(METRIC_EXECUTIONS_MB_SECONDS, Math.floor((spec['memory'] || APP_FUNCTION_MEMORY_DEFAULT) * execution.getAttribute('duration', 0) * (spec['cpus'] || APP_FUNCTION_CPUS_DEFAULT)))
                .addMetric(METRIC_FUNCTION_ID_EXECUTIONS_MB_SECONDS.replace('{functionInternalId}', functionDoc.getInternalId()), Math.floor((spec['memory'] || APP_FUNCTION_MEMORY_DEFAULT) * execution.getAttribute('duration', 0) * (spec['cpus'] || APP_FUNCTION_CPUS_DEFAULT)))
                .trigger();
        }

        dbForProject.updateDocument('executions', executionId, execution);

        const executionModel = new Execution();
        queueForEvents
            .setQueue(Event.WEBHOOK_QUEUE_NAME)
            .setClass(Event.WEBHOOK_CLASS_NAME)
            .setProject(project)
            .setUser(user)
            .setEvent('functions.[functionId].executions.[executionId].update')
            .setParam('functionId', functionDoc.getId())
            .setParam('executionId', execution.getId())
            .setPayload(execution.getArrayCopy(Object.keys(executionModel.getRules())))
            .trigger();

        queueForFunctions
            .from(queueForEvents)
            .trigger();

        const allEvents = Event.generateEvents('functions.[functionId].executions.[executionId].update', {
            'functionId': functionDoc.getId(),
            'executionId': execution.getId()
        });
        const target = Realtime.fromPayload(
            allEvents[0],
            execution
        );
        Realtime.send(
            'console',
            execution.getArrayCopy(),
            allEvents,
            target['channels'],
            target['roles']
        );
        Realtime.send(
            project.getId(),
            execution.getArrayCopy(),
            allEvents,
            target['channels'],
            target['roles']
        );

        if (error) {
            throw new Exception(error, errorCode);
        }
    }
}