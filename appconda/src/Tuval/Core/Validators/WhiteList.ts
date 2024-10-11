import { Validator } from '../Validator';

/**
 * WhiteList
 *
 * Checks if a variable is inside a predefined whitelist.
 *
 * @package Validators
 */
export class WhiteList extends Validator {
    protected list: any[];
    protected strict: boolean;
    protected type: string;

    /**
     * Constructor
     *
     * Sets a whitelist array and strict mode.
     *
     * @param list The array of allowed values.
     * @param strict Disable type check and be case insensitive if false.
     * @param type The type of the whitelist items (e.g., 'string', 'number').
     */
    constructor(list: any[], strict: boolean = false, type: string = Validator.TYPE_STRING) {
        super();
        this.list = list;
        this.strict = strict;
        this.type = type;

        if (!this.strict) {
            this.list = this.list.map(item => {
                if (typeof item === 'string') {
                    return item.toLowerCase();
                }
                return item;
            });
        }
    }

    /**
     * Get List of All Allowed Values
     *
     * @returns any[]
     */
    getList(): any[] {
        return this.list;
    }

    /**
     * Get Description
     *
     * Returns validator description.
     *
     * @returns string
     */
    getDescription(): string {
        return `Value must be one of (${this.list.join(', ')})`;
    }

    /**
     * Is array
     *
     * Returns false as WhiteList validator does not expect an array.
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
        return this.type;
    }

    /**
     * Is valid
     *
     * Validation will pass if the value is in the whitelist array.
     *
     * @param value The value to validate.
     * @returns boolean
     */
    isValid(value: any): boolean {
        if (Array.isArray(value)) {
            return false;
        }

        let processedValue = value;

        if (!this.strict && typeof value === 'string') {
            processedValue = value.toLowerCase();
        }

        return this.list.includes(processedValue);
    }
}