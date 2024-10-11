import { Validator } from '../Validator';

/**
 * Integer
 *
 * Validate that a variable is an integer.
 */
export class Integer extends Validator {
    protected loose: boolean;

    /**
     * Pass true to accept integer strings as valid integer values.
     * This option is good for validating query string params.
     *
     * @param loose Whether to allow numeric strings.
     */
    constructor(loose: boolean = false) {
        super();
        this.loose = loose;
    }

    /**
     * Get Description
     *
     * Returns validator description.
     *
     * @returns string
     */
    getDescription(): string {
        return 'Value must be a valid integer';
    }

    /**
     * Is array
     *
     * Function will return true if object is an array.
     *
     * @returns boolean
     */
    isArray(): boolean {
        return false;
    }

    /**
     * Get Type
     *
     * Returns validator type.
     *
     * @returns string
     */
    getType(): string {
        return 'integer';
    }

    /**
     * Is valid
     *
     * Validation will pass when the value is an integer.
     *
     * @param value The value to validate.
     * @returns boolean
     */
    isValid(value: any): boolean {
        if (this.loose) {
            if (typeof value === 'string' && value.trim() === '') {
                return false;
            }
            if (!Number.isFinite(Number(value))) {
                return false;
            }
            value = Number(value);
        }
        try {
            return Number.isInteger(Number.parseInt(value));
        } catch (e) {
            return false;
        }
    }
}