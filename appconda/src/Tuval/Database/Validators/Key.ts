import { Validator } from "../../../Tuval/Core";

export class Key extends Validator {
    protected allowInternal: boolean = false;
    protected message: string = 'Parameter must contain at most 36 chars. Valid chars are a-z, A-Z, 0-9, period, hyphen, and underscore. Can\'t start with a special char';

    constructor(allowInternal: boolean = false) {
        super();
        this.allowInternal = allowInternal;
    }

    public getDescription(): string {
        return this.message;
    }

    public isValid(value: any): boolean {
        if (typeof value !== 'string') {
            return false;
        }

        if (value === '') {
            return false;
        }

        const leading = value.charAt(0);
        if (leading === '_' || leading === '.' || leading === '-') {
            return false;
        }

        const isInternal = leading === '$';

        if (isInternal && !this.allowInternal) {
            return false;
        }

        if (isInternal) {
            const allowList = ['$id', '$createdAt', '$updatedAt'];
            return allowList.includes(value);
        }

        if (/[^A-Za-z0-9_\-\.]/.test(value)) {
            return false;
        }

        if (value.length > 36) {
            return false;
        }

        return true;
    }

    public isArray(): boolean {
        return false;
    }

    public getType(): string {
        return Validator.TYPE_STRING;
    }
}