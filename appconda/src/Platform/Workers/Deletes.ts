
import { realpath, rmdir } from "fs";
import {
    DELETE_TYPE_DOCUMENT, DELETE_TYPE_PROJECTS, DELETE_TYPE_FUNCTIONS,
    DELETE_TYPE_DEPLOYMENTS, DELETE_TYPE_USERS, DELETE_TYPE_BUCKETS, DELETE_TYPE_INSTALLATIONS, DELETE_TYPE_RULES, DELETE_TYPE_EXECUTIONS, DELETE_TYPE_AUDIT, DELETE_TYPE_ABUSE, DELETE_TYPE_REALTIME, DELETE_TYPE_SESSIONS, DELETE_TYPE_USAGE, DELETE_TYPE_CACHE_BY_RESOURCE, DELETE_TYPE_CACHE_BY_TIMESTAMP, DELETE_TYPE_SCHEDULES, DELETE_TYPE_TOPIC, DELETE_TYPE_TARGET, DELETE_TYPE_EXPIRED_TARGETS, DELETE_TYPE_SESSION_TARGETS, MESSAGE_TYPE_EMAIL, MESSAGE_TYPE_SMS, MESSAGE_TYPE_PUSH, APP_STORAGE_CACHE, APP_STORAGE_UPLOADS, APP_STORAGE_FUNCTIONS, APP_STORAGE_BUILDS, APP_STORAGE_CERTIFICATES,
    DELETE_TYPE_TEAM_PROJECTS
} from "../../app/init";
import { Abuse } from "../../Tuval/Abuse";
import { Config } from "../../Tuval/Config";
import { DateTime, Document, Exception } from "../../Tuval/Core";
import { Database, Query } from "../../Tuval/Database";
import { DSN } from "../../Tuval/DSN";
import { Log } from "../../Tuval/Logger";
import { Action } from "../../Tuval/Platform/Action";
import { Message } from "../../Tuval/Queue";
import { Device } from "../../Tuval/Storage";
import { Executor } from "../../Appconda/Executor/Executor";
import { Console } from "../../Tuval/CLI";
import { Filesystem } from "../../Tuval/Cache/Adapters/Filesystem";
import { Cache } from "../../Tuval/Cache";
import { getDevice } from "../../app/utils/getDevice";
import { Audit } from "../../Tuval/Audit";
import { TimeLimit } from "../../Tuval/Abuse/Adapters/Database/TimeLimit";
import { Auth } from "../../Tuval/Auth";
import { realpath as fsRealpath, readdir, unlink } from 'fs/promises';
import { stat } from 'fs/promises';
import { join } from 'path';
import { rm } from 'fs/promises';


export class Deletes extends Action {
    public static getName(): string {
        return 'deletes';
    }

    constructor() {
        super();
        this.desc('Deletes worker')
            .inject('message')
            .inject('dbForConsole')
            .inject('getProjectDB')
            .inject('deviceForFiles')
            .inject('deviceForFunctions')
            .inject('deviceForBuilds')
            .inject('deviceForCache')
            .inject('abuseRetention')
            .inject('executionRetention')
            .inject('auditRetention')
            .inject('log')
            .callback((message, dbForConsole, getProjectDB, deviceForFiles, deviceForFunctions, deviceForBuilds, deviceForCache, abuseRetention, executionRetention, auditRetention, log) => {
                this.action(message, dbForConsole, getProjectDB, deviceForFiles, deviceForFunctions, deviceForBuilds, deviceForCache, abuseRetention, executionRetention, auditRetention, log);
            });
    }

