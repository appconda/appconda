import { AppcondaException as Exception } from "../../../Appconda/Extend/Exception";
import { ArrayList, Authorization, Boolean, Document, FloatValidator, ID, Integer, IP, JSONValidator, Nullable, Permission, Range, Role, Text, URLValidator, WhiteList } from "../../../Tuval/Core";
import { AuthorizationException, Database, Datetime, Duplicate, Index, Key, Limit, LimitException, Offset, Queries, Query, QueryException, Structure, StructureException, UID } from "../../../Tuval/Database";

import { Database as EventDatabase, } from "../../../Appconda/Event/Database";
import { Event } from "../../../Appconda/Event/Event";
import { Response } from "../../../Appconda/Tuval/Response";
import { Request } from "../../../Appconda/Tuval/Request";
import { App } from "../../../Tuval/Http";
import { APP_AUTH_TYPE_ADMIN, APP_AUTH_TYPE_JWT, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_SESSION, APP_DATABASE_ATTRIBUTE_EMAIL, APP_DATABASE_ATTRIBUTE_ENUM, APP_DATABASE_ATTRIBUTE_FLOAT_RANGE, APP_DATABASE_ATTRIBUTE_INT_RANGE, APP_DATABASE_ATTRIBUTE_IP, APP_DATABASE_ATTRIBUTE_STRING_MAX_LENGTH, APP_DATABASE_ATTRIBUTE_URL, APP_LIMIT_ARRAY_ELEMENT_SIZE, APP_LIMIT_ARRAY_PARAMS_SIZE, APP_LIMIT_COUNT, APP_LIMIT_WRITE_RATE_DEFAULT, APP_LIMIT_WRITE_RATE_PERIOD_DEFAULT, DATABASE_TYPE_CREATE_INDEX, DATABASE_TYPE_DELETE_ATTRIBUTE, DATABASE_TYPE_DELETE_COLLECTION, DATABASE_TYPE_DELETE_DATABASE, DATABASE_TYPE_DELETE_INDEX, DELETE_TYPE_AUDIT, METRIC_COLLECTIONS, METRIC_DATABASE_ID_COLLECTION_ID_DOCUMENTS, METRIC_DATABASE_ID_COLLECTIONS, METRIC_DATABASE_ID_DOCUMENTS, METRIC_DATABASES, METRIC_DOCUMENTS } from "../../init";
import { CustomId } from "../../../Appconda/Tuval/Database/Validators/CustomId";
import { Config } from "../../../Tuval/Config";
import { Databases } from "../../../Appconda/Database/Validators/Queries/Databases";
import { Locale } from "../../../Tuval/Locale";
import { Audit } from "../../../Tuval/Audit";
import { Detector } from "../../../Appconda/Detector/Detector";
import { Permissions } from "../../../Tuval/Database/Validators/Permissions";
import { Collections } from "../../../Appconda/Database/Validators/Queries/Collections";
import { Email } from "../../../Appconda/Network/Validators/Email";
import { Attributes } from "../../../Appconda/Database/Validators/Queries/Attributes";
import { Indexes } from "../../../Appconda/Database/Validators/Queries/Indexes";
import { Auth } from "../../../Tuval/Auth";
import { Delete } from "../../../Appconda/Event/Delete";

/**
 * Create attribute of varying type
 *
 * @param databaseId - The ID of the database
 * @param collectionId - The ID of the collection
 * @param attribute - The attribute document
 * @param response - The response object
 * @param dbForProject - The database instance for the project
 * @param queueForDatabase - The event queue for database operations
 * @param queueForEvents - The event queue for event operations
 * @returns Newly created attribute document
 * @throws AuthorizationException
 * @throws Exception
 * @throws LimitException
 * @throws RestrictedException
 * @throws StructureException
 * @throws ConflictException
 */
async function createAttribute(
    databaseId: string,
    collectionId: string,
    attribute: Document,
    response: Response,
    dbForProject: Database,
    queueForDatabase: EventDatabase,
    queueForEvents: Event
): Promise<Document> {
    const key = attribute.getAttribute('key');
    const type = attribute.getAttribute('type', '');
    const size = attribute.getAttribute('size', 0);
    const required = attribute.getAttribute('required', true);
    const signed = attribute.getAttribute('signed', true);
    const array = attribute.getAttribute('array', false);
    const format = attribute.getAttribute('format', '');
    const formatOptions = attribute.getAttribute('formatOptions', []);
    const filters = attribute.getAttribute('filters', []);
    const defaultValue = attribute.getAttribute('default');
    const options = attribute.getAttribute('options', []);

    const db = await Authorization.skip(() => dbForProject.getDocument('databases', databaseId));

    if (db.isEmpty()) {
        throw new Exception(Exception.DATABASE_NOT_FOUND);
    }

    const collection = await dbForProject.getDocument('database_' + db.getInternalId(), collectionId);

    if (collection.isEmpty()) {
        throw new Exception(Exception.COLLECTION_NOT_FOUND);
    }

    if (format && !Structure.hasFormat(format, type)) {
        throw new Exception(Exception.ATTRIBUTE_FORMAT_UNSUPPORTED, `Format ${format} not available for ${type} attributes.`);
    }

    if (required && defaultValue !== undefined) {
        throw new Exception(Exception.ATTRIBUTE_DEFAULT_UNSUPPORTED, 'Cannot set default value for required attribute');
    }

    if (array && defaultValue !== undefined) {
        throw new Exception(Exception.ATTRIBUTE_DEFAULT_UNSUPPORTED, 'Cannot set default value for array attributes');
    }

    let relatedCollection: Document = null as any;
    if (type === Database.VAR_RELATIONSHIP) {
        options['side'] = Database.RELATION_SIDE_PARENT;
        relatedCollection = await dbForProject.getDocument('database_' + db.getInternalId(), options['relatedCollection'] || '');
        if (relatedCollection.isEmpty()) {
            throw new Exception(Exception.COLLECTION_NOT_FOUND, 'The related collection was not found.');
        }
    }

    let newAttribute: Document;
    try {
        newAttribute = new Document({
            '$id': ID.custom(`${db.getInternalId()}_${collection.getInternalId()}_${key}`),
            key,
            databaseInternalId: db.getInternalId(),
            databaseId: db.getId(),
            collectionInternalId: collection.getInternalId(),
            collectionId,
            type,
            status: 'processing',
            size,
            required,
            signed,
            default: defaultValue,
            array,
            format,
            formatOptions,
            filters,
            options,
        });

        await dbForProject.checkAttribute(collection, newAttribute);
        const createdAttribute = await dbForProject.createDocument('attributes', newAttribute);
    } catch (error) {
        dbForProject.purgeCachedDocument('database_' + db.getInternalId(), collectionId);
        dbForProject.purgeCachedCollection('database_' + db.getInternalId() + '_collection_' + collection.getInternalId());
        throw error;
    }

    dbForProject.purgeCachedDocument('database_' + db.getInternalId(), collectionId);
    dbForProject.purgeCachedCollection('database_' + db.getInternalId() + '_collection_' + collection.getInternalId());

    if (type === Database.VAR_RELATIONSHIP && options['twoWay']) {
        const twoWayKey = options['twoWayKey'];
        options['relatedCollection'] = collection.getId();
        options['twoWayKey'] = key;
        options['side'] = Database.RELATION_SIDE_CHILD;

        try {
            const twoWayAttribute = new Document({
                '$id': ID.custom(`${db.getInternalId()}_${relatedCollection.getInternalId()}_${twoWayKey}`),
                key: twoWayKey,
                databaseInternalId: db.getInternalId(),
                databaseId: db.getId(),
                collectionInternalId: relatedCollection.getInternalId(),
                collectionId: relatedCollection.getId(),
                type,
                status: 'processing',
                size,
                required,
                signed,
                default: defaultValue,
                array,
                format,
                formatOptions,
                filters,
                options,
            });

            await dbForProject.checkAttribute(relatedCollection, twoWayAttribute);
            await dbForProject.createDocument('attributes', twoWayAttribute);
        } catch (error) {
            await dbForProject.deleteDocument('attributes', newAttribute.getId());
            throw error;
        }

        dbForProject.purgeCachedDocument('database_' + db.getInternalId(), relatedCollection.getId());
        dbForProject.purgeCachedCollection('database_' + db.getInternalId() + '_collection_' + relatedCollection.getInternalId());
    }

    queueForDatabase
        .setType('DATABASE_TYPE_CREATE_ATTRIBUTE')
        .setDatabase(db)
        .setCollection(collection)
        .setDocument(newAttribute);

    queueForEvents
        .setContext('collection', collection)
        .setContext('database', db)
        .setParam('databaseId', databaseId)
        .setParam('collectionId', collection.getId())
        .setParam('attributeId', newAttribute.getId());

    response.setStatusCode(Response.STATUS_CODE_CREATED);

    return newAttribute;
}



/**
 * Update attribute of varying type
 *
 * @param databaseId - The ID of the database
 * @param collectionId - The ID of the collection
 * @param key - The key of the attribute
 * @param dbForProject - The database instance for the project
 * @param queueForEvents - The event queue for event operations
 * @param type - The type of the attribute
 * @param filter - The filter for the attribute
 * @param defaultValue - The default value for the attribute
 * @param required - Whether the attribute is required
 * @param min - The minimum value for the attribute
 * @param max - The maximum value for the attribute
 * @param elements - The elements for enum type attributes
 * @param options - Additional options for the attribute
 * @returns Updated attribute document
 * @throws AuthorizationException
 * @throws Exception
 * @throws LimitException
 * @throws RestrictedException
 * @throws StructureException
 * @throws ConflictException
 */
async function updateAttribute(

    {
        databaseId,
        collectionId,
        key,
        dbForProject,
        queueForEvents,
        type,
        filter = null,
        defaultValue = null,
        required = null,
        min = null ,
        max = null ,
        elements = null,
        options = {}
    }: {
        databaseId: string,
        collectionId: string,
        key: string,
        dbForProject: Database,
        queueForEvents: Event,
        type: string,
        filter?: string | null,
        defaultValue?: string | boolean | number | null,
        required?: boolean | null,
        min?: number | null,
        max?: number | null,
        elements?: string[] | null,
        options?: Record<string, any>
    }
): Promise<Document> {
    const db = await Authorization.skip(() => dbForProject.getDocument('databases', databaseId));

    if (db.isEmpty()) {
        throw new Exception(Exception.DATABASE_NOT_FOUND);
    }

    const collection = await dbForProject.getDocument('database_' + db.getInternalId(), collectionId);

    if (collection.isEmpty()) {
        throw new Exception(Exception.COLLECTION_NOT_FOUND);
    }

    const attribute = await dbForProject.getDocument('attributes', `${db.getInternalId()}_${collection.getInternalId()}_${key}`);

    if (attribute.isEmpty()) {
        throw new Exception(Exception.ATTRIBUTE_NOT_FOUND);
    }

    if (attribute.getAttribute('status') !== 'available') {
        throw new Exception(Exception.ATTRIBUTE_NOT_AVAILABLE);
    }

    if (attribute.getAttribute('type') !== type) {
        throw new Exception(Exception.ATTRIBUTE_TYPE_INVALID);
    }

    if (attribute.getAttribute('type') === Database.VAR_STRING && attribute.getAttribute('filter') !== filter) {
        throw new Exception(Exception.ATTRIBUTE_TYPE_INVALID);
    }

    if (required && defaultValue !== undefined) {
        throw new Exception(Exception.ATTRIBUTE_DEFAULT_UNSUPPORTED, 'Cannot set default value for required attribute');
    }

    if (attribute.getAttribute('array', false) && defaultValue !== undefined) {
        throw new Exception(Exception.ATTRIBUTE_DEFAULT_UNSUPPORTED, 'Cannot set default value for array attributes');
    }

    const collectionIdFull = `database_${db.getInternalId()}_collection_${collection.getInternalId()}`;

    attribute
        .setAttribute('default', defaultValue)
        .setAttribute('required', required);

    const formatOptions = attribute.getAttribute('formatOptions');

    switch (attribute.getAttribute('format')) {
        case 'APP_DATABASE_ATTRIBUTE_INT_RANGE':
        case 'APP_DATABASE_ATTRIBUTE_FLOAT_RANGE':
            if (min === formatOptions['min'] && max === formatOptions['max']) {
                break;
            }

            if (min > max) {
                throw new Exception(Exception.ATTRIBUTE_VALUE_INVALID, 'Minimum value must be lesser than maximum value');
            }

            const validator = attribute.getAttribute('format') === 'APP_DATABASE_ATTRIBUTE_INT_RANGE'
                ? new Range(min, max, Database.VAR_INTEGER)
                : new Range(min, max, Database.VAR_FLOAT);

            if (defaultValue !== null && !validator.isValid(defaultValue)) {
                throw new Exception(Exception.ATTRIBUTE_VALUE_INVALID, validator.getDescription());
            }

            options = { min, max };
            attribute.setAttribute('formatOptions', options);

            break;
        case 'APP_DATABASE_ATTRIBUTE_ENUM':
            if (!elements || elements.length === 0) {
                throw new Exception(Exception.ATTRIBUTE_VALUE_INVALID, 'Enum elements must not be empty');
            }

            for (const element of elements) {
                if (element.length === 0) {
                    throw new Exception(Exception.ATTRIBUTE_VALUE_INVALID, 'Each enum element must not be empty');
                }
            }

            if (defaultValue !== null && !elements.includes(defaultValue as string)) {
                throw new Exception(Exception.ATTRIBUTE_VALUE_INVALID, 'Default value not found in elements');
            }

            options = { elements };
            attribute.setAttribute('formatOptions', options);

            break;
    }

    if (type === Database.VAR_RELATIONSHIP) {
        const primaryDocumentOptions = { ...attribute.getAttribute('options', {}), ...options };
        attribute.setAttribute('options', primaryDocumentOptions);

        await dbForProject.updateRelationship(
            collectionIdFull,
            key,
            primaryDocumentOptions['onDelete']
        );

        if (primaryDocumentOptions['twoWay']) {
            const relatedCollection = await dbForProject.getDocument('database_' + db.getInternalId(), primaryDocumentOptions['relatedCollection']);

            const relatedAttribute = await dbForProject.getDocument('attributes', `${db.getInternalId()}_${relatedCollection.getInternalId()}_${primaryDocumentOptions['twoWayKey']}`);
            const relatedOptions = { ...relatedAttribute.getAttribute('options'), ...options };
            relatedAttribute.setAttribute('options', relatedOptions);
            await dbForProject.updateDocument('attributes', `${db.getInternalId()}_${relatedCollection.getInternalId()}_${primaryDocumentOptions['twoWayKey']}`, relatedAttribute);
            dbForProject.purgeCachedDocument('database_' + db.getInternalId(), relatedCollection.getId());
        }
    } else {
        await dbForProject.updateAttribute({
            collection: collectionIdFull,
            id: key,
            required,
            defaultValue: defaultValue,
            formatOptions: options ?? null
        });
    }

    const updatedAttribute = await dbForProject.updateDocument('attributes', `${db.getInternalId()}_${collection.getInternalId()}_${key}`, attribute);
    dbForProject.purgeCachedDocument('database_' + db.getInternalId(), collection.getId());

    queueForEvents
        .setContext('collection', collection)
        .setContext('database', db)
        .setParam('databaseId', databaseId)
        .setParam('collectionId', collection.getId())
        .setParam('attributeId', updatedAttribute.getId());

    return updatedAttribute;
}

App.init()
    .groups(['api', 'database'])
    .inject('request')
    .inject('dbForProject')
    .action(async ({ request, dbForProject }: { request: Request, dbForProject: Database }) => {
        const timeout = parseInt(request.getHeader('x-appconda-timeout'), 10);

        if (!isNaN(timeout) && App.isDevelopment()) {
            dbForProject.setTimeout(timeout);
        }
    });


