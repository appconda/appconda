import { Connection } from "./Connection";

    export class Pool {
        protected name: string;
        protected size: number = 0;
        protected init: Function;
        protected reconnectAttempts: number = 3;
        protected reconnectSleep: number = 1; // seconds
        protected retryAttempts: number = 3;
        protected retrySleep: number = 1; // seconds
        protected pool: (Connection | true)[] = [];
        protected active: { [key: string]: Connection } = {};

        constructor(name: string, size: number, init: () => any) {
            this.name = name;
            this.size = size;
            this.init = init;
            this.pool = Array(size).fill(true);
        }

        getName(): string {
            return this.name;
        }

        getSize(): number {
            return this.size;
        }

        getReconnectAttempts(): number {
            return this.reconnectAttempts;
        }

        setReconnectAttempts(reconnectAttempts: number): this {
            this.reconnectAttempts = reconnectAttempts;
            return this;
        }

        getReconnectSleep(): number {
            return this.reconnectSleep;
        }

        setReconnectSleep(reconnectSleep: number): this {
            this.reconnectSleep = reconnectSleep;
            return this;
        }

        getRetryAttempts(): number {
            return this.retryAttempts;
        }

        setRetryAttempts(retryAttempts: number): this {
            this.retryAttempts = retryAttempts;
            return this;
        }

        getRetrySleep(): number {
            return this.retrySleep;
        }

        setRetrySleep(retrySleep: number): this {
            this.retrySleep = retrySleep;
            return this;
        }

        async pop(): Promise<Connection> {
            let attempts = 0;
            let connection: Connection | true | null = null;

            do {
                attempts++;
                connection = this.pool.pop() || null;

                if (connection === null) {
                    if (attempts >= this.getRetryAttempts()) {
                        throw new Error(`Pool '${this.name}' is empty (size ${this.size})`);
                    }
                    await this.sleep(this.getRetrySleep());
                } else {
                    break;
                }
            } while (attempts < this.getRetryAttempts());

            if (connection === true) { // Pool has space, create connection
                attempts = 0;

                do {
                    try {
                        attempts++;
                        connection = new Connection(await this.init());
                        break; // leave loop if successful
                    } catch (e: any) {
                        if (attempts >= this.getReconnectAttempts()) {
                            throw new Error('Failed to create connection: ' + e.message);
                        }
                        await this.sleep(this.getReconnectSleep());
                    }
                } while (attempts < this.getReconnectAttempts());
            }

            if (connection instanceof Connection) { // connection is available, return it
                connection.setID(this.getName() + '-' + this.generateUniqueId())
                          .setPool(this);

                this.active[connection.getID()] = connection;
                return connection;
            }

            throw new Error('Failed to get a connection from the pool');
        }

        push(connection: Connection): this {
            this.pool.push(connection);
            delete this.active[connection.getID()];
            return this;
        }

        count(): number {
            return this.pool.length;
        }

        reclaim(connection: Connection | null = null): this {
            if (connection !== null) {
                this.push(connection);
                return this;
            }

            for (const conn of Object.values(this.active)) {
                this.push(conn);
            }

            return this;
        }

        destroy(connection: Connection | null = null): this {
            if (connection !== null) {
                this.pool.push(true);
                delete this.active[connection.getID()];
                return this;
            }

            for (const conn of Object.values(this.active)) {
                this.pool.push(true);
                delete this.active[conn.getID()];
            }

            return this;
        }

        isEmpty(): boolean {
            return this.pool.length === 0;
        }

        isFull(): boolean {
            return this.pool.length === this.size;
        }

        private sleep(seconds: number): Promise<void> {
            return new Promise(resolve => setTimeout(resolve, seconds * 1000));
        }

        private generateUniqueId(): string {
            return Math.random().toString(36).substr(2, 9);
        }
    }
