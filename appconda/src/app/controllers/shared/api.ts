import { Authorization, Document, Role, WhiteList } from "../../../Tuval/Core";
import { AppcondaException } from "../../../Appconda/Extend/Exception";
import { Auth, TOTP } from "../../../Tuval/Auth";
import { Request } from "../../../Appconda/Tuval/Request";
import moment from "moment";
import { TimeLimit } from "../../../Tuval/Abuse/Adapters/Database/TimeLimit";
import { Abuse } from "../../../Tuval/Abuse";
import { Response } from "../../../Appconda/Tuval/Response";
import { Event } from "../../../Appconda/Event/Event";
import { Messaging } from "../../../Appconda/Event/Messaging";
import { Audit } from "../../../Appconda/Event/Audit";
import { Delete } from "../../../Appconda/Event/Delete";
import { Build } from "../../../Appconda/Event/Build";
import { Usage } from "../../../Appconda/Event/Usage";
import { Database as EventDatabase } from "../../../Appconda/Event/Database";
import { Database } from "../../../Tuval/Database";
import { DateTime } from 'luxon';

import { createHash } from 'crypto';
import { Filesystem } from "../../../Tuval/Cache/Adapters/Filesystem";
import { Cache } from "../../../Tuval/Cache";
import { Func } from "../../../Appconda/Event/Func";
import { App } from "../../../Tuval/Http";
import { Config } from "../../../Tuval/Config";

function md5(data: string): string {
    return createHash('md5').update(data).digest('hex');
}

// Function to parse labels
const parseLabel = (label: string, responsePayload: any, requestParams: any, user: Document): string => {
    const matches = label.match(/{(.*?)}/g) || [];
    matches.forEach((find) => {
        const match = find.slice(1, -1);
        const parts = match.split('.');

        if (parts.length !== 2) {
            throw new AppcondaException(AppcondaException.GENERAL_SERVER_ERROR, `The server encountered an error while parsing the label: ${label}. Please create an issue on GitHub to allow us to investigate further https://github.com/appconda/appconda/issues/new/choose`);
        }

        const [namespace, replace] = parts;
        const params = namespace === 'user' ? user : namespace === 'request' ? requestParams : responsePayload;

        if (params[replace] !== undefined) {
            label = label.replace(find, params[replace]);
        }
    });
    return label;
};

// Database listener function
const databaseListener = (event: string, document: Document, project: Document, queueForUsage: any, dbForProject: any) => {
    let value = 1;
    if (event === 'delete') {
        value = -1;
    }

    switch (true) {
        case document.getCollection() === 'teams':
            queueForUsage.addMetric('METRIC_TEAMS', value);
            break;
        case document.getCollection() === 'users':
            queueForUsage.addMetric('METRIC_USERS', value);
            if (event === 'delete') {
                queueForUsage.addReduce(document);
            }
            break;
        case document.getCollection() === 'sessions':
            queueForUsage.addMetric('METRIC_SESSIONS', value);
            break;
        case document.getCollection() === 'databases':
            queueForUsage.addMetric('METRIC_DATABASES', value);
            if (event === 'delete') {
                queueForUsage.addReduce(document);
            }
            break;
        case document.getCollection().startsWith('database_') && !document.getCollection().includes('collection'):
            const databaseInternalId = document.getCollection().split('_')[1] || '0';
            queueForUsage.addMetric('METRIC_COLLECTIONS', value)
                .addMetric(`METRIC_DATABASE_ID_COLLECTIONS_${databaseInternalId}`, value);
            if (event === 'delete') {
                queueForUsage.addReduce(document);
            }
            break;
        case document.getCollection().startsWith('database_') && document.getCollection().includes('_collection_'):
            const [_, dbId, __, colId] = document.getCollection().split('_');
            queueForUsage.addMetric('METRIC_DOCUMENTS', value)
                .addMetric(`METRIC_DATABASE_ID_DOCUMENTS_${dbId}`, value)
                .addMetric(`METRIC_DATABASE_ID_COLLECTION_ID_DOCUMENTS_${dbId}_${colId}`, value);
            break;
        case document.getCollection() === 'buckets':
            queueForUsage.addMetric('METRIC_BUCKETS', value);
            if (event === 'delete') {
                queueForUsage.addReduce(document);
            }
            break;
        case document.getCollection().startsWith('bucket_'):
            const bucketInternalId = document.getCollection().split('_')[1];
            queueForUsage.addMetric('METRIC_FILES', value)
                .addMetric('METRIC_FILES_STORAGE', document.getAttribute('sizeOriginal') * value)
                .addMetric(`METRIC_BUCKET_ID_FILES_${bucketInternalId}`, value)
                .addMetric(`METRIC_BUCKET_ID_FILES_STORAGE_${bucketInternalId}`, document.getAttribute('sizeOriginal') * value);
            break;
        case document.getCollection() === 'functions':
            queueForUsage.addMetric('METRIC_FUNCTIONS', value);
            if (event === 'delete') {
                queueForUsage.addReduce(document);
            }
            break;
        case document.getCollection() === 'deployments':
            queueForUsage.addMetric('METRIC_DEPLOYMENTS', value)
                .addMetric('METRIC_DEPLOYMENTS_STORAGE', document.getAttribute('size') * value)
                .addMetric(`METRIC_FUNCTION_ID_DEPLOYMENTS_${document.getAttribute('resourceType')}_${document.getAttribute('resourceInternalId')}`, value)
                .addMetric(`METRIC_FUNCTION_ID_DEPLOYMENTS_STORAGE_${document.getAttribute('resourceType')}_${document.getAttribute('resourceInternalId')}`, document.getAttribute('size') * value);
            break;
        default:
            break;
    }
};


