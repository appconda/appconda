import { Exception } from './OAuth2/Exception';

export abstract class OAuth2 {
    protected appID: string;
    protected appSecret: string;
    protected callback: string;
    protected state: Record<string, any>;
    protected scopes: string[];

    constructor(appID: string, appSecret: string, callback: string, state: Record<string, any> = {}, scopes: string[] = []) {
        this.appID = appID;
        this.appSecret = appSecret;
        this.callback = callback;
        this.state = state;
        this.scopes = [];
        scopes.forEach(scope => this.addScope(scope));
    }

    abstract getName(): string;
    abstract getLoginURL(): string;
    abstract getTokens(code: string): Promise<Record<string, any>>;
    abstract refreshTokens(refreshToken: string): Promise<Record<string, any>>;
    abstract getUserID(accessToken: string): Promise<string>;
    abstract getUserEmail(accessToken: string): Promise<string>;
    abstract isEmailVerified(accessToken: string): Promise<boolean>;
    abstract getUserName(accessToken: string): Promise<string>;

    protected addScope(scope: string): this {
        if (!this.scopes.includes(scope)) {
            this.scopes.push(scope);
        }
        return this;
    }

    protected getScopes(): string[] {
        return this.scopes;
    }

    public async getAccessToken(code: string): Promise<string> {
        const tokens = await this.getTokens(code);
        return tokens['access_token'] || '';
    }

    public async getRefreshToken(code: string): Promise<string> {
        const tokens = await this.getTokens(code);
        return tokens['refresh_token'] || '';
    }

    public async getAccessTokenExpiry(code: string): Promise<number> {
        const tokens = await this.getTokens(code);
        return tokens['expires_in'] || 0;
    }

    public parseState(state: string): Record<string, any> {
        return JSON.parse(state);
    }

    protected async request(method: string, url: string = '', headers: Record<string, string> = {}, payload: string = ''): Promise<string> {
        const options: RequestInit = {
            method,
            headers: {
                'User-Agent': 'Appconda OAuth2',
                'Content-Length': payload.length.toString(),
                ...headers
            },
            body: payload
        };

        const response = await fetch(url, options);
        const responseBody = await response.text();

        if (!response.ok) {
            throw new Exception(responseBody, response.status);
        }

        return responseBody;
    }
}