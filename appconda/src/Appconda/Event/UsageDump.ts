
import { Client, Connection } from '../../Tuval/Queue';
import { Event } from './Event';

export class UsageDump extends Event {
    protected stats: Record<string, any> = {};

    constructor(protected connection: Connection) {
        super(connection);
        this
            .setQueue(Event.USAGE_DUMP_QUEUE_NAME)
            .setClass(Event.USAGE_DUMP_CLASS_NAME);
    }

    public setStats(stats: Record<string, any>): this {
        this.stats = stats;
        return this;
    }

    public async trigger(): Promise<string | boolean> {
        const client = new Client(this.queue, this.connection);
        return client.enqueue({
            stats: this.stats,
        });
    }
}