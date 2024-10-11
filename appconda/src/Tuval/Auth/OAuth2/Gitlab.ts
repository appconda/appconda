import { OAuth2 } from "../OAuth2";

// Reference Material
// https://docs.gitlab.com/ee/api/oauth2.html

export class Gitlab extends OAuth2 {
    protected user: Record<string, any> = {};
    protected tokens: Record<string, any> = {};
    protected scopes: string[] = [
        'read_user'
    ];

    public getName(): string {
        return 'gitlab';
    }

    public getLoginURL(): string {
        return this.getEndpoint() + '/oauth/authorize?' + new URLSearchParams({
            client_id: this.appID,
            redirect_uri: this.callback,
            scope: this.getScopes().join(' '),
            state: JSON.stringify(this.state),
            response_type: 'code'
        }).toString();
    }

    public async getTokens(code: string): Promise<Record<string, any>> {
        if (Object.keys(this.tokens).length === 0) {
            const response = await this.request(
                'POST',
                this.getEndpoint() + '/oauth/token?' + new URLSearchParams({
                    code: code,
                    client_id: this.appID,
                    client_secret: this.getAppSecret().clientSecret,
                    redirect_uri: this.callback,
                    grant_type: 'authorization_code'
                }).toString()
            );
            this.tokens = JSON.parse(response);
        }
        return this.tokens;
    }

    public async refreshTokens(refreshToken: string): Promise<Record<string, any>> {
        const response = await this.request(
            'POST',
            this.getEndpoint() + '/oauth/token?' + new URLSearchParams({
                refresh_token: refreshToken,
                client_id: this.appID,
                client_secret: this.getAppSecret().clientSecret,
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
        const user = await this.getUser(accessToken);
        return !!user['confirmed_at'];
    }

    public async getUserName(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        return user['name'] || '';
    }

    protected async getUser(accessToken: string): Promise<Record<string, any>> {
        if (Object.keys(this.user).length === 0) {
            const response = await this.request(
                'GET',
                this.getEndpoint() + '/api/v4/user?access_token=' + encodeURIComponent(accessToken)
            );
            this.user = JSON.parse(response);
        }
        return this.user;
    }

    protected getAppSecret(): Record<string, any> {
        try {
            return JSON.parse(this.appSecret);
        } catch (e) {
            throw new Error('Invalid secret');
        }
    }

    protected getEndpoint(): string {
        const defaultEndpoint = 'https://gitlab.com';
        const secret = this.getAppSecret();
        return secret.endpoint || defaultEndpoint;
    }
}