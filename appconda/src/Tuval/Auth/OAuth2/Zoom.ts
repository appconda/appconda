import { OAuth2 } from '../OAuth2';

export class Zoom extends OAuth2 {
    private endpoint: string = 'https://zoom.us';
    private version: string = '2022-03-26';
    protected user: Record<string, any> = {};
    protected tokens: Record<string, any> = {};
    protected scopes: string[] = [
        'user_info:read'
    ];

    public getName(): string {
        return 'zoom';
    }

    public getLoginURL(): string {
        return this.endpoint + '/oauth/authorize?' + new URLSearchParams({
            client_id: this.appID,
            redirect_uri: this.callback,
            response_type: 'code',
            scope: this.getScopes().join(' '),
            state: JSON.stringify(this.state)
        }).toString();
    }

    public async getTokens(code: string): Promise<Record<string, any>> {
        if (Object.keys(this.tokens).length === 0) {
            const headers = {
                'Authorization': 'Basic ' + btoa(`${this.appID}:${this.appSecret}`),
                'Content-Type': 'application/x-www-form-urlencoded'
            };
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
        const headers = {
            'Authorization': 'Basic ' + btoa(`${this.appID}:${this.appSecret}`),
            'Content-Type': 'application/x-www-form-urlencoded'
        };
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
        return response['id'] || '';
    }

    public async getUserEmail(accessToken: string): Promise<string> {
        const response = await this.getUser(accessToken);
        return response['email'] || '';
    }

    public async isEmailVerified(accessToken: string): Promise<boolean> {
        const user = await this.getUser(accessToken);
        return (user['verified'] ?? false) === 1;
    }

    public async getUserName(accessToken: string): Promise<string> {
        const response = await this.getUser(accessToken);
        return `${response['first_name'] || ''} ${response['last_name'] || ''}`;
    }

    protected async getUser(accessToken: string): Promise<Record<string, any>> {
        const headers = {
            'Authorization': 'Bearer ' + encodeURIComponent(accessToken)
        };

        if (Object.keys(this.user).length === 0) {
            const response = await this.request('GET', 'https://api.zoom.us/v2/users/me', headers);
            this.user = JSON.parse(response);
        }
        return this.user;
    }
}
