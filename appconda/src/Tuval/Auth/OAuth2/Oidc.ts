import { OAuth2 } from '../OAuth2';

// Reference Material
// https://openid.net/connect/faq/

export class Oidc extends OAuth2 {
    protected scopes: string[] = [
        'openid',
        'profile',
        'email',
    ];
    protected user: Record<string, any> = {};
    protected tokens: Record<string, any> = {};
    protected wellKnownConfiguration: Record<string, any> = {};

    public getName(): string {
        return 'oidc';
    }

    public getLoginURL(): string {
        return this.getAuthorizationEndpoint() + '?' + new URLSearchParams({
            client_id: this.appID,
            redirect_uri: this.callback,
            state: JSON.stringify(this.state),
            scope: this.getScopes().join(' '),
            response_type: 'code',
        }).toString();
    }

    public async getTokens(code: string): Promise<Record<string, any>> {
        if (Object.keys(this.tokens).length === 0) {
            const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
            const response = await this.request(
                'POST',
                await this.getTokenEndpoint(),
                headers,
                new URLSearchParams({
                    code: code,
                    client_id: this.appID,
                    client_secret: this.getClientSecret(),
                    redirect_uri: this.callback,
                    scope: this.getScopes().join(' '),
                    grant_type: 'authorization_code'
                }).toString()
            );
            this.tokens = JSON.parse(response);
        }
        return this.tokens;
    }

    public async refreshTokens(refreshToken: string): Promise<Record<string, any>> {
        const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        const response = await this.request(
            'POST',
            await this.getTokenEndpoint(),
            headers,
            new URLSearchParams({
                refresh_token: refreshToken,
                client_id: this.appID,
                client_secret: this.getClientSecret(),
                grant_type: 'refresh_token'
            }).toString()
        );
        this.tokens = JSON.parse(response);

        if (!this.tokens['refresh_token']) {
            this.tokens['refresh_token'] = refreshToken;
        }
        return this.tokens;
    }

    public async getUserID(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        return user['sub'] || '';
    }

    public async getUserEmail(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        return user['email'] || '';
    }

    public async isEmailVerified(accessToken: string): Promise<boolean> {
        const user = await this.getUser(accessToken);
        return !!user['email_verified'];
    }

    public async getUserName(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        return user['name'] || '';
    }

    protected async getUser(accessToken: string): Promise<Record<string, any>> {
        if (Object.keys(this.user).length === 0) {
            const headers = { 'Authorization': 'Bearer ' + encodeURIComponent(accessToken) };
            const response = await this.request('GET', await this.getUserinfoEndpoint(), headers);
            this.user = JSON.parse(response);
        }
        return this.user;
    }

    protected getClientSecret(): string {
        const secret = this.getAppSecret();
        return secret.clientSecret || '';
    }

    protected getWellKnownEndpoint(): string {
        const secret = this.getAppSecret();
        return secret.wellKnownEndpoint || '';
    }

    protected async getAuthorizationEndpoint(): Promise<string> {
        const secret = this.getAppSecret();
        const endpoint = secret.authorizationEndpoint || '';
        if (endpoint) {
            return endpoint;
        }
        const wellKnownConfiguration = await this.getWellKnownConfiguration();
        return wellKnownConfiguration.authorization_endpoint || '';
    }

    protected async getTokenEndpoint(): Promise<string> {
        const secret = this.getAppSecret();
        const endpoint = secret.tokenEndpoint || '';
        if (endpoint) {
            return endpoint;
        }
        const wellKnownConfiguration = await this.getWellKnownConfiguration();
        return wellKnownConfiguration.token_endpoint || '';
    }

    protected async getUserinfoEndpoint(): Promise<string> {
        const secret = this.getAppSecret();
        const endpoint = secret.userinfoEndpoint || '';
        if (endpoint) {
            return endpoint;
        }
        const wellKnownConfiguration = await this.getWellKnownConfiguration();
        return wellKnownConfiguration.userinfo_endpoint || '';
    }

    protected async getWellKnownConfiguration(): Promise<Record<string, any>> {
        if (Object.keys(this.wellKnownConfiguration).length === 0) {
            const response = await this.request('GET', this.getWellKnownEndpoint());
            this.wellKnownConfiguration = JSON.parse(response);
        }
        return this.wellKnownConfiguration;
    }

    protected getAppSecret(): Record<string, any> {
        try {
            return JSON.parse(this.appSecret);
        } catch (e) {
            throw new Error('Invalid secret');
        }
    }
}
