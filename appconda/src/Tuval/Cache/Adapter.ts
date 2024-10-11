
export interface Adapter {
    load(key: string, ttl: number, hash?: string): Promise<any>;
    save(key: string, data: any, hash?: string): Promise<boolean | string | any[]>;
    list(key: string): Promise<string[]>;
    purge(key: string, hash?: string): Promise<boolean>;
    flush(): Promise<boolean>;
    ping(): Promise<boolean>;
    getSize(): Promise<number>;
}