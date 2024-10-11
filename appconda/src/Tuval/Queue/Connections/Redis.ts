import { Connection } from "../Connection";
import Redis from "ioredis";

export class RedisConnection implements Connection {
    protected host: string;
    protected port: number;
    protected user: string | null;
    protected password: string | null;
    protected redis: Redis | null = null;

    constructor(host: string, port: number = 6379, user: string | null = null, password: string | null = null) {
        this.host = host;
        this.port = port;
        this.user = user;
        this.password = password;
    }

    public async rightPopLeftPushArray(queue: string, destination: string, timeout: number): Promise<any[] | false> {
        const response = await this.rightPopLeftPush(queue, destination, timeout);
        if (!response) {
            return false;
        }
        return JSON.parse(response);
    }

    public async rightPopLeftPush(queue: string, destination: string, timeout: number): Promise<string | false> {
        const response = await this.getRedis().brpoplpush(queue, destination, timeout);
        if (!response) {
            return false;
        }
        return response;
    }

    public async rightPushArray(queue: string, value: any[]): Promise<boolean> {
        return !!(await this.getRedis().rpush(queue, JSON.stringify(value)));
    }

    public async rightPush(queue: string, value: string): Promise<boolean> {
        return !!(await this.getRedis().rpush(queue, value));
    }

    public async leftPushArray(queue: string, value: any[]): Promise<boolean> {
        return !!(await this.getRedis().lpush(queue, JSON.stringify(value)));
    }

    public async leftPush(queue: string, value: string): Promise<boolean> {
        return !!(await this.getRedis().lpush(queue, value));
    }

    public async rightPopArray(queue: string, timeout: number): Promise<any[] | false> {
        const response = await this.rightPop(queue, timeout);
        if (response === false) {
            return false;
        }
        return JSON.parse(response) ?? false;
    }

    public async rightPop(queue: string, timeout: number): Promise<string | false> {
        const response = await this.getRedis().brpop(queue, timeout);
        if (!response) {
            return false;
        }
        return response[1];
    }

    public async leftPopArray(queue: string, timeout: number): Promise<any[] | false> {
        const response = await this.getRedis().blpop(queue, timeout);
        if (!response) {
            return false;
        }
        return JSON.parse(response[1]) ?? false;
    }

    public async leftPop(queue: string, timeout: number): Promise<string | false> {
        const response = await this.getRedis().blpop(queue, timeout);
        if (!response) {
            return false;
        }
        return response[1];
    }

    public async listRemove(queue: string, key: string): Promise<boolean> {
        return !!(await this.getRedis().lrem(queue, 1, key));
    }

    public async remove(key: string): Promise<boolean> {
        return !!(await this.getRedis().del(key));
    }

    public async move(queue: string, destination: string): Promise<boolean> {
        return !!(await this.getRedis().move(queue, destination));
    }

    public async setArray(key: string, value: any[]): Promise<boolean> {
        return this.set(key, JSON.stringify(value));
    }

    public async set(key: string, value: string): Promise<boolean> {
        return !!(await this.getRedis().set(key, value));
    }

    public async get(key: string): Promise<any> {
        return await this.getRedis().get(key);
    }

    public async listSize(key: string): Promise<number> {
        return await this.getRedis().llen(key);
    }

    public async increment(key: string): Promise<number> {
        return await this.getRedis().incr(key);
    }

    public async decrement(key: string): Promise<number> {
        return await this.getRedis().decr(key);
    }

    public async listRange(key: string, total: number, offset: number): Promise<any[]> {
        const start = offset;
        const end = start + total - 1;
        return await this.getRedis().lrange(key, start, end);
    }

    public async ping(): Promise<boolean> {
        try {
            await this.getRedis().ping();
            return true;
        } catch (e) {
            return false;
        }
    }

    protected getRedis(): Redis {
        if (this.redis) {
            return this.redis;
        }
        this.redis = new Redis({
            host: this.host,
            port: this.port,
            username: this.user || undefined,
            password: this.password || undefined,
        });
        return this.redis;
    }
}