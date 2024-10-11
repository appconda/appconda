import { Response } from '../../Response';
import { Model } from '../Model';

export class File extends Model {
    constructor() {
        super();

        this
            .addRule('$id', {
                type: Model.TYPE_STRING,
                description: 'File ID.',
                default: '',
                example: '5e5ea5c16897e',
            })
            .addRule('bucketId', {
                type: Model.TYPE_STRING,
                description: 'Bucket ID.',
                default: '',
                example: '5e5ea5c16897e',
            })
            .addRule('$createdAt', {
                type: Model.TYPE_DATETIME,
                description: 'File creation date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('$updatedAt', {
                type: Model.TYPE_DATETIME,
                description: 'File update date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('$permissions', {
                type: Model.TYPE_STRING,
                description: 'File permissions. [Learn more about permissions](https://appconda.io/docs/permissions).',
                default: [],
                example: ['read("any")'],
                array: true,
            })
            .addRule('name', {
                type: Model.TYPE_STRING,
                description: 'File name.',
                default: '',
                example: 'Pink.png',
            })
            .addRule('signature', {
                type: Model.TYPE_STRING,
                description: 'File MD5 signature.',
                default: '',
                example: '5d529fd02b544198ae075bd57c1762bb',
            })
            .addRule('mimeType', {
                type: Model.TYPE_STRING,
                description: 'File mime type.',
                default: '',
                example: 'image/png',
            })
            .addRule('sizeOriginal', {
                type: Model.TYPE_INTEGER,
                description: 'File original size in bytes.',
                default: 0,
                example: 17890,
            })
            .addRule('chunksTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total number of chunks available',
                default: 0,
                example: 17890,
            })
            .addRule('chunksUploaded', {
                type: Model.TYPE_INTEGER,
                description: 'Total number of chunks uploaded',
                default: 0,
                example: 17890,
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'File';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_FILE;
    }
}
