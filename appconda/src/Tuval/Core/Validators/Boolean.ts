import { Validator } from "../Validator";


/**
 * Boolean
 *
 * Validate that a variable is a boolean value
 */
export class Boolean extends Validator {
    protected loose: boolean = false;

    /**
     * Pass true to accept true and false strings and integers 0 and 1 as valid boolean values
     * This option is good for validating query string params.
     */
    constructor(loose: boolean = false) {
        super();
        this.loose = loose;
    }

    /**
     * Get Description
     *
     * Returns validator description
     */
    public getDescription(): string {
        return 'Value must be a valid boolean';
    }

    /**
     * Is array
     *
     * Function will return true if object is array.
     */
    public isArray(): boolean {
        return false;
    }

    /**
     * Get Type
     *
     * Returns validator type.
     */
    public getType(): string {
        return Boolean.TYPE_BOOLEAN;
    }

    /**
     * Is valid
     *
     * Validation will pass when $value has a boolean value.
     */
    public isValid(value: any): boolean {
        if (this.loose && (value === 'true' || value === 'false')) { // Accept strings
            return true;
        }

        if (this.loose && (value === '1' || value === '0')) { // Accept numeric strings
            return true;
        }

        if (this.loose && (value === 1 || value === 0)) { // Accept integers
            return true;
        }

        return typeof value === 'boolean';
    }

    static readonly TYPE_BOOLEAN: string = "boolean";
}
