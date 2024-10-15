import { Console } from "../../../Tuval/CLI";
import { Text, Wildcard } from "../../../Tuval/Core";
import { Action } from "../../../Tuval/Platform/Action";
import { Client, Connection } from "../../../Tuval/Queue";


export class QueueRetry extends Action {
    public static getName(): string {
        return 'queue-retry';
    }

    constructor() {
        super();
        this.desc('Retry failed jobs from a specific queue identified by the name parameter')
            .param('name', '', new Text(100), 'Queue name')
            .param('limit', 0, new Wildcard(), 'jobs limit', true)
            .inject('queue')
            .callback(async (name: string, limit: any, queue: Connection) => await this.action(name, limit, queue));
    }

    /**
     * @param name The name of the queue to retry jobs from
     * @param limit
     * @param queue
     */
    public async action(name: string, limit: any, queue: Connection): Promise<void> {
        if (!name) {
            Console.error('Missing required parameter $name');
            return;
        }

        limit = parseInt(limit, 10);
        const queueClient = new Client(name, queue);

        if (await queueClient.countFailedJobs() === 0) {
            Console.error('No failed jobs found.');
            return;
        }

        Console.log('Retrying failed jobs...');

        queueClient.retry(limit);
    }
}