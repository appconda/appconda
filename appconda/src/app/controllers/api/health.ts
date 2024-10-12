import { Event } from "../../../Appconda/Event/Event";
import { Response } from "../../../Appconda/Tuval/Response";
import { Config } from "../../../Tuval/Config";
import { Document, Domain, Integer, Multiple, Text, WhiteList } from "../../../Tuval/Core";
import { PublicDomain } from "../../../Tuval/Domains";
import { App } from "../../../Tuval/Http";
import { Group } from "../../../Tuval/Pools";
import { Client, Connection } from "../../../Tuval/Queue";
import { Registry } from "../../../Tuval/Registry";
import { Device, Local, Storage } from "../../../Tuval/Storage";
import { APP_AUTH_TYPE_KEY, APP_STORAGE_CACHE, APP_STORAGE_CERTIFICATES, APP_STORAGE_CONFIG, APP_STORAGE_UPLOADS, APP_VERSION_STABLE } from "../../init";
import { promises as fs } from 'fs';
import * as path from 'path';

async function isReadable(path: string): Promise<boolean> {
    try {
        await fs.access(path, fs.constants.R_OK);
        return true; // The directory is readable
    } catch (error) {
        return false; // The directory is not readable
    }
}


async function isWritable(dir: string): Promise<boolean> {
    const testFilePath = path.join(dir, 'test-write-access.tmp');

    try {
        // Try to write a temporary file to the directory
        await fs.writeFile(testFilePath, 'test');
        // If successful, delete the temporary file
        await fs.unlink(testFilePath);
        return true; // The directory is writable
    } catch (error) {
        return false; // The directory is not writable
    }
}


