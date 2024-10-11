
import { Document } from '../../../../Tuval/Core';
import { Response } from '../../Response';
import { Attribute } from './Attribute';

export class AttributeRelationship extends Attribute {
    constructor() {
        super();

        this
            .addRule('relatedCollection', {
                type: Attribute.TYPE_STRING,
                description: 'The ID of the related collection.',
                default: null,
                example: 'collection',
            })
            .addRule('relationType', {
                type: Attribute.TYPE_STRING,
                description: 'The type of the relationship.',
                default: '',
                example: 'oneToOne|oneToMany|manyToOne|manyToMany',
            })
            .addRule('twoWay', {
                type: Attribute.TYPE_BOOLEAN,
                description: 'Is the relationship two-way?',
                default: false,
                example: false,
            })
            .addRule('twoWayKey', {
                type: Attribute.TYPE_STRING,
                description: 'The key of the two-way relationship.',
                default: '',
                example: 'string',
            })
            .addRule('onDelete', {
                type: Attribute.TYPE_STRING,
                description: 'How deleting the parent document will propagate to child documents.',
                default: 'restrict',
                example: 'restrict|cascade|setNull',
            })
            .addRule('side', {
                type: Attribute.TYPE_STRING,
                description: 'Whether this is the parent or child side of the relationship',
                default: '',
                example: 'parent|child',
            });
    }

    public conditions: Record<string, any> = {
        type: Attribute.TYPE_RELATIONSHIP,
    };

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'AttributeRelationship';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_ATTRIBUTE_RELATIONSHIP;
    }

    /**
     * Process Document before returning it to the client
     *
     * @return Document
     */
    public filter(document: Document): Document {
        const options = document.getAttribute('options');
        if (options !== null) {
            document.setAttribute('relatedCollection', options['relatedCollection']);
            document.setAttribute('relationType', options['relationType']);
            document.setAttribute('twoWay', options['twoWay']);
            document.setAttribute('twoWayKey', options['twoWayKey']);
            document.setAttribute('side', options['side']);
            document.setAttribute('onDelete', options['onDelete']);
        }
        return document;
    }
}
