import { OAuth2 } from '../OAuth2';

// Reference Material
// https://developers.tradeshift.com/docs/api

export class Tradeshift extends OAuth2 {
    public static readonly TRADESHIFT_SANDBOX_API_DOMAIN = 'api-sandbox.tradeshift.com';
    public static readonly TRADESHIFT_API_DOMAIN = 'api.tradeshift.com';

    private apiDomain: Record<string, string> = {
        sandbox: Tradeshift.TRADESHIFT_SANDBOX_API_DOMAIN,
        live: Tradeshift.TRADESHIFT_API_DOMAIN,
    };

    private endpoint: Record<string, string> = {
        sandbox: `https://${Tradeshift.TRADESHIFT_SANDBOX_API_DOMAIN}/tradeshift/`,
        live: `https://${Tradeshift.TRADESHIFT_API_DOMAIN}/tradeshift/`,
    };

    private resourceEndpoint: Record<string, string> = {
        sandbox: `https://${Tradeshift.TRADESHIFT_SANDBOX_API_DOMAIN}/tradeshift/rest/external/`,
        live: `https://${Tradeshift.TRADESHIFT_API_DOMAIN}/tradeshift/rest/external/`,
    };

    protected environment: string = 'live';
    protected user: Record<string, any> = {};
    protected tokens: Record<string, any> = {};
    protected scopes: string[] = [
        'openid',
        'offline',
    ];

    public getName(): string {
        return 'tradeshift';
    }

    public getLoginURL(): string {
        const httpQuery = new URLSearchParams({
            response_type: 'code',
            client_id: this.appID,
            scope: this.getScopes().join(' '),
            redirect_uri: this.callback.replace("localhost", "127.0.0.1"),
            state: JSON.stringify(this.state),
        }).toString();

        return `${this.endpoint[this.environment]}auth/login?${httpQuery}`;
    }

    public async getTokens(code: string): Promise<Record<string, any>> {
        if (Object.keys(this.tokens).length === 0) {
            const response = await this.request(
                'POST',
                `${this.endpoint[this.environment]}auth/token`,
                { 'Authorization': 'Basic ' + btoa(`${this.appID}:${this.appSecret}`) },
                new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: code,
                }).toString()
            );
            this.tokens = JSON.parse(response);
        }
        return this.tokens;
    }

    public async refreshTokens(refreshToken: string): Promise<Record<string, any>> {
        const response = await this.request(
            'POST',
            `${this.endpoint[this.environment]}auth/token`,
            { 'Authorization': 'Basic ' + btoa(`${this.appID}:${this.appSecret}`) },
            new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
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
        return user['Id'] || '';
    }

    public async getUserEmail(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        return user['Username'] || '';
    }

    public async isEmailVerified(accessToken: string): Promise<boolean> {
        const email = await this.getUserEmail(accessToken);
        return !!email;
    }

    public async getUserName(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        const firstName = user['FirstName'] || '';
        const lastName = user['LastName'] || '';
        return `${firstName} ${lastName}`;
    }

    protected async getUser(accessToken: string): Promise<Record<string, any>> {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Host': encodeURIComponent(this.apiDomain[this.environment]),
            'Authorization': 'Bearer ' + accessToken,
        };

        if (Object.keys(this.user).length === 0) {
            const response = await this.request(
                'GET',
                `${this.resourceEndpoint[this.environment]}account/info/user`,
                headers
            );
            this.user = JSON.parse(response);
        }
        return this.user;
    }
}
