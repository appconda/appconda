import { Base } from './Base';

export class Users extends Base {
    public static readonly ALLOWED_ATTRIBUTES = [
        'name',
        'email',
        'phone',
        'status',
        'passwordUpdate',
        'registration',
        'emailVerification',
        'phoneVerification',
        'labels',
    ];

    /**
     * Constructor
     */
    constructor() {
        super('users', Users.ALLOWED_ATTRIBUTES);
    }
}