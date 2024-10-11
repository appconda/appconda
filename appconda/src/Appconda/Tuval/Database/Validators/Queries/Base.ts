
import { Document } from '../../../../../Tuval/Core';
import { Cursor, Database, Filter, Limit, Offset, Order, Queries } from '../../../../../Tuval/Database';

import { Config } from '../../../../../Tuval/Config';

export class Base extends Queries {
    /**
     * Constructor
     *
     * @param collection
     * @param allowedAttributes
     * @throws Error
     */
    constructor(collection: string, allowedAttributes: string[]) {
        const config = Config.getParam('collections', []);
        const collections = {
            ...config.projects,
            ...config.buckets,
            ...config.databases,
            ...config.console,
        };
        const collectionConfig = collections[collection];

        const allowedAttributesLookup: Record<string, boolean> = {};
        for (const attribute of allowedAttributes) {
            allowedAttributesLookup[attribute] = true;
        }

        const attributes: Document[] = [];
        for (const attribute of collectionConfig.attributes) {
            const key = attribute.$id;
            if (!allowedAttributesLookup[key]) {
                continue;
            }

            attributes.push(new Document({
                key: key,
                type: attribute.type,
                array: attribute.array,
            }));
        }

        attributes.push(new Document({
            key: '$id',
            type: Database.VAR_STRING,
            array: false,
        }));
        attributes.push(new Document({
            key: '$createdAt',
            type: Database.VAR_DATETIME,
            array: false,
        }));
        attributes.push(new Document({
            key: '$updatedAt',
            type: Database.VAR_DATETIME,
            array: false,
        }));

        const validators = [
            new Limit(),
            new Offset(),
            new Cursor(),
            new Filter(attributes),
            new Order(attributes),
        ];

        super(validators);
    }
}
