import { Hook } from "./Hook";
import { Router } from "./Router";
import { Request } from "./Request";

export class Route extends Hook {
    /**
     * HTTP Method
     */
    protected method: string = '';

    /**
     * Whether to use hook
     */
    protected _hook: boolean = true;

    /**
     * Path
     */
    protected _path: string = '';

    /**
     * Path params.
     */
    protected pathParams: { [key: string]: number } = {};

    /**
     * Internal counter.
     */
    protected static counter: number = 0;

    /**
     * Route order ID.
     */
    protected order: number;

    constructor(method: string, path: string) {
        super();
        this._path = path;
        this.method = method;
        this.order = ++Route.counter;
        this._action = (): void => {};
    }

    /**
     * Get Route Order ID
     */
    public getOrder(): number {
        return this.order;
    }

    /**
     * Add path
     */
    public path(path: string): this {
        this._path = path;
        return this;
    }

    /**
     * Add alias
     */
    public alias(path: string): this {
        Router.addRouteAlias(path, this);
        return this;
    }

    /**
     * When set false, hooks for this route will be skipped.
     */
    public hook(hook: boolean = true): this {
        this._hook = hook;
        return this;
    }

    /**
     * Get HTTP Method
     */
    public getMethod(): string {
        return this.method;
    }

    /**
     * Get path
     */
    public getPath(): string {
        return this._path;
    }

    /**
     * Get hook status
     */
    public getHook(): boolean {
        return this._hook;
    }

    /**
     * Set path param.
     */
    public setPathParam(key: string, index: number): void {
        this.pathParams[key] = index;
    }

    /**
     * Get path params.
     */
    public getPathValues(request: Request): { [key: string]: string } {
        const pathValues: { [key: string]: string } = {};
        const parts = request.getURI().replace(/^\//, '').split('/');

        for (const [key, index] of Object.entries(this.pathParams)) {
            if (index in parts) {
                pathValues[key] = parts[index];
            }
        }

        return pathValues;
    }
}