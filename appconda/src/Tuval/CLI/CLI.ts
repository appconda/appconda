
import { Hook, Validator } from '../../Tuval/Core';
import { execSync } from 'child_process';
import { Task } from './Task';

export class CLI {
    protected command: string = '';
    protected resources: Record<string, any> = {};
    protected static resourcesCallbacks: Record<string, { callback: Function, injections: string[], reset: boolean }> = {};
    protected args: string[] = [];
    protected tasks: Record<string, Task> = {};
    protected errors: Hook[] = [];
    protected _init: Hook[] = [];
    protected _shutdown: Hook[] = [];

    constructor(args: string[] = []) {
        /*  if (process.env.NODE_ENV !== 'cli') {
             throw new Error('CLI tasks can only work from the command line');
         } */

        this.args = this.parse(args.length > 0 ? args : process.argv) as any;
        //execSync(`title ${this.command}`);
    }

    public init(): Hook {
        const hook = new Hook();
        this._init.push(hook);
        return hook;
    }

    public shutdown(): Hook {
        const hook = new Hook();
        this._shutdown.push(hook);
        return hook;
    }

    public error(): Hook {
        const hook = new Hook();
        this.errors.push(hook);
        return hook;
    }

    public task(name: string): Task {
        const task = new Task(name);
        this.tasks[name] = task;
        return task;
    }

    public async getResource(name: string, fresh: boolean = false): Promise<any> {
        if (!this.resources[name] || fresh || CLI.resourcesCallbacks[name].reset) {
            if (!CLI.resourcesCallbacks[name]) {
                throw new Error(`Failed to find resource: "${name}"`);
            }
            const resources = await this.getResources(CLI.resourcesCallbacks[name].injections);
            this.resources[name] = await CLI.resourcesCallbacks[name].callback(...resources);
        }

        CLI.resourcesCallbacks[name].reset = false;
        return this.resources[name];
    }

    public async getResources(list: string[]): Promise<any[]> {
        return Promise.all(
            list.map(name => this.getResource(name))
        );

    }

    public static setResource(name: string, callback: Function, injections: string[] = []): void {
        CLI.resourcesCallbacks[name] = { callback, injections, reset: true };
    }

    public parse(args: string[]): Record<string, any> {
        console.log(args);
        args.shift(); // Remove node from args
        args.shift(); // Remove script path from args
        if (args[0]) {
            this.command = args.shift()!;
        } else {
            throw new Error('Missing command');
        }

        const output: Record<string, any> = {};

        args = args.map(arg => arg.startsWith('--') ? arg.substring(2) : arg);

        for (const arg of args) {
            const [key, value] = arg.split('=');
            if (!output[key]) {
                output[key] = [];
            }
            output[key].push(value);
        }

        for (const key in output) {
            if (output[key].length === 1) {
                output[key] = output[key][0];
            }
        }

        return output;
    }

    public match(): Task | null {
        return this.tasks[this.command] || null;
    }

    protected async getParams(hook: Hook): Promise<any[]> {
        const params: any[] = [];

        for (const [key, param] of Object.entries(hook.getParams())) {
            const value = this.args[key] || param.default;
            this.validate(key, param, value);
            params[param.order] = value;
        }

        for (const [key, injection] of Object.entries(hook.getInjections())) {
            params[injection.order] = await this.getResource(injection.name);
        }

        return params.sort((a, b) => a.order - b.order);
    }

    public async run(): Promise<any> {
        const command = this.match();

        try {
            if (command) {
                for (const hook of this._init) {
                    const action = hook.getAction();
                    const params = await this.getParams(hook);
                    await action(...params);
                }

                const action = command.getAction();
                const params = await this.getParams(command);
                await action(...params);

                for (const hook of this._shutdown) {
                    const action = hook.getAction();
                    const params = await this.getParams(hook);
                    await action(...params);
                }
            } else {
                throw new Error('No command found');
            }
        } catch (e) {
            for (const hook of this.errors) {
                CLI.setResource('error', () => e);
                const action = hook.getAction();
                const params = await this.getParams(hook);
                await action(...params);
            }
        }

        return this;
    }

    public getTasks(): Task[] {
        return Object.values(this.tasks);
    }

    public getArgs(): string[] {
        return this.args;
    }

    protected validate(key: string, param: any, value: any): void {
        if (value !== '') {
            let validator = param.validator;

            if (typeof validator === 'function') {
                validator = validator();
            }

            if (!(validator instanceof Validator)) {
                throw new Error('Validator object is not an instance of the Validator class');
            }

            if (!validator.isValid(value)) {
                throw new Error(`Invalid ${key}: ${validator.getDescription()}`);
            }
        } else if (!param.optional) {
            throw new Error(`Param "${key}" is not optional.`);
        }
    }

    public static reset(): void {
        CLI.resourcesCallbacks = {};
    }
}