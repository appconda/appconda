import { MESSAGE_SEND_TYPE_EXTERNAL, MESSAGE_SEND_TYPE_INTERNAL, MESSAGE_TYPE_EMAIL, MESSAGE_TYPE_PUSH, MESSAGE_TYPE_SMS, METRIC_MESSAGES, METRIC_MESSAGES_FAILED, METRIC_MESSAGES_SENT, METRIC_MESSAGES_TYPE, METRIC_MESSAGES_TYPE_FAILED, METRIC_MESSAGES_TYPE_PROVIDER, METRIC_MESSAGES_TYPE_PROVIDER_FAILED, METRIC_MESSAGES_TYPE_PROVIDER_SENT, METRIC_MESSAGES_TYPE_SENT } from "../../app/init";
import { Console } from "../../Tuval/CLI";
import { DateTime, Document, Exception } from "../../Tuval/Core";
import { Database, Query } from "../../Tuval/Database";
import { DSN } from "../../Tuval/DSN";
import { Log } from "../../Tuval/Logger";
import { Action } from "../../Tuval/Platform/Action";
import { Message } from "../../Tuval/Queue";
import { Device, Local, Storage } from "../../Tuval/Storage";
import { Usage } from "../../Appconda/Event/Usage";
import { Runtime } from "../../Appconda/Tuval/Response/Models/Runtime";

export class Messaging extends Action {
    private localDevice: Local | null = null;

    public static getName(): string {
        return 'messaging';
    }

    constructor() {
        super();
        this.desc('Messaging worker')
            .inject('message')
            .inject('log')
            .inject('dbForProject')
            .inject('deviceForFiles')
            .inject('queueForUsage')
            .callback((message: Message, log: Log, dbForProject: Database, deviceForFiles: Device, queueForUsage: Usage) =>
                this.action(message, log, dbForProject, deviceForFiles, queueForUsage));
    }

    public async action(
        message: Message,
        log: Log,
        dbForProject: Database,
        deviceForFiles: Device,
        queueForUsage: Usage
    ): Promise<void> {
        //    / Runtime.setHookFlags(SWOOLE_HOOK_ALL ^ SWOOLE_HOOK_TCP);
        const payload = message.getPayload() || {};

        if (!payload) {
            throw new Error('Missing payload');
        }

        const type = payload['type'] || '';
        const project = new Document(payload['project'] || {});

        switch (type) {
            case MESSAGE_SEND_TYPE_INTERNAL:
                const internalMessage = new Document(payload['message'] || {});
                const recipients = payload['recipients'] || [];
                this.sendInternalSMSMessage(internalMessage, project, recipients, queueForUsage, log);
                break;
            case MESSAGE_SEND_TYPE_EXTERNAL:
                const externalMessage = await dbForProject.getDocument('messages', payload['messageId']);
                await this.sendExternalMessage(dbForProject, externalMessage, deviceForFiles, project, queueForUsage);
                break;
            default:
                throw new Error('Unknown message type: ' + type);
        }
    }

