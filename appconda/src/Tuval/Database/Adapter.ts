import { Database } from './Database';
import {Exception as DatabaseException } from './Exception';
import {Duplicate as DuplicateException } from './Exceptions/Duplicate';
import {Timeout as TimeoutException } from './Exceptions/Timeout';

export abstract class Adapter {
    protected database: string = '';
    protected namespace: string = '';
    protected sharedTables: boolean = false;
    protected tenant: number | null = null;
    protected _inTransaction: number = 0;
    protected debug: Record<string, any> = {};
    protected transformations: Record<string, Array<Function>> = {
        '*': [],
    };
    protected metadata: Record<string, any> = {};

    public setDebug(key: string, value: any): this {
        this.debug[key] = value;
        return this;
    }

    public getDebug(): Record<string, any> {
        return this.debug;
    }

    public resetDebug(): this {
        this.debug = {};
        return this;
    }

    public setNamespace(namespace: string): boolean {
        this.namespace = this.filter(namespace);
        return true;
    }

    public getNamespace(): string {
        return this.namespace;
    }

    public setDatabase(name: string): boolean {
        this.database = this.filter(name);
        return true;
    }

    public getDatabase(): string {
        if (!this.database) {
            throw new DatabaseException('Missing database. Database must be set before use.');
        }
        return this.database;
    }

    public setSharedTables(sharedTables: boolean): boolean {
        this.sharedTables = sharedTables;
        return true;
    }

    public getSharedTables(): boolean {
        return this.sharedTables;
    }

    public setTenant(tenant: number | null): boolean {
        this.tenant = tenant;
        return true;
    }

    public getTenant(): number | null {
        return this.tenant;
    }

    public setMetadata(key: string, value: any): this {
        this.metadata[key] = value;

        let output = '';
        for (const [key, value] of Object.entries(this.metadata)) {
            output += `/* ${key}: ${value} */\n`;
        }

        this.before(Database.EVENT_ALL, 'metadata', (query) => output + query);

        return this;
    }

    public getMetadata(): Record<string, any> {
        return this.metadata;
    }

    public resetMetadata(): this {
        this.metadata = {};
        return this;
    }

    public abstract startTransaction(): Promise<boolean>;
    public abstract commitTransaction(): Promise<boolean>;
    public abstract rollbackTransaction(): Promise<boolean>;

    public inTransaction(): boolean {
        return this._inTransaction > 0;
    }

    public async withTransaction<T>(callback: () => T): Promise<T> {
        this.startTransaction();

        try {
            const result = await callback();
            this.commitTransaction();
            return result;
        } catch (e) {
            this.rollbackTransaction();
            throw e;
        }
    }

    public before(event: string, name: string = '', callback: Function | null = null): this {
        if (!this.transformations[event]) {
            this.transformations[event] = [];
        }

        if (callback === null) {
            delete this.transformations[event][name];
        } else {
            this.transformations[event][name] = callback;
        }

        return this;
    }

    protected trigger(event: string, query: any): any {
        for (const callback of this.transformations[Database.EVENT_ALL] || []) {
            query = callback(query);
        }
        for (const callback of this.transformations[event] || []) {
            query = callback(query);
        }

        return query;
    }

