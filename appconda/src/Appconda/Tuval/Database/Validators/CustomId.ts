import { Key } from '../../../../Tuval/Database';

export class CustomId extends Key {
    /**
     * Is valid.
     *
     * Returns true if valid or false if not.
     *
     * @param {any} value
     * @return {boolean}
     */
    public isValid(value: any): boolean {
        return value === 'unique()' || super.isValid(value);
    }
}
