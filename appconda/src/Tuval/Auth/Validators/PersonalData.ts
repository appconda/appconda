import { Password } from './Password';

/**
 * Validates user password string against their personal data
 */
export class PersonalData extends Password {
    constructor(
        protected userId: string | null = null,
        protected email: string | null = null,
        protected name: string | null = null,
        protected phone: string | null = null,
        protected strict: boolean = false,
        allowEmpty: boolean = false,
    ) {
        super(allowEmpty);
    }

    /**
     * Get Description.
     *
     * Returns validator description
     *
     * @return string
     */
    getDescription(): string {
        return 'Password must not include any personal data like your name, email, phone number, etc.';
    }

    /**
     * Is valid.
     *
     * @param password
     *
     * @return boolean
     */
    isValid(password: any): boolean {
        if (!super.isValid(password)) {
            return false;
        }

        if (!this.strict) {
            password = password.toLowerCase();
            this.userId = this.userId?.toLowerCase() ?? '';
            this.email = this.email?.toLowerCase() ?? '';
            this.name = this.name?.toLowerCase() ?? '';
            this.phone = this.phone?.toLowerCase() ?? '';
        }

        if (this.userId && password.includes(this.userId)) {
            return false;
        }

        if (this.email && password.includes(this.email)) {
            return false;
        }

        if (this.email && password.includes(this.email.split('@')[0] ?? '')) {
            return false;
        }

        if (this.name && password.includes(this.name)) {
            return false;
        }

        if (this.phone && password.includes(this.phone.replace('+', ''))) {
            return false;
        }

        if (this.phone && password.includes(this.phone)) {
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
