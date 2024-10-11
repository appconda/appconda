
    export class Registry {
        /**
         * List of all callbacks
         */
        protected callbacks: { [key: string]: () => any } = {};

        /**
         * List of all fresh resources
         */
        protected fresh: { [key: string]: boolean } = {};

        /**
         * List of all connections
         */
        protected registry: { [key: string]: { [key: string]: any } } = {
            'default': {},
        };

        /**
         * Current context
         */
        protected _context: string = 'default';

        /**
         * Set a new connection callback
         */
        public set(name: string, callback: () => any, fresh: boolean = false): this {
            if (this.registry[this._context].hasOwnProperty(name)) {
                delete this.registry[this._context][name];
            }

            this.fresh[name] = fresh;
            this.callbacks[name] = callback;

            return this;
        }

        /**
         * If connection has been created returns it, otherwise create and then return it
         */
        public get(name: string, fresh: boolean = false): any {
            if (!this.registry[this._context].hasOwnProperty(name) || fresh || this.fresh[name]) {
                if (!this.callbacks.hasOwnProperty(name)) {
                    throw new Error(`No callback named "${name}" found when trying to create connection`);
                }

                this.registry[this._context][name] = this.callbacks[name]();
            }

            return this.registry[this._context][name];
        }

        /**
         * Set the current context
         */
        public context(name: string): this {
            if (!this.registry.hasOwnProperty(name)) {
                this.registry[name] = {};
            }

            this._context = name;

            return this;
        }
    }
