import { OAuth2 } from '../OAuth2';

// Reference Material
// https://help.salesforce.com/articleView?id=remoteaccess_oauth_endpoints.htm&type=5
// https://help.salesforce.com/articleView?id=remoteaccess_oauth_tokens_scopes.htm&type=5
// https://help.salesforce.com/articleView?id=remoteaccess_oauth_web_server_flow.htm&type=5

export class Salesforce extends OAuth2 {
    protected user: Record<string, any> = {};
    protected tokens: Record<string, any> = {};
    protected scopes: string[] = [
        "openid"
    ];

    public getName(): string {
        return 'Salesforce';
    }

    public parseState(state: string): Record<string, any> {
        return JSON.parse(decodeURIComponent(state));
    }

    public getLoginURL(): string {
        return 'https://login.salesforce.com/services/oauth2/authorize?' + new URLSearchParams({
            response_type: 'code',
            client_id: this.appID,
            redirect_uri: this.callback,
            scope: this.getScopes().join(' '),
            state: JSON.stringify(this.state)
        }).toString();
    }

    public async getTokens(code: string): Promise<Record<string, any>> {
        if (Object.keys(this.tokens).length === 0) {
            const headers = {
                'Authorization': 'Basic ' + btoa(this.appID + ':' + this.appSecret),
                'Content-Type': 'application/x-www-form-urlencoded',
            };
            const response = await this.request(
                'POST',
                'https://login.salesforce.com/services/oauth2/token',
                headers,
                new URLSearchParams({
                    code: code,
                    redirect_uri: this.callback,
                    grant_type: 'authorization_code'
                }).toString()
            );
            this.tokens = JSON.parse(response);
        }
        return this.tokens;
    }

    public async refreshTokens(refreshToken: string): Promise<Record<string, any>> {
        const headers = {
            'Authorization': 'Basic ' + btoa(this.appID + ':' + this.appSecret),
            'Content-Type': 'application/x-www-form-urlencoded',
        };
        const response = await this.request(
            'POST',
            'https://login.salesforce.com/services/oauth2/token',
            headers,
            new URLSearchParams({
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
        return user['user_id'] || '';
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
        return user['name'] || '';
    }

    protected async getUser(accessToken: string): Promise<Record<string, any>> {
        if (Object.keys(this.user).length === 0) {
            const response = await this.request('GET', 'https://login.salesforce.com/services/oauth2/userinfo?access_token=' + encodeURIComponent(accessToken));
            this.user = JSON.parse(response);
        }
        return this.user;
    }
}
