import { DateTime, Exception, Document, Authorization } from '../../Tuval/Core';
import { Database, AuthorizationException, Duplicate as DuplicateException,
     Structure as StructureException, Query } from '../../Tuval/Database';

export class Audit {
    public static readonly COLLECTION = 'audit';

    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    /**
     * Setup database structure.
     */
    public async setup(): Promise<void> {
        if (!await this.db.exists(this.db.getDatabase())) {
            throw new Exception('You need to create the database before running Audit setup');
        }

        const attributes = [
            new Document({
                $id: 'userId',
                type: Database.VAR_STRING,
                size: Database.LENGTH_KEY,
                required: true,
                signed: true,
                array: false,
                filters: [],
            }),
            new Document({
                $id: 'event',
                type: Database.VAR_STRING,
                size: 255,
                required: true,
                signed: true,
                array: false,
                filters: [],
            }),
            new Document({
                $id: 'resource',
                type: Database.VAR_STRING,
                size: 255,
                required: false,
                signed: true,
                array: false,
                filters: [],
            }),
            new Document({
                $id: 'userAgent',
                type: Database.VAR_STRING,
                size: 65534,
                required: true,
                signed: true,
                array: false,
                filters: [],
            }),
            new Document({
                $id: 'ip',
                type: Database.VAR_STRING,
                size: 45,
                required: true,
                signed: true,
                array: false,
                filters: [],
            }),
            new Document({
                $id: 'location',
                type: Database.VAR_STRING,
                size: 45,
                required: false,
                signed: true,
                array: false,
                filters: [],
            }),
            new Document({
                $id: 'time',
                type: Database.VAR_DATETIME,
                format: '',
                size: 0,
                signed: true,
                required: false,
                array: false,
                filters: ['datetime'],
            }),
            new Document({
                $id: 'data',
                type: Database.VAR_STRING,
                size: 16777216,
                required: false,
                signed: true,
                array: false,
                filters: ['json'],
            }),
        ];

        const indexes = [
            new Document({
                $id: 'index2',
                type: Database.INDEX_KEY,
                attributes: ['event'],
                lengths: [],
                orders: [],
            }),
            new Document({
                $id: 'index4',
                type: Database.INDEX_KEY,
                attributes: ['userId', 'event'],
                lengths: [],
                orders: [],
            }),
            new Document({
                $id: 'index5',
                type: Database.INDEX_KEY,
                attributes: ['resource', 'event'],
                lengths: [],
                orders: [],
            }),
            new Document({
                $id: 'index-time',
                type: Database.INDEX_KEY,
                attributes: ['time'],
                lengths: [],
                orders: [Database.ORDER_DESC],
            }),
        ];

        try {
            await this.db.createCollection(Audit.COLLECTION, attributes, indexes);
        } catch (e) {
            if (!(e instanceof DuplicateException)) {
                throw e;
            }
            // Collection already exists
        }
    }

      /**
     * Add event log.
     */
      public async log(userId: string, event: string, resource: string, userAgent: string, ip: string, location: string, data: Record<string, any> = {}): Promise<boolean> {
        await Authorization.skip(async () => {
            await this.db.createDocument(Audit.COLLECTION, new Document({
                $permissions: [],
                userId,
                event,
                resource,
                userAgent,
                ip,
                location,
                data,
                time: DateTime.now(),
            }));
        });

        return true;
    }

    /**
     * Get all logs by user ID.
     */
    public async getLogsByUser(userId: string, limit: number | null = null, offset: number | null = null, orderAfter: Document | null = null): Promise<Document[]> {
        return await Authorization.skip(async () => {
            const queries = [
                Query.equal('userId', [userId]),
                Query.orderDesc(''),
            ];

            if (limit !== null) {
                queries.push(Query.limit(limit));
            }
            if (offset !== null) {
                queries.push(Query.offset(offset));
            }
            if (orderAfter !== null) {
                queries.push(Query.cursorAfter(orderAfter));
            }

            return await this.db.find(Audit.COLLECTION, queries);
        });
    }

