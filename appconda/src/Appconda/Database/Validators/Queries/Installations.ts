import { Base } from './Base';

export class Installations extends Base {
    public static readonly ALLOWED_ATTRIBUTES = [
        'provider',
        'organization'
    ];

    /**
     * Constructor
     */
    constructor() {
        super('installations', Installations.ALLOWED_ATTRIBUTES);
    }
}