    public async action(message: Message, dbForConsole: Database, getProjectDB: Function, deviceForFiles: Device, deviceForFunctions: Device, deviceForBuilds: Device, deviceForCache: Device, abuseRetention: string, executionRetention: string, auditRetention: string, log: Log): Promise<void> {
        const payload = message.getPayload() || {};

        if (!payload) {
            throw new Exception('Missing payload');
        }

        const type = payload['type'] || '';
        const datetime = payload['datetime'] || null;
        const hourlyUsageRetentionDatetime = payload['hourlyUsageRetentionDatetime'] || null;
        const resource = payload['resource'] || null;
        const resourceType = payload['resourceType'] || null;
        const document = new Document(payload['document'] || {});
        const project = new Document(payload['project'] || {});

        log.addTag('projectId', project.getId());
        log.addTag('type', type);

        switch (String(type)) {
            case DELETE_TYPE_DOCUMENT:
                switch (document.getCollection()) {
                    case DELETE_TYPE_PROJECTS:
                        this.deleteProject(dbForConsole, getProjectDB, deviceForFiles, deviceForFunctions, deviceForBuilds, deviceForCache, document);
                        break;
                    case DELETE_TYPE_FUNCTIONS:
                        this.deleteFunction(dbForConsole, getProjectDB, deviceForFunctions, deviceForBuilds, document, project);
                        break;
                    case DELETE_TYPE_DEPLOYMENTS:
                        this.deleteDeployment(getProjectDB, deviceForFunctions, deviceForBuilds, document, project);
                        break;
                    case DELETE_TYPE_USERS:
                        this.deleteUser(getProjectDB, document, project);
                        break;
                    case DELETE_TYPE_BUCKETS:
                        this.deleteBucket(getProjectDB, deviceForFiles, document, project);
                        break;
                    case DELETE_TYPE_INSTALLATIONS:
                        this.deleteInstallation(dbForConsole, getProjectDB, document, project);
                        break;
                    case DELETE_TYPE_RULES:
                        this.deleteRule(dbForConsole, document);
                        break;
                    default:
                        Console.error('No lazy delete operation available for document of type: ' + document.getCollection());
                        break;
                }
                break;
            case DELETE_TYPE_TEAM_PROJECTS:
                this.deleteProjectsByTeam(dbForConsole, getProjectDB, document);
                break;
            case DELETE_TYPE_EXECUTIONS:
                this.deleteExecutionLogs(project, getProjectDB, executionRetention);
                break;
            case DELETE_TYPE_AUDIT:
                if (!project.isEmpty()) {
                    this.deleteAuditLogs(project, getProjectDB, auditRetention);
                }

                if (!document.isEmpty()) {
                    this.deleteAuditLogsByResource(getProjectDB, 'document/' + document.getId(), project);
                }
                break;
            case DELETE_TYPE_ABUSE:
                this.deleteAbuseLogs(project, getProjectDB, abuseRetention);
                break;
            case DELETE_TYPE_REALTIME:
                this.deleteRealtimeUsage(dbForConsole, datetime);
                break;
            case DELETE_TYPE_SESSIONS:
                this.deleteExpiredSessions(project, getProjectDB);
                break;
            case DELETE_TYPE_USAGE:
                this.deleteUsageStats(project, getProjectDB, hourlyUsageRetentionDatetime);
                break;
            case DELETE_TYPE_CACHE_BY_RESOURCE:
                this.deleteCacheByResource(project, getProjectDB, resource, resourceType);
                break;
            case DELETE_TYPE_CACHE_BY_TIMESTAMP:
                this.deleteCacheByDate(project, getProjectDB, datetime);
                break;
            case DELETE_TYPE_SCHEDULES:
                this.deleteSchedules(dbForConsole, getProjectDB, datetime);
                break;
            case DELETE_TYPE_TOPIC:
                this.deleteTopic(project, getProjectDB, document);
                break;
            case DELETE_TYPE_TARGET:
                this.deleteTargetSubscribers(project, getProjectDB, document);
                break;
            case DELETE_TYPE_EXPIRED_TARGETS:
                this.deleteExpiredTargets(project, getProjectDB);
                break;
            case DELETE_TYPE_SESSION_TARGETS:
                this.deleteSessionTargets(project, getProjectDB, document);
                break;
            default:
                throw new Exception('No delete operation for type: ' + String(type));
        }
    }

