
import { Key } from './Key';

export class Label extends Key {
    protected message: string = 'Value must be a valid string between 1 and 36 chars containing only alphanumeric chars';

    public isValid(value: any): boolean {
        if (!super.isValid(value)) {
            return false;
        }

        // Valid chars: A-Z, a-z, 0-9
        if (/[^A-Za-z0-9]/.test(value)) {
            return false;
        }

        return true;
    }
}