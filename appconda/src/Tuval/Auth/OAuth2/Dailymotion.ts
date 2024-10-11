import { OAuth2 } from "../OAuth2"; 

// Reference Material
// https://developers.dailymotion.com/api/#authentication

export class Dailymotion extends OAuth2 {
    private endpoint: string = 'https://api.dailymotion.com';
    private authEndpoint: string = 'https://www.dailymotion.com/oauth/authorize';
    protected scopes: string[] = [
        'userinfo',
        'email'
    ];
    protected fields: string[] = [
        'email',
        'id',
        'fullname',
        'verified'
    ];
    protected user: Record<string, any> = {};
    protected tokens: Record<string, any> = {};

    public getName(): string {
        return 'dailymotion';
    }

    public getFields(): string[] {
        return this.fields;
    }

    public getLoginURL(): string {
        return this.authEndpoint + '?' + new URLSearchParams({
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
                this.endpoint + '/oauth/token',
                { "Content-Type": 'application/x-www-form-urlencoded' },
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
            this.endpoint + '/oauth/token',
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
        const user = await this.getUser(accessToken);
        return !!user['verified'];
    }

    public async getUserName(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        return user['fullname'] || '';
    }

    protected async getUser(accessToken: string): Promise<Record<string, any>> {
        if (Object.keys(this.user).length === 0) {
            const response = await this.request(
                'GET',
                this.endpoint + '/user/me?fields=' + this.getFields().join(','),
                { 'Authorization': 'Bearer ' + encodeURIComponent(accessToken) }
            );
            this.user = JSON.parse(response);
        }
        return this.user;
    }
}
