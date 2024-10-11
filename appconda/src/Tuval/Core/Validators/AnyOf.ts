import { Validator } from "../Validator";

    /**
     * Ensure at least one validator from a list passed the check
     */
    export class AnyOf extends Validator {
        protected failedRule: Validator | null = null;

        constructor(protected validators: Validator[], protected type: string = AnyOf.TYPE_MIXED) {
            super();
        }

        /**
         * Get Validators
         *
         * Returns validators array
         */
        public getValidators(): Validator[] {
            return this.validators;
        }

        /**
         * Get Description
         *
         * Returns validator description
         */
        public getDescription(): string {
            let description: string;
            if (this.failedRule !== null) {
                description = this.failedRule.getDescription();
            } else {
                description = this.validators[0].getDescription();
            }
            return description;
        }

        /**
         * Is valid
         *
         * Validation will pass when all rules are valid if only one of the rules is invalid validation will fail.
         */
        public isValid(value: any): boolean {
            for (const rule of this.validators) {
                const valid = rule.isValid(value);
                this.failedRule = rule;

                if (valid) {
                    return true;
                }
            }

            return false;
        }

        /**
         * Get Type
         *
         * Returns validator type.
         */
        public getType(): string {
            return this.type;
        }

        /**
         * Is array
         *
         * Function will return true if object is array.
         */
        public isArray(): boolean {
            return true;
        }

        static readonly TYPE_MIXED: string = "mixed";
    }
