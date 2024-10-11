import { OAuth2 } from '../OAuth2';

export class Slack extends OAuth2 {
    protected user: Record<string, any> = {};
    protected tokens: Record<string, any> = {};
    protected scopes: string[] = [
        'identity.avatar',
        'identity.basic',
        'identity.email',
        'identity.team'
    ];

    public getName(): string {
        return 'slack';
    }

    public getLoginURL(): string {
        return 'https://slack.com/oauth/authorize?' + new URLSearchParams({
            client_id: this.appID,
            scope: this.getScopes().join(' '),
            redirect_uri: this.callback,
            state: JSON.stringify(this.state)
        }).toString();
    }

    public async getTokens(code: string): Promise<Record<string, any>> {
        if (Object.keys(this.tokens).length === 0) {
            const response = await this.request(
                'GET',
                'https://slack.com/api/oauth.access?' + new URLSearchParams({
                    client_id: this.appID,
                    client_secret: this.appSecret,
                    code: code,
                    redirect_uri: this.callback
                }).toString()
            );
            this.tokens = JSON.parse(response);
        }
        return this.tokens;
    }

    public async refreshTokens(refreshToken: string): Promise<Record<string, any>> {
        const response = await this.request(
            'GET',
            'https://slack.com/api/oauth.access?' + new URLSearchParams({
                client_id: this.appID,
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
        return user['user']['id'] || '';
    }

    public async getUserEmail(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        return user['user']['email'] || '';
    }

    public async isEmailVerified(accessToken: string): Promise<boolean> {
        const email = await this.getUserEmail(accessToken);
        return !!email;
    }

    public async getUserName(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        return user['user']['name'] || '';
    }

    protected async getUser(accessToken: string): Promise<Record<string, any>> {
        if (Object.keys(this.user).length === 0) {
            const response = await this.request(
                'GET',
                'https://slack.com/api/users.identity?token=' + encodeURIComponent(accessToken)
            );
            this.user = JSON.parse(response);
        }
        return this.user;
    }
}
