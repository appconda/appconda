
import { TimeLimit as TimeLimitAdapter } from "../TimeLimit";
import { Database as AppcondaDB, Duplicate, Query } from "../../../../Tuval/Database";
import { DateTime } from 'luxon';
import { Authorization, Document } from "../../../../Tuval/Core";

export class TimeLimit extends TimeLimitAdapter {
    public static COLLECTION = 'abuse';

    protected db: AppcondaDB;
    protected _count: number | null = null;

    constructor(key: string, limit: number, seconds: number, db: AppcondaDB) {
        super();
        this.key = key;
        const time = Math.floor(Date.now() / 1000 / seconds) * seconds;
        this._time = DateTime.fromMillis(time * 1000).toISO();
        this._limit = limit;
        this.db = db;
    }

    async setup(): Promise<void> {
        if (!await this.db.exists(this.db.getDatabase())) {
            throw new Error('You need to create database before running timelimit setup');
        }

        const attributes = [
            new Document({
                '$id': 'key',
                'type': AppcondaDB.VAR_STRING,
                'size': AppcondaDB.LENGTH_KEY,
                'required': true,
                'signed': true,
                'array': false,
                'filters': [],
            }),
            new Document({
                '$id': 'time',
                'type': AppcondaDB.VAR_DATETIME,
                'size': 0,
                'required': true,
                'signed': false,
                'array': false,
                'filters': ['datetime'],
            }),
            new Document({
                '$id': 'count',
                'type': AppcondaDB.VAR_INTEGER,
                'size': 11,
                'required': true,
                'signed': false,
                'array': false,
                'filters': [],
            }),
        ];

        const indexes = [
            new Document({
                '$id': 'unique1',
                'type': AppcondaDB.INDEX_UNIQUE,
                'attributes': ['key', 'time'],
                'lengths': [],
                'orders': [],
            }),
            new Document({
                '$id': 'index2',
                'type': AppcondaDB.INDEX_KEY,
                'attributes': ['time'],
                'lengths': [],
                'orders': [],
            }),
        ];

        try {
            await this.db.createCollection(TimeLimit.COLLECTION, attributes, indexes);
        } catch (e) {
            if (!(e instanceof Duplicate)) {
                throw e;
            }
        }
    }

    protected async count(key: string, datetime: string): Promise<number> {
        if (this._limit === 0) {
            return 0;
        }

        if (this._count !== null) {
            return this._count;
        }

        const result = await Authorization.skip(async () => {
            return await this.db.find(TimeLimit.COLLECTION, [
                Query.equal('key', [key]),
                Query.equal('time', [datetime]),
            ]);
        });

        this._count = 0;

        if (result.length === 1) {
            const count = result[0].getAttribute('count', 0);
            if (typeof count === 'number') {
                this._count = count;
            }
        }

        return this._count;
    }

    protected async hit(key: string, datetime: string): Promise<void> {
        if (this._limit === 0) {
            return;
        }

        await Authorization.skip(async () => {
            let data: any = await this.db.findOne(TimeLimit.COLLECTION, [
                Query.equal('key', [key]),
                Query.equal('time', [datetime]),
            ]);

            if (!data) {
                data = {
                    '$permissions': [],
                    'key': key,
                    'time': datetime,
                    'count': 1,
                    '$collection': TimeLimit.COLLECTION,
                } ;

                try {
                    await this.db.createDocument(TimeLimit.COLLECTION, new Document(data));
                } catch (e) {
                    if (e instanceof Duplicate) {
                        data = await this.db.findOne(TimeLimit.COLLECTION, [
                            Query.equal('key', [key]),
                            Query.equal('time', [datetime]),
                        ]);

                        if (data) {
                            const count = data.getAttribute('count', 0);
                            if (typeof count === 'number') {
                                this._count = count;
                            }
                            await this.db.increaseDocumentAttribute(TimeLimit.COLLECTION, data.getId(), 'count');
                        } else {
                            throw new Error('Document Not Found');
                        }
                    } else {
                        throw e;
                    }
                }
            } else {
                await this.db.increaseDocumentAttribute(TimeLimit.COLLECTION, data.getId(), 'count');
            }
        });

        this._count++;
    }

    async getLogs(offset: number | null = null, limit: number | null = 25): Promise<Document[]> {
        const results = await Authorization.skip(async () => {
            const queries = [Query.orderDesc('')];

            if (offset !== null) {
                queries.push(Query.offset(offset));
            }
            if (limit !== null) {
                queries.push(Query.limit(limit));
            }

            return this.db.find(TimeLimit.COLLECTION, queries);
        });

        return results;
    }

    async cleanup(datetime: string): Promise<boolean> {
        await Authorization.skip(async () => {
            let documents;
            do {
                documents = await this.db.find(TimeLimit.COLLECTION, [
                    Query.lessThan('time', datetime),
                ]);

                for (const document of documents) {
                    await this.db.deleteDocument(TimeLimit.COLLECTION, document.getId());
                }
            } while (documents.length > 0);
        });

        return true;
    }
}