    private async sendExternalMessage(
        dbForProject: Database,
        message: Document,
        deviceForFiles: Device,
        project: Document,
        queueForUsage: Usage
    ): Promise<void> {
        const topicIds = message.getAttribute('topics', []);
        const targetIds = message.getAttribute('targets', []);
        const userIds = message.getAttribute('users', []);
        const providerType = message.getAttribute('providerType');

        let allTargets: Document[] = [];

        if (topicIds.length > 0) {
            const topics = await dbForProject.find('topics', [
                Query.equal('$id', topicIds),
                Query.limit(topicIds.length),
            ]);
            topics.forEach(topic => {
                const targets = topic.getAttribute('targets').filter((target: Document) => target.getAttribute('providerType') === providerType);
                allTargets.push(...targets);
            });
        }

        if (userIds.length > 0) {
            const users = await dbForProject.find('users', [
                Query.equal('$id', userIds),
                Query.limit(userIds.length),
            ]);
            users.forEach(user => {
                const targets = user.getAttribute('targets').filter((target: Document) => target.getAttribute('providerType') === providerType);
                allTargets.push(...targets);
            });
        }

        if (targetIds.length > 0) {
            const targets = await dbForProject.find('targets', [
                Query.equal('$id', targetIds),
                Query.equal('providerType', [providerType]),
                Query.limit(targetIds.length),
            ]);
            allTargets.push(...targets);
        }

        if (allTargets.length === 0) {
            dbForProject.updateDocument('messages', message.getId(), message.setAttributes({
                'status': MessageStatus.FAILED,
                'deliveryErrors': ['No valid recipients found.']
            }));
            Console.warning('No valid recipients found.');
            return;
        }

        const defaultProvider = await dbForProject.findOne('providers', [
            Query.equal('enabled', [true]),
            Query.equal('type', [providerType]),
        ]);

        if (!defaultProvider || defaultProvider.isEmpty()) {
            dbForProject.updateDocument('messages', message.getId(), message.setAttributes({
                'status': MessageStatus.FAILED,
                'deliveryErrors': ['No enabled provider found.']
            }));
            Console.warning('No enabled provider found.');
            return;
        }

        let identifiers: Record<string, Record<string, null>> = {};
        let providers: Record<string, Document> = {
            [defaultProvider.getId()]: defaultProvider
        };

        allTargets.forEach(target => {
            let providerId = target.getAttribute('providerId') || defaultProvider.getId();
            if (!identifiers[providerId]) {
                identifiers[providerId] = {};
            }
            identifiers[providerId][target.getAttribute('identifier')] = null;
        });

        const results = batch(Object.keys(identifiers).map(providerId => {
            return async () => {
                let provider = providers[providerId] || await dbForProject.getDocument('providers', providerId);
                if (provider.isEmpty() || !provider.getAttribute('enabled')) {
                    provider = defaultProvider;
                } else {
                    providers[providerId] = provider;
                }

                const identifiersForProvider = identifiers[providerId];
                const adapter = this.getAdapter(provider);

                const batches = Object.keys(identifiersForProvider).reduce((resultArray, item, index) => {
                    const chunkIndex = Math.floor(index / adapter.getMaxMessagesPerRequest());
                    if (!resultArray[chunkIndex]) {
                        resultArray[chunkIndex] = [];
                    }
                    resultArray[chunkIndex].push(item);
                    return resultArray;
                }, []);

                return batch(batches.map(batch => {
                    return async () => {
                        let deliveredTotal = 0;
                        let deliveryErrors: string[] = [];
                        const messageData = message.clone();
                        messageData.setAttribute('to', batch);

                        let data;
                        switch (provider.getAttribute('type')) {
                            case MESSAGE_TYPE_SMS:
                                data = this.buildSmsMessage(messageData, provider);
                                break;
                            case MESSAGE_TYPE_PUSH:
                                data = this.buildPushMessage(messageData);
                                break;
                            case MESSAGE_TYPE_EMAIL:
                                data = this.buildEmailMessage(dbForProject, messageData, provider, $deviceForFiles, $project);
                                break;
                            default:
                                throw new Exception('Provider with the requested ID is of the incorrect type');
                        }

                        try {
                            const response = adapter.send(data);
                            deliveredTotal += response['deliveredTo'];
                            response['results'].forEach(result => {
                                if (result['status'] === 'failure') {
                                    deliveryErrors.push(`Failed sending to target ${result['recipient']} with error: ${result['error']}`);
                                }
                                if ((result['error'] || '') === 'Expired device token') {
                                    const target = dbForProject.findOne('targets', [
                                        Query.equal('identifier', [result['recipient']])
                                    ]);
                                    if (target instanceof Document && !target.isEmpty()) {
                                        dbForProject.updateDocument('targets', target.getId(), target.setAttribute('expired', true));
                                    }
                                }
                            });
                        } catch (e) {
                            deliveryErrors.push('Failed sending to targets with error: ' + e.message);
                        } finally {
                            const errorTotal = deliveryErrors.length;
                            queueForUsage
                                .setProject(project)
                                .addMetric(METRIC_MESSAGES, (deliveredTotal + errorTotal))
                                .addMetric(METRIC_MESSAGES_SENT, deliveredTotal)
                                .addMetric(METRIC_MESSAGES_FAILED, errorTotal)
                                .addMetric(this.str_replace('{type}', provider.getAttribute('type'), METRIC_MESSAGES_TYPE), (deliveredTotal + errorTotal))
                                .addMetric(this.str_replace('{type}', provider.getAttribute('type'), METRIC_MESSAGES_TYPE_SENT), deliveredTotal)
                                .addMetric(this.str_replace('{type}', provider.getAttribute('type'), METRIC_MESSAGES_TYPE_FAILED), errorTotal)
                                .addMetric(this.str_replace(['{type}', '{provider}'], [provider.getAttribute('type'), provider.getAttribute('provider')], METRIC_MESSAGES_TYPE_PROVIDER), (deliveredTotal + errorTotal))
                                .addMetric(this.str_replace(['{type}', '{provider}'], [provider.getAttribute('type'), provider.getAttribute('provider')], METRIC_MESSAGES_TYPE_PROVIDER_SENT), deliveredTotal)
                                .addMetric(this.str_replace(['{type}', '{provider}'], [provider.getAttribute('type'), provider.getAttribute('provider')], METRIC_MESSAGES_TYPE_PROVIDER_FAILED), errorTotal)
                                .trigger();

                            return {
                                'deliveredTotal': deliveredTotal,
                                'deliveryErrors': deliveryErrors,
                            };
                        }
                    };
                }));
            };
        }));

        const mergedResults = results.flat();
        let deliveredTotal = 0;
        let deliveryErrors: string[] = [];

        mergedResults.forEach(result => {
            deliveredTotal += result['deliveredTotal'];
            deliveryErrors = deliveryErrors.concat(result['deliveryErrors']);
        });

        if (deliveryErrors.length === 0 && deliveredTotal === 0) {
            deliveryErrors.push('Unknown error');
        }

        message.setAttribute('deliveryErrors', deliveryErrors);

        if (message.getAttribute('deliveryErrors').length > 0) {
            message.setAttribute('status', MessageStatus.FAILED);
        } else {
            message.setAttribute('status', MessageStatus.SENT);
        }

        message.removeAttribute('to');

        Object.values(providers).forEach(provider => {
            message.setAttribute('search', `${message.getAttribute('search')} ${provider.getAttribute('name')} ${provider.getAttribute('provider')} ${provider.getAttribute('type')}`);
        });

        message.setAttribute('deliveredTotal', deliveredTotal);
        message.setAttribute('deliveredAt', DateTime.now());

        await dbForProject.updateDocument('messages', message.getId(), message);

        if (provider.getAttribute('type') === MESSAGE_TYPE_EMAIL) {
            if (deviceForFiles.getType() === Storage.DEVICE_LOCAL) {
                return;
            }

            const data = message.getAttribute('data');
            const attachments = data['attachments'] || [];

            attachments.forEach(async (attachment) => {
                const bucketId = attachment['bucketId'];
                const fileId = attachment['fileId'];

                const bucket = await dbForProject.getDocument('buckets', bucketId);
                if (bucket.isEmpty()) {
                    throw new Error('Storage bucket with the requested ID could not be found');
                }

                const file = await dbForProject.getDocument('bucket_' + bucket.getInternalId(), fileId);
                if (file.isEmpty()) {
                    throw new Error('Storage file with the requested ID could not be found');
                }

                const path = file.getAttribute('path', '');

                if (this.getLocalDevice(project).exists(path)) {
                    this.getLocalDevice(project).delete(path);
                }
            });
        }
    }

