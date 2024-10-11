
    export abstract class Validator {
        public static readonly TYPE_BOOLEAN: string = 'boolean';
        public static readonly TYPE_INTEGER: string = 'integer';
        public static readonly TYPE_FLOAT: string = 'double'; // gettype() returns 'double' for historical reasons
        public static readonly TYPE_STRING: string = 'string';
        public static readonly TYPE_ARRAY: string = 'array';
        public static readonly TYPE_OBJECT: string = 'object';
        public static readonly TYPE_MIXED: string = 'mixed';

        /**
         * Get Description
         *
         * Returns validator description
         *
         * @return string
         */
        abstract getDescription(): string;

        /**
         * Is array
         *
         * Returns true if an array or false if not.
         *
         * @return boolean
         */
        abstract isArray(): boolean;

        /**
         * Is valid
         *
         * Returns true if valid or false if not.
         *
         * @param value any
         * @return boolean
         */
        abstract isValid(value: any): boolean;

        /**
         * Get Type
         *
         * Returns validator type.
         *
         * @return string
         */
        abstract getType(): string;
    }
