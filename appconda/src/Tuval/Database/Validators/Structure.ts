
import { Database } from '../Database';
import { Document } from '../../Core';
import { Datetime as DatetimeValidator } from './Datetime';
import {Exception as DatabaseException } from '../Exception';
import { Boolean, FloatValidator, Integer, Range, Text, Validator } from '../../../Tuval/Core';


export class Structure extends Validator {
    protected collection: Document;
    protected attributes: Array<Record<string, any>> = [
        {
            '$id': '$id',
            'type': Database.VAR_STRING,
            'size': 255,
            'required': false,
            'signed': true,
            'array': false,
            'filters': [],
        },
        {
            '$id': '$internalId',
            'type': Database.VAR_STRING,
            'size': 255,
            'required': false,
            'signed': true,
            'array': false,
            'filters': [],
        },
        {
            '$id': '$collection',
            'type': Database.VAR_STRING,
            'size': 255,
            'required': true,
            'signed': true,
            'array': false,
            'filters': [],
        },
        {
            '$id': '$tenant',
            'type': Database.VAR_STRING,
            'size': 36,
            'required': false,
            'default': null,
            'signed': true,
            'array': false,
            'filters': [],
        },
        {
            '$id': '$permissions',
            'type': Database.VAR_STRING,
            'size': 67000, // medium text
            'required': false,
            'signed': true,
            'array': true,
            'filters': [],
        },
        {
            '$id': '$createdAt',
            'type': Database.VAR_DATETIME,
            'size': 0,
            'required': false,
            'signed': false,
            'array': false,
            'filters': [],
        },
        {
            '$id': '$updatedAt',
            'type': Database.VAR_DATETIME,
            'size': 0,
            'required': false,
            'signed': false,
            'array': false,
            'filters': [],
        }
    ];

    protected static formats: Record<string, { callback: Function, type: string }> = {};
    protected message: string = 'General Error';

    constructor(collection: Document) {
        super();
        this.collection = collection;
    }

    public static getFormats(): Record<string, { callback: Function, type: string }> {
        return this.formats;
    }

    public static addFormat(name: string, callback: Function, type: string): void {
        this.formats[name] = { callback, type };
    }

    public static hasFormat(name: string, type: string): boolean {
        return this.formats[name] && this.formats[name].type === type;
    }

    public static getFormat(name: string, type: string): { callback: Function, type: string } {
        if (this.formats[name]) {
            if (this.formats[name].type !== type) {
                throw new DatabaseException(`Format "${name}" not available for attribute type "${type}"`);
            }
            return this.formats[name];
        }
        throw new DatabaseException(`Unknown format validator "${name}"`);
    }

    public static removeFormat(name: string): void {
        delete this.formats[name];
    }

    public getDescription(): string {
        return `Invalid document structure: ${this.message}`;
    }

    public isValid(document: any): boolean {
        if (!(document instanceof Document)) {
            this.message = 'Value must be an instance of Document';
            return false;
        }

        if (!document.getCollection()) {
            this.message = 'Missing collection attribute $collection';
            return false;
        }

        if (!this.collection.getId() || Database.METADATA !== this.collection.getCollection()) {
            this.message = 'Collection not found';
            return false;
        }

        const keys: Record<string, any> = {};
        const structure = document.getArrayCopy();
        const attributes = [...this.attributes, ...this.collection.getAttribute('attributes', []).map(a => a.getArrayCopy())];

        for (const attribute of attributes) {
            const name = attribute['$id'] ?? '';
            const required = attribute['required'] ?? false;

            keys[name] = attribute;

            if (required && !structure[name]) {
                this.message = `Missing required attribute "${name}"`;
                return false;
            }
        }

        for (const [key, value] of Object.entries(structure)) {
            if (!keys[key]) {
                this.message = `Unknown attribute: "${key}"`;
                return false;
            }

            const attribute = keys[key];
            const type = attribute['type'] ?? '';
            const array = attribute['array'] ?? false;
            const format = attribute['format'] ?? '';
            const required = attribute['required'] ?? false;
            const size = attribute['size'] ?? 0;
            const signed = attribute['signed'] ?? true;

            if (!required && value === null) {
                continue;
            }

            if (type === Database.VAR_RELATIONSHIP) {
                continue;
            }

            const validators: Validator[] = [];

            switch (type) {
                case Database.VAR_STRING:
                    validators.push(new Text(size, 0));
                    break;
                case Database.VAR_INTEGER:
                    validators.push(new Integer());
                    const max = size >= 8 ? Database.BIG_INT_MAX : Database.INT_MAX;
                    const min = signed ? -max : 0;
                    validators.push(new Range(min, max, Database.VAR_INTEGER));
                    break;
                case Database.VAR_FLOAT:
                    validators.push(new FloatValidator());
                    const minFloat = signed ? -Database.DOUBLE_MAX : 0;
                    validators.push(new Range(minFloat, Database.DOUBLE_MAX, Database.VAR_FLOAT));
                    break;
                case Database.VAR_BOOLEAN:
                    validators.push(new Boolean());
                    break;
                case Database.VAR_DATETIME:
                    validators.push(new DatetimeValidator());
                    break;
                default:
                    this.message = `Unknown attribute type "${type}"`;
                    return false;
            }

            const label = format ? 'format' : 'type';

            if (format) {
                const formatValidator = Structure.getFormat(format, type);
                validators.push(formatValidator.callback(attribute));
            }

            if (array) {
                if (!required && (Array.isArray(value) && value.length === 0 || value === null)) {
                    continue;
                }

                if (!Array.isArray(value) || !Array.isArray(value)) {
                    this.message = `Attribute "${key}" must be an array`;
                    return false;
                }

                for (const [x, child] of value.entries()) {
                    if (!required && child === null) {
                        continue;
                    }

                    for (const validator of validators) {
                        if (!validator.isValid(child)) {
                            this.message = `Attribute "${key}['${x}']" has invalid ${label}. ${validator.getDescription()}`;
                            return false;
                        }
                    }
                }
            } else {
                for (const validator of validators) {
                    if (!validator.isValid(value)) {
                        this.message = `Attribute "${key}" has invalid ${label}. ${validator.getDescription()}`;
                        return false;
                    }
                }
            }
        }

        return true;
    }

    public isArray(): boolean {
        return false;
    }

    public getType(): string {
        return Structure.TYPE_ARRAY;
    }
}