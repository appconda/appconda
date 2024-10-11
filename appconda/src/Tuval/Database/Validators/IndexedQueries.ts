
import { Database } from '../Database';
import { Document } from '../../Core';
import { Query } from '../Query';
import { Queries } from './Queries';
import { Base } from './Query/Base';


export class IndexedQueries extends Queries {
    protected attributes: Document[] = [];
    protected indexes: Document[] = [];

    constructor(attributes: Document[] = [], indexes: Document[] = [], validators: Base[] = []) {
        super(validators);
        this.attributes = attributes;

        this.indexes.push(new Document({
            'type': Database.INDEX_UNIQUE,
            'attributes': ['$id']
        }));

        this.indexes.push(new Document({
            'type': Database.INDEX_KEY,
            'attributes': ['$createdAt']
        }));

        this.indexes.push(new Document({
            'type': Database.INDEX_KEY,
            'attributes': ['$updatedAt']
        }));

        for (const index of indexes) {
            this.indexes.push(index);
        }
    }

    public isValid(value: any): boolean {
        if (!super.isValid(value)) {
            return false;
        }

        const queries: Query[] = [];
        for (let query of value) {
            if (!(query instanceof Query)) {
                query = Query.parse(query);
            }
            queries.push(query);
        }

        const grouped = Query.groupByType(queries);
        const filters = grouped.filters;

        for (const filter of filters) {
            if (filter.getMethod() === Query.TYPE_SEARCH) {
                let matched = false;

                for (const index of this.indexes) {
                    if (
                        index.getAttribute('type') === Database.INDEX_FULLTEXT &&
                        index.getAttribute('attributes').includes(filter.getAttribute())
                    ) {
                        matched = true;
                        break;
                    }
                }

                if (!matched) {
                    this.message = `Searching by attribute "${filter.getAttribute()}" requires a fulltext index.`;
                    return false;
                }
            }
        }

        return true;
    }
}