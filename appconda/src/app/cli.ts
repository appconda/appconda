import { Certificate } from "../Appconda/Event/Certificate";
import { Delete } from "../Appconda/Event/Delete";
import { Func } from "../Appconda/Event/Func";
import { AppcondaException } from "../Appconda/Extend/Exception";
import { Appconda } from "../Platform/Appconda";
import { Cache, Sharding } from "../Tuval/Cache";
import { Console } from "../Tuval/CLI";
import { CLI } from "../Tuval/CLI/CLI";
import { Config } from "../Tuval/Config";
import { Authorization, Document } from "../Tuval/Core";
import { Database } from "../Tuval/Database";
import { DSN } from "../Tuval/DSN";
import { Log } from "../Tuval/Logger";
import { Agent } from "../Tuval/Platform/Agent";
import { Group } from "../Tuval/Pools";
import { Connection } from "../Tuval/Queue";
import { Registry } from "../Tuval/Registry";
import { Runtimes } from "../Tuval/Runtimes/Runtimes";
import { System } from "../Tuval/System/System";
import { register } from "./init";


// CLI için mimariden bağımsız hale getiriyoruz
Config.setParam('runtimes', new Runtimes('v4').getAll(false));

// Çalışma zamanlarını gecersiz hale getiriyoruz
require('./controllers/general');

Authorization.disable();

CLI.setResource('register', () => register);

CLI.setResource('cache', async (pools) => {
    const adapters = [];
    const list = Config.getParam('pools-cache', []);
    for (let i = 0; i < list.length; i++) {
        const connection = await pools.get(list[i]).pop();
        adapters.push(connection.getResource());
    }
    return new Cache(new Sharding(adapters));
}, ['pools']);

CLI.setResource('pools', (register: Registry) => register.get('pools'), ['register']);

CLI.setResource('dbForConsole', (pools, cache) => {
    const sleep = 3;
    const maxAttempts = 5;
    let attempts = 0;
    let ready = false;

    let dbForConsole;
    do {
        attempts++;
        try {
            const dbAdapter = pools.get('console').pop().getResource();
            dbForConsole = new Database(dbAdapter, cache);

            dbForConsole.setNamespace('_console')
                .setMetadata('host', System.getHostname())
                .setMetadata('project', 'console');

            const collections = Config.getParam('collections', [])['console'];
            const last = collections[collections.length - 1];

            if (!dbForConsole.exists(dbForConsole.getDatabase(), last)) {
                throw new Error('Tables not ready yet.');
            }

            ready = true;
        } catch (err) {
            Console.warning(err.message);
            pools.get('console').reclaim();
            //  System.sleep(sleep);
        }
    } while (attempts < maxAttempts && !ready);

    if (!ready) {
        throw new Error("Console is not ready yet. Please try again later.");
    }

    return dbForConsole;
}, ['pools', 'cache']);

CLI.setResource('getProjectDB', (pools: Group, dbForConsole: Database, cache) => {
    const databases = {};

    return async (project: Document) => {
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

            if (dsn.getHost() === System.getEnv('_APP_DATABASE_SHARED_TABLES', '')) {
                database.setSharedTables(true)
                    .setTenant(project.getInternalId())
                    .setNamespace(dsn.getParam('namespace'));
            } else {
                database.setSharedTables(false)
                    .setTenant(null)
                    .setNamespace('_' + project.getInternalId());
            }

            return database;
        }

        const connection = await pools.get(dsn.getHost()).pop();
        const dbAdapter = connection.getResource();
        const database = new Database(dbAdapter, cache);

        databases[dsn.getHost()] = database;

        if (dsn.getHost() === System.getEnv('_APP_DATABASE_SHARED_TABLES', '')) {
            database.setSharedTables(true)
                .setTenant(project.getInternalId() as any)
                .setNamespace(dsn.getParam('namespace'));
        } else {
            database.setSharedTables(false)
                .setTenant(null)
                .setNamespace('_' + project.getInternalId());
        }

        database.setMetadata('host', System.getHostname())
            .setMetadata('project', project.getId());

        return database;
    };
}, ['pools', 'dbForConsole', 'cache']);

CLI.setResource('queue', async (pools: Group) => {
    const connection = await pools.get('queue').pop();
    return connection.getResource();
}, ['pools']);

CLI.setResource('queueForFunctions', (queue: Connection) => new Func(queue), ['queue']);
CLI.setResource('queueForDeletes', (queue: Connection) => new Delete(queue), ['queue']);
CLI.setResource('queueForCertificates', (queue: Connection) => new Certificate(queue), ['queue']);
CLI.setResource('logError', (register: Registry) => (error: any, namespace: string, action: string) => {
    const logger = register.get('logger');

    if (logger) {
        const version = System.getEnv('_APP_VERSION', 'UNKNOWN');

        const log = new Log();
        log.setNamespace(namespace);
        log.setServer(System.getHostname());
        log.setVersion(version);
        log.setType(Log.TYPE_ERROR);
        log.setMessage(error.message);

        log.addTag('code', error.code);
        log.addTag('verboseType', error.constructor.name);

        log.addExtra('file', error.fileName);
        log.addExtra('line', error.lineNumber);
        log.addExtra('trace', error.stack);

        log.setAction(action);

        const isProduction = System.getEnv('_APP_ENV', 'development') === 'production';
        log.setEnvironment(isProduction ? Log.ENVIRONMENT_PRODUCTION : Log.ENVIRONMENT_STAGING);

        const responseCode = logger.addLog(log);
        Console.info('Usage stats log pushed with status code: ' + responseCode);
    }

    Console.warning("Failed: " + error.message);
    Console.warning(error.stack);
}, ['register']);

const platform = new Appconda();
platform.init(Agent.TYPE_TASK);

const cli = platform.getCli();

cli.error().inject('error').action((error: Error) => {
    Console.error(error.message);
});

cli.run();