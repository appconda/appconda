import {
    ArrayList, Authorization, Boolean as BooleanValidator, Document, HexColor, Hostname, ID, Integer,
    Multiple, Permission, Range, Role, Text, URLValidator, WhiteList
} from "../../../Tuval/Core";
import { App } from "../../../Tuval/Http";
import { AppcondaException as Exception } from "../../../Appconda/Extend/Exception";
import { APP_AUTH_TYPE_ADMIN, APP_AUTH_TYPE_JWT, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_SESSION, APP_EMAIL_TEAM, APP_LIMIT_ANTIVIRUS, APP_LIMIT_ARRAY_ELEMENT_SIZE, APP_LIMIT_ARRAY_PARAMS_SIZE, APP_LIMIT_COUNT, APP_LIMIT_USER_PASSWORD_HISTORY, APP_LIMIT_USER_SESSIONS_DEFAULT, APP_LIMIT_USER_SESSIONS_MAX, APP_LIMIT_USERS, APP_LIMIT_WRITE_RATE_DEFAULT, APP_LIMIT_WRITE_RATE_PERIOD_DEFAULT, APP_NAME, APP_STORAGE_READ_BUFFER, APP_VERSION_STABLE, DELETE_TYPE_CACHE_BY_RESOURCE, DELETE_TYPE_DOCUMENT, MAX_OUTPUT_CHUNK_SIZE, METRIC_FILES, METRIC_BUCKETS, METRIC_FILES_STORAGE, METRIC_BUCKET_ID_FILES, METRIC_BUCKET_ID_FILES_STORAGE } from "../../init";
import { Response } from "../../../Appconda/Tuval/Response";
import { ProjectId } from "../../../Appconda/Database/Validators/ProjectId";
import { Database, Datetime, Duplicate, Query, QueryException, UID } from "../../../Tuval/Database";
import { Config } from "../../../Tuval/Config";
import { Connection, Group } from "../../../Tuval/Pools";
import { Hooks } from "../../../Appconda/Hooks/Hooks";
import { Auth } from "../../../Tuval/Auth";
import { DSN } from "../../../Tuval/DSN";
import { Cache } from "../../../Tuval/Cache";
import { Audit } from "../../../Tuval/Audit";
import { TimeLimit } from "../../../Tuval/Abuse/Adapters/Database/TimeLimit";
import { Projects } from "../../../Appconda/Database/Validators/Queries/Projects";
import { PublicDomain } from "../../../Tuval/Domains";
import { randomBytes, createCipheriv, createDecipheriv, CipherGCMTypes, createHash } from 'crypto';
import { Delete } from "../../../Appconda/Event/Delete";
import { Origin } from "../../../Appconda/Network/Validators/Origin";
import { Email } from "../../../Appconda/Network/Validators/Email";
import { Template } from "../../../Appconda/Template/Template";
import path from "path";
import { Mail } from "../../../Appconda/Event/Mail";
import { Locale } from "../../../Tuval/Locale";
import { CustomId } from "../../../Appconda/Database/Validators/CustomId";
import { Permissions } from "../../../Tuval/Database/Validators/Permissions";
import { Compression, Device, Storage } from "../../../Tuval/Storage";
import { Event } from "../../../Appconda/Event/Event";
import { Buckets } from "../../../Appconda/Database/Validators/Queries/Buckets";
import { File } from "../../../Tuval/Storage/Validator/File";
import { Request } from "../../../Appconda/Tuval/Request";
import { FileExt } from "../../../Tuval/Storage/Validator/FileExt";
import { FileSize } from "../../../Tuval/Storage/Validator/FileSize";
import { Upload } from "../../../Tuval/Storage/Validator/Upload";
import { Network } from "../../../Tuval/Clamav/Network";
import { Zstd } from "../../../Tuval/Storage/Compression/Algorithms/Zstd";
import GZIP from "../../../Tuval/Storage/Compression/Algorithms/GZIP";
import { OpenSSL } from "../../../Appconda/OpenSSL/OpenSSL";
import { Files } from "../../../Appconda/Database/Validators/Queries/Files";
import { Image } from "../../../Tuval/Image/Image";
import { JWT } from "../../../Appconda/JWT/JWT";

function empty(value: any): boolean {
    // Falsy değerleri kontrol et: null, undefined, 0, boş string, false
    if (value === null || value === undefined) {
        return true;
    }

    // Sayılar için 0 kontrolü
    if (typeof value === "number" && value === 0) {
        return true;
    }

    // String'ler için boş string kontrolü
    if (typeof value === "string" && value.trim() === "") {
        return true;
    }

    // Array ve Map gibi yapılar için uzunluk kontrolü
    if (Array.isArray(value) || value instanceof Map || value instanceof Set) {
        return (value as any).size === 0 || (value as any).length === 0;
    }

    // Object için boş olup olmadığını kontrol et
    if (typeof value === "object") {
        return Object.keys(value).length === 0;
    }

    return false; // Yukarıdaki koşullar sağlanmazsa boş değil
}

