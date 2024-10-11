

import { Query } from './Query';

import md5 from 'md5';

import { Exception as DatabaseException } from './Exception';
import { Adapter } from './Adapter';
import { Permission } from './Helpers/Permission';
import { Role } from './Helpers/Role';
import { Permissions } from './Validators/Permissions';
import { Document as DocumentValidator } from './Validators/Queries/Document';
import { Documents as DocumentsValidator } from './Validators/Queries/Documents';
import { Duplicate as DuplicateException } from './Exceptions/Duplicate';
import { LimitException as LimitException } from './Exceptions/Limit';
import { QueryException } from './Exceptions/Query';
import { Timeout as TimeoutException } from './Exceptions/Timeout';
import { Conflict as ConflictException } from './Exceptions/Conflict';
import { Restricted as RestrictedException } from './Exceptions/Restricted';

import { StructureException } from './Exceptions/Structure';
import { Relationship as RelationshipException } from './Exceptions/Relationship';
import { AuthorizationException as AuthorizationException } from './Exceptions/Authorization';
import { Index } from './Validators/Index';
import { ID } from './Helpers/ID';
import { Structure } from './Validators/Structure';
import { DateTime } from './DateTime';
import { Cache } from '../../Tuval/Cache';
import { Authorization, Document } from '../Core';


export class Database {
    public static readonly VAR_STRING = 'string';
    public static readonly VAR_INTEGER = 'integer';
    public static readonly VAR_FLOAT = 'double';
    public static readonly VAR_BOOLEAN = 'boolean';
    public static readonly VAR_DATETIME = 'datetime';

    public static readonly INT_MAX = 2147483647;
    public static readonly BIG_INT_MAX = Number.MAX_SAFE_INTEGER;
    public static readonly DOUBLE_MAX = Number.MAX_VALUE;

    public static readonly VAR_RELATIONSHIP = 'relationship';

    public static readonly INDEX_KEY = 'key';
    public static readonly INDEX_FULLTEXT = 'fulltext';
    public static readonly INDEX_UNIQUE = 'unique';
    public static readonly INDEX_SPATIAL = 'spatial';
    public static readonly ARRAY_INDEX_LENGTH = 255;

    public static readonly RELATION_ONE_TO_ONE = 'oneToOne';
    public static readonly RELATION_ONE_TO_MANY = 'oneToMany';
    public static readonly RELATION_MANY_TO_ONE = 'manyToOne';
    public static readonly RELATION_MANY_TO_MANY = 'manyToMany';

    public static readonly RELATION_MUTATE_CASCADE = 'cascade';
    public static readonly RELATION_MUTATE_RESTRICT = 'restrict';
    public static readonly RELATION_MUTATE_SET_NULL = 'setNull';

    public static readonly RELATION_SIDE_PARENT = 'parent';
    public static readonly RELATION_SIDE_CHILD = 'child';

    public static readonly RELATION_MAX_DEPTH = 3;

    public static readonly ORDER_ASC = 'ASC';
    public static readonly ORDER_DESC = 'DESC';

    public static readonly PERMISSION_CREATE = 'create';
    public static readonly PERMISSION_READ = 'read';
    public static readonly PERMISSION_UPDATE = 'update';
    public static readonly PERMISSION_DELETE = 'delete';

    public static readonly PERMISSION_WRITE = 'write';

    public static readonly PERMISSIONS = [
        Database.PERMISSION_CREATE,
        Database.PERMISSION_READ,
        Database.PERMISSION_UPDATE,
        Database.PERMISSION_DELETE,
    ];

    public static readonly METADATA = '_metadata';

    public static readonly CURSOR_BEFORE = 'before';
    public static readonly CURSOR_AFTER = 'after';

    public static readonly LENGTH_KEY = 255;

    public static readonly TTL = 60 * 60 * 24; // 24 hours

    public static readonly EVENT_ALL = '*';

    public static readonly EVENT_DATABASE_LIST = 'database_list';
    public static readonly EVENT_DATABASE_CREATE = 'database_create';
    public static readonly EVENT_DATABASE_DELETE = 'database_delete';

    public static readonly EVENT_COLLECTION_LIST = 'collection_list';
    public static readonly EVENT_COLLECTION_CREATE = 'collection_create';
    public static readonly EVENT_COLLECTION_UPDATE = 'collection_update';
    public static readonly EVENT_COLLECTION_READ = 'collection_read';
    public static readonly EVENT_COLLECTION_DELETE = 'collection_delete';

    public static readonly EVENT_DOCUMENT_FIND = 'document_find';
    public static readonly EVENT_DOCUMENT_CREATE = 'document_create';
    public static readonly EVENT_DOCUMENTS_CREATE = 'documents_create';
    public static readonly EVENT_DOCUMENT_READ = 'document_read';
    public static readonly EVENT_DOCUMENT_UPDATE = 'document_update';
    public static readonly EVENT_DOCUMENTS_UPDATE = 'documents_update';
    public static readonly EVENT_DOCUMENT_DELETE = 'document_delete';
    public static readonly EVENT_DOCUMENT_COUNT = 'document_count';
    public static readonly EVENT_DOCUMENT_SUM = 'document_sum';
    public static readonly EVENT_DOCUMENT_INCREASE = 'document_increase';
    public static readonly EVENT_DOCUMENT_DECREASE = 'document_decrease';

    public static readonly EVENT_PERMISSIONS_CREATE = 'permissions_create';
    public static readonly EVENT_PERMISSIONS_READ = 'permissions_read';
    public static readonly EVENT_PERMISSIONS_DELETE = 'permissions_delete';

    public static readonly EVENT_ATTRIBUTE_CREATE = 'attribute_create';
    public static readonly EVENT_ATTRIBUTE_UPDATE = 'attribute_update';
    public static readonly EVENT_ATTRIBUTE_DELETE = 'attribute_delete';

    public static readonly EVENT_INDEX_RENAME = 'index_rename';
    public static readonly EVENT_INDEX_CREATE = 'index_create';
    public static readonly EVENT_INDEX_DELETE = 'index_delete';

    public static readonly INSERT_BATCH_SIZE = 100;

    protected adapter: Adapter;
    protected cache: Cache;
    protected cacheName: string = 'default';

    protected map: Record<string, boolean | string> = {};

    public static readonly INTERNAL_ATTRIBUTES = [
        new Document({
            '$id': '$id',
            'type': Database.VAR_STRING,
            'size': Database.LENGTH_KEY,
            'required': true,
            'signed': true,
            'array': false,
            'filters': [],
        }),
        new Document({
            '$id': '$internalId',
            'type': Database.VAR_STRING,
            'size': Database.LENGTH_KEY,
            'required': true,
            'signed': true,
            'array': false,
            'filters': [],
        }),
        new Document({
            '$id': '$collection',
            'type': Database.VAR_STRING,
            'size': Database.LENGTH_KEY,
            'required': true,
            'signed': true,
            'array': false,
            'filters': [],
        }),
        new Document({
            '$id': '$tenant',
            'type': Database.VAR_INTEGER,
            'size': 0,
            'required': false,
            'default': null,
            'signed': true,
            'array': false,
            'filters': [],
        }),
        new Document({
            '$id': '$createdAt',
            'type': Database.VAR_DATETIME,
            'format': '',
            'size': 0,
            'signed': false,
            'required': false,
            'default': null,
            'array': false,
            'filters': ['datetime']
        }),
        new Document({
            '$id': '$updatedAt',
            'type': Database.VAR_DATETIME,
            'format': '',
            'size': 0,
            'signed': false,
            'required': false,
            'default': null,
            'array': false,
            'filters': ['datetime']
        }),
        new Document({
            '$id': '$permissions',
            'type': Database.VAR_STRING,
            'size': 1000000,
            'signed': true,
            'required': false,
            'default': [],
            'array': false,
            'filters': ['json']
        }),
    ];

    public static readonly INTERNAL_INDEXES = [
        '_id',
        '_uid',
        '_createdAt',
        '_updatedAt',
        '_permissions_id',
        '_permissions',
    ];

    protected static readonly COLLECTION = new Document({
        '$id': Database.METADATA,
        '$collection': Database.METADATA,
        'name': 'collections',
        'attributes': [
            new Document({
                '$id': 'name',
                'key': 'name',
                'type': Database.VAR_STRING,
                'size': 256,
                'required': true,
                'signed': true,
                'array': false,
                'filters': [],
            }),
            new Document({
                '$id': 'attributes',
                'key': 'attributes',
                'type': Database.VAR_STRING,
                'size': 1000000,
                'required': false,
                'signed': true,
                'array': false,
                'filters': ['json'],
            }),
            new Document({
                '$id': 'indexes',
                'key': 'indexes',
                'type': Database.VAR_STRING,
                'size': 1000000,
                'required': false,
                'signed': true,
                'array': false,
                'filters': ['json'],
            }),
            new Document({
                '$id': 'documentSecurity',
                'key': 'documentSecurity',
                'type': Database.VAR_BOOLEAN,
                'size': 0,
                'required': true,
                'signed': true,
                'array': false,
                'filters': []
            }),
        ],
        'indexes': [],
    });

    protected static filters: Record<string, { encode: Function, decode: Function }> = {};

    protected instanceFilters: Record<string, { encode: Function, decode: Function }> = {};

    protected listeners: Record<string, Record<string, (event: string, args: any) => void>> = {
        '*': {},
    };

    protected silentListeners: Record<string, boolean> | null = {};

    protected timestamp: Date | null = null;

    protected resolveRelationships: boolean = true;

    protected relationshipFetchDepth: number = 1;

    protected filter: boolean = true;

    protected validate: boolean = true;

    protected preserveDates: boolean = false;

    protected relationshipWriteStack: string[] = [];

    protected relationshipFetchStack: Document[] = [];

    protected relationshipDeleteStack: Document[] = [];

