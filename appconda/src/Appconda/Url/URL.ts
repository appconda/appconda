
    export class AppcondaURL {
        /**
         * Parse URL
         *
         * Take a URL string and split it to array parts
         *
         * @param url
         *
         * @return array
         */
        public static parse(url: string): Record<string, any> {
            const defaultParts = {
                scheme: '',
                pass: '',
                user: '',
                host: '',
                port: null,
                path: '',
                query: '',
                fragment: '',
            };

            const parsedUrl = new URL(url);
            const result = {
                scheme: parsedUrl.protocol.replace(':', ''),
                pass: parsedUrl.password,
                user: parsedUrl.username,
                host: parsedUrl.hostname,
                port: parsedUrl.port ? parseInt(parsedUrl.port) : null,
                path: parsedUrl.pathname,
                query: parsedUrl.search.replace('?', ''),
                fragment: parsedUrl.hash.replace('#', ''),
            };

            return { ...defaultParts, ...result };
        }

        /**
         * Un-Parse URL
         *
         * Take URL parts and combine them to a valid string
         *
         * @param url
         * @param ommit
         *
         * @return string
         */
        public static unparse(url: Record<string, any>, ommit: string[] = []): string {
            if (url.path && !url.path.startsWith('/')) {
                url.path = '/' + url.path;
            }

            const parts: Record<string, string> = {};

            parts.scheme = url.scheme ? url.scheme + '://' : '';
            parts.host = url.host || '';
            parts.port = url.port ? ':' + url.port : '';
            parts.user = url.user || '';
            parts.pass = url.pass ? ':' + url.pass : '';
            parts.pass = (parts.user || parts.pass) ? parts.pass + '@' : '';
            parts.path = url.path || '';
            parts.query = url.query ? '?' + url.query : '';
            parts.fragment = url.fragment ? '#' + url.fragment : '';

            if (ommit.length) {
                for (const key of ommit) {
                    if (parts[key]) {
                        parts[key] = '';
                    }
                }
            }

            return parts.scheme + parts.user + parts.pass + parts.host + parts.port + parts.path + parts.query + parts.fragment;
        }

        /**
         * Parse Query String
         *
         * Convert query string to array
         *
         * @param query
         *
         * @return array
         */
        public static parseQuery(query: string): Record<string, any> {
            const result: Record<string, any> = {};
            new URLSearchParams(query).forEach((value, key) => {
                result[key] = value;
            });
            return result;
        }

        /**
         * Un-Parse Query String
         *
         * Convert query string array to string
         *
         * @param query
         *
         * @return string
         */
        public static unparseQuery(query: Record<string, any>): string {
            return new URLSearchParams(query).toString();
        }
    }
