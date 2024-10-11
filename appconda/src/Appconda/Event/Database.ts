import { Document } from '../../Tuval/Core';
import { DSN } from '../../Tuval/DSN';

import { Event } from './Event';
import { Client, Connection } from '../../Tuval/Queue';

export class Database extends Event {
    protected type: string = '';
    protected database: Document | null = null;
    protected collection: Document | null = null;
    protected document: Document | null = null;

    constructor(protected connection: Connection) {
        super(connection);
        this.setClass(Event.DATABASE_CLASS_NAME);
    }

    public setType(type: string): this {
        this.type = type;
        return this;
    }

    public getType(): string {
        return this.type;
    }

    public setDatabase(database: Document): this {
        this.database = database;
        return this;
    }

    public setCollection(collection: Document): this {
        this.collection = collection;
        return this;
    }

    public getCollection(): Document | null {
        return this.collection;
    }

    public setDocument(document: Document): this {
        this.document = document;
        return this;
    }

    public getDocument(): Document | null {
        return this.document;
    }

    public async trigger(): Promise<string | boolean> {
        let dsn: DSN;
        try {
            dsn = new DSN(this.getProject().getAttribute('database'));
        } catch (error) {
            dsn = new DSN('mysql://' + this.getProject().getAttribute('database'));
        }

        this.setQueue(dsn.getHost());

        const client = new Client(this.queue, this.connection);

        try {
            const result = await client.enqueue({
                project: this.project,
                user: this.user,
                type: this.type,
                collection: this.collection,
                document: this.document,
                database: this.database,
                events: Event.generateEvents(this.getEvent(), this.getParams())
            });
            return result;
        } catch (error) {
            return false;
        }
    }
}