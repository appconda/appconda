import { OAuth2 } from "../OAuth2";

export class Github extends OAuth2 {
    protected user: Record<string, any> = {};
    protected tokens: Record<string, any> = {};
    protected scopes: string[] = [
        'user:email',
    ];

    public getName(): string {
        return 'github';
    }

    public getLoginURL(): string {
        return 'https://github.com/login/oauth/authorize?' + new URLSearchParams({
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
                'https://github.com/login/oauth/access_token',
                {},
                new URLSearchParams({
                    client_id: this.appID,
                    redirect_uri: this.callback,
                    client_secret: this.appSecret,
                    code: code
                }).toString()
            );

            const output: Record<string, any> = {};
            new URLSearchParams(response).forEach((value, key) => {
                output[key] = value;
            });
            this.tokens = output;
        }

        return this.tokens;
    }

    public async refreshTokens(refreshToken: string): Promise<Record<string, any>> {
        const response = await this.request(
            'POST',
            'https://github.com/login/oauth/access_token',
            {},
            new URLSearchParams({
                client_id: this.appID,
                client_secret: this.appSecret,
                grant_type: 'refresh_token',
                refresh_token: refreshToken
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
        return user['id'] || '';
    }

    public async getUserEmail(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        return user['email'] || '';
    }

    public async isEmailVerified(accessToken: string): Promise<boolean> {
        const user = await this.getUser(accessToken);
        return !!user['verified'];
    }

    public async getUserName(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        return user['name'] || '';
    }

    public async getUserSlug(accessToken: string): Promise<string> {
        const user = await this.getUser(accessToken);
        return user['login'] || '';
    }

    protected async getUser(accessToken: string): Promise<Record<string, any>> {
        if (Object.keys(this.user).length === 0) {
            this.user = JSON.parse(await this.request('GET', 'https://api.github.com/user', { 'Authorization': 'token ' + encodeURIComponent(accessToken) }));

            const emails = JSON.parse(await this.request('GET', 'https://api.github.com/user/emails', { 'Authorization': 'token ' + encodeURIComponent(accessToken) }));

            let verifiedEmail: any = null;
            let primaryEmail: any = null;

            for (const email of emails) {
                if (email.verified) {
                    verifiedEmail = email;
                    if (email.primary) {
                        primaryEmail = email;
                    }
                }
            }

            if (primaryEmail) {
                this.user['email'] = primaryEmail.email;
                this.user['verified'] = primaryEmail.verified;
            } else if (verifiedEmail) {
                this.user['email'] = verifiedEmail.email;
                this.user['verified'] = verifiedEmail.verified;
            }
        }

        return this.user;
    }

    public async createRepository(accessToken: string, repositoryName: string, isPrivate: boolean): Promise<Record<string, any>> {
        const response = await this.request('POST', 'https://api.github.com/user/repos', { 'Authorization': 'token ' + encodeURIComponent(accessToken) }, JSON.stringify({
            name: repositoryName,
            private: isPrivate
        }));

        return JSON.parse(response);
    }
}