App.post('/v1/storage/buckets')
    .desc('Create bucket')
    .groups(['api', 'storage'])
    .label('scope', 'buckets.write')
    .label('event', 'buckets.[bucketId].create')
    .label('audits.event', 'bucket.create')
    .label('audits.resource', 'bucket/{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'storage')
    .label('sdk.method', 'createBucket')
    .label('sdk.description', '/docs/references/storage/create-bucket.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_BUCKET)
    .param('bucketId', '', new CustomId(), 'Unique Id. Choose a custom ID or generate a random ID with `ID.unique()`. Valid chars are a-z, A-Z, 0-9, period, hyphen, and underscore. Can\'t start with a special char. Max length is 36 chars.')
    .param('name', '', new Text(128), 'Bucket name')
    .param('permissions', null, new Permissions(APP_LIMIT_ARRAY_PARAMS_SIZE), 'An array of permission strings. By default, no user is granted with any permissions. [Learn more about permissions](https://appconda.io/docs/permissions).', true)
    .param('fileSecurity', false, new BooleanValidator(true), 'Enables configuring permissions for individual file. A user needs one of file or bucket level permissions to access a file. [Learn more about permissions](https://appconda.io/docs/permissions).', true)
    .param('enabled', true, new BooleanValidator(true), 'Is bucket enabled? When set to \'disabled\', users cannot access the files in this bucket but Server SDKs with and API key can still access the bucket. No files are lost when this is toggled.', true)
    .param('maximumFileSize', (plan: any) => empty(plan.fileSize) ? parseInt(process.env._APP_STORAGE_LIMIT || '0') : plan.fileSize * 1000 * 1000, (plan: any) => new Range(1, empty(plan.fileSize) ? parseInt(process.env._APP_STORAGE_LIMIT || '0') : plan.fileSize * 1000 * 1000), 'Maximum file size allowed in bytes. Maximum allowed value is ' + Storage.human(process.env._APP_STORAGE_LIMIT as any || '0', 0) + '.', true, ['plan'])
    .param('allowedFileExtensions', [], new ArrayList(new Text(64), APP_LIMIT_ARRAY_PARAMS_SIZE), 'Allowed file extensions. Maximum of ' + APP_LIMIT_ARRAY_PARAMS_SIZE + ' extensions are allowed, each 64 characters long.', true)
    .param('compression', Compression.NONE, new WhiteList([Compression.NONE, Compression.GZIP, Compression.ZSTD]), 'Compression algorithm choosen for compression. Can be one of ' + Compression.NONE + ',  [' + Compression.GZIP + '](https://en.wikipedia.org/wiki/Gzip), or [' + Compression.ZSTD + '](https://en.wikipedia.org/wiki/Zstd), For file size above ' + Storage.human(APP_STORAGE_READ_BUFFER, 0) + ' compression is skipped even if it\'s enabled', true)
    .param('encryption', true, new BooleanValidator(true), 'Is encryption enabled? For file size above ' + Storage.human(APP_STORAGE_READ_BUFFER, 0) + ' encryption is skipped even if it\'s enabled', true)
    .param('antivirus', true, new BooleanValidator(true), 'Is virus scanning enabled? For file size above ' + Storage.human(APP_LIMIT_ANTIVIRUS, 0) + ' AntiVirus scanning is skipped even if it\'s enabled', true)
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async ({ bucketId, name, permissions, fileSecurity, enabled, maximumFileSize, allowedFileExtensions, compression, encryption, antivirus, response, dbForProject, queueForEvents }: { bucketId: string, name: string, permissions: string[] | null, fileSecurity: boolean, enabled: boolean, maximumFileSize: number, allowedFileExtensions: string[], compression: string, encryption: boolean, antivirus: boolean, response: Response, dbForProject: Database, queueForEvents: Event }) => {

        bucketId = bucketId === 'unique()' ? ID.unique() : bucketId;

        // Map aggregate permissions into the multiple permissions they represent.
        permissions = Permission.aggregate(permissions);

        let bucket: Document;
        try {
            const files = (Config.getParam('collections', {})['buckets'] ?? {})['files'] ?? [];
            if (empty(files)) {
                throw new Exception(Exception.GENERAL_SERVER_ERROR, 'Files collection is not configured.');
            }

            const attributes: Document[] = [];
            const indexes: Document[] = [];

            for (const attribute of files['attributes']) {
                attributes.push(new Document({
                    $id: attribute['$id'],
                    type: attribute['type'],
                    size: attribute['size'],
                    required: attribute['required'],
                    signed: attribute['signed'],
                    array: attribute['array'],
                    filters: attribute['filters'],
                    default: attribute['default'] ?? null,
                    format: attribute['format'] ?? ''
                }));
            }

            for (const index of files['indexes']) {
                indexes.push(new Document({
                    $id: index['$id'],
                    type: index['type'],
                    attributes: index['attributes'],
                    lengths: index['lengths'],
                    orders: index['orders'],
                }));
            }

            await dbForProject.createDocument('buckets', new Document({
                $id: bucketId,
                $collection: 'buckets',
                $permissions: permissions,
                name: name,
                maximumFileSize: maximumFileSize,
                allowedFileExtensions: allowedFileExtensions,
                fileSecurity: fileSecurity,
                enabled: enabled,
                compression: compression,
                encryption: encryption,
                antivirus: antivirus,
                search: [bucketId, name].join(' '),
            }));

            bucket = await dbForProject.getDocument('buckets', bucketId);

            await dbForProject.createCollection('bucket_' + bucket.getInternalId(), attributes, indexes, permissions ?? [], fileSecurity);
        } catch (error) {
            if (error instanceof Duplicate) {
                throw new Exception(Exception.STORAGE_BUCKET_ALREADY_EXISTS);
            }
            throw error;
        }

        queueForEvents.setParam('bucketId', bucket.getId());

        response
            .setStatusCode(Response.STATUS_CODE_CREATED)
            .dynamic(bucket, Response.MODEL_BUCKET);
    });

App.get('/v1/storage/buckets')
    .desc('List buckets')
    .groups(['api', 'storage'])
    .label('scope', 'buckets.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'storage')
    .label('sdk.method', 'listBuckets')
    .label('sdk.description', '/docs/references/storage/list-buckets.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_BUCKET_LIST)
    .param('queries', [], new Buckets(), 'Array of query strings generated using the Query class provided by the SDK. [Learn more about queries](https://appconda.io/docs/queries). Maximum of ' + APP_LIMIT_ARRAY_PARAMS_SIZE + ' queries are allowed, each ' + APP_LIMIT_ARRAY_ELEMENT_SIZE + ' characters long. You may filter on the following attributes: ' + Buckets.ALLOWED_ATTRIBUTES.join(', '), true)
    .param('search', '', new Text(256), 'Search term to filter your list results. Max length: 256 chars.', true)
    .inject('response')
    .inject('dbForProject')
    .action(async ({ queries, search, response, dbForProject }: { queries: string[], search: string, response: Response, dbForProject: Database }) => {
        let _queries: Query[] = [];
        try {
            _queries = Query.parseQueries(queries);
        } catch (e) {
            if (e instanceof QueryException) {
                throw new Exception(Exception.GENERAL_QUERY_INVALID, e.message);
            }
            throw e;
        }

        if (search) {
            _queries.push(Query.search('search', search));
        }

        // Get cursor document if there was a cursor query
        let cursor = _queries.find(query => [Query.TYPE_CURSOR_AFTER, Query.TYPE_CURSOR_BEFORE].includes(query.getMethod()));
        if (cursor) {
            const bucketId = cursor.getValue();
            const cursorDocument = await dbForProject.getDocument('buckets', bucketId);

            if (cursorDocument.isEmpty()) {
                throw new Exception(Exception.GENERAL_CURSOR_NOT_FOUND, `Bucket '${bucketId}' for the 'cursor' value not found.`);
            }

            cursor.setValue(cursorDocument);
        }

        const filterQueries = Query.groupByType(_queries)['filters'];

        response.dynamic(new Document({
            buckets: await dbForProject.find('buckets', _queries),
            total: await dbForProject.count('buckets', filterQueries, APP_LIMIT_COUNT),
        }), Response.MODEL_BUCKET_LIST);
    });

App.get('/v1/storage/buckets/:bucketId')
    .desc('Get bucket')
    .groups(['api', 'storage'])
    .label('scope', 'buckets.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'storage')
    .label('sdk.method', 'getBucket')
    .label('sdk.description', '/docs/references/storage/get-bucket.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_BUCKET)
    .param('bucketId', '', new UID(), 'Bucket unique ID.')
    .inject('response')
    .inject('dbForProject')
    .action(async ({ bucketId, response, dbForProject }: { bucketId: string, response: Response, dbForProject: Database }) => {

        const bucket = await dbForProject.getDocument('buckets', bucketId);

        if (bucket.isEmpty()) {
            throw new Exception(Exception.STORAGE_BUCKET_NOT_FOUND);
        }

        response.dynamic(bucket, Response.MODEL_BUCKET);
    });

App.put('/v1/storage/buckets/:bucketId')
    .desc('Update bucket')
    .groups(['api', 'storage'])
    .label('scope', 'buckets.write')
    .label('event', 'buckets.[bucketId].update')
    .label('audits.event', 'bucket.update')
    .label('audits.resource', 'bucket/{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'storage')
    .label('sdk.method', 'updateBucket')
    .label('sdk.description', '/docs/references/storage/update-bucket.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_BUCKET)
    .param('bucketId', '', new UID(), 'Bucket unique ID.')
    .param('name', null, new Text(128), 'Bucket name', false)
    .param('permissions', null, new Permissions(APP_LIMIT_ARRAY_PARAMS_SIZE), 'An array of permission strings. By default, the current permissions are inherited. [Learn more about permissions](https://appconda.io/docs/permissions).', true)
    .param('fileSecurity', false, new BooleanValidator(true), 'Enables configuring permissions for individual file. A user needs one of file or bucket level permissions to access a file. [Learn more about permissions](https://appconda.io/docs/permissions).', true)
    .param('enabled', true, new BooleanValidator(true), 'Is bucket enabled? When set to \'disabled\', users cannot access the files in this bucket but Server SDKs with and API key can still access the bucket. No files are lost when this is toggled.', true)
    .param('maximumFileSize', (plan: any) => empty(plan.fileSize) ? parseInt(process.env._APP_STORAGE_LIMIT || '0') : plan.fileSize * 1000 * 1000, (plan: any) => new Range(1, empty(plan.fileSize) ? parseInt(process.env._APP_STORAGE_LIMIT || '0') : plan.fileSize * 1000 * 1000), 'Maximum file size allowed in bytes. Maximum allowed value is ' + Storage.human(process.env._APP_STORAGE_LIMIT as any || '0', 0) + '.', true, ['plan'])
    .param('allowedFileExtensions', [], new ArrayList(new Text(64), APP_LIMIT_ARRAY_PARAMS_SIZE), 'Allowed file extensions. Maximum of ' + APP_LIMIT_ARRAY_PARAMS_SIZE + ' extensions are allowed, each 64 characters long.', true)
    .param('compression', Compression.NONE, new WhiteList([Compression.NONE, Compression.GZIP, Compression.ZSTD]), 'Compression algorithm choosen for compression. Can be one of ' + Compression.NONE + ', [' + Compression.GZIP + '](https://en.wikipedia.org/wiki/Gzip), or [' + Compression.ZSTD + '](https://en.wikipedia.org/wiki/Zstd), For file size above ' + Storage.human(APP_STORAGE_READ_BUFFER, 0) + ' compression is skipped even if it\'s enabled', true)
    .param('encryption', true, new BooleanValidator(true), 'Is encryption enabled? For file size above ' + Storage.human(APP_STORAGE_READ_BUFFER, 0) + ' encryption is skipped even if it\'s enabled', true)
    .param('antivirus', true, new BooleanValidator(true), 'Is virus scanning enabled? For file size above ' + Storage.human(APP_LIMIT_ANTIVIRUS, 0) + ' AntiVirus scanning is skipped even if it\'s enabled', true)
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async ({ bucketId, name, permissions, fileSecurity, enabled, maximumFileSize, allowedFileExtensions, compression, encryption, antivirus, response, dbForProject, queueForEvents }: { bucketId: string, name: string, permissions: string[] | null, fileSecurity: boolean, enabled: boolean, maximumFileSize: number | null, allowedFileExtensions: string[], compression: string, encryption: boolean, antivirus: boolean, response: Response, dbForProject: Database, queueForEvents: Event }) => {
        const bucket = await dbForProject.getDocument('buckets', bucketId);

        if (bucket.isEmpty()) {
            throw new Exception(Exception.STORAGE_BUCKET_NOT_FOUND);
        }

        permissions = permissions ?? bucket.getPermissions();
        maximumFileSize = maximumFileSize ?? bucket.getAttribute('maximumFileSize', parseInt(process.env._APP_STORAGE_LIMIT || '0'));
        allowedFileExtensions = allowedFileExtensions ?? bucket.getAttribute('allowedFileExtensions', []);
        enabled = enabled ?? bucket.getAttribute('enabled', true);
        encryption = encryption ?? bucket.getAttribute('encryption', true);
        antivirus = antivirus ?? bucket.getAttribute('antivirus', true);

        // Map aggregate permissions into the multiple permissions they represent.
        permissions = Permission.aggregate(permissions);

        const updatedBucket = await dbForProject.updateDocument('buckets', bucket.getId(), bucket
            .setAttribute('name', name)
            .setAttribute('$permissions', permissions)
            .setAttribute('maximumFileSize', maximumFileSize)
            .setAttribute('allowedFileExtensions', allowedFileExtensions)
            .setAttribute('fileSecurity', fileSecurity)
            .setAttribute('enabled', enabled)
            .setAttribute('encryption', encryption)
            .setAttribute('compression', compression)
            .setAttribute('antivirus', antivirus));

        await dbForProject.updateCollection('bucket_' + bucket.getInternalId(), permissions, fileSecurity);

        queueForEvents.setParam('bucketId', bucket.getId());

        response.dynamic(updatedBucket, Response.MODEL_BUCKET);
    });

App.delete('/v1/storage/buckets/:bucketId')
    .desc('Delete bucket')
    .groups(['api', 'storage'])
    .label('scope', 'buckets.write')
    .label('audits.event', 'bucket.delete')
    .label('event', 'buckets.[bucketId].delete')
    .label('audits.resource', 'bucket/{request.bucketId}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'storage')
    .label('sdk.method', 'deleteBucket')
    .label('sdk.description', '/docs/references/storage/delete-bucket.md')
    .label('sdk.response.code', Response.STATUS_CODE_NOCONTENT)
    .label('sdk.response.model', Response.MODEL_NONE)
    .param('bucketId', '', new UID(), 'Bucket unique ID.')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForDeletes')
    .inject('queueForEvents')
    .action(async ({ bucketId, response, dbForProject, queueForDeletes, queueForEvents }: { bucketId: string, response: Response, dbForProject: Database, queueForDeletes: Delete, queueForEvents: Event }) => {
        const bucket = await dbForProject.getDocument('buckets', bucketId);

        if (bucket.isEmpty()) {
            throw new Exception(Exception.STORAGE_BUCKET_NOT_FOUND);
        }

        const deleteSuccess = await dbForProject.deleteDocument('buckets', bucketId);
        if (!deleteSuccess) {
            throw new Exception(Exception.GENERAL_SERVER_ERROR, 'Failed to remove bucket from DB');
        }

        queueForDeletes
            .setType(DELETE_TYPE_DOCUMENT)
            .setDocument(bucket);

        queueForEvents
            .setParam('bucketId', bucket.getId())
            .setPayload(response.output(bucket, Response.MODEL_BUCKET));

        response.noContent();
    });

App.post('/v1/storage/buckets/:bucketId/files')
    //.alias('/v1/storage/files', { bucketId: 'default' })
    .desc('Create file')
    .groups(['api', 'storage'])
    .label('scope', 'files.write')
    .label('audits.event', 'file.create')
    .label('event', 'buckets.[bucketId].files.[fileId].create')
    .label('audits.resource', 'file/{response.$id}')
    .label('abuse-key', 'ip:{ip},method:{method},url:{url},userId:{userId},chunkId:{chunkId}')
    .label('abuse-limit', APP_LIMIT_WRITE_RATE_DEFAULT)
    .label('abuse-time', APP_LIMIT_WRITE_RATE_PERIOD_DEFAULT)
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'storage')
    .label('sdk.method', 'createFile')
    .label('sdk.description', '/docs/references/storage/create-file.md')
    .label('sdk.request.type', 'multipart/form-data')
    .label('sdk.methodType', 'upload')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_FILE)
    .param('bucketId', '', new UID(), 'Storage bucket unique ID. You can create a new storage bucket using the Storage service [server integration](https://appconda.io/docs/server/storage#createBucket).')
    .param('fileId', '', new CustomId(), 'File ID. Choose a custom ID or generate a random ID with `ID.unique()`. Valid chars are a-z, A-Z, 0-9, period, hyphen, and underscore. Can\'t start with a special char. Max length is 36 chars.')
    .param('file', [], new File(), 'Binary file. Appconda SDKs provide helpers to handle file input. [Learn about file input](https://appconda.io/docs/products/storage/upload-download#input-file).', true)
    .param('permissions', null, new Permissions(APP_LIMIT_ARRAY_PARAMS_SIZE, [Database.PERMISSION_READ, Database.PERMISSION_UPDATE, Database.PERMISSION_DELETE, Database.PERMISSION_WRITE]), 'An array of permission strings. By default, only the current user is granted all permissions. [Learn more about permissions](https://appconda.io/docs/permissions).', true)
    .inject('request')
    .inject('response')
    .inject('dbForProject')
    .inject('user')
    .inject('queueForEvents')
    .inject('mode')
    .inject('deviceForFiles')
    .inject('deviceForLocal')
    .action(async ({ bucketId, fileId, file, permissions, request, response, dbForProject, user, queueForEvents, mode, deviceForFiles, deviceForLocal }: { bucketId: string, fileId: string, file: any, permissions: string[] | null, request: Request, response: Response, dbForProject: Database, user: Document, queueForEvents: Event, mode: string, deviceForFiles: Device, deviceForLocal: Device }) => {

        const bucket = await Authorization.skip(() => dbForProject.getDocument('buckets', bucketId));

        const isAPIKey = Auth.isAppUser(Authorization.getRoles());
        const isPrivilegedUser = Auth.isPrivilegedUser(Authorization.getRoles());

        if (bucket.isEmpty() || (!bucket.getAttribute('enabled') && !isAPIKey && !isPrivilegedUser)) {
            throw new Exception(Exception.STORAGE_BUCKET_NOT_FOUND);
        }

        const validator = new Authorization(Database.PERMISSION_CREATE);
        if (!validator.isValid(bucket.getCreate())) {
            throw new Exception(Exception.USER_UNAUTHORIZED);
        }

        const allowedPermissions = [
            Database.PERMISSION_READ,
            Database.PERMISSION_UPDATE,
            Database.PERMISSION_DELETE,
        ];

        // Map aggregate permissions to into the set of individual permissions they represent.
        permissions = Permission.aggregate(permissions, allowedPermissions);

        // Add permissions for current the user if none were provided.
        if (permissions === null) {
            permissions = [];
            if (user.getId()) {
                for (const permission of allowedPermissions) {
                    permissions.push(new Permission(permission, 'user', user.getId()).toString());
                }
            }
        }

        // Users can only manage their own roles, API keys and Admin users can manage any
        const roles = Authorization.getRoles();
        if (!Auth.isAppUser(roles) && !Auth.isPrivilegedUser(roles)) {
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
                        throw new Exception(Exception.USER_UNAUTHORIZED, 'Permissions must be one of: (' + roles.join(', ') + ')');
                    }
                }
            }
        }

        const maximumFileSize = bucket.getAttribute('maximumFileSize', 0);
        if (maximumFileSize > parseInt(process.env._APP_STORAGE_LIMIT || '0')) {
            throw new Exception(Exception.GENERAL_SERVER_ERROR, 'Maximum bucket file size is larger than _APP_STORAGE_LIMIT');
        }

        let fileData = request.getFiles('file');

        // GraphQL multipart spec adds files with index keys
        if (!fileData) {
            fileData = request.getFiles('0');
        }

        if (!fileData) {
            throw new Exception(Exception.STORAGE_FILE_EMPTY);
        }

        // Make sure we handle a single file and multiple files the same way
        const fileName = Array.isArray(fileData['name']) && fileData['name'][0] ? fileData['name'][0] : fileData['name'];
        const fileTmpName = Array.isArray(fileData['tmp_name']) && fileData['tmp_name'][0] ? fileData['tmp_name'][0] : fileData['tmp_name'];
        let fileSize = Array.isArray(fileData['size']) && fileData['size'][0] ? fileData['size'][0] : fileData['size'];

        const contentRange = request.getHeader('content-range');
        fileId = fileId === 'unique()' ? ID.unique() : fileId;
        let chunk = 1;
        let chunks = 1;

        if (contentRange) {
            const start = request.getContentRangeStart();
            const end = request.getContentRangeEnd();
            fileSize = request.getContentRangeSize();
            fileId = request.getHeader('x-appconda-id', fileId);
            // TODO make `end >= fileSize` in next breaking version
            if (start === null || end === null || fileSize === null || end > fileSize) {
                throw new Exception(Exception.STORAGE_INVALID_CONTENT_RANGE);
            }

            const idValidator = new UID();
            if (!idValidator.isValid(fileId)) {
                throw new Exception(Exception.STORAGE_INVALID_APPWRITE_ID);
            }

            // TODO remove the condition that checks `end === fileSize` in next breaking version
            if (end === fileSize - 1 || end === fileSize) {
                //if it's a last chunks the chunk size might differ, so we set the chunks and chunk to -1 notify it's last chunk
                chunks = chunk = -1;
            } else {
                // Calculate total number of chunks based on the chunk size i.e (rangeEnd - rangeStart)
                chunks = Math.ceil(fileSize / (end + 1 - start));
                chunk = Math.floor(start / (end + 1 - start)) + 1;
            }
        }

        /**
         * Validators
         */
        // Check if file type is allowed
        const allowedFileExtensions = bucket.getAttribute('allowedFileExtensions', []);
        const fileExt = new FileExt(allowedFileExtensions);
        if (allowedFileExtensions.length && !fileExt.isValid(fileName)) {
            throw new Exception(Exception.STORAGE_FILE_TYPE_UNSUPPORTED, 'File extension not allowed');
        }

        // Check if file size is exceeding allowed limit
        const fileSizeValidator = new FileSize(maximumFileSize);
        if (!fileSizeValidator.isValid(fileSize)) {
            throw new Exception(Exception.STORAGE_INVALID_FILE_SIZE, 'File size not allowed');
        }

        const upload = new Upload();
        if (!upload.isValid(fileTmpName)) {
            throw new Exception(Exception.STORAGE_INVALID_FILE);
        }

        // Save to storage
        fileSize = fileSize ?? deviceForLocal.getFileSize(fileTmpName);
        let _path = deviceForFiles.getPath(fileId + '.' + path.extname(fileName));
        _path = _path.replace(deviceForFiles.getRoot(), deviceForFiles.getRoot() + path.sep + bucket.getId()); // Add bucket id to path after root

        let _file: Document = await dbForProject.getDocument('bucket_' + bucket.getInternalId(), fileId);

        let metadata = { content_type: deviceForLocal.getFileMimeType(fileTmpName) };
        if (!_file.isEmpty()) {
            chunks = _file.getAttribute('chunksTotal', 1);
            const uploaded = _file.getAttribute('chunksUploaded', 0);
            metadata = _file.getAttribute('metadata', {});

            if (chunk === -1) {
                chunk = chunks;
            }

            if (uploaded === chunks) {
                throw new Exception(Exception.STORAGE_FILE_ALREADY_EXISTS);
            }
        }

        const chunksUploaded = await deviceForFiles.upload(fileTmpName, _path, chunk, chunks, metadata);

        if (!chunksUploaded) {
            throw new Exception(Exception.GENERAL_SERVER_ERROR, 'Failed uploading file');
        }

        if (chunksUploaded === chunks) {
            if (process.env._APP_STORAGE_ANTIVIRUS === 'enabled' && bucket.getAttribute('antivirus', true) && fileSize <= APP_LIMIT_ANTIVIRUS && deviceForFiles.getType() === Storage.DEVICE_LOCAL) {
                const antivirus = new Network(
                    process.env._APP_STORAGE_ANTIVIRUS_HOST || 'clamav',
                    parseInt(process.env._APP_STORAGE_ANTIVIRUS_PORT || '3310')
                );

                if (!antivirus.fileScan(_path)) {
                    deviceForFiles.delete(_path);
                    throw new Exception(Exception.STORAGE_INVALID_FILE);
                }
            }

            const mimeType = await deviceForFiles.getFileMimeType(_path); // Get mime-type before compression and encryption
            const fileHash = await deviceForFiles.getFileHash(_path); // Get file hash before compression and encryption
            let data = '';
            // Compression
            let algorithm = bucket.getAttribute('compression', Compression.NONE);
            if (fileSize <= APP_STORAGE_READ_BUFFER && algorithm !== Compression.NONE) {
                data = await deviceForFiles.read(_path) as any;
                let compressor;
                switch (algorithm) {
                    case Compression.ZSTD:
                        compressor = new Zstd();
                        break;
                    case Compression.GZIP:
                    default:
                        compressor = new GZIP();
                        break;
                }
                data = compressor.compress(data);
            } else {
                // reset the algorithm to none as we do not compress the file
                // if file size exceeds the APP_STORAGE_READ_BUFFER
                // regardless the bucket compression algorithm
                algorithm = Compression.NONE;
            }

            let openSSLVersion = null;
            let openSSLCipher = null;
            let openSSLTag = null;
            let openSSLIV = null;

            if (bucket.getAttribute('encryption', true) && fileSize <= APP_STORAGE_READ_BUFFER) {
                if (!data) {
                    data = deviceForFiles.read(_path) as any;
                }
                const key = process.env._APP_OPENSSL_KEY_V1;
                const iv = OpenSSL.randomPseudoBytes(OpenSSL.cipherIVLength(OpenSSL.CIPHER_AES_128_GCM, key));
                data = OpenSSL.encrypt(data, OpenSSL.CIPHER_AES_128_GCM, key as any, 0, iv, /* (tag) => {
                    openSSLTag = tag;
                } */);
                openSSLIV = iv;
            }

            if (data) {
                if (!deviceForFiles.write(_path, data as any, mimeType)) {
                    throw new Exception(Exception.GENERAL_SERVER_ERROR, 'Failed to save file');
                }
            }

            const sizeActual = deviceForFiles.getFileSize(_path);

            if (bucket.getAttribute('encryption', true) && fileSize <= APP_STORAGE_READ_BUFFER) {
                openSSLVersion = '1';
                openSSLCipher = OpenSSL.CIPHER_AES_128_GCM;
                openSSLTag = Buffer.from(openSSLTag).toString('hex');
                openSSLIV = Buffer.from(openSSLIV).toString('hex');
            }

            if (file.isEmpty()) {
                const doc = new Document({
                    $id: fileId,
                    $permissions: permissions,
                    bucketId: bucket.getId(),
                    bucketInternalId: bucket.getInternalId(),
                    name: fileName,
                    path: path,
                    signature: fileHash,
                    mimeType: mimeType,
                    sizeOriginal: fileSize,
                    sizeActual: sizeActual,
                    algorithm: algorithm,
                    comment: '',
                    chunksTotal: chunks,
                    chunksUploaded: chunksUploaded,
                    openSSLVersion: openSSLVersion,
                    openSSLCipher: openSSLCipher,
                    openSSLTag: openSSLTag,
                    openSSLIV: openSSLIV,
                    search: [fileId, fileName].join(' '),
                    metadata: metadata,
                });

                file = await dbForProject.createDocument('bucket_' + bucket.getInternalId(), doc);
            } else {
                file = file
                    .setAttribute('$permissions', permissions)
                    .setAttribute('signature', fileHash)
                    .setAttribute('mimeType', mimeType)
                    .setAttribute('sizeActual', sizeActual)
                    .setAttribute('algorithm', algorithm)
                    .setAttribute('openSSLVersion', openSSLVersion)
                    .setAttribute('openSSLCipher', openSSLCipher)
                    .setAttribute('openSSLTag', openSSLTag)
                    .setAttribute('openSSLIV', openSSLIV)
                    .setAttribute('metadata', metadata)
                    .setAttribute('chunksUploaded', chunksUploaded);

                /**
                 * Validate create permission and skip authorization in updateDocument
                 * Without this, the file creation will fail when user doesn't have update permission
                 * However as with chunk upload even if we are updating, we are essentially creating a file
                 * adding it's new chunk so we validate create permission instead of update
                 */
                const validator = new Authorization(Database.PERMISSION_CREATE);
                if (!validator.isValid(bucket.getCreate())) {
                    throw new Exception(Exception.USER_UNAUTHORIZED);
                }
                file = await Authorization.skip(() => dbForProject.updateDocument('bucket_' + bucket.getInternalId(), fileId, file));
            }
        } else {
            if (file.isEmpty()) {
                const doc = new Document({
                    $id: ID.custom(fileId),
                    $permissions: permissions,
                    bucketId: bucket.getId(),
                    bucketInternalId: bucket.getInternalId(),
                    name: fileName,
                    path: path,
                    signature: '',
                    mimeType: '',
                    sizeOriginal: fileSize,
                    sizeActual: 0,
                    algorithm: '',
                    comment: '',
                    chunksTotal: chunks,
                    chunksUploaded: chunksUploaded,
                    search: [fileId, fileName].join(' '),
                    metadata: metadata,
                });

                file = await dbForProject.createDocument('bucket_' + bucket.getInternalId(), doc);
            } else {
                file = file
                    .setAttribute('chunksUploaded', chunksUploaded)
                    .setAttribute('metadata', metadata);

                /**
                 * Validate create permission and skip authorization in updateDocument
                 * Without this, the file creation will fail when user doesn't have update permission
                 * However as with chunk upload even if we are updating, we are essentially creating a file
                 * adding it's new chunk so we validate create permission instead of update
                 */
                const validator = new Authorization(Database.PERMISSION_CREATE);
                if (!validator.isValid(bucket.getCreate())) {
                    throw new Exception(Exception.USER_UNAUTHORIZED);
                }
                file = await Authorization.skip(() => dbForProject.updateDocument('bucket_' + bucket.getInternalId(), fileId, file));
            }
        }

        queueForEvents
            .setParam('bucketId', bucket.getId())
            .setParam('fileId', file.getId())
            .setContext('bucket', bucket);

        metadata = null; // was causing leaks as it was passed by reference

        response
            .setStatusCode(Response.STATUS_CODE_CREATED)
            .dynamic(file, Response.MODEL_FILE);
    });

App.get('/v1/storage/buckets/:bucketId/files')
    // .alias('/v1/storage/files', { bucketId: 'default' })
    .desc('List files')
    .groups(['api', 'storage'])
    .label('scope', 'files.read')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'storage')
    .label('sdk.method', 'listFiles')
    .label('sdk.description', '/docs/references/storage/list-files.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_FILE_LIST)
    .param('bucketId', '', new UID(), 'Storage bucket unique ID. You can create a new storage bucket using the Storage service [server integration](https://appconda.io/docs/server/storage#createBucket).')
    .param('queries', [], new Files(), `Array of query strings generated using the Query class provided by the SDK. [Learn more about queries](https://appconda.io/docs/queries). Maximum of ${APP_LIMIT_ARRAY_PARAMS_SIZE} queries are allowed, each ${APP_LIMIT_ARRAY_ELEMENT_SIZE} characters long. You may filter on the following attributes: ${Files.ALLOWED_ATTRIBUTES.join(', ')}`, true)
    .param('search', '', new Text(256), 'Search term to filter your list results. Max length: 256 chars.', true)
    .inject('response')
    .inject('dbForProject')
    .inject('mode')
    .action(async ({ bucketId, queries, search, response, dbForProject, mode }: { bucketId: string, queries: any[], search: string, response: Response, dbForProject: Database, mode: string }) => {
        const bucket = await Authorization.skip(() => dbForProject.getDocument('buckets', bucketId));

        const isAPIKey = Auth.isAppUser(Authorization.getRoles());
        const isPrivilegedUser = Auth.isPrivilegedUser(Authorization.getRoles());

        if (bucket.isEmpty() || (!bucket.getAttribute('enabled') && !isAPIKey && !isPrivilegedUser)) {
            throw new Exception(Exception.STORAGE_BUCKET_NOT_FOUND);
        }

        const fileSecurity = bucket.getAttribute('fileSecurity', false);
        const validator = new Authorization(Database.PERMISSION_READ);
        const valid = validator.isValid(bucket.getRead());
        if (!fileSecurity && !valid) {
            throw new Exception(Exception.USER_UNAUTHORIZED);
        }

        try {
            queries = Query.parseQueries(queries);
        } catch (e) {
            throw new Exception(Exception.GENERAL_QUERY_INVALID, e.message);
        }

        if (search) {
            queries.push(Query.search('search', search));
        }

        const cursor = queries.find(query => [Query.TYPE_CURSOR_AFTER, Query.TYPE_CURSOR_BEFORE].includes(query.getMethod()));
        if (cursor) {
            const fileId = cursor.getValue();

            const cursorDocument = fileSecurity && !valid
                ? await dbForProject.getDocument('bucket_' + bucket.getInternalId(), fileId)
                : await Authorization.skip(() => dbForProject.getDocument('bucket_' + bucket.getInternalId(), fileId));

            if (cursorDocument.isEmpty()) {
                throw new Exception(Exception.GENERAL_CURSOR_NOT_FOUND, `File '${fileId}' for the 'cursor' value not found.`);
            }

            cursor.setValue(cursorDocument);
        }

        const filterQueries = Query.groupByType(queries)['filters'];

        const files = fileSecurity && !valid
            ? await dbForProject.find('bucket_' + bucket.getInternalId(), queries)
            : await Authorization.skip(() => dbForProject.find('bucket_' + bucket.getInternalId(), queries));

        const total = fileSecurity && !valid
            ? await dbForProject.count('bucket_' + bucket.getInternalId(), filterQueries, APP_LIMIT_COUNT)
            : await Authorization.skip(() => dbForProject.count('bucket_' + bucket.getInternalId(), filterQueries, APP_LIMIT_COUNT));

        response.dynamic(new Document({
            files: files,
            total: total,
        }), Response.MODEL_FILE_LIST);
    });

App.get('/v1/storage/buckets/:bucketId/files/:fileId')
    // .alias('/v1/storage/files/:fileId', { bucketId: 'default' })
    .desc('Get file')
    .groups(['api', 'storage'])
    .label('scope', 'files.read')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'storage')
    .label('sdk.method', 'getFile')
    .label('sdk.description', '/docs/references/storage/get-file.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_FILE)
    .param('bucketId', '', new UID(), 'Storage bucket unique ID. You can create a new storage bucket using the Storage service [server integration](https://appconda.io/docs/server/storage#createBucket).')
    .param('fileId', '', new UID(), 'File ID.')
    .inject('response')
    .inject('dbForProject')
    .inject('mode')
    .action(async ({ bucketId, fileId, response, dbForProject, mode }: { bucketId: string, fileId: string, response: Response, dbForProject: Database, mode: string }) => {
        const bucket = await Authorization.skip(() => dbForProject.getDocument('buckets', bucketId));

        const isAPIKey = Auth.isAppUser(Authorization.getRoles());
        const isPrivilegedUser = Auth.isPrivilegedUser(Authorization.getRoles());

        if (bucket.isEmpty() || (!bucket.getAttribute('enabled') && !isAPIKey && !isPrivilegedUser)) {
            throw new Exception(Exception.STORAGE_BUCKET_NOT_FOUND);
        }

        const fileSecurity = bucket.getAttribute('fileSecurity', false);
        const validator = new Authorization(Database.PERMISSION_READ);
        const valid = validator.isValid(bucket.getRead());
        if (!fileSecurity && !valid) {
            throw new Exception(Exception.USER_UNAUTHORIZED);
        }

        const file = fileSecurity && !valid
            ? await dbForProject.getDocument('bucket_' + bucket.getInternalId(), fileId)
            : await Authorization.skip(() => dbForProject.getDocument('bucket_' + bucket.getInternalId(), fileId));

        if (file.isEmpty()) {
            throw new Exception(Exception.STORAGE_FILE_NOT_FOUND);
        }

        response.dynamic(file, Response.MODEL_FILE);
    });

App.get('/v1/storage/buckets/:bucketId/files/:fileId/preview')
    // .alias('/v1/storage/files/:fileId/preview', { bucketId: 'default' })
    .desc('Get file preview')
    .groups(['api', 'storage'])
    .label('scope', 'files.read')
    .label('cache', true)
    .label('cache.resourceType', 'bucket/{request.bucketId}')
    .label('cache.resource', 'file/{request.fileId}')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'storage')
    .label('sdk.method', 'getFilePreview')
    .label('sdk.description', '/docs/references/storage/get-file-preview.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_IMAGE)
    .label('sdk.methodType', 'location')
    .param('bucketId', '', new UID(), 'Storage bucket unique ID. You can create a new storage bucket using the Storage service [server integration](https://appconda.io/docs/server/storage#createBucket).')
    .param('fileId', '', new UID(), 'File ID')
    .param('width', 0, new Range(0, 4000), 'Resize preview image width, Pass an integer between 0 to 4000.', true)
    .param('height', 0, new Range(0, 4000), 'Resize preview image height, Pass an integer between 0 to 4000.', true)
    .param('gravity', Image.GRAVITY_CENTER, new WhiteList(Image.getGravityTypes()), `Image crop gravity. Can be one of ${Image.getGravityTypes().join(",")}`, true)
    .param('quality', 100, new Range(0, 100), 'Preview image quality. Pass an integer between 0 to 100. Defaults to 100.', true)
    .param('borderWidth', 0, new Range(0, 100), 'Preview image border in pixels. Pass an integer between 0 to 100. Defaults to 0.', true)
    .param('borderColor', '', new HexColor(), 'Preview image border color. Use a valid HEX color, no # is needed for prefix.', true)
    .param('borderRadius', 0, new Range(0, 4000), 'Preview image border radius in pixels. Pass an integer between 0 to 4000.', true)
    .param('opacity', 1, new Range(0, 1, Range.TYPE_FLOAT), 'Preview image opacity. Only works with images having an alpha channel (like png). Pass a number between 0 to 1.', true)
    .param('rotation', 0, new Range(-360, 360), 'Preview image rotation in degrees. Pass an integer between -360 and 360.', true)
    .param('background', '', new HexColor(), 'Preview image background color. Only works with transparent images (png). Use a valid HEX color, no # is needed for prefix.', true)
    .param('output', '', new WhiteList(Object.keys(Config.getParam('storage-outputs'))), 'Output format type (jpeg, jpg, png, gif and webp).', true)
    .inject('request')
    .inject('response')
    .inject('project')
    .inject('dbForProject')
    .inject('mode')
    .inject('deviceForFiles')
    .inject('deviceForLocal')
    .action(async ({ bucketId, fileId, width, height, gravity, quality, borderWidth, borderColor, borderRadius, opacity, rotation, background, output, request, response, project, dbForProject, mode, deviceForFiles, deviceForLocal }: { bucketId: string, fileId: string, width: number, height: number, gravity: string, quality: number, borderWidth: number, borderColor: string, borderRadius: number, opacity: number, rotation: number, background: string, output: string, request: Request, response: Response, project: Document, dbForProject: Database, mode: string, deviceForFiles: Device, deviceForLocal: Device }) => {

        if (!require('imagick')) {
            throw new Exception(Exception.GENERAL_SERVER_ERROR, 'Imagick extension is missing');
        }

        const bucket = await Authorization.skip(() => dbForProject.getDocument('buckets', bucketId));

        const isAPIKey = Auth.isAppUser(Authorization.getRoles());
        const isPrivilegedUser = Auth.isPrivilegedUser(Authorization.getRoles());

        if (bucket.isEmpty() || (!bucket.getAttribute('enabled') && !isAPIKey && !isPrivilegedUser)) {
            throw new Exception(Exception.STORAGE_BUCKET_NOT_FOUND);
        }

        const fileSecurity = bucket.getAttribute('fileSecurity', false);
        const validator = new Authorization(Database.PERMISSION_READ);
        const valid = validator.isValid(bucket.getRead());
        if (!fileSecurity && !valid) {
            throw new Exception(Exception.USER_UNAUTHORIZED);
        }

        const file = fileSecurity && !valid
            ? await dbForProject.getDocument('bucket_' + bucket.getInternalId(), fileId)
            : await Authorization.skip(() => dbForProject.getDocument('bucket_' + bucket.getInternalId(), fileId));

        if (file.isEmpty()) {
            throw new Exception(Exception.STORAGE_FILE_NOT_FOUND);
        }

        if (!request.getAccept().includes('image/webp') && output === 'webp') {
            output = 'jpg';
        }

        const inputs = Config.getParam('storage-inputs');
        const outputs = Config.getParam('storage-outputs');
        const fileLogos = Config.getParam('storage-logos');

        let path = file.getAttribute('path');
        let type = path.split('.').pop()?.toLowerCase() || '';
        let algorithm = file.getAttribute('algorithm', Compression.NONE);
        let cipher = file.getAttribute('openSSLCipher');
        const mime = file.getAttribute('mimeType');

        if (!inputs.includes(mime) || file.getAttribute('sizeActual') > parseInt(process.env._APP_STORAGE_PREVIEW_LIMIT, 10)) {
            path = fileLogos[mime] || fileLogos['default'];
            algorithm = Compression.NONE;
            cipher = null;
            background = background || 'eceff1';
            type = path.split('.').pop()?.toLowerCase() || '';
            deviceForFiles = deviceForLocal;
        }

        if (!deviceForFiles.exists(path)) {
            throw new Exception(Exception.STORAGE_FILE_NOT_FOUND);
        }

        if (!output) {
            output = outputs[type] ? type : 'jpg';
        }

        let source: any = await deviceForFiles.read(path);

        /*  if (cipher) {
             source = OpenSSL.decrypt(
                 source,
                 file.getAttribute('openSSLCipher'),
                 process.env._APP_OPENSSL_KEY_V + file.getAttribute('openSSLVersion'),
                 0,
                 Buffer.from(file.getAttribute('openSSLIV'), 'hex'),
                 Buffer.from(file.getAttribute('openSSLTag'), 'hex')
             );
         } */

        switch (algorithm) {
            case Compression.ZSTD:
                const zstd = new Zstd();
                source = zstd.decompress(source);
                break;
            case Compression.GZIP:
                const gzip = new GZIP();
                source = gzip.decompress(source);
                break;
        }

        let image;
        try {
            image = new Image(source);
        } catch (e) {
            throw new Exception(Exception.STORAGE_FILE_TYPE_UNSUPPORTED, e.message);
        }

        image.crop(width, height, gravity);

        if (opacity !== undefined) {
            image.setOpacity(opacity);
        }

        if (background) {
            image.setBackground('#' + background);
        }

        if (borderWidth) {
            image.setBorder(borderWidth, '#' + borderColor);
        }

        if (borderRadius) {
            image.setBorderRadius(borderRadius);
        }

        if (rotation) {
            image.setRotation((rotation + 360) % 360);
        }

        const data = image.output(output, quality);

        const contentType = outputs[output] || outputs['jpg'];

        response
            .addHeader('Expires', new Date(Date.now() + 60 * 60 * 24 * 30 * 1000).toUTCString())
            .setContentType(contentType)
            .file(data);
    });

App.get('/v1/storage/buckets/:bucketId/files/:fileId/download')
    //.alias('/v1/storage/files/:fileId/download', { bucketId: 'default' })
    .desc('Get file for download')
    .groups(['api', 'storage'])
    .label('scope', 'files.read')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'storage')
    .label('sdk.method', 'getFileDownload')
    .label('sdk.description', '/docs/references/storage/get-file-download.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', '*/*')
    .label('sdk.methodType', 'location')
    .param('bucketId', '', new UID(), 'Storage bucket ID. You can create a new storage bucket using the Storage service [server integration](https://appconda.io/docs/server/storage#createBucket).')
    .param('fileId', '', new UID(), 'File ID.')
    .inject('request')
    .inject('response')
    .inject('dbForProject')
    .inject('mode')
    .inject('deviceForFiles')
    .action(async ({ bucketId, fileId, request, response, dbForProject, mode, deviceForFiles }: { bucketId: string, fileId: string, request: Request, response: Response, dbForProject: Database, mode: string, deviceForFiles: Device }) => {

        const bucket = await Authorization.skip(() => dbForProject.getDocument('buckets', bucketId));

        const isAPIKey = Auth.isAppUser(Authorization.getRoles());
        const isPrivilegedUser = Auth.isPrivilegedUser(Authorization.getRoles());

        if (bucket.isEmpty() || (!bucket.getAttribute('enabled') && !isAPIKey && !isPrivilegedUser)) {
            throw new Exception(Exception.STORAGE_BUCKET_NOT_FOUND);
        }

        const fileSecurity = bucket.getAttribute('fileSecurity', false);
        const validator = new Authorization(Database.PERMISSION_READ);
        const valid = validator.isValid(bucket.getRead());
        if (!fileSecurity && !valid) {
            throw new Exception(Exception.USER_UNAUTHORIZED);
        }

        const file = fileSecurity && !valid
            ? await dbForProject.getDocument('bucket_' + bucket.getInternalId(), fileId)
            : await Authorization.skip(() => dbForProject.getDocument('bucket_' + bucket.getInternalId(), fileId));

        if (file.isEmpty()) {
            throw new Exception(Exception.STORAGE_FILE_NOT_FOUND);
        }

        const path = file.getAttribute('path', '');

        if (!deviceForFiles.exists(path)) {
            throw new Exception(Exception.STORAGE_FILE_NOT_FOUND, 'File not found in ' + path);
        }

        response
            .setContentType(file.getAttribute('mimeType'))
            .addHeader('Expires', new Date(Date.now() + 60 * 60 * 24 * 45 * 1000).toUTCString()) // 45 days cache
            .addHeader('X-Peak', process.memoryUsage().heapUsed.toString())
            .addHeader('Content-Disposition', `attachment; filename="${file.getAttribute('name', '')}"`);

        const size = file.getAttribute('sizeOriginal', 0);
        let start, end, unit;
        const rangeHeader = request.getHeader('range');
        if (rangeHeader) {
            start = request.getRangeStart();
            end = request.getRangeEnd();
            unit = request.getRangeUnit();

            if (end === null) {
                end = Math.min(start + MAX_OUTPUT_CHUNK_SIZE - 1, size - 1);
            }

            if (unit !== 'bytes' || start >= end || end >= size) {
                throw new Exception(Exception.STORAGE_INVALID_RANGE);
            }

            response
                .addHeader('Accept-Ranges', 'bytes')
                .addHeader('Content-Range', `bytes ${start}-${end}/${size}`)
                .addHeader('Content-Length', (end - start + 1).toString())
                .setStatusCode(Response.STATUS_CODE_PARTIALCONTENT);
        }

        let source: any = '';
        /*  if (file.getAttribute('openSSLCipher')) { // Decrypt
             source = deviceForFiles.read(path);
             source = OpenSSL.decrypt(
                 source,
                 file.getAttribute('openSSLCipher'),
                 System.getEnv('_APP_OPENSSL_KEY_V' + file.getAttribute('openSSLVersion')),
                 0,
                 Buffer.from(file.getAttribute('openSSLIV'), 'hex'),
                 Buffer.from(file.getAttribute('openSSLTag'), 'hex')
             );
         } */

        switch (file.getAttribute('algorithm', Compression.NONE)) {
            case Compression.ZSTD:
                if (!source) {
                    source = deviceForFiles.read(path);
                }
                const zstd = new Zstd();
                source = zstd.decompress(source);
                break;
            case Compression.GZIP:
                if (!source) {
                    source = deviceForFiles.read(path);
                }
                const gzip = new GZIP();
                source = gzip.decompress(source);
                break;
        }

        if (source) {
            if (rangeHeader) {
                response.send(source.slice(start, end + 1));
            } else {
                response.send(source);
            }
        } else if (rangeHeader) {
            const resp = await deviceForFiles.read(path, start, end - start + 1);
            response.send(resp.toString('utf-8'));

        } else if (size > APP_STORAGE_READ_BUFFER) {
            for (let i = 0; i < Math.ceil(size / MAX_OUTPUT_CHUNK_SIZE); i++) {
                const resp = await deviceForFiles.read(
                    path,
                    i * MAX_OUTPUT_CHUNK_SIZE,
                    Math.min(MAX_OUTPUT_CHUNK_SIZE, size - i * MAX_OUTPUT_CHUNK_SIZE)
                );


                response.chunk(resp.toString('utf-8'), (i + 1) * MAX_OUTPUT_CHUNK_SIZE >= size);
            }
        } else {
            const resp = await deviceForFiles.read(path);
            response.send(resp.toString('utf-8'));
        }
    });


App.get('/v1/storage/buckets/:bucketId/files/:fileId/view')
    //.alias('/v1/storage/files/:fileId/view', { bucketId: 'default' })
    .desc('Get file for view')
    .groups(['api', 'storage'])
    .label('scope', 'files.read')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'storage')
    .label('sdk.method', 'getFileView')
    .label('sdk.description', '/docs/references/storage/get-file-view.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', '*/*')
    .label('sdk.methodType', 'location')
    .param('bucketId', '', new UID(), 'Storage bucket unique ID. You can create a new storage bucket using the Storage service [server integration](https://appconda.io/docs/server/storage#createBucket).')
    .param('fileId', '', new UID(), 'File ID.')
    .inject('response')
    .inject('request')
    .inject('dbForProject')
    .inject('mode')
    .inject('deviceForFiles')
    .action(async ({ bucketId, fileId, response, request, dbForProject, mode, deviceForFiles }: { bucketId: string, fileId: string, response: Response, request: Request, dbForProject: Database, mode: string, deviceForFiles: Device }) => {
        const bucket = await Authorization.skip(() => dbForProject.getDocument('buckets', bucketId));

        const isAPIKey = Auth.isAppUser(Authorization.getRoles());
        const isPrivilegedUser = Auth.isPrivilegedUser(Authorization.getRoles());

        if (bucket.isEmpty() || (!bucket.getAttribute('enabled') && !isAPIKey && !isPrivilegedUser)) {
            throw new Exception(Exception.STORAGE_BUCKET_NOT_FOUND);
        }

        const fileSecurity = bucket.getAttribute('fileSecurity', false);
        const validator = new Authorization(Database.PERMISSION_READ);
        const valid = validator.isValid(bucket.getRead());
        if (!fileSecurity && !valid) {
            throw new Exception(Exception.USER_UNAUTHORIZED);
        }

        const file = fileSecurity && !valid
            ? await dbForProject.getDocument('bucket_' + bucket.getInternalId(), fileId)
            : await Authorization.skip(() => dbForProject.getDocument('bucket_' + bucket.getInternalId(), fileId));

        if (file.isEmpty()) {
            throw new Exception(Exception.STORAGE_FILE_NOT_FOUND);
        }

        const mimes = Config.getParam('storage-mimes');
        const path = file.getAttribute('path', '');

        if (!deviceForFiles.exists(path)) {
            throw new Exception(Exception.STORAGE_FILE_NOT_FOUND, 'File not found in ' + path);
        }

        let contentType = 'text/plain';
        if (mimes.includes(file.getAttribute('mimeType'))) {
            contentType = file.getAttribute('mimeType');
        }

        response
            .setContentType(contentType)
            .addHeader('Content-Security-Policy', 'script-src none;')
            .addHeader('X-Content-Type-Options', 'nosniff')
            .addHeader('Content-Disposition', `inline; filename="${file.getAttribute('name', '')}"`)
            .addHeader('Expires', new Date(Date.now() + 60 * 60 * 24 * 45 * 1000).toUTCString()) // 45 days cache
            .addHeader('X-Peak', process.memoryUsage().heapUsed.toString());

        const size = file.getAttribute('sizeOriginal', 0);
        const rangeHeader = request.getHeader('range');
        let start, end;
        if (rangeHeader) {
            start = request.getRangeStart();
            end = request.getRangeEnd();
            const unit = request.getRangeUnit();

            if (end === null) {
                end = Math.min(start + 2000000 - 1, size - 1);
            }

            if (unit !== 'bytes' || start >= end || end >= size) {
                throw new Exception(Exception.STORAGE_INVALID_RANGE);
            }

            response
                .addHeader('Accept-Ranges', 'bytes')
                .addHeader('Content-Range', `bytes ${start}-${end}/${size}`)
                .addHeader('Content-Length', (end - start + 1).toString())
                .setStatusCode(Response.STATUS_CODE_PARTIALCONTENT);
        }

        let source: any = '';
        /*   if (file.getAttribute('openSSLCipher')) { // Decrypt
              source = deviceForFiles.read(path);
              source = OpenSSL.decrypt(
                  source,
                  file.getAttribute('openSSLCipher'),
                  process.env._APP_OPENSSL_KEY_V as any + file.getAttribute('openSSLVersion'),
                  0,
                  Buffer.from(file.getAttribute('openSSLIV'), 'hex'),
                  Buffer.from(file.getAttribute('openSSLTag'), 'hex')
              );
          } */

        switch (file.getAttribute('algorithm', Compression.NONE)) {
            case Compression.ZSTD:
                if (!source) {
                    source = deviceForFiles.read(path);
                }
                const zstd = new Zstd();
                source = zstd.decompress(source);
                break;
            case Compression.GZIP:
                if (!source) {
                    source = deviceForFiles.read(path);
                }
                const gzip = new GZIP();
                source = gzip.decompress(source);
                break;
        }

        if (source) {
            if (rangeHeader) {
                response.send(source.slice(start, end + 1));
            } else {
                response.send(source);
            }
            return;
        }

        if (rangeHeader) {
            const resp = await deviceForFiles.read(path, start, end - start + 1);
            response.send(resp.toString('utf-8'));
            return;
        }

        const fileSize = await deviceForFiles.getFileSize(path);
        if (fileSize > APP_STORAGE_READ_BUFFER) {
            for (let i = 0; i < Math.ceil(fileSize / MAX_OUTPUT_CHUNK_SIZE); i++) {
                const resp = await deviceForFiles.read(
                    path,
                    i * MAX_OUTPUT_CHUNK_SIZE,
                    Math.min(MAX_OUTPUT_CHUNK_SIZE, fileSize - i * MAX_OUTPUT_CHUNK_SIZE)
                )
                response.chunk(
                    resp.toString('utf-8'),
                    (i + 1) * MAX_OUTPUT_CHUNK_SIZE >= fileSize
                );
            }
        } else {
            const resp = await deviceForFiles.read(path);
            response.send(resp.toString('utf-8'));
        }
    });

