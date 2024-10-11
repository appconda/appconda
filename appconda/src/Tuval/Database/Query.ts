import { Document } from '../Core';
import { QueryException } from './Exceptions/Query';




export class Query {
    // Filter methods are already defined in string enum

    public static TYPE_EQUAL: string = 'equal';
    public static TYPE_NOT_EQUAL: string = 'notEqual';
    public static TYPE_LESSER: string = 'lessThan';
    public static TYPE_LESSER_EQUAL: string = 'lessThanEqual';
    public static TYPE_GREATER: string = 'greaterThan';
    public static TYPE_GREATER_EQUAL: string = 'greaterThanEqual';
    public static TYPE_CONTAINS: string = 'contains';
    public static TYPE_SEARCH: string = 'search';
    public static TYPE_IS_NULL: string = 'isNull';
    public static TYPE_IS_NOT_NULL: string = 'isNotNull';
    public static TYPE_BETWEEN: string = 'between';
    public static TYPE_STARTS_WITH: string = 'startsWith';
    public static TYPE_ENDS_WITH: string = 'endsWith';
    public static TYPE_SELECT: string = 'select';

    // Order methods
    public static TYPE_ORDER_DESC: string = 'orderDesc';
    public static TYPE_ORDER_ASC: string = 'orderAsc';

    // Pagination methods
    public static TYPE_LIMIT: string = 'limit';
    public static TYPE_OFFSET: string = 'offset';
    public static TYPE_CURSOR_AFTER: string = 'cursorAfter';
    public static TYPE_CURSOR_BEFORE: string = 'cursorBefore';

    // Logical methods
    public static TYPE_AND: string = 'and';
    public static TYPE_OR: string = 'or';

    static TYPES = [
        Query.TYPE_EQUAL,
        Query.TYPE_NOT_EQUAL,
        Query.TYPE_LESSER,
        Query.TYPE_LESSER_EQUAL,
        Query.TYPE_GREATER,
        Query.TYPE_GREATER_EQUAL,
        Query.TYPE_CONTAINS,
        Query.TYPE_SEARCH,
        Query.TYPE_IS_NULL,
        Query.TYPE_IS_NOT_NULL,
        Query.TYPE_BETWEEN,
        Query.TYPE_STARTS_WITH,
        Query.TYPE_ENDS_WITH,
        Query.TYPE_SELECT,
        Query.TYPE_ORDER_DESC,
        Query.TYPE_ORDER_ASC,
        Query.TYPE_LIMIT,
        Query.TYPE_OFFSET,
        Query.TYPE_CURSOR_AFTER,
        Query.TYPE_CURSOR_BEFORE,
        Query.TYPE_AND,
        Query.TYPE_OR
    ]

    protected static LOGICAL_TYPES = [
        Query.TYPE_AND,
        Query.TYPE_OR
    ]

    protected method: string;
    protected attribute: string;
    protected _onArray: boolean = false;

    protected values: any[];

    /**
     * Construct a new Query object
     * @param method string
     * @param attribute string
     * @param values any[]
     */
    constructor(method: string, attribute: string = '', values: any[] = []) {
        this.method = method;
        this.attribute = attribute;
        this.values = values;
    }

    /**
     * Clone method to deep copy nested Query instances
     */
    clone(): Query {
        const clonedValues = this.values.map(value => {
            if (value instanceof Query) {
                return value.clone();
            }
            return value;
        });
        return new Query(this.method, this.attribute, clonedValues);
    }

    /**
     * Get the method type of the Query
     * @returns string
     */
    getMethod(): string {
        return this.method;
    }

    /**
     * Get the attribute of the Query
     * @returns string
     */
    getAttribute(): string {
        return this.attribute;
    }

    /**
     * Get the values of the Query
     * @returns any[]
     */
    getValues(): any[] {
        return this.values;
    }

    /**
     * Get the first value or default
     * @param defaultValue any
     * @returns any
     */
    getValue(defaultValue: any = null): any {
        return this.values[0] ?? defaultValue;
    }

    /**
     * Set the method type
     * @param method string
     * @returns this
     */
    setMethod(method: string): this {
        this.method = method;
        return this;
    }