App.init()
    .groups(['api'])
    .inject('appconda')
    .inject('request')
    .inject('dbForConsole')
    .inject('project')
    .inject('user')
    .inject('session')
    .inject('servers')
    .inject('mode')
    .action(async (appconda: App, request: Request, dbForConsole: any, project: Document, user: Document, session: Document | null, servers: any[], mode: string) => {
        const route = appconda.getRoute();

        if (project.isEmpty()) {
            throw new AppcondaException(AppcondaException.PROJECT_NOT_FOUND);
        }

        /**
         * ACL Check
         */
        let role = user.isEmpty() ? Role.guests().toString() : Role.users().toString();

        // Add user roles
        const memberships = user.find('teamId', project.getAttribute('teamId'), 'memberships');

        if (memberships) {
            for (const memberRole of memberships.getAttribute('roles', [])) {
                switch (memberRole) {
                    case 'owner':
                        role = Auth.USER_ROLE_OWNER;
                        break;
                    case 'admin':
                        role = Auth.USER_ROLE_ADMIN;
                        break;
                    case 'developer':
                        role = Auth.USER_ROLE_DEVELOPER;
                        break;
                }
            }
        }

        const roles = Config.getParam('roles', []);
        const scope = route.getLabel('scope', 'none'); // Allowed scope for chosen route
        const scopes = roles[role]['scopes']; // Allowed scopes for user role

        const authKey = request.getHeader('x-appconda-key', '');

        if (authKey) { // API Key authentication
            // Do not allow API key and session to be set at the same time
            if (!user.isEmpty()) {
                throw new AppcondaException(AppcondaException.USER_API_KEY_AND_SESSION_SET);
            }

            // Check if given key match project API keys
            const key = project.find('secret', authKey, 'keys');
            if (key) {
                user = new Document({
                    '$id': '',
                    'status': true,
                    'email': `app.${project.getId()}@service.${request.getHostname()}`,
                    'password': '',
                    'name': project.getAttribute('name', 'Untitled'),
                });

                role = Auth.USER_ROLE_APPS;
                scopes.push(...key.getAttribute('scopes', []));

                const expire = key.getAttribute('expire');
                if (expire && moment(expire).isBefore(moment(DateTime.now()))) {
                    throw new AppcondaException(AppcondaException.PROJECT_KEY_EXPIRED);
                }

                Authorization.setRole(Auth.USER_ROLE_APPS);
                Authorization.setDefaultStatus(false);  // Cancel security segmentation for API keys.

                const accessedAt = key.getAttribute('accessedAt', '');
                if (moment(DateTime.now()).subtract(process.env.APP_KEY_ACCCESS, 'seconds').toISOString() > accessedAt) {
                    key.setAttribute('accessedAt', moment(DateTime.now()).toISOString());
                    await dbForConsole.updateDocument('keys', key.getId(), key);
                    await dbForConsole.purgeCachedDocument('projects', project.getId());
                }

                const sdkValidator = new WhiteList(servers, true);
                const sdk = request.getHeader('x-sdk-name', 'UNKNOWN');
                if (sdkValidator.isValid(sdk)) {
                    const sdks = key.getAttribute('sdks', []);
                    if (!sdks.includes(sdk)) {
                        sdks.push(sdk);
                        key.setAttribute('sdks', sdks);

                        /** Update access time as well */
                        key.setAttribute('accessedAt', moment(DateTime.now()).toISOString());
                        await dbForConsole.updateDocument('keys', key.getId(), key);
                        await dbForConsole.purgeCachedDocument('projects', project.getId());
                    }
                }
            }
        }

        Authorization.setRole(role);

        for (const authRole of Auth.getRoles(user)) {
            Authorization.setRole(authRole);
        }

        const service = route.getLabel('sdk.namespace', '');
        if (service) {
            if (
                project.getAttribute('services', {})[service] === false
                && !(Auth.isPrivilegedUser(Authorization.getRoles()) || Auth.isAppUser(Authorization.getRoles()))
            ) {
                throw new AppcondaException(AppcondaException.GENERAL_SERVICE_DISABLED);
            }
        }
        if (!scopes.includes(scope)) {
            if (project.isEmpty()) { // Check if permission is denied because project is missing
                throw new AppcondaException(AppcondaException.PROJECT_NOT_FOUND);
            }

            throw new AppcondaException(AppcondaException.GENERAL_UNAUTHORIZED_SCOPE, `${user.getAttribute('email', 'User')} (role: ${roles[role]['label'].toLowerCase()}) missing scope (${scope})`);
        }

        if (user.getAttribute('status') === false) { // Account is blocked
            throw new AppcondaException(AppcondaException.USER_BLOCKED);
        }

        if (user.getAttribute('reset')) {
            throw new AppcondaException(AppcondaException.USER_PASSWORD_RESET_REQUIRED);
        }

        const mfaEnabled = user.getAttribute('mfa', false);
        const hasVerifiedEmail = user.getAttribute('emailVerification', false);
        const hasVerifiedPhone = user.getAttribute('phoneVerification', false);
        const hasVerifiedAuthenticator = TOTP.getAuthenticatorFromUser(user)?.getAttribute('verified') ?? false;
        const hasMoreFactors = hasVerifiedEmail || hasVerifiedPhone || hasVerifiedAuthenticator;
        const minimumFactors = (mfaEnabled && hasMoreFactors) ? 2 : 1;

        if (!route.getGroups().includes('mfa')) {
            if (session && session.getAttribute('factors', []).length < minimumFactors) {
                throw new AppcondaException(AppcondaException.USER_MORE_FACTORS_REQUIRED);
            }
        }
    });


