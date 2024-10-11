import { Hook } from '../Core';

export class Job extends Hook {
    /**
     * Whether to use hook
     */
    protected hook: boolean = true;

    /**
     * Set hook status
     * When set to false, hooks for this route will be skipped.
     *
     * @param hook - The hook status to set
     * @returns The current instance for method chaining
     */
    hookStatus(hook: boolean = true): this {
        this.hook = hook;
        return this;
    }

    /**
     * Get hook status
     *
     * @returns The current hook status
     */
    getHook(): boolean {
        return this.hook;
    }
}