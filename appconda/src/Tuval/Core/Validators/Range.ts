import { Numeric } from './Numeric';

/**
 * Range
 *
 * Validates that a number is within a specified range.
 *
 * @package Validators
 */
export class Range extends Numeric {
    protected min: number;
    protected max: number;
    protected format: string;

    public static readonly TYPE_INTEGER: string = 'integer';
    public static readonly TYPE_FLOAT: string = 'float';

    /**
     * Constructor
     *
     * @param min The minimum value of the range.
     * @param max The maximum value of the range.
     * @param format The format of the number ('integer' or 'float').
     */
    constructor(min: number, max: number, format: string = Range.TYPE_INTEGER) {
        super();
        this.min = min;
        this.max = max;
        this.format = format;
    }

    /**
     * Get Range Minimum Value
     *
     * @returns number
     */
    getMin(): number {
        return this.min;
    }

    /**
     * Get Range Maximum Value
     *
     * @returns number
     */
    getMax(): number {
        return this.max;
    }

    /**
     * Get Range Format
     *
     * @returns string
     */
    getFormat(): string {
        return this.format;
    }

    /**
     * Get Description
     *
     * Returns validator description.
     *
     * @returns string
     */
    getDescription(): string {
        return `Value must be a valid range between ${this.min.toLocaleString()} and ${this.max.toLocaleString()}`;
    }

    /**
     * Is array
     *
     * Function will return false as Range does not expect an array.
     *
     * @returns boolean
     */
    isArray(): boolean {
        return false;
    }

    /**
     * Get Type
     *
     * Returns the format type ('integer' or 'float').
     *
     * @returns string
     */
    getType(): string {
        return this.format;
    }

    /**
     * Is valid
     *
     * Validation will pass when the value is greater than or equal to min and less than or equal to max.
     * Considers any valid integer to be a valid float and accepts Infinity as a valid integer.
     *
     * @param value The value to validate.
     * @returns boolean
     */
    isValid(value: any): boolean {
        if (!super.isValid(value)) {
            return false;
        }

        let numericValue: number;

        switch (this.format) {
            case Range.TYPE_INTEGER:
                // Accept Infinity as a valid integer
                if (value === Infinity || value === -Infinity) {
                    numericValue = value;
                    break; // Proceed to range check
                }
                numericValue = Number(value);
                if (!Number.isInteger(numericValue)) {
                    return false;
                }
                break;
            case Range.TYPE_FLOAT:
                if (typeof value === 'string' && value.trim() === '') {
                    return false;
                }
                numericValue = Number(value);
                if (isNaN(numericValue)) {
                    return false;
                }
                break;
            default:
                return false;
        }

        if (this.min <= numericValue && numericValue <= this.max) {
            return true;
        }

        return false;
    }
}