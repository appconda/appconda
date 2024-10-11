import { Pool, PoolConnection, QueryOptions, RowDataPacket } from 'mysql2/promise';
import { Adapter } from '../Adapter';
import { Database } from '../Database';
import { Document } from '../../Core';
import { Exception as DatabaseException } from '../Exception';
import { Query } from '../Query';


import crypto from 'crypto';

/**
 * Abstract SQL Adapter
 */
export abstract class SQL extends Adapter {
    protected pdo: Pool;
    protected _inTransaction: number = 0;
    protected sharedTables: boolean = false;

    /**
     * Constructor.
     *
     * Set connection and settings
     *
     * @param pdo Pool
     */
    constructor(pdo: Pool) {
        super();
        this.pdo = pdo;
    }

    /**
     * @inheritDoc
     */
    public async startTransaction(): Promise<boolean> {
        try {
            if (this._inTransaction === 0) {
                const connection = await this.getPDO().getConnection();
                await connection.beginTransaction();
                return true;
            }
            this._inTransaction++;
            return true;
        } catch (e: any) {
            throw new DatabaseException('Failed to start transaction: ' + e.message, e.code, e);
        }
    }

    /**
     * @inheritDoc
     */
    public async commitTransaction(): Promise<boolean> {
        if (this._inTransaction === 0) {
            return false;
        } else if (this._inTransaction > 1) {
            this._inTransaction--;
            return true;
        }

        try {
            const connection = await this.getPDO().getConnection();
            await connection.commit();
            return true;
        } catch (e: any) {
            throw new DatabaseException('Failed to commit transaction: ' + e.message, e.code, e);
        } finally {
            this._inTransaction--;
        }
    }

    /**
     * @inheritDoc
     */
    public async rollbackTransaction(): Promise<boolean> {
        if (this._inTransaction === 0) {
            return false;
        }

        try {
            const connection = await this.getPDO().getConnection();
            await connection.rollback();

            return true;
        } catch (e: any) {
            throw new DatabaseException('Failed to rollback transaction: ' + e.message, e.code, e);
        } finally {
            this._inTransaction = 0;
        }
    }

    /**
     * Ping Database
     *
     * @return Promise<boolean>
     * @throws Exception
     * @throws DatabaseException
     */
    public async ping(): Promise<boolean> {
        try {
            const [rows] = await this.getPDO().execute<RowDataPacket[]>('SELECT 1;');
            return rows.length > 0;
        } catch (e: any) {
            throw new DatabaseException('Ping failed: ' + e.message, e.code, e);
        }
    }

    /**
     * Check if Database exists
     * Optionally check if collection exists in Database
     *
     * @param database string
     * @param collection string | null
     * @return Promise<boolean>
     * @throws DatabaseException
     */
    public async exists(database: string, collection: string | null = null): Promise<boolean> {
        database = this.filter(database);

        let query: string;
        let values: any[] = [];

        if (collection !== null) {
            collection = this.filter(collection);
            query = `
                SELECT TABLE_NAME 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_SCHEMA = ? 
                  AND TABLE_NAME = ?
            `;
            values = [database, `${this.getNamespace()}_${collection}`];
        } else {
            query = `
                SELECT SCHEMA_NAME FROM
                INFORMATION_SCHEMA.SCHEMATA
                WHERE SCHEMA_NAME = ?
            `;
            values = [database];
        }

        try {
            const [rows] = await this.getPDO().execute<RowDataPacket[]>(query, values);
            return rows.length > 0;
        } catch (e: any) {
            //return false;
            throw new DatabaseException('Failed to check existence: ' + e.message, e.code, e);
        }
    }

    /**
     * List Databases
     *
     * @return Promise<Document[]>
     */
    public async list(): Promise<Document[]> {
        try {
            const [rows] = await this.getPDO().execute<RowDataPacket[]>(`
                SELECT SCHEMA_NAME 
                FROM INFORMATION_SCHEMA.SCHEMATA
            `);

            return rows.map(row => new Document({ name: row.SCHEMA_NAME }));
        } catch (e: any) {
            throw new DatabaseException('Failed to list databases: ' + e.message, e.code, e);
        }
    }

