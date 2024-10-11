import { Validator } from "../Validator";


export class HexColor extends Validator {

    /**
     * Get Description
     *
     * Returns validator description
     */
    public getDescription(): string {
        return 'Value must be a valid Hex color code';
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
        return HexColor.TYPE_STRING;
    }

    /**
     * Is valid
     *
     * Validation will pass when $value is a valid hex color.
     */
    public isValid(value: any): boolean {
        const hexPattern = /^\#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        return typeof value === 'string' && hexPattern.test(value);
    }

    static readonly TYPE_STRING: string = "string";
}

