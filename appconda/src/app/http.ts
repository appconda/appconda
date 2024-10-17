import e from "express";
import path from "path";
import { App } from "../Tuval/Http";
import { Database } from "../Tuval/Database";
import { Console } from "../Tuval/CLI";
import { Audit } from "../Tuval/Audit";
import { TimeLimit } from "../Tuval/Abuse/Adapters/Database/TimeLimit";
import { Config } from "../Tuval/Config";
import { Authorization, Document, ID, Permission, Role } from "../Tuval/Core";
import { Files } from "../Tuval/Http/Adapters/express/Files";
import { Request } from "../Appconda/Tuval/Request";
import { Response } from "../Appconda/Tuval/Response";
import { Log, User } from "../Tuval/Logger";
import { register } from "./controllers/general";

const compression = require('compression')
const express = require('express');
const { queryParser } = require('express-query-parser')
const cors = require('cors')
const cookieParser = require('cookie-parser');

/**
 * setupServer
 * 
 * Bu fonksiyon, sunucunun veritabanı bağlantısını kurmak ve gerekli koleksiyonları oluşturmak için kullanılır. 
 * Veritabanı hazır olana kadar belirli sayıda deneme yapar ve ardından gerekli yapılandırmaları gerçekleştirir.
 */
async function setupServer() {
    const app = new App('UTC');

    const pools = await register.get('pools');
    App.setResource('pools', async () => pools);

    // Wait for database to be ready
    let attempts = 0;
    const maxAttempts = 10;
    const sleepDuration = 1000; // 1 second

    let dbForConsole: Database;
    while (attempts < maxAttempts) {
        try {
            attempts++;
            dbForConsole = await app.getResource('dbForConsole');
            break; // Exit loop if successful
        } catch (e) {
            Console.warning(`Database not ready. Retrying connection (${attempts})...`);
            if (attempts >= maxAttempts) {
                throw new Error('Failed to connect to database: ' + e.message);
            }
            await new Promise(resolve => setTimeout(resolve, sleepDuration));
        }
    }

    Console.success('[Setup] - Server database init started...');

    try {
        Console.success('[Setup] - Creating database: appconda...');
        await dbForConsole.create();
    } catch (e) {
        console.log(e)
        Console.success('[Setup] - Skip: metadata table already exists');
    }

    const auditCollection = await dbForConsole.getCollection(Audit.COLLECTION);
    if (auditCollection.isEmpty()) {
        const audit = new Audit(dbForConsole);
        await audit.setup();
    }

    const timelimitCollection = await dbForConsole.getCollection(TimeLimit.COLLECTION);

    if (timelimitCollection.isEmpty()) {
        const adapter = new TimeLimit("", 0, 1, dbForConsole);
        await adapter.setup();
    }

    const collections = Config.getParam('collections', []);
    const consoleCollections = collections['console'];

    for (const [key, collection] of Object.entries(consoleCollections)) {
        if ((collection['$collection'] ?? '') !== Database.METADATA) {
            continue;
        }

        const collectionDB = await dbForConsole.getCollection(key);
        if (!collectionDB.isEmpty()) {
            continue;
        }

        Console.success(`[Setup] - Creating collection: ${collection['$id']}...`);

        const attributes = collection['attributes'].map(attribute => new Document({
            '$id': ID.custom(attribute['$id']),
            'type': attribute['type'],
            'size': attribute['size'],
            'required': attribute['required'],
            'signed': attribute['signed'],
            'array': attribute['array'],
            'filters': attribute['filters'],
            'default': attribute['default'] ?? null,
            'format': attribute['format'] ?? ''
        }));

        const indexes = collection['indexes'].map(index => new Document({
            '$id': ID.custom(index['$id']),
            'type': index['type'],
            'attributes': index['attributes'],
            'lengths': index['lengths'],
            'orders': index['orders'],
        }));

        await dbForConsole.createCollection(key, attributes, indexes);
    }

    const bucketCollection = await dbForConsole.getCollection('buckets');
    const a = await dbForConsole.exists(dbForConsole.getDatabase(), 'bucket_1');
    if (bucketCollection.isEmpty() && !a) {
        Console.success('[Setup] - Creating default bucket...');
        await dbForConsole.createDocument('buckets', new Document({
            '$id': ID.custom('default'),
            '$collection': ID.custom('buckets'),
            'name': 'Default',
            'maximumFileSize': parseInt(process.env._APP_STORAGE_LIMIT || '0', 10),
            'allowedFileExtensions': [],
            'enabled': true,
            'compression': 'gzip',
            'encryption': true,
            'antivirus': true,
            'fileSecurity': true,
            '$permissions': [
                Permission.create(Role.any()),
                Permission.read(Role.any()),
                Permission.update(Role.any()),
                Permission.delete(Role.any()),
            ],
            'search': 'buckets Default',
        }));

        const bucket = await dbForConsole.getDocument('buckets', 'default');

        Console.success('[Setup] - Creating files collection for default bucket...');
        const files = collections['buckets']['files'] ?? [];
        if (files.length === 0) {
            throw new Error('Files collection is not configured.');
        }

        const fileAttributes = files['attributes'].map(attribute => new Document({
            '$id': ID.custom(attribute['$id']),
            'type': attribute['type'],
            'size': attribute['size'],
            'required': attribute['required'],
            'signed': attribute['signed'],
            'array': attribute['array'],
            'filters': attribute['filters'],
            'default': attribute['default'] ?? null,
            'format': attribute['format'] ?? ''
        }));

        const fileIndexes = files['indexes'].map(index => new Document({
            '$id': ID.custom(index['$id']),
            'type': index['type'],
            'attributes': index['attributes'],
            'lengths': index['lengths'],
            'orders': index['orders'],
        }));

        await dbForConsole.createCollection('bucket_' + bucket.getInternalId(), fileAttributes, fileIndexes);
    }

    await pools.reclaim();

    Console.success('[Setup] - Server database init completed...');
}

