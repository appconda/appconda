import { Request as ExpressRequest } from 'express';
import { Request as BaseRequest } from '../../Request';
import { Route } from '../../Route';
import { Filter } from './Filter';

export class Request extends BaseRequest {

    private filters: Filter[] = [];
    private static route: Route;

    public static readonly METHOD_OPTIONS = 'OPTIONS';
    public static readonly METHOD_GET = 'GET';
    public static readonly METHOD_HEAD = 'HEAD';
    public static readonly METHOD_POST = 'POST';
    public static readonly METHOD_PATCH = 'PATCH';
    public static readonly METHOD_PUT = 'PUT';
    public static readonly METHOD_DELETE = 'DELETE';
    public static readonly METHOD_TRACE = 'TRACE';
    public static readonly METHOD_CONNECT = 'CONNECT';

    protected rawRequest: ExpressRequest;
    protected rawPayload: string = '';
    protected payload: Record<string, any> | null = null;
    protected queryString: Record<string, any> | null = null;
    protected headers: Record<string, any> = {};

    constructor(private req: ExpressRequest) {
        super();
        this.rawRequest = req;
    }

    /**
     * Function to add a response filter, the order of filters are first in - first out.
     *
     * @param Filter $filter the response filter to set
     *
     * @return void
     */
    public addFilter(filter: Filter): void {
        this.filters.push(filter);
    }

    /**
   * Return the currently set filter
   *
   * @return array<Filter>
   */
    public getFilters(): Filter[] {
        return this.filters;
    }

    /**
  * Reset filters
  *
  * @return void
  */
    public resetFilters(): void {
        this.filters = [];
    }

    /**
  * Check if a filter has been set
  *
  * @return bool
  */
    public hasFilters(): boolean {
        return this.filters.length > 0;
    }

    /**
     * Function to set a request route
     *
     * @param Route|null $route the request route to set
     *
     * @return void
     */
    public static setRoute(route: Route): void {
        Request.route = route;

    }


    /**
     * Return the current route
     *
     * @return Route|null
     */
    public static getRoute(): Route {
        return Request.route;
    }

    /**
   * Check if a route has been set
   *
   * @return bool
   */
    public static hasRoute(): boolean {
        return Request.route != null;

    }



    public getParam(key: string, defaultValue: any = null): any {
        const params = this.getParams();
        return params[key] !== undefined ? params[key] : defaultValue;
    }

    public getParams(): Record<string, any> {
        let parameters = super.getParams();

        if (/* this.hasFilters() && */ Request.hasRoute()) {
            const route: Route = Request.getRoute();
            const method: string = route.getLabel('sdk.method', 'unknown');
            const namespace: string = route.getLabel('sdk.namespace', 'unknown');
            const endpointIdentifier: string = `${namespace}.${method}`;

            for (const filter of this.getFilters()) {
                parameters = filter.parse(parameters, endpointIdentifier);
            }
        }

        return parameters;
    }

    public getQuery(key: string, defaultValue: any = null): any {
        return this.req.query[key] ?? defaultValue;
    }

    public getPayload(key: string, defaultValue: any = null): any {
        return this.req.body[key] ?? defaultValue;
    }

    public getRawPayload(): string {
        return JSON.stringify(this.req.body);
    }

    public getServer(key: string, defaultValue: string | null = null): string | null {
        return process.env[key] ?? defaultValue;
    }

    public setServer(key: string, value: string): this {
        process.env[key] = value;
        return this;
    }

    public getIP(): string {
        return this.req.ip;
    }

    public getProtocol(): string {
        return this.req.protocol;
    }

    public getPort(): string {
        return this.req.socket.localPort.toString();
    }

    public getHostname(): string {
        return this.req.hostname;
    }

    public getMethod(): string {
        return this.req.method;
    }

    public setMethod(method: string): this {
        this.req.method = method;
        return this;
    }

    public getURI(): string {
        return this.req.originalUrl;
    }

    public setURI(uri: string): this {
        this.req.url = uri;
        return this;
    }