    public abstract ping(): Promise<boolean>;
    public abstract create(name: string): Promise<boolean>;
    public abstract exists(database: string, collection?: string): Promise<boolean>;
    public abstract list(): Promise<Array<any>>;
    public abstract delete(name: string): Promise<boolean>;
    public abstract createCollection(name: string, attributes?: Array<any>, indexes?: Array<any>): Promise<boolean>;
    public abstract deleteCollection(id: string): Promise<boolean>;
    public abstract createAttribute(collection: string, id: string, type: string, size: number, signed?: boolean, array?: boolean): Promise<boolean>;
    public abstract updateAttribute(collection: string, id: string, type: string, size: number, signed?: boolean, array?: boolean, newKey?: string): Promise<boolean>;
    public abstract deleteAttribute(collection: string, id: string): Promise<boolean>;
    public abstract renameAttribute(collection: string, oldId: string, newId: string): Promise<boolean>;
    public abstract createRelationship(collection: string, relatedCollection: string, type: string, twoWay?: boolean, id?: string, twoWayKey?: string): Promise<boolean>;
    public abstract updateRelationship(collection: string, relatedCollection: string, type: string, twoWay: boolean, key: string, twoWayKey: string, side: string, newKey?: string, newTwoWayKey?: string): Promise<boolean>;
    public abstract deleteRelationship(collection: string, relatedCollection: string, type: string, twoWay: boolean, key: string, twoWayKey: string, side: string): Promise<boolean>;
    public abstract renameIndex(collection: string, old: string, newId: string): Promise<boolean>;
    public abstract createIndex(collection: string, id: string, type: string, attributes: Array<string>, lengths: Array<number>, orders: Array<string>): Promise<boolean>;
    public abstract deleteIndex(collection: string, id: string): Promise<boolean>;
    public abstract getDocument(collection: string, id: string, queries?: Array<any>, forUpdate?: boolean): Promise<any>;
    public abstract createDocument(collection: string, document: any): Promise<any>;
    public abstract createDocuments(collection: string, documents: Array<any>, batchSize: number): Promise<Array<any>>;
    public abstract updateDocument(collection: string, document: any): Promise<any>;
    public abstract updateDocuments(collection: string, documents: Array<any>, batchSize: number): Promise<Array<any>>;
    public abstract deleteDocument(collection: string, id: string): Promise<boolean>;
    public abstract find(collection: string, queries?: Array<any>, limit?: number, offset?: number, orderAttributes?: Array<string>, orderTypes?: Array<string>, cursor?: Record<string, any>, cursorDirection?: string): Promise<Array<any>>;
    public abstract sum(collection: string, attribute: string, queries?: Array<any>, max?: number): Promise<number>;
    public abstract count(collection: string, queries?: Array<any>, max?: number): Promise<number>;
    public abstract getSizeOfCollection(collection: string): Promise<number>;
    public abstract getLimitForString(): number;
    public abstract getLimitForInt(): number;
    public abstract getLimitForAttributes(): number;
    public abstract getLimitForIndexes(): number;
    public abstract getSupportForSchemas(): boolean;
    public abstract getSupportForAttributes(): boolean;
    public abstract getSupportForIndex(): boolean;
    public abstract getSupportForUniqueIndex(): boolean;
    public abstract getSupportForFulltextIndex(): boolean;
    public abstract getSupportForFulltextWildcardIndex(): Promise<boolean>;
    public abstract getSupportForCasting(): boolean;
    public abstract getSupportForQueryContains(): boolean;
    public abstract getSupportForTimeouts(): Promise<boolean>;
    public abstract getSupportForRelationships(): boolean;
    public abstract getSupportForUpdateLock(): boolean;
    public abstract getSupportForAttributeResizing(): boolean;
    public abstract getCountOfAttributes(collection: any): number;
    public abstract getCountOfIndexes(collection: any): number;
    public abstract  getCountOfDefaultAttributes(): number;
    public abstract getCountOfDefaultIndexes(): number;
    public abstract getDocumentSizeLimit(): number;
    public abstract getAttributeWidth(collection: any): number;
    public abstract getKeywords(): Array<string>;
    protected abstract getAttributeProjection(selections: Array<string>, prefix?: string): Promise<any>;

    protected getAttributeSelections(queries: Array<any>): Array<string> {
        const selections: Array<string> = [];

        for (const query of queries) {
            if (query.getMethod() === 'select') {
                selections.push(...query.getValues());
            }
        }

        return selections;
    }

    public filter(value: string): string {
        const filtered = value.replace(/[^A-Za-z0-9_\-]/g, '');

        if (filtered === null) {
            throw new DatabaseException('Failed to filter key');
        }

        return filtered;
    }

    public escapeWildcards(value: string): string {
        const wildcards = [
            '%', '_', '[', ']', '^', '-', '.', '*', '+', '?', '(', ')', '{', '}', '|'
        ];

        for (const wildcard of wildcards) {
            value = value.replace(new RegExp(`\\${wildcard}`, 'g'), `\\${wildcard}`);
        }

        return value;
    }

    public abstract increaseDocumentAttribute(collection: string, id: string, attribute: string, value: number, updatedAt: string, min?: number, max?: number): Promise<boolean>;
    public abstract getMaxIndexLength(): number;

    public abstract setTimeout(milliseconds: number, event?: string): void;

    public clearTimeout(event: string): void {
        this.before(event, 'timeout', null);
    }
}