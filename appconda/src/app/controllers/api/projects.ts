import {
    ArrayList, Boolean as BooleanValidator, Document, Hostname, ID, Integer,
    Multiple, Permission, Range, Role, Text, URLValidator, WhiteList
} from "../../../Tuval/Core";
import { App } from "../../../Tuval/Http";
import { AppcondaException as Exception } from "../../../Appconda/Extend/Exception";
import { APP_AUTH_TYPE_ADMIN, APP_EMAIL_TEAM, APP_LIMIT_ARRAY_ELEMENT_SIZE, APP_LIMIT_ARRAY_PARAMS_SIZE, APP_LIMIT_COUNT, APP_LIMIT_USER_PASSWORD_HISTORY, APP_LIMIT_USER_SESSIONS_DEFAULT, APP_LIMIT_USER_SESSIONS_MAX, APP_LIMIT_USERS, APP_NAME, APP_VERSION_STABLE, DELETE_TYPE_DOCUMENT } from "../../init";
import { Response } from "../../../Appconda/Tuval/Response";
import { ProjectId } from "../../../Appconda/Database/Validators/ProjectId";
import { Database, Datetime, Duplicate, Query, QueryException, UID } from "../../../Tuval/Database";
import { Config } from "../../../Tuval/Config";
import { Connection, Group } from "../../../Tuval/Pools";
import { Hooks } from "../../../Appconda/Hooks/Hooks";
import { Auth } from "../../../Tuval/Auth";
import { DSN } from "../../../Tuval/DSN";
import { Cache } from "../../../Tuval/Cache";
import { Audit } from "../../../Tuval/Audit";
import { TimeLimit } from "../../../Tuval/Abuse/Adapters/Database/TimeLimit";
import { Projects } from "../../../Appconda/Database/Validators/Queries/Projects";
import { PublicDomain } from "../../../Tuval/Domains";
import { Event } from "../../../Appconda/Event/Validators/Event";
import { randomBytes, createCipheriv, createDecipheriv, CipherGCMTypes, createHash } from 'crypto';
import { Delete } from "../../../Appconda/Event/Delete";
import { Origin } from "../../../Appconda/Network/Validators/Origin";
import { Email } from "../../../Appconda/Network/Validators/Email";
import { Template } from "../../../Appconda/Template/Template";
import path from "path";
import { Mail } from "../../../Appconda/Event/Mail";
import { Locale } from "../../../Tuval/Locale";
App.init()
    .groups(['projects'])
    .inject('project')
    .action((project: Document) => {
        if (project.getId() !== 'console') {
            throw new Exception(Exception.GENERAL_ACCESS_FORBIDDEN);
        }
    });

App.post('/v1/projects')
    .desc('Create project')
    .groups(['api', 'projects'])
    .label('audits.event', 'projects.create')
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'create')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_PROJECT)
    .param('projectId', '', new ProjectId(), 'Unique Id. Choose a custom ID or generate a random ID with `ID.unique()`. Valid chars are a-z, and hyphen. Can\'t start with a special char. Max length is 36 chars.')
    .param('name', null, new Text(128), 'Project name. Max length: 128 chars.')
    .param('teamId', '', new UID(), 'Team unique ID.')
    .param('region', process.env._APP_REGION || 'default', new WhiteList(Object.keys(Config.getParam('regions')).filter(key => !Config.getParam('regions')[key].disabled)), 'Project Region.', true)
    .param('description', '', new Text(256), 'Project description. Max length: 256 chars.', true)
    .param('logo', '', new Text(1024), 'Project logo.', true)
    .param('url', '', new URLValidator(), 'Project URL.', true)
    .param('legalName', '', new Text(256), 'Project legal Name. Max length: 256 chars.', true)
    .param('legalCountry', '', new Text(256), 'Project legal Country. Max length: 256 chars.', true)
    .param('legalState', '', new Text(256), 'Project legal State. Max length: 256 chars.', true)
    .param('legalCity', '', new Text(256), 'Project legal City. Max length: 256 chars.', true)
    .param('legalAddress', '', new Text(256), 'Project legal Address. Max length: 256 chars.', true)
    .param('legalTaxId', '', new Text(256), 'Project legal Tax ID. Max length: 256 chars.', true)
    .inject('request')
    .inject('response')
    .inject('dbForConsole')
    .inject('cache')
    .inject('pools')
    .inject('hooks')
    .action(async ({ projectId, name, teamId, region, description, logo, url, legalName, legalCountry, legalState, legalCity, legalAddress, legalTaxId, request, response, dbForConsole, cache, pools, hooks }: { projectId: string, name: string, teamId: string, region: string, description: string, logo: string, url: string, legalName: string, legalCountry: string, legalState: string, legalCity: string, legalAddress: string, legalTaxId: string, request: Request, response: Response, dbForConsole: Database, cache: Cache, pools: Group, hooks: Hooks }) => {

        const team = await dbForConsole.getDocument('teams', teamId);

        if (team.isEmpty()) {
            throw new Exception(Exception.TEAM_NOT_FOUND);
        }

        const allowList = process.env._APP_PROJECT_REGIONS ? process.env._APP_PROJECT_REGIONS.split(',').filter(Boolean) : [];

        if (allowList.length > 0 && !allowList.includes(region)) {
            throw new Exception(Exception.PROJECT_REGION_UNSUPPORTED, `Region "${region}" is not supported`);
        }

        const auth = Config.getParam('auth', []);
        const auths: Record<string, any> = {
            limit: 0,
            maxSessions: APP_LIMIT_USER_SESSIONS_DEFAULT,
            passwordHistory: 0,
            passwordDictionary: false,
            duration: Auth.TOKEN_EXPIRATION_LOGIN_LONG,
            personalDataCheck: false
        };
        for (const method of auth) {
            auths[method.key ?? ''] = true;
        }

        projectId = (projectId === 'unique()') ? ID.unique() : projectId;

        const databases = Config.getParam('pools-database', []);

        const databaseOverride = process.env._APP_DATABASE_OVERRIDE;
        const index = databases.indexOf(databaseOverride);
        let dsn = index !== -1 ? databases[index] : databases[Math.floor(Math.random() * databases.length)];

        if (projectId === 'console') {
            throw new Exception(Exception.PROJECT_RESERVED_PROJECT, "'console' is a reserved project.");
        }

        if (dsn === process.env._APP_DATABASE_SHARED_TABLES) {
            const schema = 'appconda';
            const database = 'appconda';
            const namespace = process.env._APP_DATABASE_SHARED_NAMESPACE || '';
            dsn = `${schema}://${process.env._APP_DATABASE_SHARED_TABLES}?database=${database}`;

            if (namespace) {
                dsn += `&namespace=${namespace}`;
            }
        }

        let project;
        try {
            project = await dbForConsole.createDocument('projects', new Document({
                $id: projectId,
                $permissions: [
                    Permission.read(Role.team(ID.custom(teamId))),
                    Permission.update(Role.team(ID.custom(teamId), 'owner')),
                    Permission.update(Role.team(ID.custom(teamId), 'developer')),
                    Permission.delete(Role.team(ID.custom(teamId), 'owner')),
                    Permission.delete(Role.team(ID.custom(teamId), 'developer')),
                ],
                name: name,
                teamInternalId: team.getInternalId(),
                teamId: team.getId(),
                region: region,
                description: description,
                logo: logo,
                url: url,
                version: APP_VERSION_STABLE,
                legalName: legalName,
                legalCountry: legalCountry,
                legalState: legalState,
                legalCity: legalCity,
                legalAddress: legalAddress,
                legalTaxId: ID.custom(legalTaxId),
                services: {},
                platforms: null,
                oAuthProviders: [],
                webhooks: null,
                keys: null,
                auths: auths,
                search: [projectId, name].join(' '),
                database: dsn,
            }));
        } catch (e) {
            if (e instanceof Duplicate) {
                throw new Exception(Exception.PROJECT_ALREADY_EXISTS);
            }
            throw e;
        }

        try {
            dsn = new DSN(dsn);
        } catch (e) {
            if (e instanceof Error) {
                dsn = new DSN(`mysql://${dsn}`);
            } else {
                throw e;
            }
        }

        const connection: Connection = await pools.get(dsn.getHost()).pop();
        const adapter = connection.getResource();
        const dbForProject = new Database(adapter, cache);

        if (dsn.getHost() === process.env._APP_DATABASE_SHARED_TABLES) {
            dbForProject
                .setSharedTables(true)
                .setTenant(project.getInternalId())
                .setNamespace(dsn.getParam('namespace'));
        } else {
            dbForProject
                .setSharedTables(false)
                .setTenant(null)
                .setNamespace(`_${project.getInternalId()}`);
        }

        await dbForProject.create();

        const audit = new Audit(dbForProject);
        await audit.setup();

        const abuse = new TimeLimit('', 0, 1, dbForProject);
        await abuse.setup();

        const collections = Config.getParam('collections', {})['projects'] ?? [];

        for (const [key, collection] of Object.entries(collections)) {
            if ((collection['$collection'] ?? '') !== Database.METADATA) {
                continue;
            }

            const attributes = collection['attributes'].map((attribute: any) => new Document(attribute));
            const indexes = collection['indexes'].map((index: any) => new Document(index));

            try {
                await dbForProject.createCollection(key, attributes, indexes);
            } catch (e) {
                if (!(e instanceof Duplicate)) {
                    throw e;
                }
            }
        }

        hooks.trigger('afterProjectCreation', [project, pools, cache]);

        response
            .setStatusCode(Response.STATUS_CODE_CREATED)
            .dynamic(project, Response.MODEL_PROJECT);
    });

