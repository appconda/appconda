import { Validator } from '../Validator';
import validator from 'validator';

/**
 * IP
 *
 * Validate that a variable is a valid IP address
 *
 * @package Validators
 */
export class IP extends Validator {
    public static readonly ALL: string = 'all';
    public static readonly V4: string = 'ipv4';
    public static readonly V6: string = 'ipv6';

    protected type: string = IP.ALL;

    /**
     * Constructor
     *
     * Set the type of IP check.
     *
     * @param type The type of IP to validate against ('all', 'ipv4', 'ipv6')
     * @throws Error if an unsupported IP type is provided
     */
    constructor(type: string = IP.ALL) {
        super();
        if (![IP.ALL, IP.V4, IP.V6].includes(type)) {
            throw new Error('Unsupported IP type');
        }
        this.type = type;
    }

    /**
     * Get Description
     *
     * Returns validator description
     *
     * @returns string
     */
    getDescription(): string {
        return 'Value must be a valid IP address';
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
        return 'string';
    }

    /**
     * Is valid
     *
     * Validation will pass when the value is a valid IP address based on the specified type.
     *
     * @param value The value to validate.
     * @returns boolean
     */
    isValid(value: any): boolean {
        if (typeof value !== 'string') {
            return false;
        }

        switch (this.type) {
            case IP.ALL:
                return validator.isIP(value);
            case IP.V4:
                return validator.isIP(value, 4);
            case IP.V6:
                return validator.isIP(value, 6);
            default:
                // This case should never be reached due to constructor validation
                return false;
        }
    }
}