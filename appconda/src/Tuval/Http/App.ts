
import { Hook } from './Hook';
import { Route } from './Route';
import { Request } from './Request';
import { Response } from './Response';
import { Validator } from '../../Tuval/Core';
import { Router } from './Router';
import { parse } from 'url';
import { Console } from '../CLI';

interface Param {
    default: string | ((...args: any[]) => any);
    skipValidation: boolean;
    optional: boolean;
    validator: Validator | ((...args: any[]) => Validator);
    injections: string[];
    order: number;
}

interface Injection {
    name: string;
    order: number;
}

export class App {
    /**
     * İstek methodu sabitleri
     */
    public static readonly REQUEST_METHOD_GET = 'GET';
    public static readonly REQUEST_METHOD_POST = 'POST';
    public static readonly REQUEST_METHOD_PUT = 'PUT';
    public static readonly REQUEST_METHOD_PATCH = 'PATCH';
    public static readonly REQUEST_METHOD_DELETE = 'DELETE';
    public static readonly REQUEST_METHOD_OPTIONS = 'OPTIONS';
    public static readonly REQUEST_METHOD_HEAD = 'HEAD';

    /**
     * Mod Türü
     */
    public static readonly MODE_TYPE_DEVELOPMENT = 'development';
    public static readonly MODE_TYPE_STAGE = 'stage';
    public static readonly MODE_TYPE_PRODUCTION = 'production';

    /**
     * @var resources
     */
    protected resources: Record<string, any> = {
        error: null,
    };

    /**
     * @var resourcesCallbacks
     */
    protected static resourcesCallbacks: Record<string, { callback: Function; injections: string[]; reset: boolean }> = {};

    /**
     * Şu anki çalıştırma modu
     */
    protected static mode: string = '';

    /**
     * Errors
     * Errors callbacks
     */
    protected static errors: Hook[] = [];

    /**
     * Init
     * A callback function that is initialized on application start
     */
    protected static _init: Hook[] = [];

    /**
     * Shutdown
     * A callback function that is initialized on application end
     */
    protected static _shutdown: Hook[] = [];

    /**
     * Options
     * A callback function for options method requests
     */
    protected static _options: Hook[] = [];

    /**
     * Route
     * Memory cached result for chosen route
     */
    protected route: Route | null = null;

    /**
     * Wildcard route
     * If set, this gets executed if no other route is matched
     */
    protected static wildcardRoute: Route | null = null;

    /**
     * App
     * @param timezone
     */
    constructor(timezone: string) {
        process.env.TZ = timezone;
    }

    /**
     * GET
     * Add GET request route
     * @param url
     * @returns Route
     */
    public static get(url: string): Route {
        return this.addRoute(this.REQUEST_METHOD_GET, url);
    }

    /**
     * POST
     * Add POST request route
     * @param url
     * @returns Route
     */
    public static post(url: string): Route {
        return this.addRoute(this.REQUEST_METHOD_POST, url);
    }

    /**
     * PUT
     * Add PUT request route
     * @param url
     * @returns Route
     */
    public static put(url: string): Route {
        return this.addRoute(this.REQUEST_METHOD_PUT, url);
    }

    /**
     * PATCH
     * Add PATCH request route
     * @param url
     * @returns Route
     */
    public static patch(url: string): Route {
        return this.addRoute(this.REQUEST_METHOD_PATCH, url);
    }

    /**
     * DELETE
     * Add DELETE request route
     * @param url
     * @returns Route
     */
    public static delete(url: string): Route {
        return this.addRoute(this.REQUEST_METHOD_DELETE, url);
    }

    /**
     * Wildcard
     * Add Wildcard route
     * @returns Route
     */
    public static wildcard(): Route {
        this.wildcardRoute = new Route('', '');
        return this.wildcardRoute;
    }

    /**
     * Init
     * Set a callback function that will be initialized on application start
     * @returns Hook
     */
    public static init(): Hook {
        const hook = new Hook();
        hook.groups(['*']);
        this._init.push(hook);
        return hook;
    }

    /**
     * Shutdown
     * Set a callback function that will be initialized on application end
     * @returns Hook
     */
    public static shutdown(): Hook {
        const hook = new Hook();
        hook.groups(['*']);
        this._shutdown.push(hook);
        return hook;
    }

