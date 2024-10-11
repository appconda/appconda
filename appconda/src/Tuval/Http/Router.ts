import { Route } from "./Route";

export class Router {
    /**
     * Placeholder token for params in paths.
     */
    public static readonly PLACEHOLDER_TOKEN = ':::';
    public static readonly WILDCARD_TOKEN = '*';

    protected static allowOverride: boolean = false;

    /**
     * @var { [key: string]: Route[] }
     */
    protected static routes: { [key: string]: Route[] } = {
        'GET': [],
        'POST': [],
        'PUT': [],
        'PATCH': [],
        'DELETE': [],
    };

    /**
     * Contains the positions of all params in the paths of all registered Routes.
     *
     * @var number[]
     */
    protected static params: number[] = [];

    /**
     * Get all registered routes.
     *
     * @return { [key: string]: Route[] }
     */
    public static getRoutes(): { [key: string]: Route[] } {
        return this.routes;
    }

    /**
     * Get allow override
     *
     * @return boolean
     */
    public static getAllowOverride(): boolean {
        return this.allowOverride;
    }

    /**
     * Set Allow override
     *
     * @param value boolean
     * @return void
     */
    public static setAllowOverride(value: boolean): void {
        this.allowOverride = value;
    }

    /**
     * Add route to router.
     *
     * @param route Route
     * @return void
     * @throws Error
     */
    public static addRoute(route: Route): void {
        const [path, params] = this.preparePath(route.getPath());

        if (!this.routes[route.getMethod()]) {
            throw new Error(`Method (${route.getMethod()}) not supported.`);
        }

        if (this.routes[route.getMethod()][path] && !this.allowOverride) {
            throw new Error(`Route for (${route.getMethod()}:${path}) already registered.`);
        }

        for (const [key, index] of Object.entries(params)) {
            route.setPathParam(key, index);
        }

        this.routes[route.getMethod()][path] = route;
    }

    /**
     * Add route alias to router.
     *
     * @param path string
     * @param route Route
     * @return void
     * @throws Error
     */
    public static addRouteAlias(path: string, route: Route): void {
        const [alias] = this.preparePath(path);

        if (this.routes[route.getMethod()][alias] && !this.allowOverride) {
            throw new Error(`Route for (${route.getMethod()}:${alias}) already registered.`);
        }

        this.routes[route.getMethod()][alias] = route;
    }

    /**
     * Match route against the method and path.
     *
     * @param method string
     * @param path string
     * @return Route | null
     */
    public static match(method: string, path: string): Route | null {
        if (!this.routes[method]) {
            return null;
        }

        const parts = path.split('/').filter(Boolean);
        const length = parts.length - 1;
        const filteredParams = this.params.filter(i => i <= length);

        const combinationsArray = Array.from(this.combinations(filteredParams));
        for (const sample of combinationsArray) {
            const match = parts.map((part, i) => sample.includes(i) ? this.PLACEHOLDER_TOKEN : part).join('/');

            if (this.routes[method][match]) {
                return this.routes[method][match];
            }
        }

        /**
         * Match root wildcard.
         */
        if (this.routes[method][this.WILDCARD_TOKEN]) {
            return this.routes[method][this.WILDCARD_TOKEN];
        }

        /**
         * Match wildcard for path segments.
         */
        let current = '';
        for (const part of parts) {
            current += `${part}/`;
            const match = current + this.WILDCARD_TOKEN;
            if (this.routes[method][match]) {
                return this.routes[method][match];
            }
        }

        return null;
    }

    /**
     * Get all combinations of the given set.
     *
     * @param set number[]
     * @return IterableIterator<number[]>
     */
    protected static *combinations(set: number[]): IterableIterator<number[]> {
        yield [];

        const results: number[][] = [[]];

        for (const element of set) {
            const newResults = results.map(combination => [element, ...combination]);
            results.push(...newResults);
            yield* newResults;
        }
    }

    /**
     * Prepare path for matching
     *
     * @param path string
     * @return [string, { [key: string]: number }]
     */
    protected static preparePath(path: string): [string, { [key: string]: number }] {
        const parts = path.split('/').filter(Boolean);
        let prepare = '';
        const params: { [key: string]: number } = {};

        parts.forEach((part, key) => {
            if (key !== 0) {
                prepare += '/';
            }

            if (part.startsWith(':')) {
                prepare += this.PLACEHOLDER_TOKEN;
                params[part.slice(1)] = key;
                if (!this.params.includes(key)) {
                    this.params.push(key);
                }
            } else {
                prepare += part;
            }
        });

        return [prepare, params];
    }

    /**
     * Reset router
     *
     * @return void
     */
    public static reset(): void {
        this.params = [];
        this.routes = {
            'GET': [],
            'POST': [],
            'PUT': [],
            'PATCH': [],
            'DELETE': [],
        };
    }
}