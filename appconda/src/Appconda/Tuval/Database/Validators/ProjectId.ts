import { Validator } from '../../../../Tuval/Core';

export class ProjectId extends Validator {
    /**
     * Is valid.
     *
     * Returns true if valid or false if not.
     *
     * @param {any} value
     * @return {boolean}
     */
    public isValid(value: any): boolean {
        return value === 'unique()' || /^[a-z0-9][a-z0-9-]{1,35}$/.test(value);
    }

    /**
     * Get description.
     *
     * @return {string}
     */
    public getDescription(): string {
        return "Project IDs must contain at most 36 chars. Valid chars are a-z, 0-9, and hyphen. Can't start with a special char.";
    }

    /**
     * Is array
     *
     * Function will return true if object is array.
     *
     * @return {boolean}
     */
    public isArray(): boolean {
        return false;
    }

    /**
     * Get Type
     *
     * Returns validator type.
     *
     * @return {string}
     */
    public getType(): string {
        return Validator.TYPE_STRING;
    }
}