App.init()
    .groups(['api'])
    .inject('appconda')
    .inject('request')
    .inject('response')
    .inject('project')
    .inject('user')
    .inject('queueForEvents')
    .inject('queueForMessaging')
    .inject('queueForAudits')
    .inject('queueForDeletes')
    .inject('queueForDatabase')
    .inject('queueForBuilds')
    .inject('queueForUsage')
    .inject('dbForProject')
    .inject('mode')
    .action(async (appconda: App, request: Request, response: Response, project: Document, user: Document, queueForEvents: Event,
        queueForMessaging: Messaging, queueForAudits: Audit, queueForDeletes: Delete,
        queueForDatabase: EventDatabase, queueForBuilds: Build, queueForUsage: Usage, dbForProject: Database,
        mode: string) => {
        const route = appconda.getRoute();

        if (
            project.getAttribute('apis', {})['rest'] === false
            && !(Auth.isPrivilegedUser(Authorization.getRoles()) || Auth.isAppUser(Authorization.getRoles()))
        ) {
            throw new AppcondaException(AppcondaException.GENERAL_API_DISABLED);
        }

        /*
        * Abuse Check
        */
        const abuseKeyLabel = route.getLabel('abuse-key', 'url:{url},ip:{ip}');
        const timeLimitArray = [];

        const abuseKeys = Array.isArray(abuseKeyLabel) ? abuseKeyLabel : [abuseKeyLabel];

        for (const abuseKey of abuseKeys) {
            const start = request.getContentRangeStart();
            const end = request.getContentRangeEnd();
            const timeLimit = new TimeLimit(abuseKey, route.getLabel('abuse-limit', 0), route.getLabel('abuse-time', 3600), dbForProject);
            timeLimit
                .setParam('{projectId}', project.getId())
                .setParam('{userId}', user.getId())
                .setParam('{userAgent}', request.getUserAgent(''))
                .setParam('{ip}', request.getIP())
                .setParam('{url}', request.getHostname() + route.getPath())
                .setParam('{method}', request.getMethod())
                .setParam('{chunkId}', Math.floor(start / (end + 1 - start)).toString());
            timeLimitArray.push(timeLimit);
        }

        let closestLimit = null;

        const roles = Authorization.getRoles();
        const isPrivilegedUser = Auth.isPrivilegedUser(roles);
        const isAppUser = Auth.isAppUser(roles);

        for (const timeLimit of timeLimitArray) {
            for (const [key, value] of Object.entries(request.getParams())) {
                if (value) {
                    timeLimit.setParam(`{param-${key}}`, Array.isArray(value) ? JSON.stringify(value) : value);
                }
            }

            const abuse = new Abuse(timeLimit);
            const remaining = await timeLimit.remaining();
            const limit = timeLimit.limit();
            const time = new Date(timeLimit.time()).getTime() + route.getLabel('abuse-time', 3600) * 1000;

            if (limit && (remaining < closestLimit || closestLimit === null)) {
                closestLimit = remaining;
                response
                    .addHeader('X-RateLimit-Limit', limit.toString())
                    .addHeader('X-RateLimit-Remaining', remaining.toString())
                    .addHeader('X-RateLimit-Reset', time.toString());
            }

            const enabled = process.env._APP_OPTIONS_ABUSE !== 'disabled';

            if (
                enabled
                && !isAppUser
                && !isPrivilegedUser
                && abuse.check()
            ) {
                throw new AppcondaException(AppcondaException.GENERAL_RATE_LIMIT_EXCEEDED);
            }
        }

        /*
        * Background Jobs
        */
        queueForEvents
            .setEvent(route.getLabel('event', ''))
            .setProject(project)
            .setUser(user);

        queueForAudits
            .setMode(mode)
            .setUserAgent(request.getUserAgent(''))
            .setIP(request.getIP())
            .setEvent(route.getLabel('audits.event', ''))
            .setProject(project)
            .setUser(user);

        queueForDeletes.setProject(project);
        queueForDatabase.setProject(project);
        queueForBuilds.setProject(project);
        queueForMessaging.setProject(project);

        dbForProject
            .on(Database.EVENT_DOCUMENT_CREATE, 'calculate-usage', (event, document) => databaseListener(event, document, project, queueForUsage, dbForProject))
            .on(Database.EVENT_DOCUMENT_DELETE, 'calculate-usage', (event, document) => databaseListener(event, document, project, queueForUsage, dbForProject));

        const useCache = route.getLabel('cache', false);
        if (useCache) {
            const key = md5(request.getURI() + '*' + Object.values(request.getParams()).join('*') + '*' + process.env.APP_CACHE_BUSTER);
            const cacheLog = await Authorization.skip(async () => await dbForProject.getDocument('cache', key));
            const cache = new Cache(
                new Filesystem(process.env.APP_STORAGE_CACHE + '/app-' + project.getId())
            );
            const timestamp = 60 * 60 * 24 * 30;
            const data = await cache.load(key, timestamp);

            if (data && !cacheLog.isEmpty()) {
                let parts = cacheLog.getAttribute('resourceType').split('/');
                const type = parts[0] || null;

                if (type === 'bucket') {
                    const bucketId = parts[1] || null;
                    const bucket = await Authorization.skip(async () => await dbForProject.getDocument('buckets', bucketId));

                    const isAPIKey = Auth.isAppUser(Authorization.getRoles());
                    const isPrivilegedUser = Auth.isPrivilegedUser(Authorization.getRoles());

                    if (bucket.isEmpty() || (!bucket.getAttribute('enabled') && !isAPIKey && !isPrivilegedUser)) {
                        throw new AppcondaException(AppcondaException.STORAGE_BUCKET_NOT_FOUND);
                    }

                    const fileSecurity = bucket.getAttribute('fileSecurity', false);
                    const validator = new Authorization(Database.PERMISSION_READ);
                    const valid = validator.isValid(bucket.getRead());

                    if (!fileSecurity && !valid) {
                        throw new AppcondaException(AppcondaException.USER_UNAUTHORIZED);
                    }

                    parts = cacheLog.getAttribute('resource').split('/');
                    const fileId = parts[1] || null;

                    const file = fileSecurity && !valid
                        ? await dbForProject.getDocument('bucket_' + bucket.getInternalId(), fileId)
                        : await Authorization.skip(async () => await dbForProject.getDocument('bucket_' + bucket.getInternalId(), fileId));

                    if (file.isEmpty()) {
                        throw new AppcondaException(AppcondaException.STORAGE_FILE_NOT_FOUND);
                    }
                }

                response
                    .addHeader('Expires', new Date(Date.now() + timestamp * 1000).toUTCString())
                    .addHeader('X-Appconda-Cache', 'hit')
                    .setContentType(cacheLog.getAttribute('mimeType'))
                    .send(data);
            } else {
                response
                    .addHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
                    .addHeader('Pragma', 'no-cache')
                    .addHeader('Expires', '0')
                    .addHeader('X-Appconda-Cache', 'miss');
            }
        }
    });