    /**
     * Get Document
     *
     * @param collection string
     * @param id string
     * @param queries Query[]
     * @param forUpdate boolean
     * @return Promise<Document>
     * @throws DatabaseException
     */
    public async getDocument(collection: string, id: string, queries: Query[] = [], forUpdate: boolean = false): Promise<Document> {
        const name = this.filter(collection);
        const selections = this.getAttributeSelections(queries);

        const forUpdateClause = forUpdate ? 'FOR UPDATE' : '';

        let sql = `
            SELECT ${await this.getAttributeProjection(selections)}
            FROM ${this.getSQLTable(name)}
            WHERE _uid = ?
        `;

        if (this.sharedTables) {
            sql += " AND _tenant = ?";
        }

        if (this.getSupportForUpdateLock()) {
            sql += ` ${forUpdateClause}`;
        }

        const values: any[] = [id];
        if (this.sharedTables) {
            values.push(this.getTenant());
        }

        try {
            const [rows] = await this.getPDO().execute<RowDataPacket[]>(sql, values);
            if (rows.length === 0) {
                return new Document({});
            }

            let document: any = rows[0];

            if ('_id' in document) {
                document['$internalId'] = document['_id'];
                delete document['_id'];
            }
            if ('_uid' in document) {
                document['$id'] = document['_uid'];
                delete document['_uid'];
            }
            if ('_tenant' in document) {
                document['$tenant'] = document['_tenant'];
                delete document['_tenant'];
            }
            if ('_createdAt' in document) {
                document['$createdAt'] = document['_createdAt'];
                delete document['_createdAt'];
            }
            if ('_updatedAt' in document) {
                document['$updatedAt'] = document['_updatedAt'];
                delete document['_updatedAt'];
            }
            if ('_permissions' in document) {
                document['$permissions'] = JSON.parse(document['_permissions'] || '[]');
                delete document['_permissions'];
            }

            return new Document(document);
        } catch (e: any) {
            throw new DatabaseException('Failed to get document: ' + e.message, e.code, e);
        }
    }

    /**
     * Get max STRING limit
     *
     * @return number
     */
    public getLimitForString(): number {
        return 4294967295;
    }

    /**
     * Get max INT limit
     *
     * @return number
     */
    public getLimitForInt(): number {
        return 4294967295;
    }

    /**
     * Get maximum column limit.
     * https://mariadb.com/kb/en/innodb-limitations/#limitations-on-schema
     * Can be inherited by MySQL since we utilize the InnoDB engine
     *
     * @return number
     */
    public getLimitForAttributes(): number {
        return 1017;
    }

    /**
     * Get maximum index limit.
     * https://mariadb.com/kb/en/innodb-limitations/#limitations-on-schema
     *
     * @return number
     */
    public getLimitForIndexes(): number {
        return 64;
    }

    /**
     * Is schemas supported?
     *
     * @return boolean
     */
    public getSupportForSchemas(): boolean {
        return true;
    }

    /**
     * Is index supported?
     *
     * @return boolean
     */
    public getSupportForIndex(): boolean {
        return true;
    }

    /**
     * Are attributes supported?
     *
     * @return boolean
     */
    public getSupportForAttributes(): boolean {
        return true;
    }

    /**
     * Is unique index supported?
     *
     * @return boolean
     */
    public getSupportForUniqueIndex(): boolean {
        return true;
    }

    /**
     * Is fulltext index supported?
     *
     * @return boolean
     */
    public getSupportForFulltextIndex(): boolean {
        return true;
    }

    /**
     * Are FOR UPDATE locks supported?
     *
     * @return boolean
     */
    public getSupportForUpdateLock(): boolean {
        return true;
    }

    /**
     * Is Attribute Resizing Supported?
     *
     * @return boolean
     */
    public getSupportForAttributeResizing(): boolean {
        return true;
    }

    /**
     * Get current attribute count from collection document
     *
     * @param collection Document
     * @return number
     */
    public getCountOfAttributes(collection: Document): number {
        const attributes = (collection.getAttribute('attributes') as any[] ?? []).length;
        // +1 ==> virtual columns count as total, so add as buffer
        return attributes + (SQL.getCountOfDefaultAttributes()) + 1;
    }

    /**
     * Get current index count from collection document
     *
     * @param collection Document
     * @return number
     */
    public getCountOfIndexes(collection: Document): number {
        const indexes = (collection.getAttribute('indexes') as any[] ?? []).length;
        return indexes + SQL.getCountOfDefaultIndexes();
    }