    private sendInternalSMSMessage(message: Document, project: Document, recipients: string[], queueForUsage: Usage, log: Log): void {
        if (!process.env._APP_SMS_PROVIDER || !process.env._APP_SMS_FROM) {
            throw new Error('Skipped SMS processing. Missing "_APP_SMS_PROVIDER" or "_APP_SMS_FROM" environment variables.');
        }

        if (project.isEmpty()) {
            throw new Error('Project not set in payload');
        }

        Console.log('Project: ' + project.getId());

        const denyList = process.env._APP_SMS_PROJECTS_DENY_LIST ? process.env._APP_SMS_PROJECTS_DENY_LIST.split(',') : [];

        if (denyList.includes(project.getId())) {
            console.error('Project is in the deny list. Skipping...');
            return;
        }

        const smsDSN = new DSN(process.env._APP_SMS_PROVIDER);
        const host = smsDSN.getHost();
        const password = smsDSN.getPassword();
        const user = smsDSN.getUser();

        log.addTag('type', host);

        const from = System.getEnv('_APP_SMS_FROM');

        const provider = new Document({
            '$id': ID.unique(),
            'provider': host,
            'type': MESSAGE_TYPE_SMS,
            'name': 'Internal SMS',
            'enabled': true,
            'credentials': this.getCredentials(host, user, password, from, smsDSN),
            'options': this.getOptions(host, from)
        });

        const adapter = this.getSmsAdapter(provider);

        const batches = this.chunkArray(recipients, adapter.getMaxMessagesPerRequest());

        batch(batches.map(batch => {
            return () => {
                message.setAttribute('to', batch);

                const data = this.buildSmsMessage(message, provider);

                try {
                    adapter.send(data);

                    const countryCode = adapter.getCountryCode(message['to'][0] || '');
                    if (countryCode) {
                        queueForUsage.addMetric(str_replace('{countryCode}', countryCode, METRIC_AUTH_METHOD_PHONE_COUNTRY_CODE), 1);
                    }
                    queueForUsage.addMetric(METRIC_AUTH_METHOD_PHONE, 1).setProject(project).trigger();
                } catch (th) {
                    throw new Error('Failed sending to targets with error: ' + th.message);
                }
            };
        }));
    }

