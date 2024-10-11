import { OAuth2 } from "../OAuth2";

export class Firebase extends OAuth2 {
    protected user: Record<string, any> = {};
    protected tokens: Record<string, any> = {};
    protected scopes: string[] = [
        'https://www.googleapis.com/auth/firebase',
        'https://www.googleapis.com/auth/datastore',
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/identitytoolkit',
        'https://www.googleapis.com/auth/userinfo.profile'
    ];
    protected iamPermissions: string[] = [
        // Database
        'datastore.databases.get',
        'datastore.databases.list',
        'datastore.entities.get',
        'datastore.entities.list',
        'datastore.indexes.get',
        'datastore.indexes.list',
        // Generic Firebase permissions
        'firebase.projects.get',
        // Auth
        'firebaseauth.configs.get',
        'firebaseauth.configs.getHashConfig',
        'firebaseauth.configs.getSecret',
        'firebaseauth.users.get',
        'identitytoolkit.tenants.get',
        'identitytoolkit.tenants.list',
        // IAM Assignment
        'iam.serviceAccounts.list',
        // Storage
        'storage.buckets.get',
        'storage.buckets.list',
        'storage.objects.get',
        'storage.objects.list'
    ];

    public getName(): string {
        return 'firebase';
    }

    public getLoginURL(): string {
        return 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
            access_type: 'offline',
            client_id: this.appID,
            redirect_uri: this.callback,
            scope: this.getScopes().join(' '),
            state: JSON.stringify(this.state),
            response_type: 'code',
            prompt: 'consent',
        }).toString();
    }

    public async getTokens(code: string): Promise<Record<string, any>> {
        if (Object.keys(this.tokens).length === 0) {
            const response = await this.request(
                'POST',
                'https://oauth2.googleapis.com/token',
                {},
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
            'https://oauth2.googleapis.com/token',
            {},
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

    protected async getUser(accessToken: string): Promise<Record<string, any>> {
        if (Object.keys(this.user).length === 0) {
            const response = await this.request(
                'GET',
                'https://www.googleapis.com/oauth2/v1/userinfo?access_token=' + encodeURIComponent(accessToken),
                {}
            );
            this.user = JSON.parse(response);
        }
        return this.user;
    }

    public async getProjects(accessToken: string): Promise<any[]> {
        const response = await this.request(
            'GET',
            'https://firebase.googleapis.com/v1beta1/projects',
            { 'Authorization': 'Bearer ' + encodeURIComponent(accessToken) }
        );
        const projects = JSON.parse(response);
        return projects['results'];
    }

    public async assignIAMRole(accessToken: string, email: string, projectId: string, role: any): Promise<void> {
        const iamRolesResponse = await this.request(
            'POST',
            `https://cloudresourcemanager.googleapis.com/v1/projects/${projectId}:getIamPolicy`,
            {
                'Authorization': 'Bearer ' + encodeURIComponent(accessToken),
                'Content-Type': 'application/json'
            }
        );
        const iamRoles = JSON.parse(iamRolesResponse);
        iamRoles['bindings'].push({
            'role': role['name'],
            'members': ['serviceAccount:' + email]
        });

        await this.request(
            'POST',
            `https://cloudresourcemanager.googleapis.com/v1/projects/${projectId}:setIamPolicy`,
            {
                'Authorization': 'Bearer ' + encodeURIComponent(accessToken),
                'Content-Type': 'application/json'
            },
            JSON.stringify({ 'policy': iamRoles })
        );
    }

    private generateRandomString(length: number = 10): string {
        const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let randomString = '';
        for (let i = 0; i < length; i++) {
            randomString += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return randomString;
    }

    private async createCustomRole(accessToken: string, projectId: string): Promise<any> {
        try {
            const roleResponse = await this.request(
                'GET',
                `https://iam.googleapis.com/v1/projects/${projectId}/roles/appwriteMigrations`,
                {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + encodeURIComponent(accessToken),
                }
            );
            return JSON.parse(roleResponse);
        } catch (e: any) {
            if (e.code !== 404) {
                throw e;
            }
        }

        const roleResponse = await this.request(
            'POST',
            `https://iam.googleapis.com/v1/projects/${projectId}/roles/`,
            {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + encodeURIComponent(accessToken),
            },
            JSON.stringify({
                'roleId': 'appwriteMigrations',
                'role': {
                    'title': 'Appconda Migrations',
                    'description': 'A helper role for Appconda Migrations',
                    'includedPermissions': this.iamPermissions,
                    'stage': 'GA'
                }
            })
        );
        return JSON.parse(roleResponse);
    }

    public async createServiceAccount(accessToken: string, projectId: string): Promise<any> {
        const uid = this.generateRandomString();
        const response = await this.request(
            'POST',
            `https://iam.googleapis.com/v1/projects/${projectId}/serviceAccounts`,
            {
                'Authorization': 'Bearer ' + encodeURIComponent(accessToken),
                'Content-Type': 'application/json'
            },
            JSON.stringify({
                'accountId': 'appconda-' + uid,
                'serviceAccount': {
                    'displayName': 'Appconda Migrations ' + uid
                }
            })
        );
        const serviceAccount = JSON.parse(response);

        const role = await this.createCustomRole(accessToken, projectId);
        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.assignIAMRole(accessToken, serviceAccount['email'], projectId, role);

        const responseKey = await this.request(
            'POST',
            `https://iam.googleapis.com/v1/projects/${projectId}/serviceAccounts/${serviceAccount['email']}/keys`,
            {
                'Authorization': 'Bearer ' + encodeURIComponent(accessToken),
                'Content-Type': 'application/json'
            }
        );
        const serviceAccountKey = JSON.parse(responseKey);
        return JSON.parse(Buffer.from(serviceAccountKey['privateKeyData'], 'base64').toString('utf-8'));
    }

    public async cleanupServiceAccounts(accessToken: string, projectId: string): Promise<boolean> {
        const response = await this.request(
            'GET',
            `https://iam.googleapis.com/v1/projects/${projectId}/serviceAccounts`,
            {
                'Authorization': 'Bearer ' + encodeURIComponent(accessToken),
                'Content-Type': 'application/json'
            }
        );
        const serviceAccounts = JSON.parse(response);

        if (!serviceAccounts['accounts']) {
            return false;
        }

        for (const account of serviceAccounts['accounts']) {
            if (account['email'].includes('appconda-')) {
                await this.request(
                    'DELETE',
                    `https://iam.googleapis.com/v1/projects/${projectId}/serviceAccounts/${account['email']}`,
                    {
                        'Authorization': 'Bearer ' + encodeURIComponent(accessToken),
                        'Content-Type': 'application/json'
                    }
                );
            }
        }
        return true;
    }
}
