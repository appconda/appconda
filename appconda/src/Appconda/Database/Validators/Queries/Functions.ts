import { Base } from './Base';

export class Functions extends Base {
    public static readonly ALLOWED_ATTRIBUTES = [
        'name',
        'enabled',
        'runtime',
        'deployment',
        'schedule',
        'scheduleNext',
        'schedulePrevious',
        'timeout',
        'entrypoint',
        'commands',
        'installationId'
    ];

    /**
     * Constructor
     */
    constructor() {
        super('functions', Functions.ALLOWED_ATTRIBUTES);
    }
}