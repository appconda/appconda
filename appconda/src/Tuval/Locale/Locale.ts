
    export class Locale {
        /**
         * @var {Record<string, any>}
         */
        protected static language: Record<string, any> = {};

        /**
         * Throw Exceptions?
         *
         * @var {boolean}
         */
        public static exceptions: boolean = true;

        /**
         * Default Locale
         *
         * @var {string}
         */
        public default: string;

        /**
         * Set New Locale from an array
         *
         * @param {string} name
         * @param {Record<string, any>} translations
         */
        public static setLanguageFromArray(name: string, translations: Record<string, any>): void {
            this.language[name] = translations;
        }

        /**
         * Set New Locale from JSON file
         *
         * @param {string} name
         * @param {string} path
         */
        public static async setLanguageFromJSON(name: string, path: string): Promise<void> {
            const fs = require('fs').promises;
            try {
                const data = await fs.readFile(path, 'utf8');
                const translations = JSON.parse(data);
                this.language[name] = translations;
            } catch (error) {
                throw new Error('Translation file not found.');
            }
        }

        constructor(defaultLocale: string) {
            if (!(defaultLocale in Locale.language)) {
                throw new Error('Locale not found');
            }
            this.default = defaultLocale;
        }

        /**
         * Change Default Locale
         *
         * @param {string} name
         * @throws {Error}
         */
        public setDefault(name: string): this {
            if (!(name in Locale.language)) {
                throw new Error('Locale not found');
            }
            this.default = name;
            return this;
        }

        /**
         * Get Text by Locale
         *
         * @param {string} key
         * @param {any} defaultValue
         * @return {any}
         * @throws {Error}
         */
        public getText(key: string, defaultValue: any = null): any {
            defaultValue = defaultValue === null ? `{{${key}}}` : defaultValue;

            if (!(key in Locale.language[this.default])) {
                if (Locale.exceptions) {
                    throw new Error(`Key named "${key}" not found`);
                }
                return defaultValue;
            }

            return Locale.language[this.default][key];
        }
    }