App.init()
    .groups(['session'])
    .inject('user')
    .inject('request')
    .action( async (user: Document, request: Request) => {
        if (request.getURI().includes('oauth2')) {
            return;
        }

        if (!user.isEmpty()) {
            throw new AppcondaException(AppcondaException.USER_SESSION_ALREADY_EXISTS);
        }
    });

/**
* Kullanıcı oturumunu sınırla
*
* Proje için belirlenen oturum sınırını aşarsa, eski oturumları sil
*/

App.shutdown()
    .groups(['session'])
    .inject('appconda')
    .inject('request')
    .inject('response')
    .inject('project')
    .inject('dbForProject')
    .action(async (appconda: App, request: Request, response: Response, project: Document, dbForProject: Database) => {
        const sessionLimit = project.getAttribute('auths', {})['maxSessions'] || process.env.APP_LIMIT_USER_SESSIONS_DEFAULT;
        const session = response.getPayload();
        const userId = session['userId'] || '';
        if (!userId) {
            return;
        }

        const user = await dbForProject.getDocument('users', userId);
        if (user.isEmpty()) {
            return;
        }

        const sessions = user.getAttribute('sessions', []);
        const count = sessions.length;
        if (count <= sessionLimit) {
            return;
        }

        for (let i = 0; i < (count - sessionLimit); i++) {
            const session = sessions.shift();
            await dbForProject.deleteDocument('sessions', session.getId());
        }

        await dbForProject.purgeCachedDocument('users', userId);
    });


