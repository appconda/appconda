
import { Exception } from '../../Tuval/Core';
import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';
import { AppcondaException } from '../Extend/Exception';

export class Executor {
    public static readonly METHOD_GET = 'GET';
    public static readonly METHOD_POST = 'POST';
    public static readonly METHOD_PUT = 'PUT';
    public static readonly METHOD_PATCH = 'PATCH';
    public static readonly METHOD_DELETE = 'DELETE';
    public static readonly METHOD_HEAD = 'HEAD';
    public static readonly METHOD_OPTIONS = 'OPTIONS';
    public static readonly METHOD_CONNECT = 'CONNECT';
    public static readonly METHOD_TRACE = 'TRACE';

    private selfSigned = false;
    private endpoint: string;
    protected headers: Record<string, string>;
    protected cpus: number;
    protected memory: number;

    constructor(endpoint: string) {
        if (!this.isValidUrl(endpoint)) {
            throw new Error('Unsupported endpoint');
        }

        this.endpoint = endpoint;
        this.cpus = parseInt(process.env._APP_FUNCTIONS_CPUS || '1', 10);
        this.memory = parseInt(process.env._APP_FUNCTIONS_MEMORY || '512', 10);
        this.headers = {
            'content-type': 'application/json',
            'authorization': 'Bearer ' + (process.env._APP_EXECUTOR_SECRET || ''),
            'x-opr-addressing-method': 'anycast-efficient'
        };
    }

    private isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    public async createRuntime(
        deploymentId: string,
        projectId: string,
        source: string,
        image: string,
        version: string,
        remove = false,
        entrypoint = '',
        destination = '',
        variables: Record<string, any> = {},
        command: string | null = null
    ) {
        const runtimeId = `${projectId}-${deploymentId}-build`;
        const route = "/runtimes";
        const timeout = parseInt(process.env._APP_FUNCTIONS_BUILD_TIMEOUT || '900', 10);
        const params = {
            runtimeId,
            source,
            destination,
            image,
            entrypoint,
            variables,
            remove,
            command,
            cpus: this.cpus,
            memory: this.memory,
            version,
            timeout,
        };

        const response = await this.call(Executor.METHOD_POST, route, { 'x-opr-runtime-id': runtimeId }, params, true, timeout);

        const status = response.headers['status-code'];
        if (status >= 400) {
            const message = typeof response.body === 'string' ? response.body : response.body.message;
            throw new Exception(message, status);
        }

        return response.body;
    }

    public async getLogs(
        deploymentId: string,
        projectId: string,
        callback: (data: any) => void
    ) {
        const timeout = parseInt(process.env._APP_FUNCTIONS_BUILD_TIMEOUT || '900', 10);
        const runtimeId = `${projectId}-${deploymentId}-build`;
        const route = `/runtimes/${runtimeId}/logs`;
        const params = { timeout };

        await this.call(Executor.METHOD_GET, route, { 'x-opr-runtime-id': runtimeId }, params, true, timeout, callback);
    }

    public async deleteRuntime(projectId: string, deploymentId: string) {
        const runtimeId = `${projectId}-${deploymentId}`;
        const route = `/runtimes/${runtimeId}`;

        const response = await this.call(Executor.METHOD_DELETE, route, {
            'x-opr-addressing-method': 'broadcast'
        }, {}, true, 30);

        const status = response.headers['status-code'];
        if (status >= 400) {
            const message = typeof response.body === 'string' ? response.body : response.body.message;
            throw new Exception(message, status);
        }

        return response.body;
    }

    public async createExecution({
        projectId,
        deploymentId,
        body,
        variables,
        timeout,
        image,
        source,
        entrypoint,
        version,
        path,
        method,
        headers,
        runtimeEntrypoint,
        requestTimeout
    }: {
        projectId: string,
        deploymentId: string,
        body: string | null,
        variables: Record<string, any>,
        timeout: number,
        image: string,
        source: string,
        entrypoint: string,
        version: string,
        path: string,
        method: string,
        headers: Record<string, string>,
        runtimeEntrypoint: string | null,
        requestTimeout: number | null
    }) {
        if (!headers['host']) {
            headers['host'] = process.env._APP_DOMAIN || '';
        }

        const runtimeId = `${projectId}-${deploymentId}`;
        const route = `/runtimes/${runtimeId}/execution`;
        const params = {
            runtimeId,
            variables,
            body,
            timeout,
            path,
            method,
            headers,
            image,
            source,
            entrypoint,
            cpus: this.cpus,
            memory: this.memory,
            version,
            runtimeEntrypoint,
        };

        if (requestTimeout === null) {
            requestTimeout = timeout + 15;
        }

        const response = await this.call(Executor.METHOD_POST, route, { 'x-opr-runtime-id': runtimeId }, params, true, requestTimeout);

        const status = response.headers['status-code'];
        if (status >= 400) {
            const message = typeof response.body === 'string' ? response.body : response.body.message;
            throw new Exception(message, status);
        }

        return response.body;
    }

    private async call(
        method: string,
        path = '',
        headers: Record<string, string> = {},
        params: Record<string, any> = {},
        decode = true,
        timeout = 15,
        callback: ((data: any) => void) | null = null
    ): Promise<{ headers: Record<string, any>, body: any }> {
        headers = { ...this.headers, ...headers };
        const url = new URL(this.endpoint + path);
        const options: any = {
            method,
            headers,
            timeout: timeout * 1000,
        };

        if (this.selfSigned) {
            options.rejectUnauthorized = false;
        }

        return new Promise((resolve, reject) => {
            const req = (url.protocol === 'https:' ? https : http).request(url, options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                    if (callback) {
                        callback(chunk);
                    }
                });

                res.on('end', () => {
                    const responseHeaders = res.headers;
                    const responseBody = decode && responseHeaders['content-type']?.startsWith('application/json')
                        ? JSON.parse(data)
                        : data;

                    if (res.statusCode && res.statusCode >= 400) {
                        if (res.statusCode === 408) {
                            reject(new AppcondaException(AppcondaException.FUNCTION_SYNCHRONOUS_TIMEOUT, ''));
                        } else {
                            reject(new Exception(res.statusMessage || '', res.statusCode || 500));
                        }
                    } else {
                        resolve({
                            headers: responseHeaders,
                            body: responseBody
                        });
                    }
                });
            });

            req.on('error', (e) => {
                reject(e);
            });

            if (method !== Executor.METHOD_GET && params) {
                req.write(JSON.stringify(params));
            }

            req.end();
        });
    }

    public parseCookie(cookie: string): Record<string, string> {
        const cookies: Record<string, string> = {};
        cookie.split(';').forEach(part => {
            const [key, value] = part.split('=');
            cookies[key.trim()] = decodeURIComponent(value);
        });
        return cookies;
    }

    protected flatten(data: Record<string, any>, prefix = ''): Record<string, any> {
        const output: Record<string, any> = {};

        for (const [key, value] of Object.entries(data)) {
            const finalKey = prefix ? `${prefix}[${key}]` : key;

            if (typeof value === 'object' && value !== null) {
                Object.assign(output, this.flatten(value, finalKey));
            } else {
                output[finalKey] = value;
            }
        }

        return output;
    }
}