
import { Authorization, Document, Hostname, ID, Text } from '../../Tuval/Core';
import { V16 as RequestV16 } from '../../Appconda/Tuval/Request/Filters/V16';
import { V17 as ResponseV17 } from '../../Appconda/Tuval/Response/Filters/V17';
import {
    APP_STORAGE_CERTIFICATES, APP_VERSION_STABLE, FUNCTION_ALLOWLIST_HEADERS_REQUEST, FUNCTION_ALLOWLIST_HEADERS_RESPONSE, METRIC_EXECUTIONS, METRIC_EXECUTIONS_COMPUTE, METRIC_EXECUTIONS_MB_SECONDS, METRIC_FUNCTION_ID_EXECUTIONS, METRIC_FUNCTION_ID_EXECUTIONS_COMPUTE, METRIC_FUNCTION_ID_EXECUTIONS_MB_SECONDS,
    register as reg
} from '../init';
import { Response } from '../../Appconda/Tuval/Response';
import { Database, Query } from '../../Tuval/Database';
import { Usage } from '../../Appconda/Event/Usage';
import { Request } from '../../Appconda/Tuval/Request';
import { AppcondaException } from '../../Appconda/Extend/Exception';
import { Event } from '../../Appconda/Event/Event';
import { Executor } from '../../Appconda/Executor/Executor';
import { Console } from '../../Tuval/CLI';
import { Locale } from '../../Tuval/Locale';
import { Certificate } from '../../Appconda/Event/Certificate';
import { Domain } from '../../Tuval/Domains';
import { Origin } from '../../Appconda/Network/Validators/Origin';
import { DSN } from '../../Tuval/DSN';
import { View } from '../../Appconda/Tuval/View';
import { promises as fs } from 'fs';
import { Config } from "../../Tuval/Config";
import { Auth } from '../../Tuval/Auth';
import path from 'path';
import { App } from '../../Tuval/Http';
import { Log, Logger } from '../../Tuval/Logger';
import { parse } from 'url';

export const register = reg;

function versionCompare(version1: string, version2: string, operator: string): boolean {
    const parseVersion = (version: string) => version.split('.').map(Number);

    const v1 = parseVersion(version1);
    const v2 = parseVersion(version2);

    const maxLen = Math.max(v1.length, v2.length);

    // Uzunlukları eşitlemek için eksik değerleri 0 ile dolduruyoruz
    while (v1.length < maxLen) v1.push(0);
    while (v2.length < maxLen) v2.push(0);

    for (let i = 0; i < maxLen; i++) {
        if (v1[i] > v2[i]) return operator === '>' || operator === '>=' || operator === '!=';
        if (v1[i] < v2[i]) return operator === '<' || operator === '<=' || operator === '!=';
    }

    // Eğer tüm değerler eşitse, sadece '==' veya '>=' ve '<=' durumlarında true döner
    return operator === '==' || operator === '>=' || operator === '<=';
}



Config.setParam('domainVerification', false);
Config.setParam('cookieDomain', 'localhost');
Config.setParam('cookieSamesite', Response.COOKIE_SAMESITE_NONE);


