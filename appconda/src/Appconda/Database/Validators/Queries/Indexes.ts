import { Base } from './Base';

export class Indexes extends Base {
    public static readonly ALLOWED_ATTRIBUTES = [
        'key',
        'type',
        'status',
        'attributes',
        'error',
    ];

    /**
     * Constructor
     */
    constructor() {
        super('indexes', Indexes.ALLOWED_ATTRIBUTES);
    }
}