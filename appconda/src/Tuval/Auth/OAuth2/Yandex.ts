import { OAuth2 } from '../OAuth2';

// Reference Material
// https://tech.yandex.com/passport/doc/dg/reference/request-docpage/
// https://tech.yandex.com/oauth/doc/dg/reference/web-client-docpage/

export class Yandex extends OAuth2 {
    protected user: Record<string, any> = {};
    protected tokens: Record<string, any> = {};
    protected scopes: string[] = [];

    public getName(): string {
        return 'Yandex';
    }

    public parseState(state: string): Record<string, any> {
        return JSON.parse(decodeURIComponent(state));
    }

    public getLoginURL(): string {
        return 'https://oauth.yandex.com/authorize?' + new URLSearchParams({
            response_type: 'code',
            client_id: this.appID,
            scope: this.getScopes().join(' '),
            state: JSON.stringify(this.state)
        }).toString();
    }

    public async getTokens(code: string): Promise<Record<string, any>> {
        if (Object.keys(this.tokens).length === 0) {
            const headers = {
                'Authorization': 'Basic ' + btoa(`${this.appID}:${this.appSecret}`),
                'Content-Type': 'application/x-www-form-urlencoded',
            };
            const response = await this.request(
                'POST',
                'https://oauth.yandex.com/token',
                headers,
                new URLSearchParams({
                    code: code,
                    grant_type: 'authorization_code'
                }).toString()
            );
            this.tokens = JSON.parse(response);
        }
        return this.tokens;
    }

    public async refreshTokens(refreshToken: string): Promise<Record<string, any>> {
        const headers = {
            'Authorization': 'Basic ' + btoa(`${this.appID}:${this.appSecret}`),
            'Content-Type': 'application/x-www-form-urlencoded',
        };
        const response = await this.request(
            'POST',
            'https://oauth.yandex.com/token',
            headers,
            new URLSearchParams({
                refresh_token: refreshToken,
                grant_type: 'authorization_code'
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
        return user['id'] || '';
    }

    public async getUserEmail(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        return user['default_email'] || '';
    }

    public async isEmailVerified(accessToken: string): Promise<boolean> {
        return false;
    }

    public async getUserName(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        return user['display_name'] || '';
    }

    protected async getUser(accessToken: string): Promise<Record<string, any>> {
        if (Object.keys(this.user).length === 0) {
            const response = await this.request(
                'GET',
                'https://login.yandex.ru/info?' + new URLSearchParams({
                    format: 'json',
                    oauth_token: accessToken
                }).toString()
            );
            this.user = JSON.parse(response);
        }
        return this.user;
    }
}
