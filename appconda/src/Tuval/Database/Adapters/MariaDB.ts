import { SQL } from './SQL';
import { Pool, PoolConnection, RowDataPacket } from 'mysql2/promise';
import { Database } from '../Database';
import { Exception as DatabaseException } from '../Exception';
import { Duplicate as DuplicateException } from '../Exceptions/Duplicate';
import { Query } from '../Query';
import { Truncate as TruncateException } from '../Exceptions/Truncate';
import { Timeout as TimeoutException } from '../Exceptions/Timeout';
import { Authorization, Document } from '../../Core';

function formatDateToMySQL(date: Date): string {
    const pad = (num: number) => (num < 10 ? '0' : '') + num;

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
        `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export class MariaDB extends SQL {
    protected pool: Pool;
    //@ts-ignore
    protected sharedTables: boolean;
    //@ts-ignore
    protected tenant: number | null;

    constructor(config: any, sharedTables: boolean = false, tenant: number | null = null) {
        super(require('mysql2/promise').createPool(config));
        this.pool = this.pdo;
        this.sharedTables = sharedTables;
        this.tenant = tenant;
    }

    async checkPoolStatus() {
        const poolStatus = {
            totalConnections: (this as any).pool.pool._allConnections.length,
            freeConnections: (this as any).pool.pool._freeConnections.length,
            waitingConnections: (this as any).pool.pool._connectionQueue.length
        };

        console.log('Pool Status:', poolStatus);
    }

    /**
     * Create Database
     *
     * @param name
     * @returns boolean
     */
    async create(name: string): Promise<boolean> {
        name = this.filter(name);

        if (await this.exists(name)) {
            return true;
        }

        let sql = `CREATE DATABASE \`${name}\` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;`;

        sql = this.trigger(Database.EVENT_DATABASE_CREATE, sql);

        try {
            const connection = await this.pool.getConnection();
            try {
                await connection.execute(sql);
                return true;
            } finally {
                connection.release();
            }
        } catch (error: any) {
            throw new DatabaseException(`Can't upload file ${name}: ${error.message}`);
        }
    }

    /**
     * Delete Database
     *
     * @param name
     * @returns boolean
     */
    async delete(name: string): Promise<boolean> {
        name = this.filter(name);

        let sql = `DROP DATABASE \`${name}\`;`;

        sql = this.trigger(Database.EVENT_DATABASE_DELETE, sql);

        try {
            const connection = await this.pool.getConnection();
            try {
                await connection.execute(sql);
                return true;
            } finally {
                connection.release();
            }
        } catch (error: any) {
            throw new DatabaseException(`Failed to delete database ${name}: ${error.message}`);
        }
    }

    /**
     * Create Collection
     *
     * @param name
     * @param attributes
     * @param indexes
     * @returns boolean
     */
    async createCollection(name: string, attributes: Document[] = [], indexes: Document[] = []): Promise<boolean> {
        const id = this.filter(name);

        const attributeStrings: string[] = [];
        const indexStrings: string[] = [];

        for (const attribute of attributes) {
            const attrId = this.filter(attribute.getId());

            const attrType = this.getSQLType(
                attribute.getAttribute('type'),
                attribute.getAttribute('size') || 0,
                attribute.getAttribute('signed') !== undefined ? attribute.getAttribute('signed') : true,
                attribute.getAttribute('array') || false
            );

            attributeStrings.push(`\`${attrId}\` ${attrType},`);
        }

        for (const index of indexes) {
            const indexId = this.filter(index.getId());
            const indexType = index.getAttribute('type');

            let indexAttributes = index.getAttribute('attributes') as string[];
            const indexLengths = index.getAttribute('lengths') as (number | null)[];
            const indexOrders = index.getAttribute('orders') as string[];

            indexAttributes = indexAttributes.map((attribute, nested) => {
                let indexLength = indexLengths[nested] !== undefined && indexLengths[nested] !== null ? `(${indexLengths[nested]})` : '';
                let indexOrder = indexOrders[nested] || '';

                let indexAttribute = '';
                switch (attribute) {
                    case '$id':
                        indexAttribute = '_uid';
                        break;
                    case '$createdAt':
                        indexAttribute = '_createdAt';
                        break;
                    case '$updatedAt':
                        indexAttribute = '_updatedAt';
                        break;
                    default:
                        indexAttribute = attribute;
                }
                indexAttribute = this.filter(indexAttribute);

                if (indexType === Database.INDEX_FULLTEXT) {
                    indexOrder = '';
                }

                return `\`${indexAttribute}\`${indexLength} ${indexOrder}`.trim();
            });

            let indexStatement = '';
            if (this.sharedTables && indexType !== Database.INDEX_FULLTEXT) {
                indexAttributes.unshift('_tenant');
            }

            indexStatement = `${indexType} \`${indexId}\` (${indexAttributes.join(', ')}),`;
            indexStrings.push(indexStatement);
        }

        let sql = `
            CREATE TABLE IF NOT EXISTS ${this.getSQLTable(id)} (
                _id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
                _uid VARCHAR(255) NOT NULL,
                _createdAt DATETIME(3) DEFAULT NULL,
                _updatedAt DATETIME(3) DEFAULT NULL,
                _permissions MEDIUMTEXT DEFAULT NULL,
                PRIMARY KEY (_id),
                ${attributeStrings.join('\n')}
                ${indexStrings.join('\n')}
        `;

        if (this.sharedTables) {
            sql += `
                _tenant INT(11) UNSIGNED DEFAULT NULL,
                UNIQUE KEY _uid (_tenant, _uid),
                KEY _created_at (_tenant, _createdAt),
                KEY _updated_at (_tenant, _updatedAt),
                KEY _tenant_id (_tenant, _id)
            `;
        } else {
            sql += `
                UNIQUE KEY _uid (_uid),
                KEY _created_at (_createdAt),
                KEY _updated_at (_updatedAt)
            `;
        }

        sql += `) ENGINE=InnoDB;`;

        sql = this.trigger(Database.EVENT_COLLECTION_CREATE, sql);

        try {
            const connection = await this.pool.getConnection();
            try {
                await connection.execute(sql);

                // Create permissions table
                let permsSql = `
                    CREATE TABLE IF NOT EXISTS ${this.getSQLTable(id + '_perms')} (
                        _id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
                        _type VARCHAR(12) NOT NULL,
                        _permission VARCHAR(255) NOT NULL,
                        _document VARCHAR(255) NOT NULL,
                        PRIMARY KEY (_id),
                `;

                if (this.sharedTables) {
                    permsSql += `
                        _tenant INT(11) UNSIGNED DEFAULT NULL,
                        UNIQUE INDEX _index1 (_document, _tenant, _type, _permission),
                        INDEX _permission (_tenant, _permission, _type)
                    `;
                } else {
                    permsSql += `
                        UNIQUE INDEX _index1 (_document, _type, _permission),
                        INDEX _permission (_permission, _type)
                    `;
                }

                permsSql += `) ENGINE=InnoDB;`;

                permsSql = this.trigger(Database.EVENT_COLLECTION_CREATE, permsSql);

                await connection.execute(permsSql);
            } catch (error: any) {
                // Rollback by dropping created tables
                const rollbackSql = `DROP TABLE IF EXISTS ${this.getSQLTable(id)}, ${this.getSQLTable(id + '_perms')};`;
                await connection.execute(rollbackSql);
                throw error;
            } finally {
                connection.release();
            }
        } catch (error: any) {
            throw new DatabaseException(`Failed to create collection ${name}: ${error.message}`);
        }

        return true;
    }

    /**
     * Get collection size
     *
     * @param collection
     * @returns number
     */
    async getSizeOfCollection(collection: string): Promise<number> {
        const filteredCollection = this.filter(collection);
        const namespace = this.getNamespace();
        const database = this.getDatabase();
        const name = `${database}/${filteredCollection}`;
        const permissions = `${database}/${filteredCollection}_perms`;

        const sqlCollectionSize = `
            SELECT SUM(FS_BLOCK_SIZE + ALLOCATED_SIZE) as size
            FROM INFORMATION_SCHEMA.INNODB_SYS_TABLESPACES
            WHERE NAME = ?
        `;

        try {
            const connection = await this.pool.getConnection();
            try {
                const [collectionResult] = await connection.execute<RowDataPacket[]>(sqlCollectionSize, [name]);
                const [permissionsResult] = await connection.execute<RowDataPacket[]>(sqlCollectionSize, [permissions]);

                const size = (collectionResult[0]?.size || 0) + (permissionsResult[0]?.size || 0);
                return size;
            } finally {
                connection.release();
            }
        } catch (error: any) {
            throw new DatabaseException(`Failed to get collection size: ${error.message}`);
        }
    }

    /**
     * Delete collection
     *
     * @param id
     * @returns boolean
     */
    async deleteCollection(id: string): Promise<boolean> {
        id = this.filter(id);

        const sql = `DROP TABLE ${this.getSQLTable(id)}, ${this.getSQLTable(id + '_perms')};`;

        const finalSql = this.trigger(Database.EVENT_COLLECTION_DELETE, sql);

        try {
            const connection = await this.pool.getConnection();
            try {
                await connection.execute(finalSql);
                return true;
            } finally {
                connection.release();
            }
        } catch (error: any) {
            throw new DatabaseException(`Failed to delete collection ${id}: ${error.message}`);
        }
    }

    /**
     * Create Attribute
     *
     * @param collection
     * @param id
     * @param type
     * @param size
     * @param signed
     * @param array
     * @returns boolean
     */
    async createAttribute(collection: string, id: string, type: string, size: number, signed: boolean = true, array: boolean = false): Promise<boolean> {
        const name = this.filter(collection);
        const columnId = this.filter(id);
        const sqlType = this.getSQLType(type, size, signed, array);

        const sql = `ALTER TABLE ${this.getSQLTable(name)} ADD COLUMN \`${columnId}\` ${sqlType};`;

        const finalSql = this.trigger(Database.EVENT_ATTRIBUTE_CREATE, sql);

        try {
            const connection = await this.pool.getConnection();
            try {
                await connection.execute(finalSql);
                return true;
            } finally {
                connection.release();
            }
        } catch (error: any) {
            this.processException(error);
            return false;
        }
    }

    /**
     * Update Attribute
     *
     * @param collection
     * @param id
     * @param type
     * @param size
     * @param signed
     * @param array
     * @param newKey
     * @returns boolean
     */
    async updateAttribute(collection: string, id: string, type: string, size: number, signed: boolean = true, array: boolean = false, newKey: string | null = null): Promise<boolean> {
        const name = this.filter(collection);
        const columnId = this.filter(id);
        const newColumnId = newKey ? this.filter(newKey) : null;
        const sqlType = this.getSQLType(type, size, signed, array);

        let sql = '';
        if (newColumnId) {
            sql = `ALTER TABLE ${this.getSQLTable(name)} CHANGE COLUMN \`${columnId}\` \`${newColumnId}\` ${sqlType};`;
        } else {
            sql = `ALTER TABLE ${this.getSQLTable(name)} MODIFY \`${columnId}\` ${sqlType};`;
        }

        const finalSql = this.trigger(Database.EVENT_ATTRIBUTE_UPDATE, sql);

        try {
            const connection = await this.pool.getConnection();
            try {
                await connection.execute(finalSql);
                return true;
            } finally {
                connection.release();
            }
        } catch (error: any) {
            this.processException(error);
            return false;
        }
    }

    /**
     * Delete Attribute
     *
     * @param collection
     * @param id
     * @param array
     * @returns boolean
     */
    async deleteAttribute(collection: string, id: string, array: boolean = false): Promise<boolean> {
        const name = this.filter(collection);
        const columnId = this.filter(id);

        const sql = `ALTER TABLE ${this.getSQLTable(name)} DROP COLUMN \`${columnId}\`;`;

        const finalSql = this.trigger(Database.EVENT_ATTRIBUTE_DELETE, sql);

        try {
            const connection = await this.pool.getConnection();
            try {
                await connection.execute(finalSql);
                return true;
            } finally {
                connection.release();
            }
        } catch (error: any) {
            throw new DatabaseException(`Failed to delete attribute ${id}: ${error.message}`);
        }
    }

    /**
     * Rename Attribute
     *
     * @param collection
     * @param old
     * @param newKey
     * @returns boolean
     */
    async renameAttribute(collection: string, old: string, newKey: string): Promise<boolean> {
        const filteredCollection = this.filter(collection);
        const filteredOld = this.filter(old);
        const filteredNew = this.filter(newKey);

        const sql = `ALTER TABLE ${this.getSQLTable(filteredCollection)} RENAME COLUMN \`${filteredOld}\` TO \`${filteredNew}\`;`;

        const finalSql = this.trigger(Database.EVENT_ATTRIBUTE_UPDATE, sql);

        try {
            const connection = await this.pool.getConnection();
            try {
                await connection.execute(finalSql);
                return true;
            } finally {
                connection.release();
            }
        } catch (error: any) {
            throw new DatabaseException(`Failed to rename attribute from ${old} to ${newKey}: ${error.message}`);
        }
    }

    /**
     * Create Relationship
     *
     * @param collection
     * @param relatedCollection
     * @param type
     * @param twoWay
     * @param id
     * @param twoWayKey
     * @returns boolean
     */
    async createRelationship(
        collection: string,
        relatedCollection: string,
        type: string,
        twoWay: boolean = false,
        id: string = '',
        twoWayKey: string = ''
    ): Promise<boolean> {
        const name = this.filter(collection);
        const relatedName = this.filter(relatedCollection);
        const table = this.getSQLTable(name);
        const relatedTable = this.getSQLTable(relatedName);
        const columnId = this.filter(id);
        const columnTwoWayKey = this.filter(twoWayKey);
        const sqlType = this.getSQLType(Database.VAR_RELATIONSHIP, 0, false, false);

        let sql = '';

        switch (type) {
            case Database.RELATION_ONE_TO_ONE:
                sql = `ALTER TABLE ${table} ADD COLUMN \`${columnId}\` ${sqlType} DEFAULT NULL;`;
                if (twoWay) {
                    sql += `ALTER TABLE ${relatedTable} ADD COLUMN \`${columnTwoWayKey}\` ${sqlType} DEFAULT NULL;`;
                }
                break;
            case Database.RELATION_ONE_TO_MANY:
                sql = `ALTER TABLE ${relatedTable} ADD COLUMN \`${columnTwoWayKey}\` ${sqlType} DEFAULT NULL;`;
                break;
            case Database.RELATION_MANY_TO_ONE:
                sql = `ALTER TABLE ${table} ADD COLUMN \`${columnId}\` ${sqlType} DEFAULT NULL;`;
                break;
            case Database.RELATION_MANY_TO_MANY:
                return true; // Handle many-to-many relationships separately
            default:
                throw new DatabaseException('Invalid relationship type');
        }

        sql = this.trigger(Database.EVENT_ATTRIBUTE_CREATE, sql);

        try {
            const connection = await this.pool.getConnection();
            try {
                await connection.execute(sql);
                return true;
            } finally {
                connection.release();
            }
        } catch (error: any) {
            throw new DatabaseException(`Failed to create relationship: ${error.message}`);
        }
    }

    /**
     * Update Relationship
     *
     * @param collection
     * @param relatedCollection
     * @param type
     * @param twoWay
     * @param key
     * @param twoWayKey
     * @param side
     * @param newKey
     * @param newTwoWayKey
     * @returns boolean
     */
    async updateRelationship(
        collection: string,
        relatedCollection: string,
        type: string,
        twoWay: boolean,
        key: string,
        twoWayKey: string,
        side: string,
        newKey: string | null = null,
        newTwoWayKey: string | null = null
    ): Promise<boolean> {
        const name = this.filter(collection);
        const relatedName = this.filter(relatedCollection);
        const table = this.getSQLTable(name);
        const relatedTable = this.getSQLTable(relatedName);
        const columnKey = this.filter(key);
        const columnTwoWayKey = this.filter(twoWayKey);
        const newColumnKey = newKey ? this.filter(newKey) : null;
        const newColumnTwoWayKey = newTwoWayKey ? this.filter(newTwoWayKey) : null;

        let sql = '';

        switch (type) {
            case Database.RELATION_ONE_TO_ONE:
                if (newColumnKey && columnKey !== newColumnKey) {
                    sql += `ALTER TABLE ${table} RENAME COLUMN \`${columnKey}\` TO \`${newColumnKey}\`;`;
                }
                if (twoWay && newColumnTwoWayKey && columnTwoWayKey !== newColumnTwoWayKey) {
                    sql += `ALTER TABLE ${relatedTable} RENAME COLUMN \`${columnTwoWayKey}\` TO \`${newColumnTwoWayKey}\`;`;
                }
                break;
            case Database.RELATION_ONE_TO_MANY:
                if (side === Database.RELATION_SIDE_PARENT) {
                    if (newColumnTwoWayKey && columnTwoWayKey !== newColumnTwoWayKey) {
                        sql += `ALTER TABLE ${relatedTable} RENAME COLUMN \`${columnTwoWayKey}\` TO \`${newColumnTwoWayKey}\`;`;
                    }
                } else {
                    if (newColumnKey && columnKey !== newColumnKey) {
                        sql += `ALTER TABLE ${table} RENAME COLUMN \`${columnKey}\` TO \`${newColumnKey}\`;`;
                    }
                }
                break;
            case Database.RELATION_MANY_TO_ONE:
                if (side === Database.RELATION_SIDE_CHILD) {
                    if (newColumnTwoWayKey && columnTwoWayKey !== newColumnTwoWayKey) {
                        sql += `ALTER TABLE ${relatedTable} RENAME COLUMN \`${columnTwoWayKey}\` TO \`${newColumnTwoWayKey}\`;`;
                    }
                } else {
                    if (newColumnKey && columnKey !== newColumnKey) {
                        sql += `ALTER TABLE ${table} RENAME COLUMN \`${columnKey}\` TO \`${newColumnKey}\`;`;
                    }
                }
                break;
            case Database.RELATION_MANY_TO_MANY:
                // Handle many-to-many relationships separately
                return true;
            default:
                throw new DatabaseException('Invalid relationship type');
        }

        if (!sql) {
            return true;
        }

        sql = this.trigger(Database.EVENT_ATTRIBUTE_UPDATE, sql);

        try {
            const connection = await this.pool.getConnection();
            try {
                await connection.execute(sql);
                return true;
            } finally {
                connection.release();
            }
        } catch (error: any) {
            throw new DatabaseException(`Failed to update relationship: ${error.message}`);
        }
    }

    /**
     * Delete Relationship
     *
     * @param collection
     * @param relatedCollection
     * @param type
     * @param twoWay
     * @param key
     * @param twoWayKey
     * @param side
     * @returns boolean
     */
    async deleteRelationship(
        collection: string,
        relatedCollection: string,
        type: string,
        twoWay: boolean,
        key: string,
        twoWayKey: string,
        side: string
    ): Promise<boolean> {
        const name = this.filter(collection);
        const relatedName = this.filter(relatedCollection);
        const table = this.getSQLTable(name);
        const relatedTable = this.getSQLTable(relatedName);
        const columnKey = this.filter(key);
        const columnTwoWayKey = this.filter(twoWayKey);

        let sql = '';

        switch (type) {
            case Database.RELATION_ONE_TO_ONE:
                if (side === Database.RELATION_SIDE_PARENT) {
                    sql += `ALTER TABLE ${table} DROP COLUMN \`${columnKey}\`;`;
                    if (twoWay) {
                        sql += `ALTER TABLE ${relatedTable} DROP COLUMN \`${columnTwoWayKey}\`;`;
                    }
                } else if (side === Database.RELATION_SIDE_CHILD) {
                    sql += `ALTER TABLE ${relatedTable} DROP COLUMN \`${columnTwoWayKey}\`;`;
                    if (twoWay) {
                        sql += `ALTER TABLE ${table} DROP COLUMN \`${columnKey}\`;`;
                    }
                }
                break;
            case Database.RELATION_ONE_TO_MANY:
                if (side === Database.RELATION_SIDE_PARENT) {
                    sql += `ALTER TABLE ${relatedTable} DROP COLUMN \`${columnTwoWayKey}\`;`;
                } else {
                    sql += `ALTER TABLE ${table} DROP COLUMN \`${columnKey}\`;`;
                }
                break;
            case Database.RELATION_MANY_TO_ONE:
                if (side === Database.RELATION_SIDE_PARENT) {
                    sql += `ALTER TABLE ${table} DROP COLUMN \`${columnKey}\`;`;
                } else {
                    sql += `ALTER TABLE ${relatedTable} DROP COLUMN \`${columnTwoWayKey}\`;`;
                }
                break;
            case Database.RELATION_MANY_TO_MANY:
                // Handle many-to-many relationships separately
                const collectionDoc = await this.getDocument(Database.METADATA, collection);
                const relatedCollectionDoc = await this.getDocument(Database.METADATA, relatedCollection);

                const junctionTable = this.getSQLTable(`_${collectionDoc.getInternalId()}_${relatedCollectionDoc.getInternalId()}`);
                const permsTable = this.getSQLTable(`_${collectionDoc.getInternalId()}_${relatedCollectionDoc.getInternalId()}_perms`);

                sql = `DROP TABLE ${junctionTable}; DROP TABLE ${permsTable};`;
                break;
            default:
                throw new DatabaseException('Invalid relationship type');
        }

        if (!sql) {
            return true;
        }

        sql = this.trigger(Database.EVENT_ATTRIBUTE_DELETE, sql);

        try {
            const connection = await this.pool.getConnection();
            try {
                await connection.execute(sql);
                return true;
            } finally {
                connection.release();
            }
        } catch (error: any) {
            throw new DatabaseException(`Failed to delete relationship: ${error.message}`);
        }
    }

    /**
     * Rename Index
     *
     * @param collection
     * @param old
     * @param newKey
     * @returns boolean
     */
    async renameIndex(collection: string, old: string, newKey: string): Promise<boolean> {
        const filteredCollection = this.filter(collection);
        const filteredOld = this.filter(old);
        const filteredNew = this.filter(newKey);

        const sql = `ALTER TABLE ${this.getSQLTable(filteredCollection)} RENAME INDEX \`${filteredOld}\` TO \`${filteredNew}\`;`;

        const finalSql = this.trigger(Database.EVENT_INDEX_RENAME, sql);

        try {
            const connection = await this.pool.getConnection();
            try {
                await connection.execute(finalSql);
                return true;
            } finally {
                connection.release();
            }
        } catch (error: any) {
            throw new DatabaseException(`Failed to rename index from ${old} to ${newKey}: ${error.message}`);
        }
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
     * @returns boolean
     */
    async createIndex(collection: string, id: string, type: string, attributes: string[], lengths: (number | null)[], orders: string[]): Promise<boolean> {
        const collectionDoc = await this.getDocument(Database.METADATA, collection);

        if (collectionDoc.isEmpty()) {
            throw new DatabaseException('Collection not found');
        }

        const collectionAttributes = JSON.parse(collectionDoc.getAttribute('attributes', '[]')) as any[];

        const filteredId = this.filter(id);

        const processedAttributes = attributes.map((attr, i) => {
            const collectionAttribute = collectionAttributes.find(attrItem => attrItem.key === attr);
            const order = orders[i] || (type === Database.INDEX_FULLTEXT ? '' : '');
            const length = lengths[i] !== undefined && lengths[i] !== null ? `(${lengths[i]})` : '';
            let attributeName: string;

            switch (attr) {
                case '$id':
                    attributeName = '_uid';
                    break;
                case '$createdAt':
                    attributeName = '_createdAt';
                    break;
                case '$updatedAt':
                    attributeName = '_updatedAt';
                    break;
                default:
                    attributeName = this.filter(attr);
            }

            let attributeExpression = `\`${attributeName}\`${length} ${order}`.trim();

            if (collectionAttribute.array && this.castIndexArray()) {
                attributeExpression = `(CAST(${attributeName} AS CHAR(${Database.ARRAY_INDEX_LENGTH}) ARRAY))`;
            }

            return attributeExpression;
        });

        let sqlType: string;
        switch (type) {
            case Database.INDEX_KEY:
                sqlType = 'INDEX';
                break;
            case Database.INDEX_UNIQUE:
                sqlType = 'UNIQUE INDEX';
                break;
            case Database.INDEX_FULLTEXT:
                sqlType = 'FULLTEXT INDEX';
                break;
            default:
                throw new DatabaseException(`Unknown index type: ${type}. Must be one of ${Database.INDEX_KEY}, ${Database.INDEX_UNIQUE}, ${Database.INDEX_FULLTEXT}`);
        }

        let indexAttributes = attributes.map((_, i) => processedAttributes[i]).join(', ');

        if (this.sharedTables && type !== Database.INDEX_FULLTEXT) {
            indexAttributes = `_tenant, ${indexAttributes}`;
        }

        const sql = `CREATE ${sqlType} \`${filteredId}\` ON ${this.getSQLTable(collectionDoc.getId())} (${indexAttributes});`;

        const finalSql = this.trigger(Database.EVENT_INDEX_CREATE, sql);

        try {
            const connection = await this.pool.getConnection();
            try {
                await connection.execute(finalSql);
                return true;
            } finally {
                connection.release();
            }
        } catch (error: any) {
            this.processException(error);
            return false;
        }
    }

    /**
     * Determine if index arrays should be cast
     *
     * @returns boolean
     */
    castIndexArray(): boolean {
        return false;
    }

    /**
     * Delete Index
     *
     * @param collection
     * @param id
     * @returns boolean
     */
    async deleteIndex(collection: string, id: string): Promise<boolean> {
        const name = this.filter(collection);
        const filteredId = this.filter(id);

        const sql = `ALTER TABLE ${this.getSQLTable(name)} DROP INDEX \`${filteredId}\`;`;

        const finalSql = this.trigger(Database.EVENT_INDEX_DELETE, sql);

        try {
            const connection = await this.pool.getConnection();
            try {
                await connection.execute(finalSql);
                return true;
            } finally {
                connection.release();
            }
        } catch (error: any) {
            throw new DatabaseException(`Failed to delete index ${id}: ${error.message}`);
        }
    }

    /**
     * Create Document
     *
     * @param collection
     * @param document
     * @returns Document
     */
    async createDocument(collection: string, document: Document): Promise<Document> {
        try {
            const attributes = { ...document.getAttributes() };
            const createdAt = document.getCreatedAt();
            const updatedAt = document.getUpdatedAt();
            attributes['_createdAt'] = formatDateToMySQL(createdAt ? new Date(createdAt) : new Date());
            attributes['_updatedAt'] = formatDateToMySQL(updatedAt ? new Date(updatedAt) : new Date());

            attributes['_permissions'] = JSON.stringify(document.getPermissions());

            if (this.sharedTables) {
                attributes['_tenant'] = this.tenant;
            }

            const name = this.filter(collection);
            const columns: string[] = [];
            const placeholders: string[] = [];
            const values: any[] = [];

            for (const [attribute, value] of Object.entries(attributes)) {
                columns.push(`\`${this.filter(attribute)}\``);
                placeholders.push('?');
                values.push(Array.isArray(value) ? JSON.stringify(value) : value);
            }

            // Insert internal ID if set
            if (document.getInternalId()) {
                columns.push('_id');
                placeholders.push('?');
                values.push(document.getInternalId());
            }

            columns.push('_uid');
            placeholders.push('?');
            values.push(document.getId());

            let sql = `
                INSERT INTO ${this.getSQLTable(name)} (${columns.join(', ')})
                VALUES (${placeholders.join(', ')});
            `;

            sql = this.trigger(Database.EVENT_DOCUMENT_CREATE, sql);


            const connection = await this.pool.getConnection();

            try {

                await connection.execute(sql, values);

                // Handle permissions
                const permissions: { sql: string; values: any[] }[] = [];
                for (const type of Database.PERMISSIONS) {
                    const perms = document.getPermissionsByType(type);
                    for (const permission of perms) {
                        let permSql = `INSERT INTO ${this.getSQLTable(name + '_perms')} (_type, _permission, _document`;
                        const permValues: any[] = [type, permission, document.getId()];

                        if (this.sharedTables) {
                            permSql += `, _tenant`;
                            permValues.push(this.tenant);
                        }

                        permSql += `) VALUES (?, ?, ?${this.sharedTables ? `, ?` : ''});`;
                        permissions.push({ sql: permSql, values: permValues });
                    }
                }

                for (const perm of permissions) {
                    await connection.execute(perm.sql, perm.values);
                }

                const dbDocument = await this.getDocument(collection, document.getId(), [Query.select(['$internalId'])]);
                document.setAttribute('$internalId', dbDocument.getInternalId());
               
                
            } catch (error: any) {
                // Rollback by deleting inserted records
                await connection.execute(`DELETE FROM ${this.getSQLTable(name)} WHERE _uid = ?;`, [document.getId()]);
                await connection.execute(`DELETE FROM ${this.getSQLTable(name + '_perms')} WHERE _document = ?;`, [document.getId()]);
                throw error;
            } finally {
                //console.log(await this.checkPoolStatus())
                connection.release();
                this.pool.releaseConnection(connection);
            }
        } catch (error: any) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new DuplicateException(`Duplicated document: ${error.message}`, error);
            }
            throw error;
        }

        return document;
    }

    /**
     * Create Documents in batches
     *
     * @param collection
     * @param documents
     * @param batchSize
     * @returns Document[]
     */
    async createDocuments(collection: string, documents: Document[], batchSize: number = Database.INSERT_BATCH_SIZE): Promise<Document[]> {
        if (documents.length === 0) {
            return documents;
        }

        const name = this.filter(collection);
        const batches = this.chunkArray(documents, Math.max(1, batchSize));

        try {
            const connection = await this.pool.getConnection();
            try {
                for (const batch of batches) {
                    const columnsSet = new Set<string>();
                    const valuesSet: any[][] = [];

                    for (const document of batch) {
                        const attributes = { ...document.getAttributes() };
                        attributes['_uid'] = document.getId();
                        attributes['_createdAt'] = document.getCreatedAt();
                        attributes['_updatedAt'] = document.getUpdatedAt();
                        attributes['_permissions'] = JSON.stringify(document.getPermissions());

                        if (this.sharedTables) {
                            attributes['_tenant'] = this.tenant;
                        }

                        if (document.getInternalId()) {
                            attributes['_id'] = document.getInternalId();
                        }

                        for (const attr of Object.keys(attributes)) {
                            columnsSet.add(`\`${this.filter(attr)}\``);
                        }

                        const placeholders = Object.keys(attributes).map(() => '?');
                        const values = Object.values(attributes).map(value => (Array.isArray(value) ? JSON.stringify(value) : value));
                        if (document.getInternalId()) {
                            values.push(document.getInternalId());
                        }
                        values.push(document.getId());

                        valuesSet.push(values);
                    }

                    const columns = Array.from(columnsSet).join(', ');
                    const placeholders = valuesSet.map(() => `(${Array(valuesSet[0].length).fill('?').join(', ')})`).join(', ');
                    const flatValues = valuesSet.flat();

                    let sql = `
                        INSERT INTO ${this.getSQLTable(name)} (${columns}, _uid)
                        VALUES ${placeholders};
                    `;

                    sql = this.trigger(Database.EVENT_DOCUMENT_CREATE, sql);

                    await connection.execute(sql, flatValues);

                    // Handle permissions
                    for (const document of batch) {
                        const permissions: { sql: string; values: any[] }[] = [];
                        for (const type of Database.PERMISSIONS) {
                            const perms = document.getPermissionsByType(type);
                            for (const permission of perms) {
                                let permSql = `INSERT INTO ${this.getSQLTable(name + '_perms')} (_type, _permission, _document`;
                                const permValues: any[] = [type, permission, document.getId()];

                                if (this.sharedTables) {
                                    permSql += `, _tenant`;
                                    permValues.push(this.tenant);
                                }

                                permSql += `) VALUES (?, ?, ?${this.sharedTables ? `, ?` : ''});`;
                                permissions.push({ sql: permSql, values: permValues });
                            }
                        }

                        for (const perm of permissions) {
                            await connection.execute(perm.sql, perm.values);
                        }
                    }
                }
            } finally {
                connection.release();
            }
        } catch (error: any) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new DuplicateException(`Duplicated document: ${error.message}`, error);
            }
            throw error;
        }

        return documents;
    }

    /**
     * Update Document
     *
     * @param collection
     * @param document
     * @returns Document
     */
    async updateDocument(collection: string, document: Document): Promise<Document> {
        try {
            const attributes = { ...document.getAttributes() };
            attributes['_createdAt'] = document.getCreatedAt();
            attributes['_updatedAt'] = document.getUpdatedAt();
            attributes['_permissions'] = JSON.stringify(document.getPermissions());

            if (this.sharedTables) {
                attributes['_tenant'] = this.tenant;
            }

            const name = this.filter(collection);
            const updates: string[] = [];
            const values: any[] = [];

            for (const [attribute, value] of Object.entries(attributes)) {
                updates.push(`\`${this.filter(attribute)}\` = ?`);
                values.push(Array.isArray(value) ? JSON.stringify(value) : value);
            }

            const sql = `
                UPDATE ${this.getSQLTable(name)}
                SET ${updates.join(', ')}, _uid = ?
                WHERE _uid = ?
                ${this.sharedTables ? 'AND _tenant = ?' : ''};
            `;

            const finalSql = this.trigger(Database.EVENT_DOCUMENT_UPDATE, sql);

            const queryValues = [...values, document.getId(), document.getId()];
            if (this.sharedTables) {
                queryValues.push(this.tenant);
            }

            const connection = await this.pool.getConnection();
            try {
                await connection.execute(finalSql, queryValues);

                // Handle permissions (remove and add)
                // Fetch existing permissions
                let fetchPermsSql = `
                    SELECT _type, _permission
                    FROM ${this.getSQLTable(name + '_perms')}
                    WHERE _document = ?
                `;
                const fetchValues: any[] = [document.getId()];
                if (this.sharedTables) {
                    fetchPermsSql += ` AND _tenant = ?`;
                    fetchValues.push(this.tenant);
                }

                fetchPermsSql = this.trigger(Database.EVENT_PERMISSIONS_READ, fetchPermsSql);

                const [existingPerms]: RowDataPacket[][] = await connection.execute(fetchPermsSql, fetchValues) as any;
                const initial: { [key: string]: string[] } = {};
                for (const type of Database.PERMISSIONS) {
                    initial[type] = [];
                }
                for (const perm of existingPerms) {
                    initial[perm._type].push(perm._permission);
                }

                // Determine removals and additions
                const removals: { [key: string]: string[] } = {};
                const additions: { [key: string]: string[] } = {};

                for (const type of Database.PERMISSIONS) {
                    const diff = initial[type].filter(p => !document.getPermissionsByType(type).includes(p));
                    if (diff.length > 0) {
                        removals[type] = diff;
                    }

                    const addDiff = document.getPermissionsByType(type).filter(p => !initial[type].includes(p));
                    if (addDiff.length > 0) {
                        additions[type] = addDiff;
                    }
                }

                // Remove permissions
                for (const [type, perms] of Object.entries(removals)) {
                    const placeholders = perms.map(() => '?').join(', ');
                    let removeSql = `
                        DELETE FROM ${this.getSQLTable(name + '_perms')}
                        WHERE _document = ? AND _type = ? AND _permission IN (${placeholders})
                    `;
                    if (this.sharedTables) {
                        removeSql += ` AND _tenant = ?`;
                    }
                    removeSql = this.trigger(Database.EVENT_PERMISSIONS_DELETE, removeSql);

                    const removeValues: any[] = [document.getId(), type, ...perms];
                    if (this.sharedTables) {
                        removeValues.push(this.tenant);
                    }

                    await connection.execute(removeSql, removeValues);
                }

                // Add permissions
                for (const [type, perms] of Object.entries(additions)) {
                    for (const perm of perms) {
                        let addSql = `INSERT INTO ${this.getSQLTable(name + '_perms')} (_type, _permission, _document`;
                        const addValues: any[] = [type, perm, document.getId()];

                        if (this.sharedTables) {
                            addSql += `, _tenant`;
                            addValues.push(this.tenant);
                        }

                        addSql += `) VALUES (?, ?, ?${this.sharedTables ? `, ?` : ''});`;
                        addSql = this.trigger(Database.EVENT_PERMISSIONS_CREATE, addSql);

                        await connection.execute(addSql, addValues);
                    }
                }
            } finally {
                connection.release();
            }
        } catch (error: any) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new DuplicateException(`Duplicated document: ${error.message}`, error);
            }
            throw error;
        }

        return document;
    }

    /**
     * Update Documents in batches
     *
     * @param collection
     * @param documents
     * @param batchSize
     * @returns Document[]
     */
    async updateDocuments(collection: string, documents: Document[], batchSize: number = Database.INSERT_BATCH_SIZE): Promise<Document[]> {
        if (documents.length === 0) {
            return documents;
        }

        const name = this.filter(collection);
        const batches = this.chunkArray(documents, Math.max(1, batchSize));

        try {
            const connection = await this.pool.getConnection();
            try {
                for (const batch of batches) {
                    // Handle each document in the batch
                    for (const document of batch) {
                        await this.updateDocument(collection, document);
                    }
                }
            } finally {
                connection.release();
            }
        } catch (error: any) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new DuplicateException(`Duplicated document: ${error.message}`, error);
            }
            throw error;
        }

        return documents;
    }

    /**
     * Increase or decrease an attribute value
     *
     * @param collection
     * @param id
     * @param attribute
     * @param value
     * @param updatedAt
     * @param min
     * @param max
     * @returns boolean
     */
    async increaseDocumentAttribute(
        collection: string,
        id: string,
        attribute: string,
        value: number,
        updatedAt: string,
        min: number | null = null,
        max: number | null = null
    ): Promise<boolean> {
        const name = this.filter(collection);
        const attr = this.filter(attribute);

        const sqlMax = max !== null ? ` AND \`${attr}\` <= ?` : '';
        const sqlMin = min !== null ? ` AND \`${attr}\` >= ?` : '';

        let sql = `
            UPDATE ${this.getSQLTable(name)}
            SET \`${attr}\` = \`${attr}\` + ?, _updatedAt = ?
            WHERE _uid = ?
            ${this.sharedTables ? 'AND _tenant = ?' : ''}
            ${sqlMax}
            ${sqlMin};
        `;

        sql = this.trigger(Database.EVENT_DOCUMENT_UPDATE, sql);

        const values: any[] = [value, updatedAt, id];
        if (this.sharedTables) {
            values.push(this.tenant);
        }
        if (max !== null) {
            values.push(max);
        }
        if (min !== null) {
            values.push(min);
        }

        try {
            const connection = await this.pool.getConnection();
            try {
                const [result] = await connection.execute(sql, values);
                if ((result as any).affectedRows === 0) {
                    throw new DatabaseException('Failed to update attribute');
                }
                return true;
            } finally {
                connection.release();
            }
        } catch (error: any) {
            throw new DatabaseException(`Failed to increase attribute: ${error.message}`);
        }
    }

    /**
     * Delete Document
     *
     * @param collection
     * @param id
     * @returns boolean
     */
    async deleteDocument(collection: string, id: string): Promise<boolean> {
        try {
            const name = this.filter(collection);

            let sqlDelete = `
                DELETE FROM ${this.getSQLTable(name)}
                WHERE _uid = ?
            `;
            const valuesDelete: any[] = [id];

            if (this.sharedTables) {
                sqlDelete += ` AND _tenant = ?`;
                valuesDelete.push(this.tenant);
            }

            sqlDelete = this.trigger(Database.EVENT_DOCUMENT_DELETE, sqlDelete);

            let sqlDeletePerms = `
                DELETE FROM ${this.getSQLTable(name + '_perms')}
                WHERE _document = ?
            `;
            const valuesDeletePerms: any[] = [id];

            if (this.sharedTables) {
                sqlDeletePerms += ` AND _tenant = ?`;
                valuesDeletePerms.push(this.tenant);
            }

            sqlDeletePerms = this.trigger(Database.EVENT_PERMISSIONS_DELETE, sqlDeletePerms);

            const connection = await this.pool.getConnection();
            try {
                await connection.execute(sqlDelete, valuesDelete);
                const [result] = await connection.execute(sqlDeletePerms, valuesDeletePerms);
                const deleted = (result as any).affectedRows;
                return deleted > 0;
            } finally {
                connection.release();
            }
        } catch (error: any) {
            throw new DatabaseException(`Failed to delete document: ${error.message}`);
        }
    }

    /**
     * Find Documents
     *
     * @param collection
     * @param queries
     * @param limit
     * @param offset
     * @param orderAttributes
     * @param orderTypes
     * @param cursor
     * @param cursorDirection
     * @returns Document[]
     */
    async find(
        collection: string,
        queries: Query[] = [],
        limit: number | null = 25,
        offset: number | null = null,
        orderAttributes: string[] = [],
        orderTypes: string[] = [],
        cursor: { [key: string]: any } = {},
        cursorDirection: string = Database.CURSOR_AFTER
    ): Promise<Document[]> {
        const name = this.filter(collection);
        const roles = Authorization.getRoles();
        const where: string[] = [];
        const orders: string[] = [];

        // Clone queries to prevent mutation
        queries = queries.map(q => Object.assign(Object.create(Object.getPrototypeOf(q)), q));

        // Map special attributes
        orderAttributes = orderAttributes.map(attr => {
            switch (attr) {
                case '$id':
                    return '_uid';
                case '$internalId':
                    return '_id';
                case '$tenant':
                    return '_tenant';
                case '$createdAt':
                    return '_createdAt';
                case '$updatedAt':
                    return '_updatedAt';
                default:
                    return attr;
            }
        });

        let hasIdAttribute = false;
        orderAttributes.forEach((attribute, i) => {
            if (attribute === '_uid') {
                hasIdAttribute = true;
            }

            const filteredAttribute = this.filter(attribute);
            let orderType = this.filter(orderTypes[i] || Database.ORDER_ASC);

            // Handle cursor for the first order attribute
            if (i === 0 && Object.keys(cursor).length > 0) {
                let orderMethodInternalId = Query.TYPE_GREATER; // To preserve natural order
                let orderMethod = orderType === Database.ORDER_DESC ? Query.TYPE_LESSER : Query.TYPE_GREATER;

                if (cursorDirection === Database.CURSOR_BEFORE) {
                    orderType = orderType === Database.ORDER_ASC ? Database.ORDER_DESC : Database.ORDER_ASC;
                    orderMethodInternalId = orderType === Database.ORDER_ASC ? Query.TYPE_LESSER : Query.TYPE_GREATER;
                    orderMethod = orderType === Database.ORDER_DESC ? Query.TYPE_LESSER : Query.TYPE_GREATER;
                }

                where.push(`(
                    table_main.\`${filteredAttribute}\` ${this.getSQLOperator(orderMethod)} ?
                    OR (
                        table_main.\`${filteredAttribute}\` = ?
                        AND table_main._id ${this.getSQLOperator(orderMethodInternalId)} ?
                    )
                )`);
            } else if (cursorDirection === Database.CURSOR_BEFORE) {
                orderType = orderType === Database.ORDER_ASC ? Database.ORDER_DESC : Database.ORDER_ASC;
            }

            orders.push(`\`${filteredAttribute}\` ${orderType}`);
        });

        // Default ordering by _id if not already
        if (!hasIdAttribute) {
            orders.push(`table_main._id ${cursorDirection === Database.CURSOR_AFTER ? Database.ORDER_ASC : Database.ORDER_DESC}`);
        }

        const conditions = await this.getSQLConditions(queries);
        if (conditions) {
            where.push(conditions);
        }

        if (Authorization.status) {
            where.push(this.getSQLPermissionsCondition(name, roles));
        }

        if (this.sharedTables) {
            where.push(`table_main._tenant = ?`);
        }

        const sqlWhere = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
        const sqlOrder = `ORDER BY ${orders.join(', ')}`;
        const sqlLimit = limit !== null ? `LIMIT ?` : '';
        const sqlOffset = offset !== null ? ` OFFSET ?` : '';

        const selections = this.getAttributeSelections(queries);

        const sql = `
            SELECT ${await this.getAttributeProjection(selections, 'table_main')}
            FROM ${this.getSQLTable(name)} as table_main
            ${sqlWhere}
            ${sqlOrder}
            ${sqlLimit}
            ${sqlOffset};
        `;

        const finalSql = this.trigger(Database.EVENT_DOCUMENT_FIND, sql);

        const values: any[] = [];

        // Bind cursor values for the first order attribute
        if (Object.keys(cursor).length > 0 && orderAttributes.length > 0) {
            const firstAttr = orderAttributes[0];
            const cursorValue = cursor[firstAttr.replace('_', '').replace('At', 'At')];
            const internalId = cursor['$internalId'];

            values.push(cursorValue, cursorValue, internalId);
        }

        // Bind other query values
        for (const query of queries) {
            await this.bindConditionValue(values, query);
        }

        if (this.sharedTables) {
            values.push(this.tenant);
        }

        if (limit !== null) {
            values.push(limit);
        }
        if (offset !== null) {
            values.push(offset);
        }

        try {
            const connection = await this.pool.getConnection();
            try {
                const [rows] = await connection.execute<RowDataPacket[]>(finalSql, values);
                const results: Document[] = rows.map(row => {
                    const doc: any = { ...row };
                    if (doc._uid) {
                        doc['$id'] = doc._uid;
                        delete doc._uid;
                    }
                    if (doc._id) {
                        doc['$internalId'] = doc._id;
                        delete doc._id;
                    }
                    if (doc._tenant) {
                        doc['$tenant'] = doc._tenant;
                        delete doc._tenant;
                    }
                    if (doc._createdAt) {
                        doc['$createdAt'] = doc._createdAt;
                        delete doc._createdAt;
                    }
                    if (doc._updatedAt) {
                        doc['$updatedAt'] = doc._updatedAt;
                        delete doc._updatedAt;
                    }
                    if (doc._permissions) {
                        doc['$permissions'] = JSON.parse(doc._permissions || '[]');
                        delete doc._permissions;
                    }
                    return new Document(doc);
                });

                if (cursorDirection === Database.CURSOR_BEFORE) {
                    results.reverse();
                }

                return results;
            } finally {
                connection.release();
            }
        } catch (error: any) {
            throw new DatabaseException(`Failed to find documents: ${error.message}`);
        }
    }

    /**
     * Count Documents
     *
     * @param collection
     * @param queries
     * @param max
     * @returns number
     */
    async count(collection: string, queries: Query[] = [], max: number | null = null): Promise<number> {
        const name = this.filter(collection);
        const roles = Authorization.getRoles();
        const where: string[] = [];
        const values: any[] = [];

        const conditions = await this.getSQLConditions(queries);
        if (conditions) {
            where.push(conditions);
        }

        if (Authorization.status) {
            where.push(this.getSQLPermissionsCondition(name, roles));
        }

        if (this.sharedTables) {
            where.push(`table_main._tenant = ?`);
            values.push(this.tenant);
        }

        const sqlWhere = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
        const sqlLimit = max !== null ? `LIMIT ?` : '';

        const sql = `
            SELECT COUNT(1) as sum FROM (
                SELECT 1
                FROM ${this.getSQLTable(name)} table_main
                ${sqlWhere}
                ${sqlLimit}
            ) table_count;
        `;

        const finalSql = this.trigger(Database.EVENT_DOCUMENT_COUNT, sql);

        if (max !== null) {
            values.push(max);
        }

        try {
            const connection = await this.pool.getConnection();
            try {
                const [rows] = await connection.execute<RowDataPacket[]>(finalSql, values);
                return rows[0]?.sum || 0;
            } finally {
                connection.release();
            }
        } catch (error: any) {
            throw new DatabaseException(`Failed to count documents: ${error.message}`);
        }
    }

    /**
     * Sum an Attribute
     *
     * @param collection
     * @param attribute
     * @param queries
     * @param max
     * @returns number
     */
    async sum(collection: string, attribute: string, queries: Query[] = [], max: number | null = null): Promise<number> {
        const name = this.filter(collection);
        const roles = Authorization.getRoles();
        const where: string[] = [];
        const values: any[] = [];

        const conditions = await this.getSQLConditions(queries);
        if (conditions) {
            where.push(conditions);
        }

        if (Authorization.status) {
            where.push(this.getSQLPermissionsCondition(name, roles));
        }

        if (this.sharedTables) {
            where.push(`table_main._tenant = ?`);
            values.push(this.tenant);
        }

        const sqlWhere = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
        const sqlLimit = max !== null ? `LIMIT ?` : '';

        const sql = `
            SELECT SUM(${attribute}) as sum FROM (
                SELECT ${attribute}
                FROM ${this.getSQLTable(name)} table_main
                ${sqlWhere}
                ${sqlLimit}
            ) table_count;
        `;

        const finalSql = this.trigger(Database.EVENT_DOCUMENT_SUM, sql);

        if (max !== null) {
            values.push(max);
        }

        try {
            const connection = await this.pool.getConnection();
            try {
                const [rows] = await connection.execute<RowDataPacket[]>(finalSql, values);
                return rows[0]?.sum || 0;
            } finally {
                connection.release();
            }
        } catch (error: any) {
            throw new DatabaseException(`Failed to sum attribute: ${error.message}`);
        }
    }

    /**
     * Get the SQL projection given the selected attributes
     *
     * @param selections
     * @param prefix
     * @returns string
     */
    protected async getAttributeProjection(selections: string[], prefix: string = ''): Promise<string> {
        if (selections.length === 0 || selections.includes('*')) {
            return prefix ? `\`${prefix}\`.*` : '*';
        }

        // Remove $id, $permissions, $collection if present since they are selected by default
        const filteredSelections = selections.filter(attr => !['$id', '$permissions', '$collection'].includes(attr));

        filteredSelections.push('_uid', '_permissions');

        if (filteredSelections.includes('$internalId')) {
            filteredSelections.push('_id');
            const index = filteredSelections.indexOf('$internalId');
            if (index !== -1) filteredSelections.splice(index, 1);
        }
        if (filteredSelections.includes('$createdAt')) {
            filteredSelections.push('_createdAt');
            const index = filteredSelections.indexOf('$createdAt');
            if (index !== -1) filteredSelections.splice(index, 1);
        }
        if (filteredSelections.includes('$updatedAt')) {
            filteredSelections.push('_updatedAt');
            const index = filteredSelections.indexOf('$updatedAt');
            if (index !== -1) filteredSelections.splice(index, 1);
        }

        const projected = filteredSelections.map(attr => {
            const filteredAttr = this.filter(attr);
            return prefix ? `\`${prefix}\`.\`${filteredAttr}\`` : `\`${filteredAttr}\``;
        });

        return projected.join(', ');
    }

    /**
     * Get SQL Condition
     *
     * @param query
     * @returns string
     */
    protected async getSQLCondition(query: Query): Promise<string> {
        let attribute = query.getAttribute();
        switch (attribute) {
            case '$id':
                attribute = '_uid';
                break;
            case '$internalId':
                attribute = '_id';
                break;
            case '$tenant':
                attribute = '_tenant';
                break;
            case '$createdAt':
                attribute = '_createdAt';
                break;
            case '$updatedAt':
                attribute = '_updatedAt';
                break;
            default:
                break;
        }

        const filteredAttribute = this.filter(attribute);
        const sqlAttribute = `\`table_main\`.\`${filteredAttribute}\``;
        const placeholder = `:${this.getSQLPlaceholder(query)}`;

        switch (query.getMethod()) {
            case Query.TYPE_OR:
            case Query.TYPE_AND:
                const conditions = await Promise.all(
                    (query.getValue() as Query[]).map(q => this.getSQLCondition(q))
                );
                const filteredConditions = conditions.filter(cond => cond !== '');
                const method = query.getMethod().toUpperCase();
                return filteredConditions.length > 0 ? ` ${method} (${filteredConditions.join(' AND ')})` : '';
            case Query.TYPE_SEARCH:
                return `MATCH(${sqlAttribute}) AGAINST (? IN BOOLEAN MODE)`;
            case Query.TYPE_BETWEEN:
                return `${sqlAttribute} BETWEEN ? AND ?`;
            case Query.TYPE_IS_NULL:
            case Query.TYPE_IS_NOT_NULL:
                return `${sqlAttribute} ${this.getSQLOperator(query.getMethod())}`;
            case Query.TYPE_CONTAINS:
                if (await this.getSupportForJSONOverlaps() && query.onArray()) {
                    return `JSON_OVERLAPS(${sqlAttribute}, ?)`;
                }
            // Fall through
            default:
                const conditionsDefault = query.getValues().map((_, idx) => `${sqlAttribute} ${this.getSQLOperator(query.getMethod())} ?`).join(' OR ');
                return conditionsDefault ? `(${conditionsDefault})` : '';
        }
    }

    /**
     * Get SQL Conditions from queries
     *
     * @param queries
     * @returns string
     */
    public async getSQLConditions(queries: Query[]): Promise<string> {
        if (queries.length === 0) return null as any;
        const conditions = await Promise.all(queries.map(query => this.getSQLCondition(query)));
        return conditions.filter(cond => cond !== '').join(' AND ');
    }

    /**
     * Get SQL Operator based on method
     *
     * @param method
     * @returns string
     */
    protected getSQLOperator(method: string): string {
        const operators: { [key: string]: string } = {
            [Query.TYPE_EQUAL]: '=',
            [Query.TYPE_NOT_EQUAL]: '!=',
            [Query.TYPE_GREATER]: '>',
            [Query.TYPE_LESSER]: '<',
            [Query.TYPE_GREATER_EQUAL]: '>=',
            [Query.TYPE_LESSER_EQUAL]: '<=',
            [Query.TYPE_CONTAINS]: 'LIKE',
            // Add more mappings as needed
        };
        return operators[method] || '=';
    }

    /**
     * Get SQL Placeholder based on query
     *
     * @param query
     * @returns string
     */
    protected getSQLPlaceholder(query: Query): string {
        // Implement based on how you manage placeholders
        return query.getAttribute();
    }



    /**
     * Process exception and throw relevant custom exceptions
     *
     * @param error
     */
    protected processException(error: any): void {
        if (error.code === 'ER_DUP_ENTRY' || error.code === '23000') {
            throw new DuplicateException(`Duplicated entry: ${error.message}`, error);
        }

        if ((error.code === 'ER_DATA_TOO_LONG' && error.errno === 1406) ||
            (error.code === '01000' && error.errno === 1265)) {
            throw new TruncateException('Resize would result in data truncation', error);
        }

        if (error.code === 'ER_PARSE_ERROR' && error.errno === 1060) {
            throw new DuplicateException(`Duplicate column/index: ${error.message}`, error);
        }

        if (error.code === '70100' && error.errno === 1969) {
            throw new TimeoutException('Query timed out', error);
        }

        throw error; // Rethrow if not handled
    }

    /**
     * Helper method to chunk arrays
     *
     * @param array
     * @param chunkSize
     * @returns any[][]
     */
    protected chunkArray<T>(array: T[], chunkSize: number): T[][] {
        const results: T[][] = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            results.push(array.slice(i, i + chunkSize));
        }
        return results;
    }



    /**
     * Trigger event hooks
     *
     * @param event
     * @param sql
     * @returns string
     */
    protected trigger(event: string, sql: string): string {
        // Implement event triggering logic
        // For example, modify SQL based on event listeners
        return sql;
    }

    /**
     * Get SQL Table name
     *
     * @param id
     * @returns string
     */
    protected getSQLTable(name: string): string {
        return `\`${this.getDatabase()}\`.\`${this.getNamespace()}_${this.filter(name)}\``;
    }




    /**
     * Get SQL Type based on provided parameters
     *
     * @param type
     * @param size
     * @param signed
     * @param array
     * @returns string
     */
    protected getSQLType(type: string, size: number, signed: boolean = true, array: boolean = false): string {
        if (array) {
            return 'JSON';
        }

        switch (type) {
            case Database.VAR_STRING:
                if (size > 16777215) {
                    return 'LONGTEXT';
                } else if (size > 65535) {
                    return 'MEDIUMTEXT';
                } else if (size > this.getMaxVarcharLength()) {
                    return 'TEXT';
                }
                return `VARCHAR(${size})`;
            case Database.VAR_INTEGER:
                const sign = signed ? '' : ' UNSIGNED';
                if (size >= 8) {
                    return `BIGINT${sign}`;
                }
                return `INT${sign}`;
            case Database.VAR_FLOAT:
                const floatSign = signed ? '' : ' UNSIGNED';
                return `DOUBLE${floatSign}`;
            case Database.VAR_BOOLEAN:
                return 'TINYINT(1)';
            case Database.VAR_RELATIONSHIP:
                return 'VARCHAR(255)';
            case Database.VAR_DATETIME:
                return 'DATETIME(3)';
            default:
                throw new DatabaseException(`Unknown type: ${type}. Must be one of ${Database.VAR_STRING}, ${Database.VAR_INTEGER}, ${Database.VAR_FLOAT}, ${Database.VAR_BOOLEAN}, ${Database.VAR_DATETIME}, ${Database.VAR_RELATIONSHIP}`);
        }
    }

    /**
     * Get PDO Type equivalent in MySQL2
     *
     * @param value
     * @returns any
     */
    protected getPDOType(value: any): any {
        switch (typeof value) {
            case 'number':
                return value;
            case 'string':
                return value;
            case 'boolean':
                return value ? 1 : 0;
            case 'object':
                return JSON.stringify(value);
            default:
                throw new DatabaseException(`Unknown PDO Type for ${typeof value}`);
        }
    }

    /**
     * Check if fulltext wildcard index is supported
     *
     * @returns boolean
     */
    async getSupportForFulltextWildcardIndex(): Promise<boolean> {
        return true;
    }

    /**
     * Check if JSON overlaps are supported
     *
     * @returns boolean
     */
    async getSupportForJSONOverlaps(): Promise<boolean> {
        return true;
    }

    /**
     * Check if timeouts are supported
     *
     * @returns boolean
     */
    async getSupportForTimeouts(): Promise<boolean> {
        return true;
    }

    /**
     * Set max execution time
     *
     * @param milliseconds
     * @param event
     */
    async setTimeout(milliseconds: number, event: string = Database.EVENT_ALL): Promise<void> {
        if (!this.getSupportForTimeouts()) {
            return;
        }
        if (milliseconds <= 0) {
            throw new DatabaseException('Timeout must be greater than 0');
        }

        const seconds = milliseconds / 1000;

        this.before(event, 'timeout', (sql: string) => {
            return `SET STATEMENT max_statement_time = ${seconds} FOR ${sql}`;
        });
    }

    public getCountOfDefaultAttributes(): number {
        return Database.INTERNAL_ATTRIBUTES.length;
    }

    public getCountOfDefaultIndexes(): number {
        return Database.INTERNAL_INDEXES.length;
    }

    getDocumentSizeLimit(): number {
        // TODO: Implement the logic for MariaDB
        return 65535;
    }

}