async function router(
    appconda: App,
    dbForConsole: Database,
    getProjectDB: (project: Document) => Database,
    expressRequest: any,
    request: Request,
    response: Response,
    queueForEvents: Event,
    queueForUsage: Usage,
    geodb: any
) {
    appconda.getRoute()?.label('error', __dirname + '/../views/general/error.phtml');

    const host = request.getHostname() ?? '';

    const route = (await Authorization.skip(
        () => dbForConsole.find('rules', [
            Query.equal('domain', [host]),
            Query.limit(1)
        ])
    ))[0] ?? null;

    if (route === null) {
        //@ts-ignore
        if (host === process.env._APP_DOMAIN_FUNCTIONS ?? '') {
            throw new AppcondaException(AppcondaException.GENERAL_ACCESS_FORBIDDEN, 'This domain cannot be used for security reasons. Please use any subdomain instead.');
        }

        if (host.endsWith(process.env._APP_DOMAIN_FUNCTIONS ?? '')) {
            throw new AppcondaException(AppcondaException.GENERAL_ACCESS_FORBIDDEN, 'This domain is not connected to any Appconda resource yet. Please configure custom domain or function domain to allow this request.');
        }

        if (process.env._APP_OPTIONS_ROUTER_PROTECTION === 'enabled') {
            if (host !== 'localhost' && host !== process.env.APP_HOSTNAME_INTERNAL) {
                throw new AppcondaException(AppcondaException.GENERAL_ACCESS_FORBIDDEN, 'Router protection does not allow accessing Appconda over this domain. Please add it as custom domain to your project or disable _APP_OPTIONS_ROUTER_PROTECTION environment variable.');
            }
        }

        appconda.getRoute()?.label('error', '');
        return false;
    }

    const projectId = route.getAttribute('projectId');
    const project = await Authorization.skip(
        () => dbForConsole.getDocument('projects', projectId)
    );
    if (project.getAttribute('services', {}).proxy) {
        const status = project.getAttribute('services', {}).proxy;
        if (!status) {
            throw new AppcondaException(AppcondaException.GENERAL_SERVICE_DISABLED, 'Proxy service is disabled for this project.');
        }
    }

    const path = expressRequest.server['request_uri'] ?? '/';
    if (path.startsWith('/.well-known/acme-challenge')) {
        return false;
    }

    const type = route.getAttribute('resourceType');

    if (type === 'function') {
        if (process.env._APP_OPTIONS_FUNCTIONS_FORCE_HTTPS === 'enabled') {
            if (request.getProtocol() !== 'https') {
                if (request.getMethod() !== 'GET') {
                    throw new AppcondaException(AppcondaException.GENERAL_PROTOCOL_UNSUPPORTED, 'Method unsupported over HTTP. Please use HTTPS instead.');
                }

                return response.redirect('https://' + request.getHostname() + request.getURI());
            }
        }

        const functionId = route.getAttribute('resourceId');
        const projectId = route.getAttribute('projectId');

        let path = expressRequest.server['request_uri'] ?? '/';
        const query = expressRequest.server['query_string'] ?? '';
        if (query) {
            path += '?' + query;
        }

        let body = expressRequest.getContent() ?? '';
        const method = expressRequest.server['request_method'];

        const requestHeaders = request.getHeaders();

        const project = await Authorization.skip(() => dbForConsole.getDocument('projects', projectId));

        const dbForProject = getProjectDB(project);

        const func = await Authorization.skip(() => dbForProject.getDocument('functions', functionId));

        if (func.isEmpty() || !func.getAttribute('enabled')) {
            throw new AppcondaException(AppcondaException.FUNCTION_NOT_FOUND, 'Function not found');
        }

        const version = func.getAttribute('version', 'v2');
        const runtimes = Config.getParam(version === 'v2' ? 'runtimes-v2' : 'runtimes', []);

        const runtime = runtimes[func.getAttribute('runtime', '')] || null;

        if (!runtime) {
            throw new AppcondaException(AppcondaException.FUNCTION_RUNTIME_UNSUPPORTED, 'Runtime "' + func.getAttribute('runtime', '') + '" is not supported');
        }

        const deployment = await Authorization.skip(() => dbForProject.getDocument('deployments', func.getAttribute('deployment', '')));

        if (deployment.getAttribute('resourceId') !== func.getId()) {
            throw new AppcondaException(AppcondaException.DEPLOYMENT_NOT_FOUND, 'Deployment not found. Create a deployment before trying to execute a function');
        }

        if (deployment.isEmpty()) {
            throw new AppcondaException(AppcondaException.DEPLOYMENT_NOT_FOUND, 'Deployment not found. Create a deployment before trying to execute a function');
        }

        const build = await Authorization.skip(() => dbForProject.getDocument('builds', deployment.getAttribute('buildId', '')));
        if (build.isEmpty()) {
            throw new AppcondaException(AppcondaException.BUILD_NOT_FOUND, 'Build not found');
        }

        if (build.getAttribute('status') !== 'ready') {
            throw new AppcondaException(AppcondaException.BUILD_NOT_READY, 'Build not ready');
        }

        const permissions = func.getAttribute('execute');

        if (!permissions.includes('any') && !permissions.includes('guests')) {
            throw new AppcondaException(AppcondaException.USER_UNAUTHORIZED, 'To execute function using domain, execute permissions must include "any" or "guests"');
        }

        let headers = { ...requestHeaders };
        headers['x-aappconda-trigger'] = 'http';
        headers['x-aappconda-user-id'] = '';
        headers['x-aappconda-user-jwt'] = '';
        headers['x-aappconda-country-code'] = '';
        headers['x-aappconda-continent-code'] = '';
        headers['x-aappconda-continent-eu'] = 'false';

        const ip = headers['x-real-ip'] ?? '';
        if (ip) {
            const record = geodb.get(ip);

            if (record) {
                const eu = Config.getParam('locale-eu');

                headers['x-aappconda-country-code'] = record.country.iso_code ?? '';
                headers['x-aappconda-continent-code'] = record.continent.code ?? '';
                headers['x-aappconda-continent-eu'] = eu.includes(record.country.iso_code) ? 'true' : 'false';
            }
        }

        const headersFiltered = Object.entries(headers)
            .filter(([key]) => FUNCTION_ALLOWLIST_HEADERS_REQUEST.includes(key.toLowerCase()))
            .map(([key, value]) => ({ name: key, value }));

        const executionId = ID.unique();

        const execution = new Document({
            '$id': executionId,
            '$permissions': [],
            'functionInternalId': func.getInternalId(),
            'functionId': func.getId(),
            'deploymentInternalId': deployment.getInternalId(),
            'deploymentId': deployment.getId(),
            'trigger': 'http',
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

        queueForEvents
            .setParam('functionId', func.getId())
            .setParam('executionId', execution.getId())
            .setContext('function', func);

        const durationStart = Date.now();

        let vars: Record<string, string> = {};

        if (version === 'v2') {
            vars = {
                'APPWRITE_FUNCTION_TRIGGER': headers['x-appconda-trigger'] ?? '',
                'APPWRITE_FUNCTION_DATA': body ?? '',
                'APPWRITE_FUNCTION_USER_ID': headers['x-appconda-user-id'] ?? '',
                'APPWRITE_FUNCTION_JWT': headers['x-appconda-user-jwt'] ?? ''
            };
        }

        for (const varProject of func.getAttribute('varsProject', [])) {
            vars[varProject.getAttribute('key')] = varProject.getAttribute('value', '');
        }

        for (const varFunc of func.getAttribute('vars', [])) {
            vars[varFunc.getAttribute('key')] = varFunc.getAttribute('value', '');
        }

        vars = {
            ...vars,
            'APPWRITE_FUNCTION_ID': functionId,
            'APPWRITE_FUNCTION_NAME': func.getAttribute('name'),
            'APPWRITE_FUNCTION_DEPLOYMENT': deployment.getId(),
            'APPWRITE_FUNCTION_PROJECT_ID': project.getId(),
            'APPWRITE_FUNCTION_RUNTIME_NAME': runtime.name ?? '',
            'APPWRITE_FUNCTION_RUNTIME_VERSION': runtime.version ?? '',
        };

        const executor = new Executor(process.env._APP_EXECUTOR_HOST ?? '');
        let executionResponse;
        try {
            const command = version === 'v2' ? '' : `cp /tmp/code.tar.gz /mnt/code/code.tar.gz && nohup helpers/start.sh "${runtime.startCommand}"`;
            executionResponse = await executor.createExecution({
                projectId: project.getId(),
                deploymentId: deployment.getId(),
                body: body.length > 0 ? body : null,
                variables: vars,
                timeout: func.getAttribute('timeout', 0),
                image: runtime.image,
                source: build.getAttribute('path', ''),
                entrypoint: deployment.getAttribute('entrypoint', ''),
                version: version,
                path: path,
                method: method,
                headers: headers,
                runtimeEntrypoint: command,
                requestTimeout: 30
            });

            const headersFiltered = Object.entries(executionResponse.headers)
                .filter(([key]) => FUNCTION_ALLOWLIST_HEADERS_RESPONSE.includes(key.toLowerCase()))
                .map(([key, value]) => ({ name: key, value }));

            const status = executionResponse.statusCode >= 400 ? 'failed' : 'completed';
            execution.setAttribute('status', status);
            execution.setAttribute('responseStatusCode', executionResponse.statusCode);
            execution.setAttribute('responseHeaders', headersFiltered);
            execution.setAttribute('logs', executionResponse.logs);
            execution.setAttribute('errors', executionResponse.errors);
            execution.setAttribute('duration', executionResponse.duration);

        } catch (th: any) {
            const durationEnd = Date.now();

            execution
                .setAttribute('duration', (durationEnd - durationStart) / 1000)
                .setAttribute('status', 'failed')
                .setAttribute('responseStatusCode', 500)
                .setAttribute('errors', th.message + '\nError Code: ' + th.code);
            Console.error(th.message);

            if (th instanceof AppcondaException) {
                throw th;
            }
        } finally {
            queueForUsage
                .addMetric(METRIC_EXECUTIONS, 1)
                .addMetric(METRIC_FUNCTION_ID_EXECUTIONS.replace('{functionInternalId}', func.getInternalId()), 1)
                .addMetric(METRIC_EXECUTIONS_COMPUTE, Math.round(execution.getAttribute('duration') * 1000))
                .addMetric(METRIC_FUNCTION_ID_EXECUTIONS_COMPUTE.replace('{functionInternalId}', func.getInternalId()), Math.round(execution.getAttribute('duration') * 1000))
                .addMetric(METRIC_EXECUTIONS_MB_SECONDS, Math.round(512 * execution.getAttribute('duration', 0)))
                .addMetric(METRIC_FUNCTION_ID_EXECUTIONS_MB_SECONDS.replace('{functionInternalId}', func.getInternalId()), Math.round(512 * execution.getAttribute('duration', 0)))
                .setProject(project)
                .trigger();

            if (func.getAttribute('logging')) {
                await Authorization.skip(() => dbForProject.createDocument('executions', execution));
            }
        }

        execution.setAttribute('logs', '');
        execution.setAttribute('errors', '');

        headers = (executionResponse.headers ?? []).map(([key, value]) => ({ name: key, value }));

        execution.setAttribute('responseBody', executionResponse.body ?? '');
        execution.setAttribute('responseHeaders', headers);

        body = execution.getAttribute('responseBody') ?? '';

        const encodingKey = execution.getAttribute('responseHeaders').findIndex((header: { name: string }) => header.name === 'x-open-runtimes-encoding');
        if (encodingKey !== -1) {
            if (execution.getAttribute('responseHeaders')[encodingKey].value === 'base64') {
                body = Buffer.from(body, 'base64').toString('utf-8');
            }
        }

        let contentType = 'text/plain';
        for (const header of execution.getAttribute('responseHeaders')) {
            if (header.name.toLowerCase() === 'content-type') {
                contentType = header.value;
            }

            response.setHeader(header.name, header.value);
        }

        response
            .setContentType(contentType)
            .setStatusCode(execution.getAttribute('responseStatusCode') ?? 200)
            .send(body);

        return true;
    } else if (type === 'api') {
        appconda.getRoute()?.label('error', '');
        return false;
    } else {
        throw new AppcondaException(AppcondaException.GENERAL_SERVER_ERROR, 'Unknown resource type ' + type);
    }


}



App.init()
    .groups(['database', 'functions', 'storage', 'messaging'])
    .inject('project')
    .inject('request')
    .action( async (project: Document, request: Request) => {
        if (project.getId() === 'console') {
            const message = !request.getHeader('x-appconda-project') ?
                'No Appconda project was specified. Please specify your project ID when initializing your Appconda SDK.' :
                'This endpoint is not available for the console project. The Appconda Console is a reserved project ID and cannot be used with the Appconda SDKs and APIs. Please check if your project ID is correct.';
            throw new AppcondaException(AppcondaException.GENERAL_ACCESS_FORBIDDEN, message);
        }
    });
// setroute init
App.init()
    .groups(['api', 'web'])
    .inject('appconda')
    .inject('expressRequest')
    .inject('request')
    .inject('response')
    .inject('console')
    .inject('project')
    .inject('dbForConsole')
    .inject('getProjectDB')
    .inject('locale')
    .inject('localeCodes')
    .inject('clients')
    .inject('geodb')
    .inject('queueForUsage')
    .inject('queueForEvents')
    .inject('queueForCertificates')
    .action(async (
        appconda: App,
        expressRequest: any,
        request: Request,
        response: Response,
        console: Document,
        project: Document,
        dbForConsole: Database,
        getProjectDB: (project: Document) => Database,
        locale: Locale,
        localeCodes: string[],
        clients: string[],
        geodb: any,
        queueForUsage: Usage,
        queueForEvents: Event,
        queueForCertificates: Certificate
    ) => {
        const host = request.getHostname() ?? '';
        const mainDomain = process.env._APP_DOMAIN ?? '';

        if (host !== mainDomain) {
            if (await router(appconda, dbForConsole, getProjectDB, expressRequest, request, response, queueForEvents, queueForUsage, geodb)) {
                return;
            }
        }

        const route = appconda.getRoute();
        Request.setRoute(route);

        if (!route) {
            return response
                .setStatusCode(404)
                .send('Not Found');
        }

        const requestFormat = request.getHeader('x-appconda-response-format', process.env._APP_SYSTEM_RESPONSE_FORMAT || '');
        if (requestFormat) {
            if (versionCompare(requestFormat, '1.4.0', '<')) {
                request.addFilter(new RequestV16());
            }
            if (versionCompare(requestFormat, '1.5.0', '<')) {
                //@ts-ignore
                request.addFilter(new RequestV17());
            }
        }

        let domain: string | Domain = request.getHostname();
        const domains = Config.getParam('domains', {});
        if (!domains[domain]) {
            domain = new Domain(domain || '') as Domain;

            if (!domain.get() || !domain.isKnown() || domain.isTest()) {
                domains[domain.get()] = false;
                Console.warning(`${domain.get()} is not a publicly accessible domain. Skipping SSL certificate generation.`);
            } else if (request.getURI().startsWith('/.well-known/acme-challenge')) {
                Console.warning('Skipping SSL certificates generation on ACME challenge.');
            } else {
                Authorization.disable();

                const envDomain = process.env._APP_DOMAIN || '';
                let mainDomain = envDomain && envDomain !== 'localhost' ? envDomain : null;
                if (!mainDomain) {
                    const domainDocument = await dbForConsole.findOne('rules', [Query.orderAsc('$id')]);
                    mainDomain = domainDocument ? domainDocument.getAttribute('domain') : domain.get();
                }

                if (mainDomain !== domain.get()) {
                    Console.warning(`${domain.get()} is not a main domain. Skipping SSL certificate generation.`);
                } else {
                    let domainDocument = await dbForConsole.findOne('rules', [
                        Query.equal('domain', [domain.get()])
                    ]);

                    if (!domainDocument) {
                        domainDocument = new Document({
                            domain: domain.get(),
                            resourceType: 'api',
                            status: 'verifying',
                            projectId: 'console',
                            projectInternalId: 'console'
                        });

                        domainDocument = await dbForConsole.createDocument('rules', domainDocument);

                        Console.info(`Issuing a TLS certificate for the main domain (${domain.get()}) in a few seconds...`);

                        queueForCertificates
                            .setDomain(domainDocument)
                            .setSkipRenewCheck(true)
                            .trigger();
                    }
                }
                domains[domain.get()] = true;

                Authorization.reset();
            }
            Config.setParam('domains', domains);
        }

        const localeParam = request.getParam('locale', request.getHeader('x-appconda-locale', ''));
        if (localeCodes.includes(localeParam)) {
            locale.setDefault(localeParam);
        }

        const referrer = request.getReferer();
        const parsedUrl = parse(referrer, true);
        const origin = parsedUrl.hostname ?? '';
        const protocol = parsedUrl.protocol?.slice(0, parsedUrl.protocol.length - 1) ?? '';
        const port = parsedUrl.port ?? '';
        /* const origin = new URL(request.getOrigin(referrer)).hostname;
        const protocol = new URL(request.getOrigin(referrer)).protocol;
        const port = new URL(request.getOrigin(referrer)).port; */

        let refDomainOrigin = 'localhost';
        const validator = new Hostname(clients);
        if (validator.isValid(origin)) {
            refDomainOrigin = origin;
        }

        let refDomain = `${protocol || request.getProtocol()}://${refDomainOrigin}${port ? `:${port}` : ''}`;

        refDomain = !route.getLabel('origin', false)
            ? refDomain
            : `${protocol || request.getProtocol()}://${origin}${port ? `:${port}` : ''}`;

        const selfDomain = new Domain(request.getHostname());
        const endDomain = new Domain(origin);

        Config.setParam(
            'domainVerification',
            selfDomain.getRegisterable() === endDomain.getRegisterable() && endDomain.getRegisterable() !== ''
        );

        const isLocalHost = request.getHostname() === 'localhost' || request.getHostname() === `localhost:${request.getPort()}`;
        const isIpAddress = !!request.getHostname().match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);

        const isConsoleProject = project.getAttribute('$id', '') === 'console';
        const isConsoleRootSession = process.env._APP_CONSOLE_ROOT_SESSION === 'enabled';

        Config.setParam(
            'cookieDomain',
            isLocalHost || isIpAddress
                ? null
                : isConsoleProject && isConsoleRootSession
                    ? `.${selfDomain.getRegisterable()}`
                    : `.${request.getHostname()}`
        );

        const responseFormat = request.getHeader('x-appconda-response-format', process.env._APP_SYSTEM_RESPONSE_FORMAT || '');
        if (responseFormat) {
            if (versionCompare(responseFormat, '1.4.0', '<')) {
                //@ts-ignore
                response.addFilter(new ResponseV16());
            }
            if (versionCompare(responseFormat, '1.5.0', '<')) {
                response.addFilter(new ResponseV17());
            }
            if (versionCompare(responseFormat, APP_VERSION_STABLE, '>')) {
                response.addHeader('X-Appconda-Warning', `The current SDK is built for Appconda ${responseFormat}. However, the current Appconda server version is ${APP_VERSION_STABLE}. Please downgrade your SDK to match the Appconda version: https://appconda.io/docs/sdks`);
            }
        }

        if (process.env._APP_OPTIONS_FORCE_HTTPS === 'enabled') {
            if (request.getProtocol() !== 'https' && expressRequest.header['host'] !== 'localhost' && expressRequest.header['host'] !== process.env.APP_HOSTNAME_INTERNAL) {
                if (request.getMethod() !== Request.METHOD_GET) {
                    throw new AppcondaException(AppcondaException.GENERAL_PROTOCOL_UNSUPPORTED, 'Method unsupported over HTTP. Please use HTTPS instead.');
                }

                return response.redirect(`https://${request.getHostname()}${request.getURI()}`);
            }
        }

        if (request.getProtocol() === 'https') {
            response.addHeader('Strict-Transport-Security', `max-age=${60 * 60 * 24 * 126}`);
        }

        response
            .addHeader('Server', 'Appcondae')
            .addHeader('X-Content-Type-Options', 'nosniff')
            .addHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
            .addHeader('Access-Control-Allow-Headers', 'Origin, Cookie, Set-Cookie, X-Requested-With, Content-Type, Access-Control-Allow-Origin, Access-Control-Request-Headers, Accept, X-Appconda-Project, X-Appconda-Key, X-Appconda-Locale, X-Appconda-Mode, X-Appconda-JWT, X-Appconda-Response-Format, X-Appconda-Timeout, X-SDK-Version, X-SDK-Name, X-SDK-Language, X-SDK-Platform, X-SDK-GraphQL, X-Appconda-ID, X-Appconda-Timestamp, Content-Range, Range, Cache-Control, Expires, Pragma, X-Forwarded-For, X-Forwarded-User-Agent')
            .addHeader('Access-Control-Expose-Headers', 'X-Appconda-Session, X-Fallback-Cookies')
            .addHeader('Access-Control-Allow-Origin', refDomain)
            .addHeader('Access-Control-Allow-Credentials', 'true');

        const originValidator = new Origin([...project.getAttribute('platforms', []), ...console.getAttribute('platforms', [])]);

        if (
            !originValidator.isValid(origin)
            && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.getMethod())
            && route.getLabel('origin', false) !== '*'
            && !request.getHeader('x-appconda-key', '')
        ) {
            throw new AppcondaException(AppcondaException.GENERAL_UNKNOWN_ORIGIN, originValidator.getDescription());
        }
    });


