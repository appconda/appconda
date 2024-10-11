import { Validator } from '../Validator';

/**
 * Wildcard
 *
 * Does not perform any validation. Always returns valid.
 *
 * @package Validators
 */
export class Wildcard extends Validator {
    /**
     * Get Description
     *
     * Returns validator description.
     *
     * @returns string
     */
    getDescription(): string {
        return 'Every input is valid';
    }

    /**
     * Is valid
     *
     * Validation will always pass irrespective of input.
     *
     * @param value The value to validate.
     * @returns boolean
     */
    isValid(value: any): boolean {
        return true;
    }

    /**
     * Is array
     *
     * Returns false as Wildcard does not expect an array.
     *
     * @returns boolean
     */
    isArray(): boolean {
        return false;
    }

    /**
     * Get Type
     *
     * Returns the validator type.
     *
     * @returns string
     */
    getType(): string {
        return Validator.TYPE_STRING;
    }
}