App.get('/v1/projects')
    .desc('List projects')
    .groups(['api', 'projects'])
    .label('scope', 'projects.read')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'list')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_PROJECT_LIST)
    .param('queries', [], new Projects(), `Array of query strings generated using the Query class provided by the SDK. [Learn more about queries](https://appconda.io/docs/queries). Maximum of ${APP_LIMIT_ARRAY_PARAMS_SIZE} queries are allowed, each ${APP_LIMIT_ARRAY_ELEMENT_SIZE} characters long. You may filter on the following attributes: ${Projects.ALLOWED_ATTRIBUTES.join(', ')}`, true)
    .param('search', '', new Text(256), 'Search term to filter your list results. Max length: 256 chars.', true)
    .inject('response')
    .inject('dbForConsole')
    .action(async (queries: any[], search: string, response: Response, dbForConsole: Database ) => {

        try {
            queries = Query.parseQueries(queries);
        } catch (e) {
            if (e instanceof QueryException) {
                throw new Exception(Exception.GENERAL_QUERY_INVALID, e.message);
            }
            throw e;
        }

        if (search) {
            queries.push(Query.search('search', search));
        }

        const cursor = queries.find(query => [Query.TYPE_CURSOR_AFTER, Query.TYPE_CURSOR_BEFORE].includes(query.getMethod()));
        if (cursor) {
            const projectId = cursor.getValue();
            const cursorDocument = await dbForConsole.getDocument('projects', projectId);

            if (cursorDocument.isEmpty()) {
                throw new Exception(Exception.GENERAL_CURSOR_NOT_FOUND, `Project '${projectId}' for the 'cursor' value not found.`);
            }

            cursor.setValue(cursorDocument);
        }

        const filterQueries = Query.groupByType(queries)['filters'];

        response.dynamic(new Document({
            projects: await dbForConsole.find('projects', queries),
            total: await dbForConsole.count('projects', filterQueries, APP_LIMIT_COUNT),
        }), Response.MODEL_PROJECT_LIST);
    });

App.get('/v1/projects/:projectId')
    .desc('Get project')
    .groups(['api', 'projects'])
    .label('scope', 'projects.read')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'get')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_PROJECT)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, response, dbForConsole }: { projectId: string, response: Response, dbForConsole: Database }) => {

        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        response.dynamic(project, Response.MODEL_PROJECT);
    });

App.patch('/v1/projects/:projectId')
    .desc('Update project')
    .groups(['api', 'projects'])
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'update')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_PROJECT)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('name', null, new Text(128), 'Project name. Max length: 128 chars.')
    .param('description', '', new Text(256), 'Project description. Max length: 256 chars.', true)
    .param('logo', '', new Text(1024), 'Project logo.', true)
    .param('url', '', new URLValidator(), 'Project URL.', true)
    .param('legalName', '', new Text(256), 'Project legal name. Max length: 256 chars.', true)
    .param('legalCountry', '', new Text(256), 'Project legal country. Max length: 256 chars.', true)
    .param('legalState', '', new Text(256), 'Project legal state. Max length: 256 chars.', true)
    .param('legalCity', '', new Text(256), 'Project legal city. Max length: 256 chars.', true)
    .param('legalAddress', '', new Text(256), 'Project legal address. Max length: 256 chars.', true)
    .param('legalTaxId', '', new Text(256), 'Project legal tax ID. Max length: 256 chars.', true)
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, name, description, logo, url, legalName, legalCountry, legalState, legalCity, legalAddress, legalTaxId, response, dbForConsole }: { projectId: string, name: string, description: string, logo: string, url: string, legalName: string, legalCountry: string, legalState: string, legalCity: string, legalAddress: string, legalTaxId: string, response: Response, dbForConsole: Database }) => {

        let project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        project = await dbForConsole.updateDocument('projects', project.getId(), project
            .setAttribute('name', name)
            .setAttribute('description', description)
            .setAttribute('logo', logo)
            .setAttribute('url', url)
            .setAttribute('legalName', legalName)
            .setAttribute('legalCountry', legalCountry)
            .setAttribute('legalState', legalState)
            .setAttribute('legalCity', legalCity)
            .setAttribute('legalAddress', legalAddress)
            .setAttribute('legalTaxId', legalTaxId)
            .setAttribute('search', [projectId, name].join(' ')));

        response.dynamic(project, Response.MODEL_PROJECT);
    });

App.patch('/v1/projects/:projectId/team')
    .desc('Update Project Team')
    .groups(['api', 'projects'])
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'updateTeam')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_PROJECT)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('teamId', '', new UID(), 'Team ID of the team to transfer project to.')
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, teamId, response, dbForConsole }: { projectId: string, teamId: string, response: Response, dbForConsole: Database }) => {

        const project = await dbForConsole.getDocument('projects', projectId);
        const team = await dbForConsole.getDocument('teams', teamId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        if (team.isEmpty()) {
            throw new Exception(Exception.TEAM_NOT_FOUND);
        }

        const permissions = [
            Permission.read(Role.team(ID.custom(teamId))),
            Permission.update(Role.team(ID.custom(teamId), 'owner')),
            Permission.update(Role.team(ID.custom(teamId), 'developer')),
            Permission.delete(Role.team(ID.custom(teamId), 'owner')),
            Permission.delete(Role.team(ID.custom(teamId), 'developer')),
        ];

        project
            .setAttribute('teamId', teamId)
            .setAttribute('teamInternalId', team.getInternalId())
            .setAttribute('$permissions', permissions);
        await dbForConsole.updateDocument('projects', project.getId(), project);

        const installations = await dbForConsole.find('installations', [
            Query.equal('projectInternalId', [project.getInternalId()]),
        ]);
        for (const installation of installations) {
            installation.setAttribute('$permissions', permissions);
            await dbForConsole.updateDocument('installations', installation.getId(), installation);
        }

        const repositories = await dbForConsole.find('repositories', [
            Query.equal('projectInternalId', [project.getInternalId()]),
        ]);
        for (const repository of repositories) {
            repository.setAttribute('$permissions', permissions);
            await dbForConsole.updateDocument('repositories', repository.getId(), repository);
        }

        const vcsComments = await dbForConsole.find('vcsComments', [
            Query.equal('projectInternalId', [project.getInternalId()]),
        ]);
        for (const vcsComment of vcsComments) {
            vcsComment.setAttribute('$permissions', permissions);
            await dbForConsole.updateDocument('vcsComments', vcsComment.getId(), vcsComment);
        }

        response.dynamic(project, Response.MODEL_PROJECT);
    });