App.options()
    .inject('appconda')
    .inject('expressRequest')
    .inject('request')
    .inject('response')
    .inject('dbForConsole')
    .inject('getProjectDB')
    .inject('queueForEvents')
    .inject('queueForUsage')
    .inject('geodb')
    .action(async (
        appconda: App,
        expressRequest: any,
        request: Request,
        response: Response,
        dbForConsole: Database,
        getProjectDB: (project: Document) => Database,
        queueForEvents: Event,
        queueForUsage: Usage,
        geodb: any
    ) => {
        const host = request.getHostname() ?? '';
        const mainDomain = process.env._APP_DOMAIN || '';

        if (host !== mainDomain) {
            if (await router(appconda, dbForConsole, getProjectDB, expressRequest, request, response, queueForEvents, queueForUsage, geodb)) {
                return;
            }
        }

        const origin = request.getOrigin();

        response
            .addHeader('Server', 'Appconda')
            .addHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
            .addHeader('Access-Control-Allow-Headers', 'Origin, Cookie, Set-Cookie, X-Requested-With, Content-Type, Access-Control-Allow-Origin, Access-Control-Request-Headers, Accept, X-Appconda-Project, X-Appconda-Key, X-Appconda-Locale, X-Appconda-Mode, X-Appconda-JWT, X-Appconda-Response-Format, X-Appconda-Timeout, X-SDK-Version, X-SDK-Name, X-SDK-Language, X-SDK-Platform, X-SDK-GraphQL, X-Appconda-ID, X-Appconda-Timestamp, Content-Range, Range, Cache-Control, Expires, Pragma, X-Appconda-Session, X-Fallback-Cookies, X-Forwarded-For, X-Forwarded-User-Agent')
            .addHeader('Access-Control-Expose-Headers', 'X-Appconda-Session, X-Fallback-Cookies')
            .addHeader('Access-Control-Allow-Origin', origin)
            .addHeader('Access-Control-Allow-Credentials', 'true')
            .noContent();
    });

