import { Validator } from '../../../Tuval/Core';

/**
 * Email
 *
 * Validate that a variable is a valid email address
 *
 * @package Utopia\Validator
 */
export class Email extends Validator {
    protected allowEmpty: boolean;

    constructor(allowEmpty: boolean = false) {
        super();
        this.allowEmpty = allowEmpty;
    }

    /**
     * Get Description
     *
     * Returns validator description
     *
     * @return {string}
     */
    public getDescription(): string {
        return 'Value must be a valid email address';
    }

    /**
     * Is valid
     *
     * Validation will pass when $value is valid email address.
     *
     * @param {any} value
     * @return {boolean}
     */
    public isValid(value: any): boolean {
        if (this.allowEmpty && value.length === 0) {
            return true;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
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