App.patch('/v1/projects/:projectId/service')
    .desc('Update service status')
    .groups(['api', 'projects'])
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'updateServiceStatus')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_PROJECT)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('service', '', new WhiteList(Object.keys(Config.getParam('services')).filter(element => Config.getParam('services')[element].optional), true), 'Service name.')
    .param('status', null, new BooleanValidator(), 'Service status.')
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, service, status, response, dbForConsole }: { projectId: string, service: string, status: boolean, response: Response, dbForConsole: Database }) => {

        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        const services = project.getAttribute('services', {});
        services[service] = status;

        const updatedProject = await dbForConsole.updateDocument('projects', project.getId(), project.setAttribute('services', services));

        response.dynamic(updatedProject, Response.MODEL_PROJECT);
    });

App.patch('/v1/projects/:projectId/service/all')
    .desc('Update all service status')
    .groups(['api', 'projects'])
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'updateServiceStatusAll')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_PROJECT)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('status', null, new BooleanValidator(), 'Service status.')
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, status, response, dbForConsole }: { projectId: string, status: boolean, response: Response, dbForConsole: Database }) => {

        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        const allServices = Object.keys(Config.getParam('services')).filter(element => Config.getParam('services')[element].optional);

        const services: Record<string, boolean> = {};
        for (const service of allServices) {
            services[service] = status;
        }

        const updatedProject = await dbForConsole.updateDocument('projects', project.getId(), project.setAttribute('services', services));

        response.dynamic(updatedProject, Response.MODEL_PROJECT);
    });

App.patch('/v1/projects/:projectId/api')
    .desc('Update API status')
    .groups(['api', 'projects'])
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'updateApiStatus')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_PROJECT)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('api', '', new WhiteList(Object.keys(Config.getParam('apis')), true), 'API name.')
    .param('status', null, new BooleanValidator(), 'API status.')
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, api, status, response, dbForConsole }: { projectId: string, api: string, status: boolean, response: Response, dbForConsole: Database }) => {

        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        const apis = project.getAttribute('apis', {});
        apis[api] = status;

        const updatedProject = await dbForConsole.updateDocument('projects', project.getId(), project.setAttribute('apis', apis));

        response.dynamic(updatedProject, Response.MODEL_PROJECT);
    });

App.patch('/v1/projects/:projectId/api/all')
    .desc('Update all API status')
    .groups(['api', 'projects'])
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'updateApiStatusAll')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_PROJECT)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('status', null, new BooleanValidator(), 'API status.')
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, status, response, dbForConsole }: { projectId: string, status: boolean, response: Response, dbForConsole: Database }) => {

        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        const allApis = Object.keys(Config.getParam('apis'));

        const apis: Record<string, boolean> = {};
        for (const api of allApis) {
            apis[api] = status;
        }

        const updatedProject = await dbForConsole.updateDocument('projects', project.getId(), project.setAttribute('apis', apis));

        response.dynamic(updatedProject, Response.MODEL_PROJECT);
    });

App.patch('/v1/projects/:projectId/oauth2')
    .desc('Update project OAuth2')
    .groups(['api', 'projects'])
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'updateOAuth2')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_PROJECT)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('provider', '', new WhiteList(Object.keys(Config.getParam('oAuthProviders')), true), 'Provider Name')
    .param('appId', null, new Text(256), 'Provider app ID. Max length: 256 chars.', true)
    .param('secret', null, new Text(512), 'Provider secret key. Max length: 512 chars.', true)
    .param('enabled', null, new BooleanValidator(), 'Provider status. Set to \'false\' to disable new session creation.', true)
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, provider, appId, secret, enabled, response, dbForConsole }: { projectId: string, provider: string, appId: string | null, secret: string | null, enabled: boolean | null, response: Response, dbForConsole: Database }) => {

        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        const providers = project.getAttribute('oAuthProviders', {});

        if (appId !== null) {
            providers[`${provider}Appid`] = appId;
        }

        if (secret !== null) {
            providers[`${provider}Secret`] = secret;
        }

        if (enabled !== null) {
            providers[`${provider}Enabled`] = enabled;
        }

        const updatedProject = await dbForConsole.updateDocument('projects', project.getId(), project.setAttribute('oAuthProviders', providers));

        response.dynamic(updatedProject, Response.MODEL_PROJECT);
    });

App.patch('/v1/projects/:projectId/auth/limit')
    .desc('Update project users limit')
    .groups(['api', 'projects'])
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'updateAuthLimit')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_PROJECT)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('limit', false, new Range(0, APP_LIMIT_USERS), 'Set the max number of users allowed in this project. Use 0 for unlimited.')
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, limit, response, dbForConsole }: { projectId: string, limit: number, response: Response, dbForConsole: Database }) => {

        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        const auths = project.getAttribute('auths', {});
        auths['limit'] = limit;

        const updatedProject = await dbForConsole.updateDocument('projects', project.getId(), project.setAttribute('auths', auths));

        response.dynamic(updatedProject, Response.MODEL_PROJECT);
    });

App.patch('/v1/projects/:projectId/auth/duration')
    .desc('Update project authentication duration')
    .groups(['api', 'projects'])
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'updateAuthDuration')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_PROJECT)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('duration', 31536000, new Range(0, 31536000), 'Project session length in seconds. Max length: 31536000 seconds.')
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, duration, response, dbForConsole }: { projectId: string, duration: number, response: Response, dbForConsole: Database }) => {

        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        const auths = project.getAttribute('auths', {});
        auths['duration'] = duration;

        const updatedProject = await dbForConsole.updateDocument('projects', project.getId(), project.setAttribute('auths', auths));

        response.dynamic(updatedProject, Response.MODEL_PROJECT);
    });

App.patch('/v1/projects/:projectId/auth/:method')
    .desc('Update project auth method status. Use this endpoint to enable or disable a given auth method for this project.')
    .groups(['api', 'projects'])
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'updateAuthStatus')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_PROJECT)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('method', '', new WhiteList(Object.keys(Config.getParam('auth')), true), `Auth Method. Possible values: ${Object.keys(Config.getParam('auth')).join(',')}`, false)
    .param('status', false, new BooleanValidator(true), 'Set the status of this auth method.')
    .inject('response')
    .inject('dbForConsole')
    .action(async (projectId: string, method: string, status: boolean, response: Response, dbForConsole: Database) => {

        const project = await dbForConsole.getDocument('projects', projectId);
        const auth = Config.getParam('auth')[method] || {};
        const authKey = auth['key'] || '';
        const isEnabled = ((status as any) === '1' || (status as any) === 'true' || (status as any) === 1 || (status as any) === true);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        const auths = project.getAttribute('auths', {});
        auths[authKey] = isEnabled;

        const updatedProject = await dbForConsole.updateDocument('projects', project.getId(), project.setAttribute('auths', auths));

        response.dynamic(updatedProject, Response.MODEL_PROJECT);
    });

