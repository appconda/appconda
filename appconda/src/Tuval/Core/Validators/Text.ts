import { Validator } from '../Validator';

/**
 * Text
 *
 * Validate that a variable is a valid text value.
 *
 * @package Validators
 */
export class Text extends Validator {
    public static readonly NUMBERS: string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    public static readonly ALPHABET_UPPER: string[] = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
        'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
        'U', 'V', 'W', 'X', 'Y', 'Z'
    ];

    public static readonly ALPHABET_LOWER: string[] = [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
        'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
        'u', 'v', 'w', 'x', 'y', 'z'
    ];

    protected length: number;
    protected min: number;
    protected allowList: string[];

    /**
     * Text constructor.
     *
     * Validate text with maximum length `length`. Use `length = 0` for unlimited length.
     * Optionally, provide an array of allowed characters `allowList` to restrict specific characters.
     *
     * @param length Maximum length of the text.
     * @param min Minimum length of the text. Defaults to 1.
     * @param allowList Array of allowed characters. Defaults to an empty array.
     */
    constructor(length: number, min: number = 1, allowList: string[] = []) {
        super();
        this.length = length;
        this.min = min;
        this.allowList = allowList;
    }

    /**
     * Get Description
     *
     * Returns validator description.
     *
     * @returns string
     */
    getDescription(): string {
        let message = 'Value must be a valid string';

        if (this.min === this.length) {
            message += ` and exactly ${this.length} chars`;
        } else {
            if (this.min) {
                message += ` and at least ${this.min} chars`;
            }

            if (this.length) {
                message += ` and no longer than ${this.length} chars`;
            }
        }

        if (this.allowList.length > 0) {
            message += ` and only consist of '${this.allowList.join(', ')}' chars`;
        }

        return message;
    }

    /**
     * Is array
     *
     * Returns false as Text validator does not expect an array.
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
        return 'string';
    }

    /**
     * Is valid
     *
     * Validation will pass when the value is a string with valid length and contains only allowed characters.
     *
     * @param value The value to validate.
     * @returns boolean
     */
    isValid(value: any): boolean {
        if (typeof value !== 'string') {
            return false;
        }

        const length = value.length;

        if (length < this.min) {
            return false;
        }

        if (this.length !== 0 && length > this.length) {
            return false;
        }

        if (this.allowList.length > 0) {
            for (const char of value) {
                if (!this.allowList.includes(char)) {
                    return false;
                }
            }
        }

        return true;
    }
}