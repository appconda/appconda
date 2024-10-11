export abstract class Adapter {
    protected userAgent: string = 'Utopia PHP Framework';
    protected endpoint: string;
    protected apiKey: string;
    protected apiSecret: string;
    protected headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    /**
     * __construct
     * Instantiate a new adapter.
     *
     * @param  {string} endpoint
     * @param  {string} apiKey
     * @param  {string} apiSecret
     */
    constructor(endpoint: string, apiKey: string, apiSecret: string) {
        this.endpoint = endpoint;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;

        this.headers = {
            'Authorization': `sso-key ${this.apiKey}:${this.apiSecret}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };
    }

    /**
     * Call
     *
     * Make an API call
     *
     * @param  {string} method
     * @param  {string} path
     * @param  {any} params
     * @param  {Record<string, string>} headers
     * @throws {Error}
     */
    async call(method: string, path: string = '', params: any = {}, headers: Record<string, string> = {}): Promise<any> {
        headers = { ...this.headers, ...headers };
        const url = path.startsWith('http') ? path : `${this.endpoint}${path}${method === 'GET' && Object.keys(params).length && headers['Content-Type'] !== 'text/xml' ? `?${new URLSearchParams(params).toString()}` : ''}`;

        const options: RequestInit = {
            method,
            headers: new Headers(headers),
            body: method !== 'GET' ? this.prepareBody(params, headers['Content-Type']) : undefined,
        };

        const response = await fetch(url, options);
        const responseBody = await this.parseResponse(response);

        if (!response.ok) {
            throw new Error(`${response.status}: ${responseBody}`);
        }

        return responseBody;
    }

    /**
     * Prepare request body based on content type
     */
    private prepareBody(params: any, contentType: string): any {
        switch (contentType) {
            case 'application/json':
                return JSON.stringify(params);
            case 'multipart/form-data':
                return this.flatten(params);
            case 'text/xml':
                return params;
            default:
                return new URLSearchParams(params).toString();
        }
    }

    /**
     * Parse response based on content type
     */
    private async parseResponse(response: Response): Promise<any> {
        const contentType = response.headers.get('Content-Type') || '';
        if (contentType.includes('application/json')) {
            return response.json();
        }
        return response.text();
    }

    /**
     * Flatten params array to PHP multiple format
     */
    protected flatten(data: Record<string, any>, prefix: string = ''): Record<string, any> {
        const output: Record<string, any> = {};

        for (const [key, value] of Object.entries(data)) {
            const finalKey = prefix ? `${prefix}[${key}]` : key;

            if (typeof value === 'object' && !Array.isArray(value)) {
                Object.assign(output, this.flatten(value, finalKey));
            } else {
                output[finalKey] = value;
            }
        }

        return output;
    }
}