    constructor(adapter: Adapter, cache: Cache, filters: Record<string, { encode: (value: any) => any, decode: (value: any) => any }> = {}) {
        this.adapter = adapter;
        this.cache = cache;
        this.instanceFilters = filters;

        Database.addFilter(
            'json',
            async (value: any) => {
                value = (value instanceof Document) ? value.getArrayCopy() : value;

                if (Array.isArray(value) && value.length > 0 && value[0] instanceof Document) {
                    return JSON.stringify(value.map(item => item.getArrayCopy()));
                }
                else if (!Array.isArray(value) && typeof value !== 'object') {
                    return value;
                }

                return JSON.stringify(value);
            },
            async (value: any) => {
                if (typeof value !== 'string') {
                    return value;
                }

                value = JSON.parse(value) ?? [];

                if ('$id' in value) {
                    return new Document(value);
                } else if (Array.isArray(value)) {
                    value = value.map((item: any) => {
                        if (typeof item === 'object' && '$id' in item) {
                            return new Document(item);
                        }
                        return item;
                    });
                }

                return value;
            }
        );

        Database.addFilter(
            'datetime',
            async (value: string | null) => {
                if (value === null) {
                    return null;
                }
                try {
                    const date = new Date(value);
                    const pad = (num: number) => (num < 10 ? '0' : '') + num;

                    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
                        `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

                } catch (error) {
                    return value;
                }
            },
            async (value: string | null) => {
                return value;
            }
        );
    }

    public on(event: string, name: string, callback: (event: string, args: any) => void): this {
        if (!this.listeners[event]) {
            this.listeners[event] = {};
        }
        this.listeners[event][name] = callback;

        return this;
    }

    public before(event: string, name: string, callback: (event: string, args: any) => void): this {
        this.adapter.before(event, name, callback);

        return this;
    }

    public async silent<T>(callback: () => T, listeners: string[] | null = null): Promise<T> {
        const previous = this.silentListeners;

        if (listeners === null) {
            this.silentListeners = null;
        } else {
            const silentListeners: Record<string, boolean> = {};
            for (const listener of listeners) {
                silentListeners[listener] = true;
            }
            this.silentListeners = silentListeners;
        }

        try {
            return await callback();
        } finally {
            this.silentListeners = previous;
        }
    }

    public async skipRelationships<T>(callback: () => Promise<T>): Promise<T> {
        const previous = this.resolveRelationships;
        this.resolveRelationships = false;

        try {
            return await callback();
        } finally {
            this.resolveRelationships = previous;
        }
    }

    protected trigger(event: string, args: any = null): void {
        if (this.silentListeners === null) {
            return;
        }
        for (const [name, callback] of Object.entries(this.listeners[Database.EVENT_ALL] || {})) {
            if (this.silentListeners[name]) {
                continue;
            }
            callback(event, args);
        }

        for (const [name, callback] of Object.entries(this.listeners[event] || {})) {
            if (this.silentListeners[name]) {
                continue;
            }
            callback(event, args);
        }
    }

    public withRequestTimestamp<T>(requestTimestamp: Date | null, callback: () => T): T {
        const previous = this.timestamp;
        this.timestamp = requestTimestamp;
        try {
            return callback();
        } finally {
            this.timestamp = previous;
        }
    }

    public setNamespace(namespace: string): this {
        this.adapter.setNamespace(namespace);

        return this;
    }

    public getNamespace(): string {
        return this.adapter.getNamespace();
    }

    public setDatabase(name: string): this {
        this.adapter.setDatabase(name);

        return this;
    }

    public getDatabase(): string {
        return this.adapter.getDatabase();
    }

    public setCache(cache: Cache): this {
        this.cache = cache;
        return this;
    }

    public getCache(): Cache {
        return this.cache;
    }

    public setCacheName(name: string): this {
        this.cacheName = name;

        return this;
    }

    public getCacheName(): string {
        return this.cacheName;
    }

    public setMetadata(key: string, value: any): this {
        this.adapter.setMetadata(key, value);

        return this;
    }

    public getMetadata(): Record<string, any> {
        return this.adapter.getMetadata();
    }

    public resetMetadata(): void {
        this.adapter.resetMetadata();
    }

    public setTimeout(milliseconds: number, event: string = Database.EVENT_ALL): this {
        this.adapter.setTimeout(milliseconds, event);

        return this;
    }

    public clearTimeout(event: string = Database.EVENT_ALL): void {
        this.adapter.clearTimeout(event);
    }

    public enableFilters(): this {
        this.filter = true;

        return this;
    }

    public disableFilters(): this {
        this.filter = false;

        return this;
    }

    public getInstanceFilters(): Record<string, { encode: Function, decode: Function }> {
        return this.instanceFilters;
    }

    public enableValidation(): this {
        this.validate = true;

        return this;
    }

    public disableValidation(): this {
        this.validate = false;

        return this;
    }

    public skipValidation<T>(callback: () => T): T {
        const initial = this.validate;
        this.disableValidation();

        try {
            return callback();
        } finally {
            this.validate = initial;
        }
    }

    public setSharedTables(sharedTables: boolean): this {
        this.adapter.setSharedTables(sharedTables);

        return this;
    }

    public setTenant(tenant: number | null): this {
        this.adapter.setTenant(tenant);

        return this;
    }

    public setPreserveDates(preserve: boolean): this {
        this.preserveDates = preserve;

        return this;
    }

    public getKeywords(): string[] {
        return this.adapter.getKeywords();
    }

    public getAdapter(): Adapter {
        return this.adapter;
    }

    public startTransaction(): Promise<boolean> {
        return this.adapter.startTransaction();
    }

    public commitTransaction(): Promise<boolean> {
        return this.adapter.commitTransaction();
    }

    public rollbackTransaction(): Promise<boolean> {
        return this.adapter.rollbackTransaction();
    }

    public async withTransaction<T>(callback: () => T): Promise<T> {
        return await this.adapter.withTransaction(callback);
    }

    public ping(): Promise<boolean> {
        return this.adapter.ping();
    }

    public async create(database: string | null = null): Promise<boolean> {
        if (this.adapter.getSharedTables() && !this.adapter.getTenant()) {
            throw new Error('Missing tenant. Tenant must be set when table sharing is enabled.');
        }

        database = database ?? this.adapter.getDatabase();
        await this.adapter.create(database);

        const attributes = Database.COLLECTION.getAttribute('attributes').map(attribute => new Document(attribute));

        await this.silent(async () => await this.createCollection(Database.METADATA, attributes));

        this.trigger(Database.EVENT_DATABASE_CREATE, database);

        return true;
    }

    public async exists(database: string | null = null, collection?: string): Promise<boolean> {
        if (this.adapter.getSharedTables() && !this.adapter.getTenant()) {
            throw new Error('Missing tenant. Tenant must be set when table sharing is enabled.');
        }

        database = database ?? this.adapter.getDatabase();

        return await this.adapter.exists(database, collection);
    }

    public async list(): Promise<Document[]> {
        if (this.adapter.getSharedTables() && !this.adapter.getTenant()) {
            throw new Error('Missing tenant. Tenant must be set when table sharing is enabled.');
        }

        const databases = await this.adapter.list();

        this.trigger(Database.EVENT_DATABASE_LIST, databases);

        return databases;
    }

    public async delete(database: string | null = null): Promise<boolean> {
        if (this.adapter.getSharedTables() && !this.adapter.getTenant()) {
            throw new Error('Missing tenant. Tenant must be set when table sharing is enabled.');
        }

        database = database ?? this.adapter.getDatabase();

        const deleted = await this.adapter.delete(database);

        this.trigger(Database.EVENT_DATABASE_DELETE, {
            name: database,
            deleted: deleted
        });

        return deleted;
    }

    public async createCollection(
        id: string,
        attributes: Document[] = [],
        indexes: Document[] = [],
        permissions: string[] | null = null,
        documentSecurity: boolean = true
    ): Promise<Document> {
        if (this.adapter.getSharedTables() && !this.adapter.getTenant()) {
            throw new DatabaseException('Missing tenant. Tenant must be set when table sharing is enabled.');
        }

        permissions ??= [Permission.create(Role.any())];

        if (this.validate) {
            const validator = new Permissions();
            if (!validator.isValid(permissions)) {
                throw new DatabaseException(validator.getDescription());
            }
        }

        const collection = await this.silent(async () => await this.getCollection(id));

        if (!collection.isEmpty() && id !== Database.METADATA) {
            throw new DuplicateException(`Collection ${id} already exists`);
        }

        const newCollection = new Document({
            $id: ID.custom(id),
            $permissions: permissions,
            name: id,
            attributes: attributes,
            indexes: indexes,
            documentSecurity: documentSecurity
        });

        if (this.validate) {
            const validator = new Index(
                attributes,
                this.adapter.getMaxIndexLength()
            );
            for (const index of indexes) {
                if (!validator.isValid(index)) {
                    throw new DatabaseException(validator.getDescription());
                }
            }
        }

        await this.adapter.createCollection(id, attributes, indexes);

        if (id === Database.METADATA) {
            return new Document(Database.COLLECTION);
        }

        // Check index limits, if given
        if (indexes.length && this.adapter.getCountOfIndexes(collection) > this.adapter.getLimitForIndexes()) {
            throw new LimitException(`Index limit of ${this.adapter.getLimitForIndexes()} exceeded. Cannot create collection.`);
        }

        // Check attribute limits, if given
        if (attributes.length) {
            if (
                this.adapter.getLimitForAttributes() > 0 &&
                this.adapter.getCountOfAttributes(collection) > this.adapter.getLimitForAttributes()
            ) {
                throw new LimitException(`Column limit of ${this.adapter.getLimitForAttributes()} exceeded. Cannot create collection.`);
            }

            if (
                this.adapter.getDocumentSizeLimit() > 0 &&
                this.adapter.getAttributeWidth(collection) > this.adapter.getDocumentSizeLimit()
            ) {
                throw new LimitException(`Row width limit of ${this.adapter.getDocumentSizeLimit()} exceeded. Cannot create collection.`);
            }
        }

        const createdCollection = await this.silent(async () => await this.createDocument(Database.METADATA, newCollection));

        this.trigger(Database.EVENT_COLLECTION_CREATE, createdCollection);

        return createdCollection;
    }

    public async updateCollection(
        id: string,
        permissions: string[],
        documentSecurity: boolean
    ): Promise<Document> {
        if (this.adapter.getSharedTables() && !this.adapter.getTenant()) {
            throw new DatabaseException('Missing tenant. Tenant must be set when table sharing is enabled.');
        }

        if (this.validate) {
            const validator = new Permissions();
            if (!validator.isValid(permissions)) {
                throw new DatabaseException(validator.getDescription());
            }
        }

        const collection = await this.silent(async () => await this.getCollection(id));

        if (collection.isEmpty()) {
            throw new DatabaseException('Collection not found');
        }

        if (
            this.adapter.getSharedTables() &&
            collection.getAttribute('$tenant') !== this.adapter.getTenant()
        ) {
            throw new DatabaseException('Collection not found');
        }

        collection
            .setAttribute('$permissions', permissions)
            .setAttribute('documentSecurity', documentSecurity);

        const updatedCollection = await this.silent(async () => await this.updateDocument(Database.METADATA, collection.getId(), collection));

        this.trigger(Database.EVENT_COLLECTION_UPDATE, updatedCollection);

        return updatedCollection;
    }

    public async getCollection(id: string): Promise<Document> {
        if (this.adapter.getSharedTables() && !this.adapter.getTenant()) {
            throw new DatabaseException('Missing tenant. Tenant must be set when table sharing is enabled.');
        }

        const collection = await this.silent(async () => await this.getDocument(Database.METADATA, id));


        if (
            id !== Database.METADATA &&
            this.adapter.getSharedTables() &&
            collection.getAttribute('$tenant') !== this.adapter.getTenant()
        ) {
            return new Document();
        }

        this.trigger(Database.EVENT_COLLECTION_READ, collection);
        return collection;
    }

    public async listCollections(limit: number = 25, offset: number = 0): Promise<Document[]> {
        if (this.adapter.getSharedTables() && !this.adapter.getTenant()) {
            throw new DatabaseException('Missing tenant. Tenant must be set when table sharing is enabled.');
        }

        const result = await this.silent(async () => await this.find(Database.METADATA, [
            Query.limit(limit),
            Query.offset(offset)
        ]));

        let filteredResult = result;
        if (this.adapter.getSharedTables()) {
            filteredResult = result.filter((collection: Document) => {
                return collection.getAttribute('$tenant') === this.adapter.getTenant();
            });
        }

        this.trigger(Database.EVENT_COLLECTION_LIST, filteredResult);

        return filteredResult;
    }

    public async getSizeOfCollection(collection: string): Promise<number> {
        if (this.adapter.getSharedTables() && !this.adapter.getTenant()) {
            throw new DatabaseException('Missing tenant. Tenant must be set when table sharing is enabled.');
        }

        const collectionDoc = await this.silent(async () => await this.getCollection(collection));

        if (collectionDoc.isEmpty()) {
            throw new DatabaseException('Collection not found');
        }

        if (this.adapter.getSharedTables() && collectionDoc.getAttribute('$tenant') !== this.adapter.getTenant()) {
            throw new DatabaseException('Collection not found');
        }

        return await this.adapter.getSizeOfCollection(collectionDoc.getId());
    }

    public async deleteCollection(id: string): Promise<boolean> {
        if (this.adapter.getSharedTables() && !this.adapter.getTenant()) {
            throw new DatabaseException('Missing tenant. Tenant must be set when table sharing is enabled.');
        }

        const collection = await this.silent(async () => await this.getDocument(Database.METADATA, id));

        if (collection.isEmpty()) {
            throw new DatabaseException('Collection not found');
        }

        if (this.adapter.getSharedTables() && collection.getAttribute('$tenant') !== this.adapter.getTenant()) {
            throw new DatabaseException('Collection not found');
        }

        const relationships = collection.getAttribute('attributes').filter((attribute: Document) =>
            attribute.getAttribute('type') === Database.VAR_RELATIONSHIP
        );

        for (const relationship of relationships) {
            await this.deleteRelationship(collection.getId(), relationship.getId());
        }

        await this.adapter.deleteCollection(id);

        let deleted: boolean;
        if (id === Database.METADATA) {
            deleted = true;
        } else {
            deleted = await this.silent(async () => await this.deleteDocument(Database.METADATA, id));
        }

        if (deleted) {
            this.trigger(Database.EVENT_COLLECTION_DELETE, collection);
        }

        return deleted;
    }

    public async createAttribute(
        collection: string,
        id: string,
        type: string,
        size: number,
        required: boolean,
        defaultValue: any = null,
        signed: boolean = true,
        array: boolean = false,
        format: string | null = null,
        formatOptions: { [key: string]: any } = {},
        filters: string[] = []
    ): Promise<boolean> {
        if (this.adapter.getSharedTables() && !this.adapter.getTenant()) {
            throw new DatabaseException('Missing tenant. Tenant must be set when table sharing is enabled.');
        }

        const collectionDoc = await this.silent(async () => await this.getCollection(collection));

        if (collectionDoc.isEmpty()) {
            throw new DatabaseException('Collection not found');
        }

        if (this.adapter.getSharedTables() && collectionDoc.getAttribute('$tenant') !== this.adapter.getTenant()) {
            throw new DatabaseException('Collection not found');
        }

        // Attribute IDs are case insensitive
        const attributes: Document[] = collectionDoc.getAttribute('attributes', []);
        for (const attribute of attributes) {
            if (attribute.getId().toLowerCase() === id.toLowerCase()) {
                throw new DuplicateException('Attribute already exists');
            }
        }

        // Ensure required filters for the attribute are passed
        const requiredFilters = this.getRequiredFilters(type);
        if (requiredFilters.some(filter => !filters.includes(filter))) {
            throw new DatabaseException(`Attribute of type: ${type} requires the following filters: ${requiredFilters.join(",")}`);
        }

        if (
            this.adapter.getLimitForAttributes() > 0 &&
            this.adapter.getCountOfAttributes(collectionDoc) >= this.adapter.getLimitForAttributes()
        ) {
            throw new LimitException('Column limit reached. Cannot create new attribute.');
        }

        if (format && !Structure.hasFormat(format, type)) {
            throw new DatabaseException(`Format ("${format}") not available for this attribute type ("${type}")`);
        }

        const attribute = new Document({
            $id: ID.custom(id),
            key: id,
            type: type,
            size: size,
            required: required,
            default: defaultValue,
            signed: signed,
            array: array,
            format: format,
            formatOptions: formatOptions,
            filters: filters,
        });

        collectionDoc.setAttribute('attributes', attribute, Document.SET_TYPE_APPEND);

        if (
            this.adapter.getDocumentSizeLimit() > 0 &&
            this.adapter.getAttributeWidth(collectionDoc) >= this.adapter.getDocumentSizeLimit()
        ) {
            throw new LimitException('Row width limit reached. Cannot create new attribute.');
        }

        switch (type) {
            case Database.VAR_STRING:
                if (size > this.adapter.getLimitForString()) {
                    throw new DatabaseException(`Max size allowed for string is: ${this.adapter.getLimitForString().toLocaleString()}`);
                }
                break;
            case Database.VAR_INTEGER:
                const limit = signed ? this.adapter.getLimitForInt() / 2 : this.adapter.getLimitForInt();
                if (size > limit) {
                    throw new DatabaseException(`Max size allowed for int is: ${limit.toLocaleString()}`);
                }
                break;
            case Database.VAR_FLOAT:
            case Database.VAR_BOOLEAN:
            case Database.VAR_DATETIME:
            case Database.VAR_RELATIONSHIP:
                break;
            default:
                throw new DatabaseException(`Unknown attribute type: ${type}. Must be one of ${Database.VAR_STRING}, ${Database.VAR_INTEGER}, ${Database.VAR_FLOAT}, ${Database.VAR_BOOLEAN}, ${Database.VAR_DATETIME}, ${Database.VAR_RELATIONSHIP}`);
        }

        // sadece defaultValue verildiğinde çalıştır
        if (defaultValue !== null) {
            if (required) {
                throw new DatabaseException('Cannot set a default value on a required attribute');
            }

            this.validateDefaultTypes(type, defaultValue);
        }

        try {
            const created = await this.adapter.createAttribute(collectionDoc.getId(), id, type, size, signed, array);

            if (!created) {
                throw new DatabaseException('Failed to create attribute');
            }
        } catch (e) {
            if (e instanceof DuplicateException && !this.adapter.getSharedTables()) {
                throw e;
            }
        }

        if (collectionDoc.getId() !== Database.METADATA) {
            await this.silent(async () => await this.updateDocument(Database.METADATA, collectionDoc.getId(), collectionDoc));
        }

        await this.purgeCachedCollection(collectionDoc.getId());
        await this.purgeCachedDocument(Database.METADATA, collectionDoc.getId());

        this.trigger(Database.EVENT_ATTRIBUTE_CREATE, attribute);

        return true;
    }

    /**
    * Get the list of required filters for each data type
    *
    * @param type Type of the attribute
    *
    * @return string[]
    */
    protected getRequiredFilters(type: string | null): string[] {
        switch (type) {
            case Database.VAR_DATETIME:
                return ['datetime'];
            default:
                return [];
        }
    }

    /**
     * Function to validate if the default value of an attribute matches its attribute type
     *
     * @param type Type of the attribute
     * @param defaultValue Default value of the attribute
     *
     * @throws DatabaseException
     * @return void
     */
    protected async validateDefaultTypes(type: string, defaultValue: any): Promise<void> {
        const defaultType = typeof defaultValue;

        if (defaultType === 'undefined' || defaultValue === null) {
            // Disable null. No validation required
            return;
        }

        if (Array.isArray(defaultValue)) {
            for (const value of defaultValue) {
                await this.validateDefaultTypes(type, value);
            }
            return;
        }

        switch (type) {
            case Database.VAR_STRING:
            case Database.VAR_INTEGER:
            case Database.VAR_FLOAT:
            case Database.VAR_BOOLEAN:
                if (type !== defaultType) {
                    throw new DatabaseException(`Default value ${defaultValue} does not match given type ${type}`);
                }
                break;
            case Database.VAR_DATETIME:
                if (defaultType !== 'string') {
                    throw new DatabaseException(`Default value ${defaultValue} does not match given type ${type}`);
                }
                break;
            default:
                throw new DatabaseException(`Unknown attribute type: ${type}. Must be one of ${Database.VAR_STRING}, ${Database.VAR_INTEGER}, ${Database.VAR_FLOAT}, ${Database.VAR_BOOLEAN}, ${Database.VAR_DATETIME}, ${Database.VAR_RELATIONSHIP}`);
        }
    }

    /**
    * Update attribute metadata. Utility method for update attribute methods.
    *
    * @param collection
    * @param id
    * @param updateCallback method that receives document, and returns it with changes applied
    *
    * @return Document
    * @throws ConflictException
    * @throws DatabaseException
    */
    protected async updateIndexMeta(collection: string, id: string, updateCallback: (index: Document, collection: Document, indexPosition: number) => void): Promise<Document> {
        if (this.adapter.getSharedTables() && !this.adapter.getTenant()) {
            throw new DatabaseException('Missing tenant. Tenant must be set when table sharing is enabled.');
        }

        const collectionDoc = await this.silent(async () => await this.getCollection(collection));

        if (collectionDoc.getId() === Database.METADATA) {
            throw new DatabaseException('Cannot update metadata indexes');
        }

        const indexes: Document[] = collectionDoc.getAttribute('indexes', []);
        const indexPosition = indexes.findIndex((index: Document) => index.getAttribute('$id') === id);

        if (indexPosition === -1) {
            throw new DatabaseException('Index not found');
        }

        // Geri çağırma işlevinden güncellemeyi yürüt
        updateCallback(indexes[indexPosition], collectionDoc, indexPosition);

        // Save
        collectionDoc.setAttribute('indexes', indexes);

        this.silent(() => this.updateDocument(Database.METADATA, collectionDoc.getId(), collectionDoc));

        this.trigger(Database.EVENT_ATTRIBUTE_UPDATE, indexes[indexPosition]);

        return indexes[indexPosition];
    }

    /**
   * Öznitelik meta verilerini güncelle. Öznitelik güncelleme yöntemleri için yardımcı yöntem.
   *
   * @param collection
   * @param id
   * @param updateCallback belgeyi alan ve değişiklikler uygulanmış olarak döndüren yöntem
   *
   * @return Document
   * @throws ConflictException
   * @throws DatabaseException
   */
    protected async updateAttributeMeta(
        collection: string,
        id: string,
        updateCallback: (attribute: Document, collection: Document, index: number | string) => void
    ): Promise<Document> {
        if (this.adapter.getSharedTables() && !this.adapter.getTenant()) {
            throw new DatabaseException('Missing tenant. Tenant must be set when table sharing is enabled.');
        }

        const collectionDoc = await this.silent(async () => await this.getCollection(collection));

        if (collectionDoc.getId() === Database.METADATA) {
            throw new DatabaseException('Cannot update metadata attributes');
        }

        const attributes: Document[] = collectionDoc.getAttribute('attributes', []);
        const index = attributes.findIndex((attribute: Document) => attribute.getAttribute('$id') === id);

        if (index === -1) {
            throw new DatabaseException('Attribute not found');
        }

        // Geri çağırma işlevinden güncellemeyi yürüt
        updateCallback(attributes[index], collectionDoc, index);

        // Save
        collectionDoc.setAttribute('attributes', attributes, Document.SET_TYPE_ASSIGN);

        await this.silent(async () => await this.updateDocument(Database.METADATA, collectionDoc.getId(), collectionDoc));

        this.trigger(Database.EVENT_ATTRIBUTE_UPDATE, attributes[index]);

        return attributes[index];
    }

    /**
     * Öznitelik gerekli durumunu güncelle.
     *
     * @param collection
     * @param id
     * @param required
     *
     * @return Document
     * @throws DatabaseException
     */
    public async updateAttributeRequired(collection: string, id: string, required: boolean): Promise<Document> {
        return await this.updateAttributeMeta(collection, id, (attribute: Document) => {
            attribute.setAttribute('required', required);
        });
    }

    /**
    * Öznitelik formatını güncelle.
    *
    * @param collection
    * @param id
    * @param format öznitelik doğrulama formatı
    *
    * @return Document
    * @throws DatabaseException
    */
    public async updateAttributeFormat(collection: string, id: string, format: string): Promise<Document> {
        return await this.updateAttributeMeta(collection, id, (attribute: Document) => {
            if (!Structure.hasFormat(format, attribute.getAttribute('type'))) {
                throw new DatabaseException(`Format "${format}" not available for attribute type "${attribute.getAttribute('type')}"`);
            }

            attribute.setAttribute('format', format);
        });
    }

    /**
   * Öznitelik format seçeneklerini güncelle.
   *
   * @param collection
   * @param id
   * @param formatOptions öznitelik doğrulama için geçirilebilen özel seçeneklerin bir ilişkisel dizi
   *
   * @return Document
   * @throws DatabaseException
   */
    public async updateAttributeFormatOptions(collection: string, id: string, formatOptions: { [key: string]: any }): Promise<Document> {
        return await this.updateAttributeMeta(collection, id, (attribute: Document) => {
            attribute.setAttribute('formatOptions', formatOptions);
        });
    }

    /**
     * Öznitelik filtrelerini güncelle.
     *
     * @param collection
     * @param id
     * @param filters
     *
     * @return Document
     * @throws DatabaseException
     */
    public async updateAttributeFilters(collection: string, id: string, filters: string[]): Promise<Document> {
        return await this.updateAttributeMeta(collection, id, (attribute: Document) => {
            attribute.setAttribute('filters', filters);
        });
    }

    /**
    * Öznitelik varsayılan değerini güncelle.
    *
    * @param collection
    * @param id
    * @param defaultValue
    *
    * @return Document
    * @throws DatabaseException
    */
    public async updateAttributeDefault(collection: string, id: string, defaultValue: any = null): Promise<Document> {
        return await this.updateAttributeMeta(collection, id, async (attribute: Document) => {
            if (attribute.getAttribute('required') === true) {
                throw new DatabaseException('Cannot set a default value on a required attribute');
            }

            await this.validateDefaultTypes(attribute.getAttribute('type'), defaultValue);

            attribute.setAttribute('default', defaultValue);
        });
    }

    /**
         * Öznitelik güncelle. Bu yöntem, alt yapıyı değiştiren verileri güncellemek için kullanılır. 
         * Alt yapıyı değiştiren verileri güncellemek için diğer updateAttribute yöntemlerini kontrol edin.
         * Öznitelik anahtarını (ID) güncellemek için renameAttribute kullanın.
         * @param collection
         * @param id
         * @param type
         * @param size utf8mb4 chars length
         * @param required
         * @param defaultValue
         * @param signed
         * @param array
         * @param format
         * @param formatOptions
         * @param filters
         * @param newKey
         * @return Document
         * @throws DatabaseException
         */
    public async updateAttribute(
        {
            collection,
            id,
            type = null,
            size = null,
            required = null,
            defaultValue = null,
            signed = null,
            array = null,
            format = null,
            formatOptions = null,
            filters = null,
            newKey = null
        }:
            {
                collection: string,
                id: string,
                type?: string,
                size?: number,
                required?: boolean,
                defaultValue?: any,
                signed?: boolean,
                array?: boolean,
                format?: string,
                formatOptions?: { [key: string]: any } | null,
                filters?: string[],
                newKey?: string
            }

    ): Promise<Document> {
        return await this.updateAttributeMeta(collection, id, async (attribute: Document, collectionDoc: Document, attributeIndex: number | string) => {
            const altering = type !== null || size !== null || signed !== null || array !== null || newKey !== null;
            type = type ?? attribute.getAttribute('type');
            size = size ?? attribute.getAttribute('size');
            signed = signed ?? attribute.getAttribute('signed');
            required = required ?? attribute.getAttribute('required');
            defaultValue = defaultValue ?? attribute.getAttribute('default');
            array = array ?? attribute.getAttribute('array');
            format = format ?? attribute.getAttribute('format');
            formatOptions = formatOptions ?? attribute.getAttribute('formatOptions');
            filters = filters ?? attribute.getAttribute('filters');

            if (required === true && defaultValue !== null) {
                defaultValue = null;
            }

            switch (type) {
                case Database.VAR_STRING:
                    if (!size) {
                        throw new DatabaseException('Size length is required');
                    }

                    if (size > this.adapter.getLimitForString()) {
                        throw new DatabaseException(`Max size allowed for string is: ${this.adapter.getLimitForString().toLocaleString()}`);
                    }
                    break;

                case Database.VAR_INTEGER:
                    const limit = signed ? this.adapter.getLimitForInt() / 2 : this.adapter.getLimitForInt();
                    if (size > limit) {
                        throw new DatabaseException(`Max size allowed for int is: ${limit.toLocaleString()}`);
                    }
                    break;
                case Database.VAR_FLOAT:
                case Database.VAR_BOOLEAN:
                case Database.VAR_DATETIME:
                    if (size) {
                        throw new DatabaseException('Size must be empty');
                    }
                    break;
                default:
                    throw new DatabaseException(`Unknown attribute type: ${type}. Must be one of ${Database.VAR_STRING}, ${Database.VAR_INTEGER}, ${Database.VAR_FLOAT}, ${Database.VAR_BOOLEAN}, ${Database.VAR_DATETIME}, ${Database.VAR_RELATIONSHIP}`);
            }

            // Gereken filtrelerin öznitelik için sağlandığından emin olun
            const requiredFilters = this.getRequiredFilters(type);
            if (requiredFilters.some(filter => !filters.includes(filter))) {
                throw new DatabaseException(`Attribute of type: ${type} requires the following filters: ${requiredFilters.join(",")}`);
            }

            if (format && !Structure.hasFormat(format, type)) {
                throw new DatabaseException(`Format ("${format}") not available for this attribute type ("${type}")`);
            }

            if (defaultValue !== null) {
                if (required) {
                    throw new DatabaseException('Cannot set a default value on a required attribute');
                }

                await this.validateDefaultTypes(type, defaultValue);
            }

            attribute
                .setAttribute('$id', newKey ?? id)
                .setAttribute('key', newKey ?? id)
                .setAttribute('type', type)
                .setAttribute('size', size)
                .setAttribute('signed', signed)
                .setAttribute('array', array)
                .setAttribute('format', format)
                .setAttribute('formatOptions', formatOptions)
                .setAttribute('filters', filters)
                .setAttribute('required', required)
                .setAttribute('default', defaultValue);

            const attributes: Document[] = collectionDoc.getAttribute('attributes');
            attributes[attributeIndex] = attribute;
            collectionDoc.setAttribute('attributes', attributes, Document.SET_TYPE_ASSIGN);

            if (
                this.adapter.getDocumentSizeLimit() > 0 &&
                this.adapter.getAttributeWidth(collectionDoc) >= this.adapter.getDocumentSizeLimit()
            ) {
                throw new LimitException('Row width limit reached. Cannot create new attribute.');
            }

            if (altering) {
                const updated = await this.adapter.updateAttribute(collection, id, type, size, signed, array, newKey);

                if (id !== newKey) {
                    const indexes: Document[] = collectionDoc.getAttribute('indexes');

                    for (const index of indexes) {
                        if (index.getAttribute('attributes').includes(id)) {
                            index.setAttribute('attributes', index.getAttribute('attributes').map((attribute: string) => attribute === id ? newKey : attribute));
                        }
                    }
                }

                if (!updated) {
                    throw new DatabaseException('Failed to update attribute');
                }

                await this.purgeCachedCollection(collection);
            }

            await this.purgeCachedDocument(Database.METADATA, collection);
        });
    }

    /**
     * Özelliğin koleksiyona eklenip eklenemeyeceğini kontrol eder.
     * Özellik sınırlarını veritabanına sormadan kontrol etmek için kullanılır
     * Özellik koleksiyona eklenebiliyorsa true döner, aksi takdirde istisna fırlatır
     *
     * @param collection
     * @param attribute
     *
     * @throws LimitException
     * @return boolean
     */
    public checkAttribute(collection: Document, attribute: Document): boolean {
        if (this.adapter.getSharedTables() && !this.adapter.getTenant()) {
            throw new DatabaseException('Missing tenant. Tenant must be set when table sharing is enabled.');
        }

        const clonedCollection = collection.clone();

        clonedCollection.setAttribute('attributes', attribute, Document.SET_TYPE_APPEND);

        if (
            this.adapter.getLimitForAttributes() > 0 &&
            this.adapter.getCountOfAttributes(clonedCollection) > this.adapter.getLimitForAttributes()
        ) {
            throw new LimitException('Column limit reached. Cannot create new attribute.');
        }

        if (
            this.adapter.getDocumentSizeLimit() > 0 &&
            this.adapter.getAttributeWidth(clonedCollection) >= this.adapter.getDocumentSizeLimit()
        ) {
            throw new LimitException('Row width limit reached. Cannot create new attribute.');
        }

        return true;
    }

    /**
    * Özniteliği siler
    *
    * @param collection
    * @param id
    *
    * @return boolean
    * @throws ConflictException
    * @throws DatabaseException
    */
    public async deleteAttribute(collection: string, id: string): Promise<boolean> {
        if (this.adapter.getSharedTables() && !this.adapter.getTenant()) {
            throw new DatabaseException('Missing tenant. Tenant must be set when table sharing is enabled.');
        }

        const collectionDoc = await this.silent(async () => await this.getCollection(collection));
        const attributes: Document[] = collectionDoc.getAttribute('attributes', []);
        const indexes: Document[] = collectionDoc.getAttribute('indexes', []);

        let attribute: Document | null = null;

        for (let i = 0; i < attributes.length; i++) {
            if (attributes[i].getAttribute('$id') === id) {
                attribute = attributes[i];
                attributes.splice(i, 1);
                break;
            }
        }

        if (!attribute) {
            throw new DatabaseException('Attribute not found');
        }

        if (attribute.getAttribute('type') === Database.VAR_RELATIONSHIP) {
            throw new DatabaseException('Cannot delete relationship as an attribute');
        }

        for (let i = 0; i < indexes.length; i++) {
            const indexAttributes = indexes[i].getAttribute<Document[]>('attributes', []).filter((attr: Document) => attr.getAttribute('$id') !== id);

            if (indexAttributes.length === 0) {
                indexes.splice(i, 1);
            } else {
                indexes[i].setAttribute('attributes', indexAttributes);
            }
        }

        const deleted = await this.adapter.deleteAttribute(collectionDoc.getId(), id);

        if (!deleted) {
            throw new DatabaseException('Failed to delete attribute');
        }

        collectionDoc.setAttribute('attributes', attributes);
        collectionDoc.setAttribute('indexes', indexes);

        if (collectionDoc.getId() !== Database.METADATA) {
            this.silent(() => this.updateDocument(Database.METADATA, collectionDoc.getId(), collectionDoc));
        }

        await this.purgeCachedCollection(collectionDoc.getId());
        await this.purgeCachedDocument(Database.METADATA, collectionDoc.getId());

        this.trigger(Database.EVENT_ATTRIBUTE_DELETE, attribute);

        return true;
    }

    /**
     * Özniteliği yeniden adlandırır
     *
     * @param collection
     * @param oldId Mevcut öznitelik ID'si
     * @param newId
     * @return boolean
     * @throws AuthorizationException
     * @throws ConflictException
     * @throws DatabaseException
     * @throws DuplicateException
     * @throws StructureException
     */
    public async renameAttribute(collection: string, oldId: string, newId: string): Promise<boolean> {
        if (this.adapter.getSharedTables() && !this.adapter.getTenant()) {
            throw new DatabaseException('Missing tenant. Tenant must be set when table sharing is enabled.');
        }

        const collectionDoc = await this.silent(async () => await this.getCollection(collection));
        const attributes = collectionDoc.getAttribute<Document[]>('attributes', []);
        const indexes = collectionDoc.getAttribute<Document[]>('indexes', []);

        const attributeExists = attributes.some((attribute: Document) => attribute.getAttribute('$id') === oldId);

        if (!attributeExists) {
            throw new DatabaseException('Attribute not found');
        }

        const newAttributeExists = attributes.some((attribute: Document) => attribute.getAttribute('$id') === newId);

        if (newAttributeExists) {
            throw new DuplicateException('Attribute name already used');
        }

        let updatedAttribute: Document | null = null;

        for (const attribute of attributes) {
            if (attribute.getAttribute('$id') === oldId) {
                attribute.setAttribute('key', newId);
                attribute.setAttribute('$id', newId);
                updatedAttribute = attribute;
                break;
            }
        }

        for (const index of indexes) {
            const indexAttributes = index.getAttribute<Document[]>('attributes', []).map((attr: Document) => (attr.getAttribute('$id') === oldId ? newId : attr));
            index.setAttribute('attributes', indexAttributes);
        }

        collectionDoc.setAttribute('attributes', attributes);
        collectionDoc.setAttribute('indexes', indexes);

        if (collectionDoc.getId() !== Database.METADATA) {
            await this.silent(async () => await this.updateDocument(Database.METADATA, collectionDoc.getId(), collectionDoc));
        }

        const renamed = await this.adapter.renameAttribute(collectionDoc.getId(), oldId, newId);

        this.trigger(Database.EVENT_ATTRIBUTE_UPDATE, updatedAttribute);

        return renamed;
    }

    /**
    * İlişki özniteliği oluşturur
    *
    * @param collection
    * @param relatedCollection
    * @param type
    * @param twoWay
    * @param id
    * @param twoWayKey
    * @param onDelete
    * @return boolean
    * @throws AuthorizationException
    * @throws ConflictException
    * @throws DatabaseException
    * @throws DuplicateException
    * @throws LimitException
    * @throws StructureException
    */
    public async createRelationship(
        collection: string,
        relatedCollection: string,
        type: string,
        twoWay: boolean = false,
        id: string | null = null,
        twoWayKey: string | null = null,
        onDelete: string = Database.RELATION_MUTATE_RESTRICT
    ): Promise<boolean> {
        if (this.adapter.getSharedTables() && !this.adapter.getTenant()) {
            throw new DatabaseException('Missing tenant. Tenant must be set when table sharing is enabled.');
        }

        const collectionDoc = await this.silent(async () => await this.getCollection(collection));

        if (collectionDoc.isEmpty()) {
            throw new DatabaseException('Collection not found');
        }

        const relatedCollectionDoc = await this.silent(async () => await this.getCollection(relatedCollection));

        if (relatedCollectionDoc.isEmpty()) {
            throw new DatabaseException('Related collection not found');
        }

        id = id ?? relatedCollectionDoc.getId();
        twoWayKey = twoWayKey ?? collectionDoc.getId();

        const attributes = collectionDoc.getAttribute<Document[]>('attributes', []);
        for (const attribute of attributes) {
            if (attribute.getId().toLowerCase() === id.toLowerCase()) {
                throw new DuplicateException('Attribute already exists');
            }

            if (
                attribute.getAttribute('type') === Database.VAR_RELATIONSHIP &&
                attribute.getAttribute('options')['twoWayKey'].toLowerCase() === twoWayKey.toLowerCase() &&
                attribute.getAttribute('options')['relatedCollection'] === relatedCollectionDoc.getId()
            ) {
                throw new DuplicateException('Related attribute already exists');
            }
        }

        if (
            this.adapter.getLimitForAttributes() > 0 &&
            (this.adapter.getCountOfAttributes(collectionDoc) >= this.adapter.getLimitForAttributes() ||
                this.adapter.getCountOfAttributes(relatedCollectionDoc) >= this.adapter.getLimitForAttributes())
        ) {
            throw new LimitException('Column limit reached. Cannot create new attribute.');
        }

        if (
            this.adapter.getDocumentSizeLimit() > 0 &&
            (this.adapter.getAttributeWidth(collectionDoc) >= this.adapter.getDocumentSizeLimit() ||
                this.adapter.getAttributeWidth(relatedCollectionDoc) >= this.adapter.getDocumentSizeLimit())
        ) {
            throw new LimitException('Row width limit reached. Cannot create new attribute.');
        }

        const relationship = new Document({
            '$id': ID.custom(id),
            'key': id,
            'type': Database.VAR_RELATIONSHIP,
            'required': false,
            'default': null,
            'options': {
                'relatedCollection': relatedCollectionDoc.getId(),
                'relationType': type,
                'twoWay': twoWay,
                'twoWayKey': twoWayKey,
                'onDelete': onDelete,
                'side': Database.RELATION_SIDE_PARENT,
            },
        });

        const twoWayRelationship = new Document({
            '$id': ID.custom(twoWayKey),
            'key': twoWayKey,
            'type': Database.VAR_RELATIONSHIP,
            'required': false,
            'default': null,
            'options': {
                'relatedCollection': collectionDoc.getId(),
                'relationType': type,
                'twoWay': twoWay,
                'twoWayKey': id,
                'onDelete': onDelete,
                'side': Database.RELATION_SIDE_CHILD,
            },
        });

        collectionDoc.setAttribute('attributes', relationship, Document.SET_TYPE_APPEND);
        relatedCollectionDoc.setAttribute('attributes', twoWayRelationship, Document.SET_TYPE_APPEND);

        if (type === Database.RELATION_MANY_TO_MANY) {
            await this.silent(async () => await this.createCollection(`_${collectionDoc.getInternalId()}_${relatedCollectionDoc.getInternalId()}`, [
                new Document({
                    '$id': id,
                    'key': id,
                    'type': Database.VAR_STRING,
                    'size': Database.LENGTH_KEY,
                    'required': true,
                    'signed': true,
                    'array': false,
                    'filters': [],
                }),
                new Document({
                    '$id': twoWayKey,
                    'key': twoWayKey,
                    'type': Database.VAR_STRING,
                    'size': Database.LENGTH_KEY,
                    'required': true,
                    'signed': true,
                    'array': false,
                    'filters': [],
                }),
            ], [
                new Document({
                    '$id': `_index_${id}`,
                    'key': `index_${id}`,
                    'type': Database.INDEX_KEY,
                    'attributes': [id],
                }),
                new Document({
                    '$id': `_index_${twoWayKey}`,
                    'key': `_index_${twoWayKey}`,
                    'type': Database.INDEX_KEY,
                    'attributes': [twoWayKey],
                }),
            ]));
        }

        const created = await this.adapter.createRelationship(
            collectionDoc.getId(),
            relatedCollectionDoc.getId(),
            type,
            twoWay,
            id,
            twoWayKey
        );

        if (!created) {
            throw new DatabaseException('Failed to create relationship');
        }

        await this.silent(async () => {
            await this.updateDocument(Database.METADATA, collectionDoc.getId(), collectionDoc);
            await this.updateDocument(Database.METADATA, relatedCollectionDoc.getId(), relatedCollectionDoc);

            const indexKey = `_index_${id}`;
            const twoWayIndexKey = `_index_${twoWayKey}`;

            switch (type) {
                case Database.RELATION_ONE_TO_ONE:
                    await this.createIndex(collectionDoc.getId(), indexKey, Database.INDEX_UNIQUE, [id]);
                    if (twoWay) {
                        await this.createIndex(relatedCollectionDoc.getId(), twoWayIndexKey, Database.INDEX_UNIQUE, [twoWayKey]);
                    }
                    break;
                case Database.RELATION_ONE_TO_MANY:
                    await this.createIndex(relatedCollectionDoc.getId(), twoWayIndexKey, Database.INDEX_KEY, [twoWayKey]);
                    break;
                case Database.RELATION_MANY_TO_ONE:
                    await this.createIndex(collectionDoc.getId(), indexKey, Database.INDEX_KEY, [id]);
                    break;
                case Database.RELATION_MANY_TO_MANY:
                    // Bağlantı koleksiyonu oluşturulurken dizinler oluşturuldu
                    break;
                default:
                    throw new RelationshipException('Invalid relationship type.');
            }
        });

        this.trigger(Database.EVENT_ATTRIBUTE_CREATE, relationship);

        return true;
    }

    /**
     * Update a relationship attribute
     *
     * @param collection
     * @param id
     * @param newKey
     * @param newTwoWayKey
     * @param twoWay
     * @param onDelete
     * @return boolean
     * @throws ConflictException
     * @throws DatabaseException
     */
    public async updateRelationship(
        collection: string,
        id: string,
        newKey: string = null,
        newTwoWayKey: string = null,
        twoWay: boolean = null,
        onDelete: string = null
    ): Promise<boolean> {
        if (this.adapter.getSharedTables() && !this.adapter.getTenant()) {
            throw new DatabaseException('Missing tenant. Tenant must be set when table sharing is enabled.');
        }

        if (newKey === null && newTwoWayKey === null && twoWay === null && onDelete === null) {
            return true;
        }

        const collectionDoc = await this.getCollection(collection);
        const attributes = collectionDoc.getAttribute<Document[]>('attributes', []);

        if (newKey !== null && attributes.some((attribute: Document) => attribute['key'] === newKey)) {
            throw new DuplicateException('Attribute already exists');
        }

        await this.updateAttributeMeta(collectionDoc.getId(), id, async (attribute: Document) => {
            const altering = (newKey !== null && newKey !== id) || (newTwoWayKey !== null && newTwoWayKey !== attribute.getAttribute('options')['twoWayKey']);

            const relatedCollectionId = attribute.getAttribute('options')['relatedCollection'];
            const relatedCollectionDoc = await this.getCollection(relatedCollectionId);
            const relatedAttributes = relatedCollectionDoc.getAttribute<Document[]>('attributes', []);

            if (newTwoWayKey !== null && relatedAttributes.some((attr: Document) => attr.getAttribute('key') === newTwoWayKey)) {
                throw new DuplicateException('Related attribute already exists');
            }

            const type = attribute.getAttribute('options')['relationType'];
            const side = attribute.getAttribute('options')['side'];

            newKey = newKey ?? attribute.getAttribute('key');
            const twoWayKey = attribute.getAttribute('options')['twoWayKey'];
            newTwoWayKey = newTwoWayKey ?? attribute.getAttribute('options')['twoWayKey'];
            twoWay = twoWay ?? attribute.getAttribute('options')['twoWay'];
            onDelete = onDelete ?? attribute.getAttribute('options')['onDelete'];

            attribute.setAttribute('$id', newKey);
            attribute.setAttribute('key', newKey);
            attribute.setAttribute('options', {
                'relatedCollection': relatedCollectionDoc.getId(),
                'relationType': type,
                'twoWay': twoWay,
                'twoWayKey': newTwoWayKey,
                'onDelete': onDelete,
                'side': side,
            });

            await this.updateAttributeMeta(relatedCollectionDoc.getId(), twoWayKey, async (twoWayAttribute: Document) => {
                const options = twoWayAttribute.getAttribute('options', {});
                options['twoWayKey'] = newKey;
                options['twoWay'] = twoWay;
                options['onDelete'] = onDelete;

                twoWayAttribute.setAttribute('$id', newTwoWayKey);
                twoWayAttribute.setAttribute('key', newTwoWayKey);
                twoWayAttribute.setAttribute('options', options);
            });

            if (type === Database.RELATION_MANY_TO_MANY) {
                const junction = this.getJunctionCollection(collectionDoc, relatedCollectionDoc, side);

                await this.updateAttributeMeta(junction, id, async (junctionAttribute: Document) => {
                    junctionAttribute.setAttribute('$id', newKey);
                    junctionAttribute.setAttribute('key', newKey);
                });
                await this.updateAttributeMeta(junction, twoWayKey, async (junctionAttribute: Document) => {
                    junctionAttribute.setAttribute('$id', newTwoWayKey);
                    junctionAttribute.setAttribute('key', newTwoWayKey);
                });

                await this.purgeCachedCollection(junction);
            }

            if (altering) {
                const updated = await this.adapter.updateRelationship(
                    collectionDoc.getId(),
                    relatedCollectionDoc.getId(),
                    type,
                    twoWay,
                    id,
                    twoWayKey,
                    side,
                    newKey,
                    newTwoWayKey
                );

                if (!updated) {
                    throw new DatabaseException('Failed to update relationship');
                }
            }

            await this.purgeCachedCollection(collectionDoc.getId());
            await this.purgeCachedCollection(relatedCollectionDoc.getId());

            const renameIndex = async (collection: string, key: string, newKey: string) => {
                await this.updateIndexMeta(
                    collection,
                    `_index_${key}`,
                    (index: Document) => index.setAttribute('attributes', [newKey])
                );
                await this.silent(async () => await this.renameIndex(collection, `_index_${key}`, `_index_${newKey}`));
            };

            switch (type) {
                case Database.RELATION_ONE_TO_ONE:
                    if (id !== newKey) {
                        await renameIndex(collectionDoc.getId(), id, newKey);
                    }
                    if (twoWay && twoWayKey !== newTwoWayKey) {
                        await renameIndex(relatedCollectionDoc.getId(), twoWayKey, newTwoWayKey);
                    }
                    break;
                case Database.RELATION_ONE_TO_MANY:
                    if (side === Database.RELATION_SIDE_PARENT) {
                        if (twoWayKey !== newTwoWayKey) {
                            await renameIndex(relatedCollectionDoc.getId(), twoWayKey, newTwoWayKey);
                        }
                    } else {
                        if (id !== newKey) {
                            await renameIndex(collectionDoc.getId(), id, newKey);
                        }
                    }
                    break;
                case Database.RELATION_MANY_TO_ONE:
                    if (side === Database.RELATION_SIDE_PARENT) {
                        if (id !== newKey) {
                            await renameIndex(collectionDoc.getId(), id, newKey);
                        }
                    } else {
                        if (twoWayKey !== newTwoWayKey) {
                            await renameIndex(relatedCollectionDoc.getId(), twoWayKey, newTwoWayKey);
                        }
                    }
                    break;
                case Database.RELATION_MANY_TO_MANY:
                    const junction = this.getJunctionCollection(collectionDoc, relatedCollectionDoc, side);

                    if (id !== newKey) {
                        await renameIndex(junction, id, newKey);
                    }
                    if (twoWayKey !== newTwoWayKey) {
                        await renameIndex(junction, twoWayKey, newTwoWayKey);
                    }
                    break;
                default:
                    throw new RelationshipException('Invalid relationship type.');
            }
        });

        return true;
    }

    /**
     * Bir ilişki özniteliğini sil
     *
     * @param collection
     * @param id
     *
     * @return boolean
     * @throws AuthorizationException
     * @throws ConflictException
     * @throws DatabaseException
     * @throws StructureException
     */
    public async deleteRelationship(collection: string, id: string): Promise<boolean> {
        if (this.adapter.getSharedTables() && !this.adapter.getTenant()) {
            throw new DatabaseException('Missing tenant. Tenant must be set when table sharing is enabled.');
        }

        const collectionDoc = await this.silent(async () => await this.getCollection(collection));
        const attributes = collectionDoc.getAttribute<Document[]>('attributes', []);
        let relationship: Document | null = null;

        for (let i = 0; i < attributes.length; i++) {
            if (attributes[i].getAttribute('$id') === id) {
                relationship = attributes[i];
                attributes.splice(i, 1);
                break;
            }
        }

        if (!relationship) {
            throw new DatabaseException('Attribute not found');
        }

        collectionDoc.setAttribute('attributes', attributes);

        const relatedCollectionId = relationship.getAttribute('options')['relatedCollection'];
        const type = relationship.getAttribute('options')['relationType'];
        const twoWay = relationship.getAttribute('options')['twoWay'];
        const twoWayKey = relationship.getAttribute('options')['twoWayKey'];
        const side = relationship.getAttribute('options')['side'];

        const relatedCollectionDoc = await this.silent(async () => await this.getCollection(relatedCollectionId));
        const relatedAttributes = relatedCollectionDoc.getAttribute<Document[]>('attributes', []);

        for (let i = 0; i < relatedAttributes.length; i++) {
            if (relatedAttributes[i].getAttribute('$id') === twoWayKey) {
                relatedAttributes.splice(i, 1);
                break;
            }
        }

        relatedCollectionDoc.setAttribute('attributes', relatedAttributes);

        await this.silent(async () => {
            await this.updateDocument(Database.METADATA, collectionDoc.getId(), collectionDoc);
            await this.updateDocument(Database.METADATA, relatedCollectionDoc.getId(), relatedCollectionDoc);

            const indexKey = `_index_${id}`;
            const twoWayIndexKey = `_index_${twoWayKey}`;

            switch (type) {
                case Database.RELATION_ONE_TO_ONE:
                    if (side === Database.RELATION_SIDE_PARENT) {
                        await this.deleteIndex(collectionDoc.getId(), indexKey);
                        if (twoWay) {
                            await this.deleteIndex(relatedCollectionDoc.getId(), twoWayIndexKey);
                        }
                    }
                    if (side === Database.RELATION_SIDE_CHILD) {
                        await this.deleteIndex(relatedCollectionDoc.getId(), twoWayIndexKey);
                        if (twoWay) {
                            await this.deleteIndex(collectionDoc.getId(), indexKey);
                        }
                    }
                    break;
                case Database.RELATION_ONE_TO_MANY:
                    if (side === Database.RELATION_SIDE_PARENT) {
                        await this.deleteIndex(relatedCollectionDoc.getId(), twoWayIndexKey);
                    } else {
                        await this.deleteIndex(collectionDoc.getId(), indexKey);
                    }
                    break;
                case Database.RELATION_MANY_TO_ONE:
                    if (side === Database.RELATION_SIDE_PARENT) {
                        await this.deleteIndex(collectionDoc.getId(), indexKey);
                    } else {
                        await this.deleteIndex(relatedCollectionDoc.getId(), twoWayIndexKey);
                    }
                    break;
                case Database.RELATION_MANY_TO_MANY:
                    const junction = this.getJunctionCollection(
                        collectionDoc,
                        relatedCollectionDoc,
                        side
                    );

                    await this.deleteDocument(Database.METADATA, junction);
                    break;
                default:
                    throw new RelationshipException('Invalid relationship type.');
            }
        });

        const deleted = await this.adapter.deleteRelationship(
            collectionDoc.getId(),
            relatedCollectionDoc.getId(),
            type,
            twoWay,
            id,
            twoWayKey,
            side
        );

        if (!deleted) {
            throw new DatabaseException('Failed to delete relationship');
        }

        await this.purgeCachedCollection(collectionDoc.getId());
        await this.purgeCachedCollection(relatedCollectionDoc.getId());

        await this.trigger(Database.EVENT_ATTRIBUTE_DELETE, relationship);

        return true;
    }

    /**
     * İndeksi Yeniden Adlandır
     *
     * @param collection
     * @param oldId
     * @param newId
     *
     * @return boolean
     * @throws AuthorizationException
     * @throws ConflictException
     * @throws DatabaseException
     * @throws DuplicateException
     * @throws StructureException
     */
    public async renameIndex(collection: string, oldId: string, newId: string): Promise<boolean> {
        if (this.adapter.getSharedTables() && !this.adapter.getTenant()) {
            throw new DatabaseException('Missing tenant. Tenant must be set when table sharing is enabled.');
        }

        const collectionDoc = await this.silent(async () => await this.getCollection(collection));
        const indexes = collectionDoc.getAttribute<Document[]>('indexes', []);

        const indexExists = indexes.some((index: Document) => index.getAttribute('$id') === oldId);

        if (!indexExists) {
            throw new DatabaseException('Index not found');
        }

        const newIndexExists = indexes.some((index: Document) => index.getAttribute('$id') === newId);

        if (newIndexExists) {
            throw new DuplicateException('Index name already used');
        }

        let updatedIndex: Document | null = null;

        for (const index of indexes) {
            if (index.getAttribute('$id') === oldId) {
                index.setAttribute('key', newId);
                index.setAttribute('$id', newId);
                updatedIndex = index;
                break;
            }
        }

        collectionDoc.setAttribute('indexes', indexes);

        await this.adapter.renameIndex(collectionDoc.getId(), oldId, newId);

        if (collectionDoc.getId() !== Database.METADATA) {
            await this.silent(async () => await this.updateDocument(Database.METADATA, collectionDoc.getId(), collectionDoc));
        }

        this.trigger(Database.EVENT_INDEX_RENAME, updatedIndex);

        return true;
    }

    /**
     * Create Index
     *
     * @param collection
     * @param id
     * @param type
     * @param attributes
     * @param lengths
     * @param orders
     *
     * @return boolean
     * @throws AuthorizationException
     * @throws ConflictException
     * @throws DatabaseException
     * @throws DuplicateException
     * @throws LimitException
     * @throws StructureException
     * @throws Exception
     */
    public async createIndex(
        collection: string,
        id: string,
        type: string,
        attributes: string[],
        lengths: number[] = [],
        orders: string[] = []
    ): Promise<boolean> {
        if (this.adapter.getSharedTables() && !this.adapter.getTenant()) {
            throw new DatabaseException('Missing tenant. Tenant must be set when table sharing is enabled.');
        }

        if (attributes.length === 0) {
            throw new DatabaseException('Missing attributes');
        }

        const collectionDoc = await this.silent(async () => await this.getCollection(collection));

        // index IDs are case-insensitive
        const indexes = collectionDoc.getAttribute('indexes', []);

        for (const index of indexes) {
            if (index.getId().toLowerCase() === id.toLowerCase()) {
                throw new DuplicateException('Index already exists');
            }
        }

        if (this.adapter.getCountOfIndexes(collectionDoc) >= this.adapter.getLimitForIndexes()) {
            throw new LimitException('Index limit reached. Cannot create new index.');
        }

        switch (type) {
            case Database.INDEX_KEY:
                if (!this.adapter.getSupportForIndex()) {
                    throw new DatabaseException('Key index is not supported');
                }
                break;

            case Database.INDEX_UNIQUE:
                if (!this.adapter.getSupportForUniqueIndex()) {
                    throw new DatabaseException('Unique index is not supported');
                }
                break;

            case Database.INDEX_FULLTEXT:
                if (!this.adapter.getSupportForFulltextIndex()) {
                    throw new DatabaseException('Fulltext index is not supported');
                }
                break;

            default:
                throw new DatabaseException('Unknown index type: ' + type + '. Must be one of ' + Database.INDEX_KEY + ', ' + Database.INDEX_UNIQUE + ', ' + Database.INDEX_FULLTEXT);
        }

        const collectionAttributes = collectionDoc.getAttribute<Document[]>('attributes', []);

        for (let i = 0; i < attributes.length; i++) {
            for (const collectionAttribute of collectionAttributes) {
                if (collectionAttribute.getAttribute('key') === attributes[i]) {
                    const isArray = collectionAttribute.getAttribute('array', false);
                    if (isArray) {
                        if (this.adapter.getMaxIndexLength() > 0) {
                            lengths[i] = Database.ARRAY_INDEX_LENGTH;
                        }
                        orders[i] = null as any;
                    }
                    break;
                }
            }
        }

        const index = new Document({
            '$id': ID.custom(id),
            'key': id,
            'type': type,
            'attributes': attributes,
            'lengths': lengths,
            'orders': orders,
        });

        collectionDoc.setAttribute('indexes', index, Document.SET_TYPE_APPEND);

        if (this.validate) {
            const validator = new Index(
                collectionDoc.getAttribute('attributes', []),
                this.adapter.getMaxIndexLength()
            );
            if (!validator.isValid(index)) {
                throw new DatabaseException(validator.getDescription());
            }
        }

        try {
            const created = await this.adapter.createIndex(collectionDoc.getId(), id, type, attributes, lengths, orders);

            if (!created) {
                throw new DatabaseException('Failed to create index');
            }
        } catch (e) {
            if (e instanceof DuplicateException && !this.adapter.getSharedTables()) {
                throw e;
            }
        }

        if (collectionDoc.getId() !== Database.METADATA) {
            await this.silent(async () => await this.updateDocument(Database.METADATA, collectionDoc.getId(), collectionDoc));
        }

        this.trigger(Database.EVENT_INDEX_CREATE, index);

        return true;
    }

    /**
     * Delete Index
     *
     * @param collection
     * @param id
     *
     * @return boolean
     * @throws AuthorizationException
     * @throws ConflictException
     * @throws DatabaseException
     * @throws StructureException
     */
    public async deleteIndex(collection: string, id: string): Promise<boolean> {
        if (this.adapter.getSharedTables() && !this.adapter.getTenant()) {
            throw new DatabaseException('Missing tenant. Tenant must be set when table sharing is enabled.');
        }

        const collectionDoc = await this.silent(async () => await this.getCollection(collection));
        const indexes = collectionDoc.getAttribute<Document[]>('indexes', []);

        let indexDeleted: Document | null = null;
        for (let i = 0; i < indexes.length; i++) {
            if (indexes[i].getAttribute('$id') === id) {
                indexDeleted = indexes[i];
                indexes.splice(i, 1);
                break;
            }
        }

        collectionDoc.setAttribute('indexes', indexes);

        if (collectionDoc.getId() !== Database.METADATA) {
            await this.silent(async () => await this.updateDocument(Database.METADATA, collectionDoc.getId(), collectionDoc));
        }

        const deleted = await this.adapter.deleteIndex(collectionDoc.getId(), id);

        this.trigger(Database.EVENT_INDEX_DELETE, indexDeleted);

        return deleted;
    }

    /**
     * Get Document
     *
     * @param collection
     * @param id
     * @param queries
     * @param forUpdate
     *
     * @return Document
     * @throws DatabaseException
     * @throws Exception
     */
    public async getDocument(collection: string, id: string, queries: Query[] = [], forUpdate: boolean = false): Promise<Document> {
        if (this.adapter.getSharedTables() && !this.adapter.getTenant()) {
            throw new DatabaseException('Missing tenant. Tenant must be set when table sharing is enabled.');
        }

        if (collection === Database.METADATA && id === Database.METADATA) {
            const a = new Document(Database.COLLECTION);
            return a;
        }

        if (collection === '') {
            throw new DatabaseException('Collection not found');
        }

        if (id === '') {
            return new Document();
        }

        const collectionDoc = await this.silent(async () => await this.getCollection(collection));

        if (collectionDoc.isEmpty()) {
            throw new DatabaseException('Collection not found');
        }

        const attributes = collectionDoc.getAttribute<Document[]>('attributes', []);

        if (this.validate) {
            const validator = new DocumentValidator(attributes);
            if (!validator.isValid(queries)) {
                throw new QueryException(validator.getDescription());
            }
        }

        const relationships = collectionDoc.getAttribute<Document[]>('attributes', []).filter(
            (attribute: Document) => attribute.getAttribute('type') === Database.VAR_RELATIONSHIP
        );

        const selects = Query.groupByType(queries)['selections'];
        const selections = this.validateSelections(collectionDoc, selects);
        const nestedSelections: Query[] = [];

        for (const query of queries) {
            if (query.getMethod() === Query.TYPE_SELECT) {
                let values = query.getValues();
                for (let valueIndex = 0; valueIndex < values.length; valueIndex++) {
                    const value = values[valueIndex];
                    if (value.includes('.')) {
                        nestedSelections.push(Query.select([
                            value.split('.').slice(1).join('.')
                        ]));

                        const key = value.split('.')[0];

                        for (const relationship of relationships) {
                            if (relationship.getAttribute('key') === key) {
                                switch (relationship.getAttribute('options')['relationType']) {
                                    case Database.RELATION_MANY_TO_MANY:
                                    case Database.RELATION_ONE_TO_MANY:
                                        values.splice(valueIndex, 1);
                                        break;

                                    case Database.RELATION_MANY_TO_ONE:
                                    case Database.RELATION_ONE_TO_ONE:
                                        values[valueIndex] = key;
                                        break;
                                }
                            }
                        }
                    }
                }
                query.setValues(values);
            }
        }

        const validator = new Authorization(Database.PERMISSION_READ);
        const documentSecurity = collectionDoc.getAttribute('documentSecurity', false);

        const collectionCacheKey = `${this.cacheName}-cache-${this.getNamespace()}:${this.adapter.getTenant()}:collection:${collectionDoc.getId()}`;
        let documentCacheKey = `${collectionCacheKey}:${id}`;
        let documentCacheHash = documentCacheKey;

        if (selections.length > 0) {
            documentCacheHash += `:${md5(selections.join(''))}`;
        }

        const cache = await this.cache.load(documentCacheKey, Database.TTL, documentCacheHash);
        if (cache) {
            const document = new Document(cache);

            if (collectionDoc.getId() !== Database.METADATA) {
                if (!validator.isValid([
                    ...collectionDoc.getRead(),
                    ...(documentSecurity ? document.getRead() : [])
                ])) {
                    return new Document();
                }
            }

            this.trigger(Database.EVENT_DOCUMENT_READ, document);

            return document;
        }

        const document = await this.adapter.getDocument(collectionDoc.getId(), id, queries, forUpdate);

        if (document.isEmpty()) {
            return document;
        }

        document.setAttribute('$collection', collectionDoc.getId());

        if (collectionDoc.getId() !== Database.METADATA) {
            if (!validator.isValid([
                ...collectionDoc.getRead(),
                ...(documentSecurity ? document.getRead() : [])
            ])) {
                return new Document();
            }
        }

        let castedDocument = this.casting(collectionDoc, document);
        castedDocument = await this.decode(collectionDoc, castedDocument, selections);
        this.map = {};

        if (this.resolveRelationships && (selects.length === 0 || nestedSelections.length > 0)) {
            castedDocument = await this.silent(async () => await this.populateDocumentRelationships(collectionDoc, castedDocument, nestedSelections));
        }

        const hasTwoWayRelationship = relationships.some(
            (relationship: Document) => relationship.getAttribute('options')['twoWay']
        );

        for (const [key, value] of Object.entries(this.map)) {
            const [k, v] = key.split('=>');
            const ck = `${this.cacheName}-cache-${this.getNamespace()}:${this.adapter.getTenant()}:map:${k}`;
            let cache = await this.cache.load(ck, Database.TTL, ck) || [];
            if (!cache.includes(v)) {
                cache.push(v);
                await this.cache.save(ck, cache, ck);
            }
        }

        if (!hasTwoWayRelationship && relationships.length === 0) {
            await this.cache.save(documentCacheKey, castedDocument.getArrayCopy(), documentCacheHash);
            await this.cache.save(collectionCacheKey, 'empty', documentCacheKey);
        }

        for (const query of queries) {
            if (query.getMethod() === Query.TYPE_SELECT) {
                const values = query.getValues();
                for (const internalAttribute of this.getInternalAttributes()) {
                    if (!values.includes(internalAttribute['$id'])) {
                        castedDocument.removeAttribute(internalAttribute['$id']);
                    }
                }
            }
        }

        this.trigger(Database.EVENT_DOCUMENT_READ, castedDocument);

        return castedDocument;
    }

    /**
     * Populate Document Relationships
     *
     * @param collection
     * @param document
     * @param queries
     * @return Document
     * @throws DatabaseException
     */
    private async populateDocumentRelationships(collection: Document, document: Document, queries: Query[] = []): Promise<Document> {
        const attributes = collection.getAttribute<Document[]>('attributes', []);

        const relationships = attributes.filter((attribute: Document) => attribute.getAttribute('type') === Database.VAR_RELATIONSHIP);

        for (const relationship of relationships) {
            const key = relationship.getAttribute('key');
            const value = document.getAttribute(key);
            const relatedCollection = await this.getCollection(relationship.getAttribute('options')['relatedCollection']);
            const relationType = relationship.getAttribute('options')['relationType'];
            const twoWay = relationship.getAttribute('options')['twoWay'];
            const twoWayKey = relationship.getAttribute('options')['twoWayKey'];
            const side = relationship.getAttribute('options')['side'];

            if (value) {
                let k = `${relatedCollection.getId()}:${value}=>${collection.getId()}:${document.getId()}`;
                if (relationType === Database.RELATION_ONE_TO_MANY) {
                    k = `${collection.getId()}:${document.getId()}=>${relatedCollection.getId()}:${value}`;
                }
                this.map[k] = true;
            }

            relationship.setAttribute('collection', collection.getId());
            relationship.setAttribute('document', document.getId());

            let skipFetch = false;
            for (const fetchedRelationship of this.relationshipFetchStack) {
                const existingKey = fetchedRelationship.getAttribute('key');
                const existingCollection = fetchedRelationship.getAttribute('collection');
                const existingRelatedCollection = fetchedRelationship.getAttribute('options')['relatedCollection'];
                const existingTwoWayKey = fetchedRelationship.getAttribute('options')['twoWayKey'];
                const existingSide = fetchedRelationship.getAttribute('options')['side'];

                const reflexive = fetchedRelationship === relationship;

                const symmetric = existingKey === twoWayKey
                    && existingTwoWayKey === key
                    && existingRelatedCollection === collection.getId()
                    && existingCollection === relatedCollection.getId()
                    && existingSide !== side;

                const transitive = ((existingKey === twoWayKey
                    && existingCollection === relatedCollection.getId()
                    && existingSide !== side)
                    || (existingTwoWayKey === key
                        && existingRelatedCollection === collection.getId()
                        && existingSide !== side)
                    || (existingKey === key
                        && existingTwoWayKey !== twoWayKey
                        && existingRelatedCollection === relatedCollection.getId()
                        && existingSide !== side)
                    || (existingKey !== key
                        && existingTwoWayKey === twoWayKey
                        && existingRelatedCollection === relatedCollection.getId()
                        && existingSide !== side));

                if (reflexive || symmetric || transitive) {
                    skipFetch = true;
                }
            }

            switch (relationType) {
                case Database.RELATION_ONE_TO_ONE:
                    if (skipFetch || (twoWay && this.relationshipFetchDepth === Database.RELATION_MAX_DEPTH)) {
                        document.removeAttribute(key);
                        break;
                    }

                    if (value === null) {
                        break;
                    }

                    this.relationshipFetchDepth++;
                    this.relationshipFetchStack.push(relationship);

                    let related = await this.getDocument(relatedCollection.getId(), value, queries);

                    this.relationshipFetchDepth--;
                    this.relationshipFetchStack.pop();

                    document.setAttribute(key, related);
                    break;
                case Database.RELATION_ONE_TO_MANY:
                    if (side === Database.RELATION_SIDE_CHILD) {
                        if (!twoWay || this.relationshipFetchDepth === Database.RELATION_MAX_DEPTH || skipFetch) {
                            document.removeAttribute(key);
                            break;
                        }
                        if (value !== null) {
                            this.relationshipFetchDepth++;
                            this.relationshipFetchStack.push(relationship);

                            const related = await this.getDocument(relatedCollection.getId(), value, queries);

                            this.relationshipFetchDepth--;
                            this.relationshipFetchStack.pop();

                            document.setAttribute(key, related);
                        }
                        break;
                    }

                    if (this.relationshipFetchDepth === Database.RELATION_MAX_DEPTH || skipFetch) {
                        break;
                    }

                    this.relationshipFetchDepth++;
                    this.relationshipFetchStack.push(relationship);

                    let relatedDocuments = await this.find(relatedCollection.getId(), [
                        Query.equal(twoWayKey, [document.getId()]),
                        Query.limit(Number.MAX_SAFE_INTEGER),
                        ...queries
                    ]);

                    this.relationshipFetchDepth--;
                    this.relationshipFetchStack.pop();

                    for (const related of relatedDocuments) {
                        related.removeAttribute(twoWayKey);
                    }

                    document.setAttribute(key, relatedDocuments);
                    break;
                case Database.RELATION_MANY_TO_ONE:
                    if (side === Database.RELATION_SIDE_PARENT) {
                        if (skipFetch || this.relationshipFetchDepth === Database.RELATION_MAX_DEPTH) {
                            document.removeAttribute(key);
                            break;
                        }

                        if (value === null) {
                            break;
                        }
                        this.relationshipFetchDepth++;
                        this.relationshipFetchStack.push(relationship);

                        const related = await this.getDocument(relatedCollection.getId(), value, queries);

                        this.relationshipFetchDepth--;
                        this.relationshipFetchStack.pop();

                        document.setAttribute(key, related);
                        break;
                    }

                    if (!twoWay) {
                        document.removeAttribute(key);
                        break;
                    }

                    if (this.relationshipFetchDepth === Database.RELATION_MAX_DEPTH || skipFetch) {
                        break;
                    }

                    this.relationshipFetchDepth++;
                    this.relationshipFetchStack.push(relationship);

                    relatedDocuments = await this.find(relatedCollection.getId(), [
                        Query.equal(twoWayKey, [document.getId()]),
                        Query.limit(Number.MAX_SAFE_INTEGER),
                        ...queries
                    ]);

                    this.relationshipFetchDepth--;
                    this.relationshipFetchStack.pop();

                    for (const related of relatedDocuments) {
                        related.removeAttribute(twoWayKey);
                    }

                    document.setAttribute(key, relatedDocuments);
                    break;
                case Database.RELATION_MANY_TO_MANY:
                    if (!twoWay && side === Database.RELATION_SIDE_CHILD) {
                        break;
                    }

                    if (twoWay && (this.relationshipFetchDepth === Database.RELATION_MAX_DEPTH || skipFetch)) {
                        break;
                    }

                    this.relationshipFetchDepth++;
                    this.relationshipFetchStack.push(relationship);

                    const junction = this.getJunctionCollection(collection, relatedCollection, side);

                    const junctions = await this.skipRelationships(async () => await this.find(junction, [
                        Query.equal(twoWayKey, [document.getId()]),
                        Query.limit(Number.MAX_SAFE_INTEGER)
                    ]));

                    const _related: any[] = [];
                    for (const junction of junctions) {
                        _related.push(await this.getDocument(
                            relatedCollection.getId(),
                            junction.getAttribute(key),
                            queries
                        ));
                    }

                    this.relationshipFetchDepth--;
                    this.relationshipFetchStack.pop();

                    document.setAttribute(key, _related);
                    break;
            }
        }

        return document;
    }

    /**
    * Create Document
    *
    * @param collection
    * @param document
    * @return Document
    *
    * @throws AuthorizationException
    * @throws DatabaseException
    * @throws StructureException
    */
    public async createDocument(collection: string, document: Document): Promise<Document> {
        if (this.adapter.getSharedTables() && !this.adapter.getTenant()) {
            throw new DatabaseException('Missing tenant. Tenant must be set when table sharing is enabled.');
        }

        const collectionDoc = await this.silent(async () => await this.getCollection(collection));

        if (collectionDoc.getId() !== Database.METADATA) {
            const authorization = new Authorization(Database.PERMISSION_CREATE);
            if (!authorization.isValid(collectionDoc.getCreate())) {
                throw new AuthorizationException(authorization.getDescription());
            }
        }

        const time = DateTime.now();

        const createdAt = document.getCreatedAt();
        const updatedAt = document.getUpdatedAt();

        document
            .setAttribute('$id', document.getId() ? document.getId() : ID.unique())
            .setAttribute('$collection', collectionDoc.getId())
            .setAttribute('$createdAt', createdAt && this.preserveDates ? createdAt : time)
            .setAttribute('$updatedAt', updatedAt && this.preserveDates ? updatedAt : time);

        if (this.adapter.getSharedTables()) {
            document.setAttribute('$tenant', this.adapter.getTenant());
        }

        document = await this.encode(collectionDoc, document);

        if (this.validate) {
            const validator = new Permissions();
            if (!validator.isValid(document.getPermissions())) {
                throw new DatabaseException(validator.getDescription());
            }
        }

        const structure = new Structure(collectionDoc);
        if (!structure.isValid(document)) {
            throw new StructureException(structure.getDescription());
        }

        document = await this.withTransaction(async () => {
            if (this.resolveRelationships) {
                document = await this.silent(async () => await this.createDocumentRelationships(collectionDoc, document));
            }

            return await this.adapter.createDocument(collectionDoc.getId(), document);
        });

        if (this.resolveRelationships) {
            document = await this.silent(async () => await this.populateDocumentRelationships(collectionDoc, document));
        }

        document = await this.decode(collectionDoc, document);

        this.trigger(Database.EVENT_DOCUMENT_CREATE, document);
        return document;
    }

    /**
     * Create Documents in a batch
     *
     * @param collection
     * @param documents
     * @param batchSize
     *
     * @return Document[]
     *
     * @throws AuthorizationException
     * @throws StructureException
     * @throws Exception
     */
    public async createDocuments(collection: string, documents: Document[], batchSize: number = Database.INSERT_BATCH_SIZE): Promise<Document[]> {
        if (this.adapter.getSharedTables() && !this.adapter.getTenant()) {
            throw new DatabaseException('Missing tenant. Tenant must be set when table sharing is enabled.');
        }

        if (documents.length === 0) {
            return [];
        }

        const collectionDoc = await this.silent(async () => await this.getCollection(collection));

        const time = DateTime.now();

        for (let i = 0; i < documents.length; i++) {
            const document = documents[i];
            const createdAt = document.getCreatedAt();
            const updatedAt = document.getUpdatedAt();

            document
                .setAttribute('$id', document.getId() ? document.getId() : ID.unique())
                .setAttribute('$collection', collectionDoc.getId())
                .setAttribute('$createdAt', createdAt && this.preserveDates ? createdAt : time)
                .setAttribute('$updatedAt', updatedAt && this.preserveDates ? updatedAt : time);

            documents[i] = await this.encode(collectionDoc, document);

            const validator = new Structure(collectionDoc);
            if (!validator.isValid(documents[i])) {
                throw new StructureException(validator.getDescription());
            }

            if (this.resolveRelationships) {
                documents[i] = await this.silent(async () => await this.createDocumentRelationships(collectionDoc, documents[i]));
            }
        }

        documents = await this.withTransaction(async () => {
            return await this.adapter.createDocuments(collectionDoc.getId(), documents, batchSize);
        });

        for (let i = 0; i < documents.length; i++) {
            if (this.resolveRelationships) {
                documents[i] = await this.silent(async () => await this.populateDocumentRelationships(collectionDoc, documents[i]));
            }

            documents[i] = await this.decode(collectionDoc, documents[i]);
        }

        this.trigger(Database.EVENT_DOCUMENTS_CREATE, documents);

        return documents;
    }

    /**
     * Create Document Relationships
     *
     * @param collection
     * @param document
     * @return Document
     * @throws DatabaseException
     */
    private async createDocumentRelationships(collection: Document, document: Document): Promise<Document> {
        const attributes = collection.getAttribute<Document[]>('attributes', []);

        const relationships = attributes.filter(
            (attribute: Document) => attribute.getAttribute('type') === Database.VAR_RELATIONSHIP
        );

        const stackCount = this.relationshipWriteStack.length;

        for (const relationship of relationships) {
            const key = relationship.getAttribute('key');
            const value = document.getAttribute(key);
            const relatedCollection = await this.getCollection(relationship.getAttribute('options')['relatedCollection']);
            const relationType = relationship.getAttribute('options')['relationType'];
            const twoWay = relationship.getAttribute('options')['twoWay'];
            const twoWayKey = relationship.getAttribute('options')['twoWayKey'];
            const side = relationship.getAttribute('options')['side'];

            if (stackCount >= Database.RELATION_MAX_DEPTH - 1 && this.relationshipWriteStack[stackCount - 1] !== relatedCollection.getId()) {
                document.removeAttribute(key);
                continue;
            }

            this.relationshipWriteStack.push(collection.getId());

            try {
                switch (typeof value) {
                    case 'object':
                        if (Array.isArray(value)) {
                            if (
                                (relationType === Database.RELATION_MANY_TO_ONE && side === Database.RELATION_SIDE_PARENT) ||
                                (relationType === Database.RELATION_ONE_TO_MANY && side === Database.RELATION_SIDE_CHILD) ||
                                (relationType === Database.RELATION_ONE_TO_ONE)
                            ) {
                                throw new RelationshipException('Invalid relationship value. Must be either a document ID or a document, array given.');
                            }

                            for (const related of value) {
                                if (related instanceof Document) {
                                    await this.relateDocuments(
                                        collection,
                                        relatedCollection,
                                        key,
                                        document,
                                        related,
                                        relationType,
                                        twoWay,
                                        twoWayKey,
                                        side,
                                    );
                                } else if (typeof related === 'string') {
                                    await this.relateDocumentsById(
                                        collection,
                                        relatedCollection,
                                        key,
                                        document.getId(),
                                        related,
                                        relationType,
                                        twoWay,
                                        twoWayKey,
                                        side,
                                    );
                                } else {
                                    throw new RelationshipException('Invalid relationship value. Must be either a document, document ID, or an array of documents or document IDs.');
                                }
                            }
                            document.removeAttribute(key);
                        } else if (value instanceof Document) {
                            if (relationType === Database.RELATION_ONE_TO_ONE && !twoWay && side === Database.RELATION_SIDE_CHILD) {
                                throw new RelationshipException('Invalid relationship value. Cannot set a value from the child side of a oneToOne relationship when twoWay is false.');
                            }

                            if (
                                (relationType === Database.RELATION_ONE_TO_MANY && side === Database.RELATION_SIDE_PARENT) ||
                                (relationType === Database.RELATION_MANY_TO_ONE && side === Database.RELATION_SIDE_CHILD) ||
                                (relationType === Database.RELATION_MANY_TO_MANY)
                            ) {
                                throw new RelationshipException('Invalid relationship value. Must be either an array of documents or document IDs, document given.');
                            }

                            const relatedId = await this.relateDocuments(
                                collection,
                                relatedCollection,
                                key,
                                document,
                                value,
                                relationType,
                                twoWay,
                                twoWayKey,
                                side,
                            );
                            document.setAttribute(key, relatedId);
                        } else {
                            throw new RelationshipException('Invalid relationship value. Must be either a document, document ID, or an array of documents or document IDs.');
                        }
                        break;

                    case 'string':
                        if (relationType === Database.RELATION_ONE_TO_ONE && !twoWay && side === Database.RELATION_SIDE_CHILD) {
                            throw new RelationshipException('Invalid relationship value. Cannot set a value from the child side of a oneToOne relationship when twoWay is false.');
                        }

                        if (
                            (relationType === Database.RELATION_ONE_TO_MANY && side === Database.RELATION_SIDE_PARENT) ||
                            (relationType === Database.RELATION_MANY_TO_ONE && side === Database.RELATION_SIDE_CHILD) ||
                            (relationType === Database.RELATION_MANY_TO_MANY)
                        ) {
                            throw new RelationshipException('Invalid relationship value. Must be either an array of documents or document IDs, document ID given.');
                        }

                        await this.relateDocumentsById(
                            collection,
                            relatedCollection,
                            key,
                            document.getId(),
                            value,
                            relationType,
                            twoWay,
                            twoWayKey,
                            side,
                        );
                        break;

                    case 'undefined':
                        if (
                            (relationType === Database.RELATION_ONE_TO_MANY && side === Database.RELATION_SIDE_CHILD) ||
                            (relationType === Database.RELATION_MANY_TO_ONE && side === Database.RELATION_SIDE_PARENT) ||
                            (relationType === Database.RELATION_ONE_TO_ONE && side === Database.RELATION_SIDE_PARENT) ||
                            (relationType === Database.RELATION_ONE_TO_ONE && side === Database.RELATION_SIDE_CHILD && twoWay)
                        ) {
                            break;
                        }

                        document.removeAttribute(key);
                        break;

                    default:
                        throw new RelationshipException('Invalid relationship value. Must be either a document, document ID, or an array of documents or document IDs.');
                }
            } finally {
                this.relationshipWriteStack.pop();
            }
        }

        return document;
    }

    /**
     * Relate Documents
     *
     * @param collection
     * @param relatedCollection
     * @param key
     * @param document
     * @param relation
     * @param relationType
     * @param twoWay
     * @param twoWayKey
     * @param side
     * @return string related document ID
     *
     * @throws AuthorizationException
     * @throws ConflictException
     * @throws StructureException
     * @throws Exception
     */
    private async relateDocuments(
        collection: Document,
        relatedCollection: Document,
        key: string,
        document: Document,
        relation: Document,
        relationType: string,
        twoWay: boolean,
        twoWayKey: string,
        side: string,
    ): Promise<string> {
        switch (relationType) {
            case Database.RELATION_ONE_TO_ONE:
                if (twoWay) {
                    relation.setAttribute(twoWayKey, document.getId());
                }
                break;
            case Database.RELATION_ONE_TO_MANY:
                if (side === Database.RELATION_SIDE_PARENT) {
                    relation.setAttribute(twoWayKey, document.getId());
                }
                break;
            case Database.RELATION_MANY_TO_ONE:
                if (side === Database.RELATION_SIDE_CHILD) {
                    relation.setAttribute(twoWayKey, document.getId());
                }
                break;
        }

        // Try to get the related document
        let related = await this.getDocument(relatedCollection.getId(), relation.getId());

        if (related.isEmpty()) {
            // If the related document doesn't exist, create it, inheriting permissions if none are set
            if (!relation.getAttribute('$permissions')) {
                relation.setAttribute('$permissions', document.getPermissions());
            }

            related = await this.createDocument(relatedCollection.getId(), relation);
        } else if (related.getAttributes() !== relation.getAttributes()) {
            // İlişkili belge varsa ve veriler aynı değilse, güncelle
            for (const [attribute, value] of Object.entries(relation.getAttributes())) {
                related.setAttribute(attribute, value);
            }

            related = await this.updateDocument(relatedCollection.getId(), related.getId(), related);
        }

        if (relationType === Database.RELATION_MANY_TO_MANY) {
            const junction = this.getJunctionCollection(collection, relatedCollection, side);

            this.createDocument(junction, new Document({
                [key]: related.getId(),
                [twoWayKey]: document.getId(),
                '$permissions': [
                    Permission.read(Role.any()),
                    Permission.update(Role.any()),
                    Permission.delete(Role.any()),
                ]
            }));
        }

        return related.getId();
    }
    /**
         * Relate Documents by ID
         *
         * @param collection
         * @param relatedCollection
         * @param key
         * @param documentId
         * @param relationId
         * @param relationType
         * @param twoWay
         * @param twoWayKey
         * @param side
         * @return void
         * @throws AuthorizationException
         * @throws ConflictException
         * @throws StructureException
         * @throws Exception
         */
    private async relateDocumentsById(
        collection: Document,
        relatedCollection: Document,
        key: string,
        documentId: string,
        relationId: string,
        relationType: string,
        twoWay: boolean,
        twoWayKey: string,
        side: string,
    ): Promise<void> {
        // İlgili belgeyi al, izin hatası durumunda boş olacak
        const related = await this.skipRelationships(async () => await this.getDocument(relatedCollection.getId(), relationId));

        if (related.isEmpty()) {
            return;
        }

        switch (relationType) {
            case Database.RELATION_ONE_TO_ONE:
                if (twoWay) {
                    related.setAttribute(twoWayKey, documentId);
                    await this.skipRelationships(async () => await this.updateDocument(relatedCollection.getId(), relationId, related));
                }
                break;
            case Database.RELATION_ONE_TO_MANY:
                if (side === Database.RELATION_SIDE_PARENT) {
                    related.setAttribute(twoWayKey, documentId);
                    await this.skipRelationships(async () => await this.updateDocument(relatedCollection.getId(), relationId, related));
                }
                break;
            case Database.RELATION_MANY_TO_ONE:
                if (side === Database.RELATION_SIDE_CHILD) {
                    related.setAttribute(twoWayKey, documentId);
                    await this.skipRelationships(async () => await this.updateDocument(relatedCollection.getId(), relationId, related));
                }
                break;
            case Database.RELATION_MANY_TO_MANY:
                this.purgeCachedDocument(relatedCollection.getId(), relationId);

                const junction = this.getJunctionCollection(collection, relatedCollection, side);

                await this.skipRelationships(async () => await this.createDocument(junction, new Document({
                    [key]: related.getId(),
                    [twoWayKey]: documentId,
                    '$permissions': [
                        Permission.read(Role.any()),
                        Permission.update(Role.any()),
                        Permission.delete(Role.any()),
                    ]
                })));
                break;
        }
    }

    /**
     * Update Document
     *
     * @param collection
     * @param id
     * @param document
     * @return Document
     *
     * @throws AuthorizationException
     * @throws ConflictException
     * @throws DatabaseException
     * @throws StructureException
     */
    public async updateDocument(collection: string, id: string, document: Document): Promise<Document> {
        if (this.adapter.getSharedTables() && !this.adapter.getTenant()) {
            throw new DatabaseException('Missing tenant. Tenant must be set when table sharing is enabled.');
        }

        if (!id) {
            throw new DatabaseException('Must define $id attribute');
        }

        const collectionDoc = await this.silent(async () => await this.getCollection(collection));

        document = await this.withTransaction(async () => {
            const time = DateTime.now();
            const old = await Authorization.skip(
                async () => await this.silent(
                    async () => await this.getDocument(collectionDoc.getId(), id, [], true)
                ));

            document = new Document({ ...old.getArrayCopy(), ...document.getArrayCopy() });
            document.setAttribute('$collection', old.getAttribute('$collection')); // Make sure user doesn't switch collection ID

            //document.setAttribute('$collection', old.getAttribute('$collection'));   // Make sure user doesn't switch collection ID
            if (this.adapter.getSharedTables()) {
                document.setAttribute('$tenant', old.getAttribute('$tenant'));           // Make sure user doesn't switch tenant
            }
            document.setAttribute('$createdAt', old.getCreatedAt());                 // Make sure user doesn't switch createdAt
            document = new Document(document.getArrayCopy());

            const relationships = collectionDoc.getAttribute<Document[]>('attributes', []).filter(
                (attribute: Document) => attribute.getAttribute('type') === Database.VAR_RELATIONSHIP
            );

            const updateValidator = new Authorization(Database.PERMISSION_UPDATE);
            const readValidator = new Authorization(Database.PERMISSION_READ);
            let shouldUpdate = false;

            if (collectionDoc.getId() !== Database.METADATA) {
                const documentSecurity = collectionDoc.getAttribute('documentSecurity', false);

                const relationshipMap: { [key: string]: any } = {};
                for (const relationship of relationships) {
                    relationshipMap[relationship.getAttribute('key')] = relationship;
                }

                // Compare if the document has any changes
                for (const [key, value] of Object.entries(document.getArrayCopy())) {
                    // Skip the nested documents as they will be checked later in recursions.
                    if (relationshipMap[key]) {
                        // No need to compare nested documents more than max depth.
                        if (this.relationshipWriteStack.length >= Database.RELATION_MAX_DEPTH - 1) {
                            continue;
                        }
                        const relationType = relationshipMap[key]['options']['relationType'];
                        const side = relationshipMap[key]['options']['side'];
                        switch (relationType) {
                            case Database.RELATION_ONE_TO_ONE:
                                const oldValue = old.getAttribute(key) instanceof Document
                                    ? old.getAttribute(key).getId()
                                    : old.getAttribute(key);

                                if ((value === null) !== (oldValue === null)
                                    || (typeof value === 'string' && value !== oldValue)
                                    || (value instanceof Document && value.getId() !== oldValue)
                                ) {
                                    shouldUpdate = true;
                                }
                                break;
                            case Database.RELATION_ONE_TO_MANY:
                            case Database.RELATION_MANY_TO_ONE:
                            case Database.RELATION_MANY_TO_MANY:
                                if (
                                    (relationType === Database.RELATION_MANY_TO_ONE && side === Database.RELATION_SIDE_PARENT) ||
                                    (relationType === Database.RELATION_ONE_TO_MANY && side === Database.RELATION_SIDE_CHILD)
                                ) {
                                    const oldValue = old.getAttribute(key) instanceof Document
                                        ? old.getAttribute(key).getId()
                                        : old.getAttribute(key);

                                    if ((value === null) !== (oldValue === null)
                                        || (typeof value === 'string' && value !== oldValue)
                                        || (value instanceof Document && value.getId() !== oldValue)
                                    ) {
                                        shouldUpdate = true;
                                    }
                                    break;
                                }

                                if (!Array.isArray(value)) {
                                    throw new RelationshipException('Invalid relationship value. Must be either an array of documents or document IDs, ' + typeof value + ' given.');
                                }

                                if (old.getAttribute(key).length !== value.length) {
                                    shouldUpdate = true;
                                    break;
                                }

                                for (let i = 0; i < value.length; i++) {
                                    const relation = value[i];
                                    const oldValue = old.getAttribute(key)[i] instanceof Document
                                        ? old.getAttribute(key)[i].getId()
                                        : old.getAttribute(key)[i];

                                    if (
                                        (typeof relation === 'string' && relation !== oldValue) ||
                                        (relation instanceof Document && relation.getId() !== oldValue)
                                    ) {
                                        shouldUpdate = true;
                                        break;
                                    }
                                }
                                break;
                        }

                        if (shouldUpdate) {
                            break;
                        }

                        continue;
                    }

                    const oldValue = old.getAttribute(key);

                    // If values are not equal we need to update document.
                    if (value !== oldValue) {
                        shouldUpdate = true;
                        break;
                    }
                }

                const updatePermissions = [
                    ...collectionDoc.getUpdate(),
                    ...(documentSecurity ? old.getUpdate() : [])
                ];

                const readPermissions = [
                    ...collectionDoc.getRead(),
                    ...(documentSecurity ? old.getRead() : [])
                ];

                if (shouldUpdate && !updateValidator.isValid(updatePermissions)) {
                    throw new AuthorizationException(updateValidator.getDescription());
                } else if (!shouldUpdate && !readValidator.isValid(readPermissions)) {
                    throw new AuthorizationException(readValidator.getDescription());
                }
            }

            if (old.isEmpty()) {
                return new Document();
            }

            if (shouldUpdate) {
                const updatedAt = document.getUpdatedAt();
                document.setAttribute('$updatedAt', !updatedAt || !this.preserveDates ? time : updatedAt);
            }

            // Check if document was updated after the request timestamp
            const oldUpdatedAt = new Date(old.getUpdatedAt() ?? 0);
            if (this.timestamp && oldUpdatedAt > this.timestamp) {
                throw new ConflictException('Document was updated after the request timestamp');
            }

            document = await this.encode(collectionDoc, document);

            const structureValidator = new Structure(collectionDoc);

            if (!structureValidator.isValid(document)) { // Make sure updated structure still apply collection rules (if any)
                throw new StructureException(structureValidator.getDescription());
            }

            if (this.resolveRelationships) {
                document = await this.silent(async () => await this.updateDocumentRelationships(collectionDoc, old, document));
            }

            this.adapter.updateDocument(collectionDoc.getId(), document);

            return document;
        })

        if (this.resolveRelationships) {
            document = await this.silent(async () => await this.populateDocumentRelationships(collectionDoc, document));
        }

        document = await this.decode(collectionDoc, document);

        this.purgeRelatedDocuments(collectionDoc, id);
        this.purgeCachedDocument(collectionDoc.getId(), id);
        this.trigger(Database.EVENT_DOCUMENT_UPDATE, document);

        return document;
    }

    /**
     * Update Documents in a batch
     *
     * @param collection
     * @param documents
     * @param batchSize
     *
     * @return Document[]
     *
     * @throws AuthorizationException
     * @throws Exception
     * @throws StructureException
     */
    public async updateDocuments(collection: string, documents: Document[], batchSize: number = Database.INSERT_BATCH_SIZE): Promise<Document[]> {
        if (this.adapter.getSharedTables() && !this.adapter.getTenant()) {
            throw new DatabaseException('Missing tenant. Tenant must be set when table sharing is enabled.');
        }

        if (documents.length === 0) {
            return [];
        }

        const collectionDoc = await this.silent(async () => await this.getCollection(collection));

        documents = await this.withTransaction(async () => {
            const time = DateTime.now();

            for (let i = 0; i < documents.length; i++) {
                const document = documents[i];
                if (!document.getId()) {
                    throw new DatabaseException('Must define $id attribute for each document');
                }

                const updatedAt = document.getUpdatedAt();
                document.setAttribute('$updatedAt', !updatedAt || !this.preserveDates ? time : updatedAt);
                documents[i] = await this.encode(collectionDoc, document);

                const old = await Authorization.skip(async () => await this.silent(
                    () => this.getDocument(
                        collectionDoc.getId(),
                        document.getId(),
                        [],
                        true
                    )
                ));

                const validator = new Authorization(Database.PERMISSION_UPDATE);
                if (
                    collectionDoc.getId() !== Database.METADATA
                    && !validator.isValid(old.getUpdate())
                ) {
                    throw new AuthorizationException(validator.getDescription());
                }

                const structureValidator = new Structure(collectionDoc);
                if (!structureValidator.isValid(documents[i])) {
                    throw new StructureException(structureValidator.getDescription());
                }

                if (this.resolveRelationships) {
                    documents[i] = await this.silent(async () => await this.updateDocumentRelationships(collectionDoc, old, documents[i]));
                }
            }

            return this.adapter.updateDocuments(collectionDoc.getId(), documents, batchSize);
        });

        for (let i = 0; i < documents.length; i++) {
            let document = documents[i];
            if (this.resolveRelationships) {
                document = await this.silent(async () => await this.populateDocumentRelationships(collectionDoc, document));
            }

            documents[i] = await this.decode(collectionDoc, document);

            this.purgeCachedDocument(collectionDoc.getId(), document.getId());
        }

        this.trigger(Database.EVENT_DOCUMENTS_UPDATE, documents);

        return documents;
    }


    /**
         * Update Document Relationships
         *
         * @param collection
         * @param old
         * @param document
         *
         * @return Document
         * @throws AuthorizationException
         * @throws ConflictException
         * @throws DatabaseException
         * @throws DuplicateException
         * @throws StructureException
         */
    private async updateDocumentRelationships(collection: Document, old: Document, document: Document): Promise<Document> {
        const attributes = collection.getAttribute('attributes', []);

        const relationships = attributes.filter(
            (attribute: any) => attribute['type'] === Database.VAR_RELATIONSHIP
        );

        const stackCount = this.relationshipWriteStack.length;

        for (const relationship of relationships) {
            const key = relationship['key'];
            const value: any = document.getAttribute(key);
            const oldValue = old.getAttribute(key);
            const relatedCollection = await this.getCollection(relationship['options']['relatedCollection']);
            const relationType = relationship['options']['relationType'];
            const twoWay = relationship['options']['twoWay'];
            const twoWayKey = relationship['options']['twoWayKey'];
            const side = relationship['options']['side'];

            if (oldValue === value) {
                if (
                    (relationType === Database.RELATION_ONE_TO_ONE ||
                        (relationType === Database.RELATION_MANY_TO_ONE && side === Database.RELATION_SIDE_PARENT)) &&
                    value instanceof Document
                ) {
                    document.setAttribute(key, value.getId());
                    continue;
                }
                document.removeAttribute(key);
                continue;
            }

            if (stackCount >= Database.RELATION_MAX_DEPTH - 1 && this.relationshipWriteStack[stackCount - 1] !== relatedCollection.getId()) {
                document.removeAttribute(key);
                continue;
            }

            this.relationshipWriteStack.push(collection.getId());

            try {
                switch (relationType) {
                    case Database.RELATION_ONE_TO_ONE:
                        if (!twoWay) {
                            if (side === Database.RELATION_SIDE_CHILD) {
                                throw new RelationshipException('Invalid relationship value. Cannot set a value from the child side of a oneToOne relationship when twoWay is false.');
                            }

                            if (typeof value === 'string') {
                                const related =
                                    await this.skipRelationships(async () => await this.getDocument(relatedCollection.getId(), value, [Query.select(['$id'])]));
                                if (related.isEmpty()) {
                                    document.setAttribute(key, null);
                                }
                            } else if (value instanceof Document) {
                                const relationId = this.relateDocuments(
                                    collection,
                                    relatedCollection,
                                    key,
                                    document,
                                    value,
                                    relationType,
                                    false,
                                    twoWayKey,
                                    side,
                                );
                                document.setAttribute(key, relationId);
                            } else if (Array.isArray(value)) {
                                throw new RelationshipException('Invalid relationship value. Must be either a document, document ID or null. Array given.');
                            }

                            break;
                        }

                        switch (typeof value) {
                            case 'string':
                                const related = await this.skipRelationships(async () => await this.getDocument(relatedCollection.getId(), value, [Query.select(['$id'])]));

                                if (related.isEmpty()) {
                                    document.setAttribute(key, null);
                                    break;
                                }
                                if (
                                    oldValue?.getId() !== value
                                    && await this.skipRelationships(async () => await this.findOne(relatedCollection.getId(), [
                                        Query.select(['$id']),
                                        Query.equal(twoWayKey, [value]),
                                    ]))
                                ) {
                                    throw new DuplicateException('Document already has a related document');
                                }

                                await this.skipRelationships(async () => await this.updateDocument(
                                    relatedCollection.getId(),
                                    related.getId(),
                                    related.setAttribute(twoWayKey, document.getId())
                                ));
                                break;
                            case 'object':
                                if (value instanceof Document) {
                                    let related = await this.skipRelationships(async () => await this.getDocument(relatedCollection.getId(), value.getId()));

                                    if (
                                        oldValue?.getId() !== value.getId()
                                        && await this.skipRelationships(async () => await this.findOne(relatedCollection.getId(), [
                                            Query.select(['$id']),
                                            Query.equal(twoWayKey, [value.getId()]),
                                        ]))
                                    ) {
                                        throw new DuplicateException('Document already has a related document');
                                    }

                                    this.relationshipWriteStack.push(relatedCollection.getId());
                                    if (related.isEmpty()) {
                                        if (!value.getAttribute('$permissions')) {
                                            value.setAttribute('$permissions', document.getAttribute('$permissions'));
                                        }
                                        related = await this.createDocument(
                                            relatedCollection.getId(),
                                            value.setAttribute(twoWayKey, document.getId())
                                        );
                                    } else {
                                        related = await this.updateDocument(
                                            relatedCollection.getId(),
                                            related.getId(),
                                            value.setAttribute(twoWayKey, document.getId())
                                        );
                                    }
                                    this.relationshipWriteStack.pop();

                                    document.setAttribute(key, related.getId());
                                    break;
                                }
                            case 'undefined':
                                if (oldValue?.getId()) {
                                    const oldRelated = await this.skipRelationships(async () => await this.getDocument(relatedCollection.getId(), oldValue.getId()));
                                    this.skipRelationships(() => this.updateDocument(
                                        relatedCollection.getId(),
                                        oldRelated.getId(),
                                        oldRelated.setAttribute(twoWayKey, null)
                                    ));
                                }
                                break;
                            default:
                                throw new RelationshipException('Invalid relationship value. Must be either a document, document ID or null.');
                        }
                        break;
                    case Database.RELATION_ONE_TO_MANY:
                    case Database.RELATION_MANY_TO_ONE:
                        if (
                            (relationType === Database.RELATION_ONE_TO_MANY && side === Database.RELATION_SIDE_PARENT) ||
                            (relationType === Database.RELATION_MANY_TO_ONE && side === Database.RELATION_SIDE_CHILD)
                        ) {
                            if (!Array.isArray(value)) {
                                throw new RelationshipException('Invalid relationship value. Must be either an array of documents or document IDs, ' + typeof value + ' given.');
                            }

                            const oldIds = oldValue.map((doc: Document) => doc.getId());

                            const newIds = value.map((item: any) => {
                                if (typeof item === 'string') {
                                    return item;
                                } else if (item instanceof Document) {
                                    return item.getId();
                                } else {
                                    throw new RelationshipException('Invalid relationship value. No ID provided.');
                                }
                            });

                            const removedDocuments = oldIds.filter((id: string) => !newIds.includes(id));

                            for (const relation of removedDocuments) {
                                Authorization.skip(() => this.skipRelationships(() => this.updateDocument(
                                    relatedCollection.getId(),
                                    relation,
                                    new Document({ [twoWayKey]: null })
                                )));
                            }

                            for (const relation of value) {
                                if (typeof relation === 'string') {
                                    const related = await this.skipRelationships(
                                        async () => await this.getDocument(relatedCollection.getId(), relation, [Query.select(['$id'])])
                                    );

                                    if (related.isEmpty()) {
                                        continue;
                                    }

                                    this.skipRelationships(() => this.updateDocument(
                                        relatedCollection.getId(),
                                        related.getId(),
                                        related.setAttribute(twoWayKey, document.getId())
                                    ));
                                } else if (relation instanceof Document) {
                                    const related = await this.skipRelationships(
                                        async () => await this.getDocument(relatedCollection.getId(), relation.getId(), [Query.select(['$id'])])
                                    );

                                    if (related.isEmpty()) {
                                        if (!relation.getAttribute('$permissions')) {
                                            relation.setAttribute('$permissions', document.getAttribute('$permissions'));
                                        }
                                        this.createDocument(
                                            relatedCollection.getId(),
                                            relation.setAttribute(twoWayKey, document.getId())
                                        );
                                    } else {
                                        this.updateDocument(
                                            relatedCollection.getId(),
                                            related.getId(),
                                            relation.setAttribute(twoWayKey, document.getId())
                                        );
                                    }
                                } else {
                                    throw new RelationshipException('Invalid relationship value.');
                                }
                            }

                            document.removeAttribute(key);
                            break;
                        }

                        if (typeof value === 'string') {
                            const related = await this.skipRelationships(
                                async () => await this.getDocument(relatedCollection.getId(), value, [Query.select(['$id'])])
                            );

                            if (related.isEmpty()) {
                                document.setAttribute(key, null);
                            }
                            this.purgeCachedDocument(relatedCollection.getId(), value);
                        } else if (value instanceof Document) {
                            const related = await this.skipRelationships(
                                async () => await this.getDocument(relatedCollection.getId(), value.getId(), [Query.select(['$id'])])
                            );

                            if (related.isEmpty()) {
                                if (!value.getAttribute('$permissions')) {
                                    value.setAttribute('$permissions', document.getAttribute('$permissions'));
                                }
                                this.createDocument(
                                    relatedCollection.getId(),
                                    value
                                );
                            } else if (related.getAttributes() !== value.getAttributes()) {
                                this.updateDocument(
                                    relatedCollection.getId(),
                                    related.getId(),
                                    value
                                );
                                this.purgeCachedDocument(relatedCollection.getId(), related.getId());
                            }

                            document.setAttribute(key, value.getId());
                        } else if (value === null) {
                            break;
                        } else if (Array.isArray(value)) {
                            throw new RelationshipException('Invalid relationship value. Must be either a document ID or a document, array given.');
                        } else if (value === '') {
                            throw new RelationshipException('Invalid relationship value. Must be either a document ID or a document.');
                        } else {
                            throw new RelationshipException('Invalid relationship value.');
                        }

                        break;
                    case Database.RELATION_MANY_TO_MANY:
                        if (value === null) {
                            break;
                        }
                        if (!Array.isArray(value)) {
                            throw new RelationshipException('Invalid relationship value. Must be an array of documents or document IDs.');
                        }

                        const oldIds = oldValue.map((doc: Document) => doc.getId());

                        const newIds = value.map((item: any) => {
                            if (typeof item === 'string') {
                                return item;
                            } else if (item instanceof Document) {
                                return item.getId();
                            } else {
                                throw new RelationshipException('Invalid relationship value. Must be either a document or document ID.');
                            }
                        });

                        const removedDocuments = oldIds.filter((id: string) => !newIds.includes(id));

                        for (const relation of removedDocuments) {
                            const junction = this.getJunctionCollection(collection, relatedCollection, side);

                            const junctions = await this.find(junction, [
                                Query.equal(key, [relation]),
                                Query.equal(twoWayKey, [document.getId()]),
                                Query.limit(Number.MAX_SAFE_INTEGER)
                            ]);

                            for (const junction of junctions) {
                                Authorization.skip(() => this.deleteDocument(junction.getCollection(), junction.getId()));
                            }
                        }

                        for (let relation of value) {
                            if (typeof relation === 'string') {
                                if (oldIds.includes(relation) || (await this.getDocument(relatedCollection.getId(), relation, [Query.select(['$id'])])).isEmpty()) {
                                    continue;
                                }
                            } else if (relation instanceof Document) {
                                let related = await this.getDocument(relatedCollection.getId(), relation.getId(), [Query.select(['$id'])]);

                                if (related.isEmpty()) {
                                    if (!(value as any).getAttribute('$permissions')) {
                                        relation.setAttribute('$permissions', document.getAttribute('$permissions'));
                                    }
                                    related = await this.createDocument(
                                        relatedCollection.getId(),
                                        relation
                                    );
                                } else if (related.getAttributes() !== relation.getAttributes()) {
                                    related = await this.updateDocument(
                                        relatedCollection.getId(),
                                        related.getId(),
                                        relation
                                    );
                                }

                                if (oldIds.includes(relation.getId())) {
                                    continue;
                                }

                                relation = related.getId();
                            } else {
                                throw new RelationshipException('Invalid relationship value. Must be either a document or document ID.');
                            }

                            await this.skipRelationships(() => this.createDocument(
                                this.getJunctionCollection(collection, relatedCollection, side),
                                new Document({
                                    [key]: relation,
                                    [twoWayKey]: document.getId(),
                                    '$permissions': [
                                        Permission.read(Role.any()),
                                        Permission.update(Role.any()),
                                        Permission.delete(Role.any()),
                                    ],
                                })
                            ));
                        }

                        document.removeAttribute(key);
                        break;
                }
            } finally {
                this.relationshipWriteStack.pop();
            }
        }

        return document;
    }

    private getJunctionCollection(collection: Document, relatedCollection: Document, side: string): string {
        return side === Database.RELATION_SIDE_PARENT
            ? `_${collection.getInternalId()}_${relatedCollection.getInternalId()}`
            : `_${relatedCollection.getInternalId()}_${collection.getInternalId()}`;
    }

    /**
     * Increase a document attribute by a value
     *
     * @param collection
     * @param id
     * @param attribute
     * @param value
     * @param max
     * @return boolean
     *
     * @throws AuthorizationException
     * @throws DatabaseException
     * @throws Exception
     */
    public async increaseDocumentAttribute(collection: string, id: string, attribute: string, value: number = 1, max: number | null = null): Promise<boolean> {
        if (this.adapter.getSharedTables() && !this.adapter.getTenant()) {
            throw new DatabaseException('Missing tenant. Tenant must be set when table sharing is enabled.');
        }

        if (value <= 0) { // Can be a float
            throw new DatabaseException('Value must be numeric and greater than 0');
        }

        const validator = new Authorization(Database.PERMISSION_UPDATE);

        const document = await Authorization.skip(async () => await this.silent(async () => await this.getDocument(collection, id))); // Skip ensures user does not need read permission for this

        if (document.isEmpty()) {
            return false;
        }

        const collectionDoc = await this.silent(async () => await this.getCollection(collection));

        if (collectionDoc.getId() !== Database.METADATA) {
            const documentSecurity = collectionDoc.getAttribute('documentSecurity', false);
            if (!validator.isValid([
                ...collectionDoc.getUpdate(),
                ...(documentSecurity ? document.getUpdate() : [])
            ])) {
                throw new AuthorizationException(validator.getDescription());
            }
        }

        const attributes = collectionDoc.getAttribute('attributes', []).filter((a: any) => a['$id'] === attribute);

        if (attributes.length === 0) {
            throw new DatabaseException('Attribute not found');
        }

        const whiteList = [Database.VAR_INTEGER, Database.VAR_FLOAT];

        const attr = attributes[0];
        if (!whiteList.includes(attr.getAttribute('type'))) {
            throw new DatabaseException('Attribute type must be one of: ' + whiteList.join(','));
        }

        if (max !== null && (document.getAttribute(attribute) + value > max)) {
            throw new DatabaseException('Attribute value exceeds maximum limit: ' + max);
        }

        const time = DateTime.now();
        const updatedAt = document.getUpdatedAt();
        const newUpdatedAt = (!updatedAt || !this.preserveDates) ? time : updatedAt;

        // Check if document was updated after the request timestamp
        const oldUpdatedAt = new Date(document.getUpdatedAt() ?? '');

        if (this.timestamp && oldUpdatedAt > this.timestamp) {
            throw new ConflictException('Document was updated after the request timestamp');
        }

        const maxValue = max !== null ? max - value : null;

        const result = this.adapter.increaseDocumentAttribute(
            collectionDoc.getId(),
            id,
            attribute,
            value,
            newUpdatedAt,
            maxValue ?? undefined
        );

        this.purgeCachedDocument(collectionDoc.getId(), id);

        this.trigger(Database.EVENT_DOCUMENT_INCREASE, document);

        return result;
    }

    /**
     * Decrease a document attribute by a value
     *
     * @param collection
     * @param id
     * @param attribute
     * @param value
     * @param min
     * @return boolean
     *
     * @throws AuthorizationException
     * @throws DatabaseException
     */
    public async decreaseDocumentAttribute(collection: string, id: string, attribute: string, value: number = 1, min: number | null = null): Promise<boolean> {
        if (this.adapter.getSharedTables() && !this.adapter.getTenant()) {
            throw new DatabaseException('Missing tenant. Tenant must be set when table sharing is enabled.');
        }

        if (value <= 0) { // Can be a float
            throw new DatabaseException('Value must be numeric and greater than 0');
        }

        const validator = new Authorization(Database.PERMISSION_UPDATE);

        const document = await Authorization.skip(async () => await this.silent(async () => await this.getDocument(collection, id))); // Skip ensures user does not need read permission for this

        if (document.isEmpty()) {
            return false;
        }

        const collectionDoc = await this.silent(async () => await this.getCollection(collection));

        if (collectionDoc.getId() !== Database.METADATA) {
            const documentSecurity = collectionDoc.getAttribute('documentSecurity', false);
            if (!validator.isValid([
                ...collectionDoc.getUpdate(),
                ...(documentSecurity ? document.getUpdate() : [])
            ])) {
                throw new AuthorizationException(validator.getDescription());
            }
        }

        const attributes = collectionDoc.getAttribute('attributes', []).filter((a: any) => a['$id'] === attribute);

        if (attributes.length === 0) {
            throw new DatabaseException('Attribute not found');
        }

        const whiteList = [Database.VAR_INTEGER, Database.VAR_FLOAT];

        const attr = attributes[0];
        if (!whiteList.includes(attr.getAttribute('type'))) {
            throw new DatabaseException('Attribute type must be one of: ' + whiteList.join(','));
        }

        if (min !== null && (document.getAttribute(attribute) - value < min)) {
            throw new DatabaseException('Attribute value exceeds minimum limit: ' + min);
        }

        const time = DateTime.now();
        const updatedAt = document.getUpdatedAt();
        const newUpdatedAt = (!updatedAt || !this.preserveDates) ? time : updatedAt;

        // Check if document was updated after the request timestamp
        const oldUpdatedAt = new Date(document.getUpdatedAt() ?? '');
        if (this.timestamp && oldUpdatedAt > this.timestamp) {
            throw new ConflictException('Document was updated after the request timestamp');
        }

        const minValue = min !== null ? min + value : null;

        const result = this.adapter.increaseDocumentAttribute(
            collectionDoc.getId(),
            id,
            attribute,
            value * -1,
            newUpdatedAt,
            minValue ?? undefined
        );

        this.purgeCachedDocument(collectionDoc.getId(), id);

        this.trigger(Database.EVENT_DOCUMENT_DECREASE, document);

        return result;
    }

    /**
     * Delete Document
     *
     * @param collection
     * @param id
     *
     * @return boolean
     *
     * @throws AuthorizationException
     * @throws ConflictException
     * @throws DatabaseException
     * @throws RestrictedException
     * @throws StructureException
     */
    public async deleteDocument(collection: string, id: string): Promise<boolean> {
        if (this.adapter.getSharedTables() && !this.adapter.getTenant()) {
            throw new DatabaseException('Missing tenant. Tenant must be set when table sharing is enabled.');
        }

        const collectionDoc = await this.silent(async () => await this.getCollection(collection));

        let document;
        const deleted = await this.withTransaction(async () => {
            document = await Authorization.skip(async () => await this.silent(
                async () => await this.getDocument(collectionDoc.getId(), id, [], true)
            ));

            if (document.isEmpty()) {
                return false;
            }

            const validator = new Authorization(Database.PERMISSION_DELETE);

            if (collectionDoc.getId() !== Database.METADATA) {
                const documentSecurity = collectionDoc.getAttribute('documentSecurity', false);
                if (!validator.isValid([
                    ...collectionDoc.getDelete(),
                    ...(documentSecurity ? document.getDelete() : [])
                ])) {
                    throw new AuthorizationException(validator.getDescription());
                }
            }

            // Check if document was updated after the request timestamp
            const oldUpdatedAt = new Date(document.getUpdatedAt() ?? '');
            if (this.timestamp && oldUpdatedAt > this.timestamp) {
                throw new ConflictException('Document was updated after the request timestamp');
            }

            if (this.resolveRelationships) {
                document = await this.silent(async () => await this.deleteDocumentRelationships(collectionDoc, document));
            }

            return this.adapter.deleteDocument(collectionDoc.getId(), id);
        });

        this.purgeRelatedDocuments(collectionDoc, id);
        this.purgeCachedDocument(collectionDoc.getId(), id);

        this.trigger(Database.EVENT_DOCUMENT_DELETE, document);

        return deleted;
    }

    /**
     * Delete Document Relationships
     *
     * @param collection
     * @param document
     * @return Document
     * @throws AuthorizationException
     * @throws ConflictException
     * @throws DatabaseException
     * @throws RestrictedException
     * @throws StructureException
     */
    private async deleteDocumentRelationships(collection: Document, document: Document): Promise<Document> {
        const attributes = collection.getAttribute('attributes', []);

        const relationships = attributes.filter(
            (attribute: any) => attribute['type'] === Database.VAR_RELATIONSHIP
        );

        for (const relationship of relationships) {
            const key = relationship['key'];
            const value = document.getAttribute(key);
            const relatedCollection = await this.getCollection(relationship['options']['relatedCollection']);
            const relationType = relationship['options']['relationType'];
            const twoWay = relationship['options']['twoWay'];
            const twoWayKey = relationship['options']['twoWayKey'];
            const onDelete = relationship['options']['onDelete'];
            const side = relationship['options']['side'];

            relationship.setAttribute('collection', collection.getId());
            relationship.setAttribute('document', document.getId());

            switch (onDelete) {
                case Database.RELATION_MUTATE_RESTRICT:
                    await this.deleteRestrict(relatedCollection, document, value, relationType, twoWay, twoWayKey, side);
                    break;
                case Database.RELATION_MUTATE_SET_NULL:
                    await this.deleteSetNull(collection, relatedCollection, document, value, relationType, twoWay, twoWayKey, side);
                    break;
                case Database.RELATION_MUTATE_CASCADE:
                    for (const processedRelationship of this.relationshipDeleteStack) {
                        const existingKey = processedRelationship['key'];
                        const existingCollection = processedRelationship['collection'];
                        const existingRelatedCollection = processedRelationship['options']['relatedCollection'];
                        const existingTwoWayKey = processedRelationship['options']['twoWayKey'];
                        const existingSide = processedRelationship['options']['side'];

                        const reflexive = processedRelationship === relationship;

                        const symmetric = existingKey === twoWayKey
                            && existingTwoWayKey === key
                            && existingRelatedCollection === collection.getId()
                            && existingCollection === relatedCollection.getId()
                            && existingSide !== side;

                        const transitive = ((existingKey === twoWayKey
                            && existingCollection === relatedCollection.getId()
                            && existingSide !== side)
                            || (existingTwoWayKey === key
                                && existingRelatedCollection === collection.getId()
                                && existingSide !== side)
                            || (existingKey === key
                                && existingTwoWayKey !== twoWayKey
                                && existingRelatedCollection === relatedCollection.getId()
                                && existingSide !== side)
                            || (existingKey !== key
                                && existingTwoWayKey === twoWayKey
                                && existingRelatedCollection === relatedCollection.getId()
                                && existingSide !== side));

                        if (reflexive || symmetric || transitive) {
                            break;
                        }
                    }
                    this.deleteCascade(collection, relatedCollection, document, key, value, relationType, twoWayKey, side, relationship);
                    break;
            }
        }

        return document;
    }

    /**
     * Delete Restrict
     *
     * @param relatedCollection
     * @param document
     * @param value
     * @param relationType
     * @param twoWay
     * @param twoWayKey
     * @param side
     * @throws AuthorizationException
     * @throws ConflictException
     * @throws DatabaseException
     * @throws RestrictedException
     * @throws StructureException
     */
    private async deleteRestrict(
        relatedCollection: Document,
        document: Document,
        value: any,
        relationType: string,
        twoWay: boolean,
        twoWayKey: string,
        side: string
    ): Promise<void> {
        if (value instanceof Document && value.isEmpty()) {
            value = null;
        }

        if (
            value !== null
            && relationType !== Database.RELATION_MANY_TO_ONE
            && side === Database.RELATION_SIDE_PARENT
        ) {
            throw new RestrictedException('Cannot delete document because it has at least one related document.');
        }

        if (
            relationType === Database.RELATION_ONE_TO_ONE
            && side === Database.RELATION_SIDE_CHILD
            && !twoWay
        ) {
            Authorization.skip(async () => {
                const related = await this.findOne(relatedCollection.getId(), [
                    Query.select(['$id']),
                    Query.equal(twoWayKey, [document.getId()])
                ]);

                if (!(related instanceof Document)) {
                    return;
                }

                await this.skipRelationships(async () => await this.updateDocument(
                    relatedCollection.getId(),
                    related.getId(),
                    new Document({
                        [twoWayKey]: null
                    })
                ));
            });
        }

        if (
            relationType === Database.RELATION_MANY_TO_ONE
            && side === Database.RELATION_SIDE_CHILD
        ) {
            const related = await Authorization.skip(async () => await this.findOne(relatedCollection.getId(), [
                Query.select(['$id']),
                Query.equal(twoWayKey, [document.getId()])
            ]));

            if (related) {
                throw new RestrictedException('Cannot delete document because it has at least one related document.');
            }
        }
    }

    /**
     * Delete Set Null
     *
     * @param collection
     * @param relatedCollection
     * @param document
     * @param value
     * @param relationType
     * @param twoWay
     * @param twoWayKey
     * @param side
     * @return void
     * @throws AuthorizationException
     * @throws ConflictException
     * @throws DatabaseException
     * @throws RestrictedException
     * @throws StructureException
     */
    private async deleteSetNull(
        collection: Document,
        relatedCollection: Document,
        document: Document,
        value: any,
        relationType: string,
        twoWay: boolean,
        twoWayKey: string,
        side: string
    ): Promise<void> {
        switch (relationType) {
            case Database.RELATION_ONE_TO_ONE:
                if (!twoWay && side === Database.RELATION_SIDE_PARENT) {
                    break;
                }

                await Authorization.skip(async () => {
                    if (!twoWay && side === Database.RELATION_SIDE_CHILD) {
                        const related = await this.findOne(relatedCollection.getId(), [
                            Query.select(['$id']),
                            Query.equal(twoWayKey, [document.getId()])
                        ]);
                        if (!(related instanceof Document)) {
                            return;
                        }
                        this.skipRelationships(() => this.updateDocument(
                            relatedCollection.getId(),
                            related.getId(),
                            new Document({
                                [twoWayKey]: null
                            })
                        ));
                    } else {
                        if (!value) {
                            return;
                        }
                        const related = await this.getDocument(relatedCollection.getId(), value.getId(), [Query.select(['$id'])]);
                        if (!(related instanceof Document)) {
                            return;
                        }
                        this.skipRelationships(() => this.updateDocument(
                            relatedCollection.getId(),
                            related.getId(),
                            new Document({
                                [twoWayKey]: null
                            })
                        ));
                    }
                });
                break;

            case Database.RELATION_ONE_TO_MANY:
                if (side === Database.RELATION_SIDE_CHILD) {
                    break;
                }
                for (const relation of value) {
                    await Authorization.skip(async () => {
                        await this.skipRelationships(async () => await this.updateDocument(
                            relatedCollection.getId(),
                            relation.getId(),
                            new Document({
                                [twoWayKey]: null
                            })
                        ));
                    });
                }
                break;

            case Database.RELATION_MANY_TO_ONE:
                if (side === Database.RELATION_SIDE_PARENT) {
                    break;
                }

                if (!twoWay) {
                    value = this.find(relatedCollection.getId(), [
                        Query.select(['$id']),
                        Query.equal(twoWayKey, [document.getId()]),
                        Query.limit(Number.MAX_SAFE_INTEGER)
                    ]);
                }

                for (const relation of value) {
                    await Authorization.skip(async () => {
                        await this.skipRelationships(async () => await this.updateDocument(
                            relatedCollection.getId(),
                            relation.getId(),
                            new Document({
                                [twoWayKey]: null
                            })
                        ));
                    });
                }
                break;

            case Database.RELATION_MANY_TO_MANY:
                const junction = this.getJunctionCollection(collection, relatedCollection, side);

                const junctions = await this.find(junction, [
                    Query.select(['$id']),
                    Query.equal(twoWayKey, [document.getId()]),
                    Query.limit(Number.MAX_SAFE_INTEGER)
                ]);

                for (const junctionDoc of junctions) {
                    this.skipRelationships(() => this.deleteDocument(
                        junction,
                        junctionDoc.getId()
                    ));
                }
                break;
        }
    }

    /**
     * Delete Cascade
     *
     * @param collection
     * @param relatedCollection
     * @param document
     * @param key
     * @param value
     * @param relationType
     * @param twoWayKey
     * @param side
     * @param relationship
     * @return void
     * @throws AuthorizationException
     * @throws ConflictException
     * @throws DatabaseException
     * @throws RestrictedException
     * @throws StructureException
     */
    private async deleteCascade(
        collection: Document,
        relatedCollection: Document,
        document: Document,
        key: string,
        value: any,
        relationType: string,
        twoWayKey: string,
        side: string,
        relationship: Document
    ): Promise<void> {
        switch (relationType) {
            case Database.RELATION_ONE_TO_ONE:
                if (value !== null) {
                    this.relationshipDeleteStack.push(relationship);

                    this.deleteDocument(
                        relatedCollection.getId(),
                        value.getId()
                    );

                    this.relationshipDeleteStack.pop();
                }
                break;
            case Database.RELATION_ONE_TO_MANY:
                if (side === Database.RELATION_SIDE_CHILD) {
                    break;
                }

                this.relationshipDeleteStack.push(relationship);

                for (const relation of value) {
                    this.deleteDocument(
                        relatedCollection.getId(),
                        relation.getId()
                    );
                }

                this.relationshipDeleteStack.pop();
                break;
            case Database.RELATION_MANY_TO_ONE:
                if (side === Database.RELATION_SIDE_PARENT) {
                    break;
                }

                value = this.find(relatedCollection.getId(), [
                    Query.select(['$id']),
                    Query.equal(twoWayKey, [document.getId()]),
                    Query.limit(Number.MAX_SAFE_INTEGER),
                ]);

                this.relationshipDeleteStack.push(relationship);

                for (const relation of value) {
                    this.deleteDocument(
                        relatedCollection.getId(),
                        relation.getId()
                    );
                }

                this.relationshipDeleteStack.pop();
                break;
            case Database.RELATION_MANY_TO_MANY:
                const junction = this.getJunctionCollection(collection, relatedCollection, side);

                const junctions = await this.skipRelationships(async () => await this.find(junction, [
                    Query.select(['$id', key]),
                    Query.equal(twoWayKey, [document.getId()]),
                    Query.limit(Number.MAX_SAFE_INTEGER)
                ]));

                this.relationshipDeleteStack.push(relationship);

                for (const junctionDoc of junctions) {
                    if (side === Database.RELATION_SIDE_PARENT) {
                        this.deleteDocument(
                            relatedCollection.getId(),
                            junctionDoc.getAttribute(key)
                        );
                    }
                    this.deleteDocument(
                        junction,
                        junctionDoc.getId()
                    );
                }

                this.relationshipDeleteStack.pop();
                break;
        }
    }


    /**
    * Cleans all the collection's documents from the cache
    * And all related cached documents.
    *
    * @param collectionId
    *
    * @return boolean
    */
    public async purgeCachedCollection(collectionId: string): Promise<boolean> {
        const collectionKey = `${this.cacheName}-cache-${this.getNamespace()}:${this.adapter.getTenant()}:collection:${collectionId}`;
        const documentKeys = await this.cache.list(collectionKey);
        for (const documentKey of documentKeys) {
            await this.cache.purge(documentKey);
        }

        return true;
    }

    /**
     * Cleans a specific document from cache
     * And related document reference in the collection cache.
     *
     * @param collectionId
     * @param id
     *
     * @return boolean
     */
    public async purgeCachedDocument(collectionId: string, id: string): Promise<boolean> {
        const collectionKey = `${this.cacheName}-cache-${this.getNamespace()}:${this.adapter.getTenant()}:collection:${collectionId}`;
        const documentKey = `${collectionKey}:${id}`;

        await this.cache.purge(collectionKey, documentKey);
        await this.cache.purge(documentKey);

        return true;
    }

    /**
     * Find Documents
     *
     * @param collection
     * @param queries
     *
     * @return Document[]
     * @throws DatabaseException
     * @throws QueryException
     * @throws TimeoutException
     */
    public async find(collection: string, queries: Query[] = []): Promise<Document[]> {
        if (this.adapter.getSharedTables() && !this.adapter.getTenant()) {
            throw new DatabaseException('Missing tenant. Tenant must be set when table sharing is enabled.');
        }

        const collectionDoc = await this.silent(async () => await this.getCollection(collection));

        if (collectionDoc.isEmpty()) {
            throw new DatabaseException('Collection not found');
        }

        const attributes = collectionDoc.getAttribute('attributes', []);
        const indexes = collectionDoc.getAttribute('indexes', []);

        if (this.validate) {
            const validator = new DocumentsValidator(attributes, indexes);
            if (!validator.isValid(queries)) {
                throw new QueryException(validator.getDescription());
            }
        }

        const authorization = new Authorization(Database.PERMISSION_READ);
        const documentSecurity = collectionDoc.getAttribute('documentSecurity', false);
        const skipAuth = authorization.isValid(collectionDoc.getRead());

        if (!skipAuth && !documentSecurity && collectionDoc.getId() !== Database.METADATA) {
            throw new AuthorizationException(authorization.getDescription());
        }

        const relationships = attributes.filter(
            (attribute: any) => attribute['type'] === Database.VAR_RELATIONSHIP
        );

        const grouped = Query.groupByType(queries);
        const filters = grouped.filters;
        const selects = grouped.selections;
        const limit = grouped.limit;
        const offset = grouped.offset;
        const orderAttributes = grouped.orderAttributes;
        const orderTypes = grouped.orderTypes;
        const cursor = grouped.cursor;
        const cursorDirection = grouped.cursorDirection;

        if (cursor && cursor.getCollection() !== collectionDoc.getId()) {
            throw new DatabaseException("Cursor Document must be from the same Collection.");
        }

        const cursorData = cursor ? (await this.encode(collectionDoc, cursor)).getArrayCopy() : [];

        queries = [
            ...selects,
            ...Database.convertQueries(collectionDoc, filters)
        ];

        const selections = this.validateSelections(collectionDoc, selects);
        const nestedSelections: Query[] = [];

        for (const query of queries) {
            if (query.getMethod() === Query.TYPE_SELECT) {
                const values = query.getValues();
                for (let i = 0; i < values.length; i++) {
                    const value = values[i];
                    if (value.includes('.')) {
                        nestedSelections.push(Query.select([
                            value.split('.').slice(1).join('.')
                        ]));

                        const key = value.split('.')[0];

                        for (const relationship of relationships) {
                            if (relationship.getAttribute('key') === key) {
                                switch (relationship.getAttribute('options')['relationType']) {
                                    case Database.RELATION_MANY_TO_MANY:
                                    case Database.RELATION_ONE_TO_MANY:
                                        values.splice(i, 1);
                                        break;

                                    case Database.RELATION_MANY_TO_ONE:
                                    case Database.RELATION_ONE_TO_ONE:
                                        values[i] = key;
                                        break;
                                }
                            }
                        }
                    }
                }
                query.setValues(values);
            } else if (query.getAttribute().includes('.')) {
                queries.splice(queries.indexOf(query), 1);
            }
        }

        const getResults = async () => {

            const results = await this.adapter.find(
                collectionDoc.getId(),
                queries,
                limit ?? 25,
                offset ?? 0,
                orderAttributes,
                orderTypes,
                cursorData,
                cursorDirection ?? Database.CURSOR_AFTER);

            return results;
        }

        const results = skipAuth ? await Authorization.skip(getResults) : await getResults();

        for (let node of results) {
            if (this.resolveRelationships && (selects.length === 0 || nestedSelections.length > 0)) {
                node = await this.silent(async () => await this.populateDocumentRelationships(collectionDoc, node, nestedSelections));
            }
            node = this.casting(collectionDoc, node);
            node = await this.decode(collectionDoc, node, selections);

            if (!node.isEmpty()) {
                node.setAttribute('$collection', collectionDoc.getId());
            }
        }

        for (const query of queries) {
            if (query.getMethod() === Query.TYPE_SELECT) {
                const values = query.getValues();
                for (const result of results) {
                    for (const internalAttribute of this.getInternalAttributes()) {
                        if (!values.includes(internalAttribute['$id'])) {
                            result.removeAttribute(internalAttribute['$id']);
                        }
                    }
                }
            }
        }

        this.trigger(Database.EVENT_DOCUMENT_FIND, results);

        return results;
    }

    /**
     * Find One Document
     *
     * @param collection
     * @param queries
     * @return Document | false
     * @throws DatabaseException
     */
    public async findOne(collection: string, queries: Query[] = []): Promise<Document | false> {
        const results = await this.silent(async () => await this.find(collection, [
            Query.limit(1),
            ...queries
        ]));

        const found = results[0] || false;

        this.trigger(Database.EVENT_DOCUMENT_FIND, found);

        return found;
    }

    /**
     * Count Documents
     *
     * Count the number of documents.
     *
     * @param collection
     * @param queries
     * @param max
     *
     * @return number
     * @throws DatabaseException
     */
    public async count(collection: string, queries: Query[] = [], max: number | null = null): Promise<number> {
        if (this.adapter.getSharedTables() && !this.adapter.getTenant()) {
            throw new DatabaseException('Missing tenant. Tenant must be set when table sharing is enabled.');
        }

        const collectionDoc = await this.silent(async () => await this.getCollection(collection));
        const attributes = collectionDoc.getAttribute('attributes', []);
        const indexes = collectionDoc.getAttribute('indexes', []);

        if (this.validate) {
            const validator = new DocumentsValidator(attributes, indexes);
            if (!validator.isValid(queries)) {
                throw new QueryException(validator.getDescription());
            }
        }

        const authorization = new Authorization(Database.PERMISSION_READ);
        const skipAuth = authorization.isValid(collectionDoc.getRead());

        queries = Query.groupByType(queries).filters;
        queries = Database.convertQueries(collectionDoc, queries);

        const getCount = () => this.adapter.count(collectionDoc.getId(), queries, max ?? undefined);
        const count = skipAuth ? await Authorization.skip(getCount) : await getCount();

        this.trigger(Database.EVENT_DOCUMENT_COUNT, count);

        return count;
    }

    /**
     * Sum an attribute
     *
     * Sum an attribute for all the documents. Pass max=0 for unlimited count
     *
     * @param collection
     * @param attribute
     * @param queries
     * @param max
     *
     * @return number
     * @throws DatabaseException
     */
    public async sum(collection: string, attribute: string, queries: Query[] = [], max: number | null = null): Promise<number> {
        if (this.adapter.getSharedTables() && !this.adapter.getTenant()) {
            throw new DatabaseException('Missing tenant. Tenant must be set when table sharing is enabled.');
        }

        const collectionDoc = await this.silent(async () => await this.getCollection(collection));
        const attributes = collectionDoc.getAttribute('attributes', []);
        const indexes = collectionDoc.getAttribute('indexes', []);

        if (this.validate) {
            const validator = new DocumentsValidator(attributes, indexes);
            if (!validator.isValid(queries)) {
                throw new QueryException(validator.getDescription());
            }
        }

        queries = Database.convertQueries(collectionDoc, queries);

        const sum = await this.adapter.sum(collectionDoc.getId(), attribute, queries, max ?? undefined);

        this.trigger(Database.EVENT_DOCUMENT_SUM, sum);

        return sum;
    }

    /**
     * Add Attribute Filter
     *
     * @param name
     * @param encode
     * @param decode
     *
     * @return void
     */
    public static addFilter(name: string, encode: Function, decode: Function): void {
        this.filters[name] = {
            encode: encode,
            decode: decode,
        };
    }

    /**
     * Encode Document
     *
     * @param collection
     * @param document
     *
     * @return Document
     * @throws DatabaseException
     */
    public async encode(collection: Document, document: Document): Promise<Document> {
        const attributes = collection.getAttribute('attributes', []);

        const internalAttributes = Database.INTERNAL_ATTRIBUTES.filter((attribute: Document) => {
            // We don't want to encode permissions into a JSON string
            return attribute.getAttribute('$id') !== '$permissions';
        });

        const allAttributes: Document[] = [...attributes, ...internalAttributes];

        for (const attribute of allAttributes) {
            const key = attribute.getAttribute('$id') ?? '';
            const array = attribute.getAttribute('array') ?? false;
            const defaultValue = attribute.getAttribute('default') ?? null;
            const filters = attribute.getAttribute('filters') ?? [];
            let value = document.getAttribute(key);

            // continue on optional param with no default
            if (value === null && defaultValue === null) {
                continue;
            }

            // assign default only if no value provided
            if (value === null && defaultValue !== null) {
                value = array ? defaultValue : [defaultValue];
            } else {
                value = array ? value : [value];
            }

            for (let i = 0; i < value.length; i++) {
                if (value[i] !== null) {
                    for (const filter of filters) {
                        value[i] = await this.encodeAttribute(filter, value[i], document);
                    }
                }
            }

            if (!array) {
                value = value[0];
            }

            document.setAttribute(key, value);
        }

        return document;
    }

    /**
     * Decode Document
     *
     * @param collection
     * @param document
     * @param selections
     * @return Document
     * @throws DatabaseException
     */
    public async decode(collection: Document, document: Document, selections: string[] = []): Promise<Document> {
        const attributes = collection.getAttribute('attributes', []).filter(
            (attribute: any) => attribute['type'] !== Database.VAR_RELATIONSHIP
        );

        const relationships = collection.getAttribute('attributes', []).filter(
            (attribute: any) => attribute['type'] === Database.VAR_RELATIONSHIP
        );

        for (const relationship of relationships) {
            const key = relationship['$id'] ?? '';

            if (
                key in document
                || this.adapter.filter(key) in document
            ) {
                let value = document.getAttribute(key);
                value = value ?? document.getAttribute(this.adapter.filter(key));
                document.removeAttribute(this.adapter.filter(key));
                document.setAttribute(key, value);
            }
        }

        const allAttributes: Document[] = [...attributes, ...this.getInternalAttributes()];

        for (const attribute of allAttributes) {
            const key = attribute.getAttribute('$id') ?? '';
            const array = attribute.getAttribute('array') ?? false;
            const filters = attribute.getAttribute('filters') ?? [];
            let value = document.getAttribute(key);

            if (value === null) {
                value = document.getAttribute(this.adapter.filter(key));

                if (value !== null) {
                    document.removeAttribute(this.adapter.filter(key));
                }
            }

            value = array ? value : [value];
            value = value === null ? [] : value;

            for (let i = 0; i < value.length; i++) {
                for (const filter of filters.reverse()) {
                    value[i] = await this.decodeAttribute(filter, value[i], document);
                }
            }

            if (
                selections.length === 0
                || selections.includes(key)
                || selections.includes('*')
                || ['$createdAt', '$updatedAt'].includes(key)
            ) {
                if (
                    ['$createdAt', '$updatedAt'].includes(key) && value[0] === null
                ) {
                    continue;
                } else {
                    document.setAttribute(key, array ? value : value[0]);
                }
            }
        }

        return document;
    }

    /**
     * Casting
     *
     * @param collection
     * @param document
     *
     * @return Document
     */
    public casting(collection: Document, document: Document): Document {
        if (this.adapter.getSupportForCasting()) {
            return document;
        }

        const attributes = collection.getAttribute<Document[]>('attributes', []);

        for (const attribute of attributes) {
            const key = attribute.getAttribute('$id') ?? '';
            const type = attribute.getAttribute('type') ?? '';
            const array = attribute.getAttribute('array') ?? false;
            let value = document.getAttribute(key, null);
            if (value === null) {
                continue;
            }

            if (array) {
                value = typeof value !== 'string'
                    ? value
                    : JSON.parse(value);
            } else {
                value = [value];
            }

            for (let i = 0; i < value.length; i++) {
                switch (type) {
                    case Database.VAR_BOOLEAN:
                        value[i] = Boolean(value[i]);
                        break;
                    case Database.VAR_INTEGER:
                        value[i] = Number.parseInt(value[i], 10);
                        break;
                    case Database.VAR_FLOAT:
                        value[i] = Number.parseFloat(value[i]);
                        break;
                    default:
                        break;
                }
            }

            document.setAttribute(key, array ? value : value[0]);
        }

        return document;
    }

    /**
    * Encode Attribute
    *
    * Passes the attribute value, and document context to a predefined filter
    * that allows you to manipulate the input format of the given attribute.
    *
    * @param name
    * @param value
    * @param document
    *
    * @return any
    * @throws DatabaseException
    */
    protected async encodeAttribute(name: string, value: any, document: Document): Promise<any> {
        if (!(name in Database.filters) && !(name in this.instanceFilters)) {
            throw new DatabaseException(`Filter: ${name} not found`);
        }

        try {
            if (name in this.instanceFilters) {
                value = await this.instanceFilters[name].encode(value, document, this);
            } else {
                value = await Database.filters[name].encode(value, document, this);
            }
        } catch (error: any) {
            throw new DatabaseException(error.message, error.code, error);
        }

        return value;
    }

    /**
     * Decode Attribute
     *
     * Passes the attribute value, and document context to a predefined filter
     * that allows you to manipulate the output format of the given attribute.
     *
     * @param name
     * @param value
     * @param document
     *
     * @return any
     * @throws DatabaseException
     */
    protected async decodeAttribute(name: string, value: any, document: Document): Promise<any> {
        if (!this.filter) {
            return value;
        }

        if (!(name in Database.filters) && !(name in this.instanceFilters)) {
            throw new DatabaseException('Filter not found');
        }

        if (name in this.instanceFilters) {
            value = await this.instanceFilters[name].decode(value, document, this);
        } else {
            value = await Database.filters[name].decode(value, document, this);
        }

        return value;
    }

    /**
     * Validate if a set of attributes can be selected from the collection
     *
     * @param collection
     * @param queries
     * @return string[]
     * @throws QueryException
     */
    private validateSelections(collection: Document, queries: Query[]): string[] {
        if (queries.length === 0) {
            return [];
        }

        const selections: string[] = [];
        const relationshipSelections: string[] = [];

        for (const query of queries) {
            if (query.getMethod() === Query.TYPE_SELECT) {
                for (const value of query.getValues()) {
                    if (value.includes('.')) {
                        relationshipSelections.push(value);
                        continue;
                    }
                    selections.push(value);
                }
            }
        }

        // Allow querying internal attributes
        const keys = this.getInternalAttributes().map(
            (attribute: any) => attribute['$id']
        );

        for (const attribute of collection.getAttribute('attributes', [])) {
            if (attribute['type'] !== Database.VAR_RELATIONSHIP) {
                // Fallback to $id when key property is not present in metadata table for some tables such as Indexes or Attributes
                keys.push(attribute['key'] ?? attribute['$id']);
            }
        }

        const invalid = selections.filter(selection => !keys.includes(selection));
        if (invalid.length > 0 && !invalid.includes('*')) {
            throw new QueryException('Cannot select attributes: ' + invalid.join(', '));
        }

        selections.push(...relationshipSelections);

        selections.push('$id');
        selections.push('$internalId');
        selections.push('$collection');
        selections.push('$createdAt');
        selections.push('$updatedAt');
        selections.push('$permissions');

        return selections;
    }

    /**
     * Get adapter attribute limit, accounting for internal metadata
     * Returns 0 to indicate no limit
     *
     * @return number
     */
    public getLimitForAttributes(): number {
        // If negative, return 0
        // -1 ==> virtual columns count as total, so treat as buffer
        return Math.max(this.adapter.getLimitForAttributes() - this.adapter.getCountOfDefaultAttributes() - 1, 0);
    }

    /**
     * Get adapter index limit
     *
     * @return number
     */
    public getLimitForIndexes(): number {
        return this.adapter.getLimitForIndexes() - this.adapter.getCountOfDefaultIndexes();
    }

    /**
         * Convert Queries
         *
         * @param collection
         * @param queries
         * @return Query[]
         * @throws QueryException
         */
    public static convertQueries(collection: Document, queries: Query[]): Query[] {
        const attributes = collection.getAttribute('attributes', []);

        for (const attribute of attributes) {
            for (const query of queries) {
                if (query.getAttribute() === attribute.getId()) {
                    query.setOnArray(attribute.getAttribute('array', false));
                }
            }

            if (attribute.getAttribute('type') === Database.VAR_DATETIME) {
                for (let index = 0; index < queries.length; index++) {
                    const query = queries[index];
                    if (query.getAttribute() === attribute.getId()) {
                        const values = query.getValues();
                        for (let valueIndex = 0; valueIndex < values.length; valueIndex++) {
                            try {
                                values[valueIndex] = DateTime.setTimezone(values[valueIndex]);
                            } catch (error: any) {
                                throw new QueryException(error.message, error.code, error);
                            }
                        }
                        query.setValues(values);
                        queries[index] = query;
                    }
                }
            }
        }

        return queries;
    }

    /**
     * Purge Related Documents
     *
     * @param collection
     * @param id
     * @return void
     * @throws DatabaseException
     */
    private async purgeRelatedDocuments(collection: Document, id: string): Promise<void> {
        if (collection.getId() === Database.METADATA) {
            return;
        }

        const relationships = collection.getAttribute('attributes', []).filter(
            (attribute: any) => attribute['type'] === Database.VAR_RELATIONSHIP
        );

        if (relationships.length === 0) {
            return;
        }

        const key = `${this.cacheName}-cache-${this.getNamespace()}:map:${collection.getId()}:${id}`;
        const cache = await this.cache.load(key, Database.TTL, key);
        if (cache.length > 0) {
            for (const v of cache) {
                const [collectionId, documentId] = v.split(':');
                this.purgeCachedDocument(collectionId, documentId);
            }
            this.cache.purge(key);
        }
    }

    /**
     * Get Internal Attributes
     *
     * @return {Array<{ [key: string]: any }>}
     */
    public getInternalAttributes(): { [key: string]: any }[] {
        let attributes = Database.INTERNAL_ATTRIBUTES;

        if (!this.adapter.getSharedTables()) {
            attributes = Database.INTERNAL_ATTRIBUTES.filter((attribute: any) => {
                return attribute['$id'] !== '$tenant';
            });
        }

        return attributes;
    }

}