import { Validator } from '../Validator';
import validator from 'validator';

/**
 * Hostname
 *
 * Validates that a hostname is allowed based on a given whitelist.
 *
 * @package Validators
 */
export class Hostname extends Validator {
    protected allowList: string[];

    /**
     * @param allowList Array of allowed hostname patterns
     */
    constructor(allowList: string[] = []) {
        super();
        this.allowList = allowList;
    }

    /**
     * Get Description
     *
     * Returns a description of the validator.
     *
     * @returns string
     */
    getDescription(): string {
        return 'Value must be a valid hostname without path, port, and protocol.';
    }

    /**
     * Is array
     *
     * Indicates if the validator expects an array.
     *
     * @returns boolean
     */
    isArray(): boolean {
        return false;
    }

    /**
     * Get Type
     *
     * Returns the type of the validator.
     *
     * @returns string
     */
    getType(): string {
        return 'string';
    }

    /**
     * Is valid
     *
     * Validates the given value as a hostname based on the allow list.
     *
     * @param value The hostname to validate
     * @returns boolean
     */
    isValid(value: any): boolean {
        // Validate proper format
        if (typeof value !== 'string' || value.trim() === '') {
            return false;
        }

        // Max length 253 chars: https://en.wikipedia.org/wiki/Hostname
        if (value.length > 253) {
            return false;
        }

        // Ensure no protocol, path, or port
        if (value.includes('/') || value.includes(':')) {
            return false;
        }

        // Validate hostname format using validator
        if (!validator.isFQDN(value)) {
            return false;
        }

        // Logic #1: Empty allowList means everything is allowed
        if (this.allowList.length === 0) {
            return true;
        }

        // Logic #2: Check against the allow list
        for (const allowedHostname of this.allowList) {
            // Exact match or wildcard allowed
            if (value === allowedHostname || allowedHostname === '*') {
                return true;
            }

            // Handle wildcard patterns (e.g., *.example.com)
            if (allowedHostname.startsWith('*')) {
                const domain = allowedHostname.substring(1); // Remove the '*' character
                if (value.endsWith(domain)) {
                    return true;
                }
            }
        }

        // If no matches found in the allow list
        return false;
    }
}