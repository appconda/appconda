
import { Document } from '../../../Core';
import { Base } from './Base';
import { Query } from '../../Query';
import { UID } from '../UID';

export class Cursor extends Base {
    /**
     * Is valid.
     *
     * Returns true if method is cursorBefore or cursorAfter and value is not null
     *
     * Otherwise, returns false
     *
     * @param value Query
     * @returns {boolean}
     */
    public isValid(value: Query): boolean {
        if (!(value instanceof Query)) {
            return false;
        }

        const method = value.getMethod();

        if (method === Query.TYPE_CURSOR_AFTER || method === Query.TYPE_CURSOR_BEFORE) {
            let cursor = value.getValue();

            if (cursor instanceof Document) {
                cursor = cursor.getId();
            }

            const validator = new UID();
            if (validator.isValid(cursor)) {
                return true;
            }
            this.message = 'Invalid cursor: ' + validator.getDescription();
            return false;
        }

        return false;
    }

    public getMethodType(): string {
        return Base.METHOD_TYPE_CURSOR;
    }
}