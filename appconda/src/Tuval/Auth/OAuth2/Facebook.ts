import { OAuth2 } from "../OAuth2";

export class Facebook extends OAuth2 {
    protected version: string = 'v2.8';
    protected user: Record<string, any> = {};
    protected tokens: Record<string, any> = {};
    protected scopes: string[] = [
        'email'
    ];

    public getName(): string {
        return 'facebook';
    }

    public getLoginURL(): string {
        return 'https://www.facebook.com/' + this.version + '/dialog/oauth?' + new URLSearchParams({
            client_id: this.appID,
            redirect_uri: this.callback,
            scope: this.getScopes().join(' '),
            state: JSON.stringify(this.state)
        }).toString();
    }

    public async getTokens(code: string): Promise<Record<string, any>> {
        if (Object.keys(this.tokens).length === 0) {
            const response = await this.request(
                'GET',
                'https://graph.facebook.com/' + this.version + '/oauth/access_token?' + new URLSearchParams({
                    client_id: this.appID,
                    redirect_uri: this.callback,
                    client_secret: this.appSecret,
                    code: code
                }).toString()
            );
            this.tokens = JSON.parse(response);
        }

        return this.tokens;
    }

    public async refreshTokens(refreshToken: string): Promise<Record<string, any>> {
        const response = await this.request(
            'GET',
            'https://graph.facebook.com/' + this.version + '/oauth/access_token?' + new URLSearchParams({
                client_id: this.appID,
                redirect_uri: this.callback,
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
        return user['name'] || '';
    }

    protected async getUser(accessToken: string): Promise<Record<string, any>> {
        if (Object.keys(this.user).length === 0) {
            const response = await this.request(
                'GET',
                'https://graph.facebook.com/' + this.version + '/me?fields=email,name&access_token=' + encodeURIComponent(accessToken)
            );
            this.user = JSON.parse(response);
        }

        return this.user;
    }
}