import { Console } from "../../Tuval/CLI";
import { Text, WhiteList } from "../../Tuval/Core";
import { Action } from "../../Tuval/Platform/Action";
import { Client, Connection } from "../../Tuval/Queue";


export class QueueCount extends Action {
    public static getName(): string {
        return 'queue-count';
    }

    constructor() {
        super();
        this.desc('Return the number of jobs from a specific queue identified by the name parameter with a specific type')
            .param('name', '', new Text(100), 'Queue name')
            .param('type', '', new WhiteList(['success', 'failed', 'processing']), 'Queue type')
            .inject('queue')
            .callback((name: string, type: string, queue: Connection) => this.action(name, type, queue));
    }

    /**
     * @param name The name of the queue to count the jobs from
     * @param type The type of jobs to count
     * @param queue
     */
    public action(name: string, type: string, queue: Connection): void {
        if (!name) {
            Console.error('Missing required parameter $name');
            return;
        }

        const queueClient = new Client(name, queue);

        const count = (() => {
            switch (type) {
                case 'success':
                    return queueClient.countSuccessfulJobs();
                case 'failed':
                    return queueClient.countFailedJobs();
                case 'processing':
                    return queueClient.countProcessingJobs();
                default:
                    return 0;
            }
        })();

        Console.log(`Queue: '${name}' has ${count} ${type} jobs.`);
    }
}