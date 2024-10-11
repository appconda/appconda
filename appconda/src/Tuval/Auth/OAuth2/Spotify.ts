import { OAuth2 } from '../OAuth2';

// Reference Material
// https://dev.twitch.tv/docs/authentication

export class Spotify extends OAuth2 {
    private endpoint: string = 'https://accounts.spotify.com/';
    private resourceEndpoint: string = 'https://api.spotify.com/v1/';
    protected scopes: string[] = [
        'user-read-email',
    ];
    protected user: Record<string, any> = {};
    protected tokens: Record<string, any> = {};

    public getName(): string {
        return 'spotify';
    }

    public getLoginURL(): string {
        return this.endpoint + 'authorize?' + new URLSearchParams({
            response_type: 'code',
            client_id: this.appID,
            scope: this.getScopes().join(' '),
            redirect_uri: this.callback,
            state: JSON.stringify(this.state)
        }).toString();
    }

    public async getTokens(code: string): Promise<Record<string, any>> {
        if (Object.keys(this.tokens).length === 0) {
            const headers = { 'Authorization': 'Basic ' + btoa(this.appID + ':' + this.appSecret) };
            const response = await this.request(
                'POST',
                this.endpoint + 'api/token',
                headers,
                new URLSearchParams({
                    code: code,
                    grant_type: 'authorization_code',
                    redirect_uri: this.callback
                }).toString()
            );
            this.tokens = JSON.parse(response);
        }
        return this.tokens;
    }

    public async refreshTokens(refreshToken: string): Promise<Record<string, any>> {
        const headers = { 'Authorization': 'Basic ' + btoa(this.appID + ':' + this.appSecret) };
        const response = await this.request(
            'POST',
            this.endpoint + 'api/token',
            headers,
            new URLSearchParams({
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
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
        return false;
    }

    public async getUserName(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        return user['display_name'] || '';
    }

    protected async getUser(accessToken: string): Promise<Record<string, any>> {
        if (Object.keys(this.user).length === 0) {
            const response = await this.request(
                'GET',
                this.resourceEndpoint + 'me',
                { 'Authorization': 'Bearer ' + encodeURIComponent(accessToken) }
            );
            this.user = JSON.parse(response);
        }
        return this.user;
    }
}
