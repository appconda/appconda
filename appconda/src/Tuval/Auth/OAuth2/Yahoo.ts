import { OAuth2 } from '../OAuth2';

// Reference Material
// https://developer.yahoo.com/oauth2/guide/

export class Yahoo extends OAuth2 {
    private endpoint: string = 'https://api.login.yahoo.com/oauth2/';
    private resourceEndpoint: string = 'https://api.login.yahoo.com/openid/v1/userinfo';
    protected scopes: string[] = [
        'sdct-r',
        'sdpp-w',
    ];
    protected user: Record<string, any> = {};
    protected tokens: Record<string, any> = {};

    public getName(): string {
        return 'yahoo';
    }

    public parseState(state: string): Record<string, any> {
        return JSON.parse(decodeURIComponent(state));
    }

    public getLoginURL(): string {
        return this.endpoint + 'request_auth?' + new URLSearchParams({
            response_type: 'code',
            client_id: this.appID,
            scope: this.getScopes().join(' '),
            redirect_uri: this.callback,
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
                this.endpoint + 'get_token',
                headers,
                new URLSearchParams({
                    code: code,
                    grant_type: 'authorization_code',
                    redirect_uri: this.callback
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
            this.endpoint + 'get_token',
            headers,
            new URLSearchParams({
                refresh_token: refreshToken,
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
        const email = await this.getUserEmail(accessToken);
        return !!email;
    }

    public async getUserName(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        return user['name'] || '';
    }

    protected async getUser(accessToken: string): Promise<Record<string, any>> {
        if (Object.keys(this.user).length === 0) {
            const response = await this.request(
                'GET',
                this.resourceEndpoint,
                { 'Authorization': 'Bearer ' + encodeURIComponent(accessToken) }
            );
            this.user = JSON.parse(response);
        }
        return this.user;
    }
}