    /**
     * Count logs by user ID.
     */
    public async countLogsByUser(userId: string): Promise<number> {
        return await Authorization.skip(async () => {
            return await this.db.count(Audit.COLLECTION, [Query.equal('userId', [userId])]);
        });
    }

    /**
     * Get all logs by resource.
     */
    public async getLogsByResource(resource: string, limit: number | null = 25, offset: number | null = null, orderAfter: Document | null = null): Promise<Document[]> {
        return await Authorization.skip(async () => {
            const queries = [
                Query.equal('resource', [resource]),
                Query.orderDesc(''),
            ];

            if (limit !== null) {
                queries.push(Query.limit(limit));
            }
            if (offset !== null) {
                queries.push(Query.offset(offset));
            }
            if (orderAfter !== null) {
                queries.push(Query.cursorAfter(orderAfter));
            }

            return await this.db.find(Audit.COLLECTION, queries);
        });
    }

    /**
     * Count logs by resource.
     */
    public async countLogsByResource(resource: string): Promise<number> {
        return await Authorization.skip(async () => {
            return await this.db.count(Audit.COLLECTION, [Query.equal('resource', [resource])]);
        });
    }

    /**
     * Get logs by user and events.
     */
    public async getLogsByUserAndEvents(userId: string, events: string[], limit: number | null = null, offset: number | null = null, orderAfter: Document | null = null): Promise<Document[]> {
        return await Authorization.skip(async () => {
            const queries = [
                Query.equal('userId', [userId]),
                Query.equal('event', events),
                Query.orderDesc(''),
            ];

            if (limit !== null) {
                queries.push(Query.limit(limit));
            }
            if (offset !== null) {
                queries.push(Query.offset(offset));
            }
            if (orderAfter !== null) {
                queries.push(Query.cursorAfter(orderAfter));
            }

            return await this.db.find(Audit.COLLECTION, queries);
        });
    }

    /**
     * Count logs by user and events.
     */
    public async countLogsByUserAndEvents(userId: string, events: string[]): Promise<number> {
        return await Authorization.skip(async () => {
            return await this.db.count(Audit.COLLECTION, [
                Query.equal('userId', [userId]),
                Query.equal('event', events),
            ]);
        });
    }

    /**
     * Get logs by resource and events.
     */
    public async getLogsByResourceAndEvents(resource: string, events: string[], limit: number | null = null, offset: number | null = null, orderAfter: Document | null = null): Promise<Document[]> {
        return await Authorization.skip(async () => {
            const queries = [
                Query.equal('resource', [resource]),
                Query.equal('event', events),
                Query.orderDesc(''),
            ];

            if (limit !== null) {
                queries.push(Query.limit(limit));
            }
            if (offset !== null) {
                queries.push(Query.offset(offset));
            }
            if (orderAfter !== null) {
                queries.push(Query.cursorAfter(orderAfter));
            }

            return await this.db.find(Audit.COLLECTION, queries);
        });
    }

    /**
     * Count logs by resource and events.
     */
    public async countLogsByResourceAndEvents(resource: string, events: string[]): Promise<number> {
        return await Authorization.skip(async () => {
            return await this.db.count(Audit.COLLECTION, [
                Query.equal('resource', [resource]),
                Query.equal('event', events),
            ]);
        });
    }

    /**
     * Delete all logs older than `$datetime`
     */
    public async cleanup(datetime: string): Promise<boolean> {
        await Authorization.skip(async () => {
            let documents;
            do {
                documents = await this.db.find(Audit.COLLECTION, [
                    Query.lessThan('time', datetime),
                ]);

                for (const document of documents) {
                    await this.db.deleteDocument(Audit.COLLECTION, document.$id);
                }
            } while (documents.length > 0);
        });

        return true;
    }
}