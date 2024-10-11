import { Base } from './Base';

export class Projects extends Base {
    public static readonly ALLOWED_ATTRIBUTES = [
        'name',
        'teamId'
    ];

    /**
     * Constructor
     */
    constructor() {
        super('projects', Projects.ALLOWED_ATTRIBUTES);
    }
}