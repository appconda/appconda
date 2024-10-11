import { Document } from '../../Tuval/Core';

import { Event } from './Event';
import { Client, Connection } from '../../Tuval/Queue';

export class Delete extends Event {
    protected type: string = '';
    protected document: Document | null = null;
    protected resourceType: string | null = null;
    protected resource: string | null = null;
    protected datetime: string | null = null;
    protected hourlyUsageRetentionDatetime: string | null = null;

    constructor(protected connection: Connection) {
        super(connection);
        this
            .setQueue(Event.DELETE_QUEUE_NAME)
            .setClass(Event.DELETE_CLASS_NAME);
    }

    public setType(type: string): this {
        this.type = type;
        return this;
    }

    public getType(): string {
        return this.type;
    }

    public setDatetime(datetime: string): this {
        this.datetime = datetime;
        return this;
    }

    public setUsageRetentionHourlyDateTime(datetime: string): this {
        this.hourlyUsageRetentionDatetime = datetime;
        return this;
    }

    public setDocument(document: Document): this {
        this.document = document;
        return this;
    }

    public getResource(): string | null {
        return this.resource;
    }

    public setResource(resource: string): this {
        this.resource = resource;
        return this;
    }

    public setResourceType(resourceType: string): this {
        this.resourceType = resourceType;
        return this;
    }

    public getDocument(): Document | null {
        return this.document;
    }

    public async trigger(): Promise<string | boolean> {
        const client = new Client(this.queue, this.connection);
        return client.enqueue({
            project: this.project,
            type: this.type,
            document: this.document,
            resource: this.resource,
            resourceType: this.resourceType,
            datetime: this.datetime,
            hourlyUsageRetentionDatetime: this.hourlyUsageRetentionDatetime
        });
    }
}