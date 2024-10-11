import { Validator } from '../../../Tuval/Core';
import { Domain } from '../Domain';

/**
 * PublicDomain
 *
 * Validate that a domain is a public domain
 */
export class PublicDomain extends Validator {
    
    protected static allowedDomains: string[] = [];

    /**
     * Get Description
     *
     * Returns validator description
     *
     * @return {string}
     */
    getDescription(): string {
        return 'Value must be a public domain';
    }

    /**
     * Is valid
     *
     * Validation will pass when $value is either a known domain or in the list of allowed domains
     *
     * @param  {any} value
     * @return {boolean}
     */
    isValid(value: any): boolean {
        // Extract domain from URL if provided
        if (typeof value === 'string' && value.match(/^(http|https):\/\//)) {
            value = new URL(value).hostname;
        }

        const domain = new Domain(value);

        return domain.isKnown() || PublicDomain.allowedDomains.includes(domain.get());
    }

    /**
     * Is array
     *
     * Function will return true if object is array.
     *
     * @return {boolean}
     */
    isArray(): boolean {
        return false;
    }

    /**
     * Get Type
     *
     * Returns validator type.
     *
     * @return {string}
     */
    getType(): string {
        return Validator.TYPE_STRING;
    }

    /**
     * Allow domains
     *
     * Add domains to the allowed domains array
     *
     * @param {string[]} domains
     */
    static allow(domains: string[]): void {
        PublicDomain.allowedDomains = [...PublicDomain.allowedDomains, ...domains];
    }
}