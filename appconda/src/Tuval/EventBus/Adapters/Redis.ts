import { createClient, RedisClientType } from 'redis';
import { Adapter } from '../Adapter';

export class RedisEventBus implements Adapter {
    private publisher: RedisClientType ;
    private subscriber: RedisClientType ;

    constructor(publisher: RedisClientType, subscriber: RedisClientType) {
        this.publisher = publisher;
        this.subscriber = subscriber;
        
    }

    async publish(event: string, data: string): Promise<void> {
        await this.publisher.publish(event, data);
    }

   async  subscribe(event: string, handler: (data: string) => void): Promise<void> {
        this.subscriber.subscribe(event, (message) => {
            handler(message);
        });
    }
}