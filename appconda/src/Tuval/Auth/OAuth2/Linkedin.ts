import { OAuth2 } from '../OAuth2';

export class Linkedin extends OAuth2 {
    protected user: Record<string, any> = {};
    protected tokens: Record<string, any> = {};
    protected scopes: string[] = [
        'openid',
        'profile',
        'email'
    ];

    /**
     * Documentation.
     *
     * OAuth:
     * https://developer.linkedin.com/docs/oauth2
     *
     * API/V2:
     * https://developer.linkedin.com/docs/guide/v2
     *
     * Basic Profile Fields:
     * https://developer.linkedin.com/docs/fields/basic-profile
     */

    public getName(): string {
        return 'linkedin';
    }

    public getLoginURL(): string {
        return 'https://www.linkedin.com/oauth/v2/authorization?' + new URLSearchParams({
            response_type: 'code',
            client_id: this.appID,
            redirect_uri: this.callback,
            scope: this.getScopes().join(' '),
            state: JSON.stringify(this.state),
        }).toString();
    }

    public async getTokens(code: string): Promise<Record<string, any>> {
        if (Object.keys(this.tokens).length === 0) {
            const response = await this.request(
                'POST',
                'https://www.linkedin.com/oauth/v2/accessToken',
                { 'Content-Type': 'application/x-www-form-urlencoded' },
                new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: this.callback,
                    client_id: this.appID,
                    client_secret: this.appSecret,
                }).toString()
            );
            this.tokens = JSON.parse(response);
        }
        return this.tokens;
    }

    public async refreshTokens(refreshToken: string): Promise<Record<string, any>> {
        const response = await this.request(
            'POST',
            'https://www.linkedin.com/oauth/v2/accessToken',
            { 'Content-Type': 'application/x-www-form-urlencoded' },
            new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                redirect_uri: this.callback,
                client_id: this.appID,
                client_secret: this.appSecret,
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
        const user = await this.getUser(accessToken);
        return !!user['email_verified'];
    }

    public async getUserName(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        let name = '';

        if (user['name']) {
            return user['name'];
        }

        if (user['given_name']) {
            name = user['given_name'];
        }

        if (user['family_name']) {
            name = name ? `${name} ${user['family_name']}` : user['family_name'];
        }

        return name;
    }

    protected async getUser(accessToken: string): Promise<Record<string, any>> {
        if (Object.keys(this.user).length === 0) {
            const response = await this.request(
                'GET',
                'https://api.linkedin.com/v2/userinfo',
                { 'Authorization': 'Bearer ' + encodeURIComponent(accessToken) }
            );
            this.user = JSON.parse(response);
        }
        return this.user;
    }
}
