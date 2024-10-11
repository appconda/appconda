
import { TimeLimit as TimeLimitAdapter } from "../TimeLimit";

import Redis from 'ioredis';

export class TimeLimit extends TimeLimitAdapter {
    public static NAMESPACE = 'abuse';

    protected redis: Redis;

    constructor(key: string, limit: number, seconds: number, redis: Redis) {
        super();
        this.redis = redis;
        this.key = key;
        const time = Math.floor(Date.now() / 1000 / seconds) * seconds;
        this._time = time.toString();
        this._limit = limit;
    }

    protected async count(key: string, datetime: string): Promise<number> {
        if (this._limit === 0) {
            return 0;
        }

        if (this._count !== null) {
            return this._count;
        }

        const count = await this.redis.get(`${TimeLimit.NAMESPACE}__${key}__${datetime}`);
        this._count = count ? parseInt(count, 10) : 0;

        return this._count;
    }

    protected async hit(key: string, datetime: string): Promise<void> {
        if (this._limit === 0) {
            return;
        }

        const count = await this.redis.get(`${TimeLimit.NAMESPACE}__${key}__${datetime}`);
        this._count = count ? parseInt(count, 10) : 0;

        await this.redis.incr(`${TimeLimit.NAMESPACE}__${key}__${datetime}`);
        this._count++;
    }

    public async getLogs(offset: number | null = null, limit: number | null = 25): Promise<Record<string, any>> {
        let cursor = '0';
        const logs: Record<string, any> = {};

        do {
            const [newCursor, keys] = await this.redis.scan(cursor, 'MATCH', `${TimeLimit.NAMESPACE}__*`, 'COUNT', limit);
            cursor = newCursor;

            for (const key of keys) {
                logs[key] = await this.redis.get(key);
            }
        } while (cursor !== '0');

        return logs;
    }

    public async cleanup(datetime: string): Promise<boolean> {
        let cursor = '0';

        do {
            const [newCursor, keys] = await this.redis.scan(cursor, 'MATCH', `${TimeLimit.NAMESPACE}__*__*`, 'COUNT', 1000);
            cursor = newCursor;

            const filteredKeys = this.filterKeys(keys, parseInt(datetime, 10));
            if (filteredKeys.length > 0) {
                await this.redis.del(...filteredKeys);
            }
        } while (cursor !== '0');

        return true;
    }

    protected filterKeys(keys: string[], timestamp: number): string[] {
        return keys.filter(key => {
            const parts = key.split('__');
            const keyTimestamp = parseInt(parts[parts.length - 1], 10);
            return keyTimestamp < timestamp;
        });
    }
}