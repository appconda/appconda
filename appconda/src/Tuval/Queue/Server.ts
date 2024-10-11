
import { Job } from "./Job";
import { Message } from "./Message";
//import { Console } from "./Console";
import { Adapter } from "./Adapter";
import { Validator , Hook} from "../../Tuval/Core";

type ResourceCallback = {
    callback: (...args: any[]) => any;
    injections: string[];
    reset: boolean;
};

export class Server {
    /**
     * Queue Adapter
     */
    protected adapter: Adapter;

    /**
     * Job
     */
    protected _job!: Job;

    /**
     * Hooks that will run when an error occurs
     */
    protected errorHooks: Hook[] = [];

    /**
     * Hooks that will run before running a job
     */
    protected initHooks: Hook[] = [];

    /**
     * Hooks that will run after running a job
     */
    protected shutdownHooks: Hook[] = [];

    /**
     * Hook that is called when a worker starts
     */
    protected workerStartHook!: Hook;

    /**
     * Resources
     */
    protected resources: Record<string, any> = {
        error: null,
    };

    /**
     * Resource callbacks
     */
    protected static resourcesCallbacks: Record<string, ResourceCallback> = {};

    /**
     * Creates an instance of a Queue server.
     * @param adapter - The queue adapter to use
     */
    constructor(adapter: Adapter) {
        this.adapter = adapter;
    }

    /**
     * Initialize and return a Job instance
     * @returns Job instance
     */
    public job(): Job {
        this._job = new Job();
        return this._job;
    }

    /**
     * If a resource has been created, return it; otherwise, create it and then return it
     * @param name - The name of the resource
     * @param fresh - Whether to fetch a fresh instance
     * @returns The requested resource
     * @throws Error if the resource callback is not found
     */
    public getResource(name: string, fresh: boolean = false): any {
        if (!(name in this.resources) || fresh || (Server.resourcesCallbacks[name] && Server.resourcesCallbacks[name].reset)) {
            if (!(name in Server.resourcesCallbacks)) {
                throw new Error(`Failed to find resource: "${name}"`);
            }

            const resourceCallback = Server.resourcesCallbacks[name];
            this.resources[name] = resourceCallback.callback(...this.getResources(resourceCallback.injections));

            Server.resourcesCallbacks[name].reset = false;
        }

        return this.resources[name];
    }

    /**
     * Get multiple resources by their names
     * @param list - List of resource names
     * @returns An array of resources
     */
    public getResources(list: string[]): any[] {
        const resources: any[] = [];

        for (const name of list) {
            resources.push(this.getResource(name));
        }

        return resources;
    }

    /**
     * Set a new resource callback
     * @param name - The name of the resource
     * @param callback - The callback function to create the resource
     * @param injections - Dependencies to inject into the callback
     * @throws Error if inputs are invalid
     */
    public static setResource(name: string, callback: (...args: any[]) => any, injections: string[] = []): void {
        if (typeof callback !== "function") {
            throw new Error("Callback must be a function");
        }

        Server.resourcesCallbacks[name] = { callback, injections, reset: true };
    }

    /**
     * Register a shutdown hook
     * @returns The created Hook instance
     */
    public shutdown(): Hook {
        const hook = new Hook();
        hook.groups(["*"]);
        this.shutdownHooks.push(hook);
        return hook;
    }

    /**
     * Stops the Queue server.
     * @returns The current Server instance
     */
    public stop(): this {
        try {
            this.adapter.stop();
        } catch (error) {
            Server.setResource("error", () => error);
            for (const hook of this.errorHooks) {
                hook.getAction()(...this.getArguments(hook));
            }
        }
        return this;
    }

    /**
     * Register an initialization hook
     * @returns The created Hook instance
     */
    public init(): Hook {
        const hook = new Hook();
        hook.groups(["*"]);
        this.initHooks.push(hook);
        return hook;
    }