App.patch('/v1/projects/:projectId/auth/password-history')
    .desc('Update authentication password history. Use this endpoint to set the number of password history to save and 0 to disable password history.')
    .groups(['api', 'projects'])
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'updateAuthPasswordHistory')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_PROJECT)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('limit', 0, new Range(0, APP_LIMIT_USER_PASSWORD_HISTORY), `Set the max number of passwords to store in user history. User can't choose a new password that is already stored in the password history list. Max number of passwords allowed in history is ${APP_LIMIT_USER_PASSWORD_HISTORY}. Default value is 0`)
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, limit, response, dbForConsole }: { projectId: string, limit: number, response: Response, dbForConsole: Database }) => {

        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        const auths = project.getAttribute('auths', {});
        auths['passwordHistory'] = limit;

        const updatedProject = await dbForConsole.updateDocument('projects', project.getId(), project.setAttribute('auths', auths));

        response.dynamic(updatedProject, Response.MODEL_PROJECT);
    });

App.patch('/v1/projects/:projectId/auth/password-dictionary')
    .desc('Update authentication password dictionary status. Use this endpoint to enable or disable the dictionary check for user password')
    .groups(['api', 'projects'])
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'updateAuthPasswordDictionary')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_PROJECT)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('enabled', false, new BooleanValidator(false), 'Set whether or not to enable checking user\'s password against most commonly used passwords. Default is false.')
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, enabled, response, dbForConsole }: { projectId: string, enabled: boolean, response: Response, dbForConsole: Database }) => {

        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        const auths = project.getAttribute('auths', {});
        auths['passwordDictionary'] = enabled;

        const updatedProject = await dbForConsole.updateDocument('projects', project.getId(), project.setAttribute('auths', auths));

        response.dynamic(updatedProject, Response.MODEL_PROJECT);
    });

App.patch('/v1/projects/:projectId/auth/personal-data')
    .desc('Enable or disable checking user passwords for similarity with their personal data.')
    .groups(['api', 'projects'])
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'updatePersonalDataCheck')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_PROJECT)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('enabled', false, new BooleanValidator(false), 'Set whether or not to check a password for similarity with personal data. Default is false.')
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, enabled, response, dbForConsole }: { projectId: string, enabled: boolean, response: Response, dbForConsole: Database }) => {

        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        const auths = project.getAttribute('auths', {});
        auths['personalDataCheck'] = enabled;

        const updatedProject = await dbForConsole.updateDocument('projects', project.getId(), project.setAttribute('auths', auths));

        response.dynamic(updatedProject, Response.MODEL_PROJECT);
    });

App.patch('/v1/projects/:projectId/auth/max-sessions')
    .desc('Update project user sessions limit')
    .groups(['api', 'projects'])
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'updateAuthSessionsLimit')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_PROJECT)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('limit', false, new Range(1, APP_LIMIT_USER_SESSIONS_MAX), `Set the max number of users allowed in this project. Value allowed is between 1-${APP_LIMIT_USER_SESSIONS_MAX}. Default is ${APP_LIMIT_USER_SESSIONS_DEFAULT}`)
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, limit, response, dbForConsole }: { projectId: string, limit: number, response: Response, dbForConsole: Database }) => {

        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        const auths = project.getAttribute('auths', {});
        auths['maxSessions'] = limit;

        const updatedProject = await dbForConsole.updateDocument('projects', project.getId(), project.setAttribute('auths', auths));

        response.dynamic(updatedProject, Response.MODEL_PROJECT);
    });

App.delete('/v1/projects/:projectId')
    .desc('Delete project')
    .groups(['api', 'projects'])
    .label('audits.event', 'projects.delete')
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'delete')
    .label('sdk.response.code', Response.STATUS_CODE_NOCONTENT)
    .label('sdk.response.model', Response.MODEL_NONE)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .inject('response')
    .inject('user')
    .inject('dbForConsole')
    .inject('queueForDeletes')
    .action(async ({ projectId, response, user, dbForConsole, queueForDeletes }: { projectId: string, response: Response, user: Document, dbForConsole: Database, queueForDeletes: Delete }) => {
        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        queueForDeletes
            .setType(DELETE_TYPE_DOCUMENT)
            .setDocument(project);

        const success = await dbForConsole.deleteDocument('projects', projectId);
        if (!success) {
            throw new Exception(Exception.GENERAL_SERVER_ERROR, 'Failed to remove project from DB');
        }

        response.noContent();
    });

App.post('/v1/projects/:projectId/webhooks')
    .desc('Create webhook')
    .groups(['api', 'projects'])
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'createWebhook')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_WEBHOOK)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('name', null, new Text(128), 'Webhook name. Max length: 128 chars.')
    .param('enabled', true, new BooleanValidator(true), 'Enable or disable a webhook.', true)
    .param('events', null, new ArrayList(new Event(), APP_LIMIT_ARRAY_PARAMS_SIZE), `Events list. Maximum of ${APP_LIMIT_ARRAY_PARAMS_SIZE} events are allowed.`)
    .param('url', '', (request) => new Multiple([new URLValidator(['http', 'https']), new PublicDomain()], Multiple.TYPE_STRING), 'Webhook URL.', false, ['request'])
    .param('security', false, new BooleanValidator(true), 'Certificate verification, false for disabled or true for enabled.')
    .param('httpUser', '', new Text(256), 'Webhook HTTP user. Max length: 256 chars.', true)
    .param('httpPass', '', new Text(256), 'Webhook HTTP password. Max length: 256 chars.', true)
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, name, enabled, events, url, security, httpUser, httpPass, response, dbForConsole }: { projectId: string, name: string, enabled: boolean, events: any[], url: string, security: boolean, httpUser: string, httpPass: string, response: Response, dbForConsole: Database }) => {

        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        security = Boolean(security);

        const webhook = new Document({
            $id: ID.unique(),
            $permissions: [
                Permission.read(Role.any()),
                Permission.update(Role.any()),
                Permission.delete(Role.any()),
            ],
            projectInternalId: project.getInternalId(),
            projectId: project.getId(),
            name: name,
            events: events,
            url: url,
            security: security,
            httpUser: httpUser,
            httpPass: httpPass,
            signatureKey: Buffer.from(randomBytes(64)).toString('hex'),
            enabled: enabled,
        });

        const createdWebhook = await dbForConsole.createDocument('webhooks', webhook);

        await dbForConsole.purgeCachedDocument('projects', project.getId());

        response
            .setStatusCode(Response.STATUS_CODE_CREATED)
            .dynamic(createdWebhook, Response.MODEL_WEBHOOK);
    });

App.get('/v1/projects/:projectId/webhooks')
    .desc('List webhooks')
    .groups(['api', 'projects'])
    .label('scope', 'projects.read')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'listWebhooks')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_WEBHOOK_LIST)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, response, dbForConsole }: { projectId: string, response: Response, dbForConsole: Database }) => {

        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        const webhooks = await dbForConsole.find('webhooks', [
            Query.equal('projectInternalId', [project.getInternalId()]),
            Query.limit(5000),
        ]);

        response.dynamic(new Document({
            webhooks: webhooks,
            total: webhooks.length,
        }), Response.MODEL_WEBHOOK_LIST);
    });

App.get('/v1/projects/:projectId/webhooks/:webhookId')
    .desc('Get webhook')
    .groups(['api', 'projects'])
    .label('scope', 'projects.read')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'getWebhook')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_WEBHOOK)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('webhookId', '', new UID(), 'Webhook unique ID.')
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, webhookId, response, dbForConsole }: { projectId: string, webhookId: string, response: Response, dbForConsole: Database }) => {

        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        const webhook = await dbForConsole.findOne('webhooks', [
            Query.equal('$id', [webhookId]),
            Query.equal('projectInternalId', [project.getInternalId()]),
        ]);

        if (!webhook || webhook.isEmpty()) {
            throw new Exception(Exception.WEBHOOK_NOT_FOUND);
        }

        response.dynamic(webhook, Response.MODEL_WEBHOOK);
    });

