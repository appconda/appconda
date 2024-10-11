import { Adapter } from "../Adapter";



    export abstract class TimeLimit extends Adapter {
        protected _limit: number = 0;
        protected _count: number  = null;
        protected _time: string = '';

        /**
         * Check
         *
         * Checks if number of counts is bigger or smaller than current limit
         *
         * @param  key
         * @param  datetime
         * @return number
         *
         * @throws Error
         */
        protected abstract count(key: string, datetime: string): Promise<number>;

        protected abstract hit(key: string, datetime: string): void;

        /**
         * Check
         *
         * Checks if number of counts is bigger or smaller than current limit. limit 0 is equal to unlimited
         *
         * @return boolean
         *
         * @throws Error
         */
        public async check(): Promise<boolean> {
            if (this._limit === 0) {
                return false;
            }

            const key = this.parseKey();

            if (this._limit > await this.count(key, this._time)) {
                this.hit(key, this._time);
                return false;
            }

            return true;
        }

        /**
         * Remaining
         *
         * Returns the number of current remaining counts
         *
         * @return number
         *
         * @throws Error
         */
        public async remaining(): Promise<number> {
            const left = this._limit - (await this.count(this.parseKey(), this._time) + 1); // Add one because we need to say how many left not how many done
            return Math.max(0, left);
        }

        /**
         * Limit
         *
         * Return the limit integer
         *
         * @return number
         */
        public limit(): number {
            return this._limit;
        }

        /**
         * Time
         *
         * Return the Datetime
         *
         * @return string
         */
        public time(): string {
            return this._time;
        }
    }
