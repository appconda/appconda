import { Connection } from "./Connection";
import { Message } from "./Message";

export class Client {
    protected queue: string;
    protected namespace: string;
    protected connection: Connection;

    constructor(queue: string, connection: Connection, namespace: string = 'appconda-queue') {
        this.queue = queue;
        this.namespace = namespace;
        this.connection = connection;
    }

    async enqueue(payload: Record<string, any>): Promise<boolean> {
        const enrichedPayload = {
            pid: this.generateUniqueId(),
            queue: this.queue,
            timestamp: Math.floor(Date.now() / 1000),
            payload: payload
        };

        return this.connection.leftPushArray(`${this.namespace}.queue.${this.queue}`, enrichedPayload);
    }

    /**
     * Take all jobs from the failed queue and re-enqueue them.
     * @param limit The number of jobs to retry (optional)
     */
    async retry(limit?: number): Promise<void> {
        const startTime = Math.floor(Date.now() / 1000);
        let processed = 0;

        while (true) {
            const pid = await this.connection.rightPop(`${this.namespace}.failed.${this.queue}`, 5);

            // No more jobs to retry
            if (pid === false) {
                break;
            }

            const job = await this.getJob(pid);

            // Job doesn't exist
            if (job === false) {
                break;
            }

            // Job was already retried
            if (job.getTimestamp() >= startTime) {
                break;
            }

            // Reached the maximum number of jobs to retry
            if (limit !== undefined && processed >= limit) {
                break;
            }

            this.enqueue(job.getPayload());
            processed++;
        }
    }

    async getJob(pid: string): Promise<Message | false> {
        const value = await this.connection.get(`${this.namespace}.jobs.${this.queue}.${pid}`);

        if (value === false) {
            return false;
        }

        const job = JSON.parse(value);
        return new Message(job);
    }

    async listJobs(total: number = 50, offset: number = 0): Promise<any[]> {
        return this.connection.listRange(`${this.namespace}.queue.${this.queue}`, total, offset);
    }

    async getQueueSize(): Promise<number> {
        return this.connection.listSize(`${this.namespace}.queue.${this.queue}`);
    }

    async countTotalJobs(): Promise<number> {
        return parseInt(await this.connection.get(`${this.namespace}.stats.${this.queue}.total`) || '0', 10);
    }

    async countSuccessfulJobs(): Promise<number> {
        return parseInt(await this.connection.get(`${this.namespace}.stats.${this.queue}.success`) || '0', 10);
    }

    async countFailedJobs(): Promise<number> {
        return parseInt(await this.connection.get(`${this.namespace}.stats.${this.queue}.failed`) || '0', 10);
    }

    async countProcessingJobs(): Promise<number> {
        return parseInt(await this.connection.get(`${this.namespace}.stats.${this.queue}.processing`) || '0', 10);
    }

    async resetStats(): Promise<void> {
        await this.connection.set(`${this.namespace}.stats.${this.queue}.total`, '0');
        await this.connection.set(`${this.namespace}.stats.${this.queue}.success`, '0');
        await this.connection.set(`${this.namespace}.stats.${this.queue}.failed`, '0');
        await this.connection.set(`${this.namespace}.stats.${this.queue}.processing`, '0');
    }

    private generateUniqueId(): string {
        // Generates a unique identifier similar to PHP's uniqid with more entropy
        return `${Date.now().toString(16)}-${Math.random().toString(16).substr(2)}`;
    }
}