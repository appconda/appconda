import { Adapter } from "../Adapter";
import { Connection } from "../Connection";

class Pool {
    private workerNum: number;
    private enableCoroutine: boolean = false;
    private callbacks: { [event: string]: Function[] } = {};

    constructor(workerNum: number) {
        this.workerNum = workerNum;
    }

    /**
     * Set pool options
     *
     * @param options { enable_coroutine: boolean }
     */
    public set(options: { enable_coroutine: boolean }): void {
        this.enableCoroutine = options.enable_coroutine;
    }

    /**
     * Start the pool
     */
    public start(): void {
        this.emit('start');
    }

    /**
     * Shutdown the pool
     */
    public shutdown(): void {
        this.emit('shutdown');
    }

    /**
     * Register an event callback
     *
     * @param event string
     * @param callback Function
     */
    public on(event: string, callback: Function): void {
        if (!this.callbacks[event]) {
            this.callbacks[event] = [];
        }
        this.callbacks[event].push(callback);
    }

    /**
     * Emit an event
     *
     * @param event string
     * @param args any[]
     */
    private emit(event: string, ...args: any[]): void {
        if (this.callbacks[event]) {
            for (const callback of this.callbacks[event]) {
                callback(...args);
            }
        }
    }
}


export class Swoole extends Adapter {
    protected pool: Pool;
    public connection: Connection = null as any;

    constructor(connection: Connection, workerNum: number, queue: string, namespace: string = 'appconda-queue') {
        super(workerNum, queue, namespace);
        this.connection = connection;
        this.pool = new Pool(workerNum);
    }

    /**
     * Start the pool
     *
     * @returns this
     */
    public start(): this {
        this.pool.set({ enable_coroutine: true });
        this.pool.start();
        return this;
    }

    /**
     * Stop the pool
     *
     * @returns this
     */
    public stop(): this {
        this.pool.shutdown();
        return this;
    }

    /**
     * Set worker start callback
     *
     * @param callback (workerId: string) => void
     * @returns this
     */
    public workerStart(callback: (workerId: string) => void): this {
        this.pool.on('WorkerStart', (pool: Pool, workerId: string) => {
            callback(workerId);
        });
        return this;
    }

    /**
     * Set worker stop callback
     *
     * @param callback (workerId: string) => void
     * @returns this
     */
    public workerStop(callback: (workerId: string) => void): this {
        this.pool.on('WorkerStop', (pool: Pool, workerId: string) => {
            callback(workerId);
        });
        return this;
    }

    /**
     * Get the native pool instance
     *
     * @returns Pool
     */
    public getNative(): Pool {
        return this.pool;
    }
}
