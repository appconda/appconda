

import { Module } from './Module';
import { Service } from './Service';

import { Action } from './Action';
import { CLI } from '../CLI/CLI';
import { Server } from '../Queue';
import { App, Route } from '../Http';
import { Swoole } from '../Queue/Adapter/Swoole';


export abstract class Platform {
    protected core: Module;
    protected modules: Module[] = [];
    protected cli: CLI;
    protected worker: Server;

    constructor(module: Module) {
        this.core = module;
        this.modules.push(module);
    }

    /**
     * Initialize Application
     *
     * @param type string
     * @param params any
     * @returns void
     */
    public init(type: string, params: any = {}): void {
        for (const module of this.modules) {
            const services = module.getServicesByType(type);
            switch (type) {
                case Service.TYPE_HTTP:
                    this.initHttp(services);
                    break;
                case Service.TYPE_TASK:
                    this.cli ||= new CLI();
                    this.initTasks(services);
                    break;
                case Service.TYPE_GRAPHQL:
                    this.initGraphQL();
                    break;
                case Service.TYPE_WORKER:
                    const workerName = params.workerName ?? null;

                    if (!this.worker) {
                        const connection = params.connection ?? null;
                        const workersNum = params.workersNum ?? 0;
                        const queueName = params.queueName ?? 'v1-' + workerName;
                        const adapter = new Swoole(connection, workersNum, queueName);
                        this.worker = new Server(adapter);
                    }
                    this.initWorker(services, workerName);
                    break;
                default:
                    throw new Error('Please provide which type of initialization you want to carry out.');
            }
        }
    }

    /**
     * Init HTTP service
     *
     * @param services Service[]
     * @returns void
     */
    protected initHttp(services: Service[]): void {
        for (const service of services) {
            for (const action of service.getActions()) {
                let hook;
                switch (action.getType()) {
                    case Action.TYPE_INIT:
                        hook = App.init();
                        break;
                    case Action.TYPE_ERROR:
                        hook = App.error();
                        break;
                    case Action.TYPE_OPTIONS:
                        hook = App.options();
                        break;
                    case Action.TYPE_SHUTDOWN:
                        hook = App.shutdown();
                        break;
                    case Action.TYPE_DEFAULT:
                    default:
                        hook = App.addRoute(action.getHttpMethod(), action.getHttpPath());
                        break;
                }

                hook.groups(action.getGroups()).desc(action.getDesc() ?? '');

                if (hook instanceof Route) {
                    if (action.getHttpAliasPath()) {
                        hook.alias(action.getHttpAliasPath());
                    }
                }

                for (const [key, option] of Object.entries(action.getOptions())) {
                    switch (option.type) {
                        case 'param':
                            const paramKey = key.substring(key.indexOf(':') + 1);
                            hook.param(paramKey, option.default, option.validator, option.description, option.optional, option.injections);
                            break;
                        case 'injection':
                            hook.inject(option.name);
                            break;
                    }
                }

                for (const [key, label] of Object.entries(action.getLabels())) {
                    hook.label(key, label);
                }

                hook.action(action.getCallback());
            }
        }
    }

    /**
     * Init CLI Services
     *
     * @param services Service[]
     * @returns void
     */
    protected initTasks(services: Service[]): void {
        const cli = this.cli;
        for (const service of services) {
            for (const [key, action] of Object.entries(service.getActions())) {
                let hook;
                switch (action.getType()) {
                    case Action.TYPE_INIT:
                        hook = cli.init();
                        break;
                    case Action.TYPE_ERROR:
                        hook = cli.error();
                        break;
                    case Action.TYPE_SHUTDOWN:
                        hook = cli.shutdown();
                        break;
                    case Action.TYPE_DEFAULT:
                    default:
                        hook = cli.task(key);
                        break;
                }
                hook.groups(action.getGroups()).desc(action.getDesc() ?? '');

                for (const [key, option] of Object.entries(action.getOptions())) {
                    switch (option.type) {
                        case 'param':
                            const paramKey = key.substring(key.indexOf(':') + 1);
                            hook.param(paramKey, option.default, option.validator, option.description, option.optional, option.injections);
                            break;
                        case 'injection':
                            hook.inject(option.name);
                            break;
                    }
                }

                for (const [key, label] of Object.entries(action.getLabels())) {
                    hook.label(key, label);
                }

                hook.action(action.getCallback());
            }
        }
    }

