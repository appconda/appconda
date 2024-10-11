import { Adapter } from "./Adapter";


    export class Abuse {
        protected adapter: Adapter;

        constructor(adapter: Adapter) {
            this.adapter = adapter;
        }

        /**
         * Check
         *
         * Checks if request is considered abuse or not
         *
         * @return boolean
         */
        async check(): Promise<boolean> {
            return await this.adapter.check();
        }

        /**
         * Get abuse logs
         *
         * Return logs with an offset and limit
         *
         * @param  offset
         * @param  limit
         * @return Record<string, any>
         */
        async getLogs(offset: number = 0, limit: number = 25): Promise<Record<string, any>> {
            return await this.adapter.getLogs(offset, limit);
        }

        /**
         * Delete all logs older than datetime
         *
         * @param  datetime
         * @return boolean
         */
        async cleanup(datetime: string): Promise<boolean> {
            return await this.adapter.cleanup(datetime);
        }
    }
