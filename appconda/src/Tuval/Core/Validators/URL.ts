import { Validator } from '../Validator';
import validator from 'validator';

/**
 * URL
 *
 * Validate that a variable is a valid URL.
 *
 * @package Validators
 */
export class URLValidator extends Validator {
    protected allowedSchemes: string[];

    /**
     * Constructor
     *
     * @param allowedSchemes Array of allowed URL schemes (e.g., ['http', 'https']). Defaults to an empty array, allowing any scheme.
     */
    constructor(allowedSchemes: string[] = []) {
        super();
        this.allowedSchemes = allowedSchemes.map(scheme => scheme.toLowerCase());
    }

    /**
     * Get Description
     *
     * Returns validator description.
     *
     * @returns string
     */
    getDescription(): string {
        if (this.allowedSchemes.length > 0) {
            return `Value must be a valid URL with following schemes (${this.allowedSchemes.join(', ')})`;
        }

        return 'Value must be a valid URL';
    }

    /**
     * Is array
     *
     * Returns false as URL validator does not expect an array.
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
        return 'string';
    }

    /**
     * Is valid
     *
     * Validation will pass when the value is a valid URL.
     * If allowedSchemes are specified, the URL must use one of the allowed schemes.
     *
     * @param value The value to validate.
     * @returns boolean
     */
    isValid(value: any): boolean {
        if (typeof value !== 'string') {
            return false;
        }

        if (!validator.isURL(value)) {
            return false;
        }

        if (this.allowedSchemes.length > 0) {
            const urlScheme = new URL(value).protocol.replace(':', '').toLowerCase();
            if (!this.allowedSchemes.includes(urlScheme)) {
                return false;
            }
        }

        return true;
    }
}