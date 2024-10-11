
import { Client, Connection } from '../../Tuval/Queue';
import { Event } from './Event';

export class Audit extends Event {
    protected resource: string = '';
    protected mode: string = '';
    protected userAgent: string = '';
    protected ip: string = '';

    constructor(protected connection: Connection) {
        super(connection);
        this
            .setQueue(Event.AUDITS_QUEUE_NAME)
            .setClass(Event.AUDITS_CLASS_NAME);
    }

    public setResource(resource: string): this {
        this.resource = resource;
        return this;
    }

    public getResource(): string {
        return this.resource;
    }

    public setMode(mode: string): this {
        this.mode = mode;
        return this;
    }

    public getMode(): string {
        return this.mode;
    }

    public setUserAgent(userAgent: string): this {
        this.userAgent = userAgent;
        return this;
    }

    public getUserAgent(): string {
        return this.userAgent;
    }

    public setIP(ip: string): this {
        this.ip = ip;
        return this;
    }

    public getIP(): string {
        return this.ip;
    }

    public async trigger(): Promise<string | boolean> {
        const client = new Client(this.queue, this.connection);
        return client.enqueue({
            project: this.project,
            user: this.user,
            payload: this.payload,
            resource: this.resource,
            mode: this.mode,
            ip: this.ip,
            userAgent: this.userAgent,
            event: this.event,
        });
    }
}