App.put('/v1/projects/:projectId/webhooks/:webhookId')
    .desc('Update webhook')
    .groups(['api', 'projects'])
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'updateWebhook')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_WEBHOOK)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('webhookId', '', new UID(), 'Webhook unique ID.')
    .param('name', null, new Text(128), 'Webhook name. Max length: 128 chars.')
    .param('enabled', true, new BooleanValidator(true), 'Enable or disable a webhook.', true)
    .param('events', null, new ArrayList(new Event(), APP_LIMIT_ARRAY_PARAMS_SIZE), `Events list. Maximum of ${APP_LIMIT_ARRAY_PARAMS_SIZE} events are allowed.`)
    .param('url', '', (request) => new Multiple([new URLValidator(['http', 'https']), new PublicDomain()], Multiple.TYPE_STRING), 'Webhook URL.', false, ['request'])
    .param('security', false, new BooleanValidator(true), 'Certificate verification, false for disabled or true for enabled.')
    .param('httpUser', '', new Text(256), 'Webhook HTTP user. Max length: 256 chars.', true)
    .param('httpPass', '', new Text(256), 'Webhook HTTP password. Max length: 256 chars.', true)
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, webhookId, name, enabled, events, url, security, httpUser, httpPass, response, dbForConsole }: { projectId: string, webhookId: string, name: string, enabled: boolean, events: any[], url: string, security: boolean, httpUser: string, httpPass: string, response: Response, dbForConsole: Database }) => {

        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        security = ((security as any) === '1' || (security as any) === 'true' || (security as any) === 1 || (security as any) === true);

        const webhook = await dbForConsole.findOne('webhooks', [
            Query.equal('$id', [webhookId]),
            Query.equal('projectInternalId', [project.getInternalId()]),
        ]);

        if (!webhook || webhook.isEmpty()) {
            throw new Exception(Exception.WEBHOOK_NOT_FOUND);
        }

        webhook
            .setAttribute('name', name)
            .setAttribute('events', events)
            .setAttribute('url', url)
            .setAttribute('security', security)
            .setAttribute('httpUser', httpUser)
            .setAttribute('httpPass', httpPass)
            .setAttribute('enabled', enabled);

        if (enabled) {
            webhook.setAttribute('attempts', 0);
        }

        await dbForConsole.updateDocument('webhooks', webhook.getId(), webhook);
        await dbForConsole.purgeCachedDocument('projects', project.getId());

        response.dynamic(webhook, Response.MODEL_WEBHOOK);
    });

App.patch('/v1/projects/:projectId/webhooks/:webhookId/signature')
    .desc('Update webhook signature key')
    .groups(['api', 'projects'])
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'updateWebhookSignature')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_WEBHOOK)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('webhookId', '', new UID(), 'Webhook unique ID.')
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, webhookId, response, dbForConsole }: { projectId: string, webhookId: string, response: Response, dbForConsole: Database }) => {

        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        const webhook = await dbForConsole.findOne('webhooks', [
            Query.equal('$id', [webhookId]),
            Query.equal('projectInternalId', [project.getInternalId()]),
        ]);

        if (!webhook || webhook.isEmpty()) {
            throw new Exception(Exception.WEBHOOK_NOT_FOUND);
        }

        webhook.setAttribute('signatureKey', Buffer.from(randomBytes(64)).toString('hex'));

        await dbForConsole.updateDocument('webhooks', webhook.getId(), webhook);
        await dbForConsole.purgeCachedDocument('projects', project.getId());

        response.dynamic(webhook, Response.MODEL_WEBHOOK);
    });

App.delete('/v1/projects/:projectId/webhooks/:webhookId')
    .desc('Delete webhook')
    .groups(['api', 'projects'])
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'deleteWebhook')
    .label('sdk.response.code', Response.STATUS_CODE_NOCONTENT)
    .label('sdk.response.model', Response.MODEL_NONE)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('webhookId', '', new UID(), 'Webhook unique ID.')
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, webhookId, response, dbForConsole }: { projectId: string, webhookId: string, response: Response, dbForConsole: Database }) => {

        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        const webhook = await dbForConsole.findOne('webhooks', [
            Query.equal('$id', [webhookId]),
            Query.equal('projectInternalId', [project.getInternalId()]),
        ]);

        if (!webhook || webhook.isEmpty()) {
            throw new Exception(Exception.WEBHOOK_NOT_FOUND);
        }

        await dbForConsole.deleteDocument('webhooks', webhook.getId());

        await dbForConsole.purgeCachedDocument('projects', project.getId());

        response.noContent();
    });

App.post('/v1/projects/:projectId/keys')
    .desc('Create key')
    .groups(['api', 'projects'])
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'createKey')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_KEY)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('name', null, new Text(128), 'Key name. Max length: 128 chars.')
    .param('scopes', null, new ArrayList(new WhiteList(Object.keys(Config.getParam('scopes')), true), APP_LIMIT_ARRAY_PARAMS_SIZE), `Key scopes list. Maximum of ${APP_LIMIT_ARRAY_PARAMS_SIZE} scopes are allowed.`)
    .param('expire', null, new Datetime(), 'Expiration time in [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format. Use null for unlimited expiration.', true)
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, name, scopes, expire, response, dbForConsole }: { projectId: string, name: string, scopes: string[], expire: string | null, response: Response, dbForConsole: Database }) => {

        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        const key = new Document({
            $id: ID.unique(),
            $permissions: [
                Permission.read(Role.any()),
                Permission.update(Role.any()),
                Permission.delete(Role.any()),
            ],
            projectInternalId: project.getInternalId(),
            projectId: project.getId(),
            name: name,
            scopes: scopes,
            expire: expire,
            sdks: [],
            accessedAt: null,
            secret: Buffer.from(randomBytes(128)).toString('hex'),
        });

        const createdKey = await dbForConsole.createDocument('keys', key);

        await dbForConsole.purgeCachedDocument('projects', project.getId());

        response
            .setStatusCode(Response.STATUS_CODE_CREATED)
            .dynamic(createdKey, Response.MODEL_KEY);
    });


App.get('/v1/projects/:projectId/keys')
    .desc('List keys')
    .groups(['api', 'projects'])
    .label('scope', 'projects.read')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'listKeys')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_KEY_LIST)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, response, dbForConsole }: { projectId: string, response: Response, dbForConsole: Database }) => {

        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        const keys = await dbForConsole.find('keys', [
            Query.equal('projectInternalId', [project.getInternalId()]),
            Query.limit(5000),
        ]);

        response.dynamic(new Document({
            keys: keys,
            total: keys.length,
        }), Response.MODEL_KEY_LIST);
    });

App.get('/v1/projects/:projectId/keys/:keyId')
    .desc('Get key')
    .groups(['api', 'projects'])
    .label('scope', 'projects.read')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'getKey')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_KEY)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('keyId', '', new UID(), 'Key unique ID.')
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, keyId, response, dbForConsole }: { projectId: string, keyId: string, response: Response, dbForConsole: Database }) => {

        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        const key = await dbForConsole.findOne('keys', [
            Query.equal('$id', [keyId]),
            Query.equal('projectInternalId', [project.getInternalId()]),
        ]);

        if (!key || key.isEmpty()) {
            throw new Exception(Exception.KEY_NOT_FOUND);
        }

        response.dynamic(key, Response.MODEL_KEY);
    });