App.error()
    .inject('error')
    .inject('appconda')
    .inject('request')
    .inject('response')
    .inject('project')
    .inject('logger')
    .inject('log')
    .inject('queueForUsage')
    .action(async (
        error: AppcondaException,
        appconda: App,
        request: Request,
        response: Response,
        project: Document,
        logger: Logger | null,
        log: Log,
        queueForUsage: Usage
    ) => {
        const version = process.env._APP_VERSION || 'UNKNOWN';
        const route = appconda.getRoute();
        const className = error.constructor.name;
        let code = error instanceof AppcondaException ? error.getCode() : 500;
        let message = error.message;
        const file = error.stack?.split('\n')[1]?.trim() || '';
        const line = error.stack?.split('\n')[2]?.trim() || '';
        const trace = error.stack?.split('\n').slice(1).join('\n') || '';

        if (process.env.NODE_ENV === 'development') {
            Console.error(`[Error] Timestamp: ${new Date().toISOString()}`);
            if (route) {
                Console.error(`[Error] Method: ${route.getMethod()}`);
                Console.error(`[Error] URL: ${route.getPath()}`);
            }
            Console.error(`[Error] Type: ${className}`);
            Console.error(`[Error] Message: ${message}`);
            Console.error(`[Error] File: ${file}`);
            Console.error(`[Error] Line: ${line}`);
        }

        switch (className) {
            case 'UtopiaException':
                error = new AppcondaException(AppcondaException.GENERAL_UNKNOWN, message, code, error);
                if (code === 400) error.setType(AppcondaException.GENERAL_ARGUMENT_INVALID);
                if (code === 404) error.setType(AppcondaException.GENERAL_ROUTE_NOT_FOUND);
                break;
            case 'ConflictException':
                error = new AppcondaException(AppcondaException.DOCUMENT_UPDATE_CONFLICT, 'undefined', undefined, error);
                break;
            case 'TimeoutException':
                error = new AppcondaException(AppcondaException.DATABASE_TIMEOUT, 'undefined', undefined, error);
                break;
            case 'QueryException':
                error = new AppcondaException(AppcondaException.GENERAL_QUERY_INVALID, message, undefined, error);
                break;
            case 'StructureException':
                error = new AppcondaException(AppcondaException.DOCUMENT_INVALID_STRUCTURE, message, undefined, error);
                break;
            case 'DuplicateException':
                error = new AppcondaException(AppcondaException.DOCUMENT_ALREADY_EXISTS, 'undefined', undefined, error);
                break;
            case 'RestrictedException':
                error = new AppcondaException(AppcondaException.DOCUMENT_DELETE_RESTRICTED, 'undefined', undefined, error);
                break;
            case 'AuthorizationException':
                error = new AppcondaException(AppcondaException.USER_UNAUTHORIZED, 'undefined', undefined, error);
                break;
            case 'RelationshipException':
                error = new AppcondaException(AppcondaException.RELATIONSHIP_VALUE_INVALID, message, undefined, error);
                break;
        }

        //@ts-ignore
        code = error.getCode?.() || code;
        //@ts-ignore
        message = error.getMessage?.() || message;

        const publish = error instanceof AppcondaException ? error.isPublishable() : code === 0 || code >= 500;

        if (publish && project.getId() !== 'console') {
            if (!Auth.isPrivilegedUser(Authorization.getRoles())) {
                const fileSize = request.getFiles('file')?.size || 0;
                queueForUsage
                    .addMetric('network.requests', 1)
                    .addMetric('network.inbound', request.getSize() + fileSize)
                    .addMetric('network.outbound', response.getSize());
            }

            queueForUsage
                .setProject(project)
                .trigger();
        }

        if (logger && publish) {
            try {
                const user = await appconda.getResource('user');
                if (user && !user.isEmpty()) {
                    //@ts-ignore
                    log.setUser({ id: user.getId() });
                }
            } catch {
                // All good, user is optional information for logger
            }

            try {
                const dsn = new DSN(project.getAttribute('database', 'console'));
                log.addTag('database', dsn.getHost());
            } catch {
                const dsn = new DSN(`mysql://${project.getAttribute('database', 'console')}`);
                log.addTag('database', dsn.getHost());
            }

            log.setNamespace('http');
            log.setServer(process.env.HOSTNAME || 'unknown');
            log.setVersion(version);
            log.setType(Log.TYPE_ERROR);
            log.setMessage(message);
            log.addTag('method', route?.getMethod() || 'unknown');
            log.addTag('url', route?.getPath() || 'unknown');
            //@ts-ignore
            log.addTag('verboseType', className);
            //@ts-ignore
            log.addTag('code', code);
            log.addTag('projectId', project.getId());
            log.addTag('hostname', request.getHostname());
            log.addTag('locale', request.getParam('locale', request.getHeader('x-appconda-locale', '')));

            log.addExtra('file', file);
            log.addExtra('line', line);
            log.addExtra('trace', trace);
            log.addExtra('roles', Authorization.getRoles());

            const action = `${route?.getLabel('sdk.namespace', 'UNKNOWN_NAMESPACE')}.${route?.getLabel('sdk.method', 'UNKNOWN_METHOD')}`;
            log.setAction(action);

            const isProduction = process.env.NODE_ENV === 'production';
            log.setEnvironment(isProduction ? Log.ENVIRONMENT_PRODUCTION : Log.ENVIRONMENT_STAGING);

            const responseCode = await logger.addLog(log);
            Console.info(`Log pushed with status code: ${responseCode}`);
        }

        if (!(error instanceof AppcondaException)) {
            error = new AppcondaException(AppcondaException.GENERAL_UNKNOWN, message, code, error);
        }

        switch (code) {
            case 400:
            case 401:
            case 402:
            case 403:
            case 404:
            case 408:
            case 409:
            case 412:
            case 416:
            case 429:
            case 451:
            case 501:
            case 503:
                break;
            default:
                code = 500;
                message = 'Server Error';
        }

        const output = process.env._APP_ENV === 'development' ? {
            message,
            code,
            file,
            line,
            trace,
            version: process.env.APP_VERSION_STABLE,
            type: error.getType(),
        } : {
            message,
            code,
            version: process.env.APP_VERSION_STABLE,
            type: error.getType(),
        };

        response
            .addHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
            .addHeader('Expires', '0')
            .addHeader('Pragma', 'no-cache')
            .setStatusCode(code);

        const template = route?.getLabel('error', null);

        if (template) {
            const layout = new View(template);
            layout
                .setParam('title', `${project.getAttribute('name')} - Error`)
                .setParam('development', process.env.NODE_ENV === 'development')
                .setParam('projectName', project.getAttribute('name'))
                .setParam('projectURL', project.getAttribute('url'))
                .setParam('message', output.message)
                .setParam('type', output.type)
                .setParam('code', output.code)
                .setParam('trace', output.trace);

            response.html(layout.render());
        }

        response.dynamic(
            new Document(output),
            process.env.NODE_ENV === 'development' ? Response.MODEL_ERROR_DEV : Response.MODEL_ERROR
        );
    });


