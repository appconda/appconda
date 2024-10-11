import { Validator } from '../../../Tuval/Core'; // Replace with actual package

/**
 * Password.
 *
 * Validates user password string
 */
export class Password extends Validator {
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
        return 'Password must be between 8 and 256 characters long.';
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

        if (value.length < 8) {
            return false;
        }

        if (value.length > 256) {
            return false;
        }

        return true;
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
