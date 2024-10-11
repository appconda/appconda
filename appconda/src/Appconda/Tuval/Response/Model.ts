import { Document } from "../../../Tuval/Core";


export abstract class Model {
    public static readonly TYPE_STRING = 'string';
    public static readonly TYPE_INTEGER = 'integer';
    public static readonly TYPE_FLOAT = 'double';
    public static readonly TYPE_BOOLEAN = 'boolean';
    public static readonly TYPE_JSON = 'json';
    public static readonly TYPE_DATETIME = 'datetime';
    public static readonly TYPE_DATETIME_EXAMPLE = '2020-10-15T06:38:00.000+00:00';
    public static readonly TYPE_RELATIONSHIP = 'relationship';

    protected none: boolean = false;
    protected any: boolean = false;
    protected public: boolean = true;
    protected rules: Record<string, any> = {};
    public conditions: Record<string, any> = {};

    /**
     * Filter Document Structure
     *
     * @param document Document to filter
     * @return Document
     */
    public filter(document: Document): Document {
        return document;
    }

    /**
     * Get Name
     *
     * @return string
     */
    public abstract getName(): string;

    /**
     * Get Type
     *
     * @return string
     */
    public abstract getType(): string;

    /**
     * Get Rules
     *
     * @return Record<string, any>
     */
    public getRules(): Record<string, any> {
        return this.rules;
    }

    /**
     * Add a New Rule
     * If rule is an array of documents with varying models
     *
     * @param key Rule key
     * @param options Rule options
     * @return this
     */
    protected addRule(key: string, options: Record<string, any>): this {
        this.rules[key] = {
            required: true,
            array: false,
            description: '',
            example: '',
            ...options
        };

        return this;
    }

    /**
     * Delete an existing Rule
     * If rule exists, it will be removed
     *
     * @param key Rule key
     * @return this
     */
    protected removeRule(key: string): this {
        delete this.rules[key];
        return this;
    }

    /**
     * Get Required Rules
     *
     * @return string[]
     */
    public getRequired(): string[] {
        return Object.keys(this.rules).filter(key => this.rules[key].required);
    }

    /**
     * Is None
     *
     * Use to check if response is empty
     *
     * @return boolean
     */
    public isNone(): boolean {
        return this.none;
    }

    /**
     * Is Any
     *
     * Use to check if response is a wildcard
     *
     * @return boolean
     */
    public isAny(): boolean {
        return this.any;
    }

    /**
     * Is Public
     *
     * Should this model be publicly available in docs and spec files?
     *
     * @return boolean
     */
    public isPublic(): boolean {
        return this.public;
    }
}