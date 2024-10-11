import { Base } from './Base';

export class Teams extends Base {
    public static readonly ALLOWED_ATTRIBUTES = [
        'name',
        'total',
        'billingPlan'
    ];

    /**
     * Constructor
     */
    constructor() {
        super('teams', Teams.ALLOWED_ATTRIBUTES);
    }
}