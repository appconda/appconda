import { OAuth2 } from '../OAuth2';

// Reference Material
// https://developers.podio.com/doc/oauth-authorization

export class Podio extends OAuth2 {
    private endpoint: string = 'https://podio.com/oauth';
    private apiEndpoint: string = 'https://api.podio.com';
    protected user: Record<string, any> = {};
    protected tokens: Record<string, any> = {};
    protected scopes: string[] = []; // No scopes required

    public getName(): string {
        return 'podio';
    }

    public getLoginURL(): string {
        const url = this.endpoint + '/authorize?' + new URLSearchParams({
            client_id: this.appID,
            state: JSON.stringify(this.state),
            redirect_uri: this.callback
        }).toString();

        return url;
    }

    public async getTokens(code: string): Promise<Record<string, any>> {
        if (Object.keys(this.tokens).length === 0) {
            const response = await this.request(
                'POST',
                this.apiEndpoint + '/oauth/token',
                { 'Content-Type': 'application/x-www-form-urlencoded' },
                new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: this.callback,
                    client_id: this.appID,
                    client_secret: this.appSecret
                }).toString()
            );
            this.tokens = JSON.parse(response);
        }
        return this.tokens;
    }

    public async refreshTokens(refreshToken: string): Promise<Record<string, any>> {
        const response = await this.request(
            'POST',
            this.apiEndpoint + '/oauth/token',
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
        return user['user_id'] ? String(user['user_id']) : '';
    }

    public async getUserEmail(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        return user['mail'] || '';
    }

    public async isEmailVerified(accessToken: string): Promise<boolean> {
        const user = await this.getUser(accessToken);
        const mails = user['mails'];
        const mainMailIndex = mails.findIndex((m: any) => m['mail'] === user['mail']);
        const mainMail = mails[mainMailIndex];

        return mainMail['verified'] || false;
    }

    public async getUserName(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        return user['name'] || '';
    }

    protected async getUser(accessToken: string): Promise<Record<string, any>> {
        if (Object.keys(this.user).length === 0) {
            const userResponse = await this.request(
                'GET',
                this.apiEndpoint + '/user',
                { 'Authorization': 'Bearer ' + encodeURIComponent(accessToken) }
            );
            const profileResponse = await this.request(
                'GET',
                this.apiEndpoint + '/user/profile',
                { 'Authorization': 'Bearer ' + encodeURIComponent(accessToken) }
            );

            const user = JSON.parse(userResponse);
            const profile = JSON.parse(profileResponse);

            this.user = user;
            this.user['name'] = profile['name'];
        }
        return this.user;
    }
}