App.get('/v1/storage/buckets/:bucketId/files/:fileId/push')
    .desc('Get file for push notification')
    .groups(['api', 'storage'])
    .label('scope', 'public')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', '*/*')
    .label('sdk.methodType', 'location')
    .param('bucketId', '', new UID(), 'Storage bucket unique ID. You can create a new storage bucket using the Storage service [server integration](https://appconda.io/docs/server/storage#createBucket).')
    .param('fileId', '', new UID(), 'File ID.')
    .param('jwt', '', new Text(2048, 0), 'JSON Web Token to validate', true)
    .inject('response')
    .inject('request')
    .inject('dbForProject')
    .inject('project')
    .inject('mode')
    .inject('deviceForFiles')
    .action(async ({ bucketId, fileId, jwt, response, request, dbForProject, project, mode, deviceForFiles }: { bucketId: string, fileId: string, jwt: string, response: Response, request: Request, dbForProject: Database, project: Document, mode: string, deviceForFiles: Device }) => {
        const bucket = await Authorization.skip(() => dbForProject.getDocument('buckets', bucketId));

        const decoder = new JWT(process.env._APP_OPENSSL_KEY_V1 as any);

        let decoded;
        try {
            decoded = decoder.decode(jwt);
        } catch (error) {
            throw new Exception(Exception.USER_UNAUTHORIZED);
        }

        if (
            decoded['projectId'] !== project.getId() ||
            decoded['bucketId'] !== bucketId ||
            decoded['fileId'] !== fileId ||
            decoded['exp'] < Date.now() / 1000
        ) {
            throw new Exception(Exception.USER_UNAUTHORIZED);
        }

        const isAPIKey = Auth.isAppUser(Authorization.getRoles());
        const isPrivilegedUser = Auth.isPrivilegedUser(Authorization.getRoles());

        if (bucket.isEmpty() || (!bucket.getAttribute('enabled') && !isAPIKey && !isPrivilegedUser)) {
            throw new Exception(Exception.STORAGE_BUCKET_NOT_FOUND);
        }

        const file = await Authorization.skip(() => dbForProject.getDocument('bucket_' + bucket.getInternalId(), fileId));

        if (file.isEmpty()) {
            throw new Exception(Exception.STORAGE_FILE_NOT_FOUND);
        }

        const mimes = Config.getParam('storage-mimes');
        const path = file.getAttribute('path', '');

        if (!deviceForFiles.exists(path)) {
            throw new Exception(Exception.STORAGE_FILE_NOT_FOUND, 'File not found in ' + path);
        }

        let contentType = 'text/plain';
        if (mimes.includes(file.getAttribute('mimeType'))) {
            contentType = file.getAttribute('mimeType');
        }

        response
            .setContentType(contentType)
            .addHeader('Content-Security-Policy', 'script-src none;')
            .addHeader('X-Content-Type-Options', 'nosniff')
            .addHeader('Content-Disposition', `inline; filename="${file.getAttribute('name', '')}"`)
            .addHeader('Expires', new Date(Date.now() + 60 * 60 * 24 * 45 * 1000).toUTCString()) // 45 days cache
            .addHeader('X-Peak', process.memoryUsage().heapUsed.toString());

        const size = file.getAttribute('sizeOriginal', 0);
        const rangeHeader = request.getHeader('range');
        let start, end;
        if (rangeHeader) {
            start = request.getRangeStart();
            end = request.getRangeEnd();
            const unit = request.getRangeUnit();

            if (end === null) {
                end = Math.min(start + 2000000 - 1, size - 1);
            }

            if (unit !== 'bytes' || start >= end || end >= size) {
                throw new Exception(Exception.STORAGE_INVALID_RANGE);
            }

            response
                .addHeader('Accept-Ranges', 'bytes')
                .addHeader('Content-Range', `bytes ${start}-${end}/${size}`)
                .addHeader('Content-Length', (end - start + 1).toString())
                .setStatusCode(Response.STATUS_CODE_PARTIALCONTENT);
        }

        let source: any = '';
        /*   if (file.getAttribute('openSSLCipher')) { // Decrypt
              source = deviceForFiles.read(path);
              source = OpenSSL.decrypt(
                  source,
                  file.getAttribute('openSSLCipher'),
                  System.getEnv('_APP_OPENSSL_KEY_V' + file.getAttribute('openSSLVersion')),
                  0,
                  Buffer.from(file.getAttribute('openSSLIV'), 'hex'),
                  Buffer.from(file.getAttribute('openSSLTag'), 'hex')
              );
          } */

        switch (file.getAttribute('algorithm', Compression.NONE)) {
            case Compression.ZSTD:
                if (!source) {
                    source = deviceForFiles.read(path);
                }
                const zstd = new Zstd();
                source = zstd.decompress(source);
                break;
            case Compression.GZIP:
                if (!source) {
                    source = deviceForFiles.read(path);
                }
                const gzip = new GZIP();
                source = gzip.decompress(source);
                break;
        }

        if (source) {
            if (rangeHeader) {
                response.send(source.slice(start, end + 1));
            } else {
                response.send(source);
            }
            return;
        }

        if (rangeHeader) {
            const resp = await deviceForFiles.read(path, start, end - start + 1);
            response.send(resp.toString('utf-8'));
            return;
        }

        const fileSize = await deviceForFiles.getFileSize(path);
        if (fileSize > APP_STORAGE_READ_BUFFER) {
            for (let i = 0; i < Math.ceil(fileSize / MAX_OUTPUT_CHUNK_SIZE); i++) {
                const resp = await deviceForFiles.read(
                    path,
                    i * MAX_OUTPUT_CHUNK_SIZE,
                    Math.min(MAX_OUTPUT_CHUNK_SIZE, fileSize - i * MAX_OUTPUT_CHUNK_SIZE)
                );
                response.chunk(
                    resp.toString('utf-8'),
                    (i + 1) * MAX_OUTPUT_CHUNK_SIZE >= fileSize
                );
            }
        } else {
            const resp = await deviceForFiles.read(path);
            response.send(resp.toString('utf-8'));
        }
    });

