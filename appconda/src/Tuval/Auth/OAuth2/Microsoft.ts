import { OAuth2 } from '../OAuth2';

// Reference Material
// https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow
// https://docs.microsoft.com/en-us/graph/auth-v2-user

export class Microsoft extends OAuth2 {
    protected user: Record<string, any> = {};
    protected tokens: Record<string, any> = {};
    protected scopes: string[] = [
        'offline_access',
        'user.read'
    ];

    public getName(): string {
        return 'microsoft';
    }

    public getLoginURL(): string {
        return 'https://login.microsoftonline.com/' + this.getTenantID() + '/oauth2/v2.0/authorize?' + new URLSearchParams({
            client_id: this.appID,
            redirect_uri: this.callback,
            state: JSON.stringify(this.state),
            scope: this.getScopes().join(' '),
            response_type: 'code',
            response_mode: 'query'
        }).toString();
    }

    public async getTokens(code: string): Promise<Record<string, any>> {
        if (Object.keys(this.tokens).length === 0) {
            const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
            const response = await this.request(
                'POST',
                'https://login.microsoftonline.com/' + this.getTenantID() + '/oauth2/v2.0/token',
                headers,
                new URLSearchParams({
                    code: code,
                    client_id: this.appID,
                    client_secret: this.getClientSecret(),
                    redirect_uri: this.callback,
                    scope: this.getScopes().join(' '),
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
            'https://login.microsoftonline.com/' + this.getTenantID() + '/oauth2/v2.0/token',
            headers,
            new URLSearchParams({
                refresh_token: refreshToken,
                client_id: this.appID,
                client_secret: this.getClientSecret(),
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
        return user['userPrincipalName'] || '';
    }

    public async isEmailVerified(accessToken: string): Promise<boolean> {
        const email = await this.getUserEmail(accessToken);
        return !!email;
    }

    public async getUserName(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        return user['displayName'] || '';
    }

    protected async getUser(accessToken: string): Promise<Record<string, any>> {
        if (Object.keys(this.user).length === 0) {
            const headers = { 'Authorization': 'Bearer ' + encodeURIComponent(accessToken) };
            const response = await this.request('GET', 'https://graph.microsoft.com/v1.0/me', headers);
            this.user = JSON.parse(response);
        }
        return this.user;
    }

    protected getAppSecret(): Record<string, any> {
        try {
            return JSON.parse(this.appSecret);
        } catch (e) {
            throw new Error('Invalid secret');
        }
    }

    protected getClientSecret(): string {
        const secret = this.getAppSecret();
        return secret.clientSecret || '';
    }

    protected getTenantID(): string {
        const secret = this.getAppSecret();
        return secret.tenantID || 'common';
    }
}
