import { Base } from "./Base";

class Users extends Base {
    public static ALLOWED_ATTRIBUTES = [
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
     * Expression constructor
     */
    constructor() {
        super('users', Users.ALLOWED_ATTRIBUTES);
    }
}