App.put('/v1/storage/buckets/:bucketId/files/:fileId')
    //.alias('/v1/storage/files/:fileId', { bucketId: 'default' })
    .desc('Update file')
    .groups(['api', 'storage'])
    .label('scope', 'files.write')
    .label('event', 'buckets.[bucketId].files.[fileId].update')
    .label('audits.event', 'file.update')
    .label('audits.resource', 'file/{response.$id}')
    .label('abuse-key', 'ip:{ip},method:{method},url:{url},userId:{userId}')
    .label('abuse-limit', APP_LIMIT_WRITE_RATE_DEFAULT)
    .label('abuse-time', APP_LIMIT_WRITE_RATE_PERIOD_DEFAULT)
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'storage')
    .label('sdk.method', 'updateFile')
    .label('sdk.description', '/docs/references/storage/update-file.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_FILE)
    .param('bucketId', '', new UID(), 'Storage bucket unique ID. You can create a new storage bucket using the Storage service [server integration](https://appconda.io/docs/server/storage#createBucket).')
    .param('fileId', '', new UID(), 'File unique ID.')
    .param('name', null, new Text(255), 'Name of the file', true)
    .param('permissions', null, new Permissions(APP_LIMIT_ARRAY_PARAMS_SIZE, [Database.PERMISSION_READ, Database.PERMISSION_UPDATE, Database.PERMISSION_DELETE, Database.PERMISSION_WRITE]), 'An array of permission string. By default, the current permissions are inherited. [Learn more about permissions](https://appconda.io/docs/permissions).', true)
    .inject('response')
    .inject('dbForProject')
    .inject('user')
    .inject('mode')
    .inject('queueForEvents')
    .action(async ({ bucketId, fileId, name, permissions, response, dbForProject, user, mode, queueForEvents }: { bucketId: string, fileId: string, name: string | null, permissions: string[] | null, response: Response, dbForProject: Database, user: Document, mode: string, queueForEvents: Event }) => {
        const bucket = await Authorization.skip(() => dbForProject.getDocument('buckets', bucketId));

        const isAPIKey = Auth.isAppUser(Authorization.getRoles());
        const isPrivilegedUser = Auth.isPrivilegedUser(Authorization.getRoles());

        if (bucket.isEmpty() || (!bucket.getAttribute('enabled') && !isAPIKey && !isPrivilegedUser)) {
            throw new Exception(Exception.STORAGE_BUCKET_NOT_FOUND);
        }

        const fileSecurity = bucket.getAttribute('fileSecurity', false);
        const validator = new Authorization(Database.PERMISSION_UPDATE);
        const valid = validator.isValid(bucket.getUpdate());
        if (!fileSecurity && !valid) {
            throw new Exception(Exception.USER_UNAUTHORIZED);
        }

        const file = await Authorization.skip(() => dbForProject.getDocument('bucket_' + bucket.getInternalId(), fileId));

        if (file.isEmpty()) {
            throw new Exception(Exception.STORAGE_FILE_NOT_FOUND);
        }

        permissions = Permission.aggregate(permissions, [
            Database.PERMISSION_READ,
            Database.PERMISSION_UPDATE,
            Database.PERMISSION_DELETE,
        ]);

        const roles = Authorization.getRoles();
        if (!Auth.isAppUser(roles) && !Auth.isPrivilegedUser(roles) && permissions !== null) {
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
                        throw new Exception(Exception.USER_UNAUTHORIZED, `Permissions must be one of: (${roles.join(', ')})`);
                    }
                }
            }
        }

        if (permissions === null) {
            permissions = file.getPermissions() || [];
        }

        file.setAttribute('$permissions', permissions);

        if (name !== null) {
            file.setAttribute('name', name);
        }

        if (fileSecurity && !valid) {
            await dbForProject.updateDocument('bucket_' + bucket.getInternalId(), fileId, file);
        } else {
            await Authorization.skip(() => dbForProject.updateDocument('bucket_' + bucket.getInternalId(), fileId, file));
        }

        queueForEvents
            .setParam('bucketId', bucket.getId())
            .setParam('fileId', file.getId())
            .setContext('bucket', bucket);

        response.dynamic(file, Response.MODEL_FILE);
    });

