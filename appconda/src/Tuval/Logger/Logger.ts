// src/Logger.ts
import { Adapter } from './Adapter';
import { Log } from './Log';

export class Logger {
    static readonly LIBRARY_VERSION = '0.1.0';

    static readonly PROVIDERS = [
        'raygun',
        'sentry',
        'appSignal',
        'logOwl',
    ];

    private samplePercent: number | null = null;
    private adapter: Adapter;

    constructor(adapter: Adapter) {
        this.adapter = adapter;
    }

    /**
     * Store new log. Currently, it is instantly pushed to Adapter, but in future it could pool to increase performance.
     *
     * @param log Log
     * @throws Error
     */
    async addLog(log: Log): Promise<number> {
        // Validate log
        if (
            !log.getAction() ||
            !log.getEnvironment() ||
            !log.getMessage() ||
            !log.getType() ||
            !log.getVersion()
        ) {
            throw new Error('Log is not ready to be pushed.');
        }

        if (this.samplePercent !== null) {
            const rand = Math.random() * 100;
            if (rand >= this.samplePercent) {
                return 0;
            }
        }

        if (this.adapter.validate(log)) {
            // Push log
            return await this.adapter.push(log);
        }

        return 500;
    }

    /**
     * Get list of available providers
     */
    static getProviders(): string[] {
        return Logger.PROVIDERS;
    }

    /**
     * Check if provider is available
     *
     * @param providerName string
     */
    static hasProvider(providerName: string): boolean {
        return Logger.PROVIDERS.includes(providerName);
    }

    /**
     * Return only a sample of the logs from this logger
     *
     * @param sample number Total percentage of issues to use with 100% being 1
     */
    setSample(sample: number): this {
        this.samplePercent = sample * 100;
        return this;
    }

    /**
     * Get the current sample value as a percentage
     */
    getSample(): number | null {
        return this.samplePercent;
    }
}
