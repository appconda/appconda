import { Connection } from "./Connection";

export abstract class Adapter {
    public workerNum: number;
    public queue: string;
    public namespace: string;
    public connection: Connection = null as any;

    constructor(workerNum: number, queue: string, namespace: string = 'utopia-queue') {
        this.workerNum = workerNum;
        this.queue = queue;
        this.namespace = namespace;
    }

    /**
     * Starts the Server.
     * @returns {this}
     */
    abstract start(): this;

    /**
     * Stops the Server.
     * @returns {this}
     */
    abstract stop(): this;

    /**
     * Is called when a Worker starts.
     * @param callback - A callback function.
     * @returns {this}
     */
    abstract workerStart(callback: Function): this;

    /**
     * Is called when a Worker stops.
     * @param callback - A callback function.
     * @returns {this}
     */
    abstract workerStop(callback: Function): this;

    /**
     * Returns the native server object from the Adapter.
     * @returns {any}
     */
    abstract getNative(): any;
}