    /**
     * Returns number of attributes used by default.
     *
     * @return number
     */
    public static getCountOfDefaultAttributes(): number {
        return Database.INTERNAL_ATTRIBUTES.length;
    }

    /**
     * Returns number of indexes used by default.
     *
     * @return number
     */
    public static getCountOfDefaultIndexes(): number {
        return Database.INTERNAL_INDEXES.length;
    }

    /**
     * Get maximum width, in bytes, allowed for a SQL row
     * Return 0 when no restrictions apply
     *
     * @return number
     */
    public static getDocumentSizeLimit(): number {
        return 65535;
    }

    /**
     * Estimate maximum number of bytes required to store a document in $collection.
     * Byte requirement varies based on column type and size.
     * Needed to satisfy MariaDB/MySQL row width limit.
     *
     * @param collection Document
     * @return number
     */
    public getAttributeWidth(collection: Document): number {
        // Default collection has:
        // `_id` int(11) => 4 bytes
        // `_uid` char(255) => 1020 (255 bytes * 4 for utf8mb4)
        // but this number seems to vary, so we give a +500 byte buffer
        let total = 1500;

        const attributes = collection.getAttribute('attributes') as any[] ?? [];

        for (const attribute of attributes) {
            switch (attribute['type']) {
                case Database.VAR_STRING:
                    if (attribute['size'] > 16777215) {
                        total += 12; // LONGTEXT
                    } else if (attribute['size'] > 65535) {
                        total += 11; // MEDIUMTEXT
                    } else if (attribute['size'] > this.getMaxVarcharLength()) {
                        total += 10; // TEXT
                    } else if (attribute['size'] > 255) {
                        total += (attribute['size'] * 4) + 2; // VARCHAR >255
                    } else {
                        total += (attribute['size'] * 4) + 1; // VARCHAR <=255
                    }
                    break;

                case Database.VAR_INTEGER:
                    if (attribute['size'] >= 8) {
                        total += 8; // BIGINT
                    } else {
                        total += 4; // INT
                    }
                    break;
                case Database.VAR_FLOAT:
                    total += 8; // DOUBLE
                    break;

                case Database.VAR_BOOLEAN:
                    total += 1; // TINYINT(1)
                    break;

                case Database.VAR_RELATIONSHIP:
                    total += 4; // INT(11)
                    break;

                case Database.VAR_DATETIME:
                    total += 19; // 'YYYY-MM-DD HH:MM:SS'
                    break;
                default:
                    throw new DatabaseException('Unknown type: ' + attribute['type']);
            }
        }

        return total;
    }

