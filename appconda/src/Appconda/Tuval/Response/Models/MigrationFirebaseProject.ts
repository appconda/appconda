import { Response } from '../../Response';
import { Model } from '../Model';

export class MigrationFirebaseProject extends Model {
    constructor() {
        super();

        this
            .addRule('projectId', {
                type: Model.TYPE_STRING,
                description: 'Project ID.',
                default: '',
                example: 'my-project',
            })
            .addRule('displayName', {
                type: Model.TYPE_STRING,
                description: 'Project display name.',
                default: '',
                example: 'My Project',
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'MigrationFirebaseProject';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_MIGRATION_FIREBASE_PROJECT;
    }
}