    /**
     * Starts the Queue Server
     * @returns The current Server instance
     */
    public start(): this {
        try {
            this.adapter.workerStart(async (workerId: string) => {
               // Console.success(`[Worker] Worker ${workerId} is ready!`);
                if (this.workerStartHook) {
                    this.workerStartHook.getAction()(...this.getArguments(this.workerStartHook));
                }

                while (true) {
                    /**
                     * Waiting for the next Job.
                     */
                    const nextMessageData = await this.adapter.connection.rightPopArray(`${this.adapter.namespace}.queue.${this.adapter.queue}`, 5);

                    if (!nextMessageData) {
                        continue;
                    }

                    nextMessageData.timestamp = parseInt(nextMessageData.timestamp as string, 10);

                    const message = new Message(nextMessageData);

                    Server.setResource("message", () => message);

                    //Console.info(`[Job] Received Job (${message.getPid()}).`);

                    /**
                     * Move Job to Jobs and its PID to the processing list.
                     */
                    this.adapter.connection.setArray(`${this.adapter.namespace}.jobs.${this.adapter.queue}.${message.getPid()}`, nextMessageData);
                    this.adapter.connection.leftPush(`${this.adapter.namespace}.processing.${this.adapter.queue}`, message.getPid());

                    /**
                     * Increment Total Jobs Received from Stats.
                     */
                    this.adapter.connection.increment(`${this.adapter.namespace}.stats.${this.adapter.queue}.total`);

                    try {
                        /**
                         * Increment Processing Jobs from Stats.
                         */
                        this.adapter.connection.increment(`${this.adapter.namespace}.stats.${this.adapter.queue}.processing`);

                        if (this._job.getHook()) {
                            for (const hook of this.initHooks) { // Global init hooks
                                if (hook.getGroups().includes("*")) {
                                    const args = this.getArguments(hook, message.getPayload());
                                    hook.getAction()(...args);
                                }
                            }
                        }

                        for (const group of this._job.getGroups()) {
                            for (const hook of this.initHooks) { // Group init hooks
                                if (hook.getGroups().includes(group)) {
                                    const args = this.getArguments(hook, message.getPayload());
                                    hook.getAction()(...args);
                                }
                            }
                        }

                        this._job.getAction()(...this.getArguments(this._job, message.getPayload()));

                        /**
                         * Remove Jobs if successful.
                         */
                        this.adapter.connection.remove(`${this.adapter.namespace}.jobs.${this.adapter.queue}.${message.getPid()}`);

                        /**
                         * Increment Successful Jobs from Stats.
                         */
                        this.adapter.connection.increment(`${this.adapter.namespace}.stats.${this.adapter.queue}.success`);

                        if (this._job.getHook()) {
                            for (const hook of this.shutdownHooks) { // Global shutdown hooks
                                if (hook.getGroups().includes("*")) {
                                    const args = this.getArguments(hook, message.getPayload());
                                    hook.getAction()(...args);
                                }
                            }
                        }

                        for (const group of this._job.getGroups()) {
                            for (const hook of this.shutdownHooks) { // Group shutdown hooks
                                if (hook.getGroups().includes(group)) {
                                    const args = this.getArguments(hook, message.getPayload());
                                    hook.getAction()(...args);
                                }
                            }
                        }

                        //Console.success(`[Job] (${message.getPid()}) successfully run.`);
                    } catch (th) {
                        /**
                         * Move failed Job to Failed list.
                         */
                        this.adapter.connection.leftPush(`${this.adapter.namespace}.failed.${this.adapter.queue}`, message.getPid());

                        /**
                         * Increment Failed Jobs from Stats.
                         */
                        this.adapter.connection.increment(`${this.adapter.namespace}.stats.${this.adapter.queue}.failed`);

                        //Console.error(`[Job] (${message.getPid()}) failed to run.`);
                        //Console.error(`[Job] (${message.getPid()}) ${th.message}`);

                        Server.setResource("error", () => th);
                        for (const hook of this.errorHooks) {
                            hook.getAction()(...this.getArguments(hook));
                        }
                    } finally {
                        /**
                         * Remove Job from Processing.
                         */
                        this.adapter.connection.listRemove(`${this.adapter.namespace}.processing.${this.adapter.queue}`, message.getPid());

                        /**
                         * Decrease Processing Jobs from Stats.
                         */
                        this.adapter.connection.decrement(`${this.adapter.namespace}.stats.${this.adapter.queue}.processing`);
                    }

                    this.resources = {};
                }
            });

            this.adapter.start();
        } catch (error) {
            Server.setResource("error", () => error);
            for (const hook of this.errorHooks) {
                hook.getAction()(...this.getArguments(hook));
            }
        }
        return this;
    }

    /**
     * Is called when a Worker starts.
     * @returns The created Hook instance
     */
    public workerStart(): Hook {
        const hook = new Hook();
        hook.groups(["*"]);
        this.workerStartHook = hook;
        return hook;
    }

    /**
     * Returns the Worker start hook.
     * @returns The Worker start Hook instance
     */
    public getWorkerStart(): Hook {
        return this.workerStartHook;
    }

    /**
     * Is called when a Worker stops.
     * @param callback - The callback to execute on worker stop
     * @returns The current Server instance
     */
    public workerStop(callback?: () => void): this {
        try {
            this.adapter.workerStop((workerId: string) => {
                //Console.success(`[Worker] Worker ${workerId} is stopping!`);
                if (callback) {
                    callback();
                }
            });
        } catch (error) {
            Server.setResource("error", () => error);
            for (const hook of this.errorHooks) {
                hook.getAction()(...this.getArguments(hook));
            }
        }

        return this;
    }

    /**
     * Get Arguments for Hook execution
     * @param hook - The Hook instance
     * @param payload - The payload to pass to the hook
     * @returns An array of arguments
     */
    protected getArguments(hook: Hook, payload: Record<string, any> = {}): any[] {
        const argumentsArray: any[] = [];

        for (const [key, param] of Object.entries(hook.getParams())) {
            let value = payload[key] ?? param.default;
            value = (value === "" || value === null) ? param.default : value;

            this.validate(key, param, value);
            hook.setParamValue(key, value);
            argumentsArray[param.order] = value;
        }

        for (const [key, injection] of Object.entries(hook.getInjections())) {
            argumentsArray[injection.order] = this.getResource(injection.name);
        }

        return argumentsArray;
    }

    /**
     * Validate a parameter
     * @param key - The parameter key
     * @param param - The parameter configuration
     * @param value - The value to validate
     * @throws Error if validation fails
     */
    protected validate(key: string, param: any, value: any): void {
        if (value !== "" && value !== null) {
            let validator = param.validator;

            if (typeof validator === "function") {
                validator = validator(...this.getResources(param.injections));
            }

            if (!(validator instanceof Validator)) {
                throw new Error(`Validator object is not an instance of the Validator class`);
            }

            if (!validator.isValid(value)) {
                throw new Error(`Invalid ${key}: ${validator.getDescription()}`);
            }
        } else if (!param.optional) {
            throw new Error(`Param "${key}" is not optional.`);
        }
    }

    /**
     * Register an error hook. Will be executed when an error occurs.
     * @returns The created Hook instance
     */
    public error(): Hook {
        const hook = new Hook();
        hook.groups(["*"]);
        this.errorHooks.push(hook);
        return hook;
    }
}