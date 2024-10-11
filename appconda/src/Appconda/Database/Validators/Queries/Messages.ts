import { Base } from './Base';

export class Messages extends Base {
    public static readonly ALLOWED_ATTRIBUTES = [
        'scheduledAt',
        'deliveredAt',
        'deliveredTotal',
        'status',
        'description',
        'providerType',
    ];

    /**
     * Constructor
     */
    constructor() {
        super('messages', Messages.ALLOWED_ATTRIBUTES);
    }
}