
    export class DSN {
        protected scheme: string;
        protected user: string | null;
        protected password: string | null;
        protected host: string;
        protected port: string | null;
        protected path: string | null;
        protected query: string | null;
        protected params: Record<string, string> | null = null;

        /**
         * Construct
         *
         * Construct a new DSN object
         *
         * @param dsn
         */
        constructor(dsn: string) {
            const parts = new URL(dsn);

            if (!parts.protocol) {
                throw new Error('Unable to parse DSN: scheme is required');
            }

            if (!parts.hostname) {
                throw new Error('Unable to parse DSN: host is required');
            }

            this.scheme = parts.protocol.replace(':', '');
            this.user = parts.username ? decodeURIComponent(parts.username) : null;
            this.password = parts.password ? decodeURIComponent(parts.password) : null;
            this.host = parts.hostname;
            this.port = parts.port || null;
            this.path = parts.pathname ? parts.pathname.replace(/^\//, '') : '';
            this.query = parts.search ? parts.search.replace('?', '') : null;
        }

        /**
         * Return the scheme.
         *
         * @return string
         */
        public getScheme(): string {
            return this.scheme;
        }

        /**
         * Return the user.
         *
         * @return string | null
         */
        public getUser(): string | null {
            return this.user;
        }

        /**
         * Return the password.
         *
         * @return string | null
         */
        public getPassword(): string | null {
            return this.password;
        }

        /**
         * Return the host
         *
         * @return string
         */
        public getHost(): string {
            return this.host;
        }

        /**
         * Return the port
         *
         * @return string | null
         */
        public getPort(): string | null {
            return this.port;
        }

        /**
         * Return the path
         *
         * @return string | null
         */
        public getPath(): string | null {
            return this.path;
        }

        /**
         * Return the raw query string
         *
         * @return string | null
         */
        public getQuery(): string | null {
            return this.query;
        }

        /**
         * Return a query parameter by its key
         *
         * @return string
         */
        public getParam(key: string, defaultValue: string = ''): string {
            if (this.params && this.params[key]) {
                return this.params[key];
            }

            if (!this.query) {
                return defaultValue;
            }

            const params = new URLSearchParams(this.query);
            this.params = {};
            params.forEach((value, key) => {
                this.params![key] = value;
            });

            return this.params[key] || defaultValue;
        }
    }
