import { OAuth2 } from "../OAuth2"; 

export class Etsy extends OAuth2 {
    private endpoint: string = 'https://api.etsy.com/v3/public';
    private version: string = '2022-07-14';
    protected user: Record<string, any> = {};
    protected tokens: Record<string, any> = {};
    protected scopes: string[] = [
        "email_r",
        "profile_r",
    ];
    private pkce: string = '';

    private getPKCE(): string {
        if (!this.pkce) {
            this.pkce = Array.from(crypto.getRandomValues(new Uint8Array(43)))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        }
        return this.pkce;
    }

    public getName(): string {
        return 'etsy';
    }

    public getLoginURL(): string {
        return 'https://www.etsy.com/oauth/connect/oauth/authorize?' + new URLSearchParams({
            client_id: this.appID,
            redirect_uri: this.callback,
            response_type: 'code',
            state: JSON.stringify(this.state),
            scope: this.scopes.join(' '),
            code_challenge: this.getPKCE(),
            code_challenge_method: 'S256',
        }).toString();
    }

    public async getTokens(code: string): Promise<Record<string, any>> {
        if (Object.keys(this.tokens).length === 0) {
            const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
            const response = await this.request(
                'POST',
                this.endpoint + '/oauth/token',
                headers,
                new URLSearchParams({
                    grant_type: 'authorization_code',
                    client_id: this.appID,
                    redirect_uri: this.callback,
                    code: code,
                    code_verifier: this.getPKCE(),
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
            this.endpoint + '/oauth/token',
            headers,
            new URLSearchParams({
                grant_type: 'refresh_token',
                client_id: this.appID,
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
        const components = accessToken.split('.');
        return components[0];
    }

    public async getUserEmail(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        return user['primary_email'];
    }

    public async isEmailVerified(accessToken: string): Promise<boolean> {
        const email = await this.getUserEmail(accessToken);
        return !!email;
    }

    public async getUserName(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        return user['login_name'];
    }

    protected async getUser(accessToken: string): Promise<Record<string, any>> {
        if (Object.keys(this.user).length > 0) {
            return this.user;
        }

        const headers = { 'Authorization': 'Bearer ' + accessToken };
        const response = await this.request(
            'GET',
            'https://api.etsy.com/v3/application/users/' + await this.getUserID(accessToken),
            headers
        );
        this.user = JSON.parse(response);
        return this.user;
    }
}
