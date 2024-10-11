import { Base } from './Base';

export class Variables extends Base {
    public static readonly ALLOWED_ATTRIBUTES = [
        'key',
        'resourceType',
        'resourceId'
    ];

    /**
     * Constructor
     */
    constructor() {
        super('variables', Variables.ALLOWED_ATTRIBUTES);
    }
}