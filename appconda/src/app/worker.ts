import { Build } from "../Appconda/Event/Build";
import { Certificate } from "../Appconda/Event/Certificate";
import { Delete } from "../Appconda/Event/Delete";
import { Event } from "../Appconda/Event/Event";
import { Func } from "../Appconda/Event/Func";
import { Mail } from "../Appconda/Event/Mail";
import { Messaging } from "../Appconda/Event/Messaging";
import { Migration } from "../Appconda/Event/Migration";
import { Usage } from "../Appconda/Event/Usage";
import { UsageDump } from "../Appconda/Event/UsageDump";
import { Appconda } from "../Appconda/Platform/Appconda";
import { Runtime } from "../Appconda/Tuval/Response/Models/Runtime";
import { Audit } from "../Tuval/Audit";
import { Cache, Sharding } from "../Tuval/Cache";
import { Console } from "../Tuval/CLI";
import { Config } from "../Tuval/Config";
import { Authorization, DateTime, Document } from "../Tuval/Core";
import { Database } from "../Tuval/Database";
import { DSN } from "../Tuval/DSN";
import { Log, Logger } from "../Tuval/Logger";
import { Service } from "../Tuval/Platform/Service";
import { Group } from "../Tuval/Pools";
import { Connection, Message, Server } from "../Tuval/Queue";
import { Registry } from "../Tuval/Registry";
import { register } from "./controllers/general";
import './init';
import { APP_STORAGE_BUILDS, APP_STORAGE_CACHE, APP_STORAGE_FUNCTIONS, APP_STORAGE_UPLOADS } from "./init";
import { getDevice } from "./utils/getDevice";

Authorization.disable();
//Runtime.enableCoroutine(SWOOLE_HOOK_ALL);

Server.setResource('register', () => register);

Server.setResource('dbForConsole', (cache: Cache, register: Registry) => {
    const pools = register.get('pools');
    const database = pools.get('console').pop().getResource();

    const adapter = new Database(database, cache);
    adapter.setNamespace('_console');

    return adapter;
}, ['cache', 'register']);

Server.setResource('project', (message: Message, dbForConsole: Database) => {
    const payload = message.getPayload() ?? [];
    const project = new Document(payload['project'] ?? []);

    if (project.getId() === 'console') {
        return project;
    }

    return dbForConsole.getDocument('projects', project.getId());
}, ['message', 'dbForConsole']);

Server.setResource('dbForProject', (cache: Cache, register: Registry, message: Message, project: Document, dbForConsole: Database) => {
    if (project.isEmpty() || project.getId() === 'console') {
        return dbForConsole;
    }

    const pools = register.get('pools');

    let dsn;
    try {
        dsn = new DSN(project.getAttribute('database'));
    } catch (e) {
        dsn = new DSN('mysql://' + project.getAttribute('database'));
    }

    const adapter = pools.get(dsn.getHost()).pop().getResource();
    const database = new Database(adapter, cache);

    try {
        dsn = new DSN(project.getAttribute('database'));
    } catch (e) {
        dsn = new DSN('mysql://' + project.getAttribute('database'));
    }

    if (dsn.getHost() === process.env._APP_DATABASE_SHARED_TABLES) {
        database.setSharedTables(true).setTenant(Number.parseInt(project.getInternalId())).setNamespace(dsn.getParam('namespace'));
    } else {
        database.setSharedTables(false).setTenant(null).setNamespace('_' + project.getInternalId());
    }

    return database;
}, ['cache', 'register', 'message', 'project', 'dbForConsole']);

Server.setResource('getProjectDB',  (pools: Group, dbForConsole: Database, cache: any) => {
    const databases: Record<string, Database> = {};

    return async (project: Document): Database => {
        if (project.isEmpty() || project.getId() === 'console') {
            return dbForConsole;
        }

        let dsn;
        try {
            dsn = new DSN(project.getAttribute('database'));
        } catch (e) {
            dsn = new DSN('mysql://' + project.getAttribute('database'));
        }

        if (databases[dsn.getHost()]) {
            const database = databases[dsn.getHost()];

            if (dsn.getHost() === process.env._APP_DATABASE_SHARED_TABLES) {
                database.setSharedTables(true).setTenant(Number.parseInt(project.getInternalId())).setNamespace(dsn.getParam('namespace'));
            } else {
                database.setSharedTables(false).setTenant(null).setNamespace('_' + project.getInternalId());
            }

            return database;
        }

        const connection = await pools.get(dsn.getHost()).pop();
        const dbAdapter = connection.getResource();
        const database = new Database(dbAdapter, cache);

        databases[dsn.getHost()] = database;

        if (dsn.getHost() === process.env._APP_DATABASE_SHARED_TABLES) {
            database.setSharedTables(true).setTenant(project.getInternalId()).setNamespace(dsn.getParam('namespace'));
        } else {
            database.setSharedTables(false).setTenant(null).setNamespace('_' + project.getInternalId());
        }

        return database;
    };
}, ['pools', 'dbForConsole', 'cache']);
Server.setResource('abuseRetention', () => {
    return DateTime.addSeconds(new Date(), -1 * parseInt(process.env._APP_MAINTENANCE_RETENTION_ABUSE || '86400', 10));
});

