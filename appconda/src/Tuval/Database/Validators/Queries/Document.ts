
import { Select } from '../../Validators/Query/Select';
import { Document as AppcondaDocument } from '../../../Core';
import { Queries } from '../Queries';
import { Database } from '../../Database';

export class Document extends Queries {
    constructor(attributes: any[]) {
        attributes.push(new AppcondaDocument({
            '$id': '$id',
            'key': '$id',
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
            new Select(attributes),
        ];

        super(validators);
    }
}