    private async deleteSchedules(dbForConsole: Database, getProjectDB: Function, datetime: string): Promise<void> {
        this.listByGroup(
            'schedules',
            [
                Query.equal('region', [process.env._APP_REGION || 'default']),
                Query.lessThanEqual('resourceUpdatedAt', datetime),
                Query.equal('active', [false]),
            ],
            dbForConsole,
            async (document: Document) => {
                const project = await dbForConsole.getDocument('projects', document.getAttribute('projectId'));

                if (project.isEmpty()) {
                    await dbForConsole.deleteDocument('schedules', document.getId());
                    Console.success('Deleted schedule for deleted project ' + document.getAttribute('projectId'));
                    return;
                }

                const collectionId = document.getAttribute('resourceType') === 'function' ? 'functions' : 'messages';

                const resource = await getProjectDB(project).getDocument(
                    collectionId,
                    document.getAttribute('resourceId')
                );

                let deleteFlag = true;

                if (document.getAttribute('resourceType') === 'function') {
                    deleteFlag = resource.isEmpty();
                }

                if (deleteFlag) {
                    await dbForConsole.deleteDocument('schedules', document.getId());
                    Console.success('Deleting schedule for ' + document.getAttribute('resourceType') + ' ' + document.getAttribute('resourceId'));
                }
            }
        );
    }

    private async deleteTopic(project: Document, getProjectDB: Function, topic: Document): Promise<void> {
        if (topic.isEmpty()) {
            Console.error('Failed to delete subscribers. Topic not found');
            return;
        }

        this.deleteByGroup(
            'subscribers',
            [
                Query.equal('topicInternalId', [topic.getInternalId()])
            ],
            getProjectDB(project)
        );
    }

    private async deleteTargetSubscribers(project: Document, getProjectDB: Function, target: Document): Promise<void> {
        const dbForProject = getProjectDB(project);

        this.deleteByGroup(
            'subscribers',
            [
                Query.equal('targetInternalId', [target.getInternalId()])
            ],
            dbForProject,
            async (subscriber: Document) => {
                const topicId = subscriber.getAttribute('topicId');
                const topicInternalId = subscriber.getAttribute('topicInternalId');
                const topic = await dbForProject.getDocument('topics', topicId);
                if (!topic.isEmpty() && topic.getInternalId() === topicInternalId) {
                    
                    let totalAttribute;
                    switch (target.getAttribute('providerType')) {
                        case MESSAGE_TYPE_EMAIL:
                            totalAttribute = 'emailTotal';
                            break;
                        case MESSAGE_TYPE_SMS:
                            totalAttribute = 'smsTotal';
                            break;
                        case MESSAGE_TYPE_PUSH:
                            totalAttribute = 'pushTotal';
                            break;
                        default:
                            throw new Exception('Invalid target provider type');
                    }

                    await dbForProject.decreaseDocumentAttribute(
                        'topics',
                        topicId,
                        totalAttribute,
                        0
                    );
                }
            }
        );
    }

    private async deleteExpiredTargets(project: Document, getProjectDB: Function): Promise<void> {
        this.deleteByGroup(
            'targets',
            [
                Query.equal('expired', [true])
            ],
            getProjectDB(project),
            async (target: Document) => {
                await this.deleteTargetSubscribers(project, getProjectDB, target);
            }
        );
    }

    private async deleteSessionTargets(project: Document, getProjectDB: Function, session: Document): Promise<void> {
        this.deleteByGroup(
            'targets',
            [
                Query.equal('sessionInternalId', [session.getInternalId()])
            ],
            getProjectDB(project),
            async (target: Document) => {
                await this.deleteTargetSubscribers(project, getProjectDB, target);
            }
        );
    }

    private async deleteCacheByResource(project: Document, getProjectDB: Function, resource: string, resourceType: string | null = null): Promise<void> {
        const projectId = project.getId();
        const dbForProject = getProjectDB(project);

        const cache = new Cache(
            new Filesystem(APP_STORAGE_CACHE + '/' + 'app-' + projectId)
        );

        const query = [Query.equal('resource', [resource])];
        if (resourceType) {
            query.push(Query.equal('resourceType', [resourceType]));
        }

        this.deleteByGroup(
            'cache',
            query,
            dbForProject,
            async (document: Document) => {
                const path = APP_STORAGE_CACHE + '/' + 'app-' + projectId + '/' + document.getId();

                if (await cache.purge(document.getId())) {
                    Console.success('Deleting cache file: ' + path);
                } else {
                    Console.error('Failed to delete cache file: ' + path);
                }
            }
        );
    }

