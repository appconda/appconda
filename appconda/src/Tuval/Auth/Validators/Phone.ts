import { Validator } from '../../../Tuval/Core';

/**
 * Phone.
 *
 * Validates a number for the E.164 format.
 */
export class Phone extends Validator {
    protected allowEmpty: boolean;

    constructor(allowEmpty: boolean = false) {
        super();
        this.allowEmpty = allowEmpty;
    }

    /**
     * Get Description.
     *
     * Returns validator description
     *
     * @return string
     */
    getDescription(): string {
        return "Phone number must start with a '+' and can have a maximum of fifteen digits.";
    }

    /**
     * Is valid.
     *
     * @param value
     *
     * @return boolean
     */
    isValid(value: any): boolean {
        if (typeof value !== 'string') {
            return false;
        }

        if (this.allowEmpty && value.length === 0) {
            return true;
        }

        return /^\+[1-9]\d{6,14}$/.test(value);
    }

    /**
     * Is array
     *
     * Function will return true if object is array.
     *
     * @return boolean
     */
    isArray(): boolean {
        return false;
    }

    /**
     * Get Type
     *
     * Returns validator type.
     *
     * @return string
     */
    getType(): string {
        return 'string';
    }
}
