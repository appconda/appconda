import { totp } from 'otplib';
import { Auth } from '../Auth';

export abstract class Type {
    protected instance: ReturnType<typeof totp.create>;

    public static readonly TOTP = 'totp';
    public static readonly EMAIL = 'email';
    public static readonly PHONE = 'phone';
    public static readonly RECOVERY_CODE = 'recoveryCode';

    constructor() {
        this.instance = totp;
    }

    public setLabel(label: string): this {
        this.instance.options = { ...this.instance.options, label };
        return this;
    }

    public getLabel(): string | null {
        return this.instance.options.label as any;
    }

    public setIssuer(issuer: string): this {
        this.instance.options = { ...this.instance.options, issuer };
        return this;
    }

    public getIssuer(): string | null {
        return this.instance.options.issuer as any;
    }

    public getSecret(): string {
        return this.instance.options.secret as any;
    }

    public getProvisioningUri(): string {
        const { label, issuer, secret } = this.instance.options;
        if (typeof secret !== 'string') {
            throw new Error('Invalid secret type. Expected string.');
        }

        if (typeof label !== 'string') {
            throw new Error('Invalid secret type. Expected string.');
        }

        if (typeof issuer !== 'string') {
            throw new Error('Invalid secret type. Expected string.');
        }
        return this.instance.keyuri(label, issuer, secret);
    }

    public static generateBackupCodes(length: number = 10, total: number = 6): string[] {
        const backups: string[] = [];

        for (let i = 0; i < total; i++) {
            backups.push(Auth.tokenGenerator(length));
        }

        return backups;
    }
}