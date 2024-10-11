import { Base } from './Base';

export class Databases extends Base {
    public static readonly ALLOWED_ATTRIBUTES = [
        'name'
    ];

    /**
     * Constructor
     */
    constructor() {
        super('databases', Databases.ALLOWED_ATTRIBUTES);
    }
}