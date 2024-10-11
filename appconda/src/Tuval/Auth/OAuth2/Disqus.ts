import { OAuth2 } from "../OAuth2";

// Reference Material
// https://disqus.com/api/docs/auth/

export class Disqus extends OAuth2 {
    private endpoint: string = 'https://disqus.com/api/';
    protected user: Record<string, any> = {};
    protected tokens: Record<string, any> = {};
    protected scopes: string[] = [
        'read',
        'email',
    ];

    public getName(): string {
        return 'disqus';
    }

    public getLoginURL(): string {
        return this.endpoint + 'oauth/2.0/authorize/?' + new URLSearchParams({
            response_type: 'code',
            client_id: this.appID,
            state: JSON.stringify(this.state),
            redirect_uri: this.callback,
            scope: this.getScopes().join(',')
        }).toString();
    }

    public async getTokens(code: string): Promise<Record<string, any>> {
        if (Object.keys(this.tokens).length === 0) {
            const response = await this.request(
                'POST',
                this.endpoint + 'oauth/2.0/access_token/',
                { 'Content-Type': 'application/x-www-form-urlencoded' },
                new URLSearchParams({
                    grant_type: 'authorization_code',
                    client_id: this.appID,
                    client_secret: this.appSecret,
                    redirect_uri: this.callback,
                    code: code,
                    scope: this.getScopes().join(' ')
                }).toString()
            );
            this.tokens = JSON.parse(response);
        }
        return this.tokens;
    }

    public async refreshTokens(refreshToken: string): Promise<Record<string, any>> {
        const response = await this.request(
            'POST',
            this.endpoint + 'oauth/2.0/access_token/?',
            { 'Content-Type': 'application/x-www-form-urlencoded' },
            new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: this.appID,
                client_secret: this.appSecret
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
        // Look out for the change in their endpoint.
        // It's in Beta so they may provide a parameter in the future.
        // https://disqus.com/api/docs/users/details/
        return false;
    }

    public async getUserName(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        return user['name'] || '';
    }

    protected async getUser(accessToken: string): Promise<Record<string, any>> {
        if (Object.keys(this.user).length === 0) {
            const response = await this.request(
                'GET',
                this.endpoint + '3.0/users/details.json?' + new URLSearchParams({
                    access_token: accessToken,
                    api_key: this.appID,
                    api_secret: this.appSecret
                }).toString()
            );
            this.user = JSON.parse(response)['response'];
        }
        return this.user;
    }
}
