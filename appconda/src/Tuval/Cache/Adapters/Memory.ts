import { Adapter } from "../Adapter";

export class Memory implements Adapter {
    public store: { [key: string]: { time: number, data: any } } = {};

    constructor() {}

    async load(key: string, ttl: number, hash: string = ''): Promise<any> {
        if (key && this.store[key]) {
            const saved = this.store[key];
            return (saved.time + ttl > Date.now() / 1000) ? saved.data : false;
        }
        return false;
    }

    async save(key: string, data: any, hash: string = ''): Promise<boolean | string | any[]> {
        if (!key || !data) {
            return false;
        }

        const saved = {
            time: Date.now() / 1000,
            data: data,
        };

        this.store[key] = saved;
        return data;
    }

    async list(key: string): Promise<string[]> {
        return [];
    }

    async purge(key: string, hash: string = ''): Promise<boolean> {
        if (key && this.store[key]) {
            delete this.store[key];
            return true;
        }
        return false;
    }

    async flush(): Promise<boolean> {
        this.store = {};
        return true;
    }

    async ping(): Promise<boolean> {
        return true;
    }

    async getSize(): Promise<number> {
        return Object.keys(this.store).length;
    }
}