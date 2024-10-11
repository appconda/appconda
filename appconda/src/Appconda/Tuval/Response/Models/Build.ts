import { Response } from '../../Response';
import { Model } from '../Model';

export class Build extends Model {
    constructor() {
        super();

        this
            .addRule('$id', {
                type: Model.TYPE_STRING,
                description: 'Build ID.',
                default: '',
                example: '5e5ea5c16897e',
            })
            .addRule('deploymentId', {
                type: Model.TYPE_STRING,
                description: 'The deployment that created this build.',
                default: '',
                example: '5e5ea5c16897e',
            })
            .addRule('status', {
                type: Model.TYPE_STRING,
                description: 'The build status. There are a few different types and each one means something different. \nFailed - The deployment build has failed. More details can usually be found in buildStderr\nReady - The deployment build was successful and the deployment is ready to be deployed\nProcessing - The deployment is currently waiting to have a build triggered\nBuilding - The deployment is currently being built',
                default: '',
                example: 'ready',
            })
            .addRule('stdout', {
                type: Model.TYPE_STRING,
                description: 'The stdout of the build.',
                default: '',
                example: '',
            })
            .addRule('stderr', {
                type: Model.TYPE_STRING,
                description: 'The stderr of the build.',
                default: '',
                example: '',
            })
            .addRule('startTime', {
                type: Model.TYPE_DATETIME,
                description: 'The deployment creation date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('endTime', {
                type: Model.TYPE_DATETIME,
                description: 'The time the build was finished in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('duration', {
                type: Model.TYPE_INTEGER,
                description: 'The build duration in seconds.',
                default: 0,
                example: 0,
            })
            .addRule('size', {
                type: Model.TYPE_INTEGER,
                description: 'The code size in bytes.',
                default: 0,
                example: 128,
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Build';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_BUILD;
    }
}