    /**
     * Set the attribute
     * @param attribute string
     * @returns this
     */
    setAttribute(attribute: string): this {
        this.attribute = attribute;
        return this;
    }

    /**
     * Set the values
     * @param values any[]
     * @returns this
     */
    setValues(values: any[]): this {
        this.values = values;
        return this;
    }

    /**
     * Set a single value
     * @param value any
     * @returns this
     */
    setValue(value: any): this {
        this.values = [value];
        return this;
    }

    /**
     * Check if method is supported
     * @param value string
     * @returns boolean
     */
    static isMethod(value: string): value is string {
        return Query.TYPES.includes(value as string);
    }

    /**
     * Parse a JSON string into a Query object
     * @param query string
     * @returns Query
     * @throws QueryException
     */
    static parse(query: string): Query {
        let parsed: any;
        try {
            parsed = JSON.parse(query);
        } catch (e: any) {
            throw new QueryException('Invalid query: ' + e.message);
        }

        if (!Array.isArray(parsed) && typeof parsed !== 'object') {
            throw new QueryException(`Invalid query. Must be an object or array, got ${typeof parsed}`);
        }

        return Array.isArray(parsed) ? Query.parseQuery({ method: Query.TYPE_AND, values: parsed }) : Query.parseQuery(parsed);
    }

    /**
     * Parse a query object into a Query instance
     * @param query any
     * @returns Query
     * @throws QueryException
     */
    static parseQuery(query: any): Query {
        if (typeof query !== 'object' || query === null) {
            throw new QueryException(`Invalid query. Must be an object, got ${typeof query}`);
        }

        const methodStr = query['method'];
        const attribute = query['attribute'] ?? '';
        const values = query['values'] ?? [];

        if (!Query.isMethod(methodStr)) {
            throw new QueryException('Invalid query method: ' + methodStr);
        }

        const method = methodStr as string;

        if (Query.LOGICAL_TYPES.includes(method)) {
            if (!Array.isArray(values)) {
                throw new QueryException('Logical query values must be an array');
            }
            const parsedValues = values.map((value: any, index: number) => {
                try {
                    return Query.parseQuery(value);
                } catch (e: any) {
                    throw new QueryException(`Error parsing nested query at index ${index}: ${e.message}`);
                }
            });
            return new Query(method, attribute, parsedValues);
        }

        if (typeof attribute !== 'string') {
            throw new QueryException(`Invalid query attribute. Must be a string, got ${typeof attribute}`);
        }

        return new Query(method, attribute, values);
    }

    /**
     * Parse multiple JSON strings into Query instances
     * @param queries string[]
     * @returns Query[]
     * @throws QueryException
     */
    static parseQueries(queries: string[]): Query[] {
        return queries.map((queryStr, index) => {
            try {
                return Query.parse(queryStr);
            } catch (e: any) {
                throw new QueryException(`Error parsing query at index ${index}: ${e.message}`);
            }
        });
    }

    /**
     * Convert the Query instance to an array
     * @returns { method: string, attribute?: string, values: any[] }
     */
    toArray(): { method: string; attribute?: string; values: any[] } {
        const array: { method: string; attribute?: string; values: any[] } = {
            method: this.method,
            values: [] // Initialize values property
        };

        if (this.attribute) {
            array.attribute = this.attribute;
        }

        if (Query.LOGICAL_TYPES.includes(this.method)) {
            array.values = this.values.map(value => (value instanceof Query ? value.toArray() : value));
        } else {
            array.values = this.values.map(value => {
                if (value instanceof Document && [Query.TYPE_CURSOR_AFTER, Query.TYPE_CURSOR_BEFORE].includes(this.method)) {
                    return value.getId();
                }
                return value;
            });
        }

        return array;
    }

    /**
     * Convert the Query instance to a JSON string
     * @returns string
     * @throws QueryException
     */
    toString(): string {
        try {
            return JSON.stringify(this.toArray());
        } catch (e: any) {
            throw new QueryException('Invalid JSON: ' + e.message);
        }
    }

