
import nodemailer from 'nodemailer';
import { Action } from '../../Tuval/Platform/Action';
import { Message } from '../../Tuval/Queue';
import { Registry } from '../../Tuval/Registry';
import { Log } from '../../Tuval/Logger';
import { Runtime } from '../../Appconda/Tuval/Response/Models/Runtime';
import { Template } from '../../Appconda/Template/Template';

export class Mails extends Action {
    public static getName(): string {
        return 'mails';
    }

    constructor() {
        super();
        this
            .desc('Mails worker')
            .inject('message')
            .inject('register')
            .inject('log')
            .callback((message: Message, register: Registry, log: Log) => this.action(message, register, log));
    }

    protected richTextParams: Record<string, string> = {
        'b': '<strong>',
        '/b': '</strong>',
    };

    public async action(message: Message, register: Registry, log: Log): Promise<void> {
        // Runtime.setHookFlags(SWOOLE_HOOK_ALL ^ SWOOLE_HOOK_TCP);
        const payload = message.getPayload() || {};

        if (!payload) {
            throw new Error('Missing payload');
        }

        const smtp = payload['smtp'];

        if (!smtp && !process.env._APP_SMTP_HOST) {
            throw new Error('Skipped mail processing. No SMTP configuration has been set.');
        }

        log.addTag('type', smtp ? 'smtp' : 'cloud');

        const protocol = process.env._APP_OPTIONS_FORCE_HTTPS === 'disabled' ? 'http' : 'https';
        const hostname = process.env._APP_DOMAIN;

        const recipient = payload['recipient'];
        const subject = payload['subject'];
        const variables = payload['variables'];
        variables['host'] = `${protocol}://${hostname}`;
        const name = payload['name'];
        const body = payload['body'];

        variables['subject'] = subject;
        variables['year'] = new Date().getFullYear().toString();

        const attachment = payload['attachment'] || {};
        let bodyTemplate = payload['bodyTemplate'];
        if (!bodyTemplate) {
            bodyTemplate = __dirname + '/../../../../app/config/locale/templates/email-base.tpl';
        }
        bodyTemplate = Template.fromFile(bodyTemplate);
        bodyTemplate.setParam('{{body}}', body, false);
        for (const [key, value] of Object.entries(variables)) {
            bodyTemplate.setParam(`{{${key}}}`, value, key !== 'redirect');
        }
        for (const [key, value] of Object.entries(this.richTextParams)) {
            bodyTemplate.setParam(`{{${key}}}`, value, false);
        }
        const renderedBody = bodyTemplate.render();

        const subjectTemplate = Template.fromString(subject);
        for (const [key, value] of Object.entries(variables)) {
            subjectTemplate.setParam(`{{${key}}}`, value);
        }
        const renderedSubject = (await subjectTemplate.render()).replace(/<[^>]*>/g, '');

        const transporter = smtp ? this.getMailer(smtp) : register.get('smtp');

        const mailOptions = {
            from: smtp ? `${smtp['senderName']} <${smtp['senderEmail']}>` : process.env._APP_SYSTEM_EMAIL_ADDRESS || 'team@appwrite.io',
            to: `${name} <${recipient}>`,
            subject: renderedSubject,
            html: renderedBody,
            text: renderedBody.replace(/<style\b[^>]*>(.*?)<\/style>/is, '').replace(/<[^>]*>/g, '').trim(),
            attachments: attachment['content'] ? [{
                filename: attachment['filename'] || 'unknown.file',
                content: Buffer.from(attachment['content'], 'base64'),
                encoding: attachment['encoding'] || 'base64',
                contentType: attachment['type'] || 'plain/text'
            }] : []
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (error) {
            throw new Error(`Error sending mail: ${error.message}`);
        }
    }

    protected getMailer(smtp: Record<string, any>) {
        return nodemailer.createTransport({
            host: smtp['host'],
            port: smtp['port'],
            secure: smtp['secure'] === 'ssl', // true for 465, false for other ports
            auth: {
                user: smtp['username'],
                pass: smtp['password']
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }
}