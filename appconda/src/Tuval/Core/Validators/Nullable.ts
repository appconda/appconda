import { Validator } from '../Validator';

/**
 * Nullable
 *
 * Allows a value to be null or pass the wrapped validator's validation.
 *
 * @package Validators
 */
export class Nullable extends Validator {
    protected validator: Validator;

    /**
     * Constructor
     *
     * @param validator The validator to wrap.
     */
    constructor(validator: Validator) {
        super();
        this.validator = validator;
    }

    /**
     * Get Description
     *
     * Returns validator description appended with ' or null'.
     *
     * @returns string
     */
    getDescription(): string {
        return `${this.validator.getDescription()} or null`;
    }

    /**
     * Is array
     *
     * Always returns false as Nullable does not expect an array.
     *
     * @returns boolean
     */
    isArray(): boolean {
        return false;
    }

    /**
     * Get Type
     *
     * Returns the type of the wrapped validator.
     *
     * @returns string
     */
    getType(): string {
        return this.validator.getType();
    }

    /**
     * Get Validator
     *
     * Returns the wrapped validator.
     *
     * @returns Validator
     */
    getValidator(): Validator {
        return this.validator;
    }

    /**
     * Is valid
     *
     * Validation passes if the value is null or passes the wrapped validator's validation.
     *
     * @param value The value to validate.
     * @returns boolean
     */
    isValid(value: any): boolean {
        if (value === null) {
            return true;
        }

        return this.validator.isValid(value);
    }
}