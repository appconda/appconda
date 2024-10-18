import { CustomId } from "../../../Appconda/Database/Validators/CustomId";
import { Identities } from "../../../Appconda/Database/Validators/Queries/Identities";
import { Targets } from "../../../Appconda/Database/Validators/Queries/Targets";
import { Users } from "../../../Appconda/Database/Validators/Queries/Users";
import { Detector } from "../../../Appconda/Detector/Detector";
import { Delete } from "../../../Appconda/Event/Delete";
import { Event } from "../../../Appconda/Event/Event";
import { AppcondaException as Exception } from "../../../Appconda/Extend/Exception";
import { Hooks } from "../../../Appconda/Hooks/Hooks";
import { Email } from "../../../Appconda/Network/Validators/Email";
import { Request } from "../../../Appconda/Tuval/Request";
import { Response } from "../../../Appconda/Tuval/Response";
import { Audit } from "../../../Tuval/Audit";
import { Auth, Password, PasswordDictionary, PasswordHistory, PersonalData, Phone, TOTP, Type } from "../../../Tuval/Auth";
import { ArrayList, Assoc, Boolean, DateTime, Document, ID, Integer, Permission, Range, Role, Text, WhiteList } from "../../../Tuval/Core";
import { Database, Duplicate, Limit, Offset, Queries, Query, QueryException, UID } from "../../../Tuval/Database";
import { App } from "../../../Tuval/Http";
import { Locale } from "../../../Tuval/Locale";
import { APP_AUTH_TYPE_ADMIN, APP_AUTH_TYPE_KEY, APP_LIMIT_ARRAY_ELEMENT_SIZE, APP_LIMIT_ARRAY_LABELS_SIZE, APP_LIMIT_ARRAY_PARAMS_SIZE, APP_LIMIT_COUNT, DELETE_TYPE_DOCUMENT, DELETE_TYPE_TARGET, MESSAGE_TYPE_EMAIL, MESSAGE_TYPE_PUSH, MESSAGE_TYPE_SMS } from "../../init";


async function createUser(
    hash: string,
    hashOptions: any,
    userId: string,
    email: string | null,
    password: string | null,
    phone: string | null,
    name: string,
    project: Document,
    dbForProject: Database,
    queueForEvents: Event,
    hooks: Hooks
): Promise<Document> {
    const plaintextPassword = password;
    const hashOptionsObject = typeof hashOptions === 'string' ? JSON.parse(hashOptions) : hashOptions;
    const passwordHistory = project.getAttribute('auths', []).passwordHistory || 0;

    if (email) {
        email = email.toLowerCase();

        const identityWithMatchingEmail = await dbForProject.findOne('identities', [
            Query.equal('providerEmail', [email]),
        ]);
        if (identityWithMatchingEmail) {
            throw new Exception(Exception.USER_EMAIL_ALREADY_EXISTS);
        }
    }

    let user;

    try {
        userId = userId === 'unique()' ? ID.unique() : ID.custom(userId);

        if (project.getAttribute('auths', []).personalDataCheck) {
            const personalDataValidator = new PersonalData(
                userId,
                email,
                name,
                phone,
                false,
                true
            );
            if (!personalDataValidator.isValid(plaintextPassword)) {
                throw new Exception(Exception.USER_PASSWORD_PERSONAL_DATA);
            }
        }

        password = password ? (hash === 'plaintext' ? await Auth.passwordHash(password, hash, hashOptionsObject) : password) : null as any;
        user = new Document({
            $id: userId,
            $permissions: [
                Permission.read(Role.any()),
                Permission.update(Role.user(userId)),
                Permission.delete(Role.user(userId)),
            ],
            email,
            emailVerification: false,
            phone,
            phoneVerification: false,
            status: true,
            labels: [],
            password,
            passwordHistory: password === null || passwordHistory === 0 ? [] : [password],
            passwordUpdate: password ? new Date() : null,
            hash: hash === 'plaintext' ? Auth.DEFAULT_ALGO : hash,
            hashOptions: hash === 'plaintext' ? Auth.DEFAULT_ALGO_OPTIONS : { ...hashOptionsObject, type: hash },
            registration: new Date(),
            reset: false,
            name,
            prefs: {},
            sessions: null,
            tokens: null,
            memberships: null,
            search: [userId, email, phone, name].join(' '),
        });

        if (hash === 'plaintext') {
            hooks.trigger('passwordValidator', [dbForProject, project, plaintextPassword, user, true]);
        }

        await dbForProject.createDocument('users', user);

        if (email) {
            try {
                const target = await dbForProject.createDocument('targets', new Document({
                    $permissions: [
                        Permission.read(Role.user(user.getId())),
                        Permission.update(Role.user(user.getId())),
                        Permission.delete(Role.user(user.getId())),
                    ],
                    userId: user.getId(),
                    userInternalId: user.getInternalId(),
                    providerType: 'email',
                    identifier: email,
                }));
                user.setAttribute('targets', [...user.getAttribute('targets', []), target]);
            } catch (error) {
                const existingTarget = await dbForProject.findOne('targets', [
                    Query.equal('identifier', [email]),
                ]);
                if (existingTarget) {
                    user.setAttribute('targets', existingTarget, Document.SET_TYPE_APPEND);
                }
            }
        }

        if (phone) {
            try {
                const target = await dbForProject.createDocument('targets', new Document({
                    $permissions: [
                        Permission.read(Role.user(user.getId())),
                        Permission.update(Role.user(user.getId())),
                        Permission.delete(Role.user(user.getId())),
                    ],
                    userId: user.getId(),
                    userInternalId: user.getInternalId(),
                    providerType: 'sms',
                    identifier: phone,
                }));
                user.setAttribute('targets', [...user.getAttribute('targets', []), target]);
            } catch (error) {
                const existingTarget = await dbForProject.findOne('targets', [
                    Query.equal('identifier', [phone]),
                ]);
                if (existingTarget) {
                    user.setAttribute('targets', existingTarget, Document.SET_TYPE_APPEND);
                }
            }
        }

        await dbForProject.purgeCachedDocument('users', user.getId());
    } catch (error) {
        if (error instanceof Duplicate) {
            throw new Exception(Exception.USER_ALREADY_EXISTS);
        }
        throw error;
    }

    queueForEvents.setParam('userId', user.getId());

    return user;
}

