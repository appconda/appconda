
import { Validator } from '../../../Tuval/Core';
import { Database } from '../Database';
import { Document } from '../../Core';


export class Index extends Validator {
    protected message: string = 'Invalid index';
    protected maxLength: number;
    protected attributes: Record<string, Document> = {};

    constructor(attributes: Document[], maxLength: number) {
        super();
        this.maxLength = maxLength;

        for (const attribute of attributes) {
            const key = attribute.getAttribute('key', attribute.getAttribute('$id')).toLowerCase();
            this.attributes[key] = attribute;
        }
        for (const attribute of Database.INTERNAL_ATTRIBUTES) {
            const key = attribute.get('$id').toLowerCase();
            this.attributes[key] = new Document(attribute);
        }
    }

    public getDescription(): string {
        return this.message;
    }

    public checkAttributesNotFound(index: Document): boolean {
        for (const attribute of index.getAttribute('attributes', [])) {
            if (!this.attributes[attribute.toLowerCase()]) {
                this.message = `Invalid index attribute "${attribute}" not found`;
                return false;
            }
        }
        return true;
    }

    public checkEmptyIndexAttributes(index: Document): boolean {
        if (index.getAttribute('attributes', []).length === 0) {
            this.message = 'No attributes provided for index';
            return false;
        }
        return true;
    }

    public checkDuplicatedAttributes(index: Document): boolean {
        const attributes = index.getAttribute('attributes', []);
        const orders = index.getAttribute('orders', []);
        const stack: string[] = [];
        for (const [key, attribute] of attributes.entries()) {
            const direction = orders[key] ?? 'ASC';
            const value = `${attribute.toLowerCase()}|${direction}`;
            if (stack.includes(value)) {
                this.message = 'Duplicate attributes provided';
                return false;
            }
            stack.push(value);
        }
        return true;
    }

    public checkFulltextIndexNonString(index: Document): boolean {
        if (index.getAttribute('type') === Database.INDEX_FULLTEXT) {
            for (const attribute of index.getAttribute('attributes', [])) {
                const attr = this.attributes[attribute.toLowerCase()] ?? new Document();
                if (attr.getAttribute('type', '') !== Database.VAR_STRING) {
                    this.message = `Attribute "${attr.getAttribute('key', attr.getAttribute('$id'))}" cannot be part of a FULLTEXT index, must be of type string`;
                    return false;
                }
            }
        }
        return true;
    }

    public checkArrayIndex(index: Document): boolean {
        const attributes = index.getAttribute('attributes', []);
        const orders = index.getAttribute('orders', []);
        const lengths = index.getAttribute('lengths', []);

        const arrayAttributes: string[] = [];
        for (const [attributePosition, attributeName] of attributes.entries()) {
            const attribute = this.attributes[attributeName.toLowerCase()] ?? new Document();

            if (attribute.getAttribute('array', false)) {
                if (index.getAttribute('type') !== Database.INDEX_KEY) {
                    this.message = `"${index.getAttribute('type')}" index is forbidden on array attributes`;
                    return false;
                }

                if (!lengths[attributePosition]) {
                    this.message = 'Index length for array not specified';
                    return false;
                }

                arrayAttributes.push(attribute.getAttribute('key', ''));
                if (arrayAttributes.length > 1) {
                    this.message = 'An index may only contain one array attribute';
                    return false;
                }

                const direction = orders[attributePosition] ?? '';
                if (direction) {
                    this.message = `Invalid index order "${direction}" on array attribute "${attribute.getAttribute('key', '')}"`;
                    return false;
                }
            } else if (attribute.getAttribute('type') !== Database.VAR_STRING && lengths[attributePosition]) {
                this.message = `Cannot set a length on "${attribute.getAttribute('type')}" attributes`;
                return false;
            }
        }
        return true;
    }

    public checkIndexLength(index: Document): boolean {
        if (index.getAttribute('type') === Database.INDEX_FULLTEXT) {
            return true;
        }

        let total = 0;
        const lengths = index.getAttribute('lengths', []);

        for (const [attributePosition, attributeName] of index.getAttribute('attributes', []).entries()) {
            const attribute = this.attributes[attributeName.toLowerCase()];

            let attributeSize: number;
            let indexLength: number;

            switch (attribute.getAttribute('type')) {
                case Database.VAR_STRING:
                    attributeSize = attribute.getAttribute('size', 0);
                    indexLength = lengths[attributePosition] ?? attributeSize;
                    break;
                case Database.VAR_FLOAT:
                    attributeSize = 2; // 8 bytes / 4 mb4
                    indexLength = 2;
                    break;
                default:
                    attributeSize = 1; // 4 bytes / 4 mb4
                    indexLength = 1;
                    break;
            }

            if (attribute.getAttribute('array', false)) {
                attributeSize = Database.ARRAY_INDEX_LENGTH;
                indexLength = Database.ARRAY_INDEX_LENGTH;
            }

            if (indexLength > attributeSize) {
                this.message = `Index length ${indexLength} is larger than the size for ${attributeName}: ${attributeSize}`;
                return false;
            }

            total += indexLength;
        }

        if (total > this.maxLength && this.maxLength > 0) {
            this.message = `Index length is longer than the maximum: ${this.maxLength}`;
            return false;
        }

        return true;
    }

    public isValid(value: any): boolean {
        if (!this.checkAttributesNotFound(value)) {
            return false;
        }

        if (!this.checkEmptyIndexAttributes(value)) {
            return false;
        }

        if (!this.checkDuplicatedAttributes(value)) {
            return false;
        }

        if (!this.checkFulltextIndexNonString(value)) {
            return false;
        }

        if (!this.checkArrayIndex(value)) {
            return false;
        }

        if (!this.checkIndexLength(value)) {
            return false;
        }

        return true;
    }

    public isArray(): boolean {
        return false;
    }

    public getType(): string {
        return Validator.TYPE_OBJECT;
    }
}