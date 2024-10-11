import { Validator } from '../Validator';

/**
 * JSON
 *
 * Validate that a variable is a valid JSON string or an array.
 *
 * @package Validators
 */
export class JSONValidator extends Validator {
    /**
     * Get Description
     *
     * Returns validator description.
     *
     * @returns string
     */
    getDescription(): string {
        return 'Value must be a valid JSON string';
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
        return 'object';
    }

    /**
     * Is valid
     *
     * Validation will pass when the value is a valid JSON string or an array.
     *
     * @param value The value to validate.
     * @returns boolean
     */
    isValid(value: any): boolean {
        if (Array.isArray(value)) {
            return true;
        }

        if (typeof value === 'string') {
            try {
                JSON.parse(value);
                return true;
            } catch (error) {
                return false;
            }
        }

        return false;
    }
}