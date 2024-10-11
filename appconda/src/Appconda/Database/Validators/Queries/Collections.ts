import { Base } from './Base';

export class Collections extends Base {
    public static readonly ALLOWED_ATTRIBUTES = [
        'name',
        'enabled',
        'documentSecurity'
    ];

    /**
     * Constructor
     */
    constructor() {
        super('collections', Collections.ALLOWED_ATTRIBUTES);
    }
}