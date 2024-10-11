export class Message {
    protected pid: string = '';
    protected queue: string = '';
    protected timestamp: number = 0;
    protected payload: Record<string, any> = {};

    constructor(array: Record<string, any> = {}) {
        if (Object.keys(array).length === 0) {
            return;
        }

        this.pid = array['pid'];
        this.queue = array['queue'];
        this.timestamp = array['timestamp'];
        this.payload = array['payload'] ?? {};
    }

    setPid(pid: string): this {
        this.pid = pid;
        return this;
    }

    setQueue(queue: string): this {
        this.queue = queue;
        return this;
    }

    setTimestamp(timestamp: number): this {
        this.timestamp = timestamp;
        return this;
    }

    setPayload(payload: Record<string, any>): this {
        this.payload = payload;
        return this;
    }

    getPid(): string {
        return this.pid;
    }

    getQueue(): string {
        return this.queue;
    }

    getTimestamp(): number {
        return this.timestamp;
    }

    getPayload(): Record<string, any> {
        return this.payload;
    }

    asArray(): Record<string, any> {
        return {
            pid: this.pid,
            queue: this.queue,
            timestamp: this.timestamp,
            payload: this.payload || null,
        };
    }
}