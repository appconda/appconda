// src/appconda/fetch/Client.ts
import axios, { AxiosRequestConfig, Method } from 'axios';

export class Client {
    public static readonly METHOD_GET: string = 'GET';
    public static readonly METHOD_POST: string = 'POST';
    public static readonly METHOD_PUT: string = 'PUT';
    public static readonly METHOD_PATCH: string = 'PATCH';
    public static readonly METHOD_DELETE: string = 'DELETE';
    public static readonly METHOD_HEAD: string = 'HEAD';
    public static readonly METHOD_OPTIONS: string = 'OPTIONS';
    public static readonly METHOD_CONNECT: string = 'CONNECT';
    public static readonly METHOD_TRACE: string = 'TRACE';

    public static readonly CONTENT_TYPE_APPLICATION_JSON = 'application/json';
    public static readonly CONTENT_TYPE_APPLICATION_FORM_URLENCODED = 'application/x-www-form-urlencoded';
    public static readonly CONTENT_TYPE_MULTIPART_FORM_DATA = 'multipart/form-data';
    public static readonly CONTENT_TYPE_GRAPHQL = 'application/graphql';

    private headers: Record<string, string> = {};
    private timeout: number = 15000;
    private connectTimeout: number = 60000;
    private maxRedirects: number = 5;
    private allowRedirects: boolean = true;
    private userAgent: string = '';

    public addHeader(key: string, value: string): this {
        this.headers[key] = value;
        return this;
    }

    public setTimeout(timeout: number): this {
        this.timeout = timeout;
        return this;
    }

    public setAllowRedirects(allow: boolean): this {
        this.allowRedirects = allow;
        return this;
    }

    public setMaxRedirects(maxRedirects: number): this {
        this.maxRedirects = maxRedirects;
        return this;
    }

    public setConnectTimeout(connectTimeout: number): this {
        this.connectTimeout = connectTimeout;
        return this;
    }

    public setUserAgent(userAgent: string): this {
        this.userAgent = userAgent;
        return this;
    }

    private static flatten(data: any, prefix: string = ''): any {
        const output: any = {};
        for (const key in data) {
            const value = data[key];
            const finalKey = prefix ? `${prefix}[${key}]` : key;

            if (typeof value === 'object' && !Array.isArray(value)) {
                Object.assign(output, this.flatten(value, finalKey));
            } else {
                output[finalKey] = value;
            }
        }
        return output;
    }

    public async fetch(
        url: string,
        method: string = Client.METHOD_GET,
        body: any = {},
        query: Record<string, any> = {}
    ): Promise<any> {
        if (!Object.values(Client).includes(method)) {
            throw new Error("Unsupported HTTP method");
        }

        if (this.headers['content-type']) {
            switch (this.headers['content-type']) {
                case Client.CONTENT_TYPE_APPLICATION_JSON:
                    body = JSON.stringify(body);
                    break;
                case Client.CONTENT_TYPE_APPLICATION_FORM_URLENCODED:
                case Client.CONTENT_TYPE_MULTIPART_FORM_DATA:
                    body = Client.flatten(body);
                    break;
                case Client.CONTENT_TYPE_GRAPHQL:
                    body = body[0];
                    break;
            }
        }

        const config: AxiosRequestConfig = {
            url,
            method,
            headers: this.headers,
            data: body,
            params: query,
            timeout: this.timeout,
            maxRedirects: this.maxRedirects,
            responseType: 'json',
            validateStatus: () => true,
        };

        if (this.userAgent) {
            config.headers['User-Agent'] = this.userAgent;
        }

        try {
            const response = await axios(config);
            return {
                statusCode: response.status,
                headers: response.headers,
                body: response.data,
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }

    public getTimeout(): number {
        return this.timeout;
    }

    public getAllowRedirects(): boolean {
        return this.allowRedirects;
    }

    public getMaxRedirects(): number {
        return this.maxRedirects;
    }

    public getConnectTimeout(): number {
        return this.connectTimeout;
    }

    public getUserAgent(): string {
        return this.userAgent;
    }
}