    public getFiles(key: string): Record<string, any> {
        return (this.req as any).files[key] ?? {};
    }

    public getReferer(defaultValue: string = ''): string {
        return this.req.headers['referer'] ?? defaultValue;
    }

    public getOrigin(defaultValue: string = ''): string {
        return this.req.get('Origin') ?? defaultValue;
    }

    public getUserAgent(defaultValue: string = ''): string {
        return this.req.get('User-Agent') ?? defaultValue;
    }

    public getAccept(defaultValue: string = ''): string {
        return this.req.get('Accept') ?? defaultValue;
    }

    public getCookie(key: string, defaultValue: string = ''): string {
        return this.req.cookies[key] ?? defaultValue;
    }

    public getHeader(key: string, defaultValue: string = ''): string {
        const headers = this.getHeaders();
        return headers[key] ?? defaultValue;
    }

    public getHeaders(): Record<string, any> {

        const headers =  this.req.headers;

        // Check if cookies exist and are not empty
        if (this.req.cookies && Object.keys(this.req.cookies).length > 0) {
            const cookieHeaders: string[] = [];

            // Iterate over each cookie and format as 'key=value'
            for (const [key, value] of Object.entries(this.req.cookies)) {
                cookieHeaders.push(`${key}=${value}`);
            }

            // Add the 'Cookie' header if there are any cookies
            if (cookieHeaders.length > 0) {
                headers['Cookie'] = cookieHeaders.join('; ');
            }
        }

        return headers;
    }

    public addHeader(key: string, value: string): this {
        this.req.headers[key] = value;
        return this;
    }

    public removeHeader(key: string): this {
        delete this.req.headers[key];
        return this;
    }

    public getSize(): number {
        return Buffer.byteLength(JSON.stringify(this.req.headers), 'utf8') + Buffer.byteLength(this.rawPayload, 'utf8');
    }

    public getContentRangeStart(): number | null {
        const data = this.parseContentRange();
        return data ? data.start : null;
    }

    public getContentRangeEnd(): number | null {
        const data = this.parseContentRange();
        return data ? data.end : null;
    }

    public getContentRangeSize(): number | null {
        const data = this.parseContentRange();
        return data ? data.size : null;
    }

    public getContentRangeUnit(): string | null {
        const data = this.parseContentRange();
        return data ? data.unit : null;
    }

    public getRangeStart(): number | null {
        const data = this.parseRange();
        return data ? data.start : null;
    }

    public getRangeEnd(): number | null {
        const data = this.parseRange();
        return data ? data.end : null;
    }

    public getRangeUnit(): string | null {
        const data = this.parseRange();
        return data ? data.unit : null;
    }

    public setQueryString(params: Record<string, any>): this {
        this.queryString = params;
        return this;
    }

    public setPayload(params: Record<string, any>): this {
        this.payload = params;
        return this;
    }

    protected parseContentRange(): { unit: string, start: number, end: number, size: number } | null {
        const contentRange = this.getHeader('content-range', '');
        if (!contentRange) return null;

        const [unit, range] = contentRange.split(' ');
        if (!unit || !range) return null;

        const [rangePart, size] = range.split('/');
        if (!rangePart || !size || isNaN(Number(size))) return null;

        const [start, end] = rangePart.split('-');
        if (!start || !end || isNaN(Number(start)) || isNaN(Number(end))) return null;

        return {
            unit: unit.trim(),
            start: Number(start),
            end: Number(end),
            size: Number(size)
        };
    }

    protected parseRange(): { unit: string, start: number, end: number | null } | null {
        const rangeHeader = this.getHeader('range', '');
        if (!rangeHeader) return null;

        const [unit, range] = rangeHeader.split('=');
        if (!unit || !range) return null;

        const [start, end] = range.split('-');
        if (!start || isNaN(Number(start))) return null;

        return {
            unit: unit.trim(),
            start: Number(start),
            end: end ? Number(end) : null
        };
    }
}