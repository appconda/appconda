import { Validator } from "../Validator";


    /**
     * Assoc
     *
     * Validate that a variable is a valid associative array (object) and each element passes given validation
     */
    export class Assoc extends Validator {

        /**
         * Get Description
         *
         * Returns validator description
         */
        public getDescription(): string {
            return 'Value must be a valid object.';
        }

        /**
         * Is array
         *
         * Function will return true if object is array.
         */
        public isArray(): boolean {
            return true;
        }

        /**
         * Get Type
         *
         * Returns validator type.
         */
        public getType(): string {
            return Assoc.TYPE_ARRAY;
        }

        /**
         * Is valid
         *
         * Validation will pass when $value is a valid associative array.
         */
        public isValid(value: any): boolean {
            if (!Array.isArray(value)) {
                return false;
            }

            const jsonString = JSON.stringify(value);
            const jsonStringSize = jsonString.length;

            if (jsonStringSize > 65535) {
                return false;
            }

            return Object.keys(value).join(',') !== Array.from(Array(value.length).keys()).join(',');
        }

        static readonly TYPE_ARRAY: string = "array";
    }