App.put('/v1/projects/:projectId/keys/:keyId')
    .desc('Update key')
    .groups(['api', 'projects'])
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'updateKey')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_KEY)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('keyId', '', new UID(), 'Key unique ID.')
    .param('name', null, new Text(128), 'Key name. Max length: 128 chars.')
    .param('scopes', null, new ArrayList(new WhiteList(Object.keys(Config.getParam('scopes')), true), APP_LIMIT_ARRAY_PARAMS_SIZE), `Key scopes list. Maximum of ${APP_LIMIT_ARRAY_PARAMS_SIZE} events are allowed.`)
    .param('expire', null, new Datetime(), 'Expiration time in [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format. Use null for unlimited expiration.', true)
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, keyId, name, scopes, expire, response, dbForConsole }: { projectId: string, keyId: string, name: string, scopes: string[], expire: string | null, response: Response, dbForConsole: Database }) => {

        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        const key = await dbForConsole.findOne('keys', [
            Query.equal('$id', [keyId]),
            Query.equal('projectInternalId', [project.getInternalId()]),
        ]);

        if (!key || key.isEmpty()) {
            throw new Exception(Exception.KEY_NOT_FOUND);
        }

        key
            .setAttribute('name', name)
            .setAttribute('scopes', scopes)
            .setAttribute('expire', expire);

        await dbForConsole.updateDocument('keys', key.getId(), key);

        await dbForConsole.purgeCachedDocument('projects', project.getId());

        response.dynamic(key, Response.MODEL_KEY);
    });

App.delete('/v1/projects/:projectId/keys/:keyId')
    .desc('Delete key')
    .groups(['api', 'projects'])
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'deleteKey')
    .label('sdk.response.code', Response.STATUS_CODE_NOCONTENT)
    .label('sdk.response.model', Response.MODEL_NONE)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('keyId', '', new UID(), 'Key unique ID.')
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, keyId, response, dbForConsole }: { projectId: string, keyId: string, response: Response, dbForConsole: Database }) => {

        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        const key = await dbForConsole.findOne('keys', [
            Query.equal('$id', [keyId]),
            Query.equal('projectInternalId', [project.getInternalId()]),
        ]);

        if (!key || key.isEmpty()) {
            throw new Exception(Exception.KEY_NOT_FOUND);
        }

        await dbForConsole.deleteDocument('keys', key.getId());

        await dbForConsole.purgeCachedDocument('projects', project.getId());

        response.noContent();
    });

App.post('/v1/projects/:projectId/platforms')
    .desc('Create platform')
    .groups(['api', 'projects'])
    .label('audits.event', 'platforms.create')
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'createPlatform')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_PLATFORM)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('type', null, new WhiteList([
        Origin.CLIENT_TYPE_WEB,
        Origin.CLIENT_TYPE_FLUTTER_WEB,
        Origin.CLIENT_TYPE_FLUTTER_IOS,
        Origin.CLIENT_TYPE_FLUTTER_ANDROID,
        Origin.CLIENT_TYPE_FLUTTER_LINUX,
        Origin.CLIENT_TYPE_FLUTTER_MACOS,
        Origin.CLIENT_TYPE_FLUTTER_WINDOWS,
        Origin.CLIENT_TYPE_APPLE_IOS,
        Origin.CLIENT_TYPE_APPLE_MACOS,
        Origin.CLIENT_TYPE_APPLE_WATCHOS,
        Origin.CLIENT_TYPE_APPLE_TVOS,
        Origin.CLIENT_TYPE_ANDROID,
        Origin.CLIENT_TYPE_UNITY
    ], true), 'Platform type.')
    .param('name', null, new Text(128), 'Platform name. Max length: 128 chars.')
    .param('key', '', new Text(256), 'Package name for Android or bundle ID for iOS or macOS. Max length: 256 chars.', true)
    .param('store', '', new Text(256), 'App store or Google Play store ID. Max length: 256 chars.', true)
    .param('hostname', '', new Hostname(), 'Platform client hostname. Max length: 256 chars.', true)
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, type, name, key, store, hostname, response, dbForConsole }: { projectId: string, type: string, name: string, key: string, store: string, hostname: string, response: Response, dbForConsole: Database }) => {
        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        const platform = new Document({
            $id: ID.unique(),
            $permissions: [
                Permission.read(Role.any()),
                Permission.update(Role.any()),
                Permission.delete(Role.any()),
            ],
            projectInternalId: project.getInternalId(),
            projectId: project.getId(),
            type: type,
            name: name,
            key: key,
            store: store,
            hostname: hostname
        });

        const createdPlatform = await dbForConsole.createDocument('platforms', platform);

        await dbForConsole.purgeCachedDocument('projects', project.getId());

        response
            .setStatusCode(Response.STATUS_CODE_CREATED)
            .dynamic(createdPlatform, Response.MODEL_PLATFORM);
    });

App.get('/v1/projects/:projectId/platforms')
    .desc('List platforms')
    .groups(['api', 'projects'])
    .label('scope', 'projects.read')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'listPlatforms')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_PLATFORM_LIST)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, response, dbForConsole }: { projectId: string, response: Response, dbForConsole: Database }) => {

        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        const platforms = await dbForConsole.find('platforms', [
            Query.equal('projectInternalId', [project.getInternalId()]),
            Query.limit(5000),
        ]);

        response.dynamic(new Document({
            platforms: platforms,
            total: platforms.length,
        }), Response.MODEL_PLATFORM_LIST);
    });

App.get('/v1/projects/:projectId/platforms/:platformId')
    .desc('Get platform')
    .groups(['api', 'projects'])
    .label('scope', 'projects.read')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'getPlatform')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_PLATFORM)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('platformId', '', new UID(), 'Platform unique ID.')
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, platformId, response, dbForConsole }: { projectId: string, platformId: string, response: Response, dbForConsole: Database }) => {

        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        const platform = await dbForConsole.findOne('platforms', [
            Query.equal('$id', [platformId]),
            Query.equal('projectInternalId', [project.getInternalId()]),
        ]);

        if (!platform || platform.isEmpty()) {
            throw new Exception(Exception.PLATFORM_NOT_FOUND);
        }

        response.dynamic(platform, Response.MODEL_PLATFORM);
    });

App.put('/v1/projects/:projectId/platforms/:platformId')
    .desc('Update platform')
    .groups(['api', 'projects'])
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'updatePlatform')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_PLATFORM)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('platformId', '', new UID(), 'Platform unique ID.')
    .param('name', null, new Text(128), 'Platform name. Max length: 128 chars.')
    .param('key', '', new Text(256), 'Package name for android or bundle ID for iOS. Max length: 256 chars.', true)
    .param('store', '', new Text(256), 'App store or Google Play store ID. Max length: 256 chars.', true)
    .param('hostname', '', new Hostname(), 'Platform client URL. Max length: 256 chars.', true)
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, platformId, name, key, store, hostname, response, dbForConsole }: { projectId: string, platformId: string, name: string, key: string, store: string, hostname: string, response: Response, dbForConsole: Database }) => {
        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        const platform = await dbForConsole.findOne('platforms', [
            Query.equal('$id', [platformId]),
            Query.equal('projectInternalId', [project.getInternalId()]),
        ]);

        if (!platform || platform.isEmpty()) {
            throw new Exception(Exception.PLATFORM_NOT_FOUND);
        }

        platform
            .setAttribute('name', name)
            .setAttribute('key', key)
            .setAttribute('store', store)
            .setAttribute('hostname', hostname);

        await dbForConsole.updateDocument('platforms', platform.getId(), platform);

        await dbForConsole.purgeCachedDocument('projects', project.getId());

        response.dynamic(platform, Response.MODEL_PLATFORM);
    });