    /**
     * Init worker Services
     *
     * @param services Service[]
     * @param workerName string
     * @returns void
     */
    protected initWorker(services: Service[], workerName: string): void {
        const worker = this.worker;
        for (const service of services) {
            for (const [key, action] of Object.entries(service.getActions())) {
                if (action.getType() === Action.TYPE_DEFAULT && !key.toLowerCase().includes(workerName.toLowerCase())) {
                    continue;
                }
                let hook;
                switch (action.getType()) {
                    case Action.TYPE_INIT:
                        hook = worker.init();
                        break;
                    case Action.TYPE_ERROR:
                        hook = worker.error();
                        break;
                    case Action.TYPE_SHUTDOWN:
                        hook = worker.shutdown();
                        break;
                    case Action.TYPE_WORKER_START:
                        hook = worker.workerStart();
                        break;
                    case Action.TYPE_DEFAULT:
                    default:
                        hook = worker.job();
                        break;
                }
                hook.groups(action.getGroups()).desc(action.getDesc() ?? '');

                for (const [key, option] of Object.entries(action.getOptions())) {
                    switch (option.type) {
                        case 'param':
                            const paramKey = key.substring(key.indexOf(':') + 1);
                            hook.param(paramKey, option.default, option.validator, option.description, option.optional, option.injections);
                            break;
                        case 'injection':
                            hook.inject(option.name);
                            break;
                    }
                }

                for (const [key, label] of Object.entries(action.getLabels())) {
                    hook.label(key, label);
                }

                hook.action(action.getCallback());
            }
        }
    }

    /**
     * Initialize GraphQL Services
     *
     * @returns void
     */
    protected initGraphQL(): void {
        // Implementation for GraphQL initialization
    }

    /**
     * Add module
     *
     * @param module Module
     * @returns this
     */
    public addModule(module: Module): this {
        this.modules.push(module);
        return this;
    }

    /**
     * Add Service
     *
     * @param key string
     * @param service Service
     * @returns this
     */
    public addService(key: string, service: Service): this {
        this.core.addService(key, service);
        return this;
    }

    /**
     * Remove Service
     *
     * @param key string
     * @returns this
     */
    public removeService(key: string): this {
        this.core.removeService(key);
        return this;
    }

    /**
     * Get Service
     *
     * @param key string
     * @returns Service | null
     */
    public getService(key: string): Service | null {
        return this.core.getService(key);
    }

    /**
     * Get Services
     *
     * @returns { [key: string]: Service }
     */
    public getServices():  Service[] {
        return this.core.getServices();
    }

    /**
     * Get the value of cli
     *
     * @returns CLI
     */
    public getCli(): CLI {
        return this.cli;
    }

    /**
     * Set the value of cli
     *
     * @param cli CLI
     * @returns this
     */
    public setCli(cli: CLI): this {
        this.cli = cli;
        return this;
    }

    /**
     * Get the value of worker
     *
     * @returns Server
     */
    public getWorker(): Server {
        return this.worker;
    }

    /**
     * Set the value of worker
     *
     * @param worker Server
     * @returns this
     */
    public setWorker(worker: Server): this {
        this.worker = worker;
        return this;
    }

    /**
     * Get env
     *
     * @param key string
     * @param defaultValue string | null
     * @returns any
     */
    public getEnv(key: string, defaultValue: string | null = null): any {
        return process.env[key] ?? defaultValue;
    }
}