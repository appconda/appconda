import { Validator } from "../../Core";


export class FileSize extends Validator {
    protected max: number;

    /**
     * Max size in bytes
     *
     * @param max
     */
    constructor(max: number) {
        super();
        this.max = max;
    }

    /**
     * Get Description
     */
    getDescription(): string {
        return `File size can't be bigger than ${this.max}`;
    }

    /**
     * Finds whether a file size is smaller than required limit.
     *
     * @param fileSize
     * @return boolean
     */
    isValid(fileSize: any): boolean {
        if (typeof fileSize !== 'number') {
            return false;
        }

        if (fileSize > this.max) {
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
        return 'integer';
    }
}