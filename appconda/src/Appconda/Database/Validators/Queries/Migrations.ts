import { Base } from './Base';

export class Migrations extends Base {
    public static readonly ALLOWED_ATTRIBUTES = [
        'status',
        'stage',
        'source',
        'resources',
        'statusCounters',
        'resourceData',
        'errors'
    ];

    /**
     * Constructor
     */
    constructor() {
        super('migrations', Migrations.ALLOWED_ATTRIBUTES);
    }
}