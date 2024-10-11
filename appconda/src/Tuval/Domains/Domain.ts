
    export class Domain {
        /**
         * @var {Record<string, {suffix: string, type: string, comments: string[]}>}
         */
        protected static list: Record<string, { suffix: string, type: string, comments: string[] }> = {};

        /**
         * Domain
         *
         * @var {string}
         */
        protected domain: string = '';

        /**
         * TLD
         *
         * @var {string}
         */
        protected TLD: string = '';

        /**
         * Suffix
         *
         * @var {string}
         */
        protected suffix: string = '';

        /**
         * Name
         *
         * @var {string}
         */
        protected name: string = '';

        /**
         * Sub Domain
         *
         * @var {string}
         */
        protected sub: string = '';

        /**
         * PSL rule matching suffix
         *
         * @var {string}
         */
        protected rule: string = '';

        /**
         * Domain Parts
         *
         * @var {string[]}
         */
        protected parts: string[] = [];

        /**
         * Domain constructor.
         */
        constructor(domain: string) {
            if (domain.startsWith('http://') || domain.startsWith('https://')) {
                throw new Error(`'${domain}' must be a valid domain or hostname`);
            }

            this.domain = domain.toLowerCase();
            this.parts = this.domain.split('.');

            if (Object.keys(Domain.list).length === 0) {
                Domain.list = require('./data/data');
            }
        }

        /**
         * Return top level domain
         */
        get(): string {
            return this.domain;
        }

        /**
         * Return top level domain
         */
        getTLD(): string {
            if (this.TLD) {
                return this.TLD;
            }

            if (this.parts.length === 0) {
                return '';
            }

            this.TLD = this.parts[this.parts.length - 1];

            return this.TLD;
        }

        /**
         * Returns domain public suffix
         */
        getSuffix(): string {
            if (this.suffix) {
                return this.suffix;
            }

            for (let i = 0; i < this.parts.length; i++) {
                const joined = this.parts.slice(i).join('.');
                const next = this.parts.slice(i + 1).join('.');
                const exception = '!' + joined;
                const wildcard = '*.' + next;

                if (Domain.list.hasOwnProperty(exception)) {
                    this.suffix = next;
                    this.rule = exception;

                    return next;
                }

                if (Domain.list.hasOwnProperty(joined)) {
                    this.suffix = joined;
                    this.rule = joined;

                    return joined;
                }

                if (Domain.list.hasOwnProperty(wildcard)) {
                    this.suffix = joined;
                    this.rule = wildcard;

                    return joined;
                }
            }

            return '';
        }

        getRule(): string {
            if (!this.rule) {
                this.getSuffix();
            }
            return this.rule;
        }

        /**
         * Returns registerable domain name
         */
        getRegisterable(): string {
            if (!this.isKnown()) {
                return '';
            }

            const registerable = this.getName() + '.' + this.getSuffix();

            return registerable;
        }

        /**
         * Returns domain name
         */
        getName(): string {
            if (this.name) {
                return this.name;
            }

            let suffix = this.getSuffix();
            suffix = suffix ? '.' + suffix : '.' + this.getTLD();

            const name = this.domain.substring(0, this.domain.length - suffix.length).split('.');

            this.name = name[name.length - 1];

            return this.name;
        }

        /**
         * Returns sub-domain name
         */
        getSub(): string {
            const name = this.getName();
            const namePart = name ? '.' + name : '';

            let suffix = this.getSuffix();
            suffix = suffix ? '.' + suffix : '.' + this.getTLD();

            const domain = namePart + suffix;

            const sub = this.domain.substring(0, this.domain.length - domain.length).split('.');

            this.sub = sub.join('.');

            return this.sub;
        }

        /**
         * Returns true if the public suffix is found;
         */
        isKnown(): boolean {
            return Domain.list.hasOwnProperty(this.getRule());
        }

        /**
         * Returns true if the public suffix is found using ICANN domains section
         */
        isICANN(): boolean {
            return Domain.list[this.getRule()]?.type === 'ICANN';
        }

        /**
         * Returns true if the public suffix is found using PRIVATE domains section
         */
        isPrivate(): boolean {
            return Domain.list[this.getRule()]?.type === 'PRIVATE';
        }

        /**
         * Returns true if the public suffix is reserved for testing purpose
         */
        isTest(): boolean {
            return ['test', 'localhost'].includes(this.getTLD());
        }
    }
