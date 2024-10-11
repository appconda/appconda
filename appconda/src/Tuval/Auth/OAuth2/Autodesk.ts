import { OAuth2 } from "../OAuth2";


export class Autodesk extends OAuth2 {
    protected user: Record<string, any> = {};
    protected tokens: Record<string, any> = {};
    protected scopes: string[] = [
        'user-profile:read',
    ];

    public getName(): string {
        return 'autodesk';
    }

    public getLoginURL(): string {
        return 'https://developer.api.autodesk.com/authentication/v1/authorize?' + new URLSearchParams({
            client_id: this.appID,
            scope: this.getScopes().join(' '),
            state: JSON.stringify(this.state),
            redirect_uri: this.callback,
            response_type: 'code'
        }).toString();
    }

    public async getTokens(code: string): Promise<Record<string, any>> {
        if (Object.keys(this.tokens).length === 0) {
            const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
            const response = await this.request(
                'POST',
                'https://developer.api.autodesk.com/authentication/v1/gettoken',
                headers,
                new URLSearchParams({
                    client_id: this.appID,
                    redirect_uri: this.callback,
                    client_secret: this.appSecret,
                    code: code,
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
            'https://developer.api.autodesk.com/authentication/v1/refreshtoken',
            {},
            new URLSearchParams({
                client_id: this.appID,
                client_secret: this.appSecret,
                grant_type: 'refresh_token',
                code: refreshToken,
                redirect_uri: this.callback,
            }).toString()
        );

        const output: Record<string, any> = {};
        new URLSearchParams(response).forEach((value, key) => {
            output[key] = value;
        });
        this.tokens = output;

        if (!this.tokens['refresh_token']) {
            this.tokens['refresh_token'] = refreshToken;
        }

        return this.tokens;
    }

    public async getUserID(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        return user['userId'] || '';
    }

    public async getUserEmail(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        return user['emailId'] || '';
    }

    public async isEmailVerified(accessToken: string): Promise<boolean> {
        const user = await this.getUser(accessToken);
        return !!user['emailVerified'];
    }

    public async getUserName(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        return user['userName'] || '';
    }

    protected async getUser(accessToken: string): Promise<Record<string, any>> {
        if (Object.keys(this.user).length === 0) {
            const headers = { 'Authorization': 'Bearer ' + encodeURIComponent(accessToken) };
            const response = await this.request('GET', 'https://developer.api.autodesk.com/userprofile/v1/users/@me', headers);
            this.user = JSON.parse(response);
        }

        return this.user;
    }
}
