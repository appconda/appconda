import { OAuth2 } from "../OAuth2"; 

// Reference Material
// https://discordapp.com/developers/docs/topics/oauth2

export class Discord extends OAuth2 {
    private endpoint: string = 'https://discordapp.com/api';
    protected user: Record<string, any> = {};
    protected tokens: Record<string, any> = {};
    protected scopes: string[] = [
        'identify',
        'email'
    ];

    public getName(): string {
        return 'discord';
    }

    public getLoginURL(): string {
        return this.endpoint + '/oauth2/authorize?' + new URLSearchParams({
            response_type: 'code',
            client_id: this.appID,
            state: JSON.stringify(this.state),
            scope: this.getScopes().join(' '),
            redirect_uri: this.callback
        }).toString();
    }

    public async getTokens(code: string): Promise<Record<string, any>> {
        if (Object.keys(this.tokens).length === 0) {
            const response = await this.request(
                'POST',
                this.endpoint + '/oauth2/token',
                { 'Content-Type': 'application/x-www-form-urlencoded' },
                new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: this.callback,
                    client_id: this.appID,
                    client_secret: this.appSecret,
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
            this.endpoint + '/oauth2/token',
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
        return user['username'] || '';
    }

    protected async getUser(accessToken: string): Promise<Record<string, any>> {
        if (Object.keys(this.user).length === 0) {
            const response = await this.request(
                'GET',
                this.endpoint + '/users/@me',
                { 'Authorization': 'Bearer ' + encodeURIComponent(accessToken) }
            );
            this.user = JSON.parse(response);
        }

        return this.user;
    }
}