App.get('/v1/health')
    .desc('Get HTTP')
    .groups(['api', 'health'])
    .label('scope', 'health.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'health')
    .label('sdk.method', 'get')
    .label('sdk.description', '/docs/references/health/get.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_HEALTH_STATUS)
    .inject('response')
    .action((response: Response) => {
        const output = {
            name: 'http',
            status: 'pass',
            ping: 0
        };

        response.dynamic(new Document(output), Response.MODEL_HEALTH_STATUS);
    });


App.get('/v1/health/version')
    .desc('Get version')
    .groups(['api', 'health'])
    .label('scope', 'public')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_HEALTH_VERSION)
    .inject('response')
    .action((response: Response) => {
        response.dynamic(new Document({ version: APP_VERSION_STABLE }), Response.MODEL_HEALTH_VERSION);
    });


App.get('/v1/health/db')
    .desc('Get DB')
    .groups(['api', 'health'])
    .label('scope', 'health.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'health')
    .label('sdk.method', 'getDB')
    .label('sdk.description', '/docs/references/health/get-db.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_HEALTH_STATUS)
    .inject('response')
    .inject('pools')
    .action(async (response: Response, pools: Group) => {
        const output: Document[] = [];
        const failure: string[] = [];

        const configs = {
            'Console.DB': Config.getParam('pools-console'),
            'Projects.DB': Config.getParam('pools-database'),
        };

        for (const [key, config] of Object.entries(configs)) {
            for (const database of config) {
                try {
                    const connection = await pools.get(database).pop();
                    const adapter = connection.getResource();
                    const checkStart = performance.now();

                    if (await adapter.ping()) {
                        output.push(new Document({
                            name: `${key} (${database})`,
                            status: 'pass',
                            ping: Math.round((performance.now() - checkStart) / 1000)
                        }));
                    } else {
                        failure.push(database);
                    }
                } catch (error) {
                    failure.push(database);
                }
            }
        }

        if (failure.length > 0) {
            throw new Error(`DB failure on: ${failure.join(", ")}`);
        }

        response.dynamic(new Document({
            statuses: output,
            total: output.length,
        }), Response.MODEL_HEALTH_STATUS_LIST);
    });


App.get('/v1/health/cache')
    .desc('Get cache')
    .groups(['api', 'health'])
    .label('scope', 'health.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'health')
    .label('sdk.method', 'getCache')
    .label('sdk.description', '/docs/references/health/get-cache.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_HEALTH_STATUS)
    .inject('response')
    .inject('pools')
    .action(async (response: Response, pools: Group) => {
        const output: Document[] = [];

        const configs = {
            'Cache': Config.getParam('pools-cache'),
        };

        for (const [key, config] of Object.entries(configs)) {
            for (const database of config) {
                const checkStart = performance.now();
                try {
                    const connection = await pools.get(database).pop();
                    const adapter = connection.getResource();

                    if (await adapter.ping()) {
                        output.push(new Document({
                            name: `${key} (${database})`,
                            status: 'pass',
                            ping: Math.round((performance.now() - checkStart) / 1000)
                        }));
                    } else {
                        output.push(new Document({
                            name: `${key} (${database})`,
                            status: 'fail',
                            ping: Math.round((performance.now() - checkStart) / 1000)
                        }));
                    }
                } catch (error) {
                    output.push(new Document({
                        name: `${key} (${database})`,
                        status: 'fail',
                        ping: Math.round((performance.now() - checkStart) / 1000)
                    }));
                }
            }
        }

        response.dynamic(new Document({
            statuses: output,
            total: output.length,
        }), Response.MODEL_HEALTH_STATUS_LIST);
    });


App.get('/v1/health/queue')
    .desc('Get queue')
    .groups(['api', 'health'])
    .label('scope', 'health.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'health')
    .label('sdk.method', 'getQueue')
    .label('sdk.description', '/docs/references/health/get-queue.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_HEALTH_STATUS)
    .inject('response')
    .inject('pools')
    .action(async (response: Response, pools: Group) => {
        const output: Document[] = [];

        const configs = {
            'Queue': Config.getParam('pools-queue'),
        };

        for (const [key, config] of Object.entries(configs)) {
            for (const database of config) {
                const checkStart = performance.now();
                try {
                    const connection = await pools.get(database).pop();
                    const adapter = connection.getResource();

                    if (await adapter.ping()) {
                        output.push(new Document({
                            name: `${key} (${database})`,
                            status: 'pass',
                            ping: Math.round((performance.now() - checkStart) / 1000)
                        }));
                    } else {
                        output.push(new Document({
                            name: `${key} (${database})`,
                            status: 'fail',
                            ping: Math.round((performance.now() - checkStart) / 1000)
                        }));
                    }
                } catch (error) {
                    output.push(new Document({
                        name: `${key} (${database})`,
                        status: 'fail',
                        ping: Math.round((performance.now() - checkStart) / 1000)
                    }));
                }
            }
        }

        response.dynamic(new Document({
            statuses: output,
            total: output.length,
        }), Response.MODEL_HEALTH_STATUS_LIST);
    });


App.get('/v1/health/pubsub')
    .desc('Get pubsub')
    .groups(['api', 'health'])
    .label('scope', 'health.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'health')
    .label('sdk.method', 'getPubSub')
    .label('sdk.description', '/docs/references/health/get-pubsub.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_HEALTH_STATUS)
    .inject('response')
    .inject('pools')
    .action(async (response: Response, pools: Group) => {
        const output: Document[] = [];

        const configs = {
            'PubSub': Config.getParam('pools-pubsub'),
        };

        for (const [key, config] of Object.entries(configs)) {
            for (const database of config) {
                const checkStart = performance.now();
                try {
                    const connection = await pools.get(database).pop();
                    const adapter = connection.getResource();

                    if (await adapter.ping()) {
                        output.push(new Document({
                            name: `${key} (${database})`,
                            status: 'pass',
                            ping: Math.round((performance.now() - checkStart) / 1000)
                        }));
                    } else {
                        output.push(new Document({
                            name: `${key} (${database})`,
                            status: 'fail',
                            ping: Math.round((performance.now() - checkStart) / 1000)
                        }));
                    }
                } catch (error) {
                    output.push(new Document({
                        name: `${key} (${database})`,
                        status: 'fail',
                        ping: Math.round((performance.now() - checkStart) / 1000)
                    }));
                }
            }
        }

        response.dynamic(new Document({
            statuses: output,
            total: output.length,
        }), Response.MODEL_HEALTH_STATUS_LIST);
    });


App.get('/v1/health/time')
    .desc('Get time')
    .groups(['api', 'health'])
    .label('scope', 'health.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'health')
    .label('sdk.method', 'getTime')
    .label('sdk.description', '/docs/references/health/get-time.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_HEALTH_TIME)
    .inject('response')
    .action(async (response: Response) => {
        const host = 'http://worldtimeapi.org/api/timezone/Etc/UTC'; // HTTP time API
        const gap = 60; // Allow [X] seconds gap

        try {
            const res = await fetch(host);
            const data = await res.json();

            const remoteTime = new Date(data.utc_datetime).getTime() / 1000; // Convert to Unix timestamp
            const localTime = Math.floor(Date.now() / 1000); // Local Unix timestamp
            const diff = remoteTime - localTime;

            if (diff > gap || diff < -gap) {
                throw new Error('Server time gaps detected');
            }

            const output = {
                remoteTime: remoteTime,
                localTime: localTime,
                diff: diff
            };

            response.dynamic(new Document(output), Response.MODEL_HEALTH_TIME);
        } catch (error) {
            throw new Error('Error fetching time: ' + error.message);
        }
    });

// src/app/controllers/api/health.ts

App.get('/v1/health/queue/webhooks')
    .desc('Get webhooks queue')
    .groups(['api', 'health'])
    .label('scope', 'health.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'health')
    .label('sdk.method', 'getQueueWebhooks')
    .label('sdk.description', '/docs/references/health/get-queue-webhooks.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_HEALTH_QUEUE)
    .param('threshold', 5000, new Integer(true), 'Queue size threshold. When hit (equal or higher), endpoint returns server error. Default value is 5000.', true)
    .inject('queue')
    .inject('response')
    .action(async (threshold: number | string, queue: Connection, response: Response) => {
        threshold = parseInt(threshold as string, 10);

        const client = new Client(Event.WEBHOOK_QUEUE_NAME, queue);
        const size = await client.getQueueSize();

        if (size >= threshold) {
            throw new Error(`Queue size threshold hit. Current size is ${size} and threshold is ${threshold}.`);
        }

        response.dynamic(new Document({ size }), Response.MODEL_HEALTH_QUEUE);
    });

App.get('/v1/health/queue/logs')
    .desc('Get logs queue')
    .groups(['api', 'health'])
    .label('scope', 'health.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'health')
    .label('sdk.method', 'getQueueLogs')
    .label('sdk.description', '/docs/references/health/get-queue-logs.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_HEALTH_QUEUE)
    .param('threshold', 5000, new Integer(true), 'Queue size threshold. When hit (equal or higher), endpoint returns server error. Default value is 5000.', true)
    .inject('queue')
    .inject('response')
    .action(async (threshold: number | string, queue: Connection, response: Response) => {
        threshold = parseInt(threshold as string, 10);

        const client = new Client(Event.AUDITS_QUEUE_NAME, queue);
        const size = await client.getQueueSize();

        if (size >= threshold) {
            throw new Error(`Queue size threshold hit. Current size is ${size} and threshold is ${threshold}.`);
        }

        response.dynamic(new Document({ size }), Response.MODEL_HEALTH_QUEUE);
    });


App.get('/v1/health/certificate')
    .desc('Get the SSL certificate for a domain')
    .groups(['api', 'health'])
    .label('scope', 'health.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'health')
    .label('sdk.method', 'getCertificate')
    .label('sdk.description', '/docs/references/health/get-certificate.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_HEALTH_CERTIFICATE)
    .param('domain', null, new Multiple([new Domain(), new PublicDomain()]), Multiple.TYPE_STRING, 'Domain name' as any)
    .inject('response')
    .action(async (domain: string, response: Response) => {
        if (new URL(domain).protocol === 'http:') {
            domain = new URL(domain).host;
        }

        const sslContext = {
            method: 'GET',
            headers: {
                'Host': domain,
            },
        };

        try {
            const res = await fetch(`https://${domain}`, sslContext);
            const cert = res.headers.get('certificate'); // This is a placeholder; actual implementation may vary

            if (!cert) {
                throw new Error('Invalid host or no certificate found');
            }

            const certificatePayload = JSON.parse(cert); // Assuming the certificate is returned in JSON format

            const sslExpiration = new Date(certificatePayload.validTo * 1000).getTime();
            const status = sslExpiration < Date.now() ? 'fail' : 'pass';

            if (status === 'fail') {
                throw new Error('Certificate expired');
            }

            response.dynamic(new Document({
                name: certificatePayload.name,
                subjectSN: certificatePayload.subject.CN,
                issuerOrganisation: certificatePayload.issuer.O,
                validFrom: certificatePayload.validFrom,
                validTo: certificatePayload.validTo,
                signatureTypeSN: certificatePayload.signatureTypeSN,
            }), Response.MODEL_HEALTH_CERTIFICATE);
        } catch (error) {
            throw new Error('Error fetching certificate: ' + error.message);
        }
    });


App.get('/v1/health/queue/certificates')
    .desc('Get certificates queue')
    .groups(['api', 'health'])
    .label('scope', 'health.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'health')
    .label('sdk.method', 'getQueueCertificates')
    .label('sdk.description', '/docs/references/health/get-queue-certificates.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_HEALTH_QUEUE)
    .param('threshold', 5000, new Integer(true), 'Queue size threshold. When hit (equal or higher), endpoint returns server error. Default value is 5000.', true)
    .inject('queue')
    .inject('response')
    .action(async (threshold: number | string, queue: Connection, response: Response) => {
        threshold = parseInt(threshold as string, 10);

        const client = new Client(Event.CERTIFICATES_QUEUE_NAME, queue);
        const size = await client.getQueueSize();

        if (size >= threshold) {
            throw new Error(`Queue size threshold hit. Current size is ${size} and threshold is ${threshold}.`);
        }

        response.dynamic(new Document({ size }), Response.MODEL_HEALTH_QUEUE);
    });


App.get('/v1/health/queue/builds')
    .desc('Get builds queue')
    .groups(['api', 'health'])
    .label('scope', 'health.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'health')
    .label('sdk.method', 'getQueueBuilds')
    .label('sdk.description', '/docs/references/health/get-queue-builds.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_HEALTH_QUEUE)
    .param('threshold', 5000, new Integer(true), 'Queue size threshold. When hit (equal or higher), endpoint returns server error. Default value is 5000.', true)
    .inject('queue')
    .inject('response')
    .action(async (threshold: number | string, queue: Connection, response: Response) => {
        threshold = parseInt(threshold as string, 10);

        const client = new Client(Event.BUILDS_QUEUE_NAME, queue);
        const size = await client.getQueueSize();

        if (size >= threshold) {
            throw new Error(`Queue size threshold hit. Current size is ${size} and threshold is ${threshold}.`);
        }

        response.dynamic(new Document({ size }), Response.MODEL_HEALTH_QUEUE);
    });


App.get('/v1/health/queue/databases')
    .desc('Get databases queue')
    .groups(['api', 'health'])
    .label('scope', 'health.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'health')
    .label('sdk.method', 'getQueueDatabases')
    .label('sdk.description', '/docs/references/health/get-queue-databases.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_HEALTH_QUEUE)
    .param('name', 'database_db_main', new Text(256), 'Queue name for which to check the queue size', true)
    .param('threshold', 5000, new Integer(true), 'Queue size threshold. When hit (equal or higher), endpoint returns server error. Default value is 5000.', true)
    .inject('queue')
    .inject('response')
    .action(async (name: string, threshold: number | string, queue: Connection, response: Response) => {
        threshold = parseInt(threshold as string, 10);

        const client = new Client(name, queue);
        const size = await client.getQueueSize();

        if (size >= threshold) {
            throw new Error(`Queue size threshold hit. Current size is ${size} and threshold is ${threshold}.`);
        }

        response.dynamic(new Document({ size }), Response.MODEL_HEALTH_QUEUE);
    });


App.get('/v1/health/queue/deletes')
    .desc('Get deletes queue')
    .groups(['api', 'health'])
    .label('scope', 'health.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'health')
    .label('sdk.method', 'getQueueDeletes')
    .label('sdk.description', '/docs/references/health/get-queue-deletes.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_HEALTH_QUEUE)
    .param('threshold', 5000, new Integer(true), 'Queue size threshold. When hit (equal or higher), endpoint returns server error. Default value is 5000.', true)
    .inject('queue')
    .inject('response')
    .action(async (threshold: number | string, queue: Connection, response: Response) => {
        threshold = parseInt(threshold as string, 10);

        const client = new Client(Event.DELETE_QUEUE_NAME, queue);
        const size = await client.getQueueSize();

        if (size >= threshold) {
            throw new Error(`Queue size threshold hit. Current size is ${size} and threshold is ${threshold}.`);
        }

        response.dynamic(new Document({ size }), Response.MODEL_HEALTH_QUEUE);
    });


App.get('/v1/health/queue/mails')
    .desc('Get mails queue')
    .groups(['api', 'health'])
    .label('scope', 'health.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'health')
    .label('sdk.method', 'getQueueMails')
    .label('sdk.description', '/docs/references/health/get-queue-mails.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_HEALTH_QUEUE)
    .param('threshold', 5000, new Integer(true), 'Queue size threshold. When hit (equal or higher), endpoint returns server error. Default value is 5000.', true)
    .inject('queue')
    .inject('response')
    .action(async (threshold: number | string, queue: Connection, response: Response) => {
        threshold = parseInt(threshold as string, 10);

        const client = new Client(Event.MAILS_QUEUE_NAME, queue);
        const size = await client.getQueueSize();

        if (size >= threshold) {
            throw new Error(`Queue size threshold hit. Current size is ${size} and threshold is ${threshold}.`);
        }

        response.dynamic(new Document({ size }), Response.MODEL_HEALTH_QUEUE);
    });


App.get('/v1/health/queue/messaging')
    .desc('Get messaging queue')
    .groups(['api', 'health'])
    .label('scope', 'health.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'health')
    .label('sdk.method', 'getQueueMessaging')
    .label('sdk.description', '/docs/references/health/get-queue-messaging.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_HEALTH_QUEUE)
    .param('threshold', 5000, new Integer(true), 'Queue size threshold. When hit (equal or higher), endpoint returns server error. Default value is 5000.', true)
    .inject('queue')
    .inject('response')
    .action(async (threshold: number | string, queue: Connection, response: Response) => {
        threshold = parseInt(threshold as string, 10);

        const client = new Client(Event.MESSAGING_QUEUE_NAME, queue);
        const size = await client.getQueueSize();

        if (size >= threshold) {
            throw new Error(`Queue size threshold hit. Current size is ${size} and threshold is ${threshold}.`);
        }

        response.dynamic(new Document({ size }), Response.MODEL_HEALTH_QUEUE);
    });


App.get('/v1/health/queue/migrations')
    .desc('Get migrations queue')
    .groups(['api', 'health'])
    .label('scope', 'health.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'health')
    .label('sdk.method', 'getQueueMigrations')
    .label('sdk.description', '/docs/references/health/get-queue-migrations.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_HEALTH_QUEUE)
    .param('threshold', 5000, new Integer(true), 'Queue size threshold. When hit (equal or higher), endpoint returns server error. Default value is 5000.', true)
    .inject('queue')
    .inject('response')
    .action(async (threshold: number | string, queue: Connection, response: Response) => {
        threshold = parseInt(threshold as string, 10);

        const client = new Client(Event.MIGRATIONS_QUEUE_NAME, queue);
        const size = await client.getQueueSize();

        if (size >= threshold) {
            throw new Error(`Queue size threshold hit. Current size is ${size} and threshold is ${threshold}.`);
        }

        response.dynamic(new Document({ size }), Response.MODEL_HEALTH_QUEUE);
    });


App.get('/v1/health/queue/functions')
    .desc('Get functions queue')
    .groups(['api', 'health'])
    .label('scope', 'health.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'health')
    .label('sdk.method', 'getQueueFunctions')
    .label('sdk.description', '/docs/references/health/get-queue-functions.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_HEALTH_QUEUE)
    .param('threshold', 5000, new Integer(true), 'Queue size threshold. When hit (equal or higher), endpoint returns server error. Default value is 5000.', true)
    .inject('queue')
    .inject('response')
    .action(async (threshold: number | string, queue: Connection, response: Response) => {
        threshold = parseInt(threshold as string, 10);

        const client = new Client(Event.FUNCTIONS_QUEUE_NAME, queue);
        const size = await client.getQueueSize();

        if (size >= threshold) {
            throw new Error(`Queue size threshold hit. Current size is ${size} and threshold is ${threshold}.`);
        }

        response.dynamic(new Document({ size }), Response.MODEL_HEALTH_QUEUE);
    });


App.get('/v1/health/queue/usage')
    .desc('Get usage queue')
    .groups(['api', 'health'])
    .label('scope', 'health.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'health')
    .label('sdk.method', 'getQueueUsage')
    .label('sdk.description', '/docs/references/health/get-queue-usage.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_HEALTH_QUEUE)
    .param('threshold', 5000, new Integer(true), 'Queue size threshold. When hit (equal or higher), endpoint returns server error. Default value is 5000.', true)
    .inject('queue')
    .inject('response')
    .action(async (threshold: number | string, queue: Connection, response: Response) => {
        threshold = parseInt(threshold as string, 10);

        const client = new Client(Event.USAGE_QUEUE_NAME, queue);
        const size = await client.getQueueSize();

        if (size >= threshold) {
            throw new Error(`Queue size threshold hit. Current size is ${size} and threshold is ${threshold}.`);
        }

        response.dynamic(new Document({ size }), Response.MODEL_HEALTH_QUEUE);
    });


App.get('/v1/health/queue/usage-dump')
    .desc('Get usage dump queue')
    .groups(['api', 'health'])
    .label('scope', 'health.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'health')
    .label('sdk.method', 'getQueueUsageDump')
    .label('sdk.description', '/docs/references/health/get-queue-usage-dump.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_HEALTH_QUEUE)
    .param('threshold', 5000, new Integer(true), 'Queue size threshold. When hit (equal or higher), endpoint returns server error. Default value is 5000.', true)
    .inject('queue')
    .inject('response')
    .action(async (threshold: number | string, queue: Connection, response: Response) => {
        threshold = parseInt(threshold as string, 10);

        const client = new Client(Event.USAGE_DUMP_QUEUE_NAME, queue);
        const size = await client.getQueueSize();

        if (size >= threshold) {
            throw new Error(`Queue size threshold hit. Current size is ${size} and threshold is ${threshold}.`);
        }

        response.dynamic(new Document({ size }), Response.MODEL_HEALTH_QUEUE);
    });


App.get('/v1/health/storage/local')
    .desc('Get local storage')
    .groups(['api', 'health'])
    .label('scope', 'health.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'health')
    .label('sdk.method', 'getStorageLocal')
    .label('sdk.description', '/docs/references/health/get-storage-local.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_HEALTH_STATUS)
    .inject('response')
    .action(async (response: Response) => {
        const checkStart = performance.now();

        const volumes = {
            'Uploads': APP_STORAGE_UPLOADS,
            'Cache': APP_STORAGE_CACHE,
            'Config': APP_STORAGE_CONFIG,
            'Certs': APP_STORAGE_CERTIFICATES
        };

        for (const [key, volume] of Object.entries(volumes)) {
            const device = new Local(volume);

            if (!isReadable(device.getRoot())) {
                throw new Error(`Device ${key} dir is not readable`);
            }

            if (!isWritable(device.getRoot())) {
                throw new Error(`Device ${key} dir is not writable`);
            }
        }

        const output = {
            status: 'pass',
            ping: Math.round((performance.now() - checkStart) / 1000)
        };

        response.dynamic(new Document(output), Response.MODEL_HEALTH_STATUS);
    });


App.get('/v1/health/storage')
    .desc('Get storage')
    .groups(['api', 'health'])
    .label('scope', 'health.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'health')
    .label('sdk.method', 'getStorage')
    .label('sdk.description', '/docs/references/health/get-storage.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_HEALTH_STATUS)
    .inject('response')
    .inject('deviceForFiles')
    .inject('deviceForFunctions')
    .inject('deviceForBuilds')
    .action(async (response: Response, deviceForFiles: Device, deviceForFunctions: Device, deviceForBuilds: Device) => {
        const devices = [deviceForFiles, deviceForFunctions, deviceForBuilds];
        const checkStart = performance.now();

        for (const device of devices) {
            const testFilePath = device.getPath('health.txt');

            // Attempt to write a test file
            if (!(await device.write(testFilePath, 'test', 'text/plain'))) {
                throw new Error(`Failed writing test file to ${device.getRoot()}`);
            }

            // Attempt to read the test file
            if ((await device.readString(testFilePath, 0)) !== 'test') {
                throw new Error(`Failed reading test file from ${device.getRoot()}`);
            }

            // Attempt to delete the test file
            if (!(await device.delete(testFilePath))) {
                throw new Error(`Failed deleting test file from ${device.getRoot()}`);
            }
        }

        const output = {
            status: 'pass',
            ping: Math.round((performance.now() - checkStart) / 1000)
        };

        response.dynamic(new Document(output), Response.MODEL_HEALTH_STATUS);
    });


App.get('/v1/health/queue/failed/:name')
    .desc('Get number of failed queue jobs')
    .groups(['api', 'health'])
    .label('scope', 'health.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'health')
    .label('sdk.method', 'getFailedJobs')
    .param('name', '', new WhiteList([
        Event.DATABASE_QUEUE_NAME,
        Event.DELETE_QUEUE_NAME,
        Event.AUDITS_QUEUE_NAME,
        Event.MAILS_QUEUE_NAME,
        Event.FUNCTIONS_QUEUE_NAME,
        Event.USAGE_QUEUE_NAME,
        Event.USAGE_DUMP_QUEUE_NAME,
        Event.WEBHOOK_QUEUE_NAME,
        Event.CERTIFICATES_QUEUE_NAME,
        Event.BUILDS_QUEUE_NAME,
        Event.MESSAGING_QUEUE_NAME,
        Event.MIGRATIONS_QUEUE_NAME
    ]), 'The name of the queue')
    .param('threshold', 5000, new Integer(true), 'Queue size threshold. When hit (equal or higher), endpoint returns server error. Default value is 5000.', true)
    .label('sdk.description', '/docs/references/health/get-failed-queue-jobs.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_HEALTH_QUEUE)
    .inject('response')
    .inject('queue')
    .action(async (name: string, threshold: number | string, response: Response, queue: Connection) => {
        threshold = parseInt(threshold as string, 10);

        const client = new Client(name, queue);
        const failed = await client.countFailedJobs();

        if (failed >= threshold) {
            throw new Error(`Queue failed jobs threshold hit. Current size is ${failed} and threshold is ${threshold}.`);
        }

        response.dynamic(new Document({ size: failed }), Response.MODEL_HEALTH_QUEUE);
    });


App.get('/v1/health/stats') // Currently only used internally
    .desc('Get system stats')
    .groups(['api', 'health'])
    .label('scope', 'root')
    // .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    // .label('sdk.namespace', 'health')
    // .label('sdk.method', 'getStats')
    .label('docs', false)
    .inject('response')
    .inject('register')
    .inject('deviceForFiles')
    .action(async (response: Response, register: Registry, deviceForFiles: Device) => {
        const cache = register.get('cache');

        const cacheStats = await cache.info();

        response.json({
            storage: {
                used: Storage.human(await deviceForFiles.getDirectorySize(deviceForFiles.getRoot() + '/')),
                partitionTotal: Storage.human(await deviceForFiles.getPartitionTotalSpace()),
                partitionFree: Storage.human(await deviceForFiles.getPartitionFreeSpace()),
            },
            cache: {
                uptime: cacheStats.uptime_in_seconds ?? 0,
                clients: cacheStats.connected_clients ?? 0,
                hits: cacheStats.keyspace_hits ?? 0,
                misses: cacheStats.keyspace_misses ?? 0,
                memory_used: cacheStats.used_memory ?? 0,
                memory_used_human: cacheStats.used_memory_human ?? 0,
                memory_used_peak: cacheStats.used_memory_peak ?? 0,
                memory_used_peak_human: cacheStats.used_memory_peak_human ?? 0,
            },
        });
    });