    private async deleteCacheByDate(project: Document, getProjectDB: Function, datetime: string): Promise<void> {
        const projectId = project.getId();
        const dbForProject = getProjectDB(project);

        const cache = new Cache(
            new Filesystem(APP_STORAGE_CACHE + '/' + 'app-' + projectId)
        );

        const query = [
            Query.lessThan('accessedAt', datetime),
        ];

        this.deleteByGroup(
            'cache',
            query,
            dbForProject,
            async (document: Document) => {
                const path = APP_STORAGE_CACHE + '/' + 'app-' + projectId + '/' + document.getId();

                if (await cache.purge(document.getId())) {
                    Console.success('Deleting cache file: ' + path);
                } else {
                    Console.error('Failed to delete cache file: ' + path);
                }
            }
        );
    }

    private async deleteUsageStats(project: Document, getProjectDB: Function, hourlyUsageRetentionDatetime: string): Promise<void> {
        const dbForProject = getProjectDB(project);
        this.deleteByGroup('stats', [
            Query.lessThan('time', hourlyUsageRetentionDatetime),
            Query.equal('period', ['1h']),
        ], dbForProject);
    }

    public async deleteMemberships(getProjectDB: Function, document: Document, project: Document): Promise<void> {
        const dbForProject = getProjectDB(project);
        const teamInternalId = document.getInternalId();

        this.deleteByGroup(
            'memberships',
            [
                Query.equal('teamInternalId', [teamInternalId])
            ],
            dbForProject,
            async (membership: Document) => {
                const userId = membership.getAttribute('userId');
                await dbForProject.purgeCachedDocument('users', userId);
            }
        );
    }

    private async deleteProjectsByTeam(dbForConsole: Database, getProjectDB: Function, document: Document): Promise<void> {
        const projects = await dbForConsole.find('projects', [
            Query.equal('teamInternalId', [document.getInternalId()])
        ]);

        for (const project of projects) {
            const deviceForFiles = getDevice(APP_STORAGE_UPLOADS + '/app-' + project.getId());
            const deviceForFunctions = getDevice(APP_STORAGE_FUNCTIONS + '/app-' + project.getId());
            const deviceForBuilds = getDevice(APP_STORAGE_BUILDS + '/app-' + project.getId());
            const deviceForCache = getDevice(APP_STORAGE_CACHE + '/app-' + project.getId());

            await this.deleteProject(dbForConsole, getProjectDB, deviceForFiles, deviceForFunctions, deviceForBuilds, deviceForCache, project);
            await dbForConsole.deleteDocument('projects', project.getId());
        }
    }

    private async deleteProject(dbForConsole: Database, getProjectDB: Function, deviceForFiles: Device, deviceForFunctions: Device, deviceForBuilds: Device, deviceForCache: Device, document: Document): Promise<void> {
        const projectInternalId = document.getInternalId();

        let dsn;
        try {
            dsn = new DSN(document.getAttribute('database', 'console'));
        } catch (e) {
            dsn = new DSN('mysql://' + document.getAttribute('database', 'console'));
        }

        const dbForProject = getProjectDB(document);

        const projectCollectionIds = [
            ...Object.keys(Config.getParam('collections', {})['projects']),
            Audit.COLLECTION,
            TimeLimit.COLLECTION,
        ];

        const limit = projectCollectionIds.length + 25;

        while (true) {
            const collections = await dbForProject.listCollections(limit);
            for (const collection of collections) {
                const isSharedTable = dsn.getHost() === process.env._APP_DATABASE_SHARED_TABLES;
                if (!isSharedTable || !projectCollectionIds.includes(collection.getId())) {
                    await dbForProject.deleteCollection(collection.getId());
                } else {
                    await this.deleteByGroup(collection.getId(), [], dbForProject);
                }
            }

            if (dsn.getHost() === process.env._APP_DATABASE_SHARED_TABLES) {
                const collectionsIds = collections.map((collection) => collection.getId());

                if (!collectionsIds.some((id) => !projectCollectionIds.includes(id))) {
                    break;
                }
            } else if (collections.length === 0) {
                break;
            }
        }

        this.deleteByGroup('platforms', [
            Query.equal('projectInternalId', [projectInternalId])
        ], dbForConsole);

        this.deleteByGroup('rules', [
            Query.equal('projectInternalId', [projectInternalId])
        ], dbForConsole, async (document: Document) => {
            await this.deleteRule(dbForConsole, document);
        });

        this.deleteByGroup('keys', [
            Query.equal('projectInternalId', [projectInternalId])
        ], dbForConsole);

        this.deleteByGroup('webhooks', [
            Query.equal('projectInternalId', [projectInternalId])
        ], dbForConsole);

        this.deleteByGroup('installations', [
            Query.equal('projectInternalId', [projectInternalId])
        ], dbForConsole);

        this.deleteByGroup('repositories', [
            Query.equal('projectInternalId', [projectInternalId]),
        ], dbForConsole);

        this.deleteByGroup('vcsComments', [
            Query.equal('projectInternalId', [projectInternalId]),
        ], dbForConsole);

        if (dsn.getHost() !== process.env._APP_DATABASE_SHARED_TABLES) {
            await dbForProject.deleteCollection('_metadata');
        } else {
            await this.deleteByGroup('_metadata', [], dbForProject);
        }

        await deviceForFiles.delete(deviceForFiles.getRoot(), true);
        await deviceForFunctions.delete(deviceForFunctions.getRoot(), true);
        await deviceForBuilds.delete(deviceForBuilds.getRoot(), true);
        await deviceForCache.delete(deviceForCache.getRoot(), true);
    }

