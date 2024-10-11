
import { Database } from '../../Database';
import { Document as AppcondaDocument } from '../../../Core';
import { Cursor } from '../../Validators/Query/Cursor';
import { Filter } from '../../Validators/Query/Filter';
import { Limit } from '../../Validators/Query/Limit';
import { Offset } from '../../Validators/Query/Offset';
import { Order } from '../../Validators/Query/Order';
import { Select } from '../../Validators/Query/Select';
import { IndexedQueries } from '../IndexedQueries';

export class Documents extends IndexedQueries {
    constructor(attributes: any[], indexes: any[]) {
        attributes.push(new AppcondaDocument({
            '$id': '$id',
            'key': '$id',
            'type': Database.VAR_STRING,
            'array': false,
        }));
        attributes.push(new AppcondaDocument({
            '$id': '$internalId',
            'key': '$internalId',
            'type': Database.VAR_STRING,
            'array': false,
        }));
        attributes.push(new AppcondaDocument({
            '$id': '$createdAt',
            'key': '$createdAt',
            'type': Database.VAR_DATETIME,
            'array': false,
        }));
        attributes.push(new AppcondaDocument({
            '$id': '$updatedAt',
            'key': '$updatedAt',
            'type': Database.VAR_DATETIME,
            'array': false,
        }));

        const validators = [
            new Limit(),
            new Offset(),
            new Cursor(),
            new Filter(attributes),
            new Order(attributes),
            new Select(attributes),
        ];

        super(attributes, indexes, validators);
    }
}