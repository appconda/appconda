
import { Client, Connection } from '../../Tuval/Queue';
import { Event } from './Event';

export class Mail extends Event {
    protected recipient: string = '';
    protected name: string = '';
    protected subject: string = '';
    protected body: string = '';
    protected smtp: Record<string, any> = {};
    protected variables: Record<string, any> = {};
    protected bodyTemplate: string = '';
    protected attachment: Record<string, any> = {};

    constructor(protected connection: Connection) {
        super(connection);
        this
            .setQueue(Event.MAILS_QUEUE_NAME)
            .setClass(Event.MAILS_CLASS_NAME);
    }

    public setSubject(subject: string): this {
        this.subject = subject;
        return this;
    }

    public getSubject(): string {
        return this.subject;
    }

    public setRecipient(recipient: string): this {
        this.recipient = recipient;
        return this;
    }

    public getRecipient(): string {
        return this.recipient;
    }

    public setBody(body: string): this {
        this.body = body;
        return this;
    }

    public getBody(): string {
        return this.body;
    }

    public setName(name: string): this {
        this.name = name;
        return this;
    }

    public getName(): string {
        return this.name;
    }

    public setBodyTemplate(bodyTemplate: string): this {
        this.bodyTemplate = bodyTemplate;
        return this;
    }

    public getBodyTemplate(): string {
        return this.bodyTemplate;
    }

    public setSmtpHost(host: string): this {
        this.smtp['host'] = host;
        return this;
    }

    public setSmtpPort(port: number): this {
        this.smtp['port'] = port;
        return this;
    }

    public setSmtpUsername(username: string): this {
        this.smtp['username'] = username;
        return this;
    }

    public setSmtpPassword(password: string): this {
        this.smtp['password'] = password;
        return this;
    }

    public setSmtpSecure(secure: string): this {
        this.smtp['secure'] = secure;
        return this;
    }

    public setSmtpSenderEmail(senderEmail: string): this {
        this.smtp['senderEmail'] = senderEmail;
        return this;
    }

    public setSmtpSenderName(senderName: string): this {
        this.smtp['senderName'] = senderName;
        return this;
    }

    public setSmtpReplyTo(replyTo: string): this {
        this.smtp['replyTo'] = replyTo;
        return this;
    }

    public getSmtpHost(): string {
        return this.smtp['host'] ?? '';
    }

    public getSmtpPort(): number {
        return this.smtp['port'] ?? 0;
    }

    public getSmtpUsername(): string {
        return this.smtp['username'] ?? '';
    }

    public getSmtpPassword(): string {
        return this.smtp['password'] ?? '';
    }

    public getSmtpSecure(): string {
        return this.smtp['secure'] ?? '';
    }

    public getSmtpSenderEmail(): string {
        return this.smtp['senderEmail'] ?? '';
    }

    public getSmtpSenderName(): string {
        return this.smtp['senderName'] ?? '';
    }

    public getSmtpReplyTo(): string {
        return this.smtp['replyTo'] ?? '';
    }

    public getVariables(): Record<string, any> {
        return this.variables;
    }

    public setVariables(variables: Record<string, any>): this {
        this.variables = variables;
        return this;
    }

    public setAttachment(content: string, filename: string, encoding: string = 'base64', type: string = 'plain/text'): this {
        this.attachment = {
            content: Buffer.from(content).toString('base64'),
            filename: filename,
            encoding: encoding,
            type: type,
        };
        return this;
    }

    public getAttachment(): Record<string, any> {
        return this.attachment;
    }

    public resetAttachment(): this {
        this.attachment = {};
        return this;
    }

    public reset(): this {
        this.project = null;
        this.recipient = '';
        this.name = '';
        this.subject = '';
        this.body = '';
        this.variables = {};
        this.bodyTemplate = '';
        this.attachment = {};
        return this;
    }

    public async trigger(): Promise<string | boolean> {
        const client = new Client(this.queue, this.connection);
        return client.enqueue({
            project: this.project,
            recipient: this.recipient,
            name: this.name,
            subject: this.subject,
            bodyTemplate: this.bodyTemplate,
            body: this.body,
            smtp: this.smtp,
            variables: this.variables,
            attachment: this.attachment,
            events: Event.generateEvents(this.getEvent(), this.getParams())
        });
    }
}