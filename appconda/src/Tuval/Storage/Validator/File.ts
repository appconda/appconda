
import { Validator } from "../../Core";



export class File extends Validator {
    getDescription(): string {
        return 'File is not valid';
    }

    /**
     * NOT MUCH RIGHT NOW.
     *
     * TODO think what to do here, currently only used for parameter to be present in SDKs
     *
     * @param  name  any
     * @return boolean
     */
    isValid(name: any): boolean {
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
        return Validator.TYPE_STRING;
    }
}