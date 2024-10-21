import { Adapter } from "./Adapter";


export class EventBus {
    private adapter: Adapter;

    constructor(adapter: Adapter) {
       this.adapter = adapter;
    }

    async publish(event: string, data: string): Promise<void> {
        return await this.adapter.publish(event, data);
    }

    async subscribe(event: string, handler: (data: string) => void): Promise<void> {
        this.adapter.subscribe(event, handler);
    }
}
