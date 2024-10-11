import { Adapter } from "../Adapter";

    export class Sharding implements Adapter {
        protected adapters: Adapter[];
        protected count: number = 0;

        constructor(adapters: Adapter[]) {
            if (adapters.length === 0) {
                throw new Error('No adapters provided');
            }

            this.count = adapters.length;
            this.adapters = adapters;
        }

      async  load(key: string, ttl: number, hash: string = ''): Promise<any> {
            return this.getAdapter(key).load(key, ttl, hash);
        }

        async save(key: string, data: any, hash: string = ''): Promise<boolean | string | any[]> {
            return this.getAdapter(key).save(key, data, hash);
        }

        async list(key: string): Promise<string[]> {
            return this.getAdapter(key).list(key);
        }

        async purge(key: string, hash: string = ''): Promise<boolean> {
            return this.getAdapter(key).purge(key, hash);
        }

        async flush(): Promise<boolean> {
            let result = true;
            for (const adapter of this.adapters) {
                result = await adapter.flush() ? result : false;
            }
            return result;
        }

        async ping(): Promise<boolean> {
            for (const adapter of this.adapters) {
                if (!adapter.ping()) {
                    return false;
                }
            }
            return true;
        }

        async getSize(): Promise<number> {
            let size = 0;
            for (const adapter of this.adapters) {
                size += await adapter.getSize();
            }
            return size;
        }

        protected getAdapter(key: string): Adapter {
            const hash = this.crc32(key);
            const index = hash % this.count;
            return this.adapters[index];
        }

        private crc32(str: string): number {
            let crc = 0 ^ (-1);
            for (let i = 0; i < str.length; i++) {
                crc = (crc >>> 8) ^ this.crc32Table[(crc ^ str.charCodeAt(i)) & 0xff];
            }
            return (crc ^ (-1)) >>> 0;
        }

        private crc32Table = (() => {
            let c: number;
            const table: number[] = [];
            for (let n = 0; n < 256; n++) {
                c = n;
                for (let k = 0; k < 8; k++) {
                    c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
                }
                table[n] = c;
            }
            return table;
        })();
    }