    private getSmsAdapter(provider: Document): SMSAdapter | null {
        const credentials = provider.getAttribute('credentials');

        return this.getAdapterByProvider(provider.getAttribute('provider'), credentials);
    }

    private getPushAdapter(provider: Document): PushAdapter | null {
        const credentials = provider.getAttribute('credentials');
        const options = provider.getAttribute('options');

        return this.getPushAdapterByProvider(provider.getAttribute('provider'), credentials, options);
    }

    private getEmailAdapter(provider: Document): EmailAdapter | null {
        const credentials = provider.getAttribute('credentials', []);
        const options = provider.getAttribute('options', []);

        return this.getEmailAdapterByProvider(provider.getAttribute('provider'), credentials, options);
    }

    private buildEmailMessage(
        dbForProject: Database,
        message: Document,
        provider: Document,
        deviceForFiles: Device,
        project: Document,
    ): Email {
        const fromName = provider['options']['fromName'] || null;
        const fromEmail = provider['options']['fromEmail'] || null;
        const replyToEmail = provider['options']['replyToEmail'] || null;
        const replyToName = provider['options']['replyToName'] || null;
        const data = message['data'] || {};
        const ccTargets = data['cc'] || [];
        const bccTargets = data['bcc'] || [];
        const cc = [];
        const bcc = [];
        const attachments = data['attachments'] || [];

        if (ccTargets.length > 0) {
            const ccTargetsDocs = dbForProject.find('targets', [
                Query.equal('$id', ccTargets),
                Query.limit(ccTargets.length),
            ]);
            ccTargetsDocs.forEach(ccTarget => {
                cc.push({ 'email': ccTarget['identifier'] });
            });
        }

        if (bccTargets.length > 0) {
            const bccTargetsDocs = dbForProject.find('targets', [
                Query.equal('$id', bccTargets),
                Query.limit(bccTargets.length),
            ]);
            bccTargetsDocs.forEach(bccTarget => {
                bcc.push({ 'email': bccTarget['identifier'] });
            });
        }

        if (attachments.length > 0) {
            attachments.forEach(attachment => {
                const bucketId = attachment['bucketId'];
                const fileId = attachment['fileId'];

                const bucket = dbForProject.getDocument('buckets', bucketId);
                if (bucket.isEmpty()) {
                    throw new Error('Storage bucket with the requested ID could not be found');
                }

                const file = dbForProject.getDocument('bucket_' + bucket.getInternalId(), fileId);
                if (file.isEmpty()) {
                    throw new Error('Storage file with the requested ID could not be found');
                }

                const mimes = Config.getParam('storage-mimes');
                const path = file.getAttribute('path', '');

                if (!deviceForFiles.exists(path)) {
                    throw new Error('File not found in ' + path);
                }

                const contentType = mimes.includes(file.getAttribute('mimeType')) ? file.getAttribute('mimeType') : 'text/plain';

                if (deviceForFiles.getType() !== Storage.DEVICE_LOCAL) {
                    deviceForFiles.transfer(path, path, this.getLocalDevice(project));
                }

                attachment = new Attachment(
                    file.getAttribute('name'),
                    path,
                    contentType
                );
            });
        }

        const to = message['to'];
        const subject = data['subject'];
        const content = data['content'];
        const html = data['html'] || false;

        return new Email(
            to,
            subject,
            content,
            fromName,
            fromEmail,
            replyToName,
            replyToEmail,
            cc,
            bcc,
            attachments,
            html
        );
    }

    private buildSmsMessage(message: Document, provider: Document): SMS {
        const to = message['to'];
        const content = message['data']['content'];
        const from = provider['options']['from'];

        return new SMS(
            to,
            content,
            from
        );
    }

    private buildPushMessage(message: Document): Push {
        const to = message['to'];
        const title = message['data']['title'];
        const body = message['data']['body'];
        const data = message['data']['data'] || null;
        const action = message['data']['action'] || null;
        const image = message['data']['image']['url'] || null;
        const sound = message['data']['sound'] || null;
        const icon = message['data']['icon'] || null;
        const color = message['data']['color'] || null;
        const tag = message['data']['tag'] || null;
        const badge = message['data']['badge'] || null;

        return new Push(
            to,
            title,
            body,
            data,
            action,
            sound,
            image,
            icon,
            color,
            tag,
            badge
        );
    }

