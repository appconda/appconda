import { Document } from '../../../Core';
import { Base } from './Base';
import { Database } from '../../Database';
import { Datetime } from '../Datetime';
import { Query } from '../../Query';
import { Boolean, FloatValidator, Integer, Text, Validator } from '../../../../Tuval/Core';

interface AttributeSchema {
    type: string;
    options?: {
        relationType?: string;
        twoWay?: boolean;
        side?: string;
    };
    array?: boolean;
}

export class Filter extends Base {
    /**
     * @type {Record<number | string, any>}
     */
    protected schema: Record<number | string, any> = {};

    private maxValuesCount: number;

    /**
     * @param {Document[]} attributes
     * @param {number} maxValuesCount
     */
    constructor(attributes: Document[] = [], maxValuesCount: number = 100) {
        super();
        for (const attribute of attributes) {
            const key = attribute.getAttribute('key', attribute.getAttribute('$id'));
            this.schema[key] = attribute.getArrayCopy();
        }

        this.maxValuesCount = maxValuesCount;
    }

    /**
     * @param {string} attribute
     * @returns {boolean}
     */
    protected isValidAttribute(attribute: string): boolean {
        if (attribute.includes('.')) {
            // Check for special symbol `.`
            if (this.schema.hasOwnProperty(attribute)) {
                return true;
            }

            // For relationships, just validate the top level.
            // Will validate each nested level during the recursive calls.
            attribute = attribute.split('.')[0];

            if (this.schema.hasOwnProperty(attribute)) {
                this.message = `Cannot query nested attribute on: ${attribute}`;
                return false;
            }
        }

        // Search for attribute in schema
        if (!this.schema.hasOwnProperty(attribute)) {
            this.message = `Attribute not found in schema: ${attribute}`;
            return false;
        }

        return true;
    }

    /**
     * @param {string} attribute
     * @param {any[]} values
     * @param {string} method
     * @returns {boolean}
     */
    protected isValidAttributeAndValues(attribute: string, values: any[], method: string): boolean {
        if (!this.isValidAttribute(attribute)) {
            return false;
        }

        // isset check if for special symbols "." in the attribute name
        if (attribute.includes('.') && !this.schema.hasOwnProperty(attribute)) {
            // For relationships, just validate the top level.
            // Utopia will validate each nested level during the recursive calls.
            attribute = attribute.split('.')[0];
        }

        const attributeSchema: AttributeSchema = this.schema[attribute];

        if (values.length > this.maxValuesCount) {
            this.message = `Query on attribute has greater than ${this.maxValuesCount} values: ${attribute}`;
            return false;
        }

        // Extract the type of desired attribute from collection schema
        const attributeType = attributeSchema.type;

        for (const value of values) {
            let validator: Validator | null = null;

            switch (attributeType) {
                case Database.VAR_STRING:
                    validator = new Text(0, 0);
                    break;

                case Database.VAR_INTEGER:
                    validator = new Integer();
                    break;

                case Database.VAR_FLOAT:
                    validator = new FloatValidator();
                    break;

                case Database.VAR_BOOLEAN:
                    validator = new Boolean();
                    break;

                case Database.VAR_DATETIME:
                    validator = new Datetime();
                    break;

                case Database.VAR_RELATIONSHIP:
                    validator = new Text(255, 0); // The query is always on uid
                    break;

                default:
                    this.message = 'Unknown Data type';
                    return false;
            }

            if (validator && !validator.isValid(value)) {
                this.message = `Query value is invalid for attribute "${attribute}"`;
                return false;
            }
        }

        if (attributeSchema.type === 'relationship') {
            /**
             * We can not disable relationship query since we have logic that use it,
             * so instead we validate against the relation type
             */
            const options = attributeSchema.options || {};

            if (
                (options.relationType === Database.RELATION_ONE_TO_ONE &&
                    options.twoWay === false &&
                    options.side === Database.RELATION_SIDE_CHILD) ||
                (options.relationType === Database.RELATION_ONE_TO_MANY &&
                    options.side === Database.RELATION_SIDE_PARENT) ||
                (options.relationType === Database.RELATION_MANY_TO_ONE &&
                    options.side === Database.RELATION_SIDE_CHILD) ||
                options.relationType === Database.RELATION_MANY_TO_MANY
            ) {
                this.message = 'Cannot query on virtual relationship attribute';
                return false;
            }
        }

        const isArray = attributeSchema.array ?? false;

        if (
            !isArray &&
            method === Query.TYPE_CONTAINS &&
            attributeSchema.type !== Database.VAR_STRING
        ) {
            this.message = `Cannot query contains on attribute "${attribute}" because it is not an array or string.`;
            return false;
        }

        if (
            isArray &&
            !['contains', 'isNull', 'isNotNull'].includes(method.toLowerCase())
        ) {
            this.message = `Cannot query ${method} on attribute "${attribute}" because it is an array.`;
            return false;
        }

        return true;
    }

    /**
     * @param {any[]} values
     * @returns {boolean}
     */
    protected isEmpty(values: any[]): boolean {
        if (values.length === 0) {
            return true;
        }

        if (Array.isArray(values[0]) && values[0].length === 0) {
            return true;
        }

        return false;
    }

    /**
     * Is valid.
     *
     * Returns true if method is a filter method, attribute exists, and value matches attribute type
     *
     * Otherwise, returns false
     *
     * @param {Query} value
     * @returns {boolean}
     */
    public isValid(value: Query): boolean {
        const method = value.getMethod();
        const attribute = value.getAttribute();

        switch (method) {
            case Query.TYPE_EQUAL:
            case Query.TYPE_CONTAINS:
                if (this.isEmpty(value.getValues())) {
                    this.message = `${capitalize(method)} queries require at least one value.`;
                    return false;
                }
                return this.isValidAttributeAndValues(attribute, value.getValues(), method);

            case Query.TYPE_NOT_EQUAL:
            case Query.TYPE_LESSER:
            case Query.TYPE_LESSER_EQUAL:
            case Query.TYPE_GREATER:
            case Query.TYPE_GREATER_EQUAL:
            case Query.TYPE_SEARCH:
            case Query.TYPE_STARTS_WITH:
            case Query.TYPE_ENDS_WITH:
                if (value.getValues().length !== 1) {
                    this.message = `${capitalize(method)} queries require exactly one value.`;
                    return false;
                }
                return this.isValidAttributeAndValues(attribute, value.getValues(), method);

            case Query.TYPE_BETWEEN:
                if (value.getValues().length !== 2) {
                    this.message = `${capitalize(method)} queries require exactly two values.`;
                    return false;
                }
                return this.isValidAttributeAndValues(attribute, value.getValues(), method);

            case Query.TYPE_IS_NULL:
            case Query.TYPE_IS_NOT_NULL:
                return this.isValidAttributeAndValues(attribute, value.getValues(), method);

            case Query.TYPE_OR:
            case Query.TYPE_AND:
                const filters = Query.groupByType(value.getValues()).filters;

                if (value.getValues().length !== filters.length) {
                    this.message = `${capitalize(method)} queries can only contain filter queries`;
                    return false;
                }

                if (filters.length < 2) {
                    this.message = `${capitalize(method)} queries require at least two queries`;
                    return false;
                }

                return true;

            default:
                return false;
        }
    }

    /**
     * Returns what type of query this Validator is for
     */
    public getMethodType(): string {
        return Filter.METHOD_TYPE_FILTER;
    }
}

function capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
}
