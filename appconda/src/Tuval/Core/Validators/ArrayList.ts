import { Validator } from "../Validator";


    /**
     * ArrayList
     *
     * Validate that a variable is a valid array value and each element passes given validation
     */
    export class ArrayList extends Validator {
        protected validator: Validator;
        protected length: number;

        /**
         * Array constructor.
         *
         * Pass a validator that must be applied to each element in this array
         */
        constructor(validator: Validator, length: number = 0) {
            super();
            this.validator = validator;
            this.length = length;
        }

        /**
         * Get Description
         *
         * Returns validator description
         */
        public getDescription(): string {
            let msg = 'Value must a valid array';

            if (this.length > 0) {
                msg += ` no longer than ${this.length} items`;
            }

            return `${msg} and ${this.validator.getDescription()}`;
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
            return this.validator.getType();
        }

        /**
         * Get Nested Validator
         */
        public getValidator(): Validator {
            return this.validator;
        }

        /**
         * Is valid
         *
         * Validation will pass when $value is a valid array and validator is valid.
         */
        public isValid(value: any): boolean {
            
            if (!Array.isArray(value)) {
                return false;
            }

            if (this.length && value.length > this.length) {
                return false;
            }

            for (const element of value) {
                if (!this.validator.isValid(element)) {
                    return false;
                }
            }

            return true;
        }
    }
