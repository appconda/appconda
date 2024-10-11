import { parse } from 'url';

    export abstract class Request {
        public static readonly METHOD_OPTIONS = 'OPTIONS';
        public static readonly METHOD_GET = 'GET';
        public static readonly METHOD_HEAD = 'HEAD';
        public static readonly METHOD_POST = 'POST';
        public static readonly METHOD_PATCH = 'PATCH';
        public static readonly METHOD_PUT = 'PUT';
        public static readonly METHOD_DELETE = 'DELETE';
        public static readonly METHOD_TRACE = 'TRACE';
        public static readonly METHOD_CONNECT = 'CONNECT';

        protected rawPayload: string = '';
        protected payload: Record<string, any> | null = null;
        protected queryString: Record<string, any> | null = null;
        protected headers: Record<string, any> = {};

        public getParam(key: string, defaultValue: any = null): any {
            const params = this.getParams();
            return params[key] !== undefined ? params[key] : defaultValue;
        }

        public getParams(): Record<string, any> {
            return this.generateInput();
        }

        public getQuery(key: string, defaultValue: any = null): any {
            this.generateInput();
            return this.queryString![key] ?? defaultValue;
        }

        public getPayload(key: string, defaultValue: any = null): any {
            this.generateInput();
            return this.payload![key] ?? defaultValue;
        }

        public abstract getRawPayload(): string ;

        public getServer(key: string, defaultValue: string | null = null): string | null {
            return process.env[key] ?? defaultValue;
        }

        public setServer(key: string, value: string): this {
            process.env[key] = value;
            return this;
        }

        public getIP(): string {
            const ips = (this.getHeader('HTTP_X_FORWARDED_FOR', this.getServer('REMOTE_ADDR') ?? '0.0.0.0') as string).split(',');
            return ips[0]?.trim() ?? '';
        }

        public getProtocol(): string {
            return this.getServer('HTTP_X_FORWARDED_PROTO', this.getServer('REQUEST_SCHEME')) ?? 'https';
        }

        public getPort(): string {
            return new URL(this.getProtocol() + '://' + this.getServer('HTTP_HOST', '')).port;
        }

        public getHostname(): string {
            return new URL(this.getProtocol() + '://' + this.getServer('HTTP_HOST', '')).hostname;
        }

        public abstract getMethod(): string ;

        public abstract setMethod(method: string): this ;

        public abstract getURI(): string ;

        public setURI(uri: string): this {
            this.setServer('REQUEST_URI', uri);
            return this;
        }

        public getFiles(key: string): Record<string, any> {
            return (global as any)._FILES[key] ?? {};
        }

        public getReferer(defaultValue: string = ''): string {
            return this.getServer('HTTP_REFERER', defaultValue) ?? '';
        }

        public getOrigin(defaultValue: string = ''): string {
            return this.getServer('HTTP_ORIGIN', defaultValue) ?? '';
        }

        public getUserAgent(defaultValue: string = ''): string {
            return this.getServer('HTTP_USER_AGENT', defaultValue) ?? '';
        }

        public getAccept(defaultValue: string = ''): string {
            return this.getServer('HTTP_ACCEPT', defaultValue) ?? '';
        }

        public getCookie(key: string, defaultValue: string = ''): string {
            return (global as any)._COOKIE[key] ?? defaultValue;
        }

        public getHeader(key: string, defaultValue: string = ''): string {
            const headers = this.getHeaders();
            return headers[key] ?? defaultValue;
        }

        public abstract getHeaders(): Record<string, any> ;

        public addHeader(key: string, value: string): this {
            this.headers![key] = value;
            return this;
        }

        public removeHeader(key: string): this {
            if (this.headers![key]) {
                delete this.headers![key];
            }
            return this;
        }

        public getSize(): number {
            return Buffer.byteLength(Object.values(this.getHeaders()).join("\n"), 'utf8') + Buffer.byteLength(this.rawPayload, 'utf8');
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

        protected generateInput(): Record<string, any> {
            if (this.queryString === null) {
                const parsedUrl =  parse(this.getURI(),true);
                const queryParams = parsedUrl.query;
                this.queryString = queryParams;
            }
            if (this.payload === null) {
                let contentType = this.getHeader('content-type');
                const length = contentType.indexOf(';');
                contentType = length === -1 ? contentType : contentType.substring(0, length);

                this.rawPayload = this.getRawPayload();

                switch (contentType) {
                    case 'application/json':
                        this.payload = JSON.parse(this.rawPayload);
                        break;
                    default:
                        this.payload = JSON.parse(this.rawPayload);;
                        break;
                }

                if (!this.payload) {
                    this.payload = {};
                }
            }

            switch (this.getMethod()) {
                case Request.METHOD_POST:
                case Request.METHOD_PUT:
                case Request.METHOD_PATCH:
                case Request.METHOD_DELETE:
                    return this.payload;
                default:
                    return this.queryString ?? {};
            }
        }

     /*    protected generateHeaders(): Record<string, any> {
            if (this.headers === null) {
                this.headers = (global as any)._HEADERS || {};
            }
            return this.headers;
        }
 */
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