App.delete('/v1/projects/:projectId/platforms/:platformId')
    .desc('Delete platform')
    .groups(['api', 'projects'])
    .label('audits.event', 'platforms.delete')
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'deletePlatform')
    .label('sdk.response.code', Response.STATUS_CODE_NOCONTENT)
    .label('sdk.response.model', Response.MODEL_NONE)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('platformId', '', new UID(), 'Platform unique ID.')
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, platformId, response, dbForConsole }: { projectId: string, platformId: string, response: Response, dbForConsole: Database }) => {

        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        const platform = await dbForConsole.findOne('platforms', [
            Query.equal('$id', [platformId]),
            Query.equal('projectInternalId', [project.getInternalId()]),
        ]);

        if (!platform || platform.isEmpty()) {
            throw new Exception(Exception.PLATFORM_NOT_FOUND);
        }

        await dbForConsole.deleteDocument('platforms', platformId);

        await dbForConsole.purgeCachedDocument('projects', project.getId());

        response.noContent();
    });

App.patch('/v1/projects/:projectId/smtp')
    .desc('Update SMTP')
    .groups(['api', 'projects'])
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'updateSmtp')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_PROJECT)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('enabled', false, new BooleanValidator(), 'Enable custom SMTP service')
    .param('senderName', '', new Text(255, 0), 'Name of the email sender', true)
    .param('senderEmail', '', new Email(), 'Email of the sender', true)
    .param('replyTo', '', new Email(), 'Reply to email', true)
    .param('host', '', new Hostname(), 'SMTP server host name', true)
    .param('port', 587, new Integer(), 'SMTP server port', true)
    .param('username', '', new Text(0, 0), 'SMTP server username', true)
    .param('password', '', new Text(0, 0), 'SMTP server password', true)
    .param('secure', '', new WhiteList(['tls', 'ssl'], true), 'Does SMTP server use secure connection', true)
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, enabled, senderName, senderEmail, replyTo, host, port, username, password, secure, response, dbForConsole }: { projectId: string, enabled: boolean, senderName: string, senderEmail: string, replyTo: string, host: string, port: number, username: string, password: string, secure: string, response: Response, dbForConsole: Database }) => {

        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        // Ensure required params for when enabling SMTP
        if (enabled) {
            if (!senderName) {
                throw new Exception(Exception.GENERAL_ARGUMENT_INVALID, 'Sender name is required when enabling SMTP.');
            } else if (!senderEmail) {
                throw new Exception(Exception.GENERAL_ARGUMENT_INVALID, 'Sender email is required when enabling SMTP.');
            } else if (!host) {
                throw new Exception(Exception.GENERAL_ARGUMENT_INVALID, 'Host is required when enabling SMTP.');
            } else if (!port) {
                throw new Exception(Exception.GENERAL_ARGUMENT_INVALID, 'Port is required when enabling SMTP.');
            }
        }

        // Validate SMTP settings
        if (enabled) {
            const nodemailer = require('nodemailer');
            let transporter = nodemailer.createTransport({
                host: host,
                port: port,
                secure: secure, // true for 465, false for other ports
                auth: {
                    user: username,
                    pass: password
                },
                tls: {
                    rejectUnauthorized: false // SMTPAutoTLS 
                },
                connectionTimeout: 5000 // 5 saniye timeout
            });



            try {
                await transporter.verify();
                console.log("SMTP bağlantısı başarılı.");

                // Bağlantı geçerli değilse hata atmak için
                const valid = await transporter.verify();
                if (!valid) {
                    throw new Error('Bağlantı geçerli değil.');
                }
            } catch (error) {
                throw new Exception(Exception.PROJECT_SMTP_CONFIG_INVALID, 'Could not connect to SMTP server: ' + error.message);
            }
        }

        //  SMTP ayarlarini kayder.
        const smtp = enabled ? {
            enabled: enabled,
            senderName: senderName,
            senderEmail: senderEmail,
            replyTo: replyTo,
            host: host,
            port: port,
            username: username,
            password: password,
            secure: secure,
        } : {
            enabled: false
        };

        const updatedProject = await dbForConsole.updateDocument('projects', project.getId(), project.setAttribute('smtp', smtp));

        response.dynamic(updatedProject, Response.MODEL_PROJECT);
    });

App.post('/v1/projects/:projectId/smtp/tests')
    .desc('Create SMTP test')
    .groups(['api', 'projects'])
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'createSmtpTest')
    .label('sdk.response.code', Response.STATUS_CODE_NOCONTENT)
    .label('sdk.response.model', Response.MODEL_NONE)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('emails', [], new ArrayList(new Email(), 10), 'Array of emails to send test email to. Maximum of 10 emails are allowed.')
    .param('senderName', process.env._APP_SYSTEM_EMAIL_NAME || `${APP_NAME} Server`, new Text(255, 0), 'Name of the email sender')
    .param('senderEmail', process.env._APP_SYSTEM_EMAIL_ADDRESS || APP_EMAIL_TEAM, new Email(), 'Email of the sender')
    .param('replyTo', '', new Email(), 'Reply to email', true)
    .param('host', '', new Hostname(), 'SMTP server host name')
    .param('port', 587, new Integer(), 'SMTP server port', true)
    .param('username', '', new Text(0, 0), 'SMTP server username', true)
    .param('password', '', new Text(0, 0), 'SMTP server password', true)
    .param('secure', '', new WhiteList(['tls'], true), 'Does SMTP server use secure connection', true)
    .inject('response')
    .inject('dbForConsole')
    .inject('queueForMails')
    .action(async ({ projectId, emails, senderName, senderEmail, replyTo, host, port, username, password, secure, response, dbForConsole, queueForMails }: { projectId: string, emails: string[], senderName: string, senderEmail: string, replyTo: string, host: string, port: number, username: string, password: string, secure: string, response: Response, dbForConsole: Database, queueForMails: Mail }) => {
        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        const replyToEmail = replyTo || senderEmail;

        const subject = 'Custom SMTP email sample';
        const template = Template.fromFile(path.resolve(__dirname, '../../config/locale/templates/email-smtp-test.tpl'));
        template
            .setParam('{{from}}', `${senderName} (${senderEmail})`)
            .setParam('{{replyTo}}', `${senderName} (${replyToEmail})`);

        for (const email of emails) {
            queueForMails
                .setSmtpHost(host)
                .setSmtpPort(port)
                .setSmtpUsername(username)
                .setSmtpPassword(password)
                .setSmtpSecure(secure)
                .setSmtpReplyTo(replyTo)
                .setSmtpSenderEmail(senderEmail)
                .setSmtpSenderName(senderName)
                .setRecipient(email)
                .setName('')
                .setBodyTemplate(path.resolve(__dirname, '../../config/locale/templates/email-base-styled.tpl'))
                .setBody(await template.render())
                .setVariables({})
                .setSubject(subject)
                .trigger();
        }

        response.noContent();
    });

App.get('/v1/projects/:projectId/templates/sms/:type/:locale')
    .desc('Get custom SMS template')
    .groups(['api', 'projects'])
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'getSmsTemplate')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_SMS_TEMPLATE)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('type', '', new WhiteList(Config.getParam('locale-templates')?.sms ?? []), 'Template type')
    .param('locale', '', (localeCodes: string[]) => new WhiteList(localeCodes), 'Template locale', false, ['localeCodes'])
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, type, locale, response, dbForConsole }: { projectId: string, type: string, locale: string, response: Response, dbForConsole: Database }) => {

        throw new Exception(Exception.GENERAL_NOT_IMPLEMENTED);

        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        const templates = project.getAttribute('templates', {});
        let template = templates[`sms.${type}-${locale}`] || null;

        if (template === null) {
            template = {
                message: Template.fromFile(__dirname + '../../config/locale/templates/sms-base.tpl').render(),
            };
        }

        template['type'] = type;
        template['locale'] = locale;

        response.dynamic(new Document(template), Response.MODEL_SMS_TEMPLATE);
    });

