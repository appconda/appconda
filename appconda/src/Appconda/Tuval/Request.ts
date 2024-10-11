import { Filter } from './Request/Filter';
import { Request as ExpressRequest } from 'express';
import { Route, Request as TuvalRequest} from '../../Tuval/Http';

//@ts-ignore
export class Request extends TuvalRequest {
    protected filters: Filter[] = [];
    private static route: Route = null as any;

    constructor(request: ExpressRequest) {
        super(request);
    }

    /**
     * @inheritdoc
     */
    public getParams(): Record<string, any> {
        let parameters = super.getParams();

        if (this.hasFilters() && Request.hasRoute()) {
            const method = Request.getRoute()?.getLabel('sdk.method', 'unknown') || 'unknown';
            const endpointIdentifier = `${Request.getRoute()?.getLabel('sdk.namespace', 'unknown') || 'unknown'}.${method}`;

            for (const filter of this.getFilters()) {
                parameters = filter.parse(parameters, endpointIdentifier);
            }
        }

        return parameters;
    }

    /**
     * Function to add a response filter, the order of filters are first in - first out.
     *
     * @param filter the response filter to set
     */
    public addFilter(filter: Filter): void {
        this.filters.push(filter);
    }

    /**
     * Return the currently set filter
     *
     * @return Filter[]
     */
    public getFilters(): Filter[] {
        return this.filters;
    }

    /**
     * Reset filters
     */
    public resetFilters(): void {
        this.filters = [];
    }

    /**
     * Check if a filter has been set
     *
     * @return boolean
     */
    public hasFilters(): boolean {
        return this.filters.length > 0;
    }

    /**
     * Function to set a request route
     *
     * @param route the request route to set
     */
    public static setRoute(route: Route): void {
        Request.route = route;
    }

    /**
     * Return the current route
     *
     * @return Route | null
     */
    public static getRoute(): Route  {
        return Request.route;
    }

    /**
     * Check if a route has been set
     *
     * @return boolean
     */
    public static hasRoute(): boolean {
        return Request.route !== null;
    }

    /**
     * Get headers
     *
     * Method for getting all HTTP header parameters, including cookies.
     *
     * @return Record<string, any>
     */
    public getHeaders(): Record<string, any> {
        const headers = super.getHeaders();

        if (!this.rawRequest.cookies) {
            return headers;
        }

        const cookieHeaders: string[] = [];
        for (const [key, value] of Object.entries(this.rawRequest.cookies)) {
            cookieHeaders.push(`${key}=${value}`);
        }

        if (cookieHeaders.length > 0) {
            headers['cookie'] = cookieHeaders.join('; ');
        }

        return headers;
    }

    /**
     * Get header
     *
     * Method for querying HTTP header parameters. If $key is not found $default value will be returned.
     *
     * @param key
     * @param defaultValue
     * @return string
     */
    public getHeader(key: string, defaultValue: string = ''): string {
        const headers = this.getHeaders();
        return headers[key] || defaultValue;
    }
}