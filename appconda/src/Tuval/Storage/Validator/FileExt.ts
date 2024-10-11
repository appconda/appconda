import { Validator } from "../../Core";




export class FileExt extends Validator {
    static TYPE_JPEG = 'jpeg';
    static TYPE_JPG = 'jpg';
    static TYPE_GIF = 'gif';
    static TYPE_PNG = 'png';
    static TYPE_GZIP = 'gz';

    protected allowed: string[];

    constructor(allowed: string[]) {
        super();
        this.allowed = allowed;
    }

    /**
     * Get Description
     */
    getDescription(): string {
        return 'File extension is not valid';
    }

    /**
     * Check if file extension is allowed
     *
     * @param filename
     * @return boolean
     */
    isValid(filename: any): boolean {
        const ext = filename.split('.').pop().toLowerCase();
        return this.allowed.includes(ext);
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