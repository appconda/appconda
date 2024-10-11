

// Reference Material
// https://confluence.atlassian.com/bitbucket/oauth-on-bitbucket-cloud-238027431.html#OAuthonBitbucketCloud-Createaconsumer

import { OAuth2 } from "../OAuth2";

export class Bitbucket extends OAuth2 {
    protected user: Record<string, any> = {};
    protected tokens: Record<string, any> = {};
    protected scopes: string[] = [];

    public getName(): string {
        return 'bitbucket';
    }

    public getLoginURL(): string {
        return 'https://bitbucket.org/site/oauth2/authorize?' + new URLSearchParams({
            response_type: 'code',
            client_id: this.appID,
            scope: this.getScopes().join(' '),
            state: JSON.stringify(this.state),
        }).toString();
    }

    public async getTokens(code: string): Promise<Record<string, any>> {
        if (Object.keys(this.tokens).length === 0) {
            const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
            const response = await this.request(
                'POST',
                'https://bitbucket.org/site/oauth2/access_token',
                headers,
                new URLSearchParams({
                    code: code,
                    client_id: this.appID,
                    client_secret: this.appSecret,
                    grant_type: 'authorization_code'
                }).toString()
            );
            this.tokens = JSON.parse(response);
        }
        return this.tokens;
    }

    public async refreshTokens(refreshToken: string): Promise<Record<string, any>> {
        const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        const response = await this.request(
            'POST',
            'https://bitbucket.org/site/oauth2/access_token',
            headers,
            new URLSearchParams({
                client_id: this.appID,
                client_secret: this.appSecret,
                grant_type: 'refresh_token',
                refresh_token: refreshToken
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
        return user['uuid'] || '';
    }

    public async getUserEmail(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        return user['email'] || '';
    }

    public async isEmailVerified(accessToken: string): Promise<boolean> {
        const user = await this.getUser(accessToken);
        return !!user['is_confirmed'];
    }

    public async getUserName(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        return user['display_name'] || '';
    }

    protected async getUser(accessToken: string): Promise<Record<string, any>> {
        if (Object.keys(this.user).length === 0) {
            const userResponse = await this.request('GET', 'https://api.bitbucket.org/2.0/user?access_token=' + encodeURIComponent(accessToken));
            this.user = JSON.parse(userResponse);

            const emailsResponse = await this.request('GET', 'https://api.bitbucket.org/2.0/user/emails?access_token=' + encodeURIComponent(accessToken));
            const emails = JSON.parse(emailsResponse);
            if (emails['values']) {
                for (const email of emails['values']) {
                    if (email['is_confirmed']) {
                        this.user['email'] = email['email'];
                        this.user['is_confirmed'] = email['is_confirmed'];
                        break;
                    }
                }
            }
        }
        return this.user;
    }
}