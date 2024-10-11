import { OAuth2 } from '../OAuth2';

// Reference Material
// https://developer.paypal.com/docs/api/overview/

export class Paypal extends OAuth2 {
    private endpoint: Record<string, string> = {
        sandbox: 'https://www.sandbox.paypal.com/',
        live: 'https://www.paypal.com/',
    };

    private resourceEndpoint: Record<string, string> = {
        sandbox: 'https://api.sandbox.paypal.com/v1/',
        live: 'https://api.paypal.com/v1/',
    };

    protected environment: string = 'live';
    protected user: Record<string, any> = {};
    protected tokens: Record<string, any> = {};
    protected scopes: string[] = [
        'openid',
        'profile',
        'email'
    ];

    public getName(): string {
        return 'paypal';
    }

    public getLoginURL(): string {
        const url = this.endpoint[this.environment] + 'connect/?' + new URLSearchParams({
            flowEntry: 'static',
            response_type: 'code',
            client_id: this.appID,
            scope: this.getScopes().join(' '),
            redirect_uri: this.callback.replace("localhost", "127.0.0.1"),
            state: JSON.stringify(this.state),
        }).toString();

        return url;
    }

    public async getTokens(code: string): Promise<Record<string, any>> {
        if (Object.keys(this.tokens).length === 0) {
            const response = await this.request(
                'POST',
                this.resourceEndpoint[this.environment] + 'oauth2/token',
                { 'Authorization': 'Basic ' + btoa(this.appID + ':' + this.appSecret) },
                new URLSearchParams({
                    code: code,
                    grant_type: 'authorization_code',
                }).toString()
            );
            this.tokens = JSON.parse(response);
        }
        return this.tokens;
    }

    public async refreshTokens(refreshToken: string): Promise<Record<string, any>> {
        const response = await this.request(
            'POST',
            this.resourceEndpoint[this.environment] + 'oauth2/token',
            { 'Authorization': 'Basic ' + btoa(this.appID + ':' + this.appSecret) },
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
        return user['payer_id'] || '';
    }

    public async getUserEmail(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        if (user['emails']) {
            const email = user['emails'].find((email: any) => email.primary === true);
            if (email) {
                return email.value;
            }
        }
        return '';
    }

    public async isEmailVerified(accessToken: string): Promise<boolean> {
        const user = await this.getUser(accessToken);
        return !!user['verified_account'];
    }

    public async getUserName(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        return user['name'] || '';
    }

    protected async getUser(accessToken: string): Promise<Record<string, any>> {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + encodeURIComponent(accessToken),
        };
        if (Object.keys(this.user).length === 0) {
            const response = await this.request(
                'GET',
                this.resourceEndpoint[this.environment] + 'identity/oauth2/userinfo?schema=paypalv1.1',
                headers
            );
            this.user = JSON.parse(response);
        }
        return this.user;
    }
}
