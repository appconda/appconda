import { OAuth2 } from '../OAuth2';

export class Notion extends OAuth2 {
    private endpoint: string = 'https://api.notion.com/v1';
    private version: string = '2021-08-16';
    protected user: Record<string, any> = {};
    protected tokens: Record<string, any> = {};
    protected scopes: string[] = [];

    public getName(): string {
        return 'notion';
    }

    public getLoginURL(): string {
        return this.endpoint + '/oauth/authorize?' + new URLSearchParams({
            client_id: this.appID,
            redirect_uri: this.callback,
            response_type: 'code',
            state: JSON.stringify(this.state),
            owner: 'user'
        }).toString();
    }

    public async getTokens(code: string): Promise<Record<string, any>> {
        if (Object.keys(this.tokens).length === 0) {
            const headers = { 'Authorization': 'Basic ' + btoa(this.appID + ':' + this.appSecret) };
            const response = await this.request(
                'POST',
                this.endpoint + '/oauth/token',
                headers,
                new URLSearchParams({
                    grant_type: 'authorization_code',
                    redirect_uri: this.callback,
                    code: code
                }).toString()
            );
            this.tokens = JSON.parse(response);
        }
        return this.tokens;
    }

    public async refreshTokens(refreshToken: string): Promise<Record<string, any>> {
        const headers = { 'Authorization': 'Basic ' + btoa(this.appID + ':' + this.appSecret) };
        const response = await this.request(
            'POST',
            this.endpoint + '/oauth/token',
            headers,
            new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            }).toString()
        );
        this.tokens = JSON.parse(response);

        if (!this.tokens['refresh_token']) {
            this.tokens['refresh_token'] = refreshToken;
        }
        return this.tokens;
    }

    public async getUserID(accessToken: string): Promise<string> {
        const response = await this.getUser(accessToken);
        return response['bot']['owner']['user']['id'] || '';
    }

    public async getUserEmail(accessToken: string): Promise<string> {
        const response = await this.getUser(accessToken);
        return response['bot']['owner']['user']['person']['email'] || '';
    }

    public async isEmailVerified(accessToken: string): Promise<boolean> {
        const email = await this.getUserEmail(accessToken);
        return !!email;
    }

    public async getUserName(accessToken: string): Promise<string> {
        const response = await this.getUser(accessToken);
        return response['bot']['owner']['user']['name'] || '';
    }

    protected async getUser(accessToken: string): Promise<Record<string, any>> {
        const headers = {
            'Notion-Version': this.version,
            'Authorization': 'Bearer ' + encodeURIComponent(accessToken)
        };

        if (Object.keys(this.user).length === 0) {
            const response = await this.request('GET', this.endpoint + '/users/me', headers);
            this.user = JSON.parse(response);
        }
        return this.user;
    }
}
