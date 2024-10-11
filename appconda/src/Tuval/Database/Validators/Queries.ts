
import { Validator } from "../../../Tuval/Core";
import { Query } from "../Query";
import { Base } from "./Query/Base";


export class Queries extends Validator {
    protected message: string = 'Invalid queries';
    protected validators: Base[];
    protected length: number;

    constructor(validators: Base[] = [], length: number = 0) {
        super();
        this.validators = validators;
        this.length = length;
    }

    public getDescription(): string {
        return this.message;
    }

    public isValid(value: any): boolean {
        if (!Array.isArray(value)) {
            this.message = 'Queries must be an array';
            return false;
        }

        if (this.length && value.length > this.length) {
            return false;
        }

        for (let query of value) {
            if (!(query instanceof Query)) {
                try {
                    query = Query.parse(query);
                } catch (e: any) {
                    this.message = 'Invalid query: ' + e.message;
                    return false;
                }
            }

            if (query.isNested()) {
                if (!this.isValid(query.getValues())) {
                    return false;
                }
            }

            const method = query.getMethod();
            const methodType = (() => {
                switch (method) {
                    case Query.TYPE_SELECT: return Base.METHOD_TYPE_SELECT;
                    case Query.TYPE_LIMIT: return Base.METHOD_TYPE_LIMIT;
                    case Query.TYPE_OFFSET: return Base.METHOD_TYPE_OFFSET;
                    case Query.TYPE_CURSOR_AFTER:
                    case Query.TYPE_CURSOR_BEFORE: return Base.METHOD_TYPE_CURSOR;
                    case Query.TYPE_ORDER_ASC:
                    case Query.TYPE_ORDER_DESC: return Base.METHOD_TYPE_ORDER;
                    case Query.TYPE_EQUAL:
                    case Query.TYPE_NOT_EQUAL:
                    case Query.TYPE_LESSER:
                    case Query.TYPE_LESSER_EQUAL:
                    case Query.TYPE_GREATER:
                    case Query.TYPE_GREATER_EQUAL:
                    case Query.TYPE_SEARCH:
                    case Query.TYPE_IS_NULL:
                    case Query.TYPE_IS_NOT_NULL:
                    case Query.TYPE_BETWEEN:
                    case Query.TYPE_STARTS_WITH:
                    case Query.TYPE_CONTAINS:
                    case Query.TYPE_ENDS_WITH:
                    case Query.TYPE_AND:
                    case Query.TYPE_OR: return Base.METHOD_TYPE_FILTER;
                    default: return '';
                }
            })();

            let methodIsValid = false;
            for (const validator of this.validators) {
                if (validator.getMethodType() !== methodType) {
                    continue;
                }
                if (!validator.isValid(query)) {
                    this.message = 'Invalid query: ' + validator.getDescription();
                    return false;
                }

                methodIsValid = true;
            }

            if (!methodIsValid) {
                this.message = 'Invalid query method: ' + method;
                return false;
            }
        }

        return true;
    }

    public isArray(): boolean {
        return true;
    }

    public getType(): string {
        return Validator.TYPE_OBJECT;
    }
}