App.get('/v1/projects/:projectId/templates/email/:type/:locale')
    .desc('Get custom email template')
    .groups(['api', 'projects'])
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'getEmailTemplate')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_EMAIL_TEMPLATE)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('type', '', new WhiteList(Config.getParam('locale-templates')?.email ?? []), 'Template type')
    .param('locale', '', (localeCodes: string[]) => new WhiteList(localeCodes), 'Template locale', false, ['localeCodes'])
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, type, locale, response, dbForConsole }: { projectId: string, type: string, locale: string, response: Response, dbForConsole: Database }) => {

        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        const templates = project.getAttribute('templates', {});
        let template = templates[`email.${type}-${locale}`] || null;

        const localeObj = new Locale(locale);
        if (template === null) {
            const messageTemplate = Template.fromFile(__dirname + '/../../config/locale/templates/email-inner-base.tpl');
            messageTemplate
                .setParam('{{hello}}', localeObj.getText(`emails.${type}.hello`))
                .setParam('{{footer}}', localeObj.getText(`emails.${type}.footer`))
                .setParam('{{body}}', localeObj.getText(`emails.${type}.body`), false)
                .setParam('{{thanks}}', localeObj.getText(`emails.${type}.thanks`))
                .setParam('{{signature}}', localeObj.getText(`emails.${type}.signature`))
                .setParam('{{direction}}', localeObj.getText('settings.direction'));
            const message = messageTemplate.render();

            template = {
                message: message,
                subject: localeObj.getText(`emails.${type}.subject`),
                senderEmail: '',
                senderName: ''
            };
        }

        template['type'] = type;
        template['locale'] = locale;

        response.dynamic(new Document(template), Response.MODEL_EMAIL_TEMPLATE);
    });

App.patch('/v1/projects/:projectId/templates/sms/:type/:locale')
    .desc('Update custom SMS template')
    .groups(['api', 'projects'])
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'updateSmsTemplate')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_SMS_TEMPLATE)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('type', '', new WhiteList(Config.getParam('locale-templates')?.sms ?? []), 'Template type')
    .param('locale', '', (localeCodes: string[]) => new WhiteList(localeCodes), 'Template locale', false, ['localeCodes'])
    .param('message', '', new Text(0), 'Template message')
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, type, locale, message, response, dbForConsole }: { projectId: string, type: string, locale: string, message: string, response: Response, dbForConsole: Database }) => {

        throw new Exception(Exception.GENERAL_NOT_IMPLEMENTED);

        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        const templates = project.getAttribute('templates', {});
        templates[`sms.${type}-${locale}`] = {
            message: message
        };

        const updatedProject = await dbForConsole.updateDocument('projects', project.getId(), project.setAttribute('templates', templates));

        response.dynamic(new Document({
            message: message,
            type: type,
            locale: locale,
        }), Response.MODEL_SMS_TEMPLATE);
    });

App.patch('/v1/projects/:projectId/templates/email/:type/:locale')
    .desc('Update custom email templates')
    .groups(['api', 'projects'])
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'updateEmailTemplate')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_PROJECT)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('type', '', new WhiteList(Config.getParam('locale-templates')?.email ?? []), 'Template type')
    .param('locale', '', (localeCodes: string[]) => new WhiteList(localeCodes), 'Template locale', false, ['localeCodes'])
    .param('subject', '', new Text(255), 'Email Subject')
    .param('message', '', new Text(0), 'Template message')
    .param('senderName', '', new Text(255, 0), 'Name of the email sender', true)
    .param('senderEmail', '', new Email(), 'Email of the sender', true)
    .param('replyTo', '', new Email(), 'Reply to email', true)
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, type, locale, subject, message, senderName, senderEmail, replyTo, response, dbForConsole }: { projectId: string, type: string, locale: string, subject: string, message: string, senderName: string, senderEmail: string, replyTo: string, response: Response, dbForConsole: Database }) => {

        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        const templates = project.getAttribute('templates', {});
        templates[`email.${type}-${locale}`] = {
            senderName: senderName,
            senderEmail: senderEmail,
            subject: subject,
            replyTo: replyTo,
            message: message
        };

        const updatedProject = await dbForConsole.updateDocument('projects', project.getId(), project.setAttribute('templates', templates));

        response.dynamic(new Document({
            type: type,
            locale: locale,
            senderName: senderName,
            senderEmail: senderEmail,
            subject: subject,
            replyTo: replyTo,
            message: message
        }), Response.MODEL_EMAIL_TEMPLATE);
    });

App.delete('/v1/projects/:projectId/templates/sms/:type/:locale')
    .desc('Reset custom SMS template')
    .groups(['api', 'projects'])
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'deleteSmsTemplate')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_SMS_TEMPLATE)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('type', '', new WhiteList(Config.getParam('locale-templates')?.sms ?? []), 'Template type')
    .param('locale', '', (localeCodes: string[]) => new WhiteList(localeCodes), 'Template locale', false, ['localeCodes'])
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, type, locale, response, dbForConsole }: { projectId: string, type: string, locale: string, response: Response, dbForConsole: Database }) => {

        throw new Exception(Exception.GENERAL_NOT_IMPLEMENTED);

        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        const templates = project.getAttribute('templates', {});
        const templateKey = `sms.${type}-${locale}`;
        const template = templates[templateKey] || null;

        if (template === null) {
            throw new Exception(Exception.PROJECT_TEMPLATE_DEFAULT_DELETION);
        }

        delete templates[templateKey];

        const updatedProject = await dbForConsole.updateDocument('projects', project.getId(), project.setAttribute('templates', templates));

        response.dynamic(new Document({
            type: type,
            locale: locale,
            message: template.message
        }), Response.MODEL_SMS_TEMPLATE);
    });

App.delete('/v1/projects/:projectId/templates/email/:type/:locale')
    .desc('Reset custom email template')
    .groups(['api', 'projects'])
    .label('scope', 'projects.write')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'projects')
    .label('sdk.method', 'deleteEmailTemplate')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_EMAIL_TEMPLATE)
    .param('projectId', '', new UID(), 'Project unique ID.')
    .param('type', '', new WhiteList(Config.getParam('locale-templates')?.email ?? []), 'Template type')
    .param('locale', '', (localeCodes: string[]) => new WhiteList(localeCodes), 'Template locale', false, ['localeCodes'])
    .inject('response')
    .inject('dbForConsole')
    .action(async ({ projectId, type, locale, response, dbForConsole }: { projectId: string, type: string, locale: string, response: Response, dbForConsole: Database }) => {

        const project = await dbForConsole.getDocument('projects', projectId);

        if (project.isEmpty()) {
            throw new Exception(Exception.PROJECT_NOT_FOUND);
        }

        const templates = project.getAttribute('templates', {});
        const templateKey = `email.${type}-${locale}`;
        const template = templates[templateKey] || null;

        if (template === null) {
            throw new Exception(Exception.PROJECT_TEMPLATE_DEFAULT_DELETION);
        }

        delete templates[templateKey];

        const updatedProject = await dbForConsole.updateDocument('projects', project.getId(), project.setAttribute('templates', templates));

        response.dynamic(new Document({
            type: type,
            locale: locale,
            senderName: template.senderName,
            senderEmail: template.senderEmail,
            subject: template.subject,
            replyTo: template.replyTo,
            message: template.message
        }), Response.MODEL_EMAIL_TEMPLATE);
    });