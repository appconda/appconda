import { Base } from './Base';

export class Providers extends Base {
    public static readonly ALLOWED_ATTRIBUTES = [
        'name',
        'provider',
        'type',
        'enabled',
    ];

    /**
     * Constructor
     */
    constructor() {
        super('providers', Providers.ALLOWED_ATTRIBUTES);
    }
}