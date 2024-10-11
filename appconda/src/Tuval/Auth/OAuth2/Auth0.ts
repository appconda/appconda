

// Reference Material
// https://auth0.com/docs/api/authentication

import { OAuth2 } from "../OAuth2";

export class Auth0 extends OAuth2 {
    protected scopes: string[] = [
        'openid',
        'profile',
        'email',
        'offline_access'
    ];

    protected user: Record<string, any> = {};
    protected tokens: Record<string, any> = {};

    public getName(): string {
        return 'auth0';
    }

    public getLoginURL(): string {
        return 'https://' + this.getAuth0Domain() + '/authorize?' + new URLSearchParams({
            client_id: this.appID,
            redirect_uri: this.callback,
            state: JSON.stringify(this.state),
            scope: this.getScopes().join(' '),
            response_type: 'code'
        }).toString();
    }

    public async getTokens(code: string): Promise<Record<string, any>> {
        if (Object.keys(this.tokens).length === 0) {
            const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
            const response = await this.request(
                'POST',
                'https://' + this.getAuth0Domain() + '/oauth/token',
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
            'https://' + this.getAuth0Domain() + '/oauth/token',
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
            const response = await this.request('GET', 'https://' + this.getAuth0Domain() + '/userinfo', headers);
            this.user = JSON.parse(response);
        }
        return this.user;
    }

    protected getClientSecret(): string {
        const secret = this.getAppSecret();
        return secret['clientSecret'] || '';
    }

    protected getAuth0Domain(): string {
        const secret = this.getAppSecret();
        return secret['auth0Domain'] || '';
    }

    protected getAppSecret(): Record<string, any> {
        try {
            return JSON.parse(this.appSecret);
        } catch (error) {
            throw new Error('Invalid secret');
        }
    }
}