App.get('/robots.txt')
    .desc('Robots.txt File')
    .label('scope', 'public')
    .label('docs', false)
    .inject('appconda')
    .inject('expressRequest')
    .inject('request')
    .inject('response')
    .inject('dbForConsole')
    .inject('getProjectDB')
    .inject('queueForEvents')
    .inject('queueForUsage')
    .inject('geodb')
    .action(async (
        appconda: App,
        expressRequest: any,
        request: Request,
        response: Response,
        dbForConsole: Database,
        getProjectDB: (project: Document) => Database,
        queueForEvents: Event,
        queueForUsage: Usage,
        geodb: any
    ) => {
        const host = request.getHostname() ?? '';
        const mainDomain = process.env._APP_DOMAIN ?? '';

        if (host === mainDomain) {
            const template = new View(__dirname + '/../views/general/robots.phtml');
            response.text(template.render(false));
        } else {
            await router(appconda, dbForConsole, getProjectDB, expressRequest, request, response, queueForEvents, queueForUsage, geodb);
        }
    });

App.get('/humans.txt')
    .desc('Humans.txt File')
    .label('scope', 'public')
    .label('docs', false)
    .inject('appconda')
    .inject('expressRequest')
    .inject('request')
    .inject('response')
    .inject('dbForConsole')
    .inject('getProjectDB')
    .inject('queueForEvents')
    .inject('queueForUsage')
    .inject('geodb')
    .action(async (
        appconda: App,
        expressRequest: any,
        request: Request,
        response: Response,
        dbForConsole: Database,
        getProjectDB: (project: Document) => Database,
        queueForEvents: Event,
        queueForUsage: Usage,
        geodb: any
    ) => {
        const host = request.getHostname() ?? '';
        const mainDomain = process.env._APP_DOMAIN ?? '';

        if (host === mainDomain) {
            const template = new View(__dirname + '/../views/general/humans.phtml');
            response.text(template.render(false));
        } else {
            await router(appconda, dbForConsole, getProjectDB, expressRequest, request, response, queueForEvents, queueForUsage, geodb);
        }
    });

