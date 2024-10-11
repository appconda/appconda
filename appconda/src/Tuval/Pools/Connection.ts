import { Pool } from "./Pool";

    export class Connection {
        protected id: string = '';
        protected pool: Pool | null = null;

        constructor(protected resource: any) {}

        getID(): string {
            return this.id;
        }

        setID(id: string): this {
            this.id = id;
            return this;
        }

        getResource(): any {
            return this.resource;
        }

        setResource(resource: any): this {
            this.resource = resource;
            return this;
        }

        getPool(): Pool | null {
            return this.pool;
        }

        setPool(pool: Pool): this {
            this.pool = pool;
            return this;
        }

        reclaim(): Pool {
            if (this.pool === null) {
                throw new Error('You cannot reclaim connection that does not have a pool.');
            }

            return this.pool.reclaim(this);
        }

        destroy(): Pool {
            if (this.pool === null) {
                throw new Error('You cannot destroy connection that does not have a pool.');
            }

            return this.pool.destroy(this);
        }
    }