Server.setResource('auditRetention', () => {
    return DateTime.addSeconds(new Date(), -1 * parseInt(process.env._APP_MAINTENANCE_RETENTION_AUDIT || '1209600', 10));
});

Server.setResource('executionRetention', () => {
    return DateTime.addSeconds(new Date(), -1 * parseInt(process.env._APP_MAINTENANCE_RETENTION_EXECUTION || '1209600', 10));
});

Server.setResource('cache', (register: Registry) => {
    const pools = register.get('pools');
    const list = Config.getParam('pools-cache', []);
    const adapters = list.map((value: string) => pools.get(value).pop().getResource());

    return new Cache(new Sharding(adapters));
}, ['register']);

Server.setResource('log', () => new Log());

Server.setResource('queueForUsage', (queue: Connection) => new Usage(queue), ['queue']);
Server.setResource('queueForUsageDump', (queue: Connection) => new UsageDump(queue), ['queue']);
Server.setResource('queue', (pools: Group) => pools.get('queue').pop().getResource(), ['pools']);
Server.setResource('queueForDatabase', (queue: Connection) => new EventDatabase(queue), ['queue']);
Server.setResource('queueForMessaging', (queue: Connection) => new Messaging(queue), ['queue']);
Server.setResource('queueForMails', (queue: Connection) => new Mail(queue), ['queue']);
Server.setResource('queueForBuilds', (queue: Connection) => new Build(queue), ['queue']);
Server.setResource('queueForDeletes', (queue: Connection) => new Delete(queue), ['queue']);
Server.setResource('queueForEvents', (queue: Connection) => new Event(queue), ['queue']);
Server.setResource('queueForAudits', (queue: Connection) => new Audit(queue), ['queue']);
Server.setResource('queueForFunctions', (queue: Connection) => new Func(queue), ['queue']);
Server.setResource('queueForCertificates', (queue: Connection) => new Certificate(queue), ['queue']);
Server.setResource('queueForMigrations', (queue: Connection) => new Migration(queue), ['queue']);
Server.setResource('logger', (register: Registry) => register.get('logger'), ['register']);
Server.setResource('pools', (register: Registry) => register.get('pools'), ['register']);

Server.setResource('deviceForFunctions', (project: Document) => getDevice(`${APP_STORAGE_FUNCTIONS}/app-${project.getId()}`), ['project']);
Server.setResource('deviceForFiles', (project: Document) => getDevice(`${APP_STORAGE_UPLOADS}/app-${project.getId()}`), ['project']);
Server.setResource('deviceForBuilds', (project: Document) => getDevice(`${APP_STORAGE_BUILDS}/app-${project.getId()}`), ['project']);
Server.setResource('deviceForCache', (project: Document) => getDevice(`${APP_STORAGE_CACHE}/app-${project.getId()}`), ['project']);

const pools = register.get('pools');
const platform = new Appconda();
const args = platform.getEnv('argv');

if (!args[1]) {
    Console.error('Missing worker name');
    Console.exit(1);
}

args.shift();
const workerName = args[0];

const queueName = workerName.startsWith('databases')
    ? process.env._APP_QUEUE_NAME || 'database_db_main'
    : process.env._APP_QUEUE_NAME || `v1-${workerName.toLowerCase()}`;
    
try {
    platform.init(Service.TYPE_WORKER, {
        workersNum: parseInt(process.env._APP_WORKERS_NUM || '1', 10),
        connection: pools.get('queue').pop().getResource(),
        workerName: workerName.toLowerCase() ?? null,
        queueName: queueName
    });
} catch (e) {
    Console.error(`${e.message}, File: ${e.file}, Line: ${e.line}`);
}

const worker = platform.getWorker();

worker
    .shutdown()
    .inject('pools')
    .action((pools: Group) => {
        pools.reclaim();
    });

worker
    .error()
    .inject('error')
    .inject('logger')
    .inject('log')
    .inject('pools')
    .inject('project')
    .action((error: any, logger: Logger | null, log: Log, pools: Group, project: Document) => {
        pools.reclaim();
        const version = process.env._APP_VERSION || 'UNKNOWN';

        if (logger) {
            log.setNamespace('appwrite-worker');
            log.setServer(require('os').hostname());
            log.setVersion(version);
            log.setType(Log.TYPE_ERROR);
            log.setMessage(error.message);
            log.setAction(`appwrite-queue-${queueName}`);
            log.addTag('verboseType', error.constructor.name);
            log.addTag('code', error.code);
            log.addTag('projectId', project.getId() ?? 'n/a');
            log.addExtra('file', error.fileName);
            log.addExtra('line', error.lineNumber);
            log.addExtra('trace', error.stack);
            log.addExtra('roles', Authorization.getRoles());

            const isProduction = process.env._APP_ENV === 'production';
            log.setEnvironment(isProduction ? Log.ENVIRONMENT_PRODUCTION : Log.ENVIRONMENT_STAGING);

            const responseCode = logger.addLog(log);
            Console.info(`Usage stats log pushed with status code: ${responseCode}`);
        }

        Console.error(`[Error] Type: ${error.constructor.name}`);
        Console.error(`[Error] Message: ${error.message}`);
        Console.error(`[Error] File: ${error.fileName}`);
        Console.error(`[Error] Line: ${error.lineNumber}`);
    });

worker.workerStart()
    .action(() => {
        Console.info(`Worker ${workerName} started`);
    });

worker.start();