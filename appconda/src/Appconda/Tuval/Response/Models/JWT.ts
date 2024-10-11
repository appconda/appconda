import { Response } from '../../Response';
import { Model } from '../Model';

export class JWT extends Model {
    constructor() {
        super();

        this.addRule('jwt', {
            type: Model.TYPE_STRING,
            description: 'JWT encoded string.',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'JWT';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_JWT;
    }
}
