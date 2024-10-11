import { Base } from './Base';

export class Subscribers extends Base {
    public static readonly ALLOWED_ATTRIBUTES = [
        'targetId',
        'topicId',
        'userId',
        'providerType'
    ];

    /**
     * Constructor
     */
    constructor() {
        super('subscribers', Subscribers.ALLOWED_ATTRIBUTES);
    }
}