    private async deleteUser(getProjectDB: Function, document: Document, project: Document): Promise<void> {
        const userId = document.getId();
        const userInternalId = document.getInternalId();
        const dbForProject = getProjectDB(project);

        this.deleteByGroup('sessions', [
            Query.equal('userInternalId', [userInternalId])
        ], dbForProject);

        await dbForProject.purgeCachedDocument('users', userId);

        this.deleteByGroup('memberships', [
            Query.equal('userInternalId', [userInternalId])
        ], dbForProject, async (document: Document) => {
            if (document.getAttribute('confirm')) {
                const teamId = document.getAttribute('teamId');
                const team = await dbForProject.getDocument('teams', teamId);
                if (!team.isEmpty()) {
                    await dbForProject.decreaseDocumentAttribute('teams', teamId, 'total', 1, 0);
                }
            }
        });

        this.deleteByGroup('tokens', [
            Query.equal('userInternalId', [userInternalId])
        ], dbForProject);

        this.deleteByGroup('identities', [
            Query.equal('userInternalId', [userInternalId])
        ], dbForProject);

        this.deleteByGroup(
            'targets',
            [
                Query.equal('userInternalId', [userInternalId])
            ],
            dbForProject,
            async (target: Document) => {
                await this.deleteTargetSubscribers(project, getProjectDB, target);
            }
        );
    }

    private async deleteExecutionLogs(project: Document, getProjectDB: Function, datetime: string): Promise<void> {
        const dbForProject = getProjectDB(project);
        this.deleteByGroup('executions', [
            Query.lessThan('$createdAt', datetime)
        ], dbForProject);
    }

    private async deleteExpiredSessions(project: Document, getProjectDB: Function): Promise<void> {
        const dbForProject = getProjectDB(project);
        const duration = project.getAttribute('auths', [])['duration'] || Auth.TOKEN_EXPIRATION_LOGIN_LONG;
        const expired = DateTime.addSeconds(new Date(), -1 * duration);

        this.deleteByGroup('sessions', [
            Query.lessThan('$createdAt', expired)
        ], dbForProject);
    }

    private async deleteRealtimeUsage(dbForConsole: Database, datetime: string): Promise<void> {
        this.deleteByGroup('realtime', [
            Query.lessThan('timestamp', datetime)
        ], dbForConsole);
    }

    private async deleteAbuseLogs(project: Document, getProjectDB: Function, abuseRetention: string): Promise<void> {
        const projectId = project.getId();
        const dbForProject = getProjectDB(project);
        const timeLimit = new TimeLimit("", 0, 1, dbForProject);
        const abuse = new Abuse(timeLimit);

        try {
            await abuse.cleanup(abuseRetention);
        } catch (e) {
            Console.error('Failed to delete abuse logs for project ' + projectId + ': ' + e.message);
        }
    }