    /**
     * Options
     * Set a callback function for all requests with OPTIONS method
     * @returns Hook
     */
    public static options(): Hook {
        const hook = new Hook();
        hook.groups(['*']);
        this._options.push(hook);
        return hook;
    }

    /**
     * Error
     * An error callback for failed or no matched requests
     * @returns Hook
     */
    public static error(): Hook {
        const hook = new Hook();
        hook.groups(['*']);
        this.errors.push(hook);
        return hook;
    }

    /**
     * Get env var
     * Method for querying environment variables. If key is not found, default value will be returned.
     * @param key
     * @param defaultValue
     * @returns string | null
     */
    public static getEnv(key: string, defaultValue: string | null = null): string | null {
        return process.env[key] ?? defaultValue;
    }

    /**
     * Get Mode
     * Get current mode
     * @returns string
     */
    public static getMode(): string {
        return this.mode;
    }

    /**
     * Set Mode
     * Set current mode
     * @param value
     */
    public static setMode(value: string): void {
        this.mode = value;
    }

    /**
     * Get allow override
     * @returns boolean
     */
    public static getAllowOverride(): boolean {
        return Router.getAllowOverride();
    }

    /**
     * Set Allow override
     * @param value
     */
    public static setAllowOverride(value: boolean): void {
        Router.setAllowOverride(value);
    }

    /**
     * If a resource has been created return it, otherwise create it and then return it
     * @param name
     * @param fresh
     * @returns any
     * @throws Error
     */
    public async getResource(name: string, fresh: boolean = false): Promise<any> {
        if (name === 'appconda') {
            return this;
        }

        if (!(name in this.resources) || fresh || App.resourcesCallbacks[name]?.reset) {
            if (!(name in App.resourcesCallbacks)) {
                throw new Error(`Failed to find resource: "${name}"`);
            }

            this.resources[name] = await App.resourcesCallbacks[name].callback(await this.getResources(App.resourcesCallbacks[name].injections));
            App.resourcesCallbacks[name].reset = false;
        }

        return this.resources[name];
    }

    /**
     * Get Resources By List
     * @param list
     * @returns Record<string, any>
     */
    public async getResources(list: string[]): Promise<Record<string, any>> {
        const resources: Record<string, any> = {};

        for (const name of list) {
            resources[name] = await this.getResource(name);
        }

        return resources;
    }

    /**
     * Set a new resource callback
     * @param name
     * @param callback
     * @param injections
     * @throws Error
     */
    public static setResource(name: string, callback: Function, injections: string[] = []): void {
        if (name === 'appconda') {
            throw new Error(`'appconda' is a reserved keyword.`);
        }
        this.resourcesCallbacks[name] = { callback, injections, reset: true };
    }

    /**
     * Is app in production mode?
     * @returns boolean
     */
    public static isProduction(): boolean {
        return this.mode === this.MODE_TYPE_PRODUCTION;
    }

    /**
     * Is app in development mode?
     * @returns boolean
     */
    public static isDevelopment(): boolean {
        return this.mode === this.MODE_TYPE_DEVELOPMENT;
    }

    /**
     * Is app in stage mode?
     * @returns boolean
     */
    public static isStage(): boolean {
        return this.mode === this.MODE_TYPE_STAGE;
    }

    /**
     * Get Routes
     * Get all application routes
     * @returns Route[]
     */
    public static getRoutes(): { [key: string]: Route[] } {
        return Router.getRoutes();
    }

    /**
     * Get the current route
     * @returns Route | null
     */
    public getRoute(): Route {
        return this.route ?? null as any;
    }

    /**
     * Set the current route
     * @param route
     * @returns this
     */
    public setRoute(route: Route): this {
        this.route = route;
        return this;
    }

    /**
     * Add Route
     * Add routing route method, path and callback
     * @param method
     * @param url
     * @returns Route
     */
    public static addRoute(method: string, url: string): Route {
        const route = new Route(method, url);
        Router.addRoute(route);
        return route;
    }