    /**
     * Get list of keywords that cannot be used
     * Reference: https://mariadb.com/kb/en/reserved-words/
     *
     * @return string[]
     */
    public getKeywords(): string[] {
        return [
            'ACCESSIBLE', 'ADD', 'ALL', 'ALTER', 'ANALYZE', 'AND', 'AS', 'ASC', 'ASENSITIVE',
            'BEFORE', 'BETWEEN', 'BIGINT', 'BINARY', 'BLOB', 'BOTH', 'BY', 'CALL', 'CASCADE',
            'CASE', 'CHANGE', 'CHAR', 'CHARACTER', 'CHECK', 'COLLATE', 'COLUMN', 'CONDITION',
            'CONSTRAINT', 'CONTINUE', 'CONVERT', 'CREATE', 'CROSS', 'CURRENT_DATE',
            'CURRENT_ROLE', 'CURRENT_TIME', 'CURRENT_TIMESTAMP', 'CURRENT_USER', 'CURSOR',
            'DATABASE', 'DATABASES', 'DAY_HOUR', 'DAY_MICROSECOND', 'DAY_MINUTE', 'DAY_SECOND',
            'DEC', 'DECIMAL', 'DECLARE', 'DEFAULT', 'DELAYED', 'DELETE', 'DELETE_DOMAIN_ID',
            'DESC', 'DESCRIBE', 'DETERMINISTIC', 'DISTINCT', 'DISTINCTROW', 'DIV', 'DO_DOMAIN_IDS',
            'DOUBLE', 'DROP', 'DUAL', 'EACH', 'ELSE', 'ELSEIF', 'ENCLOSED', 'ESCAPED', 'EXCEPT',
            'EXISTS', 'EXIT', 'EXPLAIN', 'FALSE', 'FETCH', 'FLOAT', 'FLOAT4', 'FLOAT8', 'FOR',
            'FORCE', 'FOREIGN', 'FROM', 'FULLTEXT', 'GENERAL', 'GRANT', 'GROUP', 'HAVING',
            'HIGH_PRIORITY', 'HOUR_MICROSECOND', 'HOUR_MINUTE', 'HOUR_SECOND', 'IF', 'IGNORE',
            'IGNORE_DOMAIN_IDS', 'IGNORE_SERVER_IDS', 'IN', 'INDEX', 'INFILE', 'INNER', 'INOUT',
            'INSENSITIVE', 'INSERT', 'INT', 'INT1', 'INT2', 'INT3', 'INT4', 'INT8', 'INTEGER',
            'INTERSECT', 'INTERVAL', 'INTO', 'IS', 'ITERATE', 'JOIN', 'KEY', 'KEYS', 'KILL',
            'LEADING', 'LEAVE', 'LEFT', 'LIKE', 'LIMIT', 'LINEAR', 'LINES', 'LOAD', 'LOCALTIME',
            'LOCALTIMESTAMP', 'LOCK', 'LONG', 'LONGBLOB', 'LONGTEXT', 'LOOP', 'LOW_PRIORITY',
            'MASTER_HEARTBEAT_PERIOD', 'MASTER_SSL_VERIFY_SERVER_CERT', 'MATCH', 'MAXVALUE',
            'MEDIUMBLOB', 'MEDIUMINT', 'MEDIUMTEXT', 'MIDDLEINT', 'MINUTE_MICROSECOND',
            'MINUTE_SECOND', 'MOD', 'MODIFIES', 'NATURAL', 'NOT', 'NO_WRITE_TO_BINLOG', 'NULL',
            'NUMERIC', 'OFFSET', 'ON', 'OPTIMIZE', 'OPTION', 'OPTIONALLY', 'OR', 'ORDER', 'OUT',
            'OUTER', 'OUTFILE', 'OVER', 'PAGE_CHECKSUM', 'PARSE_VCOL_EXPR', 'PARTITION',
            'POSITION', 'PRECISION', 'PRIMARY', 'PROCEDURE', 'PURGE', 'RANGE', 'READ', 'READS',
            'READ_WRITE', 'REAL', 'RECURSIVE', 'REF_SYSTEM_ID', 'REFERENCES', 'REGEXP', 'RELEASE',
            'RENAME', 'REPEAT', 'REPLACE', 'REQUIRE', 'RESIGNAL', 'RESTRICT', 'RETURN',
            'RETURNING', 'REVOKE', 'RIGHT', 'RLIKE', 'ROWS', 'SCHEMA', 'SCHEMAS',
            'SECOND_MICROSECOND', 'SELECT', 'SENSITIVE', 'SEPARATOR', 'SET', 'SHOW', 'SIGNAL',
            'SLOW', 'SMALLINT', 'SPATIAL', 'SPECIFIC', 'SQL', 'SQLEXCEPTION', 'SQLSTATE',
            'SQLWARNING', 'SQL_BIG_RESULT', 'SQL_CALC_FOUND_ROWS', 'SQL_SMALL_RESULT', 'SSL',
            'STARTING', 'STATS_AUTO_RECALC', 'STATS_PERSISTENT', 'STATS_SAMPLE_PAGES',
            'STRAIGHT_JOIN', 'TABLE', 'TERMINATED', 'THEN', 'TINYBLOB', 'TINYINT',
            'TINYTEXT', 'TO', 'TRAILING', 'TRIGGER', 'TRUE', 'UNDO', 'UNION', 'UNIQUE',
            'UNLOCK', 'UNSIGNED', 'UPDATE', 'USAGE', 'USE', 'USING', 'UTC_DATE', 'UTC_TIME',
            'UTC_TIMESTAMP', 'VALUES', 'VARBINARY', 'VARCHAR', 'VARCHARACTER', 'VARYING', 'WHEN',
            'WHERE', 'WHILE', 'WINDOW', 'WITH', 'WRITE', 'XOR', 'YEAR_MONTH', 'ZEROFILL',
            'ACTION', 'BIT', 'DATE', 'ENUM', 'NO', 'TEXT', 'TIME', 'TIMESTAMP', 'BODY',
            'ELSIF', 'GOTO', 'HISTORY', 'MINUS', 'OTHERS', 'PACKAGE', 'PERIOD', 'RAISE',
            'ROWNUM', 'ROWTYPE', 'SYSDATE', 'SYSTEM', 'SYSTEM_TIME', 'VERSIONING', 'WITHOUT'
        ];
    }

