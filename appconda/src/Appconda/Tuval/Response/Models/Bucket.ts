import { Response } from '../../Response';
import { Model } from '../Model';
import { Compression } from '../../../../Tuval/Storage';

export class Bucket extends Model {
    constructor() {
        super();

        this
            .addRule('$id', {
                type: Model.TYPE_STRING,
                description: 'Bucket ID.',
                default: '',
                example: '5e5ea5c16897e',
            })
            .addRule('$createdAt', {
                type: Model.TYPE_DATETIME,
                description: 'Bucket creation time in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('$updatedAt', {
                type: Model.TYPE_DATETIME,
                description: 'Bucket update date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('$permissions', {
                type: Model.TYPE_STRING,
                description: 'Bucket permissions. [Learn more about permissions](https://appconda.io/docs/permissions).',
                default: [],
                example: ['read("any")'],
                array: true,
            })
            .addRule('fileSecurity', {
                type: Model.TYPE_BOOLEAN,
                description: 'Whether file-level security is enabled. [Learn more about permissions](https://appconda.io/docs/permissions).',
                default: false,
                example: true,
            })
            .addRule('name', {
                type: Model.TYPE_STRING,
                description: 'Bucket name.',
                default: '',
                example: 'Documents',
            })
            .addRule('enabled', {
                type: Model.TYPE_BOOLEAN,
                description: 'Bucket enabled.',
                default: true,
                example: false,
            })
            .addRule('maximumFileSize', {
                type: Model.TYPE_INTEGER,
                description: 'Maximum file size supported.',
                default: 0,
                example: 100,
            })
            .addRule('allowedFileExtensions', {
                type: Model.TYPE_STRING,
                description: 'Allowed file extensions.',
                default: [],
                example: ['jpg', 'png'],
                array: true,
            })
            .addRule('compression', {
                type: Model.TYPE_STRING,
                description: `Compression algorithm chosen for compression. Will be one of ${Compression.NONE}, [${Compression.GZIP}](https://en.wikipedia.org/wiki/Gzip), or [${Compression.ZSTD}](https://en.wikipedia.org/wiki/Zstd).`,
                default: '',
                example: 'gzip',
                array: false,
            })
            .addRule('encryption', {
                type: Model.TYPE_BOOLEAN,
                description: 'Bucket is encrypted.',
                default: true,
                example: false,
            })
            .addRule('antivirus', {
                type: Model.TYPE_BOOLEAN,
                description: 'Virus scanning is enabled.',
                default: true,
                example: false,
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Bucket';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_BUCKET;
    }
}
