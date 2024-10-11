
import { Database } from '../../Database';
import { Document } from '../../../Core';
import { Query } from '../../Query';
import { Base } from './Base';

export class Select extends Base {
    protected schema: Record<string, any> = [];

    protected static readonly INTERNAL_ATTRIBUTES: string[] = [
        '$id',
        '$internalId',
        '$createdAt',
        '$updatedAt',
        '$permissions',
        '$collection',
    ];

    constructor(attributes: Document[] = []) {
        super();
        for (const attribute of attributes) {
            this.schema[attribute.getAttribute('key', attribute.getAttribute('$id'))] = attribute.getArrayCopy();
        }
    }

    public isValid(value: any): boolean {
        if (!(value instanceof Query)) {
            return false;
        }

        if (value.getMethod() !== Query.TYPE_SELECT) {
            return false;
        }

        const internalKeys = Database.INTERNAL_ATTRIBUTES.map(attr => attr['$id']);

        for (const attribute of value.getValues()) {
            let attr = attribute;
            if (attr.includes('.')) {
                if (this.schema[attr]) {
                    continue;
                }
                attr = attr.split('.')[0];
            }

            if (internalKeys.includes(attr)) {
                continue;
            }

            if (!this.schema[attr] && attr !== '*') {
                this.message = 'Attribute not found in schema: ' + attr;
                return false;
            }
        }
        return true;
    }

    public getMethodType(): string {
        return Select.METHOD_TYPE_SELECT;
    }
}