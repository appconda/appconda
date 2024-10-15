import { BaseService } from "../../BaseService";
import { KV } from "./kv/kv";


export default class KVService extends BaseService {
    private kv: KV = new KV();

    public get uid(): string {
        return 'com.realmocean.service.kv';
    }

    get displayName(): string {
        return 'KV Service'
    }

    public async init() {
    }

    public async set(key: string, value: any): Promise<boolean | undefined> {
        return this.kv.set(key, value);
    }

    public async get(key: string): Promise<any> {
        return this.kv.get(key);
    }
}


