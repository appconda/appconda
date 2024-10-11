import { Base } from "./Base";


export class Attributes extends Base {
    public static readonly ALLOWED_ATTRIBUTES = [
        'key',
        'type',
        'size',
        'required',
        'array',
        'status',
        'error'
    ];

    /**
     * Constructor
     */
    constructor() {
        super('attributes', Attributes.ALLOWED_ATTRIBUTES);
    }
}