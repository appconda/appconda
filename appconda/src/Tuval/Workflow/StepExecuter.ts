import { Container } from "../../Container";
import { Console } from "../../Tuval/CLI";
import { Hook, Validator } from "../../Tuval/Core";
import { Job } from "../../Tuval/Queue";
import { WorkflowStep } from "./Step";
import { Workflow } from "./Workflow";
var fs = require('fs');
var path = require('path');

type ResourceCallback = {
    callback: (...args: any[]) => any;
    injections: string[];
    reset: boolean;
};

export class StepExecuter {

    private serviceName: string;

    private actionName: string;

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
    protected resourcesCallbacks: Record<string, ResourceCallback> = {};

    _job: Job;


    /**
    * Initialize and return a Job instance
    * @returns Job instance
    */
    public job(): Job {
        this._job = new Job();
        return this._job;
    }

    constructor(public workflow: Workflow, public step: WorkflowStep) {

    }



    /**
     * If a resource has been created, return it; otherwise, create it and then return it
     * @param name - The name of the resource
     * @param fresh - Whether to fetch a fresh instance
     * @returns The requested resource
     * @throws Error if the resource callback is not found
     */
    public async getResource(name: string, fresh: boolean = false): Promise<any> {
        if (!(name in this.resources) || fresh || (this.resourcesCallbacks[name] && this.resourcesCallbacks[name].reset)) {

            if (!(name in this.resourcesCallbacks) && !(name in (Workflow as any).resourcesCallbacks)) {
                throw new Error(`Failed to find resource: "${name}"`);
            }

            // We do injection propogation
            if (name in this.resourcesCallbacks) {
                const resourceCallback = this.resourcesCallbacks[name];
                this.resources[name] = await resourceCallback.callback(...(await this.getResources(resourceCallback.injections)));
                this.resourcesCallbacks[name].reset = false;
            } else if (name in (Workflow as any).resourcesCallbacks) {
                this.resources[name] = await this.workflow.getResource(name, fresh);
            }
        }

        return this.resources[name];
    }

    /**
     * Get multiple resources by their names
     * @param list - List of resource names
     * @returns An array of resources
     */
    public async getResources(list: string[]): Promise<any[]> {
        const resources: any[] = [];

        for (const name of list) {
            resources.push(await this.getResource(name));
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
    public setResource(name: string, callback: (...args: any[]) => any, injections: string[] = []): void {
        if (typeof callback !== "function") {
            throw new Error("Callback must be a function");
        }

        this.resourcesCallbacks[name] = { callback, injections, reset: true };
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
    public async stop(): Promise<any> {
        try {
            //this.adapter.stop();
        } catch (error) {
            this.setResource("error", () => error);
            for (const hook of this.errorHooks) {
                hook.getAction()(...(await this.getArguments(hook)));
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

    public async run(): Promise<any> {
        const payload: any = this.step.getPayload();
        let ret = {
            type: 'END'
        };

        try {
            this.setResource('payload', () => payload);

            if (this._job.getHook()) {
                for (const hook of this.initHooks) { // Global init hooks
                    if (hook.getGroups().includes("*")) {
                        const args = await this.getArguments(hook, payload);
                        hook.getAction()(...args);
                    }
                }
            }

            for (const group of this._job.getGroups()) {
                for (const hook of this.initHooks) { // Group init hooks
                    if (hook.getGroups().includes(group)) {
                        const args = await this.getArguments(hook, payload);
                        hook.getAction()(...args);
                    }
                }
            }

            const args = await this.getArguments(this._job, payload);
            const action = this._job.getAction();
            const retTemp = await action(...args);
            if (retTemp) {
                ret = retTemp;
            }



            if (this._job.getHook()) {
                for (const hook of this.shutdownHooks) { // Global shutdown hooks
                    if (hook.getGroups().includes("*")) {
                        const args = await this.getArguments(hook, payload);
                        hook.getAction()(...args);
                    }
                }
            }

            for (const group of this._job.getGroups()) {
                for (const hook of this.shutdownHooks) { // Group shutdown hooks
                    if (hook.getGroups().includes(group)) {
                        const args = await this.getArguments(hook, payload);
                        hook.getAction()(...args);
                    }
                }
            }

            //Console.success(`[Job] (${message.getPid()}) successfully run.`);
        } catch (th) {
            this.setResource("error", () => th);
            for (const hook of this.errorHooks) {
                hook.getAction()(...(await this.getArguments(hook)));
            }

            Console.error(th);

        } finally {
            this.setResource('payload', () => { })
        }

        return ret;
    }

    /**
     * Starts the Queue Server
     * @returns The current Server instance
     */
    public async start(): Promise<any> {
        try {

        } catch (error) {
            this.setResource("error", () => error);
            for (const hook of this.errorHooks) {
                hook.getAction()(...(await this.getArguments(hook)));
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
    public async workerStop(callback?: () => void): Promise<any> {
        try {

        } catch (error) {
            this.setResource("error", () => error);
            for (const hook of this.errorHooks) {
                hook.getAction()(...(await this.getArguments(hook)));
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
    protected async getArguments(hook: Hook, payload: Record<string, any> = {}): Promise<any[]> {
        const argumentsArray: any[] = [];

        for (const [key, param] of Object.entries(hook.getParams())) {
            let value = payload[key] ?? param.default;
            value = (value === "" || value == null) ? param.default : value;

            await this.validate(key, param, value);
            hook.setParamValue(key, value);
            argumentsArray[param.order] = value;
        }

        for (const [key, injection] of Object.entries(hook.getInjections())) {
            argumentsArray[injection.order] = await this.getResource(injection.name);
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
    protected async validate(key: string, param: any, value: any): Promise<void> {
        if (value !== "" && value !== null) {
            let validator = param.validator;

            if (typeof validator === "function") {
                validator = validator(...(await this.getResources(param.injections)));
            }

            if (!(validator instanceof Validator)) {
                throw new Error(`Validator object is not an instance of the Validator class`);
            }

            if (!validator.isValid(value)) {
                throw new Error(`Invalid ${key}: ${validator.getDescription()}`);
            }
        } else if (!param.optional) {
            throw new Error(`Param "${key}" is not optional in action ${this.actionName} of ${this.serviceName} service.`);
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