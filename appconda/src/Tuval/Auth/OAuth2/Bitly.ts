

// Reference Material
// https://dev.bitly.com/v4_documentation.html

import { OAuth2 } from "../OAuth2";

export class Bitly extends OAuth2 {
    private endpoint: string = 'https://bitly.com/oauth/';
    private resourceEndpoint: string = 'https://api-ssl.bitly.com/';
    protected scopes: string[] = [];
    protected user: Record<string, any> = {};
    protected tokens: Record<string, any> = {};

    public getName(): string {
        return 'bitly';
    }

    public getLoginURL(): string {
        return this.endpoint + 'authorize?' + new URLSearchParams({
            client_id: this.appID,
            redirect_uri: this.callback,
            state: JSON.stringify(this.state)
        }).toString();
    }

    public async getTokens(code: string): Promise<Record<string, any>> {
        if (Object.keys(this.tokens).length === 0) {
            const response = await this.request(
                'POST',
                this.resourceEndpoint + 'oauth/access_token',
                { "Content-Type": 'application/x-www-form-urlencoded' },
                new URLSearchParams({
                    client_id: this.appID,
                    client_secret: this.appSecret,
                    code: code,
                    redirect_uri: this.callback,
                    state: JSON.stringify(this.state)
                }).toString()
            );

            const output: Record<string, any> = {};
            new URLSearchParams(response).forEach((value, key) => {
                output[key] = value;
            });
            this.tokens = output;
        }

        return this.tokens;
    }

    public async refreshTokens(refreshToken: string): Promise<Record<string, any>> {
        const response = await this.request(
            'POST',
            this.resourceEndpoint + 'oauth/access_token',
            { "Content-Type": 'application/x-www-form-urlencoded' },
            new URLSearchParams({
                client_id: this.appID,
                client_secret: this.appSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token'
            }).toString()
        );

        const output: Record<string, any> = {};
        new URLSearchParams(response).forEach((value, key) => {
            output[key] = value;
        });
        this.tokens = output;

        if (!this.tokens['refresh_token']) {
            this.tokens['refresh_token'] = refreshToken;
        }

        return this.tokens;
    }

    public async getUserID(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        return user['login'] || '';
    }

    public async getUserEmail(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);

        if (user['emails']) {
            for (const email of user['emails']) {
                if (email['is_verified'] === true) {
                    return email['email'];
                }
            }
        }

        return '';
    }

    public async isEmailVerified(accessToken: string): Promise<boolean> {
        return true;
    }

    public async getUserName(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        return user['name'] || '';
    }

    protected async getUser(accessToken: string): Promise<Record<string, any>> {
        const headers = {
            'Authorization': 'Bearer ' + encodeURIComponent(accessToken),
            'Accept': 'application/json'
        };

        if (Object.keys(this.user).length === 0) {
            const response = await this.request('GET', this.resourceEndpoint + 'v4/user', headers);
            this.user = JSON.parse(response);
        }

        return this.user;
    }
}