App.delete('/v1/storage/buckets/:bucketId/files/:fileId')
    .desc('Delete File')
    .groups(['api', 'storage'])
    .label('scope', 'files.write')
    .label('event', 'buckets.[bucketId].files.[fileId].delete')
    .label('audits.event', 'file.delete')
    .label('audits.resource', 'file/{request.fileId}')
    .label('abuse-key', 'ip:{ip},method:{method},url:{url},userId:{userId}')
    .label('abuse-limit', APP_LIMIT_WRITE_RATE_DEFAULT)
    .label('abuse-time', APP_LIMIT_WRITE_RATE_PERIOD_DEFAULT)
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'storage')
    .label('sdk.method', 'deleteFile')
    .label('sdk.description', '/docs/references/storage/delete-file.md')
    .label('sdk.response.code', Response.STATUS_CODE_NOCONTENT)
    .label('sdk.response.model', Response.MODEL_NONE)
    .param('bucketId', '', new UID(), 'Storage bucket unique ID. You can create a new storage bucket using the Storage service [server integration](https://appconda.io/docs/server/storage#createBucket).')
    .param('fileId', '', new UID(), 'File ID.')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .inject('mode')
    .inject('deviceForFiles')
    .inject('queueForDeletes')
    .action(async ({ bucketId, fileId, response, dbForProject, queueForEvents, mode, deviceForFiles, queueForDeletes }: { bucketId: string, fileId: string, response: Response, dbForProject: Database, queueForEvents: Event, mode: string, deviceForFiles: Device, queueForDeletes: Delete }) => {
        const bucket = await Authorization.skip(() => dbForProject.getDocument('buckets', bucketId));

        const isAPIKey = Auth.isAppUser(Authorization.getRoles());
        const isPrivilegedUser = Auth.isPrivilegedUser(Authorization.getRoles());

        if (bucket.isEmpty() || (!bucket.getAttribute('enabled') && !isAPIKey && !isPrivilegedUser)) {
            throw new Exception(Exception.STORAGE_BUCKET_NOT_FOUND);
        }

        const fileSecurity = bucket.getAttribute('fileSecurity', false);
        const validator = new Authorization(Database.PERMISSION_DELETE);
        const valid = validator.isValid(bucket.getDelete());
        if (!fileSecurity && !valid) {
            throw new Exception(Exception.USER_UNAUTHORIZED);
        }

        const file = await Authorization.skip(() => dbForProject.getDocument('bucket_' + bucket.getInternalId(), fileId));

        if (file.isEmpty()) {
            throw new Exception(Exception.STORAGE_FILE_NOT_FOUND);
        }

        if (fileSecurity && !valid && !validator.isValid(file.getDelete())) {
            throw new Exception(Exception.USER_UNAUTHORIZED);
        }

        let deviceDeleted = false;
        if (file.getAttribute('chunksTotal') !== file.getAttribute('chunksUploaded')) {
            deviceDeleted = await deviceForFiles.abort(
                file.getAttribute('path'),
                file.getAttribute('metadata', {})['uploadId'] || ''
            );
        } else {
            deviceDeleted = await deviceForFiles.delete(file.getAttribute('path'));
        }

        if (deviceDeleted) {
            queueForDeletes
                .setType(DELETE_TYPE_CACHE_BY_RESOURCE)
                .setResourceType('bucket/' + bucket.getId())
                .setResource('file/' + fileId);

            const deleted = fileSecurity && !valid
                ? await dbForProject.deleteDocument('bucket_' + bucket.getInternalId(), fileId)
                : await Authorization.skip(async () => await dbForProject.deleteDocument('bucket_' + bucket.getInternalId(), fileId));

            if (!deleted) {
                throw new Exception(Exception.GENERAL_SERVER_ERROR, 'Failed to remove file from DB');
            }
        } else {
            throw new Exception(Exception.GENERAL_SERVER_ERROR, 'Failed to delete file from device');
        }

        queueForEvents
            .setParam('bucketId', bucket.getId())
            .setParam('fileId', file.getId())
            .setContext('bucket', bucket)
            .setPayload(response.output(file, Response.MODEL_FILE));

        response.noContent();
    });

