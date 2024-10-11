import { Validator } from '../Validator';

/**
 * Numeric
 *
 * Validate that a variable is numeric.
 *
 * @package Validators
 */
export class Numeric extends Validator {
    /**
     * Get Description
     *
     * Returns validator description.
     *
     * @returns string
     */
    getDescription(): string {
        return 'Value must be a valid number';
    }

    /**
     * Is array
     *
     * Function will return true if the object is an array.
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
        return 'mixed';
    }

    /**
     * Is valid
     *
     * Validation will pass when the value is numeric.
     *
     * @param value The value to validate.
     * @returns boolean
     */
    isValid(value: any): boolean {
        if (typeof value === 'number') {
            return Number.isFinite(value);
        }

        if (typeof value === 'string' && value.trim() !== '') {
            return !isNaN(Number(value));
        }

        return false;
    }
}