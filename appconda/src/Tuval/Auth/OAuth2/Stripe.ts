import { OAuth2 } from '../OAuth2';

export class Stripe extends OAuth2 {
    protected user: Record<string, any> = {};
    protected tokens: Record<string, any> = {};
    protected stripeAccountId: string = '';
    protected scopes: string[] = [
        'read_write',
    ];
    protected grantType: Record<string, string> = {
        'authorize': 'authorization_code',
        'refresh': 'refresh_token',
    };

    public getName(): string {
        return 'stripe';
    }

    public getLoginURL(): string {
        return 'https://connect.stripe.com/oauth/authorize?' + new URLSearchParams({
            response_type: 'code',
            client_id: this.appID,
            redirect_uri: this.callback,
            scope: this.getScopes().join(' '),
            state: JSON.stringify(this.state)
        }).toString();
    }

    public async getTokens(code: string): Promise<Record<string, any>> {
        if (Object.keys(this.tokens).length === 0) {
            const response = await this.request(
                'POST',
                'https://connect.stripe.com/oauth/token',
                {},
                new URLSearchParams({
                    grant_type: this.grantType['authorize'],
                    code: code
                }).toString()
            );
            this.tokens = JSON.parse(response);
            this.stripeAccountId = this.tokens['stripe_user_id'];
        }
        return this.tokens;
    }

    public async refreshTokens(refreshToken: string): Promise<Record<string, any>> {
        const response = await this.request(
            'POST',
            'https://connect.stripe.com/oauth/token',
            {},
            new URLSearchParams({
                grant_type: this.grantType['refresh'],
                refresh_token: refreshToken
            }).toString()
        );
        this.tokens = JSON.parse(response);

        if (!this.tokens['refresh_token']) {
            this.tokens['refresh_token'] = refreshToken;
        }

        this.stripeAccountId = this.tokens['stripe_user_id'];
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
        const email = await this.getUserEmail(accessToken);
        return !!email;
    }

    public async getUserName(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        return user['name'] || '';
    }

    protected async getUser(accessToken: string): Promise<Record<string, any>> {
        if (Object.keys(this.user).length === 0 && this.stripeAccountId) {
            const response = await this.request(
                'GET',
                'https://api.stripe.com/v1/accounts/' + this.stripeAccountId,
                { 'Authorization': 'Bearer ' + encodeURIComponent(accessToken) }
            );
            this.user = JSON.parse(response);
        }
        return this.user;
    }
}