App.get('/v1/storage/usage')
    .desc('Get storage usage stats')
    .groups(['api', 'storage'])
    .label('scope', 'files.read')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'storage')
    .label('sdk.method', 'getUsage')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USAGE_STORAGE)
    .param('range', '30d', new WhiteList(['24h', '30d', '90d'], true), 'Date range.', true)
    .inject('response')
    .inject('dbForProject')
    .action(async ({ range, response, dbForProject }: { range: string, response: Response, dbForProject: Database }) => {
        const periods = Config.getParam('usage', {});
        const stats: Record<string, any> = {};
        const usage: Record<string, any> = {};
        const days = periods[range];
        const metrics = [
            METRIC_BUCKETS,
            METRIC_FILES,
            METRIC_FILES_STORAGE,
        ];

        await Authorization.skip(async () => {
            for (const metric of metrics) {
                const result: any = await dbForProject.findOne('stats', [
                    Query.equal('metric', [metric]),
                    Query.equal('period', ['inf'])
                ]);

                stats[metric] = { total: result?.value || 0, data: {} };
                const limit = days.limit;
                const period = days.period;
                const results = await dbForProject.find('stats', [
                    Query.equal('metric', [metric]),
                    Query.equal('period', [period]),
                    Query.limit(limit),
                    Query.orderDesc('time'),
                ]);

                for (const result of results) {
                    stats[metric].data[result.getAttribute('time')] = {
                        value: result.getAttribute('value'),
                    };
                }
            }
        });

        const format = days.period === '1h' ? 'Y-m-d\\TH:00:00.000P' : 'Y-m-d\\T00:00:00.000P';

        for (const metric of metrics) {
            usage[metric] = { total: stats[metric].total, data: [] };
            let leap = Date.now() / 1000 - (days.limit * days.factor);
            while (leap < Date.now() / 1000) {
                leap += days.factor;
                const formatDate = new Date(leap * 1000).toISOString().split('.')[0] + 'P';
                usage[metric].data.push({
                    value: stats[metric].data[formatDate]?.value || 0,
                    date: formatDate,
                });
            }
        }

        response.dynamic(new Document({
            range: range,
            bucketsTotal: usage[metrics[0]].total,
            filesTotal: usage[metrics[1]].total,
            filesStorageTotal: usage[metrics[2]].total,
            buckets: usage[metrics[0]].data,
            files: usage[metrics[1]].data,
            storage: usage[metrics[2]].data,
        }), Response.MODEL_USAGE_STORAGE);
    });

