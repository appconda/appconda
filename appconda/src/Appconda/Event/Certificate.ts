import { Document } from '../../Tuval/Core';

import { Event } from './Event';
import { Client, Connection } from '../../Tuval/Queue';

export class Certificate extends Event {
    protected skipRenewCheck: boolean = false;
    protected domain: Document | null = null;

    constructor(protected connection: Connection) {
        super(connection);
        this
            .setQueue(Event.CERTIFICATES_QUEUE_NAME)
            .setClass(Event.CERTIFICATES_CLASS_NAME);
    }

    public setDomain(domain: Document): this {
        this.domain = domain;
        return this;
    }

    public getDomain(): Document | null {
        return this.domain;
    }

    public setSkipRenewCheck(skipRenewCheck: boolean): this {
        this.skipRenewCheck = skipRenewCheck;
        return this;
    }

    public getSkipRenewCheck(): boolean {
        return this.skipRenewCheck;
    }

    public async trigger(): Promise<string | boolean> {
        const client = new Client(this.queue, this.connection);
        return client.enqueue({
            project: this.project,
            domain: this.domain,
            skipRenewCheck: this.skipRenewCheck
        });
    }
}