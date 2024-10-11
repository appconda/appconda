import { Validator } from "../../Core";



export class FileType extends Validator {
    static FILE_TYPE_JPEG = 'jpeg';
    static FILE_TYPE_GIF = 'gif';
    static FILE_TYPE_PNG = 'png';
    static FILE_TYPE_GZIP = 'gz';

    protected types: { [key: string]: string } = {
        [FileType.FILE_TYPE_JPEG]: "\xFF\xD8\xFF",
        [FileType.FILE_TYPE_GIF]: 'GIF',
        [FileType.FILE_TYPE_PNG]: "\x89\x50\x4e\x47\x0d\x0a",
        [FileType.FILE_TYPE_GZIP]: 'application/x-gzip',
    };

    protected allowed: string[];

    /**
     * @param allowed
     * @throws Error
     */
    constructor(allowed: string[]) {
        super();
        for (const key of allowed) {
            if (!this.types[key]) {
                throw new Error('Unknown file mime type');
            }
        }
        this.allowed = allowed;
    }

    /**
     * Get Description
     */
    getDescription(): string {
        return 'File mime-type is not allowed';
    }

    /**
     * Is Valid.
     *
     * Binary check to finds whether a file is of valid type
     *
     * @param path
     * @return boolean
     */
    isValid(path: any): boolean {
        if (typeof path !== 'string' || !this.isReadable(path)) {
            return false;
        }

        const fs = require('fs');
        const handle = fs.openSync(path, 'r');
        const buffer = Buffer.alloc(8);
        fs.readSync(handle, buffer, 0, 8, 0);
        fs.closeSync(handle);

        const bytes = buffer.toString('binary');

        for (const key of this.allowed) {
            if (bytes.startsWith(this.types[key])) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if file is readable
     *
     * @param path
     * @return boolean
     */
    private isReadable(path: string): boolean {
        const fs = require('fs');
        try {
            fs.accessSync(path, fs.constants.R_OK);
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