    private async deleteAuditLogs(project: Document, getProjectDB: Function, auditRetention: string): Promise<void> {
        const projectId = project.getId();
        const dbForProject = getProjectDB(project);
        const audit = new Audit(dbForProject);

        try {
            await audit.cleanup(auditRetention);
        } catch (e) {
            Console.error('Failed to delete audit logs for project ' + projectId + ': ' + e.message);
        }
    }

    private async deleteAuditLogsByResource(getProjectDB: Function, resource: string, project: Document): Promise<void> {
        const dbForProject = getProjectDB(project);

        this.deleteByGroup(Audit.COLLECTION, [
            Query.equal('resource', [resource])
        ], dbForProject);
    }

    private async deleteFunction(dbForConsole: Database, getProjectDB: Function, deviceForFunctions: Device, deviceForBuilds: Device, document: Document, project: Document): Promise<void> {
        const projectId = project.getId();
        const dbForProject = getProjectDB(project);
        const functionId = document.getId();
        const functionInternalId = document.getInternalId();

        Console.info("Deleting rules for function " + functionId);
        this.deleteByGroup('rules', [
            Query.equal('resourceType', ['function']),
            Query.equal('resourceInternalId', [functionInternalId]),
            Query.equal('projectInternalId', [project.getInternalId()])
        ], dbForConsole, async (document: Document) => {
            await this.deleteRule(dbForConsole, document);
        });

        Console.info("Deleting variables for function " + functionId);
        this.deleteByGroup('variables', [
            Query.equal('resourceType', ['function']),
            Query.equal('resourceInternalId', [functionInternalId])
        ], dbForProject);

        Console.info("Deleting deployments for function " + functionId);

        const deploymentInternalIds: string[] = [];
        this.deleteByGroup('deployments', [
            Query.equal('resourceInternalId', [functionInternalId])
        ], dbForProject, async (document: Document) => {
            deploymentInternalIds.push(document.getInternalId());
            await this.deleteDeploymentFiles(deviceForFunctions, document);
        });

        Console.info("Deleting builds for function " + functionId);

        for (const deploymentInternalId of deploymentInternalIds) {
            this.deleteByGroup('builds', [
                Query.equal('deploymentInternalId', [deploymentInternalId])
            ], dbForProject, async (document: Document) => {
                await this.deleteBuildFiles(deviceForBuilds, document);
            });
        }

        Console.info("Deleting executions for function " + functionId);
        this.deleteByGroup('executions', [
            Query.equal('functionInternalId', [functionInternalId])
        ], dbForProject);

        Console.info("Deleting VCS repositories and comments linked to function " + functionId);
        this.deleteByGroup('repositories', [
            Query.equal('projectInternalId', [project.getInternalId()]),
            Query.equal('resourceInternalId', [functionInternalId]),
            Query.equal('resourceType', ['function']),
        ], dbForConsole, async (document: Document) => {
            const providerRepositoryId = document.getAttribute('providerRepositoryId', '');
            const projectInternalId = document.getAttribute('projectInternalId', '');
            this.deleteByGroup('vcsComments', [
                Query.equal('providerRepositoryId', [providerRepositoryId]),
                Query.equal('projectInternalId', [projectInternalId]),
            ], dbForConsole);
        });

        Console.info("Requesting executor to delete all deployment containers for function " + functionId);
        await this.deleteRuntimes(getProjectDB, document, project);
    }

    private async deleteDeploymentFiles(device: Device, deployment: Document): Promise<void> {
        const deploymentId = deployment.getId();
        const deploymentPath = deployment.getAttribute('path', '');

        if (!deploymentPath) {
            Console.info("No deployment files for deployment " + deploymentId);
            return;
        }

        Console.info("Deleting deployment files for deployment " + deploymentId);

        try {
            if (await device.delete(deploymentPath, true)) {
                Console.success('Deleted deployment files: ' + deploymentPath);
            } else {
                Console.error('Failed to delete deployment files: ' + deploymentPath);
            }
        } catch (th) {
            Console.error('Failed to delete deployment files: ' + deploymentPath);
            Console.error('[Error] Type: ' + th.constructor.name);
            Console.error('[Error] Message: ' + th.message);
            Console.error('[Error] File: ' + th.fileName);
            Console.error('[Error] Line: ' + th.lineNumber);
        }
    }

