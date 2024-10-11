import { Base } from './Base';

export class Memberships extends Base {
    public static readonly ALLOWED_ATTRIBUTES = [
        'userId',
        'teamId',
        'invited',
        'joined',
        'confirm'
    ];

    /**
     * Constructor
     */
    constructor() {
        super('memberships', Memberships.ALLOWED_ATTRIBUTES);
    }
}