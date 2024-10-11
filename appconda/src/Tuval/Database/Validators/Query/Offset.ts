import { Numeric, Range } from '../../../../Tuval/Core';
import { Query } from '../../Query';
import { Base } from './Base';

export class Offset extends Base {
    protected maxOffset: number;

    /**
     * Query constructor
     *
     * @param maxOffset number
     */
    constructor(maxOffset: number = Number.MAX_SAFE_INTEGER) {
        super();
        this.maxOffset = maxOffset;
    }

    /**
     * Is valid.
     *
     * Returns true if method is offset and values are within range.
     *
     * @param value Query
     * @returns {boolean}
     */
    public isValid(value: Query): boolean {
        if (!(value instanceof Query)) {
            return false;
        }

        const method = value.getMethod();

        if (method !== Query.TYPE_OFFSET) {
            this.message = `Query method invalid: ${method}`;
            return false;
        }

        const offset = value.getValue();

        const numericValidator = new Numeric();
        if (!numericValidator.isValid(offset)) {
            this.message = `Invalid limit: ${numericValidator.getDescription()}`;
            return false;
        }

        const rangeValidator = new Range(0, this.maxOffset);
        if (!rangeValidator.isValid(offset)) {
            this.message = `Invalid offset: ${rangeValidator.getDescription()}`;
            return false;
        }

        return true;
    }

    /**
     * Returns what type of query this Validator is for
     */
    public getMethodType(): string {
        return Offset.METHOD_TYPE_OFFSET;
    }
}
