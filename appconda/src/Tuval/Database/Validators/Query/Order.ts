import { Document } from '../../../Core';
import { Query } from '../../Query';
import { Base } from './Base';

export class Order extends Base {
    protected schema: Record<string, any> = {};

    constructor(attributes: Document[] = []) {
        super();
        for (const attribute of attributes) {
            this.schema[attribute.getAttribute('key', attribute.getAttribute('$id'))] = attribute.getArrayCopy();
        }
    }

    protected isValidAttribute(attribute: string): boolean {
        if (!this.schema[attribute]) {
            this.message = 'Attribute not found in schema: ' + attribute;
            return false;
        }
        return true;
    }

    public isValid(value: any): boolean {
        if (!(value instanceof Query)) {
            return false;
        }

        const method = value.getMethod();
        const attribute = value.getAttribute();

        if (method === Query.TYPE_ORDER_ASC || method === Query.TYPE_ORDER_DESC) {
            if (attribute === '') {
                return true;
            }
            return this.isValidAttribute(attribute);
        }

        return false;
    }

    public getMethodType(): string {
        return Order.METHOD_TYPE_ORDER;
    }
}