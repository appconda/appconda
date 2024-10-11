import { Validator } from '../Validator';
import validator from 'validator';

/**
 * Host
 *
 * Validate that a host is allowed from the given whitelisted hosts list
 *
 * @package Validators
 */
export class Host extends Validator {
    protected whitelist: string[];

    /**
     * @param whitelist Array of allowed hostnames
     */
    constructor(whitelist: string[]) {
        super();
        this.whitelist = whitelist;
    }

    /**
     * Get Description
     *
     * Returns validator description
     *
     * @returns string
     */
    getDescription(): string {
        return `URL host must be one of: ${this.whitelist.join(', ')}`;
    }

    /**
     * Is valid
     *
     * Validation will pass when the value is a valid URL and its host is in the whitelist
     *
     * @param value The URL to validate
     * @returns boolean
     */
    isValid(value: any): boolean {
        if (typeof value !== 'string' || !validator.isURL(value)) {
            return false;
        }

    

        try {
            const url = new URL(value);
            return this.whitelist.includes(url.hostname);
        } catch (error) {
            return false;
        }
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
     * Returns validator type.
     *
     * @returns string
     */
    getType(): string {
        return 'string';
    }
}