    private getLocalDevice(project: Document): Local {
        if (this.localDevice === null) {
            this.localDevice = new Local(APP_STORAGE_UPLOADS + '/app-' + project.getId());
        }

        return this.localDevice;
    }

    private getAdapter(provider: Document): any {
        const type = provider.getAttribute('type');
        switch (type) {
            case MESSAGE_TYPE_SMS:
                return this.getSmsAdapter(provider);
            case MESSAGE_TYPE_PUSH:
                return this.getPushAdapter(provider);
            case MESSAGE_TYPE_EMAIL:
                return this.getEmailAdapter(provider);
            default:
                throw new Error('Unsupported provider type: ' + type);
        }
    }

    private getAdapterByProvider(provider: string, credentials: any): any {
        switch (provider) {
            case 'mock':
                return new Mock('username', 'password');
            case 'twilio':
                return new Twilio(credentials['accountSid'], credentials['authToken'], null, credentials['messagingServiceSid']);
            case 'textmagic':
                return new TextMagic(credentials['username'], credentials['apiKey']);
            case 'telesign':
                return new Telesign(credentials['customerId'], credentials['apiKey']);
            case 'msg91':
                return new Msg91(credentials['senderId'], credentials['authKey'], credentials['templateId']);
            case 'vonage':
                return new Vonage(credentials['apiKey'], credentials['apiSecret']);
            default:
                throw new Error('Unsupported SMS provider: ' + provider);
        }
    }

    private getPushAdapterByProvider(provider: string, credentials: any, options: any): any {
        switch (provider) {
            case 'mock':
                return new Mock('username', 'password');
            case 'apns':
                return new APNS(
                    credentials['authKey'],
                    credentials['authKeyId'],
                    credentials['teamId'],
                    credentials['bundleId'],
                    options['sandbox']
                );
            case 'fcm':
                return new FCM(JSON.stringify(credentials['serviceAccountJSON']));
            default:
                throw new Error('Unsupported Push provider: ' + provider);
        }
    }

    private getEmailAdapterByProvider(provider: string, credentials: any, options: any): any {
        switch (provider) {
            case 'mock':
                return new Mock('username', 'password');
            case 'smtp':
                return new SMTP(
                    credentials['host'],
                    credentials['port'],
                    credentials['username'],
                    credentials['password'],
                    options['encryption'],
                    options['autoTLS'],
                    options['mailer'],
                );
            case 'mailgun':
                return new Mailgun(
                    credentials['apiKey'],
                    credentials['domain'],
                    credentials['isEuRegion']
                );
            case 'sendgrid':
                return new Sendgrid(credentials['apiKey']);
            default:
                throw new Error('Unsupported Email provider: ' + provider);
        }
    }

    private getCredentials(host: string, user: string, password: string, from: string, smsDSN: DSN): any {
        switch (host) {
            case 'twilio':
                return {
                    'accountSid': user,
                    'authToken': password,
                    'messagingServiceSid': from.startsWith('MG') ? from : null
                };
            case 'textmagic':
                return {
                    'username': user,
                    'apiKey': password
                };
            case 'telesign':
                return {
                    'customerId': user,
                    'apiKey': password
                };
            case 'msg91':
                return {
                    'senderId': user,
                    'authKey': password,
                    'templateId': smsDSN.getParam('templateId', from),
                };
            case 'vonage':
                return {
                    'apiKey': user,
                    'apiSecret': password
                };
            default:
                throw new Error('Unsupported host for credentials: ' + host);
        }
    }

    private getOptions(host: string, from: string): any {
        switch (host) {
            case 'twilio':
                return {
                    'from': from.startsWith('MG') ? null : from
                };
            default:
                return {
                    'from': from
                };
        }
    }

    private chunkArray(array: any[], chunkSize: number): any[][] {
        const result: any[][] = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            result.push(array.slice(i, i + chunkSize));
        }
        return result;
    }

    private str_replace(search, replace, subject) {
        if (Array.isArray(search)) {
            search.forEach((item, index) => {
                const replacement = Array.isArray(replace) ? replace[index] || '' : replace;
                subject = subject.split(item).join(replacement);
            });
        } else {
            subject = subject.split(search).join(replace);
        }
        return subject;
    }
}