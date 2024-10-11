import { Validator } from "../../Core";


export class Upload extends Validator {
    /**
     * Get Description
     */
    getDescription(): string {
        return 'Not a valid upload file';
    }

    /**
     * Check if a file is a valid upload file
     *
     * @param path
     * @return boolean
     */
    isValid(path: any): boolean {
        if (typeof path !== 'string') {
            return false;
        }

        // In Node.js, there is no direct equivalent to PHP's is_uploaded_file.
        // You would typically check if the file exists and is accessible.
        const fs = require('fs');
        try {
            fs.accessSync(path, fs.constants.F_OK);
            return true;
        } catch (err) {
            return false;
        }
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