    /**
     * Helper method to create Query with equal method
     * @param attribute string
     * @param values string | number | boolean | (string | number | boolean)[]
     * @returns Query
     */
    static equal(attribute: string, values: string | number | boolean | (string | number | boolean)[]): Query {
        const vals = Array.isArray(values) ? values : [values];
        return new Query(Query.TYPE_EQUAL, attribute, vals);
    }

    /**
     * Helper method to create Query with notEqual method
     * @param attribute string
     * @param value string | number | boolean
     * @returns Query
     */
    static notEqual(attribute: string, value: string | number | boolean): Query {
        return new Query(Query.TYPE_NOT_EQUAL, attribute, [value]);
    }

    /**
     * Helper method to create Query with lessThan method
     * @param attribute string
     * @param value string | number | boolean
     * @returns Query
     */
    static lessThan(attribute: string, value: string | number | boolean): Query {
        return new Query(Query.TYPE_LESSER, attribute, [value]);
    }

    /**
     * Helper method to create Query with lessThanEqual method
     * @param attribute string
     * @param value string | number | boolean
     * @returns Query
     */
    static lessThanEqual(attribute: string, value: string | number | boolean): Query {
        return new Query(Query.TYPE_LESSER_EQUAL, attribute, [value]);
    }

    /**
     * Helper method to create Query with greaterThan method
     * @param attribute string
     * @param value string | number | boolean
     * @returns Query
     */
    static greaterThan(attribute: string, value: string | number | boolean): Query {
        return new Query(Query.TYPE_GREATER, attribute, [value]);
    }

    /**
     * Helper method to create Query with greaterThanEqual method
     * @param attribute string
     * @param value string | number | boolean
     * @returns Query
     */
    static greaterThanEqual(attribute: string, value: string | number | boolean): Query {
        return new Query(Query.TYPE_GREATER_EQUAL, attribute, [value]);
    }

    /**
     * Helper method to create Query with contains method
     * @param attribute string
     * @param values any[]
     * @returns Query
     */
    static contains(attribute: string, values: any[]): Query {
        return new Query(Query.TYPE_CONTAINS, attribute, values);
    }

    /**
     * Helper method to create Query with between method
     * @param attribute string
     * @param start string | number | boolean
     * @param end string | number | boolean
     * @returns Query
     */
    static between(attribute: string, start: string | number | boolean, end: string | number | boolean): Query {
        return new Query(Query.TYPE_BETWEEN, attribute, [start, end]);
    }

    /**
     * Helper method to create Query with search method
     * @param attribute string
     * @param value string
     * @returns Query
     */
    static search(attribute: string, value: string): Query {
        return new Query(Query.TYPE_SEARCH, attribute, [value]);
    }

    /**
     * Helper method to create Query with select method
     * @param attributes string[]
     * @returns Query
     */
    static select(attributes: string[]): Query {
        return new Query(Query.TYPE_SELECT, '', attributes);
    }

    /**
     * Helper method to create Query with orderDesc method
     * @param attribute string
     * @returns Query
     */
    static orderDesc(attribute: string = ''): Query {
        return new Query(Query.TYPE_ORDER_DESC, attribute);
    }

    /**
     * Helper method to create Query with orderAsc method
     * @param attribute string
     * @returns Query
     */
    static orderAsc(attribute: string = ''): Query {
        return new Query(Query.TYPE_ORDER_ASC, attribute);
    }

    /**
     * Helper method to create Query with limit method
     * @param value number
     * @returns Query
     */
    static limit(value: number): Query {
        return new Query(Query.TYPE_LIMIT, '', [value]);
    }

    /**
     * Helper method to create Query with offset method
     * @param value number
     * @returns Query
     */
    static offset(value: number): Query {
        return new Query(Query.TYPE_OFFSET, '', [value]);
    }

    /**
     * Helper method to create Query with cursorAfter method
     * @param value Document
     * @returns Query
     */
    static cursorAfter(value: Document): Query {
        return new Query(Query.TYPE_CURSOR_AFTER, '', [value]);
    }

    /**
     * Helper method to create Query with cursorBefore method
     * @param value Document
     * @returns Query
     */
    static cursorBefore(value: Document): Query {
        return new Query(Query.TYPE_CURSOR_BEFORE, '', [value]);
    }