    /**
     * Does the adapter handle casting?
     *
     * @return boolean
     */
    public getSupportForCasting(): boolean {
        return false;
    }

    /**
     * Does the adapter handle Query Array Contains?
     *
     * @return boolean
     */
    public getSupportForQueryContains(): boolean {
        return true;
    }

    /**
     * Does the adapter handle array Overlaps?
     *
     * @return boolean
     */
    public abstract getSupportForJSONOverlaps(): Promise<boolean>;

    /**
     * Does the adapter handle relationships?
     *
     * @return boolean
     */
    public getSupportForRelationships(): boolean {
        return true;
    }

    /**
     * @param stmt any
     * @param query Query
     * @return Promise<void>
     * @throws Exception
     */
    protected async bindConditionValue(values: any, query: Query): Promise<any> {
        if (query.getMethod() === Query.TYPE_SELECT) {
            return;
        }

        if (query.isNested()) {
            for (const value of query.getValues()) {
                values.push(value);
                // await this.bindConditionValue(stmt, value);
            }
            return;
        }

        if (await this.getSupportForJSONOverlaps() && query.onArray() && query.getMethod() === Query.TYPE_CONTAINS) {
            const placeholder = this.getSQLPlaceholder(query) + '_0';
            values.push(JSON.stringify(query.getValues()));
            // stmt.bindValue(placeholder, JSON.stringify(query.getValues()), 'string');
            return;
        }

        query.getValues().forEach((value, key) => {
            const processedValue = (() => {
                switch (query.getMethod()) {
                    case Query.TYPE_STARTS_WITH:
                        return this.escapeWildcards(value) + '%';
                    case Query.TYPE_ENDS_WITH:
                        return '%' + this.escapeWildcards(value);
                    case Query.TYPE_SEARCH:
                        return this.getFulltextValue(value);
                    case Query.TYPE_CONTAINS:
                        return query.onArray() ? JSON.stringify(value) : '%' + this.escapeWildcards(value) + '%';
                    default:
                        return value;
                }

            })();
            values.push(processedValue);

            const placeholder = this.getSQLPlaceholder(query) + '_' + key;
            // stmt.bindValue(placeholder, processedValue, this.getPDOType(processedValue));
        });
    }

    /**
     * @param value string
     * @return string
     */
    protected getFulltextValue(value: string): string {
        const exact = value.endsWith('"') && value.startsWith('"');

        /** Replace reserved chars with space. */
        const specialChars = ['@', ',', '+', '-', '*', ')', '(', '<', '>', '~', '"'];
        specialChars.forEach(char => {
            value = value.split(char).join(' ');
        });
        value = value.replace(/\s+/g, ' ').trim();

        if (value === '') {
            return '';
        }

        if (exact) {
            return `"${value}"`;
        } else {
            /** Prepend wildcard by default on the back. */
            return `${value}*`;
        }
    }

    /**
     * Get SQL Operator
     *
     * @param method string
     * @return string
     * @throws DatabaseException
     */
    protected getSQLOperator(method: string): string {
        switch (method) {
            case Query.TYPE_EQUAL:
                return '=';
            case Query.TYPE_NOT_EQUAL:
                return '!=';
            case Query.TYPE_LESSER:
                return '<';
            case Query.TYPE_LESSER_EQUAL:
                return '<=';
            case Query.TYPE_GREATER:
                return '>';
            case Query.TYPE_GREATER_EQUAL:
                return '>=';
            case Query.TYPE_IS_NULL:
                return 'IS NULL';
            case Query.TYPE_IS_NOT_NULL:
                return 'IS NOT NULL';
            case Query.TYPE_STARTS_WITH:
            case Query.TYPE_ENDS_WITH:
            case Query.TYPE_CONTAINS:
                return this.getLikeOperator();
            default:
                throw new DatabaseException('Unknown method: ' + method);
        }
    }

