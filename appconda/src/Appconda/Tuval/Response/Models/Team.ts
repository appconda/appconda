import { Document } from '../../../../Tuval/Core';
import { Response } from '../../Response';
import { Model } from '../Model';

export class Team extends Model {
    constructor() {
        super();

        this
            .addRule('$id', {
                type: Model.TYPE_STRING,
                description: 'Team ID.',
                default: '',
                example: '5e5ea5c16897e',
            })
            .addRule('$createdAt', {
                type: Model.TYPE_DATETIME,
                description: 'Team creation date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('$updatedAt', {
                type: Model.TYPE_DATETIME,
                description: 'Team update date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('name', {
                type: Model.TYPE_STRING,
                description: 'Team name.',
                default: '',
                example: 'VIP',
            })
            .addRule('total', {
                type: Model.TYPE_INTEGER,
                description: 'Total number of team members.',
                default: 0,
                example: 7,
            })
            .addRule('prefs', {
                type: Response.MODEL_PREFERENCES,
                description: 'Team preferences as a key-value object',
                default: {},
                example: { theme: 'pink', timezone: 'UTC' },
            });
    }

    /**
     * Process Document before returning it to the client
     *
     * @return Document
     */
    public filter(document: Document): Document {
        let prefs = document.getAttribute('prefs');
        if (prefs instanceof Document) {
            prefs = prefs.getArrayCopy();
        }

        if (Array.isArray(prefs) && prefs.length === 0) {
            document.setAttribute('prefs', {});
        }
        return document;
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Team';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_TEAM;
    }
}