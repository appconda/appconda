import { Base } from './Base';

export class Files extends Base {
    public static readonly ALLOWED_ATTRIBUTES = [
        'name',
        'signature',
        'mimeType',
        'sizeOriginal',
        'chunksTotal',
        'chunksUploaded'
    ];

    /**
     * Constructor
     */
    constructor() {
        super('files', Files.ALLOWED_ATTRIBUTES);
    }
}