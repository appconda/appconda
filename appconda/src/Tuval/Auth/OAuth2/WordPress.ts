import { OAuth2 } from '../OAuth2';

// Reference Material
// https://developer.wordpress.com/docs/wpcc/

export class WordPress extends OAuth2 {
    protected user: Record<string, any> = {};
    protected tokens: Record<string, any> = {};
    protected scopes: string[] = [
        'auth',
    ];

    public getName(): string {
        return 'wordpress';
    }

    public getLoginURL(): string {
        return 'https://public-api.wordpress.com/oauth2/authorize?' + new URLSearchParams({
            client_id: this.appID,
            redirect_uri: this.callback,
            response_type: 'code',
            scope: this.getScopes().join(' '),
            state: JSON.stringify(this.state)
        }).toString();
    }

    public async getTokens(code: string): Promise<Record<string, any>> {
        if (Object.keys(this.tokens).length === 0) {
            const response = await this.request(
                'POST',
                'https://public-api.wordpress.com/oauth2/token',
                {},
                new URLSearchParams({
                    client_id: this.appID,
                    redirect_uri: this.callback,
                    client_secret: this.appSecret,
                    grant_type: 'authorization_code',
                    code: code
                }).toString()
            );
            this.tokens = JSON.parse(response);
        }
        return this.tokens;
    }

    public async refreshTokens(refreshToken: string): Promise<Record<string, any>> {
        const response = await this.request(
            'POST',
            'https://public-api.wordpress.com/oauth2/token',
            {},
            new URLSearchParams({
                client_id: this.appID,
                client_secret: this.appSecret,
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
        const user = await this.getUser(accessToken);
        return user['ID'] || '';
    }

    public async getUserEmail(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        return user['verified'] ? user['email'] || '' : '';
    }

    public async isEmailVerified(accessToken: string): Promise<boolean> {
        const user = await this.getUser(accessToken);
        return !!user['email_verified'];
    }

    public async getUserName(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        return user['username'] || '';
    }

    protected async getUser(accessToken: string): Promise<Record<string, any>> {
        if (Object.keys(this.user).length === 0) {
            const response = await this.request(
                'GET',
                'https://public-api.wordpress.com/rest/v1/me',
                { 'Authorization': 'Bearer ' + accessToken }
            );
            this.user = JSON.parse(response);
        }
        return this.user;
    }
}
