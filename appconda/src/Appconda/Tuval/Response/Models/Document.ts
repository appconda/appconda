import { Response } from '../../Response';
import { Any } from './Any';
import { Document as DatabaseDocument } from '../../../../Tuval/Core';

export class ModelDocument extends Any {
    constructor() {
        super();

        this
            .addRule('$id', {
                type: Any.TYPE_STRING,
                description: 'Document ID.',
                default: '',
                example: '5e5ea5c16897e',
            })
            .addRule('$collectionId', {
                type: Any.TYPE_STRING,
                description: 'Collection ID.',
                default: '',
                example: '5e5ea5c15117e',
            })
            .addRule('$databaseId', {
                type: Any.TYPE_STRING,
                description: 'Database ID.',
                default: '',
                example: '5e5ea5c15117e',
            })
            .addRule('$createdAt', {
                type: Any.TYPE_DATETIME,
                description: 'Document creation date in ISO 8601 format.',
                default: '',
                example: Any.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('$updatedAt', {
                type: Any.TYPE_DATETIME,
                description: 'Document update date in ISO 8601 format.',
                default: '',
                example: Any.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('$permissions', {
                type: Any.TYPE_STRING,
                description: 'Document permissions. [Learn more about permissions](https://appconda.io/docs/permissions).',
                default: '',
                example: ['read("any")'],
                array: true,
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Document';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_DOCUMENT;
    }

    public filter(document: DatabaseDocument): DatabaseDocument {
        document.removeAttribute('$internalId');
        document.removeAttribute('$collection'); // $collection is the internal collection ID

        for (const attribute of Object.values(document.getAttributes())) {
            if (Array.isArray(attribute)) {
                for (const subAttribute of attribute) {
                    if (subAttribute instanceof DatabaseDocument) {
                        this.filter(subAttribute);
                    }
                }
            } else if (attribute instanceof DatabaseDocument) {
                this.filter(attribute);
            }
        }

        return document;
    }
}