App.shutdown()
    .groups(['api'])
    .inject('appconda')
    .inject('request')
    .inject('response')
    .inject('project')
    .inject('user')
    .inject('queueForEvents')
    .inject('queueForAudits')
    .inject('queueForUsage')
    .inject('queueForDeletes')
    .inject('queueForDatabase')
    .inject('queueForBuilds')
    .inject('queueForMessaging')
    .inject('dbForProject')
    .inject('queueForFunctions')
    .inject('mode')
    .inject('dbForConsole')
    .action(async (appconda: App, request: Request, response: Response, project: Document, user: Document, queueForEvents: Event, queueForAudits: Audit,
        queueForUsage: Usage, queueForDeletes: Delete, queueForDatabase: EventDatabase,
        queueForBuilds: Build, queueForMessaging: Messaging, dbForProject: Database, queueForFunctions: Func, mode: string, dbForConsole: Database) => {
        const responsePayload = response.getPayload();

        if (queueForEvents.getEvent()) {
            if (!queueForEvents.getPayload()) {
                queueForEvents.setPayload(responsePayload);
            }

            if (!queueForEvents.isPaused()) {
                queueForFunctions.from(queueForEvents).trigger();
            }

            queueForEvents
                .setClass(Event.WEBHOOK_CLASS_NAME)
                .setQueue(Event.WEBHOOK_QUEUE_NAME)
                .trigger();

            if (project.getId() !== 'console') {
                const allEvents = Event.generateEvents(queueForEvents.getEvent(), queueForEvents.getParams());
                const payload = new Document(queueForEvents.getPayload());

                const db = queueForEvents.getContext('database');
                const collection = queueForEvents.getContext('collection');
                const bucket = queueForEvents.getContext('bucket');
                /* 
                            const target = Realtime.fromPayload(
                                allEvents[0],
                                payload,
                                project,
                                db,
                                collection,
                                bucket
                            ); */

                // Sonra
                /* Realtime.send(
                    target['projectId'] ?? project.getId(),
                    queueForEvents.getRealtimePayload(),
                    allEvents,
                    target['channels'],
                    target['roles'],
                    {
                        permissionsChanged: target['permissionsChanged'],
                        userId: queueForEvents.getParam('userId')
                    }
                ); */
            }
        }

        const route = appconda.getRoute();
        const requestParams = route.getParamsValues();

        const pattern = route.getLabel('audits.resource', null);
        if (pattern) {
            const resource = parseLabel(pattern, responsePayload, requestParams, user);
            if (resource && resource !== pattern) {
                queueForAudits.setResource(resource);
            }
        }

        if (!user.isEmpty()) {
            queueForAudits.setUser(user);
        }

        if (queueForAudits.getResource() && queueForAudits.getUser().getId()) {
            const pattern = route.getLabel('audits.payload', true);
            if (pattern) {
                queueForAudits.setPayload(responsePayload);
            }

            for (const [key, value] of Object.entries(queueForEvents.getParams())) {
                queueForAudits.setParam(key, value);
            }
            queueForAudits.trigger();
        }

        if (queueForDeletes.getType()) {
            queueForDeletes.trigger();
        }

        if (queueForDatabase.getType()) {
            queueForDatabase.trigger();
        }

        if (queueForBuilds.getType()) {
            queueForBuilds.trigger();
        }

        if (queueForMessaging.getType()) {
            queueForMessaging.trigger();
        }

        const useCache = route.getLabel('cache', false);
        if (useCache) {
            let resource = null;
            let resourceType = null;
            const data = response.getPayload();
            if (data['payload']) {
                let pattern = route.getLabel('cache.resource', null);
                if (pattern) {
                    resource = parseLabel(pattern, responsePayload, requestParams, user);
                }

                pattern = route.getLabel('cache.resourceType', null);
                if (pattern) {
                    resourceType = parseLabel(pattern, responsePayload, requestParams, user);
                }

                const key = md5(request.getURI() + '*' + Object.values(request.getParams()).join('*') + '*' + process.env.APP_CACHE_BUSTER);
                const signature = md5(data['payload']);
                const cacheLog = await Authorization.skip(() => dbForProject.getDocument('cache', key));
                const accessedAt = cacheLog.getAttribute('accessedAt', '');
                const now = DateTime.now().toISO();

                if (cacheLog.isEmpty()) {
                    await Authorization.skip(() => dbForProject.createDocument('cache', new Document({
                        '$id': key,
                        'resource': resource,
                        'resourceType': resourceType,
                        'mimeType': response.getContentType(),
                        'accessedAt': now,
                        'signature': signature,
                    })));
                } else if (DateTime.now().minus({ seconds: process.env.APP_CACHE_UPDATE as any }).toISO() > accessedAt) {
                    cacheLog.setAttribute('accessedAt', now);
                    await Authorization.skip(() => dbForProject.updateDocument('cache', cacheLog.getId(), cacheLog));
                }

                if (signature !== cacheLog.getAttribute('signature')) {
                    const cache = new Cache(
                        new Filesystem(process.env.APP_STORAGE_CACHE + '/app-' + project.getId())
                    );
                    cache.save(key, data['payload']);
                }
            }
        }

        if (project.getId() !== 'console') {
            if (!Auth.isPrivilegedUser(Authorization.getRoles())) {
                let fileSize = 0;
                const file = request.getFiles('file');
                if (file) {
                    fileSize = Array.isArray(file['size']) && file['size'][0] ? file['size'][0] : file['size'];
                }

                queueForUsage
                    .addMetric('network.requests', 1)
                    .addMetric('network.inbound', request.getSize() + fileSize)
                    .addMetric('network.outbound', response.getSize());
            }

            queueForUsage
                .setProject(project)
                .trigger();
        }

        if (!user.isEmpty()) {
            const accessedAt = user.getAttribute('accessedAt', '');
            if (DateTime.fromISO(DateTime.now().toISO()).minus({ seconds: process.env.APP_USER_ACCCESS as any}).toISO() > accessedAt) {
                user.setAttribute('accessedAt', DateTime.now().toISO());

                if (process.env.APP_MODE_ADMIN !== mode) {
                    await dbForProject.updateDocument('users', user.getId(), user);
                } else {
                    await dbForConsole.updateDocument('users', user.getId(), user);
                }
            }
        }
    });

    App.init()
    .groups(['usage'])
    .action( async () => {
        if (process.env._APP_USAGE_STATS !== 'enabled') {
            throw new AppcondaException(AppcondaException.GENERAL_USAGE_DISABLED);
        }
    });