App.get('/.well-known/acme-challenge/*')
    .desc('SSL Verification')
    .label('scope', 'public')
    .label('docs', false)
    .inject('request')
    .inject('response')
    .action(async (request: Request, response: Response) => {
        const uriChunks = request.getURI().split('/');
        const token = uriChunks[uriChunks.length - 1];

        const validator = new Text(100, 1,
            [
                ...Text.NUMBERS,
                ...Text.ALPHABET_LOWER,
                ...Text.ALPHABET_UPPER,
                '-',
                '_'
            ]
        );

        if (!validator.isValid(token) || uriChunks.length !== 4) {
            throw new AppcondaException(AppcondaException.GENERAL_ARGUMENT_INVALID, 'Invalid challenge token.');
        }

        // Helper functions
        async function realpath(p: string): Promise<string> {
            return fs.realpath(p);
        }

        async function fileExists(p: string): Promise<boolean> {
            try {
                await fs.access(p);
                return true;
            } catch {
                return false;
            }
        }

        async function fileGetContents(p: string): Promise<string> {
            return fs.readFile(p, 'utf8');
        }

        const base = await realpath(APP_STORAGE_CERTIFICATES);
        const absolute = await realpath(`${base}/.well-known/acme-challenge/${token}`);


        if (!base) {
            throw new AppcondaException(AppcondaException.GENERAL_SERVER_ERROR, 'Storage error');
        }

        if (!absolute) {
            throw new AppcondaException(AppcondaException.GENERAL_ROUTE_NOT_FOUND, 'Unknown path');
        }

        if (!absolute.startsWith(base)) {
            throw new AppcondaException(AppcondaException.GENERAL_UNAUTHORIZED_SCOPE, 'Invalid path');
        }

        if (!fileExists(absolute)) {
            throw new AppcondaException(AppcondaException.GENERAL_ROUTE_NOT_FOUND, 'Unknown path');
        }

        const content = await fileGetContents(absolute);

        if (!content) {
            throw new AppcondaException(AppcondaException.GENERAL_SERVER_ERROR, 'Failed to get contents');
        }

        response.text(content);
    });

const services = Config.getParam('services', []);

for (const service of Object.keys(services)) {
    const controller = services[service].controller;
    const controllerPath =path.resolve(__dirname + '/' + controller);
    console.log('-------===================-------');
    console.log(controllerPath);
    try {
       const a =  require(controllerPath);
       console.log(a);
    } catch (error) {
         console.error(error);
    }
}




import './shared/api';
import './shared/api/auth';




App.wildcard()
    .groups(['api'])
    .label('scope', 'global')
    .action(async () => {
        throw new AppcondaException(AppcondaException.GENERAL_ROUTE_NOT_FOUND, '');
    });

