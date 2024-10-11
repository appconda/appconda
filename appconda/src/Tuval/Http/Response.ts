export class Response {
    /**
     * HTTP content types
     */
    public static readonly CONTENT_TYPE_TEXT = 'text/plain';
    public static readonly CONTENT_TYPE_HTML = 'text/html';
    public static readonly CONTENT_TYPE_JSON = 'application/json';
    public static readonly CONTENT_TYPE_XML = 'text/xml';
    public static readonly CONTENT_TYPE_JAVASCRIPT = 'text/javascript';
    public static readonly CONTENT_TYPE_IMAGE = 'image/*';
    public static readonly CONTENT_TYPE_IMAGE_JPEG = 'image/jpeg';
    public static readonly CONTENT_TYPE_IMAGE_PNG = 'image/png';
    public static readonly CONTENT_TYPE_IMAGE_GIF = 'image/gif';
    public static readonly CONTENT_TYPE_IMAGE_SVG = 'image/svg+xml';
    public static readonly CONTENT_TYPE_IMAGE_WEBP = 'image/webp';
    public static readonly CONTENT_TYPE_IMAGE_ICON = 'image/x-icon';
    public static readonly CONTENT_TYPE_IMAGE_BMP = 'image/bmp';

    /**
     * Charsets
     */
    public static readonly CHARSET_UTF8 = 'UTF-8';

    /**
     * HTTP response status codes
     */
    public static readonly STATUS_CODE_CONTINUE = 100;
    public static readonly STATUS_CODE_SWITCHING_PROTOCOLS = 101;
    public static readonly STATUS_CODE_OK = 200;
    public static readonly STATUS_CODE_CREATED = 201;
    public static readonly STATUS_CODE_ACCEPTED = 202;
    public static readonly STATUS_CODE_NON_AUTHORITATIVE_INFORMATION = 203;
    public static readonly STATUS_CODE_NOCONTENT = 204;
    public static readonly STATUS_CODE_RESETCONTENT = 205;
    public static readonly STATUS_CODE_PARTIALCONTENT = 206;
    public static readonly STATUS_CODE_MULTIPLE_CHOICES = 300;
    public static readonly STATUS_CODE_MOVED_PERMANENTLY = 301;
    public static readonly STATUS_CODE_FOUND = 302;
    public static readonly STATUS_CODE_SEE_OTHER = 303;
    public static readonly STATUS_CODE_NOT_MODIFIED = 304;
    public static readonly STATUS_CODE_USE_PROXY = 305;
    public static readonly STATUS_CODE_UNUSED = 306;
    public static readonly STATUS_CODE_TEMPORARY_REDIRECT = 307;
    public static readonly STATUS_CODE_BAD_REQUEST = 400;
    public static readonly STATUS_CODE_UNAUTHORIZED = 401;
    public static readonly STATUS_CODE_PAYMENT_REQUIRED = 402;
    public static readonly STATUS_CODE_FORBIDDEN = 403;
    public static readonly STATUS_CODE_NOT_FOUND = 404;
    public static readonly STATUS_CODE_METHOD_NOT_ALLOWED = 405;
    public static readonly STATUS_CODE_NOT_ACCEPTABLE = 406;
    public static readonly STATUS_CODE_PROXY_AUTHENTICATION_REQUIRED = 407;
    public static readonly STATUS_CODE_REQUEST_TIMEOUT = 408;
    public static readonly STATUS_CODE_CONFLICT = 409;
    public static readonly STATUS_CODE_GONE = 410;
    public static readonly STATUS_CODE_LENGTH_REQUIRED = 411;
    public static readonly STATUS_CODE_PRECONDITION_FAILED = 412;
    public static readonly STATUS_CODE_REQUEST_ENTITY_TOO_LARGE = 413;
    public static readonly STATUS_CODE_REQUEST_URI_TOO_LONG = 414;
    public static readonly STATUS_CODE_UNSUPPORTED_MEDIA_TYPE = 415;
    public static readonly STATUS_CODE_REQUESTED_RANGE_NOT_SATISFIABLE = 416;
    public static readonly STATUS_CODE_EXPECTATION_FAILED = 417;
    public static readonly STATUS_CODE_TOO_EARLY = 425;
    public static readonly STATUS_CODE_TOO_MANY_REQUESTS = 429;
    public static readonly STATUS_CODE_UNAVAILABLE_FOR_LEGAL_REASONS = 451;
    public static readonly STATUS_CODE_INTERNAL_SERVER_ERROR = 500;
    public static readonly STATUS_CODE_NOT_IMPLEMENTED = 501;
    public static readonly STATUS_CODE_BAD_GATEWAY = 502;
    public static readonly STATUS_CODE_SERVICE_UNAVAILABLE = 503;
    public static readonly STATUS_CODE_GATEWAY_TIMEOUT = 504;
    public static readonly STATUS_CODE_HTTP_VERSION_NOT_SUPPORTED = 505;

    protected statusCodes: { [key: number]: string } = {
        [Response.STATUS_CODE_CONTINUE]: 'Continue',
        [Response.STATUS_CODE_SWITCHING_PROTOCOLS]: 'Switching Protocols',
        [Response.STATUS_CODE_OK]: 'OK',
        [Response.STATUS_CODE_CREATED]: 'Created',
        [Response.STATUS_CODE_ACCEPTED]: 'Accepted',
        [Response.STATUS_CODE_NON_AUTHORITATIVE_INFORMATION]: 'Non-Authoritative Information',
        [Response.STATUS_CODE_NOCONTENT]: 'No Content',
        [Response.STATUS_CODE_RESETCONTENT]: 'Reset Content',
        [Response.STATUS_CODE_PARTIALCONTENT]: 'Partial Content',
        [Response.STATUS_CODE_MULTIPLE_CHOICES]: 'Multiple Choices',
        [Response.STATUS_CODE_MOVED_PERMANENTLY]: 'Moved Permanently',
        [Response.STATUS_CODE_FOUND]: 'Found',
        [Response.STATUS_CODE_SEE_OTHER]: 'See Other',
        [Response.STATUS_CODE_NOT_MODIFIED]: 'Not Modified',
        [Response.STATUS_CODE_USE_PROXY]: 'Use Proxy',
        [Response.STATUS_CODE_UNUSED]: '(Unused)',
        [Response.STATUS_CODE_TEMPORARY_REDIRECT]: 'Temporary Redirect',
        [Response.STATUS_CODE_BAD_REQUEST]: 'Bad Request',
        [Response.STATUS_CODE_UNAUTHORIZED]: 'Unauthorized',
        [Response.STATUS_CODE_PAYMENT_REQUIRED]: 'Payment Required',
        [Response.STATUS_CODE_FORBIDDEN]: 'Forbidden',
        [Response.STATUS_CODE_NOT_FOUND]: 'Not Found',
        [Response.STATUS_CODE_METHOD_NOT_ALLOWED]: 'Method Not Allowed',
        [Response.STATUS_CODE_NOT_ACCEPTABLE]: 'Not Acceptable',
        [Response.STATUS_CODE_PROXY_AUTHENTICATION_REQUIRED]: 'Proxy Authentication Required',
        [Response.STATUS_CODE_REQUEST_TIMEOUT]: 'Request Timeout',
        [Response.STATUS_CODE_CONFLICT]: 'Conflict',
        [Response.STATUS_CODE_GONE]: 'Gone',
        [Response.STATUS_CODE_LENGTH_REQUIRED]: 'Length Required',
        [Response.STATUS_CODE_PRECONDITION_FAILED]: 'Precondition Failed',
        [Response.STATUS_CODE_REQUEST_ENTITY_TOO_LARGE]: 'Request Entity Too Large',
        [Response.STATUS_CODE_REQUEST_URI_TOO_LONG]: 'Request-URI Too Long',
        [Response.STATUS_CODE_UNSUPPORTED_MEDIA_TYPE]: 'Unsupported Media Type',
        [Response.STATUS_CODE_REQUESTED_RANGE_NOT_SATISFIABLE]: 'Requested Range Not Satisfiable',
        [Response.STATUS_CODE_EXPECTATION_FAILED]: 'Expectation Failed',
        [Response.STATUS_CODE_TOO_EARLY]: 'Too Early',
        [Response.STATUS_CODE_TOO_MANY_REQUESTS]: 'Too Many Requests',
        [Response.STATUS_CODE_UNAVAILABLE_FOR_LEGAL_REASONS]: 'Unavailable For Legal Reasons',
        [Response.STATUS_CODE_INTERNAL_SERVER_ERROR]: 'Internal Server Error',
        [Response.STATUS_CODE_NOT_IMPLEMENTED]: 'Not Implemented',
        [Response.STATUS_CODE_BAD_GATEWAY]: 'Bad Gateway',
        [Response.STATUS_CODE_SERVICE_UNAVAILABLE]: 'Service Unavailable',
        [Response.STATUS_CODE_GATEWAY_TIMEOUT]: 'Gateway Timeout',
        [Response.STATUS_CODE_HTTP_VERSION_NOT_SUPPORTED]: 'HTTP Version Not Supported',
    };

    protected compressed: { [key: string]: boolean } = {
        'text/plain': true,
        'text/css': true,
        'text/javascript': true,
        'application/javascript': true,
        'text/html': true,
        'text/html; charset=UTF-8': true,
        'application/json': true,
        'application/json; charset=UTF-8': true,
        'image/svg+xml': true,
        'application/xml+rss': true,
    };

    public static readonly COOKIE_SAMESITE_NONE = 'None';
    public static readonly COOKIE_SAMESITE_STRICT = 'Strict';
    public static readonly COOKIE_SAMESITE_LAX = 'Lax';
    public static readonly CHUNK_SIZE = 2000000; // 2mb

    protected statusCode: number = Response.STATUS_CODE_OK;
    protected contentType: string = '';
    protected _disablePayload: boolean = false;
    protected sent: boolean = false;
    protected headers: { [key: string]: string } = {};
    protected cookies: Array<{ [key: string]: any }> = [];
    protected startTime: number = 0;
    protected size: number = 0;

    constructor(time: number = 0) {
        this.startTime = time || Date.now();
    }

    public setContentType(type: string, charset: string = ''): this {
        this.contentType = type + (charset ? `; charset=${charset}` : '');
        return this;
    }

    public getContentType(): string {
        return this.contentType;
    }

    public isSent(): boolean {
        return this.sent;
    }

    public setStatusCode(code: number = 200): this {
        if (!this.statusCodes[code]) {
            throw new Error('Unknown HTTP status code');
        }
        this.statusCode = code;
        return this;
    }

    public getStatusCode(): number {
        return this.statusCode;
    }

    public getSize(): number {
        return this.size;
    }

    public disablePayload(): this {
        this._disablePayload = true;
        return this;
    }

    public enablePayload(): this {
        this._disablePayload = false;
        return this;
    }

    public addHeader(key: string, value: string): this {
        this.headers[key] = value;
        return this;
    }

    public removeHeader(key: string): this {
        delete this.headers[key];
        return this;
    }

    public getHeaders(): { [key: string]: string } {
        return this.headers;
    }

    public addCookie(name: string, value: string | null = null, expire: number | null = null, path: string | null = null, domain: string | null = null, secure: boolean | null = null, httponly: boolean | null = null, sameSite: string | null = null): this {
        this.cookies.push({
            name: name.toLowerCase(),
            value,
            expire,
            path,
            domain,
            secure,
            httponly,
            sameSite,
        });
        return this;
    }

    public removeCookie(name: string): this {
        this.cookies = this.cookies.filter(cookie => cookie.name !== name);
        return this;
    }

    public getCookies(): Array<{ [key: string]: any }> {
        return this.cookies;
    }

    public send(body: string = ''): void {
        if (this.sent) {
            return;
        }

        this.sent = true;
        this.addHeader('X-Debug-Speed', (Date.now() - this.startTime).toString());

        this.appendCookies().appendHeaders();

        if (!this._disablePayload) {
            const length = body.length;
            this.size += Object.values(this.headers).join('\n').length + length;

            if (this.compressed[this.contentType] && length <= Response.CHUNK_SIZE) {
                this.end(body);
            } else {
                for (let i = 0; i < Math.ceil(length / Response.CHUNK_SIZE); i++) {
                    this.write(body.substr(i * Response.CHUNK_SIZE, Math.min(Response.CHUNK_SIZE, length - i * Response.CHUNK_SIZE)));
                }
                this.end();
            }

            this.disablePayload();
        } else {
            this.end();
        }
    }

    protected write(content: string): void {
        process.stdout.write(content);
    }

    protected end(content: string | null = null): void {
        if (content !== null) {
            process.stdout.write(content);
        }
    }

    public chunk(body: string = '', end: boolean = false): void {
        if (this.sent) {
            return;
        }

        if (end) {
            this.sent = true;
        }

        this.addHeader('X-Debug-Speed', (Date.now() - this.startTime).toString());

        this.appendCookies().appendHeaders();

        if (!this._disablePayload) {
            this.write(body);
            if (end) {
                this.disablePayload();
                this.end();
            }
        } else {
            this.end();
        }
    }

    protected appendHeaders(): this {
        this.sendStatus(this.statusCode);

        if (this.contentType) {
            this.addHeader('Content-Type', this.contentType);
        }

        for (const [key, value] of Object.entries(this.headers)) {
            this.sendHeader(key, value);
        }

        return this;
    }

    protected sendStatus(statusCode: number): void {
        process.stdout.write(`HTTP/1.1 ${statusCode} ${this.statusCodes[statusCode]}\n`);
    }

    protected sendHeader(key: string, value: string): void {
        process.stdout.write(`${key}: ${value}\n`);
    }

    protected sendCookie(name: string, value: string, options: { [key: string]: any }): void {
        options.expires = options.expire;
        delete options.expire;

        const cookieString = `${name}=${value}; ${Object.entries(options).map(([k, v]) => `${k}=${v}`).join('; ')}`;
        process.stdout.write(`Set-Cookie: ${cookieString}\n`);
    }

    protected appendCookies(): this {
        for (const cookie of this.cookies) {
            this.sendCookie(cookie.name, cookie.value, {
                expire: cookie.expire,
                path: cookie.path,
                domain: cookie.domain,
                secure: cookie.secure,
                httponly: cookie.httponly,
                sameSite: cookie.sameSite,
            });
        }
        return this;
    }

    public redirect(url: string, statusCode: number = 301): void {
        if (statusCode === 300) {
            console.warn('It seems webkit based browsers have problems redirecting link with 300 status codes!');
        }

        this.addHeader('Location', url).setStatusCode(statusCode).send('');
    }

    public html(data: string): void {
        this.setContentType(Response.CONTENT_TYPE_HTML, Response.CHARSET_UTF8).send(data);
    }

    public text(data: string): void {
        this.setContentType(Response.CONTENT_TYPE_TEXT, Response.CHARSET_UTF8).send(data);
    }

    public json(data: any): void {
        if (typeof data !== 'object') {
            throw new Error('Invalid JSON input var');
        }

        this.setContentType(Response.CONTENT_TYPE_JSON, Response.CHARSET_UTF8).send(JSON.stringify(data));
    }

    public jsonp(callback: string, data: any): void {
        this.setContentType(Response.CONTENT_TYPE_JAVASCRIPT, Response.CHARSET_UTF8).send(`parent.${callback}(${JSON.stringify(data)});`);
    }

    public iframe(callback: string, data: any): void {
        this.setContentType(Response.CONTENT_TYPE_HTML, Response.CHARSET_UTF8).send(`<script type="text/javascript">window.parent.${callback}(${JSON.stringify(data)});</script>`);
    }

    public noContent(): void {
        this.setStatusCode(Response.STATUS_CODE_NOCONTENT).send('');
    }
}