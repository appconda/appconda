import { OAuth2 } from '../OAuth2';

// Reference Material
// https://zoho.com/accounts/protocol/oauth.html

export class Zoho extends OAuth2 {
    private endpoint: string = 'https://accounts.zoho.com';
    protected scopes: string[] = [
        'email',
        'profile',
    ];
    protected user: Record<string, any> = {};
    protected tokens: Record<string, any> = {};

    public getName(): string {
        return 'zoho';
    }

    public getLoginURL(): string {
        return this.endpoint + '/oauth/v2/auth?' + new URLSearchParams({
            response_type: 'code',
            client_id: this.appID,
            state: JSON.stringify(this.state),
            redirect_uri: this.callback,
            scope: this.getScopes().join(' ')
        }).toString();
    }

    public async getTokens(code: string): Promise<Record<string, any>> {
        if (Object.keys(this.tokens).length === 0) {
            const response = await this.request(
                'POST',
                this.endpoint + '/oauth/v2/token',
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
            const idToken = this.tokens['id_token'] || '';
            const payload = idToken.split('.')[1] || '';
            this.user = JSON.parse(atob(payload)) || {};
        }
        return this.tokens;
    }

    public async refreshTokens(refreshToken: string): Promise<Record<string, any>> {
        const response = await this.request(
            'POST',
            this.endpoint + '/oauth/v2/token',
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

        const idToken = this.tokens['id_token'] || '';
        const payload = idToken.split('.')[1] || '';
        this.user = JSON.parse(atob(payload)) || {};

        return this.tokens;
    }

    public async getUserID(accessToken: string): Promise<string> {
        return this.user['sub'] || '';
    }

    public async getUserEmail(accessToken: string): Promise<string> {
        return this.user['email'] || '';
    }

    public async isEmailVerified(accessToken: string): Promise<boolean> {
        return !!this.user['email_verified'];
    }

    public async getUserName(accessToken: string): Promise<string> {
        return this.user['name'] || '';
    }
}