    private async deleteBuildFiles(device: Device, build: Document): Promise<void> {
        const buildId = build.getId();
        const buildPath = build.getAttribute('path', '');

        if (!buildPath) {
            Console.info("No build files for build " + buildId);
            return;
        }

        try {
            if (await device.delete(buildPath, true)) {
                Console.success('Deleted build files: ' + buildPath);
            } else {
                Console.error('Failed to delete build files: ' + buildPath);
            }
        } catch (th) {
            Console.error('Failed to delete deployment files: ' + buildPath);
            Console.error('[Error] Type: ' + th.constructor.name);
            Console.error('[Error] Message: ' + th.message);
            Console.error('[Error] File: ' + th.fileName);
            Console.error('[Error] Line: ' + th.lineNumber);
        }
    }

    private async deleteDeployment(getProjectDB: Function, deviceForFunctions: Device, deviceForBuilds: Device, document: Document, project: Document): Promise<void> {
        const projectId = project.getId();
        const dbForProject = getProjectDB(project);
        const deploymentId = document.getId();
        const deploymentInternalId = document.getInternalId();

        await this.deleteDeploymentFiles(deviceForFunctions, document);

        Console.info("Deleting builds for deployment " + deploymentId);

        this.deleteByGroup('builds', [
            Query.equal('deploymentInternalId', [deploymentInternalId])
        ], dbForProject, async (document: Document) => {
            await this.deleteBuildFiles(deviceForBuilds, document);
        });

        Console.info("Requesting executor to delete deployment container for deployment " + deploymentId);
        await this.deleteRuntimes(getProjectDB, document, project);
    }

    private async deleteById(document: Document, database: Database, callback: Function | null = null): Promise<void> {
        if (await database.deleteDocument(document.getCollection(), document.getId())) {
            Console.success('Deleted document "' + document.getId() + '" successfully');

            if (callback) {
                callback(document);
            }
        } else {
            Console.error('Failed to delete document: ' + document.getId());
        }
    }

    private async deleteByGroup(collection: string, queries: Query[], database: Database, callback: Function | null = null): Promise<void> {
        let count = 0;
        let chunk = 0;
        const limit = 50;
        let sum = limit;

        const executionStart = Date.now();

        while (sum === limit) {
            chunk++;

            let results;
            try {
                results = await database.find(collection, [Query.limit(limit), ...queries]);
            } catch (e) {
                Console.error('Failed to find documents for collection ' + collection + ': ' + e.message);
                return;
            }

            sum = results.length;

            Console.info('Deleting chunk #' + chunk + '. Found ' + sum + ' documents');

            for (const document of results) {
                await this.deleteById(document, database, callback);
                count++;
            }
        }

        const executionEnd = Date.now();

        Console.info("Deleted " + count + " document by group in " + (executionEnd - executionStart) + " milliseconds");
    }

    private async listByGroup(collection: string, queries: Query[], database: Database, callback: Function | null = null): Promise<void> {
        let count = 0;
        let chunk = 0;
        const limit = 50;
        let results: Document[] = [];
        let sum = limit;
        let cursor: Document | null = null;

        const executionStart = Date.now();

        while (sum === limit) {
            chunk++;

            const mergedQueries = [Query.limit(limit), ...queries];
            if (cursor) {
                mergedQueries.push(Query.cursorAfter(cursor));
            }

            results = await database.find(collection, mergedQueries);

            sum = results.length;

            if (sum > 0) {
                cursor = results[sum - 1];
            }

            for (const document of results) {
                if (callback) {
                    callback(document);
                }

                count++;
            }
        }

        const executionEnd = Date.now();

        Console.info("Listed " + count + " document by group in " + (executionEnd - executionStart) + " milliseconds");
    }