    /**
     * Match
     * Find matching route given current user request
     * @param request
     * @param fresh
     * @returns Route | null
     */
    public match(request: Request, fresh: boolean = false): Route | null {
        if (this.route !== null && !fresh) {
            return this.route;
        }

        const url = /* new URL( */request.getURI()/* ).pathname */;
        let method = request.getMethod();
        method = method === App.REQUEST_METHOD_HEAD ? App.REQUEST_METHOD_GET : method;

        this.route = Router.match(method, url);
        return this.route;
    }

    /**
     * Execute a given route with middlewares and error handling
     * @param route
     * @param request
     * @param response
     * @returns this
     */
    public async execute(route: Route, request: Request, response: Response): Promise<this> {
        const argumentsList: any[] = [];
        const groups = route.getGroups();
        const pathValues = route.getPathValues(request);

        try {
            if (route.getHook()) {
                for (const hook of App._init) { // Global init hooks
                    if (hook.getGroups().includes('*')) {
                        const args = await this.getArguments(hook, pathValues, request.getParams());
                        const action = hook.getAction();

                        await action(...args);

                    }
                }
            }

            for (const group of groups) {
                for (const hook of App._init) { // Group init hooks
                    if (hook.getGroups().includes(group)) {
                        const args = await this.getArguments(hook, pathValues, request.getParams());
                        const action = hook.getAction();
                        await action(...args);

                    }
                }
            }

            if (!response.isSent()) {
                const args = await this.getArguments(route, pathValues, request.getParams());
                const action = route.getAction();

                await action(...args);

            }

            for (const group of groups) {
                for (const hook of App._shutdown) { // Group shutdown hooks
                    if (hook.getGroups().includes(group)) {
                        const args = await this.getArguments(hook, pathValues, request.getParams());
                        const action = hook.getAction();

                        action(...args);

                    }
                }
            }

            if (route.getHook()) {
                for (const hook of App._shutdown) { // Global shutdown hooks
                    if (hook.getGroups().includes('*')) {
                        const args = await this.getArguments(hook, pathValues, request.getParams());
                        const action = hook.getAction();

                        await action(...args);

                    }
                }
            }
        } catch (e) {

            App.setResource('error', async () => e);

            for (const group of groups) {
                for (const errorHook of App.errors) {
                    if (errorHook.getGroups().includes(group)) {
                        try {
                            const args = await this.getArguments(errorHook, pathValues, request.getParams());
                            const action = errorHook.getAction();
                            if (action instanceof Promise) {
                                await action(...args);
                            } else {
                                action(...args);
                            }
                        } catch (error: any) {
                            throw new Error(`Error handler had an error: ${error.message}`);
                        }
                    }
                }
            }

            for (const errorHook of App.errors) { // Global error hooks
                if (errorHook.getGroups().includes('*')) {
                    try {
                        const args = await this.getArguments(errorHook, pathValues, request.getParams());
                        const action = errorHook.getAction();

                        await action(...args);

                    } catch (error: any) {
                        throw new Error(`Error handler had an error: ${error.message}`);
                    }
                }
            }
            if (App.isDevelopment()) {
                Console.error(e);
            }
            else {
                throw new Error(e);
            }

            return this;
        }
    }
    /**
     * Get Arguments
     * @param hook
     * @param values
     * @param requestParams
     * @returns any[]
     * @throws Error
     */
    protected async getArguments(hook: Hook, values: Record<string, any>, requestParams: Record<string, any>): Promise<any[]> {
        const args: any[] = [];
        for (const [key, param] of Object.entries(hook.getParams())) {
            const typedParam = param as Param; // Type assertion

            const existsInRequest = key in requestParams;
            const existsInValues = key in values;
            const paramExists = existsInRequest || existsInValues;

            let arg;
            if (existsInRequest) {
                arg = requestParams[key];
            } else {
                if (typeof typedParam.default !== 'string' && typeof typedParam.default === 'function') {
                    arg = typedParam.default(await this.getResources(typedParam.injections));
                } else {
                    arg = typedParam.default;
                }
            }

            const value = existsInValues ? values[key] : arg;

            if (!typedParam.skipValidation) {
                if (!paramExists && !typedParam.optional) {
                    throw new Error(`Param "${key}" is not optional.`);
                }

                if (paramExists) {
                    await this.validate(key, typedParam, value);
                }
            }

            hook.setParamValue(key, value);
            args[typedParam.order] = value;
        }

        for (const [key, injection] of Object.entries(hook.getInjections()) as [string, Injection][]) {
            const resource = await this.getResource(injection.name);
            args[injection.order] = resource;
        }

        return args;
    }