async function start() {

    await setupServer();
    const app = express();

    app.use(cors({
        credentials: true,
        preflightContinue: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        origin: true
    }));
    app.use(cookieParser());
    app.use(compression());
    app.use(
        queryParser({
            parseNull: true,
            parseUndefined: true,
            parseBoolean: true,
            parseNumber: true
        })
    )

    /*  app.use(cors({
       allowedHeaders: ['x-github-username', 'x-github-repo', ['x-github-token']]
     })) */
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));


   // app.set('services', this.services);
    // app.listen(80, () => console.log("listening on port 80"));

   // this.router = express.Router();
   // app.use('/v1/service', this.router)


    Files.load(path.resolve(__dirname, './console'));


    const _path = path.resolve('./src/app/controllers/general');


    app.use(async (req, res, next) => {
        const request = new Request(req);
        const response = new Response(res);
        App.setResource('expressRequest', async () => req); // Wrap Request in a function
        App.setResource('expressResponse', async () => res);

        const uri = request.getURI();
        if (Files.isFileLoaded(uri)) {
            const time = (60 * 60 * 24 * 365 * 2); // 45 days cache

            response
                .setContentType(Files.getFileMimeType(request.getURI()))
                .addHeader('Cache-Control', 'public, max-age=' + time)
                .addHeader('Expires', new Date(Date.now() + time * 1000).toUTCString())
                .send(Files.getFileContents(request.getURI()));

            return;
        }

        const app = new App('UTC');


        const pools = register.get('pools');
        App.setResource('pools', async () => {
            return pools;
        });


        try {
            Authorization.cleanRoles();
            Authorization.setRole(Role.any().toString());

            app.run(request, response);
        } catch (th) {
            const version = process.env._APP_VERSION || 'UNKNOWN';

            const logger = await app.getResource("logger");
            if (logger) {
                let user;
                try {
                    user = app.getResource('user');
                } catch (_th) {
                    // All good, user is optional information for logger
                }

                const route = app.getRoute();
                const log = await app.getResource("log");

                if (user && !user.isEmpty()) {
                    log.setUser(new User(user.getId()));
                }

                log.setNamespace("http");
                log.setServer(require('os').hostname());
                log.setVersion(version);
                log.setType(Log.TYPE_ERROR);
                log.setMessage(th.message);

                log.addTag('method', route.getMethod());
                log.addTag('url', route.getPath());
                log.addTag('verboseType', th.constructor.name);
                log.addTag('code', th.code);
                log.addTag('hostname', request.getHostname());
                log.addTag('locale', request.getParam('locale') || request.getHeader('x-appconda-locale') || '');

                log.addExtra('file', th.fileName);
                log.addExtra('line', th.lineNumber);
                log.addExtra('trace', th.stack);
                log.addExtra('roles', Authorization.getRoles());

                const action = `${route.getLabel("sdk.namespace", "UNKNOWN_NAMESPACE")}.${route.getLabel("sdk.method", "UNKNOWN_METHOD")}`;
                log.setAction(action);

                const isProduction = process.env._APP_ENV === 'production';
                log.setEnvironment(isProduction ? Log.ENVIRONMENT_PRODUCTION : Log.ENVIRONMENT_STAGING);

                const responseCode = logger.addLog(log);
                Console.info('Log pushed with status code: ' + responseCode);
            }

            Console.error('[Error] Type: ' + th.constructor.name);
            Console.error('[Error] Message: ' + th.message);
            Console.error('[Error] File: ' + th.fileName);
            Console.error('[Error] Line: ' + th.lineNumber);

            response.setStatusCode(500);

            const output = App.isDevelopment() ? {
                message: 'Error: ' + th.message,
                code: 500,
                file: th.fileName,
                line: th.lineNumber,
                trace: th.stack,
                version: version,
            } : {
                message: 'Error: Server Error',
                code: 500,
                version: version,
            };

            response.json(output);
        } finally {
            pools.reclaim();
        }

        //  next()
    })

    app.listen(80, '0.0.0.0');

}

start();