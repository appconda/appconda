import { Base } from './Base';

export class Identities extends Base {
    public static readonly ALLOWED_ATTRIBUTES = [
        'userId',
        'provider',
        'providerUid',
        'providerEmail',
        'providerAccessTokenExpiry',
    ];

    /**
     * Constructor
     */
    constructor() {
        super('identities', Identities.ALLOWED_ATTRIBUTES);
    }
}