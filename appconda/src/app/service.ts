import { Audit } from "../Appconda/Event/Audit";
import { Build } from "../Appconda/Event/Build";
import { Certificate } from "../Appconda/Event/Certificate";
import { Delete } from "../Appconda/Event/Delete";
import { Event } from "../Appconda/Event/Event";
import { Func } from "../Appconda/Event/Func";
import { Mail } from "../Appconda/Event/Mail";
import { Messaging } from "../Appconda/Event/Messaging";
import { Migration } from "../Appconda/Event/Migration";
import { Database as EventDatabase } from "../Appconda/Event/Database";
import { Usage } from "../Appconda/Event/Usage";
import { UsageDump } from "../Appconda/Event/UsageDump";
import {  AppcondaServicePlatform } from "../Platform/Appconda";
import { CreateDatabase } from "../Platform/Services/database-service/Actions/CreateDatabase";
import { DatabaseServiceAgent } from "../Platform/Services/database-service/DatabaseServiceAgent";
import { ServiceActionExecuter } from "../Platform/Services/ServiceActionExecuter";
import { Cache, Sharding } from "../Tuval/Cache";
import { Console } from "../Tuval/CLI";
import { Config } from "../Tuval/Config";
import { Document } from "../Tuval/Core";
import { Database } from "../Tuval/Database";
import { DSN } from "../Tuval/DSN";
import { Log } from "../Tuval/Logger";
import { Agent } from "../Tuval/Platform/Agent";
import { Group } from "../Tuval/Pools";
import { Connection } from "../Tuval/Queue";
import { Registry } from "../Tuval/Registry";
import { register } from "./init";
import { getDevice } from "./utils/getDevice";


ServiceActionExecuter.setResource('register', () => register);

ServiceActionExecuter.setResource('cache', async (register: Registry) => {
    const pools: Group = register.get('pools');
    const list: any[] = Config.getParam('pools-cache', []);
    const adapters: any[] = [];

    for (let i = 0; i < list.length; i++) {
        const connection = await pools.get(list[i]).pop();
        adapters.push(connection.getResource());
    }

    return new Cache(new Sharding(adapters));
}, ['register']);


ServiceActionExecuter.setResource('dbForConsole', async (cache: Cache, register: Registry) => {
    const pools = register.get('pools');
    const databaseConnection = await pools
        .get('console')
        .pop();
    const database = databaseConnection.getResource();

    const adapter = new Database(database, cache);
    adapter.setNamespace('_console');

    return adapter;
}, ['cache', 'register']);


ServiceActionExecuter.setResource('project', async (payload: any, dbForConsole: Database) => {
    if (typeof payload['project'] === 'string') {
        return await dbForConsole.getDocument('projects', payload['project']);
    } else {
        const project = new Document(payload['project'] || {});

        if (project.getId() === 'console') {
            return project;
        }

        return await dbForConsole.getDocument('projects', project.getId());
    }
}, ['payload', 'dbForConsole']);

ServiceActionExecuter.setResource('dbForProject', async (cache: Cache, register: Registry, project: Document, dbForConsole: Database) => {
    if (project.isEmpty() || project.getId() === 'console') {
        return dbForConsole;
    }

    const pools = register.get('pools');

    let dsn: DSN;
    try {
        dsn = new DSN(project.getAttribute('database'));
    } catch (error) {
        // TODO: Temporary until all projects are using shared tables
        dsn = new DSN('mysql://' + project.getAttribute('database'));
    }

    const connection = await pools
        .get(dsn.getHost())
        .pop()
    const adapter = connection.getResource();

    const database = new Database(adapter, cache);

    try {
        dsn = new DSN(project.getAttribute('database'));
    } catch (error) {
        // TODO: Temporary until all projects are using shared tables
        dsn = new DSN('mysql://' + project.getAttribute('database'));
    }

    if (dsn.getHost() === process.env._APP_DATABASE_SHARED_TABLES) {
        database
            .setSharedTables(true)
            .setTenant(project.getInternalId() as any)
            .setNamespace(dsn.getParam('namespace'));
    } else {
        database
            .setSharedTables(false)
            .setTenant(null)
            .setNamespace('_' + project.getInternalId());
    }

    return database;
}, ['cache', 'register', 'project', 'dbForConsole']);


ServiceActionExecuter.setResource('getProjectDB', async (pools: Group, dbForConsole: Database, cache: any) => {
    const databases: Record<string, Database> = {}; // TODO: @Meldiron This should probably be responsibility of appconda-php/pools

    return async (project: Document): Promise<Database> => {
        if (project.isEmpty() || project.getId() === 'console') {
            return dbForConsole;
        }

        let dsn: DSN;
        try {
            dsn = new DSN(project.getAttribute('database'));
        } catch (error) {
            // TODO: Temporary until all projects are using shared tables
            dsn = new DSN('mysql://' + project.getAttribute('database'));
        }

        if (databases[dsn.getHost()]) {
            const database = databases[dsn.getHost()];

            if (dsn.getHost() === process.env._APP_DATABASE_SHARED_TABLES) {
                database
                    .setSharedTables(true)
                    .setTenant(project.getInternalId() as any)
                    .setNamespace(dsn.getParam('namespace'));
            } else {
                database
                    .setSharedTables(false)
                    .setTenant(null)
                    .setNamespace('_' + project.getInternalId());
            }

            return database;
        }

        const connection = await pools
            .get(dsn.getHost())
            .pop();
        const dbAdapter = connection.getResource();

        const database = new Database(dbAdapter, cache);

        databases[dsn.getHost()] = database;

        if (dsn.getHost() === process.env._APP_DATABASE_SHARED_TABLES) {
            database
                .setSharedTables(true)
                .setTenant(project.getInternalId() as any)
                .setNamespace(dsn.getParam('namespace'));
        } else {
            database
                .setSharedTables(false)
                .setTenant(null)
                .setNamespace('_' + project.getInternalId());
        }

        return database;
    };
}, ['pools', 'dbForConsole', 'cache']);

