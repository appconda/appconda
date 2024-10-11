import { createClient, RedisClientType, } from 'redis';
import { Adapter } from "../Adapter";


export class Redis implements Adapter {
    protected redis: RedisClientType;

    constructor(redis: RedisClientType) {
        this.redis = redis;
    }

    load(key: string, ttl: number, hash: string = ''): any {
        if (!hash) {
            hash = key;
        }


        this.redis.get('myKey').then((redisString) => {
            if (!redisString) {
                return false;
            }

            const cache = JSON.parse(redisString);
            if (cache.time + ttl > Date.now() / 1000) {
                return cache.data;
            }

            return false;
        })


    }

    save(key: string, data: any, hash: string = ''): Promise<boolean | string | any[]> {
        if (!key || !data) {
            return Promise.resolve(false);
        }

        if (!hash) {
            hash = key;
        }

        const value = JSON.stringify({
            time: Date.now() / 1000,
            data: data,
        });

        return this.redis.set(key, value).then(() => data).catch(() => false);
    }

    list(key: string): Promise<string[]> {
        //@ts-ignore
        return this.redis.hkeys(key).then((keys) => keys || []);
    }

    purge(key: string, hash: string = ''): Promise<boolean> {
        if (hash) {
            return this.redis.del(key).then((result) => !!result);
        }

        return this.redis.del(key).then((result) => !!result);
    }

    flush(): Promise<boolean> {
        //@ts-ignore
        return this.redis.flushall().then(() => true);
    }

    ping(): Promise<boolean> {
        return this.redis.ping().then(() => true).catch(() => false);
    }

    getSize(): Promise<number> {
        //@ts-ignore
        return this.redis.dbsize();
    }
}
