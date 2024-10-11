import { Validator } from '../../../Tuval/Core';
import dns from 'dns';

export class CNAME extends Validator {
    protected logs: any;
    protected target: string;

    constructor(target: string) {
        super();
        this.target = target;
    }

    public getDescription(): string {
        return 'Invalid CNAME record';
    }

    public getLogs(): any {
        return this.logs;
    }

    // @ts-ignore
    public async isValid(domain: any): Promise<boolean> {
        if (typeof domain !== 'string') {
            return false;
        }

        try {
            const records = await dns.promises.resolveCname(domain);
            this.logs = records;

            if (!records || records.length === 0) {
                return false;
            }
    
            for (const record of records) {
                if (record === this.target) {
                    return true;
                }
            }

        } catch (error) {
            return false;
        }

        return false;
    }

    public isArray(): boolean {
        return false;
    }

    public getType(): string {
        return Validator.TYPE_STRING;
    }
}