import { Validator } from "../../../../Tuval/Core";


export abstract class Base extends Validator {
    public static METHOD_TYPE_LIMIT: string = 'limit';
    public static METHOD_TYPE_OFFSET: string = 'offset';
    public static METHOD_TYPE_CURSOR: string = 'cursor';
    public static METHOD_TYPE_ORDER: string = 'order';
    public static METHOD_TYPE_FILTER: string = 'filter';
    public static METHOD_TYPE_SELECT: string = 'select';

    protected message: string = 'Invalid query';

    /**
     * Get Description.
     *
     * Returns validator description
     *
     * @returns {string}
     */
    public getDescription(): string {
        return this.message;
    }

    /**
     * Is array
     *
     * Function will return true if object is array.
     *
     * @returns {boolean}
     */
    public isArray(): boolean {
        return false;
    }

    /**
     * Get Type
     *
     * Returns validator type.
     *
     * @returns {string}
     */
    public getType(): string {
        return Validator.TYPE_OBJECT;
    }

    /**
     * Returns what type of query this Validator is for
     */
    abstract getMethodType(): string;
}