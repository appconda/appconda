import { OAuth2 } from "../OAuth2";

// Reference Material
// https://developer.box.com/reference/

export class Box extends OAuth2 {
    private endpoint: string = 'https://account.box.com/api/oauth2/';
    private resourceEndpoint: string = 'https://api.box.com/2.0/';
    protected user: Record<string, any> = {};
    protected tokens: Record<string, any> = {};
    protected scopes: string[] = [
        'manage_app_users',
    ];

    public getName(): string {
        return 'box';
    }

    public getLoginURL(): string {
        return this.endpoint + 'authorize?' + new URLSearchParams({
            response_type: 'code',
            client_id: this.appID,
            scope: this.getScopes().join(','),
            redirect_uri: this.callback,
            state: JSON.stringify(this.state),
        }).toString();
    }

    public async getTokens(code: string): Promise<Record<string, any>> {
        if (Object.keys(this.tokens).length === 0) {
            const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
            const response = await this.request(
                'POST',
                this.endpoint + 'token',
                headers,
                new URLSearchParams({
                    client_id: this.appID,
                    client_secret: this.appSecret,
                    code: code,
                    grant_type: 'authorization_code',
                    scope: this.getScopes().join(','),
                    redirect_uri: this.callback
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
            this.endpoint + 'token',
            headers,
            new URLSearchParams({
                client_id: this.appID,
                client_secret: this.appSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
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
        return user['login'] || '';
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
        const headers = { 'Authorization': 'Bearer ' + encodeURIComponent(accessToken) };
        if (Object.keys(this.user).length === 0) {
            const response = await this.request('GET', this.resourceEndpoint + 'me', headers);
            this.user = JSON.parse(response);
        }

        return this.user;
    }
}
