import { Base } from './Base';

export class Deployments extends Base {
    public static readonly ALLOWED_ATTRIBUTES = [
        'size',
        'buildId',
        'activate',
        'entrypoint',
        'commands'
    ];

    /**
     * Constructor
     */
    constructor() {
        super('deployments', Deployments.ALLOWED_ATTRIBUTES);
    }
}