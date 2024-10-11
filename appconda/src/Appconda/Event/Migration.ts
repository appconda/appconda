import { Document } from '../../Tuval/Core';

import { Event } from './Event';
import { Client, Connection } from '../../Tuval/Queue';

export class Migration extends Event {
    protected type: string = '';
    protected migration: Document | null = null;

    constructor(protected connection: Connection) {
        super(connection);
        this
            .setQueue(Event.MIGRATIONS_QUEUE_NAME)
            .setClass(Event.MIGRATIONS_CLASS_NAME);
    }

    public setMigration(migration: Document): this {
        this.migration = migration;
        return this;
    }

    public getMigration(): Document | null {
        return this.migration;
    }

    public setType(type: string): this {
        this.type = type;
        return this;
    }

    public getType(): string {
        return this.type;
    }

    public async trigger(): Promise<string | boolean> {
        const client = new Client(this.queue, this.connection);

        return client.enqueue({
            project: this.project,
            user: this.user,
            migration: this.migration,
            type: this.type
        });
    }
}