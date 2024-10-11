import { UID } from '../../../../Tuval/Database';
import { Validator } from '../../../../Tuval/Core';

export class CompoundUID extends Validator {
    public getDescription(): string {
        return "Must consist of multiple UIDs separated by a colon. Each UID must contain at most 36 chars. Valid chars are a-z, A-Z, 0-9, and underscore. Can't start with a special char.";
    }

    public isArray(): boolean {
        return false;
    }

    public isValid(value: any): boolean {
        if (typeof value !== 'string') {
            return false;
        }

        const ids = CompoundUID.parse(value);

        if (ids.length < 2) {
            return false;
        }

        for (const id of ids) {
            const validator = new UID();
            if (!validator.isValid(id)) {
                return false;
            }
        }

        return true;
    }

    public getType(): string {
        return Validator.TYPE_STRING;
    }

    public static parse(key: string): string[] {
        return key.split(':');
    }
}
