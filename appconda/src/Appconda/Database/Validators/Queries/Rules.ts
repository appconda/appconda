import { Base } from './Base';

export class Rules extends Base {
    public static readonly ALLOWED_ATTRIBUTES = [
        'domain',
        'resourceType',
        'resourceId',
        'url'
    ];

    /**
     * Constructor
     */
    constructor() {
        super('rules', Rules.ALLOWED_ATTRIBUTES);
    }
}