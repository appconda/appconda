import { OAuth2 } from '../OAuth2';

// Reference Material
// https://developer.yammer.com/docs/oauth-2

export class Yammer extends OAuth2 {
    private endpoint: string = 'https://www.yammer.com/oauth2/';
    protected user: Record<string, any> = {};
    protected tokens: Record<string, any> = {};

    public getName(): string {
        return 'yammer';
    }

    public getLoginURL(): string {
        return this.endpoint + 'authorize?' + new URLSearchParams({
            client_id: this.appID,
            response_type: 'code',
            redirect_uri: this.callback,
            state: JSON.stringify(this.state)
        }).toString();
    }

    public async getTokens(code: string): Promise<Record<string, any>> {
        if (Object.keys(this.tokens).length === 0) {
            const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
            const response = await this.request(
                'POST',
                this.endpoint + 'access_token',
                headers,
                new URLSearchParams({
                    client_id: this.appID,
                    client_secret: this.appSecret,
                    code: code,
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
            this.endpoint + 'access_token',
            headers,
            new URLSearchParams({
                client_id: this.appID,
                client_secret: this.appSecret,
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
        return user['id'] || '';
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
        return user['full_name'] || '';
    }

    protected async getUser(accessToken: string): Promise<Record<string, any>> {
        if (Object.keys(this.user).length === 0) {
            const headers = { 'Authorization': 'Bearer ' + encodeURIComponent(accessToken) };
            const response = await this.request('GET', 'https://www.yammer.com/api/v1/users/current.json', headers);
            this.user = JSON.parse(response);
        }
        return this.user;
    }
}
