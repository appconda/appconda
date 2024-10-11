import { Response } from '../../Response';
import { Model } from '../Model';

export class Runtime extends Model {
    constructor() {
        super();

        this
            .addRule('$id', {
                type: Model.TYPE_STRING,
                description: 'Runtime ID.',
                default: '',
                example: 'python-3.8',
            })
            .addRule('name', {
                type: Model.TYPE_STRING,
                description: 'Runtime Name.',
                default: '',
                example: 'Python',
            })
            .addRule('version', {
                type: Model.TYPE_STRING,
                description: 'Runtime version.',
                default: '',
                example: '3.8',
            })
            .addRule('base', {
                type: Model.TYPE_STRING,
                description: 'Base Docker image used to build the runtime.',
                default: '',
                example: 'python:3.8-alpine',
            })
            .addRule('image', {
                type: Model.TYPE_STRING,
                description: 'Image name of Docker Hub.',
                default: '',
                example: 'appconda/runtime-for-python:3.8',
            })
            .addRule('logo', {
                type: Model.TYPE_STRING,
                description: 'Name of the logo image.',
                default: '',
                example: 'python.png',
            })
            .addRule('supports', {
                type: Model.TYPE_STRING,
                description: 'List of supported architectures.',
                default: '',
                example: 'amd64',
                array: true,
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Runtime';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_RUNTIME;
    }
}