    private async deleteRule(dbForConsole: Database, document: Document): Promise<void> {
        const domain = document.getAttribute('domain');
        const directory = APP_STORAGE_CERTIFICATES + '/' + domain;
        const checkTraversal = (await this.realpath(directory)) === directory;

        if (checkTraversal && await this.is_dir(directory)) {
            await this.deleteFilesInDirectory(directory + '/*.*')
            await this.removeDirectory(directory);
            Console.info("Deleted certificate files for " + domain);
        } else {
            Console.info("No certificate files found for " + domain);
        }

        if (document['certificateId']) {
            await dbForConsole.deleteDocument('certificates', document['certificateId']);
        }
    }

    private async deleteBucket(getProjectDB: Function, deviceForFiles: Device, document: Document, project: Document): Promise<void> {
        const dbForProject = getProjectDB(project);

        await dbForProject.deleteCollection('bucket_' + document.getInternalId());

        await deviceForFiles.deletePath(document.getId());
    }

    private async deleteInstallation(dbForConsole: Database, getProjectDB: Function, document: Document, project: Document): Promise<void> {
        const dbForProject = getProjectDB(project);

        this.listByGroup('functions', [
            Query.equal('installationInternalId', [document.getInternalId()])
        ], dbForProject, async (func: Document) => {
            await dbForConsole.deleteDocument('repositories', func.getAttribute('repositoryId'));

            func.setAttribute('installationId', '')
                .setAttribute('installationInternalId', '')
                .setAttribute('providerRepositoryId', '')
                .setAttribute('providerBranch', '')
                .setAttribute('providerSilentMode', false)
                .setAttribute('providerRootDirectory', '')
                .setAttribute('repositoryId', '')
                .setAttribute('repositoryInternalId', '');
            await dbForProject.updateDocument('functions', func.getId(), func);
        });
    }

    private async deleteRuntimes(getProjectDB: Function, func: Document | null, project: Document): Promise<void> {
        const executor = new Executor(process.env._APP_EXECUTOR_HOST);

        const deleteByFunction = async (func: Document) => {
            this.listByGroup(
                'deployments',
                [
                    Query.equal('resourceInternalId', [func.getInternalId()]),
                    Query.equal('resourceType', ['functions']),
                ],
                getProjectDB(project),
                async (deployment: Document) => {
                    const deploymentId = deployment.getId();

                    try {
                        await executor.deleteRuntime(project.getId(), deploymentId);
                        Console.info("Runtime for deployment " + deploymentId + " deleted.");
                    } catch (th) {
                        Console.warning("Runtime for deployment " + deploymentId + " skipped:");
                        Console.error('[Error] Type: ' + th.constructor.name);
                        Console.error('[Error] Message: ' + th.message);
                        Console.error('[Error] File: ' + th.fileName);
                        Console.error('[Error] Line: ' + th.lineNumber);
                    }
                }
            );
        };

        if (func) {
            await deleteByFunction(func);
        } else {
            this.listByGroup(
                'functions',
                [],
                getProjectDB(project),
                async (func: Document) => {
                    await deleteByFunction(func);
                }
            );
        }
    }

    async realpath(directory: string): Promise<string> {
        try {
            const resolvedPath = await fsRealpath(directory);
            return resolvedPath;
        } catch (error) {
            console.error(`Error resolving path for directory: ${directory}`, error);
            throw error;
        }
    }

    async is_dir(directory: string): Promise<boolean> {
        try {
            const stats = await stat(directory);
            return stats.isDirectory();
        } catch (error) {
            console.error(`Error checking if path is a directory: ${directory}`, error);
            return false;
        }
    }

    async deleteFilesInDirectory(directory: string): Promise<void> {
        try {
            const files = await readdir(directory);
            const deletePromises = files.map(file => unlink(join(directory, file)));
            await Promise.all(deletePromises);
            console.log(`Deleted all files in directory: ${directory}`);
        } catch (error) {
            console.error(`Error deleting files in directory: ${directory}`, error);
        }
    }
    async removeDirectory(directory: string): Promise<void> {
        try {
            // Remove the directory and its contents recursively
            await rm(directory, { recursive: true, force: true });
            console.log(`Directory removed: ${directory}`);
        } catch (error) {
            console.error(`Error removing directory: ${directory}`, error);
        }
    }
}