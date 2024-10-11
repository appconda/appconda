import { Base } from './Base';

export class Executions extends Base {
    public static readonly ALLOWED_ATTRIBUTES = [
        'trigger',
        'status',
        'responseStatusCode',
        'duration'
    ];

    /**
     * Constructor
     */
    constructor() {
        super('executions', Executions.ALLOWED_ATTRIBUTES);
    }
}