App.post('/v1/users')
    .desc('Create user')
    .groups(['api', 'users'])
    .label('event', 'users.[userId].create')
    .label('scope', 'users.write')
    .label('audits.event', 'user.create')
    .label('audits.resource', 'user/{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'create')
    .label('sdk.description', '/docs/references/users/create-user.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USER)
    .param('userId', '', new CustomId(), 'User ID. Choose a custom ID or generate a random ID with `ID.unique()`. Valid chars are a-z, A-Z, 0-9, period, hyphen, and underscore. Can\'t start with a special char. Max length is 36 chars.')
    .param('email', null, new Email(), 'User email.', true)
    .param('phone', null, new Phone(), 'Phone number. Format this number with a leading \'+\' and a country code, e.g., +16175551212.', true)
    .param('password', '', ({ project, passwordsDictionary }: { project: Document, passwordsDictionary: any }) => new PasswordDictionary(passwordsDictionary, project.getAttribute('auths', []).passwordDictionary ?? false), 'Plain text user password. Must be at least 8 chars.', true, ['project', 'passwordsDictionary'])
    .param('name', '', new Text(128), 'User name. Max length: 128 chars.', true)
    .inject('response')
    .inject('project')
    .inject('dbForProject')
    .inject('queueForEvents')
    .inject('hooks')
    .action(async (userId: string, email: string | null, phone: string | null, password: string | null, name: string, response: Response, project: Document, dbForProject: Database, queueForEvents: Event, hooks: Hooks) => {
        const user = await createUser('plaintext', '{}', userId, email, password, phone, name, project, dbForProject, queueForEvents, hooks);
        response
            .setStatusCode(Response.STATUS_CODE_CREATED)
            .dynamic(user, Response.MODEL_USER);
    });

App.post('/v1/users/bcrypt')
    .desc('Create user with bcrypt password')
    .groups(['api', 'users'])
    .label('event', 'users.[userId].create')
    .label('scope', 'users.write')
    .label('audits.event', 'user.create')
    .label('audits.resource', 'user/{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'createBcryptUser')
    .label('sdk.description', '/docs/references/users/create-bcrypt-user.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USER)
    .param('userId', '', new CustomId(), 'User ID. Choose a custom ID or generate a random ID with `ID.unique()`. Valid chars are a-z, A-Z, 0-9, period, hyphen, and underscore. Can\'t start with a special char. Max length is 36 chars.')
    .param('email', '', new Email(), 'User email.')
    .param('password', '', new Password(), 'User password hashed using Bcrypt.')
    .param('name', '', new Text(128), 'User name. Max length: 128 chars.', true)
    .inject('response')
    .inject('project')
    .inject('dbForProject')
    .inject('queueForEvents')
    .inject('hooks')
    .action(async (userId: string, email: string, password: string, name: string, response: Response, project: Document, dbForProject: Database, queueForEvents: Event, hooks: Hooks) => {
        const user = await createUser('bcrypt', '{}', userId, email, password, null, name, project, dbForProject, queueForEvents, hooks);

        response
            .setStatusCode(Response.STATUS_CODE_CREATED)
            .dynamic(user, Response.MODEL_USER);
    });

App.post('/v1/users/md5')
    .desc('Create user with MD5 password')
    .groups(['api', 'users'])
    .label('event', 'users.[userId].create')
    .label('scope', 'users.write')
    .label('audits.event', 'user.create')
    .label('audits.resource', 'user/{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'createMD5User')
    .label('sdk.description', '/docs/references/users/create-md5-user.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USER)
    .param('userId', '', new CustomId(), 'User ID. Choose a custom ID or generate a random ID with `ID.unique()`. Valid chars are a-z, A-Z, 0-9, period, hyphen, and underscore. Can\'t start with a special char. Max length is 36 chars.')
    .param('email', '', new Email(), 'User email.')
    .param('password', '', new Password(), 'User password hashed using MD5.')
    .param('name', '', new Text(128), 'User name. Max length: 128 chars.', true)
    .inject('response')
    .inject('project')
    .inject('dbForProject')
    .inject('queueForEvents')
    .inject('hooks')
    .action(async (userId: string, email: string, password: string, name: string, response: Response, project: Document, dbForProject: Database, queueForEvents: Event, hooks: Hooks) => {
        const user = await createUser('md5', '{}', userId, email, password, null, name, project, dbForProject, queueForEvents, hooks);

        response
            .setStatusCode(Response.STATUS_CODE_CREATED)
            .dynamic(user, Response.MODEL_USER);
    });

App.post('/v1/users/argon2')
    .desc('Create user with Argon2 password')
    .groups(['api', 'users'])
    .label('event', 'users.[userId].create')
    .label('scope', 'users.write')
    .label('audits.event', 'user.create')
    .label('audits.resource', 'user/{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'createArgon2User')
    .label('sdk.description', '/docs/references/users/create-argon2-user.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USER)
    .param('userId', '', new CustomId(), 'User ID. Choose a custom ID or generate a random ID with `ID.unique()`. Valid chars are a-z, A-Z, 0-9, period, hyphen, and underscore. Can\'t start with a special char. Max length is 36 chars.')
    .param('email', '', new Email(), 'User email.')
    .param('password', '', new Password(), 'User password hashed using Argon2.')
    .param('name', '', new Text(128), 'User name. Max length: 128 chars.', true)
    .inject('response')
    .inject('project')
    .inject('dbForProject')
    .inject('queueForEvents')
    .inject('hooks')
    .action(async (userId: string, email: string, password: string, name: string, response: Response, project: Document, dbForProject: Database, queueForEvents: Event, hooks: Hooks) => {
        const user = await createUser('argon2', '{}', userId, email, password, null, name, project, dbForProject, queueForEvents, hooks);

        response
            .setStatusCode(Response.STATUS_CODE_CREATED)
            .dynamic(user, Response.MODEL_USER);
    });

App.post('/v1/users/sha')
    .desc('Create user with SHA password')
    .groups(['api', 'users'])
    .label('event', 'users.[userId].create')
    .label('scope', 'users.write')
    .label('audits.event', 'user.create')
    .label('audits.resource', 'user/{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'createSHAUser')
    .label('sdk.description', '/docs/references/users/create-sha-user.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USER)
    .param('userId', '', new CustomId(), 'User ID. Choose a custom ID or generate a random ID with `ID.unique()`. Valid chars are a-z, A-Z, 0-9, period, hyphen, and underscore. Can\'t start with a special char. Max length is 36 chars.')
    .param('email', '', new Email(), 'User email.')
    .param('password', '', new Password(), 'User password hashed using SHA.')
    .param('passwordVersion', '', new WhiteList(['sha1', 'sha224', 'sha256', 'sha384', 'sha512/224', 'sha512/256', 'sha512', 'sha3-224', 'sha3-256', 'sha3-384', 'sha3-512']), "Optional SHA version used to hash password. Allowed values are: 'sha1', 'sha224', 'sha256', 'sha384', 'sha512/224', 'sha512/256', 'sha512', 'sha3-224', 'sha3-256', 'sha3-384', 'sha3-512'", true)
    .param('name', '', new Text(128), 'User name. Max length: 128 chars.', true)
    .inject('response')
    .inject('project')
    .inject('dbForProject')
    .inject('queueForEvents')
    .inject('hooks')
    .action(async (userId: string, email: string, password: string, passwordVersion: string, name: string, response: Response, project: Document, dbForProject: Database, queueForEvents: Event, hooks: Hooks) => {
        let options = '{}';

        if (passwordVersion) {
            options = `{"version":"${passwordVersion}"}`;
        }

        const user = await createUser('sha', options, userId, email, password, null, name, project, dbForProject, queueForEvents, hooks);

        response
            .setStatusCode(Response.STATUS_CODE_CREATED)
            .dynamic(user, Response.MODEL_USER);
    });

App.post('/v1/users/phpass')
    .desc('Create user with PHPass password')
    .groups(['api', 'users'])
    .label('event', 'users.[userId].create')
    .label('scope', 'users.write')
    .label('audits.event', 'user.create')
    .label('audits.resource', 'user/{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'createPHPassUser')
    .label('sdk.description', '/docs/references/users/create-phpass-user.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USER)
    .param('userId', '', new CustomId(), 'User ID. Choose a custom ID or pass the string `ID.unique()` to auto generate it. Valid chars are a-z, A-Z, 0-9, period, hyphen, and underscore. Can\'t start with a special char. Max length is 36 chars.')
    .param('email', '', new Email(), 'User email.')
    .param('password', '', new Password(), 'User password hashed using PHPass.')
    .param('name', '', new Text(128), 'User name. Max length: 128 chars.', true)
    .inject('response')
    .inject('project')
    .inject('dbForProject')
    .inject('queueForEvents')
    .inject('hooks')
    .action(async (userId: string, email: string, password: string, name: string, response: Response, project: Document, dbForProject: Database, queueForEvents: Event, hooks: Hooks) => {
        const user = await createUser('phpass', '{}', userId, email, password, null, name, project, dbForProject, queueForEvents, hooks);

        response
            .setStatusCode(Response.STATUS_CODE_CREATED)
            .dynamic(user, Response.MODEL_USER);
    });

App.post('/v1/users/scrypt')
    .desc('Create user with Scrypt password')
    .groups(['api', 'users'])
    .label('event', 'users.[userId].create')
    .label('scope', 'users.write')
    .label('audits.event', 'user.create')
    .label('audits.resource', 'user/{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'createScryptUser')
    .label('sdk.description', '/docs/references/users/create-scrypt-user.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USER)
    .param('userId', '', new CustomId(), 'User ID. Choose a custom ID or generate a random ID with `ID.unique()`. Valid chars are a-z, A-Z, 0-9, period, hyphen, and underscore. Can\'t start with a special char. Max length is 36 chars.')
    .param('email', '', new Email(), 'User email.')
    .param('password', '', new Password(), 'User password hashed using Scrypt.')
    .param('passwordSalt', '', new Text(128), 'Optional salt used to hash password.')
    .param('passwordCpu', 8, new Integer(), 'Optional CPU cost used to hash password.')
    .param('passwordMemory', 14, new Integer(), 'Optional memory cost used to hash password.')
    .param('passwordParallel', 1, new Integer(), 'Optional parallelization cost used to hash password.')
    .param('passwordLength', 64, new Integer(), 'Optional hash length used to hash password.')
    .param('name', '', new Text(128), 'User name. Max length: 128 chars.', true)
    .inject('response')
    .inject('project')
    .inject('dbForProject')
    .inject('queueForEvents')
    .inject('hooks')
    .action(async (userId: string, email: string, password: string, passwordSalt: string, passwordCpu: number, passwordMemory: number, passwordParallel: number, passwordLength: number, name: string, response: Response, project: Document, dbForProject: Database, queueForEvents: Event, hooks: Hooks) => {
        const options = {
            salt: passwordSalt,
            costCpu: passwordCpu,
            costMemory: passwordMemory,
            costParallel: passwordParallel,
            length: passwordLength
        };

        const user = await createUser('scrypt', JSON.stringify(options), userId, email, password, null, name, project, dbForProject, queueForEvents, hooks);

        response
            .setStatusCode(Response.STATUS_CODE_CREATED)
            .dynamic(user, Response.MODEL_USER);
    });

App.post('/v1/users/scrypt-modified')
    .desc('Create user with Scrypt modified password')
    .groups(['api', 'users'])
    .label('event', 'users.[userId].create')
    .label('scope', 'users.write')
    .label('audits.event', 'user.create')
    .label('audits.resource', 'user/{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'createScryptModifiedUser')
    .label('sdk.description', '/docs/references/users/create-scrypt-modified-user.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USER)
    .param('userId', '', new CustomId(), 'User ID. Choose a custom ID or generate a random ID with `ID.unique()`. Valid chars are a-z, A-Z, 0-9, period, hyphen, and underscore. Can\'t start with a special char. Max length is 36 chars.')
    .param('email', '', new Email(), 'User email.')
    .param('password', '', new Password(), 'User password hashed using Scrypt Modified.')
    .param('passwordSalt', '', new Text(128), 'Salt used to hash password.')
    .param('passwordSaltSeparator', '', new Text(128), 'Salt separator used to hash password.')
    .param('passwordSignerKey', '', new Text(128), 'Signer key used to hash password.')
    .param('name', '', new Text(128), 'User name. Max length: 128 chars.', true)
    .inject('response')
    .inject('project')
    .inject('dbForProject')
    .inject('queueForEvents')
    .inject('hooks')
    .action(async (userId: string, email: string, password: string, passwordSalt: string, passwordSaltSeparator: string, passwordSignerKey: string, name: string, response: Response, project: Document, dbForProject: Database, queueForEvents: Event, hooks: Hooks) => {
        const options = {
            signerKey: passwordSignerKey,
            saltSeparator: passwordSaltSeparator,
            salt: passwordSalt
        };

        const user = await createUser('scryptMod', JSON.stringify(options), userId, email, password, null, name, project, dbForProject, queueForEvents, hooks);

        response
            .setStatusCode(Response.STATUS_CODE_CREATED)
            .dynamic(user, Response.MODEL_USER);
    });

App.post('/v1/users/:userId/targets')
    .desc('Create User Target')
    .groups(['api', 'users'])
    .label('audits.event', 'target.create')
    .label('audits.resource', 'target/response.$id')
    .label('event', 'users.[userId].targets.[targetId].create')
    .label('scope', 'targets.write')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'createTarget')
    .label('sdk.description', '/docs/references/users/create-target.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_TARGET)
    .param('targetId', '', new CustomId(), 'Target ID. Choose a custom ID or generate a random ID with `ID.unique()`. Valid chars are a-z, A-Z, 0-9, period, hyphen, and underscore. Can\'t start with a special char. Max length is 36 chars.')
    .param('userId', '', new UID(), 'User ID.')
    .param('providerType', '', new WhiteList([MESSAGE_TYPE_EMAIL, MESSAGE_TYPE_SMS, MESSAGE_TYPE_PUSH]), 'The target provider type. Can be one of the following: `email`, `sms` or `push`.')
    .param('identifier', '', new Text(Database.LENGTH_KEY), 'The target identifier (token, email, phone etc.)')
    .param('providerId', '', new UID(), 'Provider ID. Message will be sent to this target from the specified provider ID. If no provider ID is set the first setup provider will be used.', true)
    .param('name', '', new Text(128), 'Target name. Max length: 128 chars. For example: My Awesome App Galaxy S23.', true)
    .inject('queueForEvents')
    .inject('response')
    .inject('dbForProject')
    .action(async (targetId: string, userId: string, providerType: string, identifier: string, providerId: string, name: string, queueForEvents: Event, response: Response, dbForProject: Database) => {
        targetId = targetId === 'unique()' ? ID.unique() : targetId;

        const provider = await dbForProject.getDocument('providers', providerId);

        switch (providerType) {
            case 'email':
                const emailValidator = new Email();
                if (!emailValidator.isValid(identifier)) {
                    throw new Exception(Exception.GENERAL_INVALID_EMAIL);
                }
                break;
            case MESSAGE_TYPE_SMS:
                const phoneValidator = new Phone();
                if (!phoneValidator.isValid(identifier)) {
                    throw new Exception(Exception.GENERAL_INVALID_PHONE);
                }
                break;
            case MESSAGE_TYPE_PUSH:
                break;
            default:
                throw new Exception(Exception.PROVIDER_INCORRECT_TYPE);
        }

        const user = await dbForProject.getDocument('users', userId);

        if (user.isEmpty()) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        let target = await dbForProject.getDocument('targets', targetId);

        if (!target.isEmpty()) {
            throw new Exception(Exception.USER_TARGET_ALREADY_EXISTS);
        }

        try {
            target = await dbForProject.createDocument('targets', new Document({
                $id: targetId,
                $permissions: [
                    Permission.read(Role.user(user.getId())),
                    Permission.update(Role.user(user.getId())),
                    Permission.delete(Role.user(user.getId())),
                ],
                providerId: provider.isEmpty() ? null : provider.getId(),
                providerInternalId: provider.isEmpty() ? null : provider.getInternalId(),
                providerType: providerType,
                userId: userId,
                userInternalId: user.getInternalId(),
                identifier: identifier,
                name: name !== '' ? name : null,
            }));
        } catch (error) {
            if (error instanceof Duplicate) {
                throw new Exception(Exception.USER_TARGET_ALREADY_EXISTS);
            }
            throw error;
        }

        await dbForProject.purgeCachedDocument('users', user.getId());

        queueForEvents
            .setParam('userId', user.getId())
            .setParam('targetId', target.getId());

        response
            .setStatusCode(Response.STATUS_CODE_CREATED)
            .dynamic(target, Response.MODEL_TARGET);
    });

App.get('/v1/users')
    .desc('List users')
    .groups(['api', 'users'])
    .label('scope', 'users.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'list')
    .label('sdk.description', '/docs/references/users/list-users.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USER_LIST)
    .param('queries', [], new Users(), 'Array of query strings generated using the Query class provided by the SDK. [Learn more about queries](https://appconda.io/docs/queries). Maximum of ' + APP_LIMIT_ARRAY_PARAMS_SIZE + ' queries are allowed, each ' + APP_LIMIT_ARRAY_ELEMENT_SIZE + ' characters long. You may filter on the following attributes: ' + Users.ALLOWED_ATTRIBUTES.join(', '), true)
    .param('search', '', new Text(256), 'Search term to filter your list results. Max length: 256 chars.', true)
    .inject('response')
    .inject('dbForProject')
    .action(async (queries: any[], search: string, response: Response, dbForProject: Database) => {
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
        let cursor: any = queries.filter(query => [Query.TYPE_CURSOR_AFTER, Query.TYPE_CURSOR_BEFORE].includes(query.getMethod()));
        cursor = cursor.length ? cursor[0] : null;

        if (cursor) {
            const userId = cursor.getValue();
            const cursorDocument = await dbForProject.getDocument('users', userId);

            if (cursorDocument.isEmpty()) {
                throw new Exception(Exception.GENERAL_CURSOR_NOT_FOUND, `User '${userId}' for the 'cursor' value not found.`);
            }

            cursor.setValue(cursorDocument);
        }

        const filterQueries = Query.groupByType(queries).filters;

        response.dynamic(new Document({
            users: await dbForProject.find('users', queries),
            total: await dbForProject.count('users', filterQueries, APP_LIMIT_COUNT),
        }), Response.MODEL_USER_LIST);
    });

App.get('/v1/users/:userId')
    .desc('Get user')
    .groups(['api', 'users'])
    .label('scope', 'users.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'get')
    .label('sdk.description', '/docs/references/users/get-user.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USER)
    .param('userId', '', new UID(), 'User ID.')
    .inject('response')
    .inject('dbForProject')
    .action(async (userId: string, response: Response, dbForProject: Database) => {
        const user = await dbForProject.getDocument('users', userId);

        if (user.isEmpty()) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        response.dynamic(user, Response.MODEL_USER);
    });

App.get('/v1/users/:userId/prefs')
    .desc('Get user preferences')
    .groups(['api', 'users'])
    .label('scope', 'users.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'getPrefs')
    .label('sdk.description', '/docs/references/users/get-user-prefs.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_PREFERENCES)
    .param('userId', '', new UID(), 'User ID.')
    .inject('response')
    .inject('dbForProject')
    .action(async (userId: string, response: Response, dbForProject: Database) => {
        const user = await dbForProject.getDocument('users', userId);

        if (user.isEmpty()) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        const prefs = user.getAttribute('prefs', []);

        response.dynamic(new Document(prefs), Response.MODEL_PREFERENCES);
    });

App.get('/v1/users/:userId/targets/:targetId')
    .desc('Get User Target')
    .groups(['api', 'users'])
    .label('scope', 'targets.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'getTarget')
    .label('sdk.description', '/docs/references/users/get-user-target.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_TARGET)
    .param('userId', '', new UID(), 'User ID.')
    .param('targetId', '', new UID(), 'Target ID.')
    .inject('response')
    .inject('dbForProject')
    .action(async (userId: string, targetId: string, response: Response, dbForProject: Database) => {
        const user = await dbForProject.getDocument('users', userId);

        if (user.isEmpty()) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        const target = user.find('$id', targetId, 'targets');

        if (!target) {
            throw new Exception(Exception.USER_TARGET_NOT_FOUND);
        }

        response.dynamic(target, Response.MODEL_TARGET);
    });

App.get('/v1/users/:userId/sessions')
    .desc('List user sessions')
    .groups(['api', 'users'])
    .label('scope', 'users.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'listSessions')
    .label('sdk.description', '/docs/references/users/list-user-sessions.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_SESSION_LIST)
    .param('userId', '', new UID(), 'User ID.')
    .inject('response')
    .inject('dbForProject')
    .inject('locale')
    .action(async (userId: string, response: Response, dbForProject: Database, locale: Locale) => {
        const user = await dbForProject.getDocument('users', userId);

        if (user.isEmpty()) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        const sessions = user.getAttribute('sessions', []);

        for (let key in sessions) {
            if (sessions.hasOwnProperty(key)) {
                const session = sessions[key];
                const countryName = locale.getText('countries.' + session.getAttribute('countryCode').toLowerCase(), locale.getText('locale.country.unknown'));
                session.setAttribute('countryName', countryName);
                session.setAttribute('current', false);
                sessions[key] = session;
            }
        }

        response.dynamic(new Document({
            sessions: sessions,
            total: sessions.length,
        }), Response.MODEL_SESSION_LIST);
    });

App.get('/v1/users/:userId/memberships')
    .desc('List user memberships')
    .groups(['api', 'users'])
    .label('scope', 'users.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'listMemberships')
    .label('sdk.description', '/docs/references/users/list-user-memberships.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_MEMBERSHIP_LIST)
    .param('userId', '', new UID(), 'User ID.')
    .inject('response')
    .inject('dbForProject')
    .action(async (userId: string, response: Response, dbForProject: Database) => {
        const user = await dbForProject.getDocument('users', userId);

        if (user.isEmpty()) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        const memberships = user.getAttribute('memberships', []).map(async (membership: Document) => {
            const team = await dbForProject.getDocument('teams', membership.getAttribute('teamId'));

            membership
                .setAttribute('teamName', team.getAttribute('name'))
                .setAttribute('userName', user.getAttribute('name'))
                .setAttribute('userEmail', user.getAttribute('email'));

            return membership;
        });

        const resolvedMemberships = await Promise.all(memberships);

        response.dynamic(new Document({
            memberships: resolvedMemberships,
            total: resolvedMemberships.length,
        }), Response.MODEL_MEMBERSHIP_LIST);
    });

App.get('/v1/users/:userId/logs')
    .desc('List user logs')
    .groups(['api', 'users'])
    .label('scope', 'users.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'listLogs')
    .label('sdk.description', '/docs/references/users/list-user-logs.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_LOG_LIST)
    .param('userId', '', new UID(), 'User ID.')
    .param('queries', [], new Queries([new Limit(), new Offset()]), 'Array of query strings generated using the Query class provided by the SDK. [Learn more about queries](https://appconda.io/docs/queries). Only supported methods are limit and offset', true)
    .inject('response')
    .inject('dbForProject')
    .inject('locale')
    .inject('geodb')
    .action(async (userId: string, queries: any[], response: Response, dbForProject: Database, locale: Locale, geodb: any) => {
        const user = await dbForProject.getDocument('users', userId);

        if (user.isEmpty()) {
            throw new Exception(Exception.USER_NOT_FOUND);
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
        const logs = await audit.getLogsByUser(user.getInternalId(), limit, offset);

        const output = await Promise.all(logs.map(async (log: any) => {
            log['userAgent'] = log['userAgent'] || 'UNKNOWN';

            const detector = new Detector(log['userAgent']);
            detector.skipBotDetection();

            const os = detector.getOS();
            const client = detector.getClient();
            const device = detector.getDevice();

            const record = await geodb.get(log['ip']);
            const countryCode = record ? locale.getText('countries.' + record['country']['iso_code'].toLowerCase(), false) ? record['country']['iso_code'].toLowerCase() : '--' : '--';
            const countryName = record ? locale.getText('countries.' + record['country']['iso_code'].toLowerCase(), locale.getText('locale.country.unknown')) : locale.getText('locale.country.unknown');

            return new Document({
                event: log['event'],
                userId: ID.custom(log['data']['userId']),
                userEmail: log['data']['userEmail'] ?? null,
                userName: log['data']['userName'] ?? null,
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
                deviceModel: device['deviceModel'],
                countryCode: countryCode,
                countryName: countryName
            });
        }));

        response.dynamic(new Document({
            total: await audit.countLogsByUser(user.getInternalId()),
            logs: output,
        }), Response.MODEL_LOG_LIST);
    });

App.get('/v1/users/:userId/targets')
    .desc('List User Targets')
    .groups(['api', 'users'])
    .label('scope', 'targets.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'listTargets')
    .label('sdk.description', '/docs/references/users/list-user-targets.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_TARGET_LIST)
    .param('userId', '', new UID(), 'User ID.')
    .param('queries', [], new Targets(), 'Array of query strings generated using the Query class provided by the SDK. [Learn more about queries](https://appconda.io/docs/queries). Maximum of ' + APP_LIMIT_ARRAY_PARAMS_SIZE + ' queries are allowed, each ' + APP_LIMIT_ARRAY_ELEMENT_SIZE + ' characters long. You may filter on the following attributes: ' + Users.ALLOWED_ATTRIBUTES.join(', '), true)
    .inject('response')
    .inject('dbForProject')
    .action(async (userId: string, queries: any[], response: Response, dbForProject: Database) => {
        const user = await dbForProject.getDocument('users', userId);

        if (user.isEmpty()) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        try {
            queries = Query.parseQueries(queries);
        } catch (e) {
            if (e instanceof QueryException) {
                throw new Exception(Exception.GENERAL_QUERY_INVALID, e.message);
            }
            throw e;
        }

        queries.push(Query.equal('userId', [userId]));

        // Get cursor document if there was a cursor query
        let cursor: any = queries.filter(query => [Query.TYPE_CURSOR_AFTER, Query.TYPE_CURSOR_BEFORE].includes(query.getMethod()));
        cursor = cursor.length ? cursor[0] : null;

        if (cursor) {
            const targetId = cursor.getValue();
            const cursorDocument = await dbForProject.getDocument('targets', targetId);

            if (cursorDocument.isEmpty()) {
                throw new Exception(Exception.GENERAL_CURSOR_NOT_FOUND, `Target '${targetId}' for the 'cursor' value not found.`);
            }

            cursor.setValue(cursorDocument);
        }

        const targets = await dbForProject.find('targets', queries);
        const total = await dbForProject.count('targets', queries, APP_LIMIT_COUNT);

        response.dynamic(new Document({
            targets: targets,
            total: total,
        }), Response.MODEL_TARGET_LIST);
    });

App.get('/v1/users/identities')
    .desc('List Identities')
    .groups(['api', 'users'])
    .label('scope', 'users.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'listIdentities')
    .label('sdk.description', '/docs/references/users/list-identities.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_IDENTITY_LIST)
    .param('queries', [], new Identities(), 'Array of query strings generated using the Query class provided by the SDK. [Learn more about queries](https://appconda.io/docs/queries). Maximum of ' + APP_LIMIT_ARRAY_PARAMS_SIZE + ' queries are allowed, each ' + APP_LIMIT_ARRAY_ELEMENT_SIZE + ' characters long. You may filter on the following attributes: ' + Identities.ALLOWED_ATTRIBUTES.join(', '), true)
    .param('search', '', new Text(256), 'Search term to filter your list results. Max length: 256 chars.', true)
    .inject('response')
    .inject('dbForProject')
    .action(async (queries: any[], search: string, response: Response, dbForProject: Database) => {
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
        let cursor: any = queries.filter(query => [Query.TYPE_CURSOR_AFTER, Query.TYPE_CURSOR_BEFORE].includes(query.getMethod()));
        cursor = cursor.length ? cursor[0] : null;

        if (cursor) {
            const identityId = cursor.getValue();
            const cursorDocument = await dbForProject.getDocument('identities', identityId);

            if (cursorDocument.isEmpty()) {
                throw new Exception(Exception.GENERAL_CURSOR_NOT_FOUND, `User '${identityId}' for the 'cursor' value not found.`);
            }

            cursor.setValue(cursorDocument);
        }

        const filterQueries = Query.groupByType(queries).filters;

        const identities = await dbForProject.find('identities', queries);
        const total = await dbForProject.count('identities', filterQueries, APP_LIMIT_COUNT);

        response.dynamic(new Document({
            identities: identities,
            total: total,
        }), Response.MODEL_IDENTITY_LIST);
    });

App.patch('/v1/users/:userId/status')
    .desc('Update user status')
    .groups(['api', 'users'])
    .label('event', 'users.[userId].update.status')
    .label('scope', 'users.write')
    .label('audits.event', 'user.update')
    .label('audits.resource', 'user/{response.$id}')
    .label('audits.userId', '{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'updateStatus')
    .label('sdk.description', '/docs/references/users/update-user-status.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USER)
    .param('userId', '', new UID(), 'User ID.')
    .param('status', null, new Boolean(true), 'User Status. To activate the user pass `true` and to block the user pass `false`.')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async (userId: string, status: boolean, response: Response, dbForProject: Database, queueForEvents: Event) => {
        const user = await dbForProject.getDocument('users', userId);

        if (user.isEmpty()) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        const updatedUser = await dbForProject.updateDocument('users', user.getId(), user.setAttribute('status', status));

        queueForEvents.setParam('userId', updatedUser.getId());

        response.dynamic(updatedUser, Response.MODEL_USER);
    });

App.put('/v1/users/:userId/labels')
    .desc('Update user labels')
    .groups(['api', 'users'])
    .label('event', 'users.[userId].update.labels')
    .label('scope', 'users.write')
    .label('audits.event', 'user.update')
    .label('audits.resource', 'user/{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'updateLabels')
    .label('sdk.description', '/docs/references/users/update-user-labels.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USER)
    .param('userId', '', new UID(), 'User ID.')
    .param('labels', [], new ArrayList(new Text(36, [...Text.NUMBERS, ...Text.ALPHABET_UPPER, ...Text.ALPHABET_LOWER] as any), APP_LIMIT_ARRAY_LABELS_SIZE), 'Array of user labels. Replaces the previous labels. Maximum of ' + APP_LIMIT_ARRAY_LABELS_SIZE + ' labels are allowed, each up to 36 alphanumeric characters long.')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async (userId: string, labels: string[], response: Response, dbForProject: Database, queueForEvents: Event) => {
        let user = await dbForProject.getDocument('users', userId);

        if (user.isEmpty()) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        user.setAttribute('labels', Array.from(new Set(labels)));

        user = await dbForProject.updateDocument('users', user.getId(), user);

        queueForEvents.setParam('userId', user.getId());

        response.dynamic(user, Response.MODEL_USER);
    });

App.patch('/v1/users/:userId/verification/phone')
    .desc('Update phone verification')
    .groups(['api', 'users'])
    .label('event', 'users.[userId].update.verification')
    .label('scope', 'users.write')
    .label('audits.event', 'verification.update')
    .label('audits.resource', 'user/{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'updatePhoneVerification')
    .label('sdk.description', '/docs/references/users/update-user-phone-verification.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USER)
    .param('userId', '', new UID(), 'User ID.')
    .param('phoneVerification', false, new Boolean(), 'User phone verification status.')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async (userId: string, phoneVerification: boolean, response: Response, dbForProject: Database, queueForEvents: Event) => {
        const user = await dbForProject.getDocument('users', userId);

        if (user.isEmpty()) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        const updatedUser = await dbForProject.updateDocument('users', user.getId(), user.setAttribute('phoneVerification', phoneVerification));

        queueForEvents.setParam('userId', updatedUser.getId());

        response.dynamic(updatedUser, Response.MODEL_USER);
    });

App.patch('/v1/users/:userId/name')
    .desc('Update name')
    .groups(['api', 'users'])
    .label('event', 'users.[userId].update.name')
    .label('scope', 'users.write')
    .label('audits.event', 'user.update')
    .label('audits.resource', 'user/{response.$id}')
    .label('audits.userId', '{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'updateName')
    .label('sdk.description', '/docs/references/users/update-user-name.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USER)
    .param('userId', '', new UID(), 'User ID.')
    .param('name', '', new Text(128, 0), 'User name. Max length: 128 chars.')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async (userId: string, name: string, response: Response, dbForProject: Database, queueForEvents: Event) => {
        const user = await dbForProject.getDocument('users', userId);

        if (user.isEmpty()) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        user.setAttribute('name', name);

        const updatedUser = await dbForProject.updateDocument('users', user.getId(), user);

        queueForEvents.setParam('userId', updatedUser.getId());

        response.dynamic(updatedUser, Response.MODEL_USER);
    });

App.patch('/v1/users/:userId/password')
    .desc('Update password')
    .groups(['api', 'users'])
    .label('event', 'users.[userId].update.password')
    .label('scope', 'users.write')
    .label('audits.event', 'user.update')
    .label('audits.resource', 'user/{response.$id}')
    .label('audits.userId', '{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'updatePassword')
    .label('sdk.description', '/docs/references/users/update-user-password.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USER)
    .param('userId', '', new UID(), 'User ID.')
    .param('password', '', (project, passwordsDictionary) => new PasswordDictionary(passwordsDictionary,
        project.getAttribute('auths', [])['passwordDictionary'] ?? false, true), 'New user password. Must be at least 8 chars.', false, ['project', 'passwordsDictionary'])
    .inject('response')
    .inject('project')
    .inject('dbForProject')
    .inject('queueForEvents')
    .inject('hooks')
    .action(async (userId: string, password: string, response: Response, project: Document, dbForProject: Database, queueForEvents: Event, hooks: Hooks) => {
        let user = await dbForProject.getDocument('users', userId);

        if (user.isEmpty()) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        if (project.getAttribute('auths', [])['personalDataCheck'] ?? false) {
            const personalDataValidator = new PersonalData(userId, user.getAttribute('email'), user.getAttribute('name'), user.getAttribute('phone'));
            if (!personalDataValidator.isValid(password)) {
                throw new Exception(Exception.USER_PASSWORD_PERSONAL_DATA);
            }
        }

        if (password.length === 0) {
            user
                .setAttribute('password', '')
                .setAttribute('passwordUpdate', DateTime.now());

            user = await dbForProject.updateDocument('users', user.getId(), user);
            queueForEvents.setParam('userId', user.getId());
            return response.dynamic(user, Response.MODEL_USER);
        }

        hooks.trigger('passwordValidator', [dbForProject, project, password, user, true]);

        const newPassword = Auth.passwordHash(password, Auth.DEFAULT_ALGO, Auth.DEFAULT_ALGO_OPTIONS);

        const historyLimit = project.getAttribute('auths', [])['passwordHistory'] ?? 0;
        let history = user.getAttribute('passwordHistory', []);
        if (historyLimit > 0) {
            const validator = new PasswordHistory(history, user.getAttribute('hash'), user.getAttribute('hashOptions'));
            if (!validator.isValid(password)) {
                throw new Exception(Exception.USER_PASSWORD_RECENTLY_USED);
            }

            history.push(newPassword);
            history = history.slice(-historyLimit);
        }

        user
            .setAttribute('password', newPassword)
            .setAttribute('passwordHistory', history)
            .setAttribute('passwordUpdate', DateTime.now())
            .setAttribute('hash', Auth.DEFAULT_ALGO)
            .setAttribute('hashOptions', Auth.DEFAULT_ALGO_OPTIONS);

        user = await dbForProject.updateDocument('users', user.getId(), user);

        queueForEvents.setParam('userId', user.getId());

        response.dynamic(user, Response.MODEL_USER);
    });

App.patch('/v1/users/:userId/email')
    .desc('Update email')
    .groups(['api', 'users'])
    .label('event', 'users.[userId].update.email')
    .label('scope', 'users.write')
    .label('audits.event', 'user.update')
    .label('audits.resource', 'user/{response.$id}')
    .label('audits.userId', '{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'updateEmail')
    .label('sdk.description', '/docs/references/users/update-user-email.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USER)
    .param('userId', '', new UID(), 'User ID.')
    .param('email', '', new Email(true), 'User email.')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async (userId: string, email: string, response: Response, dbForProject: Database, queueForEvents: Event) => {
        let user = await dbForProject.getDocument('users', userId);

        if (user.isEmpty()) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        email = email.toLowerCase();

        if (email.length !== 0) {
            // Makes sure this email is not already used in another identity
            const identityWithMatchingEmail = await dbForProject.findOne('identities', [
                Query.equal('providerEmail', [email]),
                Query.notEqual('userInternalId', user.getInternalId()),
            ]);
            if (identityWithMatchingEmail !== false && !identityWithMatchingEmail.isEmpty()) {
                throw new Exception(Exception.USER_EMAIL_ALREADY_EXISTS);
            }

            const target = await dbForProject.findOne('targets', [
                Query.equal('identifier', [email]),
            ]);

            if (target instanceof Document && !target.isEmpty()) {
                throw new Exception(Exception.USER_TARGET_ALREADY_EXISTS);
            }
        }

        const oldEmail = user.getAttribute('email');

        user
            .setAttribute('email', email)
            .setAttribute('emailVerification', false);

        try {
            user = await dbForProject.updateDocument('users', user.getId(), user);

            const oldTarget = user.find('identifier', oldEmail, 'targets');

            if (oldTarget instanceof Document && !oldTarget.isEmpty()) {
                if (email.length !== 0) {
                    await dbForProject.updateDocument('targets', oldTarget.getId(), oldTarget.setAttribute('identifier', email));
                } else {
                    await dbForProject.deleteDocument('targets', oldTarget.getId());
                }
            } else {
                if (email.length !== 0) {
                    const target = await dbForProject.createDocument('targets', new Document({
                        '$permissions': [
                            Permission.read(Role.user(user.getId())),
                            Permission.update(Role.user(user.getId())),
                            Permission.delete(Role.user(user.getId())),
                        ],
                        'userId': user.getId(),
                        'userInternalId': user.getInternalId(),
                        'providerType': 'email',
                        'identifier': email,
                    }));
                    user.setAttribute('targets', [...user.getAttribute('targets', []), target]);
                }
            }
            await dbForProject.purgeCachedDocument('users', user.getId());
        } catch (error) {
            if (error instanceof Duplicate) {
                throw new Exception(Exception.USER_EMAIL_ALREADY_EXISTS);
            }
            throw error;
        }

        queueForEvents.setParam('userId', user.getId());

        response.dynamic(user, Response.MODEL_USER);
    });

App.patch('/v1/users/:userId/phone')
    .desc('Update phone')
    .groups(['api', 'users'])
    .label('event', 'users.[userId].update.phone')
    .label('scope', 'users.write')
    .label('audits.event', 'user.update')
    .label('audits.resource', 'user/{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'updatePhone')
    .label('sdk.description', '/docs/references/users/update-user-phone.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USER)
    .param('userId', '', new UID(), 'User ID.')
    .param('number', '', new Phone(true), 'User phone number.')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async (userId: string, number: string, response: Response, dbForProject: Database, queueForEvents: Event) => {
        let user = await dbForProject.getDocument('users', userId);

        if (user.isEmpty()) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        const oldPhone = user.getAttribute('phone');

        user
            .setAttribute('phone', number)
            .setAttribute('phoneVerification', false);

        if (number.length !== 0) {
            const target = await dbForProject.findOne('targets', [
                Query.equal('identifier', [number]),
            ]);

            if (target instanceof Document && !target.isEmpty()) {
                throw new Exception(Exception.USER_TARGET_ALREADY_EXISTS);
            }
        }

        try {
            user = await dbForProject.updateDocument('users', user.getId(), user);

            const oldTarget = user.find('identifier', oldPhone, 'targets');

            if (oldTarget instanceof Document && !oldTarget.isEmpty()) {
                if (number.length !== 0) {
                    await dbForProject.updateDocument('targets', oldTarget.getId(), oldTarget.setAttribute('identifier', number));
                } else {
                    await dbForProject.deleteDocument('targets', oldTarget.getId());
                }
            } else {
                if (number.length !== 0) {
                    const target = await dbForProject.createDocument('targets', new Document({
                        '$permissions': [
                            Permission.read(Role.user(user.getId())),
                            Permission.update(Role.user(user.getId())),
                            Permission.delete(Role.user(user.getId())),
                        ],
                        'userId': user.getId(),
                        'userInternalId': user.getInternalId(),
                        'providerType': 'sms',
                        'identifier': number,
                    }));
                    user.setAttribute('targets', [...user.getAttribute('targets', []), target]);
                }
            }
            await dbForProject.purgeCachedDocument('users', user.getId());
        } catch (error) {
            if (error instanceof Duplicate) {
                throw new Exception(Exception.USER_PHONE_ALREADY_EXISTS);
            }
            throw error;
        }

        queueForEvents.setParam('userId', user.getId());

        response.dynamic(user, Response.MODEL_USER);
    });

App.patch('/v1/users/:userId/verification')
    .desc('Update email verification')
    .groups(['api', 'users'])
    .label('event', 'users.[userId].update.verification')
    .label('scope', 'users.write')
    .label('audits.event', 'verification.update')
    .label('audits.resource', 'user/{request.userId}')
    .label('audits.userId', '{request.userId}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'updateEmailVerification')
    .label('sdk.description', '/docs/references/users/update-user-email-verification.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USER)
    .param('userId', '', new UID(), 'User ID.')
    .param('emailVerification', false, new Boolean(), 'User email verification status.')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async (userId: string, emailVerification: boolean, response: Response, dbForProject: Database, queueForEvents: Event) => {
        let user = await dbForProject.getDocument('users', userId);

        if (user.isEmpty()) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        user = await dbForProject.updateDocument('users', user.getId(), user.setAttribute('emailVerification', emailVerification));

        queueForEvents.setParam('userId', user.getId());

        response.dynamic(user, Response.MODEL_USER);
    });

App.patch('/v1/users/:userId/prefs')
    .desc('Update user preferences')
    .groups(['api', 'users'])
    .label('event', 'users.[userId].update.prefs')
    .label('scope', 'users.write')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'updatePrefs')
    .label('sdk.description', '/docs/references/users/update-user-prefs.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_PREFERENCES)
    .param('userId', '', new UID(), 'User ID.')
    .param('prefs', '', new Assoc(), 'Prefs key-value JSON object.')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async (userId: string, prefs: Record<string, any>, response: Response, dbForProject: Database, queueForEvents: Event) => {
        let user = await dbForProject.getDocument('users', userId);

        if (user.isEmpty()) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        user = await dbForProject.updateDocument('users', user.getId(), user.setAttribute('prefs', prefs));

        queueForEvents.setParam('userId', user.getId());

        response.dynamic(new Document(prefs), Response.MODEL_PREFERENCES);
    });

App.patch('/v1/users/:userId/targets/:targetId')
    .desc('Update User target')
    .groups(['api', 'users'])
    .label('audits.event', 'target.update')
    .label('audits.resource', 'target/{response.$id}')
    .label('event', 'users.[userId].targets.[targetId].update')
    .label('scope', 'targets.write')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'updateTarget')
    .label('sdk.description', '/docs/references/users/update-target.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_TARGET)
    .param('userId', '', new UID(), 'User ID.')
    .param('targetId', '', new UID(), 'Target ID.')
    .param('identifier', '', new Text(Database.LENGTH_KEY), 'The target identifier (token, email, phone etc.)', true)
    .param('providerId', '', new UID(), 'Provider ID. Message will be sent to this target from the specified provider ID. If no provider ID is set the first setup provider will be used.', true)
    .param('name', '', new Text(128), 'Target name. Max length: 128 chars. For example: My Awesome App Galaxy S23.', true)
    .inject('queueForEvents')
    .inject('response')
    .inject('dbForProject')
    .action(async (userId: string, targetId: string, identifier: string, providerId: string, name: string, queueForEvents: Event, response: Response, dbForProject: Database) => {
        const user = await dbForProject.getDocument('users', userId);

        if (user.isEmpty()) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        const target = await dbForProject.getDocument('targets', targetId);

        if (target.isEmpty()) {
            throw new Exception(Exception.USER_TARGET_NOT_FOUND);
        }

        if (user.getId() !== target.getAttribute('userId')) {
            throw new Exception(Exception.USER_TARGET_NOT_FOUND);
        }

        if (identifier) {
            const providerType = target.getAttribute('providerType');

            switch (providerType) {
                case 'email': {
                    const validator = new Email();
                    if (!validator.isValid(identifier)) {
                        throw new Exception(Exception.GENERAL_INVALID_EMAIL);
                    }
                    break;
                }
                case MESSAGE_TYPE_SMS: {
                    const validator = new Phone();
                    if (!validator.isValid(identifier)) {
                        throw new Exception(Exception.GENERAL_INVALID_PHONE);
                    }
                    break;
                }
                case MESSAGE_TYPE_PUSH:
                    break;
                default:
                    throw new Exception(Exception.PROVIDER_INCORRECT_TYPE);
            }

            target.setAttribute('identifier', identifier);
        }

        if (providerId) {
            const provider = await dbForProject.getDocument('providers', providerId);

            if (provider.isEmpty()) {
                throw new Exception(Exception.PROVIDER_NOT_FOUND);
            }

            if (provider.getAttribute('type') !== target.getAttribute('providerType')) {
                throw new Exception(Exception.PROVIDER_INCORRECT_TYPE);
            }

            target.setAttribute('providerId', provider.getId());
            target.setAttribute('providerInternalId', provider.getInternalId());
        }

        if (name) {
            target.setAttribute('name', name);
        }

        const updatedTarget = await dbForProject.updateDocument('targets', target.getId(), target);
        await dbForProject.purgeCachedDocument('users', user.getId());

        queueForEvents
            .setParam('userId', user.getId())
            .setParam('targetId', updatedTarget.getId());

        response.dynamic(updatedTarget, Response.MODEL_TARGET);
    });

App.patch('/v1/users/:userId/mfa')
    .desc('Update MFA')
    .groups(['api', 'users'])
    .label('event', 'users.[userId].update.mfa')
    .label('scope', 'users.write')
    .label('audits.event', 'user.update')
    .label('audits.resource', 'user/{response.$id}')
    .label('audits.userId', '{response.$id}')
    .label('usage.metric', 'users.{scope}.requests.update')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'updateMfa')
    .label('sdk.description', '/docs/references/users/update-user-mfa.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USER)
    .param('userId', '', new UID(), 'User ID.')
    .param('mfa', null, new Boolean(), 'Enable or disable MFA.')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async (userId: string, mfa: boolean, response: Response, dbForProject: Database, queueForEvents: Event) => {
        const user = await dbForProject.getDocument('users', userId);

        if (user.isEmpty()) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        user.setAttribute('mfa', mfa);

        const updatedUser = await dbForProject.updateDocument('users', user.getId(), user);

        queueForEvents.setParam('userId', updatedUser.getId());

        response.dynamic(updatedUser, Response.MODEL_USER);
    });

App.get('/v1/users/:userId/mfa/factors')
    .desc('List Factors')
    .groups(['api', 'users'])
    .label('scope', 'users.read')
    .label('usage.metric', 'users.{scope}.requests.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'listMfaFactors')
    .label('sdk.description', '/docs/references/users/list-mfa-factors.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_MFA_FACTORS)
    .param('userId', '', new UID(), 'User ID.')
    .inject('response')
    .inject('dbForProject')
    .action(async (userId: string, response: Response, dbForProject: Database) => {
        const user = await dbForProject.getDocument('users', userId);

        if (user.isEmpty()) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        const totp = TOTP.getAuthenticatorFromUser(user);

        const factors = new Document({
            [Type.TOTP]: totp !== null && totp.getAttribute('verified', false),
            [Type.EMAIL]: user.getAttribute('email', false) && user.getAttribute('emailVerification', false),
            [Type.PHONE]: user.getAttribute('phone', false) && user.getAttribute('phoneVerification', false)
        });

        response.dynamic(factors, Response.MODEL_MFA_FACTORS);
    });

App.get('/v1/users/:userId/mfa/recovery-codes')
    .desc('Get MFA Recovery Codes')
    .groups(['api', 'users'])
    .label('scope', 'users.read')
    .label('usage.metric', 'users.{scope}.requests.read')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'getMfaRecoveryCodes')
    .label('sdk.description', '/docs/references/users/get-mfa-recovery-codes.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_MFA_RECOVERY_CODES)
    .param('userId', '', new UID(), 'User ID.')
    .inject('response')
    .inject('dbForProject')
    .action(async (userId: string, response: Response, dbForProject: Database) => {
        const user = await dbForProject.getDocument('users', userId);

        if (user.isEmpty()) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        const mfaRecoveryCodes = user.getAttribute('mfaRecoveryCodes', []);

        if (mfaRecoveryCodes.length === 0) {
            throw new Exception(Exception.USER_RECOVERY_CODES_NOT_FOUND);
        }

        const document = new Document({
            recoveryCodes: mfaRecoveryCodes
        });

        response.dynamic(document, Response.MODEL_MFA_RECOVERY_CODES);
    });

App.patch('/v1/users/:userId/mfa/recovery-codes')
    .desc('Create MFA Recovery Codes')
    .groups(['api', 'users'])
    .label('event', 'users.[userId].create.mfa.recovery-codes')
    .label('scope', 'users.write')
    .label('audits.event', 'user.update')
    .label('audits.resource', 'user/{response.$id}')
    .label('audits.userId', '{response.$id}')
    .label('usage.metric', 'users.{scope}.requests.update')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'createMfaRecoveryCodes')
    .label('sdk.description', '/docs/references/users/create-mfa-recovery-codes.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_MFA_RECOVERY_CODES)
    .param('userId', '', new UID(), 'User ID.')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async (userId: string, response: Response, dbForProject: Database, queueForEvents: Event) => {
        const user = await dbForProject.getDocument('users', userId);

        if (user.isEmpty()) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        let mfaRecoveryCodes = user.getAttribute('mfaRecoveryCodes', []);

        if (mfaRecoveryCodes.length > 0) {
            throw new Exception(Exception.USER_RECOVERY_CODES_ALREADY_EXISTS);
        }

        mfaRecoveryCodes = Type.generateBackupCodes();
        user.setAttribute('mfaRecoveryCodes', mfaRecoveryCodes);
        await dbForProject.updateDocument('users', user.getId(), user);

        queueForEvents.setParam('userId', user.getId());

        const document = new Document({
            recoveryCodes: mfaRecoveryCodes
        });

        response.dynamic(document, Response.MODEL_MFA_RECOVERY_CODES);
    });

App.put('/v1/users/:userId/mfa/recovery-codes')
    .desc('Regenerate MFA Recovery Codes')
    .groups(['api', 'users'])
    .label('event', 'users.[userId].update.mfa.recovery-codes')
    .label('scope', 'users.write')
    .label('audits.event', 'user.update')
    .label('audits.resource', 'user/{response.$id}')
    .label('audits.userId', '{response.$id}')
    .label('usage.metric', 'users.{scope}.requests.update')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'updateMfaRecoveryCodes')
    .label('sdk.description', '/docs/references/users/update-mfa-recovery-codes.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_MFA_RECOVERY_CODES)
    .param('userId', '', new UID(), 'User ID.')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async (userId: string, response: Response, dbForProject: Database, queueForEvents: Event) => {
        const user = await dbForProject.getDocument('users', userId);

        if (user.isEmpty()) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        let mfaRecoveryCodes = user.getAttribute('mfaRecoveryCodes', []);
        if (mfaRecoveryCodes.length === 0) {
            throw new Exception(Exception.USER_RECOVERY_CODES_NOT_FOUND);
        }

        mfaRecoveryCodes = Type.generateBackupCodes();
        user.setAttribute('mfaRecoveryCodes', mfaRecoveryCodes);
        await dbForProject.updateDocument('users', user.getId(), user);

        queueForEvents.setParam('userId', user.getId());

        const document = new Document({
            recoveryCodes: mfaRecoveryCodes
        });

        response.dynamic(document, Response.MODEL_MFA_RECOVERY_CODES);
    });

App.delete('/v1/users/:userId/mfa/authenticators/:type')
    .desc('Delete Authenticator')
    .groups(['api', 'users'])
    .label('event', 'users.[userId].delete.mfa')
    .label('scope', 'users.write')
    .label('audits.event', 'user.update')
    .label('audits.resource', 'user/{response.$id}')
    .label('audits.userId', '{response.$id}')
    .label('usage.metric', 'users.{scope}.requests.update')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'deleteMfaAuthenticator')
    .label('sdk.description', '/docs/references/users/delete-mfa-authenticator.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USER)
    .param('userId', '', new UID(), 'User ID.')
    .param('type', null, new WhiteList([Type.TOTP]), 'Type of authenticator.')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async (userId: string, type: string, response: Response, dbForProject: Database, queueForEvents: Event) => {
        const user = await dbForProject.getDocument('users', userId);

        if (user.isEmpty()) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        const authenticator = TOTP.getAuthenticatorFromUser(user);

        if (authenticator === null) {
            throw new Exception(Exception.USER_AUTHENTICATOR_NOT_FOUND);
        }

        await dbForProject.deleteDocument('authenticators', authenticator.getId());
        await dbForProject.purgeCachedDocument('users', user.getId());

        queueForEvents.setParam('userId', user.getId());

        response.noContent();
    });

App.post('/v1/users/:userId/sessions')
    .desc('Create session')
    .groups(['api', 'users'])
    .label('event', 'users.[userId].sessions.[sessionId].create')
    .label('scope', 'users.write')
    .label('audits.event', 'session.create')
    .label('audits.resource', 'user/{request.userId}')
    .label('usage.metric', 'sessions.{scope}.requests.create')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'createSession')
    .label('sdk.description', '/docs/references/users/create-session.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_SESSION)
    .param('userId', '', new CustomId(), 'User ID. Choose a custom ID or generate a random ID with `ID.unique()`. Valid chars are a-z, A-Z, 0-9, period, hyphen, and underscore. Can\'t start with a special char. Max length is 36 chars.')
    .inject('request')
    .inject('response')
    .inject('dbForProject')
    .inject('project')
    .inject('locale')
    .inject('geodb')
    .inject('queueForEvents')
    .action(async (userId: string, request: Request, response: Response, dbForProject: Database, project: Document, locale: Locale, geodb: any, queueForEvents: Event) => {
        const user = await dbForProject.getDocument('users', userId);
        if (user.isEmpty()) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        const secret = Auth.tokenGenerator(Auth.TOKEN_LENGTH_SESSION);
        const detector = new Detector(request.getUserAgent('UNKNOWN'));
        const record = geodb.get(request.getIP());

        const duration = project.getAttribute('auths', [])['duration'] ?? Auth.TOKEN_EXPIRATION_LOGIN_LONG;
        const expire = DateTime.formatTz(DateTime.addSeconds(new Date(), duration));

        const session = new Document({
            ...{
                '$id': ID.unique(),
                'userId': user.getId(),
                'userInternalId': user.getInternalId(),
                'provider': Auth.SESSION_PROVIDER_SERVER,
                'secret': Auth.hash(secret), // One way hash encryption to protect DB leak
                'userAgent': request.getUserAgent('UNKNOWN'),
                'ip': request.getIP(),
                'countryCode': record ? record.country.iso_code.toLowerCase() : '--',
                'expire': expire,
            },
            ...detector.getOS(),
            ...detector.getClient(),
            ...detector.getDevice()
        });

        const countryName = locale.getText('countries.' + session.getAttribute('countryCode').toLowerCase(), locale.getText('locale.country.unknown'));

        const createdSession = await dbForProject.createDocument('sessions', session);
        createdSession
            .setAttribute('secret', secret)
            .setAttribute('countryName', countryName);

        queueForEvents
            .setParam('userId', user.getId())
            .setParam('sessionId', createdSession.getId())
            .setPayload(response.output(createdSession, Response.MODEL_SESSION));

        return response
            .setStatusCode(Response.STATUS_CODE_CREATED)
            .dynamic(createdSession, Response.MODEL_SESSION);
    });

App.post('/v1/users/:userId/tokens')
    .desc('Create token')
    .groups(['api', 'users'])
    .label('event', 'users.[userId].tokens.[tokenId].create')
    .label('scope', 'users.write')
    .label('audits.event', 'tokens.create')
    .label('audits.resource', 'user/{request.userId}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'createToken')
    .label('sdk.description', '/docs/references/users/create-token.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_TOKEN)
    .param('userId', '', new UID(), 'User ID.')
    .param('length', 6, new Range(4, 128), 'Token length in characters. The default length is 6 characters', true)
    .param('expire', Auth.TOKEN_EXPIRATION_GENERIC, new Range(60, Auth.TOKEN_EXPIRATION_LOGIN_LONG), 'Token expiration period in seconds. The default expiration is 15 minutes.', true)
    .inject('request')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async (userId: string, length: number, expire: number, request: Request, response: Response, dbForProject: Database, queueForEvents: Event) => {
        const user = await dbForProject.getDocument('users', userId);

        if (user.isEmpty()) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        const secret = Auth.tokenGenerator(length);
        const expiration = DateTime.formatTz(DateTime.addSeconds(new Date(), expire));

        const token = new Document({
            '$id': ID.unique(),
            'userId': user.getId(),
            'userInternalId': user.getInternalId(),
            'type': Auth.TOKEN_TYPE_GENERIC,
            'secret': Auth.hash(secret),
            'expire': expiration,
            'userAgent': request.getUserAgent('UNKNOWN'),
            'ip': request.getIP()
        });

        const createdToken = await dbForProject.createDocument('tokens', token);
        await dbForProject.purgeCachedDocument('users', user.getId());

        createdToken.setAttribute('secret', secret);

        queueForEvents
            .setParam('userId', user.getId())
            .setParam('tokenId', createdToken.getId())
            .setPayload(response.output(createdToken, Response.MODEL_TOKEN));

        return response
            .setStatusCode(Response.STATUS_CODE_CREATED)
            .dynamic(createdToken, Response.MODEL_TOKEN);
    });

App.delete('/v1/users/:userId/sessions/:sessionId')
    .desc('Delete user session')
    .groups(['api', 'users'])
    .label('event', 'users.[userId].sessions.[sessionId].delete')
    .label('scope', 'users.write')
    .label('audits.event', 'session.delete')
    .label('audits.resource', 'user/{request.userId}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'deleteSession')
    .label('sdk.description', '/docs/references/users/delete-user-session.md')
    .label('sdk.response.code', Response.STATUS_CODE_NOCONTENT)
    .label('sdk.response.model', Response.MODEL_NONE)
    .param('userId', '', new UID(), 'User ID.')
    .param('sessionId', '', new UID(), 'Session ID.')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async (userId: string, sessionId: string, response: Response, dbForProject: Database, queueForEvents: Event) => {
        const user = await dbForProject.getDocument('users', userId);

        if (user.isEmpty()) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        const session = await dbForProject.getDocument('sessions', sessionId);

        if (session.isEmpty()) {
            throw new Exception(Exception.USER_SESSION_NOT_FOUND);
        }

        await dbForProject.deleteDocument('sessions', session.getId());
        await dbForProject.purgeCachedDocument('users', user.getId());

        queueForEvents
            .setParam('userId', user.getId())
            .setParam('sessionId', sessionId)
            .setPayload(response.output(session, Response.MODEL_SESSION));

        response.noContent();
    });

App.delete('/v1/users/:userId/sessions')
    .desc('Delete user sessions')
    .groups(['api', 'users'])
    .label('event', 'users.[userId].sessions.delete')
    .label('scope', 'users.write')
    .label('audits.event', 'session.delete')
    .label('audits.resource', 'user/{user.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'deleteSessions')
    .label('sdk.description', '/docs/references/users/delete-user-sessions.md')
    .label('sdk.response.code', Response.STATUS_CODE_NOCONTENT)
    .label('sdk.response.model', Response.MODEL_NONE)
    .param('userId', '', new UID(), 'User ID.')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async (userId: string, response: Response, dbForProject: Database, queueForEvents: Event) => {
        const user = await dbForProject.getDocument('users', userId);

        if (user.isEmpty()) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        const sessions = user.getAttribute('sessions', []);

        for (const session of sessions) {
            await dbForProject.deleteDocument('sessions', session.getId());
        }

        await dbForProject.purgeCachedDocument('users', user.getId());

        queueForEvents
            .setParam('userId', user.getId())
            .setPayload(response.output(user, Response.MODEL_USER));

        response.noContent();
    });

App.delete('/v1/users/:userId')
    .desc('Delete user')
    .groups(['api', 'users'])
    .label('event', 'users.[userId].delete')
    .label('scope', 'users.write')
    .label('audits.event', 'user.delete')
    .label('audits.resource', 'user/{request.userId}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'delete')
    .label('sdk.description', '/docs/references/users/delete.md')
    .label('sdk.response.code', Response.STATUS_CODE_NOCONTENT)
    .label('sdk.response.model', Response.MODEL_NONE)
    .param('userId', '', new UID(), 'User ID.')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .inject('queueForDeletes')
    .action(async (userId: string, response: Response, dbForProject: Database, queueForEvents: Event, queueForDeletes: Delete) => {
        const user = await dbForProject.getDocument('users', userId);

        if (user.isEmpty()) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        // clone user object to send to workers
        const clone = new Document({ ...user });

        await dbForProject.deleteDocument('users', userId);

        queueForDeletes
            .setType(DELETE_TYPE_DOCUMENT)
            .setDocument(clone);

        queueForEvents
            .setParam('userId', user.getId())
            .setPayload(response.output(clone, Response.MODEL_USER));

        response.noContent();
    });

App.delete('/v1/users/:userId/targets/:targetId')
    .desc('Delete user target')
    .groups(['api', 'users'])
    .label('audits.event', 'target.delete')
    .label('audits.resource', 'target/{request.$targetId}')
    .label('event', 'users.[userId].targets.[targetId].delete')
    .label('scope', 'targets.write')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'deleteTarget')
    .label('sdk.description', '/docs/references/users/delete-target.md')
    .label('sdk.response.code', Response.STATUS_CODE_NOCONTENT)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_NONE)
    .param('userId', '', new UID(), 'User ID.')
    .param('targetId', '', new UID(), 'Target ID.')
    .inject('queueForEvents')
    .inject('queueForDeletes')
    .inject('response')
    .inject('dbForProject')
    .action(async (userId: string, targetId: string, queueForEvents: Event, queueForDeletes: Delete, response: Response, dbForProject: Database) => {
        const user = await dbForProject.getDocument('users', userId);

        if (user.isEmpty()) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        const target = await dbForProject.getDocument('targets', targetId);

        if (target.isEmpty()) {
            throw new Exception(Exception.USER_TARGET_NOT_FOUND);
        }

        if (user.getId() !== target.getAttribute('userId')) {
            throw new Exception(Exception.USER_TARGET_NOT_FOUND);
        }

        await dbForProject.deleteDocument('targets', target.getId());
        await dbForProject.purgeCachedDocument('users', user.getId());

        queueForDeletes
            .setType(DELETE_TYPE_TARGET)
            .setDocument(target);

        queueForEvents
            .setParam('userId', user.getId())
            .setParam('targetId', target.getId());

        response.noContent();
    });

App.delete('/v1/users/identities/:identityId')
    .desc('Delete identity')
    .groups(['api', 'users'])
    .label('event', 'users.[userId].identities.[identityId].delete')
    .label('scope', 'users.write')
    .label('audits.event', 'identity.delete')
    .label('audits.resource', 'identity/{request.$identityId}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'deleteIdentity')
    .label('sdk.description', '/docs/references/users/delete-identity.md')
    .label('sdk.response.code', Response.STATUS_CODE_NOCONTENT)
    .label('sdk.response.model', Response.MODEL_NONE)
    .param('identityId', '', new UID(), 'Identity ID.')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async (identityId: string, response: Response, dbForProject: Database, queueForEvents: Event) => {
        const identity = await dbForProject.getDocument('identities', identityId);

        if (identity.isEmpty()) {
            throw new Exception(Exception.USER_IDENTITY_NOT_FOUND);
        }

        await dbForProject.deleteDocument('identities', identityId);

        queueForEvents
            .setParam('userId', identity.getAttribute('userId'))
            .setParam('identityId', identity.getId())
            .setPayload(response.output(identity, Response.MODEL_IDENTITY));

        return response.noContent();
    });