import { Adapter } from "../Adapter";

export class None implements Adapter {
    constructor() {}

    async load(key: string, ttl: number, hash: string = ''): Promise<any> {
        return false;
    }

    async save(key: string, data: any, hash: string = ''): Promise<boolean | string | any[]> {
        return false;
    }

    async list(key: string): Promise<string[]> {
        return [];
    }

    async purge(key: string, hash: string = ''): Promise<boolean> {
        return true;
    }

    async flush(): Promise<boolean> {
        return true;
    }

    async ping(): Promise<boolean> {
        return true;
    }

    async getSize(): Promise<number> {
        return 0;
    }
}