App.get('/v1/storage/:bucketId/usage')
    .desc('Get bucket usage stats')
    .groups(['api', 'storage'])
    .label('scope', 'files.read')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'storage')
    .label('sdk.method', 'getBucketUsage')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USAGE_BUCKETS)
    .param('bucketId', '', new UID(), 'Bucket ID.')
    .param('range', '30d', new WhiteList(['24h', '30d', '90d'], true), 'Date range.', true)
    .inject('response')
    .inject('dbForProject')
    .action(async ({ bucketId, range, response, dbForProject }: { bucketId: string, range: string, response: Response, dbForProject: Database }) => {
        const bucket = await dbForProject.getDocument('buckets', bucketId);

        if (bucket.isEmpty()) {
            throw new Exception(Exception.STORAGE_BUCKET_NOT_FOUND);
        }

        const periods = Config.getParam('usage', {});
        const stats: Record<string, any> = {};
        const usage: Record<string, any> = {};
        const days = periods[range];
        const metrics = [
            METRIC_BUCKET_ID_FILES.replace('{bucketInternalId}', bucket.getInternalId()),
            METRIC_BUCKET_ID_FILES_STORAGE.replace('{bucketInternalId}', bucket.getInternalId()),
        ];

        await Authorization.skip(async () => {
            for (const metric of metrics) {
                const result: any = await dbForProject.findOne('stats', [
                    Query.equal('metric', [metric]),
                    Query.equal('period', ['inf'])
                ]);

                stats[metric] = { total: result?.value || 0, data: {} };
                const limit = days.limit;
                const period = days.period;
                const results = await dbForProject.find('stats', [
                    Query.equal('metric', [metric]),
                    Query.equal('period', [period]),
                    Query.limit(limit),
                    Query.orderDesc('time'),
                ]);

                for (const result of results) {
                    stats[metric].data[result.getAttribute('time')] = {
                        value: result.getAttribute('value'),
                    };
                }
            }
        });

        const format = days.period === '1h' ? 'Y-m-d\\TH:00:00.000P' : 'Y-m-d\\T00:00:00.000P';

        for (const metric of metrics) {
            usage[metric] = { total: stats[metric].total, data: [] };
            let leap = Date.now() / 1000 - (days.limit * days.factor);
            while (leap < Date.now() / 1000) {
                leap += days.factor;
                const formatDate = new Date(leap * 1000).toISOString().split('.')[0] + 'P';
                usage[metric].data.push({
                    value: stats[metric].data[formatDate]?.value || 0,
                    date: formatDate,
                });
            }
        }

        response.dynamic(new Document({
            range: range,
            filesTotal: usage[metrics[0]].total,
            filesStorageTotal: usage[metrics[1]].total,
            files: usage[metrics[0]].data,
            storage: usage[metrics[1]].data,
        }), Response.MODEL_USAGE_BUCKETS);
    });
