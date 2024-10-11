// src/Adapter.ts
import { Log } from './Log';

export abstract class Adapter {
    /**
     * Get unique name of an adapter
     */
    //abstract getName(): string;

    /**
     * Push log to external provider
     *
     * @param log Log
     * @throws Error
     */
    abstract push(log: Log): Promise<number> ;

    /**
     * Return a list of log types supported by Adapter
     */
    abstract getSupportedTypes(): string[];

    /**
     * Return a list of environment types supported by Adapter
     */
    abstract getSupportedEnvironments(): string[];

    /**
     * Return a list of breadcrumb types supported by Adapter
     */
    abstract getSupportedBreadcrumbTypes(): string[];

    /**
     * Validate a log for compatibility with specific adapter.
     *
     * @param log Log
     * @throws Error
     */
    validate(log: Log): boolean {
        const supportedLogTypes = this.getSupportedTypes();
        const supportedEnvironments = this.getSupportedEnvironments();
        const supportedBreadcrumbTypes = this.getSupportedBreadcrumbTypes();

        if (!supportedLogTypes.includes(log.getType())) {
            throw new Error(`Supported log types for this adapter are: ${supportedLogTypes.join(', ')}`);
        }
        if (!supportedEnvironments.includes(log.getEnvironment())) {
            throw new Error(`Supported environments for this adapter are: ${supportedEnvironments.join(', ')}`);
        }

        for (const breadcrumb of log.getBreadcrumbs()) {
            if (!supportedBreadcrumbTypes.includes(breadcrumb.getType())) {
                throw new Error(`Supported breadcrumb types for this adapter are: ${supportedBreadcrumbTypes.join(', ')}`);
            }
        }

        return true;
    }
}