    /**
     * @param query Query
     * @return string
     * @throws DatabaseException
     */
    protected getSQLPlaceholder(query: Query): string {
        const json = JSON.stringify([query.getAttribute(), query.getMethod(), query.getValues()]);

        if (json === null) {
            throw new DatabaseException('Failed to encode query');
        }

        return crypto.createHash('md5').update(json).digest('hex');
    }

    /**
     * Escape wildcards
     *
     * @param value string
     * @return string
     */
    public escapeWildcards(value: string): string {
        const wildcards = ['%', '_', '[', ']', '^', '-', '.', '*', '+', '?', '(', ')', '{', '}', '|'];
        wildcards.forEach(wildcard => {
            value = value.split(wildcard).join(`\\${wildcard}`);
        });
        return value;
    }

    /**
     * Get SQL Index Type
     *
     * @param type string
     * @return string
     * @throws DatabaseException
     */
    protected getSQLIndexType(type: string): string {
        switch (type) {
            case Database.INDEX_KEY:
                return 'INDEX';

            case Database.INDEX_UNIQUE:
                return 'UNIQUE INDEX';

            case Database.INDEX_FULLTEXT:
                return 'FULLTEXT INDEX';

            default:
                throw new DatabaseException(`Unknown index type: ${type}. Must be one of ${Database.INDEX_KEY}, ${Database.INDEX_UNIQUE}, ${Database.INDEX_FULLTEXT}`);
        }
    }

    /**
     * Get SQL condition for permissions
     *
     * @param collection string
     * @param roles string[]
     * @return string
     * @throws DatabaseException
     */
    protected getSQLPermissionsCondition(collection: string, roles: string[]): string {
        const quotedRoles = roles.map(role => this.getPDO().escape(role));

        let tenantQuery = '';
        if (this.sharedTables) {
            tenantQuery = 'AND _tenant = :_tenant';
        }

        return `table_main._uid IN (
                SELECT _document
                FROM ${this.getSQLTable(collection + '_perms')}
                WHERE _permission IN (${quotedRoles.join(', ')})
                  AND _type = 'read'
                  ${tenantQuery}
            )`;
    }

    /**
     * Get SQL table
     *
     * @param name string
     * @return string
     * @throws DatabaseException
     */
    protected getSQLTable(name: string): string {
        return `\`${this.getDatabase()}\`.\`${this.getNamespace()}_${this.filter(name)}\``;
    }

    /**
     * Returns the current PDO object
     *
     * @return Pool
     */
    protected getPDO(): Pool {
        return this.pdo;
    }

    /**
     * Get PDO Type
     *
     * @param value any
     * @return number
     * @throws DatabaseException
     */
    protected abstract getPDOType(value: any): number;

    /**
     * Returns default PDO configuration
     *
     * @return object
     */
    public static getPDOAttributes(): object {
        return {
            // mysql2 uses connection options instead of PDO attributes
            // Adjust as necessary
            // Example:
            // host: 'localhost',
            // user: 'root',
            // database: 'test',
            // waitForConnections: true,
            // connectionLimit: 10,
            // queueLimit: 0
        };
    }

    /**
     * Get maximum VARCHAR length
     *
     * @return number
     */
    public getMaxVarcharLength(): number {
        return 16381; // Floor value for Postgres:16383 | MySQL:16381 | MariaDB:16382
    }

    /**
     * Get maximum index length
     *
     * @return number
     */
    public getMaxIndexLength(): number {
        return 768;
    }

    /**
     * Get SQL condition
     *
     * @param query Query
     * @return string
     * @throws DatabaseException
     */
    protected abstract getSQLCondition(query: Query): Promise<string>;

    /**
     * Get multiple SQL conditions
     *
     * @param queries Query[]
     * @param separator string
     * @return string
     * @throws DatabaseException
     */
    public async getSQLConditions(queries: Query[] = [], separator: string = 'AND'): Promise<string> {
        const conditions: string[] = [];
        for (const query of queries) {
            if (query.getMethod() === Query.TYPE_SELECT) {
                continue;
            }

            if (query.isNested()) {
                conditions.push(await this.getSQLConditions(query.getValues(), query.getMethod()));
            } else {
                conditions.push(await this.getSQLCondition(query));
            }
        }

        const tmp = conditions.join(` ${separator} `);
        return tmp === '' ? '' : `(${tmp})`;
    }

    /**
     * Get LIKE operator
     *
     * @return string
     */
    public getLikeOperator(): string {
        return 'LIKE';
    }
}