import { Adapter } from "./Adapter";


export class Cache {
    private adapter: Adapter;
    public static caseSensitive: boolean = false;

    constructor(adapter: Adapter) {
        this.adapter = adapter;
    }

    public static setCaseSensitivity(value: boolean): boolean {
        return this.caseSensitive = value;
    }

    public async load(key: string, ttl: number, hash: string = ''): Promise<any> {
        key = Cache.caseSensitive ? key : key.toLowerCase();
        hash = Cache.caseSensitive ? hash : hash.toLowerCase();

        return this.adapter.load(key, ttl, hash);
    }

    public async save(key: string, data: any, hash: string = ''): Promise<boolean | string | any[]> {
        key = Cache.caseSensitive ? key : key.toLowerCase();
        hash = Cache.caseSensitive ? hash : hash.toLowerCase();

        return this.adapter.save(key, data, hash);
    }

    public async list(key: string): Promise<string[]> {
        key = Cache.caseSensitive ? key : key.toLowerCase();

        return this.adapter.list(key);
    }

    public async purge(key: string, hash: string = ''): Promise<boolean> {
        key = Cache.caseSensitive ? key : key.toLowerCase();
        hash = Cache.caseSensitive ? hash : hash.toLowerCase();

        return this.adapter.purge(key, hash);
    }

    public async flush(): Promise<boolean> {
        return this.adapter.flush();
    }

    public async ping(): Promise<boolean> {
        return this.adapter.ping();
    }

    public async getSize(): Promise<number> {
        return this.adapter.getSize();
    }
}