import { Adapter } from '../Adapter';

export class InMemoryEventBus implements Adapter {
    private handlers: { [event: string]: ((data: string) => void)[] } = {};

    async publish(event: string, data: string): Promise<void> {
        if (this.handlers[event]) {
            this.handlers[event].forEach(handler => handler(data));
        }
    }

    async subscribe(event: string, handler: (data: string) => void): Promise<void> {
        if (!this.handlers[event]) {
            this.handlers[event] = [];
        }
        this.handlers[event].push(handler);
    }
}
