

    export abstract class Adapter {
        protected params: Record<string, string> = {};
        protected key: string = '';

        /**
         * Check
         *
         * Checks if number of counts is bigger or smaller than current limit
         *
         * @return boolean
         */
        abstract check():Promise<boolean>;

        /**
         * Set Param
         *
         * Set custom param for key pattern parsing
         *
         * @param  key
         * @param  value
         * @return this
         */
        setParam(key: string, value: string): this {
            this.params[key] = value;
            return this;
        }

        /**
         * Get Params
         *
         * Return array of all key params
         *
         * @return Record<string, string>
         */
        protected getParams(): Record<string, string> {
            return this.params;
        }

        /**
         * Parse key with all custom attached params
         *
         * @return string
         */
        protected parseKey(): string {
            for (const [key, value] of Object.entries(this.getParams())) {
                this.key = this.key.replace(key, value);
            }
            return this.key;
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
        abstract getLogs(offset?: number, limit?: number): Record<string, any>;

        /**
         * Delete all logs older than datetime
         *
         * @param  datetime
         * @return boolean
         */
        abstract cleanup(datetime: string):Promise<boolean>;
    }
