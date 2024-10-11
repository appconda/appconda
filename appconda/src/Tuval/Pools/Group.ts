import { Pool } from "./Pool";

export class Group {
    protected pools: { [key: string]: Pool } = {};

    add(pool: Pool): this {
        this.pools[pool.getName()] = pool;
        return this;
    }

    get(name: string): Pool {
        if (!this.pools[name]) {
            throw new Error(`Pool '${name}' not found`);
        }
        return this.pools[name];
    }

    remove(name: string): this {
        delete this.pools[name];
        return this;
    }

    reclaim(): this {
        for (const pool of Object.values(this.pools)) {
            pool.reclaim();
        }
        return this;
    }

    setReconnectAttempts(reconnectAttempts: number): this {
        for (const pool of Object.values(this.pools)) {
            pool.setReconnectAttempts(reconnectAttempts);
        }
        return this;
    }

    setReconnectSleep(reconnectSleep: number): this {
        for (const pool of Object.values(this.pools)) {
            pool.setReconnectSleep(reconnectSleep);
        }
        return this;
    }
}
