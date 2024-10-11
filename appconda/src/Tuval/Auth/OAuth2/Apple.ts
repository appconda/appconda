

// Reference Material
// https://developer.okta.com/blog/2019/06/04/what-the-heck-is-sign-in-with-apple

import { OAuth2 } from "../OAuth2";
import { Exception } from "./Exception";

export class Apple extends OAuth2 {
    protected user: Record<string, any> = {};
    protected tokens: Record<string, any> = {};
    protected scopes: string[] = ["name", "email"];
    protected claims: Record<string, any> = {};

    public getName(): string {
        return 'apple';
    }

    public getLoginURL(): string {
        return 'https://appleid.apple.com/auth/authorize?' + new URLSearchParams({
            client_id: this.appID,
            redirect_uri: this.callback,
            state: JSON.stringify(this.state),
            response_type: 'code',
            response_mode: 'form_post',
            scope: this.getScopes().join(' ')
        }).toString();
    }

    public async getTokens(code: string): Promise<Record<string, any>> {
        if (Object.keys(this.tokens).length === 0) {
            const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
            const response = await this.request(
                'POST',
                'https://appleid.apple.com/auth/token',
                headers,
                new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: code,
                    client_id: this.appID,
                    client_secret: await this.getAppSecret(),
                    redirect_uri: this.callback,
                }).toString()
            );
            this.tokens = JSON.parse(response);
            this.claims = this.tokens['id_token'] ? JSON.parse(atob(this.tokens['id_token'].split('.')[1])) : {};
        }
        return this.tokens;
    }

    public async refreshTokens(refreshToken: string): Promise<Record<string, any>> {
        const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        const response = await this.request(
            'POST',
            'https://appleid.apple.com/auth/token',
            headers,
            new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: this.appID,
                client_secret: await this.getAppSecret(),
            }).toString()
        );
        this.tokens = JSON.parse(response);

        if (!this.tokens['refresh_token']) {
            this.tokens['refresh_token'] = refreshToken;
        }

        this.claims = this.tokens['id_token'] ? JSON.parse(atob(this.tokens['id_token'].split('.')[1])) : {};
        return this.tokens;
    }

    public async getUserID(accessToken: string): Promise<string> {
        return this.claims['sub'] || '';
    }

    public async getUserEmail(accessToken: string): Promise<string> {
        return this.claims['email'] || '';
    }

    public async isEmailVerified(accessToken: string): Promise<boolean> {
        return !!this.claims['email_verified'];
    }

    public async getUserName(accessToken: string): Promise<string> {
        return '';
    }

    protected async getAppSecret(): Promise<string> {
        let secret: Record<string, any>;
        try {
            secret = JSON.parse(this.appSecret);
        } catch (error) {
            throw new Exception('Invalid secret');
        }

        const keyfile = secret['p8'] || ''; // Your p8 Key file
        const keyID = secret['keyID'] || ''; // Your Key ID
        const teamID = secret['teamID'] || ''; // Your Team ID (see Developer Portal)
        const bundleID = this.appID; // Your Bundle ID

        const headers = {
            alg: 'ES256',
            kid: keyID,
        };

        const claims = {
            iss: teamID,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 86400 * 180,
            aud: 'https://appleid.apple.com',
            sub: bundleID,
        };

        const pkey = await crypto.subtle.importKey(
            'pkcs8',
            Buffer.from(keyfile, 'base64'),
            { name: 'ECDSA', namedCurve: 'P-256' },
            false,
            ['sign']
        );

        const payload = this.encode(JSON.stringify(headers)) + '.' + this.encode(JSON.stringify(claims));
        const signature = await crypto.subtle.sign(
            { name: 'ECDSA', hash: { name: 'SHA-256' } },
            pkey,
            new TextEncoder().encode(payload)
        );

        return payload + '.' + this.encode(Buffer.from(signature).toString('base64'));
    }

    protected encode(data: string): string {
        return data.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    protected retrievePositiveInteger(data: string): string {
        while (data.startsWith('00') && data[2] > '7f') {
            data = data.slice(2);
        }
        return data;
    }

    protected fromDER(der: string, partLength: number): string {
        const hex = Buffer.from(der, 'base64').toString('hex');

        if (hex.slice(0, 2) !== '30') { // SEQUENCE
            throw new Error('Invalid DER format');
        }

        let offset = 2;
        if (hex.slice(2, 4) === '81') { // LENGTH > 128
            offset += 2;
        }
        offset += 2;

        if (hex.slice(offset, offset + 2) !== '02') { // INTEGER
            throw new Error('Invalid DER format');
        }

        const Rl = parseInt(hex.slice(offset + 2, offset + 4), 16);
        let R = this.retrievePositiveInteger(hex.slice(offset + 4, offset + 4 + Rl * 2));
        R = R.padStart(partLength, '0');

        offset += 4 + Rl * 2;

        if (hex.slice(offset, offset + 2) !== '02') { // INTEGER
            throw new Error('Invalid DER format');
        }

        const Sl = parseInt(hex.slice(offset + 2, offset + 4), 16);
        let S = this.retrievePositiveInteger(hex.slice(offset + 4, offset + 4 + Sl * 2));
        S = S.padStart(partLength, '0');

        return Buffer.from(R + S, 'hex').toString('base64');
    }
}
