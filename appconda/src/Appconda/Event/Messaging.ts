import { Document } from '../../Tuval/Core';

import { Event } from './Event';
import { Client, Connection } from '../../Tuval/Queue';

export class Messaging extends Event {
    protected type: string = '';
    protected messageId: string | null = null;
    protected message: Document | null = null;
    protected recipients: string[] | null = null;
    protected scheduledAt: string | null = null;
    protected providerType: string | null = null;

    constructor(protected connection: Connection) {
        super(connection);
        this
            .setQueue(Event.MESSAGING_QUEUE_NAME)
            .setClass(Event.MESSAGING_CLASS_NAME);
    }

    public setType(type: string): this {
        this.type = type;
        return this;
    }

    public getType(): string {
        return this.type;
    }

    public setRecipients(recipients: string[]): this {
        this.recipients = recipients;
        return this;
    }

    public getRecipients(): string[] | null {
        return this.recipients;
    }

    public setMessage(message: Document): this {
        this.message = message;
        return this;
    }

    public getMessage(): Document | null {
        return this.message;
    }

    public setMessageId(messageId: string): this {
        this.messageId = messageId;
        return this;
    }

    public getMessageId(): string | null {
        return this.messageId;
    }

    public setProviderType(providerType: string): this {
        this.providerType = providerType;
        return this;
    }

    public getProviderType(): string | null {
        return this.providerType;
    }

    public setScheduledAt(scheduledAt: string): this {
        this.scheduledAt = scheduledAt;
        return this;
    }

    public getScheduledAt(): string | null {
        return this.scheduledAt;
    }

    public setProject(project: Document): this {
        this.project = project;
        return this;
    }

    public async trigger(): Promise<string | boolean> {
        const client = new Client(this.queue, this.connection);

        return client.enqueue({
            type: this.type,
            project: this.project,
            user: this.user,
            messageId: this.messageId,
            message: this.message,
            recipients: this.recipients,
            providerType: this.providerType,
            scheduledAt: this.scheduledAt,
        });
    }
}