import { Validator } from "../Validator";


/**
 * FloatValidator
 *
 * Validate that a variable is a float
 */
export class FloatValidator extends Validator {
    protected loose: boolean = false;

    /**
     * Pass true to accept float strings as valid float values
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
        return 'Value must be a valid float';
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
        return FloatValidator.TYPE_FLOAT;
    }

    /**
     * Is valid
     *
     * Validation will pass when $value is a float.
     */
    public isValid(value: any): boolean {
        if (this.loose) {
            if (isNaN(value)) {
                return false;
            }
            value = +value; // Convert string to number
        }

        return typeof value === 'number' && !isNaN(value);
    }

    static readonly TYPE_FLOAT: string = "float";
}