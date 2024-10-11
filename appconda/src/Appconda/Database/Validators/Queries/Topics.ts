import { Base } from './Base';

export class Topics extends Base {
    public static readonly ALLOWED_ATTRIBUTES = [
        'name',
        'description',
        'emailTotal',
        'smsTotal',
        'pushTotal',
    ];

    /**
     * Constructor
     */
    constructor() {
        super('topics', Topics.ALLOWED_ATTRIBUTES);
    }
}