import { Base } from './Base';

export class Buckets extends Base {
    public static readonly ALLOWED_ATTRIBUTES = [
        'enabled',
        'name',
        'fileSecurity',
        'maximumFileSize',
        'encryption',
        'antivirus'
    ];

    /**
     * Constructor
     */
    constructor() {
        super('buckets', Buckets.ALLOWED_ATTRIBUTES);
    }
}