import { Password } from './Password';

/**
 * PasswordDictionary.
 *
 * Validates user password string against a dictionary
 */
export class PasswordDictionary extends Password {
    protected dictionary: Record<string, boolean>;
    protected enabled: boolean;

    constructor(dictionary: Record<string, boolean>, enabled: boolean = false, allowEmpty: boolean = false) {
        super(allowEmpty);
        this.dictionary = dictionary;
        this.enabled = enabled;
    }

    /**
     * Get Description.
     *
     * Returns validator description
     *
     * @return string
     */
    getDescription(): string {
        return 'Password must be between 8 and 256 characters long, and should not be one of the commonly used passwords.';
    }

    /**
     * Is valid.
     *
     * @param value
     *
     * @return boolean
     */
    isValid(value: any): boolean {
        if (!super.isValid(value)) {
            return false;
        }

        if (this.enabled && this.dictionary.hasOwnProperty(value)) {
            return false;
        }
        return true;
    }

    /**
     * Is array
     *
     * Function will return true if object is array.
     *
     * @return boolean
     */
    isArray(): boolean {
        return false;
    }

    /**
     * Get Type
     *
     * Returns validator type.
     *
     * @return string
     */
    getType(): string {
        return 'string';
    }
}
