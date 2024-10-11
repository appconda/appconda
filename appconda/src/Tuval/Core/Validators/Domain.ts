import { Validator } from "../Validator";

/**
 * Domain
 *
 * Validate that a variable is a valid domain address
 */
export class Domain extends Validator {

    /**
     * Get Description
     *
     * Returns validator description
     */
    public getDescription(): string {
        return 'Value must be a valid domain';
    }

    /**
     * Is valid
     *
     * Validation will pass when $value is a valid domain.
     *
     * Validates domain names against RFC 1034, RFC 1035, RFC 952, RFC 1123, RFC 2732, RFC 2181, and RFC 1123.
     */
    public isValid(value: any): boolean {
        if (!value) {
            return false;
        }

        if (typeof value !== 'string') {
            return false;
        }

        const domainPattern = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return domainPattern.test(value);
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
        return Domain.TYPE_STRING;
    }

    static readonly TYPE_STRING: string = "string";
}