ServiceActionExecuter.setResource('abuseRetention', async () => {
    return new Date(Date.now() - (Number(process.env._APP_MAINTENANCE_RETENTION_ABUSE) || 86400) * 1000);
});

ServiceActionExecuter.setResource('auditRetention', async () => {
    return new Date(Date.now() - (Number(process.env._APP_MAINTENANCE_RETENTION_AUDIT) || 1209600) * 1000);
});

ServiceActionExecuter.setResource('executionRetention', async () => {
    return new Date(Date.now() - (Number(process.env._APP_MAINTENANCE_RETENTION_EXECUTION) || 1209600) * 1000);
});

ServiceActionExecuter.setResource('log', async () => new Log());

ServiceActionExecuter.setResource('queueForUsage', async (queue: Connection) => {
    return new Usage(queue);
}, ['queue']);

ServiceActionExecuter.setResource('queueForUsageDump', async (queue: Connection) => {
    return new UsageDump(queue);
}, ['queue']);

ServiceActionExecuter.setResource('queue', async (pools: Group) => {
    const connection = await pools.get('queue').pop()
    const adapter = connection.getResource();
    return adapter;
}, ['pools']);

ServiceActionExecuter.setResource('queueForDatabase', async (queue: Connection) => {
    return new EventDatabase(queue);
}, ['queue']);

ServiceActionExecuter.setResource('queueForMessaging', async (queue: Connection) => {
    return new Messaging(queue);
}, ['queue']);

ServiceActionExecuter.setResource('queueForMails', async (queue: Connection) => {
    return new Mail(queue);
}, ['queue']);

ServiceActionExecuter.setResource('queueForBuilds', async (queue: Connection) => {
    return new Build(queue);
}, ['queue']);

ServiceActionExecuter.setResource('queueForDeletes', async (queue: Connection) => {
    return new Delete(queue);
}, ['queue']);

ServiceActionExecuter.setResource('queueForEvents', async (queue: Connection) => {
    return new Event(queue);
}, ['queue']);

ServiceActionExecuter.setResource('queueForAudits', async (queue: Connection) => {
    return new Audit(queue);
}, ['queue']);

ServiceActionExecuter.setResource('queueForFunctions', async (queue: Connection) => {
    return new Func(queue);
}, ['queue']);

ServiceActionExecuter.setResource('queueForCertificates', async (queue: Connection) => {
    return new Certificate(queue);
}, ['queue']);

ServiceActionExecuter.setResource('queueForMigrations', async (queue: Connection) => {
    return new Migration(queue);
}, ['queue']);

ServiceActionExecuter.setResource('logger', async (register: Registry) => {
    return register.get('logger');
}, ['register']);

ServiceActionExecuter.setResource('pools', async (register: Registry) => {
    return register.get('pools');
}, ['register']);

ServiceActionExecuter.setResource('deviceForFunctions', async (project: Document) => {
    return getDevice(`${process.env.APP_STORAGE_FUNCTIONS}/app-${project.getId()}`);
}, ['project']);

ServiceActionExecuter.setResource('deviceForFiles', async (project: Document) => {
    return getDevice(`${process.env.APP_STORAGE_UPLOADS}/app-${project.getId()}`);
}, ['project']);

ServiceActionExecuter.setResource('deviceForBuilds', async (project: Document) => {
    return getDevice(`${process.env.APP_STORAGE_BUILDS}/app-${project.getId()}`);
}, ['project']);

ServiceActionExecuter.setResource('deviceForCache', async (project: Document) => {
    return getDevice(`${process.env.APP_STORAGE_CACHE}/app-${project.getId()}`);
}, ['project']);



const start = async () => {
    const pools = register.get('pools');

    const platform = new AppcondaServicePlatform();
    

    try {
        platform.init(Agent.TYPE_SERVICE);
        platform.start();
    } catch (e) {
        Console.error(`${e.message}, File: ${e.file}, Line: ${e.line}`);
    }

   /*  const action = platform.getServiceAction(DatabaseService.NAME, CreateDatabase.NAME);

    action.call({
        project: '670ccd2600045e926e17',
        name: 'test'
    }) */

    /*  action.workerStart()
         .action(() => {
             Console.info(`Service ${workerName} started`);
         });
 
         action.shutdown()
         .action(() => {
             Console.info(`Service ${workerName} shutdown`);
         }); */

    // action.start();



}

start();