    /**
     * Helper method to create Query with isNull method
     * @param attribute string
     * @returns Query
     */
    static isNull(attribute: string): Query {
        return new Query(Query.TYPE_IS_NULL, attribute);
    }

    /**
     * Helper method to create Query with isNotNull method
     * @param attribute string
     * @returns Query
     */
    static isNotNull(attribute: string): Query {
        return new Query(Query.TYPE_IS_NOT_NULL, attribute);
    }

    /**
     * Helper method to create Query with startsWith method
     * @param attribute string
     * @param value string
     * @returns Query
     */
    static startsWith(attribute: string, value: string): Query {
        return new Query(Query.TYPE_STARTS_WITH, attribute, [value]);
    }

    /**
     * Helper method to create Query with endsWith method
     * @param attribute string
     * @param value string
     * @returns Query
     */
    static endsWith(attribute: string, value: string): Query {
        return new Query(Query.TYPE_ENDS_WITH, attribute, [value]);
    }

    /**
     * Helper method to create Query with or method
     * @param queries Query[]
     * @returns Query
     */
    static or(queries: Query[]): Query {
        return new Query(Query.TYPE_OR, '', queries);
    }

    /**
     * Helper method to create Query with and method
     * @param queries Query[]
     * @returns Query
     */
    static and(queries: Query[]): Query {
        return new Query(Query.TYPE_AND, '', queries);
    }

    /**
     * Filters queries by given types
     * @param queries Query[]
     * @param types string[]
     * @returns Query[]
     */
    static getByType(queries: Query[], types: string[]): Query[] {
        return queries.filter(query => types.includes(query.getMethod()));
    }

    /**
     * Groups queries by their type
     * @param queries Query[]
     * @returns GroupByTypeResult
     */
    static groupByType(queries: Query[]): any {
        const filters: Query[] = [];
        const selections: Query[] = [];
        let limit: number | null = null;
        let offset: number | null = null;
        const orderAttributes: string[] = [];
        const orderTypes: any[] = [];
        let cursor: string | null = null;
        let cursorDirection: any | null = null;

        for (const query of queries) {
            const method = query.getMethod();
            const attribute = query.getAttribute();
            const values = query.getValues();

            switch (method) {
                case Query.TYPE_ORDER_ASC:
                case Query.TYPE_ORDER_DESC:
                    if (attribute) {
                        orderAttributes.push(attribute);
                    }
                    orderTypes.push(method === Query.TYPE_ORDER_ASC ? Query.TYPE_ORDER_ASC : Query.TYPE_ORDER_DESC);
                    break;

                case Query.TYPE_LIMIT:
                    if (limit === null && typeof values[0] === 'number') {
                        limit = values[0];
                    }
                    break;

                case Query.TYPE_OFFSET:
                    if (offset === null && typeof values[0] === 'number') {
                        offset = values[0];
                    }
                    break;

                case Query.TYPE_CURSOR_AFTER:
                case Query.TYPE_CURSOR_BEFORE:
                    if (cursor === null && values[0] instanceof Document) {
                        cursor = values[0].getId();
                        cursorDirection = method === Query.TYPE_CURSOR_AFTER ? Query.TYPE_CURSOR_AFTER :
                            Query.TYPE_CURSOR_BEFORE;
                    }
                    break;

                case Query.TYPE_SELECT:
                    selections.push(query.clone());
                    break;

                default:
                    filters.push(query.clone());
                    break;
            }
        }

        return {
            filters,
            selections,
            limit,
            offset,
            orderAttributes,
            orderTypes,
            cursor,
            cursorDirection,
        };
    }

    /**
     * Check if the query can contain nested queries
     * @returns boolean
     */
    isNested(): boolean {
        return Query.LOGICAL_TYPES.includes(this.method);
    }

    /**
     * Get the onArray flag
     * @returns boolean
     */
    onArray(): boolean {
        return this._onArray;
    }

    /**
     * Set the onArray flag
     * @param bool boolean
     */
    setOnArray(bool: boolean): void {
        this._onArray = bool;
    }
}

// Helper function to capitalize the first letter
function capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
}