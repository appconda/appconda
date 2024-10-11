import { Validator } from "../../Core";


export class FileName extends Validator {
    /**
     * Get Description
     */
    getDescription(): string {
        return 'Filename is not valid';
    }

    /**
     * The file name can only contain "a-z", "A-Z", "0-9" and "-" and not empty.
     *
     * @param name
     * @return boolean
     */
    isValid(name: any): boolean {
        if (!name) {
            return false;
        }

        if (typeof name !== 'string') {
            return false;
        }

        const regex = /^[a-zA-Z0-9.]+$/;
        if (!regex.test(name)) {
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