    /**
     * Run
     * This is the place to initialize any pre-routing logic.
     * This is where you might want to parse the application's current URL by any desired logic
     * @param request
     * @param response
     * @returns this
     */
    public async run(request: Request, response: Response): Promise<this> {
        this.resources['request'] = request;
        this.resources['response'] = response;

        App.setResource('request', () => request);
        App.setResource('response', () => response);

        let method = request.getMethod();
        let route = this.match(request);
        const groups = route instanceof Route ? route.getGroups() : [];

        if (method === App.REQUEST_METHOD_HEAD) {
            method = App.REQUEST_METHOD_GET;
            response.disablePayload();
        }

        if (method === App.REQUEST_METHOD_OPTIONS) {
            try {
                for (const group of groups) {
                    for (const optionHook of App._options) { // Group options hooks
                        if (optionHook.getGroups().includes(group)) {
                            optionHook.getAction()(...(await this.getArguments(optionHook, {}, request.getParams())));
                        }
                    }
                }

                for (const optionHook of App._options) { // Global options hooks
                    if (optionHook.getGroups().includes('*')) {
                        optionHook.getAction()(...(await this.getArguments(optionHook, {}, request.getParams())));
                    }
                }
            } catch (e) {
                for (const errorHook of App.errors) { // Global error hooks
                    if (errorHook.getGroups().includes('*')) {
                        App.setResource('error', () => e);
                        errorHook.getAction()(...(await this.getArguments(errorHook, {}, request.getParams())));
                    }
                }
            }

            return this;
        }

        if (route === null && App.wildcardRoute !== null) {
            route = App.wildcardRoute;
            this.route = route;
            const path = parse(request.getURI(), false);//new URL(request.getURI()).pathname;
            route.path(path.pathname);
        }

        if (route !== null) {
            return await this.execute(route, request, response);
        } else if (method === App.REQUEST_METHOD_OPTIONS) {
            try {
                for (const group of groups) {
                    for (const optionHook of App._options) { // Group options hooks
                        if (optionHook.getGroups().includes(group)) {
                            optionHook.getAction()(...(await this.getArguments(optionHook, {}, request.getParams())));
                        }
                    }
                }

                for (const optionHook of App._options) { // Global options hooks
                    if (optionHook.getGroups().includes('*')) {
                        optionHook.getAction()(...(await this.getArguments(optionHook, {}, request.getParams())));
                    }
                }
            } catch (e) {
                for (const errorHook of App.errors) { // Global error hooks
                    if (errorHook.getGroups().includes('*')) {
                        App.setResource('error', () => e);
                        errorHook.getAction()(...(await this.getArguments(errorHook, {}, request.getParams())));
                    }
                }
            }
        } else {
            for (const errorHook of App.errors) { // Global error hooks
                if (errorHook.getGroups().includes('*')) {
                    App.setResource('error', () => new Error('Not Found') as any); // Customize error as needed
                    errorHook.getAction()(...(await this.getArguments(errorHook, {}, request.getParams())));
                }
            }
        }

        return this;
    }

    /**
     * Validate Param
     * Creates a validator instance and validates the given value with given rules.
     * @param key
     * @param param
     * @param value
     * @throws Error
     */
    protected async validate(key: string, param: Param, value: any): Promise<void> {
        if (param.optional && value === null) {
            return;
        }

        let validator = param.validator;

        if (typeof validator === 'function') {
            validator = validator(await this.getResources(param.injections));
        }

        if (!(validator instanceof Validator)) {
            throw new Error('Validator object is not an instance of the Validator class');
        }

        if (!validator.isValid(value)) {
            throw new Error(`Invalid \`${key}\` param: ${validator.getDescription()}`);
        }
    }

    /**
     * Reset all the static variables
     */
    public static reset(): void {
        Router.reset();
        this.resourcesCallbacks = {};
        this.mode = '';
        this.errors = [];
        this._init = [];
        this._shutdown = [];
        this._options = [];
    }
}

