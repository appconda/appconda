import { Numeric, Range } from '../../../../Tuval/Core';
import { Query } from '../../Query';

import { Base } from './Base';

export class Limit extends Base {
    protected maxLimit: number;

    /**
     * Query constructor
     *
     * @param maxLimit number
     */
    constructor(maxLimit: number = Number.MAX_SAFE_INTEGER) {
        super();
        this.maxLimit = maxLimit;
    }

    /**
     * Is valid.
     *
     * Returns true if method is limit and values are within range.
     *
     * @param value Query
     * @returns {boolean}
     */
    public isValid(value: Query): boolean {
        if (!(value instanceof Query)) {
            return false;
        }

        if (value.getMethod() !== Query.TYPE_LIMIT) {
            this.message = `Invalid query method: ${value.getMethod()}`;
            return false;
        }

        const limit = value.getValue();

        const numericValidator = new Numeric();
        if (!numericValidator.isValid(limit)) {
            this.message = `Invalid limit: ${numericValidator.getDescription()}`;
            return false;
        }

        const rangeValidator = new Range(1, this.maxLimit);
        if (!rangeValidator.isValid(limit)) {
            this.message = `Invalid limit: ${rangeValidator.getDescription()}`;
            return false;
        }

        return true;
    }

    /**
     * Returns what type of query this Validator is for
     */
    public getMethodType(): string {
        return Limit.METHOD_TYPE_LIMIT;
    }
}