App.post('/v1/databases')
    .desc('Create database')
    .groups(['api', 'database'])
    .label('event', 'databases.[databaseId].create')
    .label('scope', 'databases.write')
    .label('audits.event', 'database.create')
    .label('audits.resource', 'database/{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'create')
    .label('sdk.description', '/docs/references/databases/create.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_DATABASE)
    .param('databaseId', '', new CustomId(), 'Unique Id. Choose a custom ID or generate a random ID with `ID.unique()`. Valid chars are a-z, A-Z, 0-9, period, hyphen, and underscore. Can\'t start with a special char. Max length is 36 chars.')
    .param('name', '', new Text(128), 'Database name. Max length: 128 chars.')
    .param('enabled', true, new Boolean(), 'Is the database enabled? When set to \'disabled\', users cannot access the database but Server SDKs with an API key can still read and write to the database. No data is lost when this is toggled.', true)
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async ({ databaseId, name, enabled, response, dbForProject, queueForEvents }: { databaseId: string, name: string, enabled: boolean, response: Response, dbForProject: Database, queueForEvents: Event }) => {

        databaseId = databaseId === 'unique()' ? ID.unique() : databaseId;

        let database: Document;
        try {
            await dbForProject.createDocument('databases', new Document({
                '$id': databaseId,
                'name': name,
                'enabled': enabled,
                'search': [databaseId, name].join(' '),
            }));
            database = await dbForProject.getDocument('databases', databaseId);

            const collections = (Config.getParam('collections', [])['databases'] ?? {})['collections'] ?? [];
            if (!collections) {
                throw new Exception(Exception.GENERAL_SERVER_ERROR, 'The "collections" collection is not configured.');
            }

            const attributes = collections['attributes'].map((attribute: any) => new Document({
                '$id': attribute['$id'],
                'type': attribute['type'],
                'size': attribute['size'],
                'required': attribute['required'],
                'signed': attribute['signed'],
                'array': attribute['array'],
                'filters': attribute['filters'],
                'default': attribute['default'] ?? null,
                'format': attribute['format'] ?? ''
            }));

            const indexes = collections['indexes'].map((index: any) => new Document({
                '$id': index['$id'],
                'type': index['type'],
                'attributes': index['attributes'],
                'lengths': index['lengths'],
                'orders': index['orders'],
            }));

            await dbForProject.createCollection('database_' + database.getInternalId(), attributes, indexes);
        } catch (error) {
            if (error instanceof Duplicate) {
                throw new Exception(Exception.DATABASE_ALREADY_EXISTS);
            }
            throw error;
        }

        queueForEvents.setParam('databaseId', database.getId());

        response
            .setStatusCode(Response.STATUS_CODE_CREATED)
            .dynamic(database, Response.MODEL_DATABASE);
    });


App.get('/v1/databases')
    .desc('List databases')
    .groups(['api', 'database'])
    .label('scope', 'databases.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'list')
    .label('sdk.description', '/docs/references/databases/list.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_DATABASE_LIST)
    .param('queries', [], new Databases(), `Array of query strings generated using the Query class provided by the SDK. [Learn more about queries](https://appconda.io/docs/queries). Maximum of ${APP_LIMIT_ARRAY_PARAMS_SIZE} queries are allowed, each ${APP_LIMIT_ARRAY_ELEMENT_SIZE} characters long. You may filter on the following attributes: ${Databases.ALLOWED_ATTRIBUTES.join(', ')}`, true)
    .param('search', '', new Text(256), 'Search term to filter your list results. Max length: 256 chars.', true)
    .inject('response')
    .inject('dbForProject')
    .action(async ({ queries, search, response, dbForProject }: { queries: any[], search: string, response: Response, dbForProject: Database }) => {

        try {
            queries = Query.parseQueries(queries);
        } catch (e) {
            if (e instanceof QueryException) {
                throw new Exception(Exception.GENERAL_QUERY_INVALID, e.message);
            }
            throw e;
        }

        if (search) {
            queries.push(Query.search('search', search));
        }

        const cursor = queries.filter(query => [Query.TYPE_CURSOR_AFTER, Query.TYPE_CURSOR_BEFORE].includes(query.getMethod()));
        const cursorQuery = cursor[0];
        if (cursorQuery) {
            const databaseId = cursorQuery.getValue();
            const cursorDocument = await dbForProject.getDocument('databases', databaseId);

            if (cursorDocument.isEmpty()) {
                throw new Exception(Exception.GENERAL_CURSOR_NOT_FOUND, `Database '${databaseId}' for the 'cursor' value not found.`);
            }

            cursorQuery.setValue(cursorDocument);
        }

        const filterQueries = Query.groupByType(queries)['filters'];

        response.dynamic(new Document({
            'databases': await dbForProject.find('databases', queries),
            'total': await dbForProject.count('databases', filterQueries, APP_LIMIT_COUNT),
        }), Response.MODEL_DATABASE_LIST);
    });



App.get('/v1/databases/:databaseId')
    .desc('Get database')
    .groups(['api', 'database'])
    .label('scope', 'databases.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'get')
    .label('sdk.description', '/docs/references/databases/get.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_DATABASE)
    .param('databaseId', '', new UID(), 'Database ID.')
    .inject('response')
    .inject('dbForProject')
    .action(async ({ databaseId, response, dbForProject }: { databaseId: string, response: Response, dbForProject: Database }) => {

        const database = await dbForProject.getDocument('databases', databaseId);

        if (database.isEmpty()) {
            throw new Exception(Exception.DATABASE_NOT_FOUND);
        }

        response.dynamic(database, Response.MODEL_DATABASE);
    });


App.get('/v1/databases/:databaseId/logs')
    .desc('List database logs')
    .groups(['api', 'database'])
    .label('scope', 'databases.read')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'listLogs')
    .label('sdk.description', '/docs/references/databases/get-logs.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_LOG_LIST)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('queries', [], new Queries([new Limit(), new Offset()]), 'Array of query strings generated using the Query class provided by the SDK. [Learn more about queries](https://appconda.io/docs/queries). Only supported methods are limit and offset', true)
    .inject('response')
    .inject('dbForProject')
    .inject('locale')
    .inject('geodb')
    .action(async ({ databaseId, queries, response, dbForProject, locale, geodb }: { databaseId: string, queries: any[], response: Response, dbForProject: Database, locale: Locale, geodb: any }) => {

        const database = await dbForProject.getDocument('databases', databaseId);

        if (database.isEmpty()) {
            throw new Exception(Exception.DATABASE_NOT_FOUND);
        }

        try {
            queries = Query.parseQueries(queries);
        } catch (e) {
            if (e instanceof QueryException) {
                throw new Exception(Exception.GENERAL_QUERY_INVALID, e.message);
            }
            throw e;
        }

        const grouped = Query.groupByType(queries);
        const limit = grouped['limit'] ?? APP_LIMIT_COUNT;
        const offset = grouped['offset'] ?? 0;

        const audit = new Audit(dbForProject);
        const resource = 'database/' + databaseId;
        const logs = await audit.getLogsByResource(resource, limit, offset);

        const output = [];

        for (const log of logs) {
            const userAgent = log['userAgent'] || 'UNKNOWN';

            const detector = new Detector(userAgent);
            detector.skipBotDetection();

            const os = detector.getOS();
            const client = detector.getClient();
            const device = detector.getDevice();

            const logDocument = new Document({
                event: log['event'],
                userId: ID.custom(log['data']['userId']),
                userEmail: log['data']['userEmail'] || null,
                userName: log['data']['userName'] || null,
                mode: log['data']['mode'] || null,
                ip: log['ip'],
                time: log['time'],
                osCode: os['osCode'],
                osName: os['osName'],
                osVersion: os['osVersion'],
                clientType: client['clientType'],
                clientCode: client['clientCode'],
                clientName: client['clientName'],
                clientVersion: client['clientVersion'],
                clientEngine: client['clientEngine'],
                clientEngineVersion: client['clientEngineVersion'],
                deviceName: device['deviceName'],
                deviceBrand: device['deviceBrand'],
                deviceModel: device['deviceModel']
            });

            const record = geodb.get(log['ip']);

            if (record) {
                logDocument['countryCode'] = locale.getText('countries.' + record['country']['iso_code'].toLowerCase(), false) ? record['country']['iso_code'].toLowerCase() : '--';
                logDocument['countryName'] = locale.getText('countries.' + record['country']['iso_code'].toLowerCase(), locale.getText('locale.country.unknown'));
            } else {
                logDocument['countryCode'] = '--';
                logDocument['countryName'] = locale.getText('locale.country.unknown');
            }

            output.push(logDocument);
        }

        response.dynamic(new Document({
            total: await audit.countLogsByResource(resource),
            logs: output,
        }), Response.MODEL_LOG_LIST);
    });


App.put('/v1/databases/:databaseId')
    .desc('Update database')
    .groups(['api', 'database', 'schema'])
    .label('scope', 'databases.write')
    .label('event', 'databases.[databaseId].update')
    .label('audits.event', 'database.update')
    .label('audits.resource', 'database/{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'update')
    .label('sdk.description', '/docs/references/databases/update.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_DATABASE)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('name', null, new Text(128), 'Database name. Max length: 128 chars.')
    .param('enabled', true, new Boolean(), 'Is database enabled? When set to \'disabled\', users cannot access the database but Server SDKs with an API key can still read and write to the database. No data is lost when this is toggled.', true)
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async ({ databaseId, name, enabled, response, dbForProject, queueForEvents }: { databaseId: string, name: string, enabled: boolean, response: Response, dbForProject: Database, queueForEvents: Event }) => {

        const database = await dbForProject.getDocument('databases', databaseId);

        if (database.isEmpty()) {
            throw new Exception(Exception.DATABASE_NOT_FOUND);
        }

        const updatedDatabase = await dbForProject.updateDocument('databases', databaseId, database
            .setAttribute('name', name)
            .setAttribute('enabled', enabled)
            .setAttribute('search', [databaseId, name].join(' ')));

        queueForEvents.setParam('databaseId', updatedDatabase.getId());

        response.dynamic(updatedDatabase, Response.MODEL_DATABASE);
    });


App.delete('/v1/databases/:databaseId')
    .desc('Delete database')
    .groups(['api', 'database', 'schema'])
    .label('scope', 'databases.write')
    .label('event', 'databases.[databaseId].delete')
    .label('audits.event', 'database.delete')
    .label('audits.resource', 'database/{request.databaseId}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'delete')
    .label('sdk.description', '/docs/references/databases/delete.md')
    .label('sdk.response.code', Response.STATUS_CODE_NOCONTENT)
    .label('sdk.response.model', Response.MODEL_NONE)
    .param('databaseId', '', new UID(), 'Database ID.')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForDatabase')
    .inject('queueForEvents')
    .action(async ({ databaseId, response, dbForProject, queueForDatabase, queueForEvents }: { databaseId: string, response: Response, dbForProject: Database, queueForDatabase: EventDatabase, queueForEvents: Event }) => {

        const database = await dbForProject.getDocument('databases', databaseId);

        if (database.isEmpty()) {
            throw new Exception(Exception.DATABASE_NOT_FOUND);
        }

        if (!await dbForProject.deleteDocument('databases', databaseId)) {
            throw new Exception(Exception.GENERAL_SERVER_ERROR, 'Failed to remove collection from DB');
        }

        await dbForProject.purgeCachedDocument('databases', database.getId());
        await dbForProject.purgeCachedCollection('databases_' + database.getInternalId());

        queueForDatabase
            .setType(DATABASE_TYPE_DELETE_DATABASE)
            .setDatabase(database);

        queueForEvents
            .setParam('databaseId', database.getId())
            .setPayload(response.output(database, Response.MODEL_DATABASE));

        response.noContent();
    });


App.post('/v1/databases/:databaseId/collections')
    .desc('Create collection')
    .groups(['api', 'database'])
    .label('event', 'databases.[databaseId].collections.[collectionId].create')
    .label('scope', 'collections.write')
    .label('audits.event', 'collection.create')
    .label('audits.resource', 'database/{request.databaseId}/collection/{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'createCollection')
    .label('sdk.description', '/docs/references/databases/create-collection.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_COLLECTION)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new CustomId(), 'Unique Id. Choose a custom ID or generate a random ID with `ID.unique()`. Valid chars are a-z, A-Z, 0-9, period, hyphen, and underscore. Can\'t start with a special char. Max length is 36 chars.')
    .param('name', '', new Text(128), 'Collection name. Max length: 128 chars.')
    .param('permissions', null, new Permissions(APP_LIMIT_ARRAY_PARAMS_SIZE), 'An array of permissions strings. By default, no user is granted with any permissions. [Learn more about permissions](https://appconda.io/docs/permissions).', true)
    .param('documentSecurity', false, new Boolean(true), 'Enables configuring permissions for individual documents. A user needs one of document or collection level permissions to access a document. [Learn more about permissions](https://appconda.io/docs/permissions).', true)
    .param('enabled', true, new Boolean(), 'Is collection enabled? When set to \'disabled\', users cannot access the collection but Server SDKs with and API key can still read and write to the collection. No data is lost when this is toggled.', true)
    .inject('response')
    .inject('dbForProject')
    .inject('mode')
    .inject('queueForEvents')
    .action(async ({ databaseId, collectionId, name, permissions, documentSecurity, enabled, response, dbForProject, mode, queueForEvents }: { databaseId: string, collectionId: string, name: string, permissions: string[] | null, documentSecurity: boolean, enabled: boolean, response: Response, dbForProject: Database, mode: string, queueForEvents: Event }) => {

        const database = await Authorization.skip(() => dbForProject.getDocument('databases', databaseId));

        if (database.isEmpty()) {
            throw new Exception(Exception.DATABASE_NOT_FOUND);
        }

        collectionId = collectionId === 'unique()' ? ID.unique() : collectionId;

        // Map aggregate permissions into the multiple permissions they represent.
        permissions = Permission.aggregate(permissions);

        let collection: Document;
        try {
            await dbForProject.createDocument('database_' + database.getInternalId(), new Document({
                '$id': collectionId,
                'databaseInternalId': database.getInternalId(),
                'databaseId': databaseId,
                '$permissions': permissions ?? [],
                'documentSecurity': documentSecurity,
                'enabled': enabled,
                'name': name,
                'search': [collectionId, name].join(' '),
            }));
            const collection = await dbForProject.getDocument('database_' + database.getInternalId(), collectionId);

            await dbForProject.createCollection('database_' + database.getInternalId() + '_collection_' + collection.getInternalId(),
                [], [], permissions ?? [], documentSecurity);
        } catch (error) {
            if (error instanceof Duplicate) {
                throw new Exception(Exception.COLLECTION_ALREADY_EXISTS);
            }
            if (error instanceof LimitException) {
                throw new Exception(Exception.COLLECTION_LIMIT_EXCEEDED);
            }
            throw error;
        }

        queueForEvents
            .setContext('database', database)
            .setParam('databaseId', databaseId)
            .setParam('collectionId', collection.getId());

        response
            .setStatusCode(Response.STATUS_CODE_CREATED)
            .dynamic(collection, Response.MODEL_COLLECTION);
    });


App.get('/v1/databases/:databaseId/collections')
    .alias('/v1/database/collections')
    .desc('List collections')
    .groups(['api', 'database'])
    .label('scope', 'collections.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'listCollections')
    .label('sdk.description', '/docs/references/databases/list-collections.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_COLLECTION_LIST)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('queries', [], new Collections(), `Array of query strings generated using the Query class provided by the SDK. [Learn more about queries](https://appconda.io/docs/queries). Maximum of ${APP_LIMIT_ARRAY_PARAMS_SIZE} queries are allowed, each ${APP_LIMIT_ARRAY_ELEMENT_SIZE} characters long. You may filter on the following attributes: ${Collections.ALLOWED_ATTRIBUTES.join(', ')}`, true)
    .param('search', '', new Text(256), 'Search term to filter your list results. Max length: 256 chars.', true)
    .inject('response')
    .inject('dbForProject')
    .inject('mode')
    .action(async ({ databaseId, queries, search, response, dbForProject, mode }: { databaseId: string, queries: any[], search: string, response: Response, dbForProject: Database, mode: string }) => {

        const database = await Authorization.skip(() => dbForProject.getDocument('databases', databaseId));

        if (database.isEmpty()) {
            throw new Exception(Exception.DATABASE_NOT_FOUND);
        }

        try {
            queries = Query.parseQueries(queries);
        } catch (e) {
            if (e instanceof QueryException) {
                throw new Exception(Exception.GENERAL_QUERY_INVALID, e.message);
            }
            throw e;
        }

        if (search) {
            queries.push(Query.search('search', search));
        }

        // Get cursor document if there was a cursor query
        const cursor = queries.find(query => [Query.TYPE_CURSOR_AFTER, Query.TYPE_CURSOR_BEFORE].includes(query.getMethod()));
        if (cursor) {
            const collectionId = cursor.getValue();
            const cursorDocument = await dbForProject.getDocument('database_' + database.getInternalId(), collectionId);

            if (cursorDocument.isEmpty()) {
                throw new Exception(Exception.GENERAL_CURSOR_NOT_FOUND, `Collection '${collectionId}' for the 'cursor' value not found.`);
            }

            cursor.setValue(cursorDocument);
        }

        const filterQueries = Query.groupByType(queries)['filters'];

        response.dynamic(new Document({
            collections: await dbForProject.find('database_' + database.getInternalId(), queries),
            total: await dbForProject.count('database_' + database.getInternalId(), filterQueries, APP_LIMIT_COUNT),
        }), Response.MODEL_COLLECTION_LIST);
    });


App.get('/v1/databases/:databaseId/collections/:collectionId')
    //.alias('/v1/database/collections/:collectionId', { databaseId: 'default' })
    .desc('Get collection')
    .groups(['api', 'database'])
    .label('scope', 'collections.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'getCollection')
    .label('sdk.description', '/docs/references/databases/get-collection.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_COLLECTION)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID.')
    .inject('response')
    .inject('dbForProject')
    .inject('mode')
    .action(async ({ databaseId, collectionId, response, dbForProject, mode }: { databaseId: string, collectionId: string, response: Response, dbForProject: Database, mode: string }) => {

        const database = await Authorization.skip(async () => await dbForProject.getDocument('databases', databaseId));

        if (database.isEmpty()) {
            throw new Exception(Exception.DATABASE_NOT_FOUND);
        }

        const collection = await dbForProject.getDocument('database_' + database.getInternalId(), collectionId);

        if (collection.isEmpty()) {
            throw new Exception(Exception.COLLECTION_NOT_FOUND);
        }

        response.dynamic(collection, Response.MODEL_COLLECTION);
    });



App.get('/v1/databases/:databaseId/collections/:collectionId/logs')
    //.alias('/v1/database/collections/:collectionId/logs', { databaseId: 'default' })
    .desc('List collection logs')
    .groups(['api', 'database'])
    .label('scope', 'collections.read')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'listCollectionLogs')
    .label('sdk.description', '/docs/references/databases/get-collection-logs.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_LOG_LIST)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID.')
    .param('queries', [], new Queries([new Limit(), new Offset()]), 'Array of query strings generated using the Query class provided by the SDK. [Learn more about queries](https://appconda.io/docs/queries). Only supported methods are limit and offset', true)
    .inject('response')
    .inject('dbForProject')
    .inject('locale')
    .inject('geodb')
    .action(async ({ databaseId, collectionId, queries, response, dbForProject, locale, geodb }: { databaseId: string, collectionId: string, queries: any[], response: Response, dbForProject: Database, locale: Locale, geodb: any }) => {

        const database = await Authorization.skip(async () => await dbForProject.getDocument('databases', databaseId));

        if (database.isEmpty()) {
            throw new Exception(Exception.DATABASE_NOT_FOUND);
        }

        const collectionDocument = await dbForProject.getDocument('database_' + database.getInternalId(), collectionId);
        const collection = await dbForProject.getCollection('database_' + database.getInternalId() + '_collection_' + collectionDocument.getInternalId());

        if (collection.isEmpty()) {
            throw new Exception(Exception.COLLECTION_NOT_FOUND);
        }

        try {
            queries = Query.parseQueries(queries);
        } catch (e) {
            if (e instanceof QueryException) {
                throw new Exception(Exception.GENERAL_QUERY_INVALID, e.message);
            }
            throw e;
        }

        const grouped = Query.groupByType(queries);
        const limit = grouped['limit'] ?? APP_LIMIT_COUNT;
        const offset = grouped['offset'] ?? 0;

        const audit = new Audit(dbForProject);
        const resource = 'database/' + databaseId + '/collection/' + collectionId;
        const logs = await audit.getLogsByResource(resource, limit, offset);

        const output = [];

        for (const log of logs) {
            const userAgent = log['userAgent'] || 'UNKNOWN';

            const detector = new Detector(userAgent);
            detector.skipBotDetection();

            const os = detector.getOS();
            const client = detector.getClient();
            const device = detector.getDevice();

            const logDocument = new Document({
                event: log['event'],
                userId: log['data']['userId'],
                userEmail: log['data']['userEmail'] || null,
                userName: log['data']['userName'] || null,
                mode: log['data']['mode'] || null,
                ip: log['ip'],
                time: log['time'],
                osCode: os['osCode'],
                osName: os['osName'],
                osVersion: os['osVersion'],
                clientType: client['clientType'],
                clientCode: client['clientCode'],
                clientName: client['clientName'],
                clientVersion: client['clientVersion'],
                clientEngine: client['clientEngine'],
                clientEngineVersion: client['clientEngineVersion'],
                deviceName: device['deviceName'],
                deviceBrand: device['deviceBrand'],
                deviceModel: device['deviceModel']
            });

            const record = geodb.get(log['ip']);

            if (record) {
                logDocument.setAttribute('countryCode', locale.getText('countries.' + record['country']['iso_code'].toLowerCase(), false) ? record['country']['iso_code'].toLowerCase() : '--');
                logDocument.setAttribute('countryName', locale.getText('countries.' + record['country']['iso_code'].toLowerCase(), locale.getText('locale.country.unknown')));
            } else {
                logDocument.setAttribute('countryCode', '--');
                logDocument.setAttribute('countryName', locale.getText('locale.country.unknown'));
            }

            output.push(logDocument);
        }

        response.dynamic(new Document({
            total: await audit.countLogsByResource(resource),
            logs: output,
        }), Response.MODEL_LOG_LIST);
    });

App.put('/v1/databases/:databaseId/collections/:collectionId')
    //.alias('/v1/database/collections/:collectionId', { databaseId: 'default' })
    .desc('Update collection')
    .groups(['api', 'database', 'schema'])
    .label('scope', 'collections.write')
    .label('event', 'databases.[databaseId].collections.[collectionId].update')
    .label('audits.event', 'collection.update')
    .label('audits.resource', 'database/{request.databaseId}/collection/{request.collectionId}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'updateCollection')
    .label('sdk.description', '/docs/references/databases/update-collection.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_COLLECTION)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID.')
    .param('name', null, new Text(128), 'Collection name. Max length: 128 chars.')
    .param('permissions', null, new Permissions(APP_LIMIT_ARRAY_PARAMS_SIZE), 'An array of permission strings. By default, the current permissions are inherited. [Learn more about permissions](https://appconda.io/docs/permissions).', true)
    .param('documentSecurity', false, new Boolean(true), 'Enables configuring permissions for individual documents. A user needs one of document or collection level permissions to access a document. [Learn more about permissions](https://appconda.io/docs/permissions).', true)
    .param('enabled', true, new Boolean(), 'Is collection enabled? When set to \'disabled\', users cannot access the collection but Server SDKs with and API key can still read and write to the collection. No data is lost when this is toggled.', true)
    .inject('response')
    .inject('dbForProject')
    .inject('mode')
    .inject('queueForEvents')
    .action(async ({ databaseId, collectionId, name, permissions, documentSecurity, enabled, response, dbForProject, mode, queueForEvents }: { databaseId: string, collectionId: string, name: string, permissions: string[] | null, documentSecurity: boolean, enabled: boolean, response: Response, dbForProject: Database, mode: string, queueForEvents: Event }) => {

        const database = await Authorization.skip(() => dbForProject.getDocument('databases', databaseId));

        if (database.isEmpty()) {
            throw new Exception(Exception.DATABASE_NOT_FOUND);
        }

        let collection = await dbForProject.getDocument('database_' + database.getInternalId(), collectionId);

        if (collection.isEmpty()) {
            throw new Exception(Exception.COLLECTION_NOT_FOUND);
        }

        permissions = permissions ?? collection.getPermissions() ?? [];

        // Map aggregate permissions into the multiple permissions they represent.
        permissions = Permission.aggregate(permissions);

        enabled = enabled ?? collection.getAttribute('enabled', true);

        collection = await dbForProject.updateDocument('database_' + database.getInternalId(), collectionId, collection
            .setAttribute('name', name)
            .setAttribute('$permissions', permissions)
            .setAttribute('documentSecurity', documentSecurity)
            .setAttribute('enabled', enabled)
            .setAttribute('search', [collectionId, name].join(' ')));

        await dbForProject.updateCollection('database_' + database.getInternalId() + '_collection_' + collection.getInternalId(), permissions, documentSecurity);

        queueForEvents
            .setContext('database', database)
            .setParam('databaseId', databaseId)
            .setParam('collectionId', collection.getId());

        response.dynamic(collection, Response.MODEL_COLLECTION);
    });

App.delete('/v1/databases/:databaseId/collections/:collectionId')
    //.alias('/v1/database/collections/:collectionId', { databaseId: 'default' })
    .desc('Delete collection')
    .groups(['api', 'database', 'schema'])
    .label('scope', 'collections.write')
    .label('event', 'databases.[databaseId].collections.[collectionId].delete')
    .label('audits.event', 'collection.delete')
    .label('audits.resource', 'database/{request.databaseId}/collection/{request.collectionId}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'deleteCollection')
    .label('sdk.description', '/docs/references/databases/delete-collection.md')
    .label('sdk.response.code', Response.STATUS_CODE_NOCONTENT)
    .label('sdk.response.model', Response.MODEL_NONE)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID.')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForDatabase')
    .inject('queueForEvents')
    .inject('mode')
    .action(async ({ databaseId, collectionId, response, dbForProject, queueForDatabase, queueForEvents, mode }: { databaseId: string, collectionId: string, response: Response, dbForProject: Database, queueForDatabase: EventDatabase, queueForEvents: Event, mode: string }) => {

        const database = await Authorization.skip(() => dbForProject.getDocument('databases', databaseId));

        if (database.isEmpty()) {
            throw new Exception(Exception.DATABASE_NOT_FOUND);
        }

        const collection = await dbForProject.getDocument('database_' + database.getInternalId(), collectionId);

        if (collection.isEmpty()) {
            throw new Exception(Exception.COLLECTION_NOT_FOUND);
        }

        if (!await dbForProject.deleteDocument('database_' + database.getInternalId(), collectionId)) {
            throw new Exception(Exception.GENERAL_SERVER_ERROR, 'Failed to remove collection from DB');
        }

        dbForProject.purgeCachedCollection('database_' + database.getInternalId() + '_collection_' + collection.getInternalId());

        queueForDatabase
            .setType(DATABASE_TYPE_DELETE_COLLECTION)
            .setDatabase(database)
            .setCollection(collection);

        queueForEvents
            .setContext('database', database)
            .setParam('databaseId', databaseId)
            .setParam('collectionId', collection.getId())
            .setPayload(response.output(collection, Response.MODEL_COLLECTION));

        response.noContent();
    });

App.post('/v1/databases/:databaseId/collections/:collectionId/attributes/string')
    // .alias('/v1/database/collections/:collectionId/attributes/string', { databaseId: 'default' })
    .desc('Create string attribute')
    .groups(['api', 'database', 'schema'])
    .label('event', 'databases.[databaseId].collections.[collectionId].attributes.[attributeId].create')
    .label('scope', 'collections.write')
    .label('audits.event', 'attribute.create')
    .label('audits.resource', 'database/{request.databaseId}/collection/{request.collectionId}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'createStringAttribute')
    .label('sdk.description', '/docs/references/databases/create-string-attribute.md')
    .label('sdk.response.code', Response.STATUS_CODE_ACCEPTED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_ATTRIBUTE_STRING)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID. You can create a new collection using the Database service [server integration](https://appconda.io/docs/server/databases#databasesCreateCollection).')
    .param('key', '', new Key(), 'Attribute Key.')
    .param('size', null, new Range(1, APP_DATABASE_ATTRIBUTE_STRING_MAX_LENGTH, Range.TYPE_INTEGER), 'Attribute size for text attributes, in number of characters.')
    .param('required', null, new Boolean(), 'Is attribute required?')
    .param('default', null, new Text(0, 0), 'Default value for attribute when not provided. Cannot be set when attribute is required.', true)
    .param('array', false, new Boolean(), 'Is attribute an array?', true)
    .param('encrypt', false, new Boolean(), 'Toggle encryption for the attribute. Encryption enhances security by not storing any plain text values in the database. However, encrypted attributes cannot be queried.', true)
    .inject('response')
    .inject('dbForProject')
    .inject('queueForDatabase')
    .inject('queueForEvents')
    .action(async ({ databaseId, collectionId, key, size, required, defaultValue, array, encrypt, response, dbForProject, queueForDatabase, queueForEvents }: { databaseId: string, collectionId: string, key: string, size: number | null, required: boolean | null, defaultValue: string | null, array: boolean, encrypt: boolean, response: Response, dbForProject: Database, queueForDatabase: EventDatabase, queueForEvents: Event }) => {

        // Ensure attribute default is within required size
        const validator = new Text(size, 0);
        if (defaultValue !== null && !validator.isValid(defaultValue)) {
            throw new Exception(Exception.ATTRIBUTE_VALUE_INVALID, validator.getDescription());
        }

        const filters: string[] = [];

        if (encrypt) {
            filters.push('encrypt');
        }

        const attribute = await createAttribute(databaseId, collectionId, new Document({
            key: key,
            type: Database.VAR_STRING,
            size: size,
            required: required,
            default: defaultValue,
            array: array,
            filters: filters,
        }), response, dbForProject, queueForDatabase, queueForEvents);

        response
            .setStatusCode(Response.STATUS_CODE_ACCEPTED)
            .dynamic(attribute, Response.MODEL_ATTRIBUTE_STRING);
    });

App.post('/v1/databases/:databaseId/collections/:collectionId/attributes/email')
    //.alias('/v1/database/collections/:collectionId/attributes/email', { databaseId: 'default' })
    .desc('Create email attribute')
    .groups(['api', 'database', 'schema'])
    .label('event', 'databases.[databaseId].collections.[collectionId].attributes.[attributeId].create')
    .label('scope', 'collections.write')
    .label('audits.event', 'attribute.create')
    .label('audits.resource', 'database/{request.databaseId}/collection/{request.collectionId}')
    .label('sdk.namespace', 'databases')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.method', 'createEmailAttribute')
    .label('sdk.description', '/docs/references/databases/create-email-attribute.md')
    .label('sdk.response.code', Response.STATUS_CODE_ACCEPTED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_ATTRIBUTE_EMAIL)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID. You can create a new collection using the Database service [server integration](https://appconda.io/docs/server/databases#databasesCreateCollection).')
    .param('key', '', new Key(), 'Attribute Key.')
    .param('required', null, new Boolean(), 'Is attribute required?')
    .param('default', null, new Email(), 'Default value for attribute when not provided. Cannot be set when attribute is required.', true)
    .param('array', false, new Boolean(), 'Is attribute an array?', true)
    .inject('response')
    .inject('dbForProject')
    .inject('queueForDatabase')
    .inject('queueForEvents')
    .action(async ({ databaseId, collectionId, key, required, defaultValue, array, response, dbForProject, queueForDatabase, queueForEvents }: { databaseId: string, collectionId: string, key: string, required: boolean | null, defaultValue: string | null, array: boolean, response: Response, dbForProject: Database, queueForDatabase: EventDatabase, queueForEvents: Event }) => {

        const attribute = await createAttribute(databaseId, collectionId, new Document({
            key: key,
            type: Database.VAR_STRING,
            size: 254,
            required: required,
            default: defaultValue,
            array: array,
            format: APP_DATABASE_ATTRIBUTE_EMAIL,
        }), response, dbForProject, queueForDatabase, queueForEvents);

        response
            .setStatusCode(Response.STATUS_CODE_ACCEPTED)
            .dynamic(attribute, Response.MODEL_ATTRIBUTE_EMAIL);
    });

App.post('/v1/databases/:databaseId/collections/:collectionId/attributes/enum')
    //.alias('/v1/database/collections/:collectionId/attributes/enum', { databaseId: 'default' })
    .desc('Create enum attribute')
    .groups(['api', 'database', 'schema'])
    .label('event', 'databases.[databaseId].collections.[collectionId].attributes.[attributeId].create')
    .label('scope', 'collections.write')
    .label('audits.event', 'attribute.create')
    .label('audits.resource', 'database/{request.databaseId}/collection/{request.collectionId}')
    .label('sdk.namespace', 'databases')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.method', 'createEnumAttribute')
    .label('sdk.description', '/docs/references/databases/create-attribute-enum.md')
    .label('sdk.response.code', Response.STATUS_CODE_ACCEPTED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_ATTRIBUTE_ENUM)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID. You can create a new collection using the Database service [server integration](https://appconda.io/docs/server/databases#databasesCreateCollection).')
    .param('key', '', new Key(), 'Attribute Key.')
    .param('elements', [], new ArrayList(new Text(Database.LENGTH_KEY), APP_LIMIT_ARRAY_PARAMS_SIZE), `Array of elements in enumerated type. Uses length of longest element to determine size. Maximum of ${APP_LIMIT_ARRAY_PARAMS_SIZE} elements are allowed, each ${Database.LENGTH_KEY} characters long.`)
    .param('required', null, new Boolean(), 'Is attribute required?')
    .param('default', null, new Text(0), 'Default value for attribute when not provided. Cannot be set when attribute is required.', true)
    .param('array', false, new Boolean(), 'Is attribute an array?', true)
    .inject('response')
    .inject('dbForProject')
    .inject('queueForDatabase')
    .inject('queueForEvents')
    .action(async ({ databaseId, collectionId, key, elements, required, defaultValue, array, response, dbForProject, queueForDatabase, queueForEvents }: { databaseId: string, collectionId: string, key: string, elements: string[], required: boolean | null, defaultValue: string | null, array: boolean, response: Response, dbForProject: Database, queueForDatabase: EventDatabase, queueForEvents: Event }) => {
        if (defaultValue !== null && !elements.includes(defaultValue)) {
            throw new Exception(Exception.ATTRIBUTE_VALUE_INVALID, 'Default value not found in elements');
        }

        const attribute = await createAttribute(databaseId, collectionId, new Document({
            key: key,
            type: Database.VAR_STRING,
            size: Database.LENGTH_KEY,
            required: required,
            default: defaultValue,
            array: array,
            format: APP_DATABASE_ATTRIBUTE_ENUM,
            formatOptions: { elements: elements },
        }), response, dbForProject, queueForDatabase, queueForEvents);

        response
            .setStatusCode(Response.STATUS_CODE_ACCEPTED)
            .dynamic(attribute, Response.MODEL_ATTRIBUTE_ENUM);
    });


App.post('/v1/databases/:databaseId/collections/:collectionId/attributes/ip')
    //.alias('/v1/database/collections/:collectionId/attributes/ip', { databaseId: 'default' })
    .desc('Create IP address attribute')
    .groups(['api', 'database', 'schema'])
    .label('event', 'databases.[databaseId].collections.[collectionId].attributes.[attributeId].create')
    .label('scope', 'collections.write')
    .label('audits.event', 'attribute.create')
    .label('audits.resource', 'database/{request.databaseId}/collection/{request.collectionId}')
    .label('sdk.namespace', 'databases')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.method', 'createIpAttribute')
    .label('sdk.description', '/docs/references/databases/create-ip-attribute.md')
    .label('sdk.response.code', Response.STATUS_CODE_ACCEPTED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_ATTRIBUTE_IP)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID. You can create a new collection using the Database service [server integration](https://appconda.io/docs/server/databases#databasesCreateCollection).')
    .param('key', '', new Key(), 'Attribute Key.')
    .param('required', null, new Boolean(), 'Is attribute required?')
    .param('default', null, new IP(), 'Default value for attribute when not provided. Cannot be set when attribute is required.', true)
    .param('array', false, new Boolean(), 'Is attribute an array?', true)
    .inject('response')
    .inject('dbForProject')
    .inject('queueForDatabase')
    .inject('queueForEvents')
    .action(async (databaseId: string, collectionId: string, key: string, required: boolean | null, defaultValue: string | null, array: boolean, response: Response, dbForProject: Database, queueForDatabase: EventDatabase, queueForEvents: Event) => {

        const attribute = await createAttribute(databaseId, collectionId, new Document({
            key: key,
            type: Database.VAR_STRING,
            size: 39,
            required: required,
            default: defaultValue,
            array: array,
            format: APP_DATABASE_ATTRIBUTE_IP,
        }), response, dbForProject, queueForDatabase, queueForEvents);

        response
            .setStatusCode(Response.STATUS_CODE_ACCEPTED)
            .dynamic(attribute, Response.MODEL_ATTRIBUTE_IP);
    });

App.post('/v1/databases/:databaseId/collections/:collectionId/attributes/url')
    //.alias('/v1/database/collections/:collectionId/attributes/url', { databaseId: 'default' })
    .desc('Create URL attribute')
    .groups(['api', 'database', 'schema'])
    .label('event', 'databases.[databaseId].collections.[collectionId].attributes.[attributeId].create')
    .label('scope', 'collections.write')
    .label('audits.event', 'attribute.create')
    .label('audits.resource', 'database/{request.databaseId}/collection/{request.collectionId}')
    .label('sdk.namespace', 'databases')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.method', 'createUrlAttribute')
    .label('sdk.description', '/docs/references/databases/create-url-attribute.md')
    .label('sdk.response.code', Response.STATUS_CODE_ACCEPTED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_ATTRIBUTE_URL)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID. You can create a new collection using the Database service [server integration](https://appconda.io/docs/server/databases#databasesCreateCollection).')
    .param('key', '', new Key(), 'Attribute Key.')
    .param('required', null, new Boolean(), 'Is attribute required?')
    .param('default', null, new URLValidator(), 'Default value for attribute when not provided. Cannot be set when attribute is required.', true)
    .param('array', false, new Boolean(), 'Is attribute an array?', true)
    .inject('response')
    .inject('dbForProject')
    .inject('queueForDatabase')
    .inject('queueForEvents')
    .action(async ({ databaseId, collectionId, key, required, defaultValue, array, response, dbForProject, queueForDatabase, queueForEvents }: { databaseId: string, collectionId: string, key: string, required: boolean | null, defaultValue: string | null, array: boolean, response: Response, dbForProject: Database, queueForDatabase: EventDatabase, queueForEvents: Event }) => {

        const attribute = await createAttribute(databaseId, collectionId, new Document({
            key: key,
            type: Database.VAR_STRING,
            size: 2000,
            required: required,
            default: defaultValue,
            array: array,
            format: APP_DATABASE_ATTRIBUTE_URL,
        }), response, dbForProject, queueForDatabase, queueForEvents);

        response
            .setStatusCode(Response.STATUS_CODE_ACCEPTED)
            .dynamic(attribute, Response.MODEL_ATTRIBUTE_URL);
    });

App.post('/v1/databases/:databaseId/collections/:collectionId/attributes/integer')
    //.alias('/v1/database/collections/:collectionId/attributes/integer', { databaseId: 'default' })
    .desc('Create integer attribute')
    .groups(['api', 'database', 'schema'])
    .label('event', 'databases.[databaseId].collections.[collectionId].attributes.[attributeId].create')
    .label('scope', 'collections.write')
    .label('audits.event', 'attribute.create')
    .label('audits.resource', 'database/{request.databaseId}/collection/{request.collectionId}')
    .label('sdk.namespace', 'databases')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.method', 'createIntegerAttribute')
    .label('sdk.description', '/docs/references/databases/create-integer-attribute.md')
    .label('sdk.response.code', Response.STATUS_CODE_ACCEPTED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_ATTRIBUTE_INTEGER)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID. You can create a new collection using the Database service [server integration](https://appconda.io/docs/server/databases#databasesCreateCollection).')
    .param('key', '', new Key(), 'Attribute Key.')
    .param('required', null, new Boolean(), 'Is attribute required?')
    .param('min', null, new Integer(), 'Minimum value to enforce on new documents', true)
    .param('max', null, new Integer(), 'Maximum value to enforce on new documents', true)
    .param('default', null, new Integer(), 'Default value for attribute when not provided. Cannot be set when attribute is required.', true)
    .param('array', false, new Boolean(), 'Is attribute an array?', true)
    .inject('response')
    .inject('dbForProject')
    .inject('queueForDatabase')
    .inject('queueForEvents')
    .action(async ({ databaseId, collectionId, key, required, min, max, defaultValue, array, response, dbForProject, queueForDatabase, queueForEvents }: { databaseId: string, collectionId: string, key: string, required: boolean | null, min: number | null, max: number | null, defaultValue: number | null, array: boolean, response: Response, dbForProject: Database, queueForDatabase: EventDatabase, queueForEvents: Event }) => {

        // Ensure attribute default is within range
        min = (min === null) ? Number.MIN_SAFE_INTEGER : min;
        max = (max === null) ? Number.MAX_SAFE_INTEGER : max;

        if (min > max) {
            throw new Exception(Exception.ATTRIBUTE_VALUE_INVALID, 'Minimum value must be lesser than maximum value');
        }

        const validator = new Range(min, max, Database.VAR_INTEGER);

        if (defaultValue !== null && !validator.isValid(defaultValue)) {
            throw new Exception(Exception.ATTRIBUTE_VALUE_INVALID, validator.getDescription());
        }

        const size = max > 2147483647 ? 8 : 4; // Automatically create BigInt depending on max value

        const attribute = await createAttribute(databaseId, collectionId, new Document({
            key: key,
            type: Database.VAR_INTEGER,
            size: size,
            required: required,
            default: defaultValue,
            array: array,
            format: APP_DATABASE_ATTRIBUTE_INT_RANGE,
            formatOptions: {
                min: min,
                max: max,
            },
        }), response, dbForProject, queueForDatabase, queueForEvents);

        const formatOptions = attribute.getAttribute('formatOptions', {});

        if (Object.keys(formatOptions).length > 0) {
            attribute.setAttribute('min', formatOptions['min']);
            attribute.setAttribute('max', formatOptions['max']);
        }

        response
            .setStatusCode(Response.STATUS_CODE_ACCEPTED)
            .dynamic(attribute, Response.MODEL_ATTRIBUTE_INTEGER);
    });

App.post('/v1/databases/:databaseId/collections/:collectionId/attributes/float')
    //.alias('/v1/database/collections/:collectionId/attributes/float', { databaseId: 'default' })
    .desc('Create float attribute')
    .groups(['api', 'database', 'schema'])
    .label('event', 'databases.[databaseId].collections.[collectionId].attributes.[attributeId].create')
    .label('scope', 'collections.write')
    .label('audits.event', 'attribute.create')
    .label('audits.resource', 'database/{request.databaseId}/collection/{request.collectionId}')
    .label('sdk.namespace', 'databases')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.method', 'createFloatAttribute')
    .label('sdk.description', '/docs/references/databases/create-float-attribute.md')
    .label('sdk.response.code', Response.STATUS_CODE_ACCEPTED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_ATTRIBUTE_FLOAT)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID. You can create a new collection using the Database service [server integration](https://appconda.io/docs/server/databases#databasesCreateCollection).')
    .param('key', '', new Key(), 'Attribute Key.')
    .param('required', null, new Boolean(), 'Is attribute required?')
    .param('min', null, new FloatValidator(), 'Minimum value to enforce on new documents', true)
    .param('max', null, new FloatValidator(), 'Maximum value to enforce on new documents', true)
    .param('default', null, new FloatValidator(), 'Default value for attribute when not provided. Cannot be set when attribute is required.', true)
    .param('array', false, new Boolean(), 'Is attribute an array?', true)
    .inject('response')
    .inject('dbForProject')
    .inject('queueForDatabase')
    .inject('queueForEvents')
    .action(async ({ databaseId, collectionId, key, required, min, max, defaultValue, array, response, dbForProject, queueForDatabase, queueForEvents }: { databaseId: string, collectionId: string, key: string, required: boolean | null, min: number | null, max: number | null, defaultValue: number | null, array: boolean, response: Response, dbForProject: Database, queueForDatabase: EventDatabase, queueForEvents: Event }) => {

        // Ensure attribute default is within range
        min = (min === null) ? -Number.MAX_VALUE : min;
        max = (max === null) ? Number.MAX_VALUE : max;

        if (min > max) {
            throw new Exception(Exception.ATTRIBUTE_VALUE_INVALID, 'Minimum value must be lesser than maximum value');
        }

        // Ensure default value is a float
        if (defaultValue !== null) {
            defaultValue = parseFloat(defaultValue.toString());
        }

        const validator = new Range(min, max, Database.VAR_FLOAT);

        if (defaultValue !== null && !validator.isValid(defaultValue)) {
            throw new Exception(Exception.ATTRIBUTE_VALUE_INVALID, validator.getDescription());
        }

        const attribute = await createAttribute(databaseId, collectionId, new Document({
            key: key,
            type: Database.VAR_FLOAT,
            required: required,
            size: 0,
            default: defaultValue,
            array: array,
            format: APP_DATABASE_ATTRIBUTE_FLOAT_RANGE,
            formatOptions: {
                min: min,
                max: max,
            },
        }), response, dbForProject, queueForDatabase, queueForEvents);

        const formatOptions = attribute.getAttribute('formatOptions', {});

        if (Object.keys(formatOptions).length > 0) {
            attribute.setAttribute('min', parseFloat(formatOptions['min']));
            attribute.setAttribute('max', parseFloat(formatOptions['max']));
        }

        response
            .setStatusCode(Response.STATUS_CODE_ACCEPTED)
            .dynamic(attribute, Response.MODEL_ATTRIBUTE_FLOAT);
    });

App.post('/v1/databases/:databaseId/collections/:collectionId/attributes/boolean')
    //.alias('/v1/database/collections/:collectionId/attributes/boolean', { databaseId: 'default' })
    .desc('Create boolean attribute')
    .groups(['api', 'database', 'schema'])
    .label('event', 'databases.[databaseId].collections.[collectionId].attributes.[attributeId].create')
    .label('scope', 'collections.write')
    .label('audits.event', 'attribute.create')
    .label('audits.resource', 'database/{request.databaseId}/collection/{request.collectionId}')
    .label('sdk.namespace', 'databases')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.method', 'createBooleanAttribute')
    .label('sdk.description', '/docs/references/databases/create-boolean-attribute.md')
    .label('sdk.response.code', Response.STATUS_CODE_ACCEPTED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_ATTRIBUTE_BOOLEAN)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID. You can create a new collection using the Database service [server integration](https://appconda.io/docs/server/databases#databasesCreateCollection).')
    .param('key', '', new Key(), 'Attribute Key.')
    .param('required', null, new Boolean(), 'Is attribute required?')
    .param('default', null, new Boolean(), 'Default value for attribute when not provided. Cannot be set when attribute is required.', true)
    .param('array', false, new Boolean(), 'Is attribute an array?', true)
    .inject('response')
    .inject('dbForProject')
    .inject('queueForDatabase')
    .inject('queueForEvents')
    .action(async ({ databaseId, collectionId, key, required, defaultValue, array, response, dbForProject, queueForDatabase, queueForEvents }: { databaseId: string, collectionId: string, key: string, required: boolean | null, defaultValue: boolean | null, array: boolean, response: Response, dbForProject: Database, queueForDatabase: EventDatabase, queueForEvents: Event }) => {

        const attribute = await createAttribute(databaseId, collectionId, new Document({
            key: key,
            type: Database.VAR_BOOLEAN,
            size: 0,
            required: required,
            default: defaultValue,
            array: array,
        }), response, dbForProject, queueForDatabase, queueForEvents);

        response
            .setStatusCode(Response.STATUS_CODE_ACCEPTED)
            .dynamic(attribute, Response.MODEL_ATTRIBUTE_BOOLEAN);
    });

App.post('/v1/databases/:databaseId/collections/:collectionId/attributes/datetime')
    //.alias('/v1/database/collections/:collectionId/attributes/datetime', { databaseId: 'default' })
    .desc('Create datetime attribute')
    .groups(['api', 'database'])
    .label('event', 'databases.[databaseId].collections.[collectionId].attributes.[attributeId].create')
    .label('scope', 'collections.write')
    .label('audits.event', 'attribute.create')
    .label('audits.resource', 'database/{request.databaseId}/collection/{request.collectionId}')
    .label('sdk.namespace', 'databases')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.method', 'createDatetimeAttribute')
    .label('sdk.description', '/docs/references/databases/create-datetime-attribute.md')
    .label('sdk.response.code', Response.STATUS_CODE_ACCEPTED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_ATTRIBUTE_DATETIME)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID. You can create a new collection using the Database service [server integration](https://appconda.io/docs/server/databases#databasesCreateCollection).')
    .param('key', '', new Key(), 'Attribute Key.')
    .param('required', null, new Boolean(), 'Is attribute required?')
    .param('default', null, new Datetime(), 'Default value for the attribute in [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format. Cannot be set when attribute is required.', true)
    .param('array', false, new Boolean(), 'Is attribute an array?', true)
    .inject('response')
    .inject('dbForProject')
    .inject('queueForDatabase')
    .inject('queueForEvents')
    .action(async (databaseId: string, collectionId: string, key: string, required: boolean | null, defaultValue: string | null, array: boolean, response: Response, dbForProject: Database, queueForDatabase: EventDatabase, queueForEvents: Event) => {

        const filters: string[] = ['datetime'];

        const attribute = await createAttribute(databaseId, collectionId, new Document({
            key: key,
            type: Database.VAR_DATETIME,
            size: 0,
            required: required,
            default: defaultValue,
            array: array,
            filters: filters,
        }), response, dbForProject, queueForDatabase, queueForEvents);

        response
            .setStatusCode(Response.STATUS_CODE_ACCEPTED)
            .dynamic(attribute, Response.MODEL_ATTRIBUTE_DATETIME);
    });

App.post('/v1/databases/:databaseId/collections/:collectionId/attributes/relationship')
    //.alias('/v1/database/collections/:collectionId/attributes/relationship', { databaseId: 'default' })
    .desc('Create relationship attribute')
    .groups(['api', 'database'])
    .label('event', 'databases.[databaseId].collections.[collectionId].attributes.[attributeId].create')
    .label('scope', 'collections.write')
    .label('audits.event', 'attribute.create')
    .label('audits.resource', 'database/{request.databaseId}/collection/{request.collectionId}')
    .label('sdk.namespace', 'databases')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.method', 'createRelationshipAttribute')
    .label('sdk.description', '/docs/references/databases/create-relationship-attribute.md')
    .label('sdk.response.code', Response.STATUS_CODE_ACCEPTED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_ATTRIBUTE_RELATIONSHIP)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID. You can create a new collection using the Database service [server integration](https://appconda.io/docs/server/databases#databasesCreateCollection).')
    .param('relatedCollectionId', '', new UID(), 'Related Collection ID. You can create a new collection using the Database service [server integration](https://appconda.io/docs/server/databases#databasesCreateCollection).')
    .param('type', '', new WhiteList([Database.RELATION_ONE_TO_ONE, Database.RELATION_MANY_TO_ONE, Database.RELATION_MANY_TO_MANY, Database.RELATION_ONE_TO_MANY], true), 'Relation type')
    .param('twoWay', false, new Boolean(), 'Is Two Way?', true)
    .param('key', null, new Key(), 'Attribute Key.', true)
    .param('twoWayKey', null, new Key(), 'Two Way Attribute Key.', true)
    .param('onDelete', Database.RELATION_MUTATE_RESTRICT, new WhiteList([Database.RELATION_MUTATE_CASCADE, Database.RELATION_MUTATE_RESTRICT, Database.RELATION_MUTATE_SET_NULL], true), 'Constraints option', true)
    .inject('response')
    .inject('dbForProject')
    .inject('queueForDatabase')
    .inject('queueForEvents')
    .action(async ({ databaseId, collectionId, relatedCollectionId, type, twoWay, key, twoWayKey, onDelete, response, dbForProject, queueForDatabase, queueForEvents }: { databaseId: string, collectionId: string, relatedCollectionId: string, type: string, twoWay: boolean, key: string | null, twoWayKey: string | null, onDelete: string, response: Response, dbForProject: Database, queueForDatabase: EventDatabase, queueForEvents: Event }) => {
        key = key ?? relatedCollectionId;
        twoWayKey = twoWayKey ?? collectionId;

        const database = await Authorization.skip(() => dbForProject.getDocument('databases', databaseId));

        if (database.isEmpty()) {
            throw new Exception(Exception.DATABASE_NOT_FOUND);
        }

        const collection = await dbForProject.getDocument(`database_${database.getInternalId()}`, collectionId);
        const collectionData = await dbForProject.getCollection(`database_${database.getInternalId()}_collection_${collection.getInternalId()}`);

        if (collectionData.isEmpty()) {
            throw new Exception(Exception.COLLECTION_NOT_FOUND);
        }

        const relatedCollectionDocument = await dbForProject.getDocument(`database_${database.getInternalId()}`, relatedCollectionId);
        const relatedCollection = await dbForProject.getCollection(`database_${database.getInternalId()}_collection_${relatedCollectionDocument.getInternalId()}`);

        if (relatedCollection.isEmpty()) {
            throw new Exception(Exception.COLLECTION_NOT_FOUND);
        }

        const attributes = collectionData.getAttribute('attributes', []);
        for (const attribute of attributes) {
            if (attribute.getAttribute('type') !== Database.VAR_RELATIONSHIP) {
                continue;
            }

            if (attribute.getId().toLowerCase() === key.toLowerCase()) {
                throw new Exception(Exception.ATTRIBUTE_ALREADY_EXISTS);
            }

            if (
                attribute.getAttribute('options')['twoWayKey'].toLowerCase() === twoWayKey.toLowerCase() &&
                attribute.getAttribute('options')['relatedCollection'] === relatedCollection.getId()
            ) {
                throw new Exception(Exception.ATTRIBUTE_ALREADY_EXISTS, 'Attribute with the requested key already exists. Attribute keys must be unique, try again with a different key.');
            }

            if (
                type === Database.RELATION_MANY_TO_MANY &&
                attribute.getAttribute('options')['relationType'] === Database.RELATION_MANY_TO_MANY &&
                attribute.getAttribute('options')['relatedCollection'] === relatedCollection.getId()
            ) {
                throw new Exception(Exception.ATTRIBUTE_ALREADY_EXISTS, 'Creating more than one "manyToMany" relationship on the same collection is currently not permitted.');
            }
        }

        const attribute = await createAttribute(
            databaseId,
            collectionId,
            new Document({
                key: key,
                type: Database.VAR_RELATIONSHIP,
                size: 0,
                required: false,
                default: null,
                array: false,
                filters: [],
                options: {
                    relatedCollection: relatedCollectionId,
                    relationType: type,
                    twoWay: twoWay,
                    twoWayKey: twoWayKey,
                    onDelete: onDelete,
                }
            }),
            response,
            dbForProject,
            queueForDatabase,
            queueForEvents
        );

        const options = attribute.getAttribute('options', {});

        for (const [key, option] of Object.entries(options)) {
            attribute.setAttribute(key, option);
        }

        response
            .setStatusCode(Response.STATUS_CODE_ACCEPTED)
            .dynamic(attribute, Response.MODEL_ATTRIBUTE_RELATIONSHIP);
    });

App.get('/v1/databases/:databaseId/collections/:collectionId/attributes')
    //.alias('/v1/database/collections/:collectionId/attributes', { databaseId: 'default' })
    .desc('List attributes')
    .groups(['api', 'database'])
    .label('scope', 'collections.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'listAttributes')
    .label('sdk.description', '/docs/references/databases/list-attributes.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_ATTRIBUTE_LIST)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID. You can create a new collection using the Database service [server integration](https://appconda.io/docs/server/databases#databasesCreateCollection).')
    .param('queries', [], new Attributes(), `Array of query strings generated using the Query class provided by the SDK. [Learn more about queries](https://appconda.io/docs/queries). Maximum of ${APP_LIMIT_ARRAY_PARAMS_SIZE} queries are allowed, each ${APP_LIMIT_ARRAY_ELEMENT_SIZE} characters long. You may filter on the following attributes: ${Attributes.ALLOWED_ATTRIBUTES.join(', ')}`, true)
    .inject('response')
    .inject('dbForProject')
    .action(async ({ databaseId, collectionId, queries, response, dbForProject }: { databaseId: string, collectionId: string, queries: any[], response: Response, dbForProject: Database }) => {
        const database = await Authorization.skip(() => dbForProject.getDocument('databases', databaseId));

        if (database.isEmpty()) {
            throw new Exception(Exception.DATABASE_NOT_FOUND);
        }

        const collection = await dbForProject.getDocument(`database_${database.getInternalId()}`, collectionId);

        if (collection.isEmpty()) {
            throw new Exception(Exception.COLLECTION_NOT_FOUND);
        }

        try {
            queries = Query.parseQueries(queries);
        } catch (e) {
            if (e instanceof QueryException) {
                throw new Exception(Exception.GENERAL_QUERY_INVALID, e.message);
            }
            throw e;
        }

        queries.push(
            Query.equal('collectionInternalId', [collection.getInternalId()]),
            Query.equal('databaseInternalId', [database.getInternalId()])
        );

        const cursor = queries.find(query => [Query.TYPE_CURSOR_AFTER, Query.TYPE_CURSOR_BEFORE].includes(query.getMethod()));

        if (cursor) {
            const attributeId = cursor.getValue();
            const cursorDocument = await Authorization.skip(() => dbForProject.find('attributes', [
                Query.equal('collectionInternalId', [collection.getInternalId()]),
                Query.equal('databaseInternalId', [database.getInternalId()]),
                Query.equal('key', [attributeId]),
                Query.limit(1),
            ]));

            if (!cursorDocument || cursorDocument[0].isEmpty()) {
                throw new Exception(Exception.GENERAL_CURSOR_NOT_FOUND, `Attribute '${attributeId}' for the 'cursor' value not found.`);
            }

            cursor.setValue(cursorDocument[0]);
        }

        const filters = Query.groupByType(queries)['filters'];

        const attributes = await dbForProject.find('attributes', queries);
        const total = await dbForProject.count('attributes', filters, APP_LIMIT_COUNT);

        response.dynamic(new Document({
            attributes: attributes,
            total: total,
        }), Response.MODEL_ATTRIBUTE_LIST);
    });

App.get('/v1/databases/:databaseId/collections/:collectionId/attributes/:key')
    //.alias('/v1/database/collections/:collectionId/attributes/:key', { databaseId: 'default' })
    .desc('Get attribute')
    .groups(['api', 'database'])
    .label('scope', 'collections.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'getAttribute')
    .label('sdk.description', '/docs/references/databases/get-attribute.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', [
        Response.MODEL_ATTRIBUTE_BOOLEAN,
        Response.MODEL_ATTRIBUTE_INTEGER,
        Response.MODEL_ATTRIBUTE_FLOAT,
        Response.MODEL_ATTRIBUTE_EMAIL,
        Response.MODEL_ATTRIBUTE_ENUM,
        Response.MODEL_ATTRIBUTE_URL,
        Response.MODEL_ATTRIBUTE_IP,
        Response.MODEL_ATTRIBUTE_DATETIME,
        Response.MODEL_ATTRIBUTE_RELATIONSHIP,
        Response.MODEL_ATTRIBUTE_STRING
    ])
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID. You can create a new collection using the Database service [server integration](https://appconda.io/docs/server/databases#databasesCreateCollection).')
    .param('key', '', new Key(), 'Attribute Key.')
    .inject('response')
    .inject('dbForProject')
    .action(async ({ databaseId, collectionId, key, response, dbForProject }: { databaseId: string, collectionId: string, key: string, response: Response, dbForProject: Database }) => {

        const database = await Authorization.skip(() => dbForProject.getDocument('databases', databaseId));

        if (database.isEmpty()) {
            throw new Exception(Exception.DATABASE_NOT_FOUND);
        }

        const collection = await dbForProject.getDocument(`database_${database.getInternalId()}`, collectionId);

        if (collection.isEmpty()) {
            throw new Exception(Exception.COLLECTION_NOT_FOUND);
        }

        const attribute = await dbForProject.getDocument('attributes', `${database.getInternalId()}_${collection.getInternalId()}_${key}`);

        if (attribute.isEmpty()) {
            throw new Exception(Exception.ATTRIBUTE_NOT_FOUND);
        }

        // Select response model based on type and format
        const type = attribute.getAttribute('type');
        const format = attribute.getAttribute('format');
        const options = attribute.getAttribute('options', {});

        for (const [key, option] of Object.entries(options)) {
            attribute.setAttribute(key, option);
        }

        const model = (() => {
            switch (type) {
                case Database.VAR_BOOLEAN:
                    return Response.MODEL_ATTRIBUTE_BOOLEAN;
                case Database.VAR_INTEGER:
                    return Response.MODEL_ATTRIBUTE_INTEGER;
                case Database.VAR_FLOAT:
                    return Response.MODEL_ATTRIBUTE_FLOAT;
                case Database.VAR_DATETIME:
                    return Response.MODEL_ATTRIBUTE_DATETIME;
                case Database.VAR_RELATIONSHIP:
                    return Response.MODEL_ATTRIBUTE_RELATIONSHIP;
                case Database.VAR_STRING:
                    switch (format) {
                        case APP_DATABASE_ATTRIBUTE_EMAIL:
                            return Response.MODEL_ATTRIBUTE_EMAIL;
                        case APP_DATABASE_ATTRIBUTE_ENUM:
                            return Response.MODEL_ATTRIBUTE_ENUM;
                        case APP_DATABASE_ATTRIBUTE_IP:
                            return Response.MODEL_ATTRIBUTE_IP;
                        case APP_DATABASE_ATTRIBUTE_URL:
                            return Response.MODEL_ATTRIBUTE_URL;
                        default:
                            return Response.MODEL_ATTRIBUTE_STRING;
                    }
                default:
                    return Response.MODEL_ATTRIBUTE;
            }
        })();

        response.dynamic(attribute, model);
    });

App.patch('/v1/databases/:databaseId/collections/:collectionId/attributes/string/:key')
    .desc('Update string attribute')
    .groups(['api', 'database', 'schema'])
    .label('scope', 'collections.write')
    .label('event', 'databases.[databaseId].collections.[collectionId].attributes.[attributeId].update')
    .label('audits.event', 'attribute.update')
    .label('audits.resource', 'database/{request.databaseId}/collection/{request.collectionId}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'updateStringAttribute')
    .label('sdk.description', '/docs/references/databases/update-string-attribute.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.model', Response.MODEL_ATTRIBUTE_STRING)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID. You can create a new collection using the Database service [server integration](https://appconda.io/docs/server/databases#databasesCreateCollection).')
    .param('key', '', new Key(), 'Attribute Key.')
    .param('required', null, new Boolean(), 'Is attribute required?')
    .param('default', null, new Nullable(new Text(0, 0)), 'Default value for attribute when not provided. Cannot be set when attribute is required.')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async ({ databaseId, collectionId, key, required, defaultValue, response, dbForProject, queueForEvents }: { databaseId: string, collectionId: string, key: string, required: boolean | null, defaultValue: string | null, response: Response, dbForProject: Database, queueForEvents: Event }) => {

        const attribute = await updateAttribute({
            databaseId: databaseId,
            collectionId: collectionId,
            key: key,
            dbForProject: dbForProject,
            queueForEvents: queueForEvents,
            type: Database.VAR_STRING,
            defaultValue: defaultValue,
            required: required
        });

        response
            .setStatusCode(Response.STATUS_CODE_OK)
            .dynamic(attribute, Response.MODEL_ATTRIBUTE_STRING);
    });

App.patch('/v1/databases/:databaseId/collections/:collectionId/attributes/enum/:key')
    .desc('Update enum attribute')
    .groups(['api', 'database', 'schema'])
    .label('scope', 'collections.write')
    .label('event', 'databases.[databaseId].collections.[collectionId].attributes.[attributeId].update')
    .label('audits.event', 'attribute.update')
    .label('audits.resource', 'database/{request.databaseId}/collection/{request.collectionId}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'updateEnumAttribute')
    .label('sdk.description', '/docs/references/databases/update-enum-attribute.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.model', Response.MODEL_ATTRIBUTE_ENUM)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID. You can create a new collection using the Database service [server integration](https://appconda.io/docs/server/databases#databasesCreateCollection).')
    .param('key', '', new Key(), 'Attribute Key.')
    .param('elements', null, new ArrayList(new Text(Database.LENGTH_KEY), APP_LIMIT_ARRAY_PARAMS_SIZE), `Array of elements in enumerated type. Uses length of longest element to determine size. Maximum of ${APP_LIMIT_ARRAY_PARAMS_SIZE} elements are allowed, each ${Database.LENGTH_KEY} characters long.`)
    .param('required', null, new Boolean(), 'Is attribute required?')
    .param('default', null, new Nullable(new Text(0)), 'Default value for attribute when not provided. Cannot be set when attribute is required.')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async ({ databaseId, collectionId, key, elements, required, defaultValue, response, dbForProject, queueForEvents }: { databaseId: string, collectionId: string, key: string, elements: string[] | null, required: boolean | null, defaultValue: string | null, response: Response, dbForProject: Database, queueForEvents: Event }) => {
        const attribute = await updateAttribute({
            databaseId: databaseId,
            collectionId: collectionId,
            key: key,
            dbForProject: dbForProject,
            queueForEvents: queueForEvents,
            type: Database.VAR_STRING,
            filter: APP_DATABASE_ATTRIBUTE_ENUM,
            defaultValue: defaultValue,
            required: required,
            elements: elements
        });

        response
            .setStatusCode(Response.STATUS_CODE_OK)
            .dynamic(attribute, Response.MODEL_ATTRIBUTE_ENUM);
    });

App.patch('/v1/databases/:databaseId/collections/:collectionId/attributes/url/:key')
    .desc('Update URL attribute')
    .groups(['api', 'database', 'schema'])
    .label('scope', 'collections.write')
    .label('event', 'databases.[databaseId].collections.[collectionId].attributes.[attributeId].update')
    .label('audits.event', 'attribute.update')
    .label('audits.resource', 'database/{request.databaseId}/collection/{request.collectionId}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'updateUrlAttribute')
    .label('sdk.description', '/docs/references/databases/update-url-attribute.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.model', Response.MODEL_ATTRIBUTE_URL)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID. You can create a new collection using the Database service [server integration](https://appconda.io/docs/server/databases#databasesCreateCollection).')
    .param('key', '', new Key(), 'Attribute Key.')
    .param('required', null, new Boolean(), 'Is attribute required?')
    .param('default', null, new Nullable(new URLValidator()), 'Default value for attribute when not provided. Cannot be set when attribute is required.')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async ({ databaseId, collectionId, key, required, defaultValue, response, dbForProject, queueForEvents }: { databaseId: string, collectionId: string, key: string, required: boolean | null, defaultValue: string | null, response: Response, dbForProject: Database, queueForEvents: Event }) => {
        const attribute = await updateAttribute({
            databaseId: databaseId,
            collectionId: collectionId,
            key: key,
            dbForProject: dbForProject,
            queueForEvents: queueForEvents,
            type: Database.VAR_STRING,
            filter: APP_DATABASE_ATTRIBUTE_URL,
            defaultValue: defaultValue,
            required: required
        });

        response
            .setStatusCode(Response.STATUS_CODE_OK)
            .dynamic(attribute, Response.MODEL_ATTRIBUTE_URL);
    });

App.patch('/v1/databases/:databaseId/collections/:collectionId/attributes/integer/:key')
    .desc('Update integer attribute')
    .groups(['api', 'database', 'schema'])
    .label('scope', 'collections.write')
    .label('event', 'databases.[databaseId].collections.[collectionId].attributes.[attributeId].update')
    .label('audits.event', 'attribute.update')
    .label('audits.resource', 'database/{request.databaseId}/collection/{request.collectionId}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'updateIntegerAttribute')
    .label('sdk.description', '/docs/references/databases/update-integer-attribute.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.model', Response.MODEL_ATTRIBUTE_INTEGER)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID. You can create a new collection using the Database service [server integration](https://appconda.io/docs/server/databases#databasesCreateCollection).')
    .param('key', '', new Key(), 'Attribute Key.')
    .param('required', null, new Boolean(), 'Is attribute required?')
    .param('min', null, new Integer(), 'Minimum value to enforce on new documents')
    .param('max', null, new Integer(), 'Maximum value to enforce on new documents')
    .param('default', null, new Nullable(new Integer()), 'Default value for attribute when not provided. Cannot be set when attribute is required.')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async ({ databaseId, collectionId, key, required, min, max, defaultValue, response, dbForProject, queueForEvents }: { databaseId: string, collectionId: string, key: string, required: boolean | null, min: number | null, max: number | null, defaultValue: number | null, response: Response, dbForProject: Database, queueForEvents: Event }) => {
        const attribute = await updateAttribute({
            databaseId: databaseId,
            collectionId: collectionId,
            key: key,
            dbForProject: dbForProject,
            queueForEvents: queueForEvents,
            type: Database.VAR_INTEGER,
            defaultValue: defaultValue,
            required: required,
            min: min,
            max: max
        });

        const formatOptions = attribute.getAttribute('formatOptions', {});

        if (Object.keys(formatOptions).length > 0) {
            attribute.setAttribute('min', parseInt(formatOptions['min']));
            attribute.setAttribute('max', parseInt(formatOptions['max']));
        }

        response
            .setStatusCode(Response.STATUS_CODE_OK)
            .dynamic(attribute, Response.MODEL_ATTRIBUTE_INTEGER);
    });

App.patch('/v1/databases/:databaseId/collections/:collectionId/attributes/float/:key')
    .desc('Update float attribute')
    .groups(['api', 'database', 'schema'])
    .label('scope', 'collections.write')
    .label('event', 'databases.[databaseId].collections.[collectionId].attributes.[attributeId].update')
    .label('audits.event', 'attribute.update')
    .label('audits.resource', 'database/{request.databaseId}/collection/{request.collectionId}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'updateFloatAttribute')
    .label('sdk.description', '/docs/references/databases/update-float-attribute.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.model', Response.MODEL_ATTRIBUTE_FLOAT)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID. You can create a new collection using the Database service [server integration](https://appconda.io/docs/server/databases#databasesCreateCollection).')
    .param('key', '', new Key(), 'Attribute Key.')
    .param('required', null, new Boolean(), 'Is attribute required?')
    .param('min', null, new FloatValidator(), 'Minimum value to enforce on new documents')
    .param('max', null, new FloatValidator(), 'Maximum value to enforce on new documents')
    .param('default', null, new Nullable(new FloatValidator()), 'Default value for attribute when not provided. Cannot be set when attribute is required.')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async ({ databaseId, collectionId, key, required, min, max, defaultValue, response, dbForProject, queueForEvents }: { databaseId: string, collectionId: string, key: string, required: boolean | null, min: number | null, max: number | null, defaultValue: number | null, response: Response, dbForProject: Database, queueForEvents: Event }) => {
        const attribute = await updateAttribute({
            databaseId: databaseId,
            collectionId: collectionId,
            key: key,
            dbForProject: dbForProject,
            queueForEvents: queueForEvents,
            type: Database.VAR_FLOAT,
            defaultValue: defaultValue,
            required: required,
            min: min,
            max: max
        });

        const formatOptions = attribute.getAttribute('formatOptions', {});

        if (Object.keys(formatOptions).length > 0) {
            attribute.setAttribute('min', parseFloat(formatOptions['min']));
            attribute.setAttribute('max', parseFloat(formatOptions['max']));
        }

        response
            .setStatusCode(Response.STATUS_CODE_OK)
            .dynamic(attribute, Response.MODEL_ATTRIBUTE_FLOAT);
    });

App.patch('/v1/databases/:databaseId/collections/:collectionId/attributes/boolean/:key')
    .desc('Update boolean attribute')
    .groups(['api', 'database', 'schema'])
    .label('scope', 'collections.write')
    .label('event', 'databases.[databaseId].collections.[collectionId].attributes.[attributeId].update')
    .label('audits.event', 'attribute.update')
    .label('audits.resource', 'database/{request.databaseId}/collection/{request.collectionId}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'updateBooleanAttribute')
    .label('sdk.description', '/docs/references/databases/update-boolean-attribute.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.model', Response.MODEL_ATTRIBUTE_BOOLEAN)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID. You can create a new collection using the Database service [server integration](https://appconda.io/docs/server/databases#databasesCreateCollection).')
    .param('key', '', new Key(), 'Attribute Key.')
    .param('required', null, new Boolean(), 'Is attribute required?')
    .param('default', null, new Nullable(new Boolean()), 'Default value for attribute when not provided. Cannot be set when attribute is required.')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async ({ databaseId, collectionId, key, required, defaultValue, response, dbForProject, queueForEvents }: { databaseId: string, collectionId: string, key: string, required: boolean | null, defaultValue: boolean | null, response: Response, dbForProject: Database, queueForEvents: Event }) => {
        const attribute = await updateAttribute({
            databaseId: databaseId,
            collectionId: collectionId,
            key: key,
            dbForProject: dbForProject,
            queueForEvents: queueForEvents,
            type: Database.VAR_BOOLEAN,
            defaultValue: defaultValue,
            required: required
        });

        response
            .setStatusCode(Response.STATUS_CODE_OK)
            .dynamic(attribute, Response.MODEL_ATTRIBUTE_BOOLEAN);
    });

App.patch('/v1/databases/:databaseId/collections/:collectionId/attributes/datetime/:key')
    .desc('Update dateTime attribute')
    .groups(['api', 'database', 'schema'])
    .label('scope', 'collections.write')
    .label('event', 'databases.[databaseId].collections.[collectionId].attributes.[attributeId].update')
    .label('audits.event', 'attribute.update')
    .label('audits.resource', 'database/{request.databaseId}/collection/{request.collectionId}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'updateDatetimeAttribute')
    .label('sdk.description', '/docs/references/databases/update-datetime-attribute.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.model', Response.MODEL_ATTRIBUTE_DATETIME)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID. You can create a new collection using the Database service [server integration](https://appconda.io/docs/server/databases#databasesCreateCollection).')
    .param('key', '', new Key(), 'Attribute Key.')
    .param('required', null, new Boolean(), 'Is attribute required?')
    .param('default', null, new Nullable(new Datetime()), 'Default value for attribute when not provided. Cannot be set when attribute is required.')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async ({ databaseId, collectionId, key, required, defaultValue, response, dbForProject, queueForEvents }: { databaseId: string, collectionId: string, key: string, required: boolean | null, defaultValue: string | null, response: Response, dbForProject: Database, queueForEvents: Event }) => {
        const attribute = await updateAttribute({
            databaseId: databaseId,
            collectionId: collectionId,
            key: key,
            dbForProject: dbForProject,
            queueForEvents: queueForEvents,
            type: Database.VAR_DATETIME,
            defaultValue: defaultValue,
            required: required
        });

        response
            .setStatusCode(Response.STATUS_CODE_OK)
            .dynamic(attribute, Response.MODEL_ATTRIBUTE_DATETIME);
    });

App.patch('/v1/databases/:databaseId/collections/:collectionId/attributes/:key/relationship')
    .desc('Update relationship attribute')
    .groups(['api', 'database', 'schema'])
    .label('scope', 'collections.write')
    .label('event', 'databases.[databaseId].collections.[collectionId].attributes.[attributeId].update')
    .label('audits.event', 'attribute.update')
    .label('audits.resource', 'database/{request.databaseId}/collection/{request.collectionId}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'updateRelationshipAttribute')
    .label('sdk.description', '/docs/references/databases/update-relationship-attribute.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.model', Response.MODEL_ATTRIBUTE_RELATIONSHIP)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID. You can create a new collection using the Database service [server integration](https://appconda.io/docs/server/databases#databasesCreateCollection).')
    .param('key', '', new Key(), 'Attribute Key.')
    .param('onDelete', null, new WhiteList([Database.RELATION_MUTATE_CASCADE, Database.RELATION_MUTATE_RESTRICT, Database.RELATION_MUTATE_SET_NULL], true), 'Constraints option', true)
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async ({ databaseId, collectionId, key, onDelete, response, dbForProject, queueForEvents }: { databaseId: string, collectionId: string, key: string, onDelete: string | null, response: Response, dbForProject: Database, queueForEvents: Event }) => {
        const attribute = await updateAttribute({
            databaseId: databaseId,
            collectionId: collectionId,
            key: key,
            dbForProject: dbForProject,
            queueForEvents: queueForEvents,
            type: Database.VAR_RELATIONSHIP,
            required: false,
            options: {
                onDelete: onDelete
            }
        });

        const options = attribute.getAttribute('options', {});

        for (const [key, option] of Object.entries(options)) {
            attribute.setAttribute(key, option);
        }

        response
            .setStatusCode(Response.STATUS_CODE_OK)
            .dynamic(attribute, Response.MODEL_ATTRIBUTE_RELATIONSHIP);
    });

App.delete('/v1/databases/:databaseId/collections/:collectionId/attributes/:key')
    //.alias('/v1/database/collections/:collectionId/attributes/:key', { databaseId: 'default' })
    .desc('Delete attribute')
    .groups(['api', 'database', 'schema'])
    .label('scope', 'collections.write')
    .label('event', 'databases.[databaseId].collections.[collectionId].attributes.[attributeId].update')
    .label('audits.event', 'attribute.delete')
    .label('audits.resource', 'database/{request.databaseId}/collection/{request.collectionId}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'deleteAttribute')
    .label('sdk.description', '/docs/references/databases/delete-attribute.md')
    .label('sdk.response.code', Response.STATUS_CODE_NOCONTENT)
    .label('sdk.response.model', Response.MODEL_NONE)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID. You can create a new collection using the Database service [server integration](https://appconda.io/docs/server/databases#databasesCreateCollection).')
    .param('key', '', new Key(), 'Attribute Key.')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForDatabase')
    .inject('queueForEvents')
    .action(async ({ databaseId, collectionId, key, response, dbForProject, queueForDatabase, queueForEvents }: { databaseId: string, collectionId: string, key: string, response: Response, dbForProject: Database, queueForDatabase: EventDatabase, queueForEvents: Event }) => {

        const db = await Authorization.skip(() => dbForProject.getDocument('databases', databaseId));

        if (db.isEmpty()) {
            throw new Exception(Exception.DATABASE_NOT_FOUND);
        }

        const collection = await dbForProject.getDocument('database_' + db.getInternalId(), collectionId);

        if (collection.isEmpty()) {
            throw new Exception(Exception.COLLECTION_NOT_FOUND);
        }

        const attribute = await dbForProject.getDocument('attributes', db.getInternalId() + '_' + collection.getInternalId() + '_' + key);

        if (attribute.isEmpty()) {
            throw new Exception(Exception.ATTRIBUTE_NOT_FOUND);
        }

        if (attribute.getAttribute('status') === 'available') {
            await dbForProject.updateDocument('attributes', attribute.getId(), attribute.setAttribute('status', 'deleting'));
        }

        await dbForProject.purgeCachedDocument('database_' + db.getInternalId(), collectionId);
        await dbForProject.purgeCachedCollection('database_' + db.getInternalId() + '_collection_' + collection.getInternalId());

        if (attribute.getAttribute('type') === Database.VAR_RELATIONSHIP) {
            const options = attribute.getAttribute('options');
            if (options['twoWay']) {
                const relatedCollection = await dbForProject.getDocument('database_' + db.getInternalId(), options['relatedCollection']);

                if (relatedCollection.isEmpty()) {
                    throw new Exception(Exception.COLLECTION_NOT_FOUND);
                }

                const relatedAttribute = await dbForProject.getDocument('attributes', db.getInternalId() + '_' + relatedCollection.getInternalId() + '_' + options['twoWayKey']);

                if (relatedAttribute.isEmpty()) {
                    throw new Exception(Exception.ATTRIBUTE_NOT_FOUND);
                }

                if (relatedAttribute.getAttribute('status') === 'available') {
                    await dbForProject.updateDocument('attributes', relatedAttribute.getId(), relatedAttribute.setAttribute('status', 'deleting'));
                }

                await dbForProject.purgeCachedDocument('database_' + db.getInternalId(), options['relatedCollection']);
                await dbForProject.purgeCachedCollection('database_' + db.getInternalId() + '_collection_' + relatedCollection.getInternalId());
            }
        }

        queueForDatabase
            .setType(DATABASE_TYPE_DELETE_ATTRIBUTE)
            .setCollection(collection)
            .setDatabase(db)
            .setDocument(attribute);

        const type = attribute.getAttribute('type');
        const format = attribute.getAttribute('format');

        const model = (() => {
            switch (type) {
                case Database.VAR_BOOLEAN:
                    return Response.MODEL_ATTRIBUTE_BOOLEAN;
                case Database.VAR_INTEGER:
                    return Response.MODEL_ATTRIBUTE_INTEGER;
                case Database.VAR_FLOAT:
                    return Response.MODEL_ATTRIBUTE_FLOAT;
                case Database.VAR_DATETIME:
                    return Response.MODEL_ATTRIBUTE_DATETIME;
                case Database.VAR_RELATIONSHIP:
                    return Response.MODEL_ATTRIBUTE_RELATIONSHIP;
                case Database.VAR_STRING:
                    switch (format) {
                        case APP_DATABASE_ATTRIBUTE_EMAIL:
                            return Response.MODEL_ATTRIBUTE_EMAIL;
                        case APP_DATABASE_ATTRIBUTE_ENUM:
                            return Response.MODEL_ATTRIBUTE_ENUM;
                        case APP_DATABASE_ATTRIBUTE_IP:
                            return Response.MODEL_ATTRIBUTE_IP;
                        case APP_DATABASE_ATTRIBUTE_URL:
                            return Response.MODEL_ATTRIBUTE_URL;
                        default:
                            return Response.MODEL_ATTRIBUTE_STRING;
                    }
                default:
                    return Response.MODEL_ATTRIBUTE;
            }
        })();

        queueForEvents
            .setParam('databaseId', databaseId)
            .setParam('collectionId', collection.getId())
            .setParam('attributeId', attribute.getId())
            .setContext('collection', collection)
            .setContext('database', db)
            .setPayload(response.output(attribute, model));

        response.noContent();
    });

App.post('/v1/databases/:databaseId/collections/:collectionId/indexes')
    // .alias('/v1/database/collections/:collectionId/indexes', { databaseId: 'default' })
    .desc('Create index')
    .groups(['api', 'database'])
    .label('event', 'databases.[databaseId].collections.[collectionId].indexes.[indexId].create')
    .label('scope', 'collections.write')
    .label('audits.event', 'index.create')
    .label('audits.resource', 'database/{request.databaseId}/collection/{request.collectionId}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'createIndex')
    .label('sdk.description', '/docs/references/databases/create-index.md')
    .label('sdk.response.code', Response.STATUS_CODE_ACCEPTED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_INDEX)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID. You can create a new collection using the Database service [server integration](https://appconda.io/docs/server/databases#databasesCreateCollection).')
    .param('key', null, new Key(), 'Index Key.')
    .param('type', null, new WhiteList([Database.INDEX_KEY, Database.INDEX_FULLTEXT, Database.INDEX_UNIQUE]), 'Index type.')
    .param('attributes', null, new ArrayList(new Key(true), APP_LIMIT_ARRAY_PARAMS_SIZE), `Array of attributes to index. Maximum of ${APP_LIMIT_ARRAY_PARAMS_SIZE} attributes are allowed, each 32 characters long.`)
    .param('orders', [], new ArrayList(new WhiteList(['ASC', 'DESC'], false, Database.VAR_STRING), APP_LIMIT_ARRAY_PARAMS_SIZE), `Array of index orders. Maximum of ${APP_LIMIT_ARRAY_PARAMS_SIZE} orders are allowed.`, true)
    .inject('response')
    .inject('dbForProject')
    .inject('queueForDatabase')
    .inject('queueForEvents')
    .action(async ({ databaseId, collectionId, key, type, attributes, orders, response, dbForProject, queueForDatabase, queueForEvents }: { databaseId: string, collectionId: string, key: string, type: string, attributes: string[], orders: string[], response: Response, dbForProject: Database, queueForDatabase: EventDatabase, queueForEvents: Event }) => {

        const db = await Authorization.skip(() => dbForProject.getDocument('databases', databaseId));

        if (db.isEmpty()) {
            throw new Exception(Exception.DATABASE_NOT_FOUND);
        }

        const collection = await dbForProject.getDocument('database_' + db.getInternalId(), collectionId);

        if (collection.isEmpty()) {
            throw new Exception(Exception.COLLECTION_NOT_FOUND);
        }

        const count = await dbForProject.count('indexes', [
            Query.equal('collectionInternalId', [collection.getInternalId()]),
            Query.equal('databaseInternalId', [db.getInternalId()])
        ], 61);

        const limit = dbForProject.getLimitForIndexes();

        if (count >= limit) {
            throw new Exception(Exception.INDEX_LIMIT_EXCEEDED, 'Index limit exceeded');
        }

        const oldAttributes = collection.getAttribute('attributes').map((a: any) => a.getArrayCopy());

        oldAttributes.push(
            { key: '$id', type: Database.VAR_STRING, status: 'available', required: true, array: false, default: null, size: 36 },
            { key: '$createdAt', type: Database.VAR_DATETIME, status: 'available', signed: false, required: false, array: false, default: null, size: 0 },
            { key: '$updatedAt', type: Database.VAR_DATETIME, status: 'available', signed: false, required: false, array: false, default: null, size: 0 }
        );

        const lengths: (number | null)[] = [];

        for (let i = 0; i < attributes.length; i++) {
            const attribute = attributes[i];
            const attributeIndex = oldAttributes.findIndex((attr: any) => attr.key === attribute);

            if (attributeIndex === -1) {
                throw new Exception(Exception.ATTRIBUTE_UNKNOWN, 'Unknown attribute: ' + attribute);
            }

            const { status, type, size, array } = oldAttributes[attributeIndex];

            if (type === Database.VAR_RELATIONSHIP) {
                throw new Exception(Exception.ATTRIBUTE_TYPE_INVALID, 'Cannot create an index for a relationship attribute: ' + oldAttributes[attributeIndex].key);
            }

            if (status !== 'available') {
                throw new Exception(Exception.ATTRIBUTE_NOT_AVAILABLE, 'Attribute not available: ' + oldAttributes[attributeIndex].key);
            }

            lengths[i] = null;

            if (type === Database.VAR_STRING) {
                lengths[i] = size;
            }

            if (array === true) {
                lengths[i] = Database.ARRAY_INDEX_LENGTH;
                orders[i] = null;
            }
        }

        const index = new Document({
            $id: ID.custom(db.getInternalId() + '_' + collection.getInternalId() + '_' + key),
            key: key,
            status: 'processing',
            databaseInternalId: db.getInternalId(),
            databaseId: databaseId,
            collectionInternalId: collection.getInternalId(),
            collectionId: collectionId,
            type: type,
            attributes: attributes,
            lengths: lengths,
            orders: orders,
        });

        const validator = new Index(
            collection.getAttribute('attributes'),
            dbForProject.getAdapter().getMaxIndexLength()
        );

        if (!validator.isValid(index)) {
            throw new Exception(Exception.INDEX_INVALID, validator.getDescription());
        }

        try {
            await dbForProject.createDocument('indexes', index);
        } catch (error) {
            if (error instanceof Duplicate) {
                throw new Exception(Exception.INDEX_ALREADY_EXISTS);
            }
            throw error;
        }

        await dbForProject.purgeCachedDocument('database_' + db.getInternalId(), collectionId);

        queueForDatabase
            .setType(DATABASE_TYPE_CREATE_INDEX)
            .setDatabase(db)
            .setCollection(collection)
            .setDocument(index);

        queueForEvents
            .setParam('databaseId', databaseId)
            .setParam('collectionId', collection.getId())
            .setParam('indexId', index.getId())
            .setContext('collection', collection)
            .setContext('database', db);

        response
            .setStatusCode(Response.STATUS_CODE_ACCEPTED)
            .dynamic(index, Response.MODEL_INDEX);
    });

App.get('/v1/databases/:databaseId/collections/:collectionId/indexes')
    //.alias('/v1/database/collections/:collectionId/indexes', { databaseId: 'default' })
    .desc('List indexes')
    .groups(['api', 'database'])
    .label('scope', 'collections.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'listIndexes')
    .label('sdk.description', '/docs/references/databases/list-indexes.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_INDEX_LIST)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID. You can create a new collection using the Database service [server integration](https://appconda.io/docs/server/databases#databasesCreateCollection).')
    .param('queries', [], new Indexes(), `Array of query strings generated using the Query class provided by the SDK. [Learn more about queries](https://appconda.io/docs/queries). Maximum of ${APP_LIMIT_ARRAY_PARAMS_SIZE} queries are allowed, each ${APP_LIMIT_ARRAY_ELEMENT_SIZE} characters long. You may filter on the following attributes: ${Indexes.ALLOWED_ATTRIBUTES.join(', ')}`, true)
    .inject('response')
    .inject('dbForProject')
    .action(async ({ databaseId, collectionId, queries, response, dbForProject }: { databaseId: string, collectionId: string, queries: any[], response: Response, dbForProject: Database }) => {
        const database = await Authorization.skip(() => dbForProject.getDocument('databases', databaseId));

        if (database.isEmpty()) {
            throw new Exception(Exception.DATABASE_NOT_FOUND);
        }

        const collection = await dbForProject.getDocument('database_' + database.getInternalId(), collectionId);

        if (collection.isEmpty()) {
            throw new Exception(Exception.COLLECTION_NOT_FOUND);
        }

        try {
            queries = Query.parseQueries(queries);
        } catch (e) {
            if (e instanceof QueryException) {
                throw new Exception(Exception.GENERAL_QUERY_INVALID, e.message);
            }
            throw e;
        }

        queries.push(Query.equal('collectionId', [collectionId]), Query.equal('databaseId', [databaseId]));

        let cursor: any = queries.filter(query => [Query.TYPE_CURSOR_AFTER, Query.TYPE_CURSOR_BEFORE].includes(query.getMethod()));
        cursor = cursor.length ? cursor[0] : null;

        if (cursor) {
            const indexId = cursor.getValue();
            const cursorDocument = await Authorization.skip(() => dbForProject.find('indexes', [
                Query.equal('collectionInternalId', [collection.getInternalId()]),
                Query.equal('databaseInternalId', [database.getInternalId()]),
                Query.equal('key', [indexId]),
                Query.limit(1)
            ]));

            if (!cursorDocument.length || cursorDocument[0].isEmpty()) {
                throw new Exception(Exception.GENERAL_CURSOR_NOT_FOUND, `Index '${indexId}' for the 'cursor' value not found.`);
            }

            cursor.setValue(cursorDocument[0]);
        }

        const filterQueries = Query.groupByType(queries)['filters'];
        response.dynamic(new Document({
            total: await dbForProject.count('indexes', filterQueries, APP_LIMIT_COUNT),
            indexes: await dbForProject.find('indexes', queries),
        }), Response.MODEL_INDEX_LIST);
    });

App.get('/v1/databases/:databaseId/collections/:collectionId/indexes/:key')
    //.alias('/v1/database/collections/:collectionId/indexes/:key', { databaseId: 'default' })
    .desc('Get index')
    .groups(['api', 'database'])
    .label('scope', 'collections.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'getIndex')
    .label('sdk.description', '/docs/references/databases/get-index.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_INDEX)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID. You can create a new collection using the Database service [server integration](https://appconda.io/docs/server/databases#databasesCreateCollection).')
    .param('key', null, new Key(), 'Index Key.')
    .inject('response')
    .inject('dbForProject')
    .action(async ({ databaseId, collectionId, key, response, dbForProject }: { databaseId: string, collectionId: string, key: string, response: Response, dbForProject: Database }) => {

        const database = await Authorization.skip(async () => await dbForProject.getDocument('databases', databaseId));

        if (database.isEmpty()) {
            throw new Exception(Exception.DATABASE_NOT_FOUND);
        }

        const collection = await dbForProject.getDocument('database_' + database.getInternalId(), collectionId);

        if (collection.isEmpty()) {
            throw new Exception(Exception.COLLECTION_NOT_FOUND);
        }

        const index = collection.find('key', key, 'indexes');
        if (!index) {
            throw new Exception(Exception.INDEX_NOT_FOUND);
        }

        response.dynamic(index, Response.MODEL_INDEX);
    });

App.delete('/v1/databases/:databaseId/collections/:collectionId/indexes/:key')
    //.alias('/v1/database/collections/:collectionId/indexes/:key', { databaseId: 'default' })
    .desc('Delete index')
    .groups(['api', 'database'])
    .label('scope', 'collections.write')
    .label('event', 'databases.[databaseId].collections.[collectionId].indexes.[indexId].update')
    .label('audits.event', 'index.delete')
    .label('audits.resource', 'database/{request.databaseId}/collection/{request.collectionId}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'deleteIndex')
    .label('sdk.description', '/docs/references/databases/delete-index.md')
    .label('sdk.response.code', Response.STATUS_CODE_NOCONTENT)
    .label('sdk.response.model', Response.MODEL_NONE)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID. You can create a new collection using the Database service [server integration](https://appconda.io/docs/server/databases#databasesCreateCollection).')
    .param('key', '', new Key(), 'Index Key.')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForDatabase')
    .inject('queueForEvents')
    .action(async ({ databaseId, collectionId, key, response, dbForProject, queueForDatabase, queueForEvents }: { databaseId: string, collectionId: string, key: string, response: Response, dbForProject: Database, queueForDatabase: EventDatabase, queueForEvents: Event }) => {

        const db = await Authorization.skip(() => dbForProject.getDocument('databases', databaseId));

        if (db.isEmpty()) {
            throw new Exception(Exception.DATABASE_NOT_FOUND);
        }

        const collection = await dbForProject.getDocument('database_' + db.getInternalId(), collectionId);

        if (collection.isEmpty()) {
            throw new Exception(Exception.COLLECTION_NOT_FOUND);
        }

        const index = await dbForProject.getDocument('indexes', db.getInternalId() + '_' + collection.getInternalId() + '_' + key);

        if (!index.getId()) {
            throw new Exception(Exception.INDEX_NOT_FOUND);
        }

        if (index.getAttribute('status') === 'available') {
            await dbForProject.updateDocument('indexes', index.getId(), index.setAttribute('status', 'deleting'));
        }

        await dbForProject.purgeCachedDocument('database_' + db.getInternalId(), collectionId);

        queueForDatabase
            .setType(DATABASE_TYPE_DELETE_INDEX)
            .setDatabase(db)
            .setCollection(collection)
            .setDocument(index);

        queueForEvents
            .setParam('databaseId', databaseId)
            .setParam('collectionId', collection.getId())
            .setParam('indexId', index.getId())
            .setContext('collection', collection)
            .setContext('database', db)
            .setPayload(response.output(index, Response.MODEL_INDEX));

        response.noContent();
    });

App.post('/v1/databases/:databaseId/collections/:collectionId/documents')
    //.alias('/v1/database/collections/:collectionId/documents', { databaseId: 'default' })
    .desc('Create document')
    .groups(['api', 'database'])
    .label('event', 'databases.[databaseId].collections.[collectionId].documents.[documentId].create')
    .label('scope', 'documents.write')
    .label('audits.event', 'document.create')
    .label('audits.resource', 'database/{request.databaseId}/collection/{request.collectionId}')
    .label('abuse-key', 'ip:{ip},method:{method},url:{url},userId:{userId}')
    .label('abuse-limit', APP_LIMIT_WRITE_RATE_DEFAULT * 2)
    .label('abuse-time', APP_LIMIT_WRITE_RATE_PERIOD_DEFAULT)
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'createDocument')
    .label('sdk.description', '/docs/references/databases/create-document.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_DOCUMENT)
    .label('sdk.offline.model', '/databases/{databaseId}/collections/{collectionId}/documents')
    .label('sdk.offline.key', '{documentId}')
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('documentId', '', new CustomId(), 'Document ID. Choose a custom ID or generate a random ID with `ID.unique()`. Valid chars are a-z, A-Z, 0-9, period, hyphen, and underscore. Can\'t start with a special char. Max length is 36 chars.')
    .param('collectionId', '', new UID(), 'Collection ID. You can create a new collection using the Database service [server integration](https://appconda.io/docs/server/databases#databasesCreateCollection). Make sure to define attributes before creating documents.')
    .param('data', [], new JSONValidator(), 'Document data as JSON object.')
    .param('permissions', null, new Permissions(APP_LIMIT_ARRAY_PARAMS_SIZE, [Database.PERMISSION_READ, Database.PERMISSION_UPDATE, Database.PERMISSION_DELETE, Database.PERMISSION_WRITE]), 'An array of permissions strings. By default, only the current user is granted all permissions. [Learn more about permissions](https://appconda.io/docs/permissions).', true)
    .inject('response')
    .inject('dbForProject')
    .inject('user')
    .inject('queueForEvents')
    .inject('mode')
    .action(async ({ databaseId, documentId, collectionId, data, permissions, response, dbForProject, user, queueForEvents, mode }: { databaseId: string, documentId: string, collectionId: string, data: string | Record<string, any>, permissions: string[] | null, response: Response, dbForProject: Database, user: Document, queueForEvents: Event, mode: string }) => {

        data = (typeof data === 'string') ? JSON.parse(data) : data;

        if (Object.keys(data).length === 0) {
            throw new Exception(Exception.DOCUMENT_MISSING_DATA);
        }

        if ('$id' in (data as any)) {
            throw new Exception(Exception.DOCUMENT_INVALID_STRUCTURE, '$id is not allowed for creating new documents, try update instead');
        }

        const database = await Authorization.skip(() => dbForProject.getDocument('databases', databaseId));

        const isAPIKey = Auth.isAppUser(Authorization.getRoles());
        const isPrivilegedUser = Auth.isPrivilegedUser(Authorization.getRoles());

        if (database.isEmpty() || (!database.getAttribute('enabled', false) && !isAPIKey && !isPrivilegedUser)) {
            throw new Exception(Exception.DATABASE_NOT_FOUND);
        }

        const collection = await Authorization.skip(() => dbForProject.getDocument('database_' + database.getInternalId(), collectionId));

        if (collection.isEmpty() || (!collection.getAttribute('enabled', false) && !isAPIKey && !isPrivilegedUser)) {
            throw new Exception(Exception.COLLECTION_NOT_FOUND);
        }

        const allowedPermissions = [
            Database.PERMISSION_READ,
            Database.PERMISSION_UPDATE,
            Database.PERMISSION_DELETE,
        ];

        permissions = Permission.aggregate(permissions, allowedPermissions);

        if (permissions === null) {
            permissions = [];
            if (user.getId()) {
                for (const permission of allowedPermissions) {
                    permissions.push(new Permission(permission, 'user', user.getId()).toString());
                }
            }
        }

        if (!isAPIKey && !isPrivilegedUser) {
            for (const type of Database.PERMISSIONS) {
                for (const permission of permissions) {
                    const parsedPermission = Permission.parse(permission);
                    if (parsedPermission.getPermission() !== type) {
                        continue;
                    }
                    const role = new Role(
                        parsedPermission.getRole(),
                        parsedPermission.getIdentifier(),
                        parsedPermission.getDimension()
                    ).toString();
                    if (!Authorization.isRole(role)) {
                        throw new Exception(Exception.USER_UNAUTHORIZED, 'Permissions must be one of: (' + Authorization.getRoles().join(', ') + ')');
                    }
                }
            }
        }

        data['$collection'] = collection.getId();
        data['$id'] = documentId === 'unique()' ? ID.unique() : documentId;
        data['$permissions'] = permissions;
        const document = new Document(data as any);

        const checkPermissions = async (collection: Document, document: Document, permission: string) => {
            const documentSecurity = collection.getAttribute('documentSecurity', false);
            const validator = new Authorization(permission);

            let valid = validator.isValid(collection.getPermissionsByType(permission));
            if ((permission === Database.PERMISSION_UPDATE && !documentSecurity) || !valid) {
                throw new Exception(Exception.USER_UNAUTHORIZED);
            }

            if (permission === Database.PERMISSION_UPDATE) {
                valid = valid || validator.isValid(document.getUpdate());
                if (documentSecurity && !valid) {
                    throw new Exception(Exception.USER_UNAUTHORIZED);
                }
            }

            const relationships = collection.getAttribute('attributes', []).filter((attribute: any) => attribute.getAttribute('type') === Database.VAR_RELATIONSHIP);

            for (const relationship of relationships) {
                let related = document.getAttribute(relationship.getAttribute('key'));

                if (!related) {
                    continue;
                }

                const isList = Array.isArray(related) && Array.isArray(related);

                const relations = isList ? related : [related];

                const relatedCollectionId = relationship.getAttribute('relatedCollection');
                const relatedCollection = await Authorization.skip(() => dbForProject.getDocument('database_' + database.getInternalId(), relatedCollectionId));

                for (let relation of relations) {
                    if (typeof relation === 'object' && !Array.isArray(relation) && !relation['$id']) {
                        relation['$id'] = ID.unique();
                        relation = new Document(relation);
                    }
                    if (relation instanceof Document) {
                        const current = await Authorization.skip(() => dbForProject.getDocument('database_' + database.getInternalId() + '_collection_' + relatedCollection.getInternalId(), relation.getId()));

                        let type;
                        if (current.isEmpty()) {
                            type = Database.PERMISSION_CREATE;

                            if (relation['$id'] === 'unique()') {
                                relation['$id'] = ID.unique();
                            }
                        } else {
                            relation.removeAttribute('$collectionId');
                            relation.removeAttribute('$databaseId');
                            relation.setAttribute('$collection', relatedCollection.getId());
                            type = Database.PERMISSION_UPDATE;
                        }

                        await checkPermissions(relatedCollection, relation, type);
                    }
                }

                if (isList) {
                    document.setAttribute(relationship.getAttribute('key'), relations);
                } else {
                    document.setAttribute(relationship.getAttribute('key'), relations[0]);
                }
            }
        };

        await checkPermissions(collection, document, Database.PERMISSION_CREATE);

        try {
            await dbForProject.createDocument('database_' + database.getInternalId() + '_collection_' + collection.getInternalId(), document);
        } catch (exception) {
            if (exception instanceof StructureException) {
                throw new Exception(Exception.DOCUMENT_INVALID_STRUCTURE, exception.message);
            } else if (exception instanceof Duplicate) {
                throw new Exception(Exception.DOCUMENT_ALREADY_EXISTS);
            }
            throw exception;
        }

        const processDocument = async (collection: Document, document: Document) => {
            document.setAttribute('$databaseId', database.getId());
            document.setAttribute('$collectionId', collection.getId());

            const relationships = collection.getAttribute('attributes', []).filter((attribute: any) => attribute.getAttribute('type') === Database.VAR_RELATIONSHIP);

            for (const relationship of relationships) {
                let related = document.getAttribute(relationship.getAttribute('key'));

                if (!related) {
                    continue;
                }
                if (!Array.isArray(related)) {
                    related = [related];
                }

                const relatedCollectionId = relationship.getAttribute('relatedCollection');
                const relatedCollection = await Authorization.skip(() => dbForProject.getDocument('database_' + database.getInternalId(), relatedCollectionId));

                for (const relation of related) {
                    if (relation instanceof Document) {
                        await processDocument(relatedCollection, relation);
                    }
                }
            }
        };

        await processDocument(collection, document);

        response
            .setStatusCode(Response.STATUS_CODE_CREATED)
            .dynamic(document, Response.MODEL_DOCUMENT);

        const relationships = collection.getAttribute('attributes', []).filter((attribute: any) => attribute.getAttribute('type') === Database.VAR_RELATIONSHIP).map((document: any) => document.getAttribute('key'));

        queueForEvents
            .setParam('databaseId', databaseId)
            .setParam('collectionId', collection.getId())
            .setParam('documentId', document.getId())
            .setContext('collection', collection)
            .setContext('database', database)
            .setPayload(response.getPayload(), relationships);
    });

App.get('/v1/databases/:databaseId/collections/:collectionId/documents')
    // .alias('/v1/database/collections/:collectionId/documents', { databaseId: 'default' })
    .desc('List documents')
    .groups(['api', 'database'])
    .label('scope', 'documents.read')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'listDocuments')
    .label('sdk.description', '/docs/references/databases/list-documents.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_DOCUMENT_LIST)
    .label('sdk.offline.model', '/databases/{databaseId}/collections/{collectionId}/documents')
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID. You can create a new collection using the Database service [server integration](https://appconda.io/docs/server/databases#databasesCreateCollection).')
    .param('queries', [], new ArrayList(new Text(APP_LIMIT_ARRAY_ELEMENT_SIZE), APP_LIMIT_ARRAY_PARAMS_SIZE), `Array of query strings generated using the Query class provided by the SDK. [Learn more about queries](https://appconda.io/docs/queries). Maximum of ${APP_LIMIT_ARRAY_PARAMS_SIZE} queries are allowed, each ${APP_LIMIT_ARRAY_ELEMENT_SIZE} characters long.`, true)
    .inject('response')
    .inject('dbForProject')
    .inject('mode')
    .action(async (databaseId: string, collectionId: string, queries: any[], response: Response, dbForProject: Database, mode: string) => {
        const database = await Authorization.skip(() => dbForProject.getDocument('databases', databaseId));
        const isAPIKey = Auth.isAppUser(Authorization.getRoles());
        const isPrivilegedUser = Auth.isPrivilegedUser(Authorization.getRoles());

        if (database.isEmpty() || (!database.getAttribute('enabled', false) && !isAPIKey && !isPrivilegedUser)) {
            throw new Exception(Exception.DATABASE_NOT_FOUND);
        }

        const collection = await Authorization.skip(() => dbForProject.getDocument('database_' + database.getInternalId(), collectionId));

        if (collection.isEmpty() || (!collection.getAttribute('enabled', false) && !isAPIKey && !isPrivilegedUser)) {
            throw new Exception(Exception.COLLECTION_NOT_FOUND);
        }

        try {
            queries = Query.parseQueries(queries);
        } catch (e) {
            if (e instanceof QueryException) {
                throw new Exception(Exception.GENERAL_QUERY_INVALID, e.message);
            }
            throw e;
        }

        let cursor: any = queries.filter(query => [Query.TYPE_CURSOR_AFTER, Query.TYPE_CURSOR_BEFORE].includes(query.getMethod()));
        cursor = cursor.length ? cursor[0] : null;

        if (cursor) {
            const documentId = cursor.getValue();
            const cursorDocument = await Authorization.skip(() => dbForProject.getDocument('database_' + database.getInternalId() + '_collection_' + collection.getInternalId(), documentId));

            if (cursorDocument.isEmpty()) {
                throw new Exception(Exception.GENERAL_CURSOR_NOT_FOUND, `Document '${documentId}' for the 'cursor' value not found.`);
            }

            cursor.setValue(cursorDocument);
        }

        let documents, total;
        try {
            documents = await dbForProject.find('database_' + database.getInternalId() + '_collection_' + collection.getInternalId(), queries);
            total = await dbForProject.count('database_' + database.getInternalId() + '_collection_' + collection.getInternalId(), queries, APP_LIMIT_COUNT);
        } catch (e) {
            if (e instanceof AuthorizationException) {
                throw new Exception(Exception.USER_UNAUTHORIZED);
            } else if (e instanceof QueryException) {
                throw new Exception(Exception.GENERAL_QUERY_INVALID, e.message);
            }
            throw e;
        }

        const processDocument = async (collection: Document, document: Document): Promise<boolean> => {
            if (document.isEmpty()) {
                return false;
            }

            document.removeAttribute('$collection');
            document.setAttribute('$databaseId', database.getId());
            document.setAttribute('$collectionId', collection.getId());

            const relationships = collection.getAttribute('attributes', []).filter((attribute: any) => attribute.getAttribute('type') === Database.VAR_RELATIONSHIP);

            for (const relationship of relationships) {
                let related = document.getAttribute(relationship.getAttribute('key'));

                if (!related) {
                    continue;
                }
                const relations = Array.isArray(related) ? related : [related];

                const relatedCollectionId = relationship.getAttribute('relatedCollection');
                const relatedCollection = await Authorization.skip(() => dbForProject.getDocument('database_' + database.getInternalId(), relatedCollectionId));

                for (let i = 0; i < relations.length; i++) {
                    const doc = relations[i];
                    if (doc instanceof Document) {
                        if (!await processDocument(relatedCollection, doc)) {
                            relations.splice(i, 1);
                            i--;
                        }
                    }
                }

                if (Array.isArray(related)) {
                    document.setAttribute(relationship.getAttribute('key'), relations);
                } else if (relations.length === 0) {
                    document.setAttribute(relationship.getAttribute('key'), null);
                }
            }

            return true;
        };

        for (const document of documents) {
            await processDocument(collection, document);
        }

        const select = queries.some(query => query.getMethod() === Query.TYPE_SELECT);

        if (select) {
            const hasDatabaseId = queries.some(query => query.getMethod() === Query.TYPE_SELECT && query.getValues().includes('$databaseId'));
            const hasCollectionId = queries.some(query => query.getMethod() === Query.TYPE_SELECT && query.getValues().includes('$collectionId'));

            for (const document of documents) {
                if (!hasDatabaseId) {
                    document.removeAttribute('$databaseId');
                }
                if (!hasCollectionId) {
                    document.removeAttribute('$collectionId');
                }
            }
        }

        response.dynamic(new Document({
            total: total,
            documents: documents,
        }), Response.MODEL_DOCUMENT_LIST);
    });

App.get('/v1/databases/:databaseId/collections/:collectionId/documents/:documentId')
    //.alias('/v1/database/collections/:collectionId/documents/:documentId', { databaseId: 'default' })
    .desc('Get document')
    .groups(['api', 'database'])
    .label('scope', 'documents.read')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'getDocument')
    .label('sdk.description', '/docs/references/databases/get-document.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_DOCUMENT)
    .label('sdk.offline.model', '/databases/{databaseId}/collections/{collectionId}/documents')
    .label('sdk.offline.key', '{documentId}')
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID. You can create a new collection using the Database service [server integration](https://appconda.io/docs/server/databases#databasesCreateCollection).')
    .param('documentId', '', new UID(), 'Document ID.')
    .param('queries', [], new ArrayList(new Text(APP_LIMIT_ARRAY_ELEMENT_SIZE), APP_LIMIT_ARRAY_PARAMS_SIZE), `Array of query strings generated using the Query class provided by the SDK. [Learn more about queries](https://appconda.io/docs/queries). Maximum of ${APP_LIMIT_ARRAY_PARAMS_SIZE} queries are allowed, each ${APP_LIMIT_ARRAY_ELEMENT_SIZE} characters long.`, true)
    .inject('response')
    .inject('dbForProject')
    .inject('mode')
    .action(async ({ databaseId, collectionId, documentId, queries, response, dbForProject, mode }: { databaseId: string, collectionId: string, documentId: string, queries: any[], response: Response, dbForProject: Database, mode: string }) => {
        const database = await Authorization.skip(async () => await dbForProject.getDocument('databases', databaseId));

        const isAPIKey = Auth.isAppUser(Authorization.getRoles());
        const isPrivilegedUser = Auth.isPrivilegedUser(Authorization.getRoles());

        if (database.isEmpty() || (!database.getAttribute('enabled', false) && !isAPIKey && !isPrivilegedUser)) {
            throw new Exception(Exception.DATABASE_NOT_FOUND);
        }

        const collection = await Authorization.skip(async () => await dbForProject.getDocument('database_' + database.getInternalId(), collectionId));

        if (collection.isEmpty() || (!collection.getAttribute('enabled', false) && !isAPIKey && !isPrivilegedUser)) {
            throw new Exception(Exception.COLLECTION_NOT_FOUND);
        }

        let document;
        try {
            queries = Query.parseQueries(queries);
            document = await dbForProject.getDocument('database_' + database.getInternalId() + '_collection_' + collection.getInternalId(), documentId, queries);
        } catch (e) {
            if (e instanceof AuthorizationException) {
                throw new Exception(Exception.USER_UNAUTHORIZED);
            } else if (e instanceof QueryException) {
                throw new Exception(Exception.GENERAL_QUERY_INVALID, e.message);
            }
            throw e;
        }

        if (document.isEmpty()) {
            throw new Exception(Exception.DOCUMENT_NOT_FOUND);
        }

        const processDocument = async (collection: Document, document: Document) => {
            if (document.isEmpty()) {
                return;
            }

            document.setAttribute('$databaseId', database.getId());
            document.setAttribute('$collectionId', collection.getId());

            const relationships = collection.getAttribute('attributes', []).filter((attribute: any) => attribute.getAttribute('type') === Database.VAR_RELATIONSHIP);

            for (const relationship of relationships) {
                let related = document.getAttribute(relationship.getAttribute('key'));

                if (!related) {
                    continue;
                }
                if (!Array.isArray(related)) {
                    related = [related];
                }

                const relatedCollectionId = relationship.getAttribute('relatedCollection');
                const relatedCollection = await Authorization.skip(async () => await dbForProject.getDocument('database_' + database.getInternalId(), relatedCollectionId));

                for (const relation of related) {
                    if (relation instanceof Document) {
                        await processDocument(relatedCollection, relation);
                    }
                }
            }
        };

        await processDocument(collection, document);

        response.dynamic(document, Response.MODEL_DOCUMENT);
    });

App.get('/v1/databases/:databaseId/collections/:collectionId/documents/:documentId/logs')
    //.alias('/v1/database/collections/:collectionId/documents/:documentId/logs', { databaseId: 'default' })
    .desc('List document logs')
    .groups(['api', 'database'])
    .label('scope', 'documents.read')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'listDocumentLogs')
    .label('sdk.description', '/docs/references/databases/get-document-logs.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_LOG_LIST)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID.')
    .param('documentId', '', new UID(), 'Document ID.')
    .param('queries', [], new Queries([new Limit(), new Offset()]), `Array of query strings generated using the Query class provided by the SDK. [Learn more about queries](https://appconda.io/docs/queries). Only supported methods are limit and offset`, true)
    .inject('response')
    .inject('dbForProject')
    .inject('locale')
    .inject('geodb')
    .action(async ({ databaseId, collectionId, documentId, queries, response, dbForProject, locale, geodb }: { databaseId: string, collectionId: string, documentId: string, queries: any[], response: Response, dbForProject: Database, locale: Locale, geodb: any }) => {

        const database = await Authorization.skip(() => dbForProject.getDocument('databases', databaseId));

        if (database.isEmpty()) {
            throw new Exception(Exception.DATABASE_NOT_FOUND);
        }

        const collection = await dbForProject.getDocument('database_' + database.getInternalId(), collectionId);

        if (collection.isEmpty()) {
            throw new Exception(Exception.COLLECTION_NOT_FOUND);
        }

        const document = await dbForProject.getDocument('database_' + database.getInternalId() + '_collection_' + collection.getInternalId(), documentId);

        if (document.isEmpty()) {
            throw new Exception(Exception.DOCUMENT_NOT_FOUND);
        }

        try {
            queries = Query.parseQueries(queries);
        } catch (e) {
            if (e instanceof QueryException) {
                throw new Exception(Exception.GENERAL_QUERY_INVALID, e.message);
            }
            throw e;
        }

        const grouped = Query.groupByType(queries);
        const limit = grouped['limit'] ?? APP_LIMIT_COUNT;
        const offset = grouped['offset'] ?? 0;

        const audit = new Audit(dbForProject);
        const resource = `database/${databaseId}/collection/${collectionId}/document/${document.getId()}`;
        const logs = await audit.getLogsByResource(resource, limit, offset);

        const output = [];

        for (const log of logs) {
            const userAgent = log['userAgent'] || 'UNKNOWN';

            const detector = new Detector(userAgent);
            detector.skipBotDetection();

            const os = detector.getOS();
            const client = detector.getClient();
            const device = detector.getDevice();

            const logDocument = new Document({
                event: log['event'],
                userId: log['data']['userId'],
                userEmail: log['data']['userEmail'] || null,
                userName: log['data']['userName'] || null,
                mode: log['data']['mode'] || null,
                ip: log['ip'],
                time: log['time'],
                osCode: os['osCode'],
                osName: os['osName'],
                osVersion: os['osVersion'],
                clientType: client['clientType'],
                clientCode: client['clientCode'],
                clientName: client['clientName'],
                clientVersion: client['clientVersion'],
                clientEngine: client['clientEngine'],
                clientEngineVersion: client['clientEngineVersion'],
                deviceName: device['deviceName'],
                deviceBrand: device['deviceBrand'],
                deviceModel: device['deviceModel']
            });

            const record = geodb.get(log['ip']);

            if (record) {
                logDocument.setAttribute('countryCode', locale.getText('countries.' + record['country']['iso_code'].toLowerCase(), false) ? record['country']['iso_code'].toLowerCase() : '--');
                logDocument.setAttribute('countryName', locale.getText('countries.' + record['country']['iso_code'].toLowerCase(), locale.getText('locale.country.unknown')));
            } else {
                logDocument.setAttribute('countryCode', '--');
                logDocument.setAttribute('countryName', locale.getText('locale.country.unknown'));
            }

            output.push(logDocument);
        }

        response.dynamic(new Document({
            total: audit.countLogsByResource(resource),
            logs: output,
        }), Response.MODEL_LOG_LIST);
    });

App.patch('/v1/databases/:databaseId/collections/:collectionId/documents/:documentId')
    //.alias('/v1/database/collections/:collectionId/documents/:documentId', { databaseId: 'default' })
    .desc('Update document')
    .groups(['api', 'database'])
    .label('event', 'databases.[databaseId].collections.[collectionId].documents.[documentId].update')
    .label('scope', 'documents.write')
    .label('audits.event', 'document.update')
    .label('audits.resource', 'database/{request.databaseId}/collection/{request.collectionId}/document/{response.$id}')
    .label('abuse-key', 'ip:{ip},method:{method},url:{url},userId:{userId}')
    .label('abuse-limit', APP_LIMIT_WRITE_RATE_DEFAULT * 2)
    .label('abuse-time', APP_LIMIT_WRITE_RATE_PERIOD_DEFAULT)
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'updateDocument')
    .label('sdk.description', '/docs/references/databases/update-document.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_DOCUMENT)
    .label('sdk.offline.model', '/databases/{databaseId}/collections/{collectionId}/documents')
    .label('sdk.offline.key', '{documentId}')
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID.')
    .param('documentId', '', new UID(), 'Document ID.')
    .param('data', [], new JSONValidator(), 'Document data as JSON object. Include only attribute and value pairs to be updated.', true)
    .param('permissions', null, new Permissions(APP_LIMIT_ARRAY_PARAMS_SIZE, [Database.PERMISSION_READ, Database.PERMISSION_UPDATE, Database.PERMISSION_DELETE, Database.PERMISSION_WRITE]), 'An array of permissions strings. By default, the current permissions are inherited. [Learn more about permissions](https://appconda.io/docs/permissions).', true)
    .inject('requestTimestamp')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .inject('mode')
    .action(async ({ databaseId, collectionId, documentId, data, permissions, requestTimestamp, response, dbForProject, queueForEvents, mode }: { databaseId: string, collectionId: string, documentId: string, data: string | Record<string, any>, permissions: string[] | null, requestTimestamp: Date | null, response: Response, dbForProject: Database, queueForEvents: Event, mode: string }) => {

        data = (typeof data === 'string') ? JSON.parse(data) : data;

        if (Object.keys(data).length === 0 && permissions === null) {
            throw new Exception(Exception.DOCUMENT_MISSING_PAYLOAD);
        }

        const database = await Authorization.skip(() => dbForProject.getDocument('databases', databaseId));

        const isAPIKey = Auth.isAppUser(Authorization.getRoles());
        const isPrivilegedUser = Auth.isPrivilegedUser(Authorization.getRoles());

        if (database.isEmpty() || (!database.getAttribute('enabled', false) && !isAPIKey && !isPrivilegedUser)) {
            throw new Exception(Exception.DATABASE_NOT_FOUND);
        }

        const collection = await Authorization.skip(() => dbForProject.getDocument('database_' + database.getInternalId(), collectionId));

        if (collection.isEmpty() || (!collection.getAttribute('enabled', false) && !isAPIKey && !isPrivilegedUser)) {
            throw new Exception(Exception.COLLECTION_NOT_FOUND);
        }

        const document = await Authorization.skip(() => dbForProject.getDocument('database_' + database.getInternalId() + '_collection_' + collection.getInternalId(), documentId));

        if (document.isEmpty()) {
            throw new Exception(Exception.DOCUMENT_NOT_FOUND);
        }

        permissions = Permission.aggregate(permissions, [
            Database.PERMISSION_READ,
            Database.PERMISSION_UPDATE,
            Database.PERMISSION_DELETE,
        ]);

        const roles = Authorization.getRoles();
        if (!isAPIKey && !isPrivilegedUser && permissions !== null) {
            for (const type of Database.PERMISSIONS) {
                for (const permission of permissions) {
                    const parsedPermission = Permission.parse(permission);
                    if (parsedPermission.getPermission() !== type) {
                        continue;
                    }
                    const role = new Role(parsedPermission.getRole(), parsedPermission.getIdentifier(), parsedPermission.getDimension()).toString();
                    if (!Authorization.isRole(role)) {
                        throw new Exception(Exception.USER_UNAUTHORIZED, `Permissions must be one of: (${roles.join(', ')})`);
                    }
                }
            }
        }

        if (permissions === null) {
            permissions = document.getPermissions() ?? [];
        }

        data['$id'] = documentId;
        data['$permissions'] = permissions;
        const newDocument = new Document(data as Record<string, any>);

        const setCollection = async (collection: Document, document: Document) => {
            const relationships = collection.getAttribute('attributes', []).filter((attribute: any) => attribute.getAttribute('type') === Database.VAR_RELATIONSHIP);

            for (const relationship of relationships) {
                let related = document.getAttribute(relationship.getAttribute('key'));

                if (!related) {
                    continue;
                }

                const isList = Array.isArray(related) && Array.isArray(related);

                const relations = isList ? related : [related];

                const relatedCollectionId = relationship.getAttribute('relatedCollection');
                const relatedCollection = await Authorization.skip(() => dbForProject.getDocument('database_' + database.getInternalId(), relatedCollectionId));

                for (let relation of relations) {
                    if (Array.isArray(relation) && !relation['$id']) {
                        relation['$id'] = ID.unique();
                        relation = new Document(relation);
                    }
                    if (relation instanceof Document) {
                        const oldDocument = await Authorization.skip(() => dbForProject.getDocument('database_' + database.getInternalId() + '_collection_' + relatedCollection.getInternalId(), relation.getId()));
                        relation.removeAttribute('$collectionId');
                        relation.removeAttribute('$databaseId');
                        relation.setAttribute('$collection', 'database_' + database.getInternalId() + '_collection_' + relatedCollection.getInternalId());

                        if (oldDocument.isEmpty()) {
                            if (relation['$id'] === 'unique()') {
                                relation['$id'] = ID.unique();
                            }
                        }
                        await setCollection(relatedCollection, relation);
                    }
                }

                if (isList) {
                    document.setAttribute(relationship.getAttribute('key'), relations);
                } else {
                    document.setAttribute(relationship.getAttribute('key'), relations[0]);
                }
            }
        };

        await setCollection(collection, newDocument);

        try {
            const updatedDocument = await dbForProject.withRequestTimestamp(
                requestTimestamp,
                () => dbForProject.updateDocument(
                    'database_' + database.getInternalId() + '_collection_' + collection.getInternalId(),
                    document.getId(),
                    newDocument
                )
            );
        } catch (e) {
            if (e instanceof AuthorizationException) {
                throw new Exception(Exception.USER_UNAUTHORIZED);
            } else if (e instanceof Duplicate) {
                throw new Exception(Exception.DOCUMENT_ALREADY_EXISTS);
            } else if (e instanceof StructureException) {
                throw new Exception(Exception.DOCUMENT_INVALID_STRUCTURE, e.message);
            }
            throw e;
        }

        const processDocument = async (collection: Document, document: Document) => {
            document.setAttribute('$databaseId', database.getId());
            document.setAttribute('$collectionId', collection.getId());

            const relationships = collection.getAttribute('attributes', []).filter((attribute: any) => attribute.getAttribute('type') === Database.VAR_RELATIONSHIP);

            for (const relationship of relationships) {
                let related = document.getAttribute(relationship.getAttribute('key'));

                if (!related) {
                    continue;
                }
                if (!Array.isArray(related)) {
                    related = [related];
                }

                const relatedCollectionId = relationship.getAttribute('relatedCollection');
                const relatedCollection = await Authorization.skip(() => dbForProject.getDocument('database_' + database.getInternalId(), relatedCollectionId));

                for (const relation of related) {
                    if (relation instanceof Document) {
                        await processDocument(relatedCollection, relation);
                    }
                }
            }
        };

        await processDocument(collection, document);

        response.dynamic(document, Response.MODEL_DOCUMENT);

        const relationships = collection.getAttribute('attributes', []).filter((attribute: any) => attribute.getAttribute('type') === Database.VAR_RELATIONSHIP).map((document: any) => document.getAttribute('key'));

        queueForEvents
            .setParam('databaseId', databaseId)
            .setParam('collectionId', collection.getId())
            .setParam('documentId', document.getId())
            .setContext('collection', collection)
            .setContext('database', database)
            .setPayload(response.getPayload(), relationships);
    });

App.delete('/v1/databases/:databaseId/collections/:collectionId/documents/:documentId')
    // .alias('/v1/database/collections/:collectionId/documents/:documentId', { databaseId: 'default' })
    .desc('Delete document')
    .groups(['api', 'database'])
    .label('scope', 'documents.write')
    .label('event', 'databases.[databaseId].collections.[collectionId].documents.[documentId].delete')
    .label('audits.event', 'document.delete')
    .label('audits.resource', 'database/{request.databaseId}/collection/{request.collectionId}/document/{request.documentId}')
    .label('abuse-key', 'ip:{ip},method:{method},url:{url},userId:{userId}')
    .label('abuse-limit', APP_LIMIT_WRITE_RATE_DEFAULT)
    .label('abuse-time', APP_LIMIT_WRITE_RATE_PERIOD_DEFAULT)
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'deleteDocument')
    .label('sdk.description', '/docs/references/databases/delete-document.md')
    .label('sdk.response.code', Response.STATUS_CODE_NOCONTENT)
    .label('sdk.response.model', Response.MODEL_NONE)
    .label('sdk.offline.model', '/databases/{databaseId}/collections/{collectionId}/documents')
    .label('sdk.offline.key', '{documentId}')
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('collectionId', '', new UID(), 'Collection ID. You can create a new collection using the Database service [server integration](https://appconda.io/docs/server/databases#databasesCreateCollection).')
    .param('documentId', '', new UID(), 'Document ID.')
    .inject('requestTimestamp')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForDeletes')
    .inject('queueForEvents')
    .inject('mode')
    .action(async ({ databaseId, collectionId, documentId, requestTimestamp, response, dbForProject, queueForDeletes, queueForEvents, mode }: { databaseId: string, collectionId: string, documentId: string, requestTimestamp: Date | null, response: Response, dbForProject: Database, queueForDeletes: Delete, queueForEvents: Event, mode: string }) => {
        const database = await Authorization.skip(() => dbForProject.getDocument('databases', databaseId));

        const isAPIKey = Auth.isAppUser(Authorization.getRoles());
        const isPrivilegedUser = Auth.isPrivilegedUser(Authorization.getRoles());

        if (database.isEmpty() || (!database.getAttribute('enabled', false) && !isAPIKey && !isPrivilegedUser)) {
            throw new Exception(Exception.DATABASE_NOT_FOUND);
        }

        const collection = await Authorization.skip(() => dbForProject.getDocument('database_' + database.getInternalId(), collectionId));

        if (collection.isEmpty() || (!collection.getAttribute('enabled', false) && !isAPIKey && !isPrivilegedUser)) {
            throw new Exception(Exception.COLLECTION_NOT_FOUND);
        }

        const document = await Authorization.skip(() => dbForProject.getDocument('database_' + database.getInternalId() + '_collection_' + collection.getInternalId(), documentId));

        if (document.isEmpty()) {
            throw new Exception(Exception.DOCUMENT_NOT_FOUND);
        }

        await dbForProject.withRequestTimestamp(requestTimestamp, async () => {
            await dbForProject.deleteDocument(
                'database_' + database.getInternalId() + '_collection_' + collection.getInternalId(),
                documentId
            );
        });

        const processDocument = async (collection: Document, document: Document) => {
            document.setAttribute('$databaseId', database.getId());
            document.setAttribute('$collectionId', collection.getId());

            const relationships = collection.getAttribute('attributes', []).filter((attribute: any) => attribute.getAttribute('type') === Database.VAR_RELATIONSHIP);

            for (const relationship of relationships) {
                let related = document.getAttribute(relationship.getAttribute('key'));

                if (!related) {
                    continue;
                }
                if (!Array.isArray(related)) {
                    related = [related];
                }

                const relatedCollectionId = relationship.getAttribute('relatedCollection');
                const relatedCollection = await Authorization.skip(() => dbForProject.getDocument('database_' + database.getInternalId(), relatedCollectionId));

                for (const relation of related) {
                    if (relation instanceof Document) {
                        await processDocument(relatedCollection, relation);
                    }
                }
            }
        };

        await processDocument(collection, document);

        const relationships = collection.getAttribute('attributes', []).filter((attribute: any) => attribute.getAttribute('type') === Database.VAR_RELATIONSHIP).map((document: any) => document.getAttribute('key'));

        queueForDeletes
            .setType(DELETE_TYPE_AUDIT)
            .setDocument(document);

        queueForEvents
            .setParam('databaseId', databaseId)
            .setParam('collectionId', collection.getId())
            .setParam('documentId', document.getId())
            .setContext('collection', collection)
            .setContext('database', database)
            .setPayload(response.output(document, Response.MODEL_DOCUMENT), relationships);

        response.noContent();
    });

App.get('/v1/databases/usage')
    .desc('Get databases usage stats')
    .groups(['api', 'database', 'usage'])
    .label('scope', 'collections.read')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'getUsage')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USAGE_DATABASES)
    .param('range', '30d', new WhiteList(['24h', '30d', '90d'], true), '`Date range.', true)
    .inject('response')
    .inject('dbForProject')
    .action(async ({ range, response, dbForProject }: { range: string, response: Response, dbForProject: Database }) => {

        const periods = Config.getParam('usage', []);
        const stats: Record<string, any> = {};
        const usage: Record<string, any> = {};
        const days = periods[range];
        const metrics = [
            METRIC_DATABASES,
            METRIC_COLLECTIONS,
            METRIC_DOCUMENTS,
        ];

        await Authorization.skip(async () => {
            for (const metric of metrics) {
                const result: Document = await dbForProject.findOne('stats', [
                    Query.equal('metric', [metric]),
                    Query.equal('period', ['inf'])
                ]) as Document;

                stats[metric] = { total: result?.getAttribute('value') ?? 0, data: {} };
                const limit = days['limit'];
                const period = days['period'];
                const results = await dbForProject.find('stats', [
                    Query.equal('metric', [metric]),
                    Query.equal('period', [period]),
                    Query.limit(limit),
                    Query.orderDesc('time'),
                ]);

                for (const result of results) {
                    stats[metric]['data'][result.getAttribute('time')] = {
                        value: result.getAttribute('value'),
                    };
                }
            }
        });

        const format = days['period'] === '1h' ? 'Y-m-d\\TH:00:00.000P' : 'Y-m-d\\T00:00:00.000P';

        for (const metric of metrics) {
            usage[metric] = { total: stats[metric]['total'], data: [] };
            let leap = Date.now() - (days['limit'] * days['factor']);
            while (leap < Date.now()) {
                leap += days['factor'];
                const formatDate = new Date(leap).toISOString().slice(0, -1);
                usage[metric]['data'].push({
                    value: stats[metric]['data'][formatDate]?.value ?? 0,
                    date: formatDate,
                });
            }
        }

        response.dynamic(new Document({
            range: range,
            databasesTotal: usage[metrics[0]]['total'],
            collectionsTotal: usage[metrics[1]]['total'],
            documentsTotal: usage[metrics[2]]['total'],
            databases: usage[metrics[0]]['data'],
            collections: usage[metrics[1]]['data'],
            documents: usage[metrics[2]]['data'],
        }), Response.MODEL_USAGE_DATABASES);
    });

    App.get('/v1/databases/:databaseId/usage')
    .desc('Get database usage stats')
    .groups(['api', 'database', 'usage'])
    .label('scope', 'collections.read')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'getDatabaseUsage')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USAGE_DATABASE)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('range', '30d', new WhiteList(['24h', '30d', '90d'], true), '`Date range.', true)
    .inject('response')
    .inject('dbForProject')
    .action(async ({ databaseId, range, response, dbForProject }: { databaseId: string, range: string, response: Response, dbForProject: Database }) => {

        const database = await dbForProject.getDocument('databases', databaseId);

        if (database.isEmpty()) {
            throw new Exception(Exception.DATABASE_NOT_FOUND);
        }

        const periods = Config.getParam('usage', []);
        const stats: Record<string, any> = {};
        const usage: Record<string, any> = {};
        const days = periods[range];
        const metrics = [
            METRIC_DATABASE_ID_COLLECTIONS.replace('{databaseInternalId}', database.getInternalId()),
            METRIC_DATABASE_ID_DOCUMENTS.replace('{databaseInternalId}', database.getInternalId()),
        ];

        await Authorization.skip(async () => {
            for (const metric of metrics) {
                const result: Document = await dbForProject.findOne('stats', [
                    Query.equal('metric', [metric]),
                    Query.equal('period', ['inf'])
                ]) as Document;

                stats[metric] = { total: result?.getAttribute('value') ?? 0, data: {} };
                const limit = days['limit'];
                const period = days['period'];
                const results = await dbForProject.find('stats', [
                    Query.equal('metric', [metric]),
                    Query.equal('period', [period]),
                    Query.limit(limit),
                    Query.orderDesc('time'),
                ]);

                for (const result of results) {
                    stats[metric]['data'][result.getAttribute('time')] = {
                        value: result.getAttribute('value'),
                    };
                }
            }
        });

        const format = days['period'] === '1h' ? 'Y-m-d\\TH:00:00.000P' : 'Y-m-d\\T00:00:00.000P';

        for (const metric of metrics) {
            usage[metric] = { total: stats[metric]['total'], data: [] };
            let leap = Date.now() - (days['limit'] * days['factor']);
            while (leap < Date.now()) {
                leap += days['factor'];
                const formatDate = new Date(leap).toISOString().slice(0, -1);
                usage[metric]['data'].push({
                    value: stats[metric]['data'][formatDate]?.value ?? 0,
                    date: formatDate,
                });
            }
        }

        response.dynamic(new Document({
            range: range,
            collectionsTotal: usage[metrics[0]]['total'],
            documentsTotal: usage[metrics[1]]['total'],
            collections: usage[metrics[0]]['data'],
            documents: usage[metrics[1]]['data'],
        }), Response.MODEL_USAGE_DATABASE);
    });

    App.get('/v1/databases/:databaseId/collections/:collectionId/usage')
    //.alias('/v1/database/:collectionId/usage', { databaseId: 'default' })
    .desc('Get collection usage stats')
    .groups(['api', 'database', 'usage'])
    .label('scope', 'collections.read')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'databases')
    .label('sdk.method', 'getCollectionUsage')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USAGE_COLLECTION)
    .param('databaseId', '', new UID(), 'Database ID.')
    .param('range', '30d', new WhiteList(['24h', '30d', '90d'], true), 'Date range.', true)
    .param('collectionId', '', new UID(), 'Collection ID.')
    .inject('response')
    .inject('dbForProject')
    .action(async ({ databaseId, range, collectionId, response, dbForProject }: { databaseId: string, range: string, collectionId: string, response: Response, dbForProject: Database }) => {

        const database = await dbForProject.getDocument('databases', databaseId);
        const collectionDocument = await dbForProject.getDocument('database_' + database.getInternalId(), collectionId);
        const collection = await dbForProject.getCollection('database_' + database.getInternalId() + '_collection_' + collectionDocument.getInternalId());

        if (collection.isEmpty()) {
            throw new Exception(Exception.COLLECTION_NOT_FOUND);
        }

        const periods = Config.getParam('usage', []);
        const stats: Record<string, any> = {};
        const usage: Record<string, any> = {};
        const days = periods[range];
        const metrics = [
            METRIC_DATABASE_ID_COLLECTION_ID_DOCUMENTS.replace('{databaseInternalId}', database.getInternalId()).replace('{collectionInternalId}', collectionDocument.getInternalId()),
        ];

        await Authorization.skip(async () => {
            for (const metric of metrics) {
                const result: Document = await dbForProject.findOne('stats', [
                    Query.equal('metric', [metric]),
                    Query.equal('period', ['inf'])
                ]) as Document;

                stats[metric] = { total: result?.getAttribute('value') ?? 0, data: {} };
                const limit = days['limit'];
                const period = days['period'];
                const results = await dbForProject.find('stats', [
                    Query.equal('metric', [metric]),
                    Query.equal('period', [period]),
                    Query.limit(limit),
                    Query.orderDesc('time'),
                ]);

                for (const result of results) {
                    stats[metric]['data'][result.getAttribute('time')] = {
                        value: result.getAttribute('value'),
                    };
                }
            }
        });

        const format = days['period'] === '1h' ? 'Y-m-d\\TH:00:00.000P' : 'Y-m-d\\T00:00:00.000P';

        for (const metric of metrics) {
            usage[metric] = { total: stats[metric]['total'], data: [] };
            let leap = Date.now() - (days['limit'] * days['factor']);
            while (leap < Date.now()) {
                leap += days['factor'];
                const formatDate = new Date(leap).toISOString().slice(0, -1);
                usage[metric]['data'].push({
                    value: stats[metric]['data'][formatDate]?.value ?? 0,
                    date: formatDate,
                });
            }
        }

        response.dynamic(new Document({
            range: range,
            documentsTotal: usage[metrics[0]]['total'],
            documents: usage[metrics[0]]['data'],
        }), Response.MODEL_USAGE_COLLECTION);
    });