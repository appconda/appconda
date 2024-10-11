import { Base } from './Base';

export class Targets extends Base {
    public static readonly ALLOWED_ATTRIBUTES = [
        'userId',
        'providerId',
        'identifier',
        'providerType',
    ];

    /**
     * Constructor
     */
    constructor() {
        super('targets', Targets.ALLOWED_ATTRIBUTES);
    }
}