
import { Database, Query, Duplicate, UID, Queries, Limit, Offset } from '../../../Tuval/Database'
import {
    ArrayList, Authorization, DateTime, Document, Exception, URLValidator,
    Host, ID, Permission, Role, Text, WhiteList,
    Boolean,
    Assoc
} from '../../../Tuval/Core'
import { Locale } from '../../../Tuval/Locale'
import { Audit } from '../../../Tuval/Audit'
import { encode } from 'html-entities';
import strip_tags from 'striptags';
import {
    Auth, EmailChallenge, Password, PasswordDictionary, PasswordHistory,
    PersonalData, Phone, PhoneChallenge, Phrase, TOTP
} from '../../../Tuval/Auth'


import { Type, TOTPChallenge } from '../../../Tuval/Auth'
import jwt from 'jsonwebtoken';
import { Detector } from '../../../Appconda/Detector/Detector'
import _default, * as maxmind from 'maxmind'
import { Event } from '../../../Appconda/Event/Event'
import { APP_AUTH_TYPE_ADMIN, APP_AUTH_TYPE_JWT, APP_AUTH_TYPE_SESSION, APP_EMAIL_TEAM, APP_LIMIT_ARRAY_ELEMENT_SIZE, APP_LIMIT_ARRAY_PARAMS_SIZE, APP_LIMIT_COUNT, APP_LIMIT_USERS, APP_NAME, DELETE_TYPE_DOCUMENT, DELETE_TYPE_SESSION_TARGETS, DELETE_TYPE_TARGET, MESSAGE_SEND_TYPE_INTERNAL, MESSAGE_TYPE_EMAIL, MESSAGE_TYPE_PUSH, MESSAGE_TYPE_SMS } from '../../init'
import { Response } from '../../../Appconda/Tuval/Response'
import { CustomId } from '../../../Appconda/Tuval/Database/Validators/CustomId'
import { Email } from '../../../Appconda/Network/Validators/Email'
import { Delete } from '../../../Appconda/Event/Delete'
import { Hooks } from '../../../Appconda/Hooks/Hooks'
import { APP_PLATFORM_SERVER } from '../../config/platforms'
import { OpenSSL } from '../../../Appconda/OpenSSL/OpenSSL'
import { Template } from '../../../Appconda/Template/Template'
import { Messaging } from '../../../Appconda/Event/Messaging'
import { Mail } from '../../../Appconda/Event/Mail';
import { AppcondaException } from '../../../Appconda/Extend/Exception';
import { Identities } from '../../../Appconda/Tuval/Database/Validators/Queries/Identities';
import { Config } from '../../../Tuval/Config';
import { Request } from '../../../Appconda/Tuval/Request';
import { App } from '../../../Tuval/Http';

console.log('Account Controller Loaded...')

function empty(value: any): boolean {
    // Check for null or undefined
    if (value === null || value === undefined) {
        return true;
    }

    // Check for boolean false
    if (typeof value === 'boolean' && value === false) {
        return true;
    }

    // Check for an empty string
    if (typeof value === 'string' && value.trim() === '') {
        return true;
    }

    // Check for number 0 (including numeric strings like '0')
    if (typeof value === 'number' && value === 0) {
        return true;
    }
    if (typeof value === 'string' && value === '0') {
        return true;
    }

    // Check for an empty array
    if (Array.isArray(value) && value.length === 0) {
        return true;
    }

    // Check for an empty object
    if (typeof value === 'object' && Object.keys(value).length === 0 && value.constructor === Object) {
        return true;
    }

    return false;
}


var path = require('path');

const oauthDefaultSuccess = '/auth/oauth2/success';
const oauthDefaultFailure = '/auth/oauth2/failure';

let geoReader: maxmind.Reader<maxmind.CityResponse> | null = null;

const initializeGeoReader = async () => {
    if (!geoReader) {
        try{
            const filePath = path.resolve(__dirname, '../../assets/dbip/dbip-country-lite-2024-02.mmdb');
            geoReader = await maxmind.open<maxmind.CityResponse>(filePath);
        }catch(error){
            console.log('Geo Reader Error', error);
        }
    }
};

const getGeoInfo = async (ip: string) => {
    if (!geoReader) {
        await initializeGeoReader();
    }
    if (geoReader) {
        return geoReader.get(ip);
    }
    return null;
};

const createSession = async (
    userId: string,
    secret: string,
    request: Request,
    response: Response,
    user: Document,
    dbForProject: Database,
    project: Document,
    locale: Locale,
    queueForEvents: Event
) => {
    const roles = Authorization.getRoles();
    const isPrivilegedUser = Auth.isPrivilegedUser(roles);
    const isAppUser = Auth.isAppUser(roles);

    const userFromRequest = await Authorization.skip(() => dbForProject.getDocument('users', userId));

    if (userFromRequest.isEmpty()) {
        throw new Exception('USER_INVALID_TOKEN');
    }

    const verifiedToken = Auth.tokenVerify(userFromRequest.getAttribute('tokens', []), null, secret);

    if (!verifiedToken) {
        throw new Exception('USER_INVALID_TOKEN');
    }

    user.setAttributes(userFromRequest.getArrayCopy());

    const duration = project.getAttribute('auths', [])['duration'] || Auth.TOKEN_EXPIRATION_LOGIN_LONG;
    const detector = new Detector(request.getUserAgent('UNKNOWN'));
    const record: any = await getGeoInfo(request.getIP());
    const sessionSecret = Auth.tokenGenerator(Auth.TOKEN_LENGTH_SESSION);

    const factor = (() => {
        switch (verifiedToken.getAttribute('type')) {
            case Auth.TOKEN_TYPE_MAGIC_URL:
            case Auth.TOKEN_TYPE_OAUTH2:
            case Auth.TOKEN_TYPE_EMAIL:
                return 'email';
            case Auth.TOKEN_TYPE_PHONE:
                return 'phone';
            case Auth.TOKEN_TYPE_GENERIC:
                return 'token';
            default:
                throw new Error('USER_INVALID_TOKEN');
        }
    })();

    const session = new Document({
        ...{
            '$id': ID.unique(),
            'userId': user.getId(),
            'userInternalId': user.getInternalId(),
            'provider': Auth.getSessionProviderByTokenType(verifiedToken.getAttribute('type')),
            'secret': Auth.hash(sessionSecret),
            'userAgent': request.getUserAgent('UNKNOWN'),
            'ip': request.getIP(),
            'factors': [factor],
            'countryCode': record ? record['country']['iso_code'].toLowerCase() : '--',
            'expire': DateTime.addSeconds(new Date(), duration)
        },
        ...detector.getOS(),
        ...detector.getClient(),
        ...detector.getDevice()
    });

    Authorization.setRole(Role.user(user.getId()).toString());

    const createdSession = await dbForProject.createDocument('sessions', session.setAttribute('$permissions', [
        Permission.read(Role.user(user.getId())),
        Permission.update(Role.user(user.getId())),
        Permission.delete(Role.user(user.getId())),
    ]));

    await dbForProject.purgeCachedDocument('users', user.getId());
    await Authorization.skip(async () => await dbForProject.deleteDocument('tokens', verifiedToken.getId()));
    await dbForProject.purgeCachedDocument('users', user.getId());

    if (verifiedToken.getAttribute('type') === Auth.TOKEN_TYPE_MAGIC_URL || verifiedToken.getAttribute('type') === Auth.TOKEN_TYPE_EMAIL) {
        user.setAttribute('emailVerification', true);
    }

    if (verifiedToken.getAttribute('type') === Auth.TOKEN_TYPE_PHONE) {
        user.setAttribute('phoneVerification', true);
    }

    try {
        await dbForProject.updateDocument('users', user.getId(), user);
    } catch (error) {
        throw new Exception('GENERAL_SERVER_ERROR: Failed saving user to DB');
    }

    queueForEvents
        .setParam('userId', user.getId())
        .setParam('sessionId', createdSession.getId());

    if (!Config.getParam('domainVerification')) {
        response.addHeader('X-Fallback-Cookies', JSON.stringify({ [Auth.cookieName]: Auth.encodeSession(user.getId(), sessionSecret) }));
    }

    const expire = DateTime.formatTz(DateTime.addSeconds(new Date(), duration)) as string;
    const protocol = request.getProtocol();

    response
        .addCookie(`${Auth.cookieName}_legacy`, Auth.encodeSession(user.getId(), sessionSecret), new Date(expire).getTime(), '/', Config.getParam('cookieDomain'), protocol === 'https', true, null)
        .addCookie(Auth.cookieName, Auth.encodeSession(user.getId(), sessionSecret), new Date(expire).getTime(), '/', Config.getParam('cookieDomain'), protocol === 'https', true, Config.getParam('cookieSamesite'))
        .setStatusCode(Response.STATUS_CODE_CREATED);

    const countryName = locale.getText(`countries.${session.getAttribute('countryCode').toLowerCase()}`, locale.getText('locale.country.unknown'));

    session
        .setAttribute('current', true)
        .setAttribute('countryName', countryName)
        .setAttribute('expire', expire)
        .setAttribute('secret', (isPrivilegedUser || isAppUser) ? Auth.encodeSession(user.getId(), sessionSecret) : '');

    response.dynamic(session, Response.MODEL_SESSION);
};


App
    .init()
    .inject('appconda')
    .inject('request')
    .action(async (app: App, request: Request) => {
        console.log('Module Accounts Yuklendi');
    })

App.post('/v1/account')
    .desc('Create account')
    .groups(['api', 'account', 'auth'])
    .label('event', 'users.[userId].create')
    .label('scope', 'sessions.write')
    .label('auth.type', 'emailPassword')
    .label('audits.event', 'user.create')
    .label('audits.resource', 'user/{response.$id}')
    .label('audits.userId', '{response.$id}')
    .label('sdk.auth', [])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'create')
    .label('sdk.description', '/docs/references/account/create.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USER)
    .label('abuse-limit', 10)
    .param('userId', '', new CustomId(), 'User ID. Choose a custom ID or generate a random ID with `ID.unique()`. Valid chars are a-z, A-Z, 0-9, period, hyphen, and underscore. Can\'t start with a special char. Max length is 36 chars.')
    .param('email', '', new Email(), 'User email.')
    .param('password', '', ({ project, passwordsDictionary }: { project: Document, passwordsDictionary: any }) => new PasswordDictionary(passwordsDictionary, project.getAttribute('auths', [])['passwordDictionary'] ?? false), 'New user password. Must be between 8 and 256 chars.', false, ['project', 'passwordsDictionary'])
    .param('name', '', new Text(128), 'User name. Max length: 128 chars.', true)
    .inject('request')
    .inject('response')
    .inject('user')
    .inject('project')
    .inject('dbForProject')
    .inject('queueForEvents')
    .inject('hooks')
    .action(async (userId: string, email: string, password: string, name: string,
        request: Request, response: Response, user: Document, project: Document, dbForProject: Database, queueForEvents: Event, hooks: Hooks) => {

        email = email.toLowerCase();
        if (project.getId() === 'console') {
            const whitelistEmails: string[] = project.getAttribute('authWhitelistEmails');
            const whitelistIPs: string[] = project.getAttribute('authWhitelistIPs');

            if (whitelistEmails.length > 0 && !whitelistEmails.includes(email) &&
                !whitelistEmails.includes(email.toUpperCase())) {
                throw new Error('USER_EMAIL_NOT_WHITELISTED');
            }

            if (whitelistIPs.length > 0 && !whitelistIPs.includes(request.getIP())) {
                throw new Error('USER_IP_NOT_WHITELISTED');
            }
        }

        const limit = project.getAttribute('auths', [])['limit'] ?? 0;

        if (limit !== 0) {
            const total = await dbForProject.count('users', [], APP_LIMIT_USERS);

            if (total >= limit) {
                if (project.getId() === 'console') {
                    throw new Error('USER_CONSOLE_COUNT_EXCEEDED');
                }
                throw new Error('USER_COUNT_EXCEEDED');
            }
        }

        const identityWithMatchingEmail = await dbForProject.findOne('identities', [
            Query.equal('providerEmail', [email]),
        ]);
        if (identityWithMatchingEmail && !identityWithMatchingEmail.isEmpty()) {
            throw new Error('GENERAL_BAD_REQUEST');
        }

        if (project.getAttribute('auths', [])['personalDataCheck'] ?? false) {
            const personalDataValidator = new PersonalData(userId, email, name, null);
            if (!personalDataValidator.isValid(password)) {
                throw new Error('USER_PASSWORD_PERSONAL_DATA');
            }
        }

        hooks.trigger('passwordValidator', [dbForProject, project, password, user, true]);

        const passwordHistory = project.getAttribute('auths', [])['passwordHistory'] ?? 0;
        password = await Auth.passwordHash(password, Auth.DEFAULT_ALGO, Auth.DEFAULT_ALGO_OPTIONS) as any;
        try {
            userId = userId === 'unique()' ? ID.unique() : userId;
            user.setAttributes({
                '$id': userId,
                '$permissions': [
                    Permission.read(Role.any()),
                    Permission.update(Role.user(userId)),
                    Permission.delete(Role.user(userId)),
                ],
                'email': email,
                'emailVerification': false,
                'status': true,
                'password': password,
                'passwordHistory': passwordHistory > 0 ? [password] : [],
                'passwordUpdate': DateTime.now(),
                'hash': Auth.DEFAULT_ALGO,
                'hashOptions': Auth.DEFAULT_ALGO_OPTIONS,
                'registration': DateTime.now(),
                'reset': false,
                'name': name,
                'mfa': false,
                'prefs': {},
                'sessions': null,
                'tokens': null,
                'memberships': null,
                'authenticators': null,
                'search': [userId, email, name].join(' '),
                'accessedAt': DateTime.now(),
            });
            user.removeAttribute('$internalId');
            user = await Authorization.skip(async () => await dbForProject.createDocument('users', user));
            try {
                const targetDocument = new Document({
                    '$permissions': [
                        Permission.read(Role.user(user.getId())),
                        Permission.update(Role.user(user.getId())),
                        Permission.delete(Role.user(user.getId()))
                    ],
                    'userId': user.getId(),
                    'userInternalId': user.getInternalId(),
                    'providerType': MESSAGE_TYPE_EMAIL,
                    'identifier': email,
                });
                const target = await Authorization.skip(async () => await dbForProject.createDocument('targets', targetDocument));

                user.setAttribute('targets', [...user.getAttribute('targets', []), target]);
            } catch (error) {
                if (error instanceof Duplicate) {
                    const existingTarget = await dbForProject.findOne('targets', [
                        Query.equal('identifier', [email]),
                    ]);
                    if (existingTarget) {
                        user.setAttribute('targets', existingTarget, Document.SET_TYPE_APPEND);
                    }
                }
            }

            await dbForProject.purgeCachedDocument('users', user.getId());
        } catch (error) {
            if (error instanceof Duplicate) {
                throw new Error('USER_ALREADY_EXISTS');
            }
            throw error;
        }

        Authorization.unsetRole(Role.guests().toString());
        Authorization.setRole(Role.user(user.getId()).toString());
        Authorization.setRole(Role.users().toString());

        queueForEvents.setParam('userId', user.getId());

        response
            .setStatusCode(Response.STATUS_CODE_CREATED)
            .dynamic(user, Response.MODEL_ACCOUNT);
    });

App.get('/v1/account')
    .desc('Get account')
    .groups(['api', 'account'])
    .label('scope', 'account')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'get')
    .label('sdk.description', '/docs/references/account/get.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USER)
    .label('sdk.offline.model', '/account')
    .label('sdk.offline.key', 'current')
    .inject('response')
    .inject('user')
    .action(async (response: Response, user: Document) => {
        if (user.isEmpty()) {
            throw new Error('USER_NOT_FOUND');
        }

        response.dynamic(user, Response.MODEL_ACCOUNT);
    });


App.delete('/v1/account')
    .desc('Delete account')
    .groups(['api', 'account'])
    .label('event', 'users.[userId].delete')
    .label('scope', 'account')
    .label('audits.event', 'user.delete')
    .label('audits.resource', 'user/{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'delete')
    .label('sdk.description', '/docs/references/account/delete.md')
    .label('sdk.response.code', Response.STATUS_CODE_NOCONTENT)
    .label('sdk.response.model', Response.MODEL_NONE)
    .inject('user')
    .inject('project')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .inject('queueForDeletes')
    .action(async (user: Document, project: Document, response: Response, dbForProject: Database, queueForEvents: Event, queueForDeletes: Delete) => {
        if (user.isEmpty()) {
            throw new Exception('USER_NOT_FOUND');
        }

        if (project.getId() === 'console') {
            const memberships = user.getAttribute('memberships', []);
            for (const membership of memberships) {
                if (membership.getAttribute('confirm', false)) {
                    throw new Exception('USER_DELETION_PROHIBITED');
                }
            }
        }

        await dbForProject.deleteDocument('users', user.getId());

        queueForDeletes
            .setType(DELETE_TYPE_DOCUMENT)
            .setDocument(user);

        queueForEvents
            .setParam('userId', user.getId())
            .setPayload(response.output(user, Response.MODEL_USER));

        response.noContent();
    });


App.get('/v1/account/sessions')
    .desc('List sessions')
    .groups(['api', 'account'])
    .label('scope', 'account')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'listSessions')
    .label('sdk.description', '/docs/references/account/list-sessions.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_SESSION_LIST)
    .label('sdk.offline.model', '/account/sessions')
    .inject('response')
    .inject('user')
    .inject('locale')
    .inject('project')
    .action(async (response: Response, user: Document, locale: Locale, project: Document) => {

        const roles = Authorization.getRoles();
        const isPrivilegedUser = Auth.isPrivilegedUser(roles);
        const isAppUser = Auth.isAppUser(roles);

        let sessions = user.getAttribute('sessions', []);
        const current = Auth.sessionVerify(sessions, Auth.secret);

        sessions = sessions.map((session: Document) => {
            const countryName = locale.getText(`countries.${session.getAttribute('countryCode').toLowerCase()}`, locale.getText('locale.country.unknown'));

            session.setAttribute('countryName', countryName);
            session.setAttribute('current', current === session.getId());
            session.setAttribute('secret', (isPrivilegedUser || isAppUser) ? session.getAttribute('secret', '') : '');

            return session;
        });

        response.dynamic(new Document({
            'sessions': sessions,
            'total': sessions.length,
        }), Response.MODEL_SESSION_LIST);
    });


App.delete('/v1/account/sessions')
    .desc('Delete sessions')
    .groups(['api', 'account'])
    .label('scope', 'account')
    .label('event', 'users.[userId].sessions.[sessionId].delete')
    .label('audits.event', 'session.delete')
    .label('audits.resource', 'user/{user.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'deleteSessions')
    .label('sdk.description', '/docs/references/account/delete-sessions.md')
    .label('sdk.response.code', Response.STATUS_CODE_NOCONTENT)
    .label('sdk.response.model', Response.MODEL_NONE)
    .label('abuse-limit', 100)
    .inject('request')
    .inject('response')
    .inject('user')
    .inject('dbForProject')
    .inject('locale')
    .inject('queueForEvents')
    .inject('queueForDeletes')
    .action(async (request: Request, response: Response, user: Document, dbForProject: Database, locale: Locale, queueForEvents: Event, queueForDeletes: Delete) => {

        const protocol = request.getProtocol();
        const sessions = user.getAttribute('sessions', []);

        for (const session of sessions) {
            await dbForProject.deleteDocument('sessions', session.getId());

            if (!Config.getParam('domainVerification')) {
                response.addHeader('X-Fallback-Cookies', JSON.stringify([]));
            }

            session
                .setAttribute('current', false)
                .setAttribute('countryName', locale.getText(`countries.${session.getAttribute('countryCode').toLowerCase()}`, locale.getText('locale.country.unknown')));

            if (session.getAttribute('secret') === Auth.hash(Auth.secret)) {
                session.setAttribute('current', true);

                // If current session delete the cookies too
                response
                    .addCookie(`${Auth.cookieName}_legacy`, '', Date.now() - 3600, '/', Config.getParam('cookieDomain'), protocol === 'https', true, null)
                    .addCookie(Auth.cookieName, '', Date.now() - 3600, '/', Config.getParam('cookieDomain'), protocol === 'https', true, Config.getParam('cookieSamesite'));

                // Use current session for events.
                queueForEvents
                    .setPayload(response.output(session, Response.MODEL_SESSION));

                queueForDeletes
                    .setType(DELETE_TYPE_SESSION_TARGETS)
                    .setDocument(session)
                    .trigger();

                queueForEvents
                    .setParam('userId', user.getId())
                    .setParam('sessionId', session.getId());
            }
        }

        await dbForProject.purgeCachedDocument('users', user.getId());

        response.noContent();
    });


App.get('/v1/account/sessions/:sessionId')
    .desc('Get session')
    .groups(['api', 'account'])
    .label('scope', 'account')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'getSession')
    .label('sdk.description', '/docs/references/account/get-session.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_SESSION)
    .label('sdk.offline.model', '/account/sessions')
    .label('sdk.offline.key', '{sessionId}')
    .param('sessionId', '', new UID(), 'Session ID. Use the string \'current\' to get the current device session.')
    .inject('response')
    .inject('user')
    .inject('locale')
    .inject('project')
    .action(async (sessionId: boolean | string | null, response: Response, user: Document, locale: Locale, project: Document) => {

        const roles = Authorization.getRoles();
        const isPrivilegedUser = Auth.isPrivilegedUser(roles);
        const isAppUser = Auth.isAppUser(roles);

        const sessions = user.getAttribute('sessions', []);
        sessionId = (sessionId === 'current')
            ? Auth.sessionVerify(user.getAttribute('sessions'), Auth.secret)
            : sessionId;

        for (const session of sessions) {
            if (sessionId === session.getId()) {
                const countryName = locale.getText(`countries.${session.getAttribute('countryCode').toLowerCase()}`, locale.getText('locale.country.unknown'));

                session
                    .setAttribute('current', (session.getAttribute('secret') === Auth.hash(Auth.secret)))
                    .setAttribute('countryName', countryName)
                    .setAttribute('secret', (isPrivilegedUser || isAppUser) ? session.getAttribute('secret', '') : '');

                return response.dynamic(session, Response.MODEL_SESSION);
            }
        }

        throw new Error('USER_SESSION_NOT_FOUND');
    });


App.delete('/v1/account/sessions/:sessionId')
    .desc('Delete session')
    .groups(['api', 'account', 'mfa'])
    .label('scope', 'account')
    .label('event', 'users.[userId].sessions.[sessionId].delete')
    .label('audits.event', 'session.delete')
    .label('audits.resource', 'user/{user.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'deleteSession')
    .label('sdk.description', '/docs/references/account/delete-session.md')
    .label('sdk.response.code', Response.STATUS_CODE_NOCONTENT)
    .label('sdk.response.model', Response.MODEL_NONE)
    .label('abuse-limit', 100)
    .param('sessionId', '', new UID(), 'Session ID. Use the string \'current\' to delete the current device session.')
    .inject('requestTimestamp')
    .inject('request')
    .inject('response')
    .inject('user')
    .inject('dbForProject')
    .inject('locale')
    .inject('queueForEvents')
    .inject('queueForDeletes')
    .inject('project')
    .action(async (sessionId: boolean | string | null, requestTimestamp: Date | null, request: Request, response: Response, user: Document, dbForProject: Database, locale: Locale, queueForEvents: Event, queueForDeletes: Delete, project: Document) => {

        const protocol = request.getProtocol();
        sessionId = (sessionId === 'current')
            ? Auth.sessionVerify(user.getAttribute('sessions'), Auth.secret)
            : sessionId;

        const sessions = user.getAttribute('sessions', []);

        for (const [key, session] of sessions.entries()) {
            if (sessionId !== session.getId()) {
                continue;
            }

            await dbForProject.withRequestTimestamp(requestTimestamp, async () => {
                return dbForProject.deleteDocument('sessions', session.getId());
            });

            sessions.splice(key, 1);

            session.setAttribute('current', false);

            if (session.getAttribute('secret') === Auth.hash(Auth.secret)) { // If current session delete the cookies too
                session
                    .setAttribute('current', true)
                    .setAttribute('countryName', locale.getText(`countries.${session.getAttribute('countryCode').toLowerCase()}`, locale.getText('locale.country.unknown')));

                if (!Config.getParam('domainVerification')) {
                    response.addHeader('X-Fallback-Cookies', JSON.stringify([]));
                }

                response
                    .addCookie(`${Auth.cookieName}_legacy`, '', Date.now() - 3600, '/', Config.getParam('cookieDomain'), protocol === 'https', true, null)
                    .addCookie(Auth.cookieName, '', Date.now() - 3600, '/', Config.getParam('cookieDomain'), protocol === 'https', true, Config.getParam('cookieSamesite'));
            }

            await dbForProject.purgeCachedDocument('users', user.getId());

            queueForEvents
                .setParam('userId', user.getId())
                .setParam('sessionId', session.getId())
                .setPayload(response.output(session, Response.MODEL_SESSION));

            queueForDeletes
                .setType(DELETE_TYPE_SESSION_TARGETS)
                .setDocument(session)
                .trigger();

            response.noContent();
            return;
        }

        throw new Error('USER_SESSION_NOT_FOUND');
    });

App.patch('/v1/account/sessions/:sessionId')
    .desc('Update session')
    .groups(['api', 'account'])
    .label('scope', 'account')
    .label('event', 'users.[userId].sessions.[sessionId].update')
    .label('audits.event', 'session.update')
    .label('audits.resource', 'user/{response.userId}')
    .label('audits.userId', '{response.userId}')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'updateSession')
    .label('sdk.description', '/docs/references/account/update-session.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_SESSION)
    .label('abuse-limit', 10)
    .param('sessionId', '', new UID(), 'Session ID. Use the string \'current\' to update the current device session.')
    .inject('response')
    .inject('user')
    .inject('dbForProject')
    .inject('project')
    .inject('queueForEvents')
    .action(async (sessionId: boolean | string | null, response: Response, user: Document, dbForProject: Database, project: Document, queueForEvents: Event) => {

        sessionId = (sessionId === 'current')
            ? Auth.sessionVerify(user.getAttribute('sessions'), Auth.secret)
            : sessionId;
        const sessions = user.getAttribute('sessions', []);

        let session: Document | null = null;
        for (const value of sessions) {
            if (sessionId === value.getId()) {
                session = value;
                break;
            }
        }

        if (session === null) {
            throw new Error('USER_SESSION_NOT_FOUND');
        }

        // Extend session
        const authDuration = project.getAttribute('auths', [])['duration'] ?? Auth.TOKEN_EXPIRATION_LOGIN_LONG;
        session.setAttribute('expire', DateTime.addSeconds(new Date(), authDuration));

        // Refresh OAuth access token
        const provider = session.getAttribute('provider', '');
        const refreshToken = session.getAttribute('providerRefreshToken', '');
        const className = `Appconda\\Auth\\OAuth2\\${provider.charAt(0).toUpperCase() + provider.slice(1)}`;

        if (provider && className in globalThis) {
            const appId = project.getAttribute('oAuthProviders', {})[`${provider}Appid`] ?? '';
            const appSecret = project.getAttribute('oAuthProviders', {})[`${provider}Secret`] ?? '{}';

            const oauth2 = new globalThis[className](appId, appSecret, '', [], []);
            await oauth2.refreshTokens(refreshToken);

            session
                .setAttribute('providerAccessToken', oauth2.getAccessToken(''))
                .setAttribute('providerRefreshToken', oauth2.getRefreshToken(''))
                .setAttribute('providerAccessTokenExpiry', DateTime.addSeconds(new Date(), parseInt(oauth2.getAccessTokenExpiry(''))));
        }

        // Save changes
        await dbForProject.updateDocument('sessions', sessionId as any, session);
        await dbForProject.purgeCachedDocument('users', user.getId());

        queueForEvents
            .setParam('userId', user.getId())
            .setParam('sessionId', session.getId())
            .setPayload(response.output(session, Response.MODEL_SESSION));

        return response.dynamic(session, Response.MODEL_SESSION);
    });


App.post('/v1/account/sessions/email')
    .alias('/v1/account/sessions')
    .desc('Create email password session')
    .groups(['api', 'account', 'auth', 'session'])
    .label('event', 'users.[userId].sessions.[sessionId].create')
    .label('scope', 'sessions.write')
    .label('auth.type', 'emailPassword')
    .label('audits.event', 'session.create')
    .label('audits.resource', 'user/{response.userId}')
    .label('audits.userId', '{response.userId}')
    .label('sdk.auth', [])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'createEmailPasswordSession')
    .label('sdk.description', '/docs/references/account/create-session-email-password.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_SESSION)
    .label('abuse-limit', 10)
    .label('abuse-key', 'url:{url},email:{param-email}')
    .param('email', '', new Email(), 'User email.')
    .param('password', '', new Password(), 'User password. Must be at least 8 chars.')
    .inject('request')
    .inject('response')
    .inject('user')
    .inject('dbForProject')
    .inject('project')
    .inject('locale')
    .inject('queueForEvents')
    .inject('hooks')
    .action(async (email: string, password: string, request: Request, response: Response,
        user: Document, dbForProject: Database, project: Document, locale: Locale,
        queueForEvents: Event, hooks: Hooks) => {
        email = email.toLowerCase();
        const protocol = request.getProtocol();

        const profile = await dbForProject.findOne('users', [
            Query.equal('email', [email]),
        ]);

        if (!profile || !profile.getAttribute('passwordUpdate') || !Auth.passwordVerify(password, profile.getAttribute('password'), profile.getAttribute('hash'), profile.getAttribute('hashOptions'))) {
            throw new Error('USER_INVALID_CREDENTIALS');
        }

        if (profile.getAttribute('status') === false) { // Account is blocked
            throw new Error('USER_BLOCKED'); // User is in status blocked
        }

        const roles = Authorization.getRoles();
        const isPrivilegedUser = Auth.isPrivilegedUser(roles);
        const isAppUser = Auth.isAppUser(roles);

        user.setAttributes(profile.getArrayCopy());

        hooks.trigger('passwordValidator', [dbForProject, project, password, user, false]);

        const duration = project.getAttribute('auths', [])['duration'] ?? Auth.TOKEN_EXPIRATION_LOGIN_LONG;
        const detector = new Detector(request.getUserAgent('UNKNOWN'));
        const record: any = await getGeoInfo(request.getIP());
        const secret = Auth.tokenGenerator(Auth.TOKEN_LENGTH_SESSION);
        const session = new Document({
            ...{
                '$id': ID.unique(),
                'userId': user.getId(),
                'userInternalId': user.getInternalId(),
                'provider': Auth.SESSION_PROVIDER_EMAIL,
                'providerUid': email,
                'secret': Auth.hash(secret), // One way hash encryption to protect DB leak
                'userAgent': request.getUserAgent('UNKNOWN'),
                'ip': request.getIP(),
                'factors': ['password'],
                'countryCode': record ? record['country']['iso_code'].toLowerCase() : '--',
                'expire': DateTime.addSeconds(new Date(), duration)
            },
            ...detector.getOS(),
            ...detector.getClient(),
            ...detector.getDevice()
        });

        Authorization.setRole(Role.user(user.getId()).toString());

        // Re-hash if not using recommended algo
        if (user.getAttribute('hash') !== Auth.DEFAULT_ALGO) {
            user
                .setAttribute('password', Auth.passwordHash(password, Auth.DEFAULT_ALGO, Auth.DEFAULT_ALGO_OPTIONS))
                .setAttribute('hash', Auth.DEFAULT_ALGO)
                .setAttribute('hashOptions', Auth.DEFAULT_ALGO_OPTIONS);
            await dbForProject.updateDocument('users', user.getId(), user);
        }

        await dbForProject.purgeCachedDocument('users', user.getId());

        const createdSession = await dbForProject.createDocument('sessions', session.setAttribute('$permissions', [
            Permission.read(Role.user(user.getId())),
            Permission.update(Role.user(user.getId())),
            Permission.delete(Role.user(user.getId())),
        ]));

        if (!Config.getParam('domainVerification')) {
            response.addHeader('X-Fallback-Cookies', JSON.stringify({ [Auth.cookieName]: Auth.encodeSession(user.getId(), secret) }));
        }

        const expire: string = DateTime.formatTz(DateTime.addSeconds(new Date(), duration)) as string;

        response
            .addCookie(`${Auth.cookieName}_legacy`, Auth.encodeSession(user.getId(), secret), new Date(expire).getTime(), '/', Config.getParam('cookieDomain'), protocol === 'https', true, null)
            .addCookie(Auth.cookieName, Auth.encodeSession(user.getId(), secret), new Date(expire).getTime(), '/', Config.getParam('cookieDomain'), protocol === 'https', true, Config.getParam('cookieSamesite'))
            .setStatusCode(Response.STATUS_CODE_CREATED);

        const countryName = locale.getText(`countries.${session.getAttribute('countryCode').toLowerCase()}`, locale.getText('locale.country.unknown'));

        session
            .setAttribute('current', true)
            .setAttribute('countryName', countryName)
            .setAttribute('secret', (isPrivilegedUser || isAppUser) ? Auth.encodeSession(user.getId(), secret) : '');

        queueForEvents
            .setParam('userId', user.getId())
            .setParam('sessionId', session.getId());

        response.dynamic(session, Response.MODEL_SESSION);
    });


App.post('/v1/account/sessions/anonymous')
    .desc('Create anonymous session')
    .groups(['api', 'account', 'auth', 'session'])
    .label('event', 'users.[userId].sessions.[sessionId].create')
    .label('scope', 'sessions.write')
    .label('auth.type', 'anonymous')
    .label('audits.event', 'session.create')
    .label('audits.resource', 'user/{response.userId}')
    .label('audits.userId', '{response.userId}')
    .label('sdk.auth', [])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'createAnonymousSession')
    .label('sdk.description', '/docs/references/account/create-session-anonymous.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_SESSION)
    .label('abuse-limit', 50)
    .label('abuse-key', 'ip:{ip}')
    .inject('request')
    .inject('response')
    .inject('locale')
    .inject('user')
    .inject('project')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async (request: Request, response: Response, locale: Locale, user: Document, project: Document, dbForProject: Database, queueForEvents: Event) => {
        const protocol = request.getProtocol();
        const roles = Authorization.getRoles();
        const isPrivilegedUser = Auth.isPrivilegedUser(roles);
        const isAppUser = Auth.isAppUser(roles);

        if (project.getId() === 'console') {
            throw new Error('USER_ANONYMOUS_CONSOLE_PROHIBITED');
        }

        const limit = project.getAttribute('auths', [])['limit'] ?? 0;

        if (limit !== 0) {
            const total = await dbForProject.count('users', [], APP_LIMIT_USERS);

            if (total >= limit) {
                throw new Error('USER_COUNT_EXCEEDED');
            }
        }

        const userId = ID.unique();
        user.setAttributes({
            '$id': userId,
            '$permissions': [
                Permission.read(Role.any()),
                Permission.update(Role.user(userId)),
                Permission.delete(Role.user(userId)),
            ],
            'email': null,
            'emailVerification': false,
            'status': true,
            'password': null,
            'hash': Auth.DEFAULT_ALGO,
            'hashOptions': Auth.DEFAULT_ALGO_OPTIONS,
            'passwordUpdate': null,
            'registration': DateTime.now(),
            'reset': false,
            'name': null,
            'mfa': false,
            'prefs': {},
            'sessions': null,
            'tokens': null,
            'memberships': null,
            'authenticators': null,
            'search': userId,
            'accessedAt': DateTime.now(),
        });
        user.removeAttribute('$internalId');
        await Authorization.skip(async () => dbForProject.createDocument('users', user));

        // Create session token
        const duration = project.getAttribute('auths', [])['duration'] ?? Auth.TOKEN_EXPIRATION_LOGIN_LONG;
        const detector = new Detector(request.getUserAgent('UNKNOWN'));
        const record: any = await getGeoInfo(request.getIP());
        const secret = Auth.tokenGenerator(Auth.TOKEN_LENGTH_SESSION);

        const session = new Document({
            ...{
                '$id': ID.unique(),
                'userId': user.getId(),
                'userInternalId': user.getInternalId(),
                'provider': Auth.SESSION_PROVIDER_ANONYMOUS,
                'secret': Auth.hash(secret), // One way hash encryption to protect DB leak
                'userAgent': request.getUserAgent('UNKNOWN'),
                'ip': request.getIP(),
                'factors': ['anonymous'],
                'countryCode': record ? record['country']['iso_code'].toLowerCase() : '--',
                'expire': DateTime.addSeconds(new Date(), duration)
            },
            ...detector.getOS(),
            ...detector.getClient(),
            ...detector.getDevice()
        });

        Authorization.setRole(Role.user(user.getId()).toString());

        const createdSession = await dbForProject.createDocument('sessions', session.setAttribute('$permissions', [
            Permission.read(Role.user(user.getId())),
            Permission.update(Role.user(user.getId())),
            Permission.delete(Role.user(user.getId())),
        ]));

        await dbForProject.purgeCachedDocument('users', user.getId());

        queueForEvents
            .setParam('userId', user.getId())
            .setParam('sessionId', session.getId());

        if (!Config.getParam('domainVerification')) {
            response.addHeader('X-Fallback-Cookies', JSON.stringify({ [Auth.cookieName]: Auth.encodeSession(user.getId(), secret) }));
        }

        const expire = DateTime.formatTz(DateTime.addSeconds(new Date(), duration)) as string;

        response
            .addCookie(`${Auth.cookieName}_legacy`, Auth.encodeSession(user.getId(), secret), new Date(expire).getTime(), '/', Config.getParam('cookieDomain'), protocol === 'https', true, null)
            .addCookie(Auth.cookieName, Auth.encodeSession(user.getId(), secret), new Date(expire).getTime(), '/', Config.getParam('cookieDomain'), protocol === 'https', true, Config.getParam('cookieSamesite'))
            .setStatusCode(Response.STATUS_CODE_CREATED);

        const countryName = locale.getText(`countries.${session.getAttribute('countryCode').toLowerCase()}`, locale.getText('locale.country.unknown'));

        session
            .setAttribute('current', true)
            .setAttribute('countryName', countryName)
            .setAttribute('secret', (isPrivilegedUser || isAppUser) ? Auth.encodeSession(user.getId(), secret) : '');

        response.dynamic(session, Response.MODEL_SESSION);
    });




App.post('/v1/account/sessions/token')
    .desc('Create session')
    .label('event', 'users.[userId].sessions.[sessionId].create')
    .groups(['api', 'account', 'session'])
    .label('scope', 'sessions.write')
    .label('audits.event', 'session.create')
    .label('audits.resource', 'user/{response.userId}')
    .label('audits.userId', '{response.userId}')
    .label('sdk.auth', [])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'createSession')
    .label('sdk.description', '/docs/references/account/create-session.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_SESSION)
    .label('abuse-limit', 10)
    .label('abuse-key', 'ip:{ip},userId:{param-userId}')
    .param('userId', '', new CustomId(), 'User ID. Choose a custom ID or generate a random ID with `ID.unique()`. Valid chars are a-z, A-Z, 0-9, period, hyphen, and underscore. Can\'t start with a special char. Max length is 36 chars.')
    .param('secret', '', new Text(256), 'Secret of a token generated by login methods. For example, the `createMagicURLToken` or `createPhoneToken` methods.')
    .inject('request')
    .inject('response')
    .inject('user')
    .inject('dbForProject')
    .inject('project')
    .inject('locale')
    .inject('geodb')
    .inject('queueForEvents')
    .action(createSession);

App.get('/v1/account/sessions/oauth2/:provider')
    .desc('Create OAuth2 session')
    .groups(['api', 'account'])
    .label('error', __dirname + '../../views/general/error.phtml')
    .label('scope', 'sessions.write')
    .label('sdk.auth', [])
    .label('sdk.hide', [APP_PLATFORM_SERVER])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'createOAuth2Session')
    .label('sdk.description', '/docs/references/account/create-session-oauth2.md')
    .label('sdk.response.code', Response.STATUS_CODE_MOVED_PERMANENTLY)
    .label('sdk.response.type', Response.CONTENT_TYPE_HTML)
    .label('sdk.methodType', 'webAuth')
    .label('abuse-limit', 50)
    .label('abuse-key', 'ip:{ip}')
    .param('provider', '', new WhiteList(Object.keys(Config.getParam('oAuthProviders')), true), 'OAuth2 Provider. Currently, supported providers are: ' + Object.keys(Config.getParam('oAuthProviders')).filter((node: any) => !node.mock).join(', ') + '.')
    .param('success', '', clients => new Host(clients), 'URL to redirect back to your app after a successful login attempt.  Only URLs from hostnames in your project\'s platform list are allowed. This requirement helps to prevent an [open redirect](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html) attack against your project API.', true, ['clients'])
    .param('failure', '', clients => new Host(clients), 'URL to redirect back to your app after a failed login attempt.  Only URLs from hostnames in your project\'s platform list are allowed. This requirement helps to prevent an [open redirect](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html) attack against your project API.', true, ['clients'])
    .param('scopes', [], new ArrayList(new Text(APP_LIMIT_ARRAY_ELEMENT_SIZE), APP_LIMIT_ARRAY_PARAMS_SIZE), 'A list of custom OAuth2 scopes. Check each provider internal docs for a list of supported scopes. Maximum of ' + APP_LIMIT_ARRAY_PARAMS_SIZE + ' scopes are allowed, each ' + APP_LIMIT_ARRAY_ELEMENT_SIZE + ' characters long.', true)
    .inject('request')
    .inject('response')
    .inject('project')
    .action(async (provider: string, success: string, failure: string, scopes: string[], request: Request, response: Response, project: Document) => {
        const protocol = request.getProtocol();

        const callback = `${protocol}://${request.getHostname()}/v1/account/sessions/oauth2/callback/${provider}/${project.getId()}`;
        const providerEnabled = project.getAttribute('oAuthProviders', {})[`${provider}Enabled`] ?? false;

        if (!providerEnabled) {
            throw new Error('This provider is disabled. Please enable the provider from your ' + APP_NAME + ' console to continue.');
        }

        let appId = project.getAttribute('oAuthProviders', {})[`${provider}Appid`] ?? '';
        let appSecret = project.getAttribute('oAuthProviders', {})[`${provider}Secret`] ?? '{}';

        if (appSecret && appSecret.version) {
            const key = process.env[`_APP_OPENSSL_KEY_V${appSecret.version}`] as string;
            const buffer = Buffer.from(key, 'utf-8');
            appSecret = OpenSSL.decrypt(appSecret.data, appSecret.method, buffer, 0, Buffer.from(appSecret.iv, 'hex'),
            //@ts-ignore
                Buffer.from(appSecret.tag, 'hex'));
        }

        if (!appId || !appSecret) {
            throw new Error('This provider is disabled. Please configure the provider app ID and app secret key from your ' + APP_NAME + ' console to continue.');
        }

        const className = `Appconda\\Auth\\OAuth2\\${provider.charAt(0).toUpperCase() + provider.slice(1)}`;

        if (!(className in globalThis)) {
            throw new Error('PROJECT_PROVIDER_UNSUPPORTED');
        }

        if (!success) {
            success = `${protocol}://${request.getHostname()}${oauthDefaultSuccess}`;
        }

        if (!failure) {
            failure = `${protocol}://${request.getHostname()}${oauthDefaultFailure}`;
        }

        const oauth2 = new globalThis[className](appId, appSecret, callback, {
            success,
            failure,
            token: false,
        }, scopes);

        response
            .addHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
            .addHeader('Pragma', 'no-cache')
            .redirect(oauth2.getLoginURL());
    });


App.get('/v1/account/sessions/oauth2/callback/:provider/:projectId')
    .desc('OAuth2 callback')
    .groups(['account'])
    .label('error', __dirname + '../../views/general/error.phtml')
    .label('scope', 'public')
    .label('docs', false)
    .param('projectId', '', new Text(1024), 'Project ID.')
    .param('provider', '', new WhiteList(Object.keys(Config.getParam('oAuthProviders')), true), 'OAuth2 provider.')
    .param('code', '', new Text(2048, 0), 'OAuth2 code. This is a temporary code that will be later exchanged for an access token.', true)
    .param('state', '', new Text(2048), 'Login state params.', true)
    .param('error', '', new Text(2048, 0), 'Error code returned from the OAuth2 provider.', true)
    .param('error_description', '', new Text(2048, 0), 'Human-readable text providing additional information about the error returned from the OAuth2 provider.', true)
    .inject('request')
    .inject('response')
    .action(async (projectId: string, provider: string, code: string, state: string, error: string, error_description: string, request: Request, response: Response) => {

        const domain = request.getHostname();
        const protocol = request.getProtocol();

        const params = request.getParams();
        params['project'] = projectId;
        delete params['projectId'];

        response
            .addHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
            .addHeader('Pragma', 'no-cache')
            .redirect(`${protocol}://${domain}/v1/account/sessions/oauth2/${provider}/redirect?${new URLSearchParams(params).toString()}`);
    });

App.post('/v1/account/sessions/oauth2/callback/:provider/:projectId')
    .desc('OAuth2 callback')
    .groups(['account'])
    .label('error', _default + '../../views/general/error.phtml')
    .label('scope', 'public')
    .label('origin', '*')
    .label('docs', false)
    .param('projectId', '', new Text(1024), 'Project ID.')
    .param('provider', '', new WhiteList(Object.keys(Config.getParam('oAuthProviders')), true), 'OAuth2 provider.')
    .param('code', '', new Text(2048, 0), 'OAuth2 code. This is a temporary code that will be later exchanged for an access token.', true)
    .param('state', '', new Text(2048), 'Login state params.', true)
    .param('error', '', new Text(2048, 0), 'Error code returned from the OAuth2 provider.', true)
    .param('error_description', '', new Text(2048, 0), 'Human-readable text providing additional information about the error returned from the OAuth2 provider.', true)
    .inject('request')
    .inject('response')
    .action(async (projectId: string, provider: string, code: string, state: string, error: string, error_description: string, request: Request, response: Response) => {

        const domain = request.getHostname();
        const protocol = request.getProtocol();

        const params = request.getParams();
        params['project'] = projectId;
        delete params['projectId'];

        response
            .addHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
            .addHeader('Pragma', 'no-cache')
            .redirect(`${protocol}://${domain}/v1/account/sessions/oauth2/${provider}/redirect?${new URLSearchParams(params).toString()}`);
    });


App.get('/v1/account/sessions/oauth2/:provider/redirect')
    .desc('OAuth2 redirect')
    .groups(['api', 'account', 'session'])
    .label('error', __dirname + '../../views/general/error.phtml')
    .label('event', 'users.[userId].sessions.[sessionId].create')
    .label('scope', 'public')
    .label('audits.event', 'session.create')
    .label('audits.resource', 'user/{user.$id}')
    .label('audits.userId', '{user.$id}')
    .label('abuse-limit', 50)
    .label('abuse-key', 'ip:{ip}')
    .label('docs', false)
    .param('provider', '', new WhiteList(Object.keys(Config.getParam('oAuthProviders')), true), 'OAuth2 provider.')
    .param('code', '', new Text(2048, 0), 'OAuth2 code. This is a temporary code that will be later exchanged for an access token.', true)
    .param('state', '', new Text(2048), 'OAuth2 state params.', true)
    .param('error', '', new Text(2048, 0), 'Error code returned from the OAuth2 provider.', true)
    .param('error_description', '', new Text(2048, 0), 'Human-readable text providing additional information about the error returned from the OAuth2 provider.', true)
    .inject('request')
    .inject('response')
    .inject('project')
    .inject('user')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async (provider: string, code: string, state: string, error: string, error_description: string, request: Request,
        response: Response, project: Document, user: Document, dbForProject: Database, queueForEvents: Event) => {
        const protocol = request.getProtocol();
        const callback = `${protocol}://${request.getHostname()}/v1/account/sessions/oauth2/callback/${provider}/${project.getId()}`;
        const defaultState = { success: project.getAttribute('url', ''), failure: '' };
        const validateURL = new URLValidator();
        const appId = project.getAttribute('oAuthProviders', {})[`${provider}Appid`] ?? '';
        let appSecret = project.getAttribute('oAuthProviders', {})[`${provider}Secret`] ?? '{}';
        const providerEnabled = project.getAttribute('oAuthProviders', {})[`${provider}Enabled`] ?? false;

        const className = `Appconda\\Auth\\OAuth2\\${provider.charAt(0).toUpperCase() + provider.slice(1)}`;

        if (!globalThis[className]) {
            throw new Error('PROJECT_PROVIDER_UNSUPPORTED');
        }

        const providers = Config.getParam('oAuthProviders');
        const providerName = providers[provider]?.name ?? '';

        const oauth2 = new globalThis[className](appId, appSecret, callback);

        let parsedState;
        if (state) {
            try {
                parsedState = { ...defaultState, ...oauth2.parseState(state) };
            } catch (error) {
                throw new Error('Failed to parse login state params as passed from OAuth2 provider');
            }
        } else {
            parsedState = defaultState;
        }

        if (!validateURL.isValid(parsedState.success)) {
            throw new Error('PROJECT_INVALID_SUCCESS_URL');
        }

        if (parsedState.failure && !validateURL.isValid(parsedState.failure)) {
            throw new Error('PROJECT_INVALID_FAILURE_URL');
        }

        const failureRedirect = (type, message?, code?) => {
            const exception = new Exception(type);
            if (parsedState.failure) {
                const failureURL = new URL(parsedState.failure);
                failureURL.searchParams.set('error', JSON.stringify({
                    message: exception.message,
                    type: exception.name,
                    code: code ?? exception.code,
                }));
                response.redirect(failureURL.toString(), 301);
            }
            throw exception;
        };

        if (!providerEnabled) {
            failureRedirect('PROJECT_PROVIDER_DISABLED',
                'This provider is disabled. Please enable the provider from your console to continue.');
        }

        if (error) {
            let message = `The ${providerName} OAuth2 provider returned an error: ${error}`;
            if (error_description) {
                message += `: ${error_description}`;
            }
            failureRedirect('USER_OAUTH2_PROVIDER_ERROR', message);
        }

        if (!code) {
            failureRedirect('USER_OAUTH2_PROVIDER_ERROR', 'Missing OAuth2 code. Please contact the Appconda team for additional support.');
        }

        if (appSecret && appSecret.version) {
            const key = process.env[`_APP_OPENSSL_KEY_V${appSecret.version}`] as string;
            const bufferUtf8 = Buffer.from(key, "utf-8");
            //@ts-ignore
            appSecret = OpenSSL.decrypt(appSecret.data, appSecret.method, bufferUtf8, 0, Buffer.from(appSecret.iv, 'hex'), Buffer.from(appSecret.tag, 'hex'));
        }

        let accessToken, refreshToken, accessTokenExpiry;
        try {
            accessToken = await oauth2.getAccessToken(code);
            refreshToken = await oauth2.getRefreshToken(code);
            accessTokenExpiry = await oauth2.getAccessTokenExpiry(code);
        } catch (ex: any) {
            failureRedirect(ex.name, `Failed to obtain access token. The ${providerName} OAuth2 provider returned an error: ${ex.message}`, ex.code);
        }

        const oauth2ID = await oauth2.getUserID(accessToken);
        if (!oauth2ID) {
            failureRedirect('USER_MISSING_ID');
        }

        let name = await oauth2.getUserName(accessToken);
        const email = await oauth2.getUserEmail(accessToken);

        let sessionUpgrade = false;
        if (!user.isEmpty()) {
            const userId = user.getId();

            const identityWithMatchingEmail = await dbForProject.findOne('identities', [
                Query.equal('providerEmail', [email]),
                Query.notEqual('userInternalId', user.getInternalId()),
            ]);
            if (identityWithMatchingEmail) {
                throw new Error('USER_ALREADY_EXISTS');
            }

            const userWithMatchingEmail = await dbForProject.find('users', [
                Query.equal('email', [email]),
                Query.notEqual('$id', userId),
            ]);
            if (userWithMatchingEmail.length) {
                throw new Error('USER_ALREADY_EXISTS');
            }

            sessionUpgrade = true;
        }

        const sessions = user.getAttribute('sessions', []);
        const current = Auth.sessionVerify(sessions, Auth.secret) as string;

        if (current) {
            const currentDocument = await dbForProject.getDocument('sessions', current);
            if (!currentDocument.isEmpty()) {
                await dbForProject.deleteDocument('sessions', currentDocument.getId());
                await dbForProject.purgeCachedDocument('users', user.getId());
            }
        }

        if (user.isEmpty()) {
            const session: any = await dbForProject.findOne('sessions', [
                Query.equal('provider', [provider]),
                Query.equal('providerUid', [oauth2ID]),
            ]);
            if (session && !session.isEmpty()) {
                user.setAttributes((await dbForProject.getDocument('users',
                    session.getAttribute('userId'))).getArrayCopy());
            }
        }

        if (user.isEmpty()) {
            if (!email) {
                throw new Exception('USER_UNAUTHORIZED', 'OAuth provider failed to return email.');
            }

            const isVerified = await oauth2.isEmailVerified(accessToken);

            const userWithEmail = await dbForProject.findOne('users', [
                Query.equal('email', [email]),
            ]);
            if (userWithEmail && !userWithEmail.isEmpty()) {
                user.setAttributes(userWithEmail.getArrayCopy());
            }

            if (user.isEmpty()) {
                const identity = await dbForProject.findOne('identities', [
                    Query.equal('provider', [provider]),
                    Query.equal('providerUid', [oauth2ID]),
                ]);

                if (identity && !identity.isEmpty()) {
                    user.setAttributes((await dbForProject.getDocument('users',
                        identity.getAttribute('userId'))).getArrayCopy());
                }
            }

            if (user.isEmpty()) {
                const limit = project.getAttribute('auths', [])['limit'] ?? 0;

                if (limit !== 0) {
                    const total = await dbForProject.count('users', [], APP_LIMIT_USERS);

                    if (total >= limit) {
                        failureRedirect('USER_COUNT_EXCEEDED');
                    }
                }

                const identityWithMatchingEmail = await dbForProject.findOne('identities', [
                    Query.equal('providerEmail', [email]),
                ]);
                if (identityWithMatchingEmail) {
                    throw new Error('GENERAL_BAD_REQUEST');
                }

                try {
                    const userId = ID.unique();
                    user.setAttributes({
                        '$id': userId,
                        '$permissions': [
                            Permission.read(Role.any()),
                            Permission.update(Role.user(userId)),
                            Permission.delete(Role.user(userId)),
                        ],
                        'email': email,
                        'emailVerification': true,
                        'status': true,
                        'password': null,
                        'hash': Auth.DEFAULT_ALGO,
                        'hashOptions': Auth.DEFAULT_ALGO_OPTIONS,
                        'passwordUpdate': null,
                        'registration': DateTime.now(),
                        'reset': false,
                        'name': name,
                        'mfa': false,
                        'prefs': {},
                        'sessions': null,
                        'tokens': null,
                        'memberships': null,
                        'authenticators': null,
                        'search': `${userId} ${email} ${name}`,
                        'accessedAt': DateTime.now(),
                    });
                    user.removeAttribute('$internalId');
                    const userDoc = await Authorization.skip(() => dbForProject.createDocument('users', user));
                    await dbForProject.createDocument('targets', new Document({
                        '$permissions': [
                            Permission.read(Role.user(user.getId())),
                            Permission.update(Role.user(user.getId())),
                            Permission.delete(Role.user(user.getId())),
                        ],
                        'userId': userDoc.getId(),
                        'userInternalId': userDoc.getInternalId(),
                        'providerType': MESSAGE_TYPE_EMAIL,
                        'identifier': email,
                    }));
                } catch (error) {
                    failureRedirect('USER_ALREADY_EXISTS');
                }
            }
        }

        Authorization.setRole(Role.user(user.getId()).toString());
        Authorization.setRole(Role.users().toString());

        if (user.getAttribute('status') === false) {
            failureRedirect('USER_BLOCKED');
        }

        let identity = await dbForProject.findOne('identities', [
            Query.equal('userInternalId', [user.getInternalId()]),
            Query.equal('provider', [provider]),
            Query.equal('providerUid', [oauth2ID]),
        ]);
        if (!identity || identity.isEmpty()) {
            const userId = user.getId();

            const identitiesWithMatchingEmail = await dbForProject.find('identities', [
                Query.equal('providerEmail', [email]),
                Query.notEqual('userInternalId', user.getInternalId()),
            ]);
            if (identitiesWithMatchingEmail.length) {
                throw new Error('GENERAL_BAD_REQUEST');
            }

            await dbForProject.createDocument('identities', new Document({
                '$id': ID.unique(),
                '$permissions': [
                    Permission.read(Role.any()),
                    Permission.update(Role.user(userId)),
                    Permission.delete(Role.user(userId)),
                ],
                'userInternalId': user.getInternalId(),
                'userId': userId,
                'provider': provider,
                'providerUid': oauth2ID,
                'providerEmail': email,
                'providerAccessToken': accessToken,
                'providerRefreshToken': refreshToken,
                'providerAccessTokenExpiry': DateTime.addSeconds(new Date(), accessTokenExpiry),
            }));
        } else {
            identity
                .setAttribute('providerAccessToken', accessToken)
                .setAttribute('providerRefreshToken', refreshToken)
                .setAttribute('providerAccessTokenExpiry', DateTime.addSeconds(new Date(), accessTokenExpiry));
            await dbForProject.updateDocument('identities', identity.getId(), identity);
        }

        if (!user.getAttribute('email')) {
            user.setAttribute('email', await oauth2.getUserEmail(accessToken));
        }

        if (!user.getAttribute('name')) {
            user.setAttribute('name', await oauth2.getUserName(accessToken));
        }

        user.setAttribute('status', true);

        await dbForProject.updateDocument('users', user.getId(), user);

        Authorization.setRole(Role.user(user.getId()).toString());

        const successURL = new URL(parsedState.success);
        const query = new URLSearchParams(successURL.search);

        const duration = project.getAttribute('auths', [])['duration'] ?? Auth.TOKEN_EXPIRATION_LOGIN_LONG;
        const expire = DateTime.formatTz(DateTime.addSeconds(new Date(), duration)) as string;

        let session;

        if (parsedState.token) {
            const secret = Auth.tokenGenerator(Auth.TOKEN_LENGTH_OAUTH2);
            const token = new Document({
                '$id': ID.unique(),
                'userId': user.getId(),
                'userInternalId': user.getInternalId(),
                'type': Auth.TOKEN_TYPE_OAUTH2,
                'secret': Auth.hash(secret),
                'expire': expire,
                'userAgent': request.getUserAgent('UNKNOWN'),
                'ip': request.getIP(),
            });

            Authorization.setRole(Role.user(user.getId()).toString());

            await dbForProject.createDocument('tokens', token.setAttribute('$permissions', [
                Permission.read(Role.user(user.getId())),
                Permission.update(Role.user(user.getId())),
                Permission.delete(Role.user(user.getId())),
            ]));

            queueForEvents
                .setEvent('users.[userId].tokens.[tokenId].create')
                .setParam('userId', user.getId())
                .setParam('tokenId', token.getId());

            query.set('secret', secret);
            query.set('userId', user.getId());
        } else {
            const detector = new Detector(request.getUserAgent('UNKNOWN'));
            const record: any = await getGeoInfo(request.getIP());
            const secret = Auth.tokenGenerator(Auth.TOKEN_LENGTH_SESSION);

            session = new Document({
                ...{
                    '$id': ID.unique(),
                    'userId': user.getId(),
                    'userInternalId': user.getInternalId(),
                    'provider': provider,
                    'providerUid': oauth2ID,
                    'providerAccessToken': accessToken,
                    'providerRefreshToken': refreshToken,
                    'providerAccessTokenExpiry': DateTime.addSeconds(new Date(), accessTokenExpiry),
                    'secret': Auth.hash(secret),
                    'userAgent': request.getUserAgent('UNKNOWN'),
                    'ip': request.getIP(),
                    'factors': [Type.EMAIL, 'oauth2'],
                    'countryCode': record ? record['country']['iso_code'].toLowerCase() : '--',
                    'expire': DateTime.addSeconds(new Date(), duration)
                },
                ...detector.getOS(),
                ...detector.getClient(),
                ...detector.getDevice()
            });

            await dbForProject.createDocument('sessions', session.setAttribute('$permissions', [
                Permission.read(Role.user(user.getId())),
                Permission.update(Role.user(user.getId())),
                Permission.delete(Role.user(user.getId())),
            ]));

            session.setAttribute('expire', expire);

            if (!Config.getParam('domainVerification')) {
                response.addHeader('X-Fallback-Cookies', JSON.stringify({ [Auth.cookieName]: Auth.encodeSession(user.getId(), secret) }));
            }

            queueForEvents
                .setParam('userId', user.getId())
                .setParam('sessionId', session.getId())
                .setPayload(response.output(session, Response.MODEL_SESSION));

            if (parsedState.success === oauthDefaultSuccess) {
                query.set('project', project.getId());
                query.set('domain', Config.getParam('cookieDomain'));
                query.set('key', Auth.cookieName);
                query.set('secret', Auth.encodeSession(user.getId(), secret));
            }

            response
                .addCookie(`${Auth.cookieName}_legacy`, Auth.encodeSession(user.getId(), secret), new Date(expire).getTime(), '/', Config.getParam('cookieDomain'), protocol === 'https', true, null)
                .addCookie(Auth.cookieName, Auth.encodeSession(user.getId(), secret), new Date(expire).getTime(), '/', Config.getParam('cookieDomain'), protocol === 'https', true, Config.getParam('cookieSamesite'));
        }

        if (sessionUpgrade) {
            for (const target of user.getAttribute('targets', [])) {
                if (target.getAttribute('providerType') !== MESSAGE_TYPE_PUSH) {
                    continue;
                }

                target
                    .setAttribute('sessionId', session.getId())
                    .setAttribute('sessionInternalId', session.getInternalId());

                await dbForProject.updateDocument('targets', target.getId(), target);
            }
        }

        await dbForProject.purgeCachedDocument('users', user.getId());

        successURL.search = query.toString();
        response
            .addHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
            .addHeader('Pragma', 'no-cache')
            .redirect(successURL.toString());
    });

App.get('/v1/account/tokens/oauth2/:provider')
    .desc('Create OAuth2 token')
    .groups(['api', 'account'])
    .label('error', __dirname + '../../views/general/error.phtml')
    .label('scope', 'sessions.write')
    .label('sdk.auth', [])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'createOAuth2Token')
    .label('sdk.description', '/docs/references/account/create-token-oauth2.md')
    .label('sdk.response.code', Response.STATUS_CODE_MOVED_PERMANENTLY)
    .label('sdk.response.type', Response.CONTENT_TYPE_HTML)
    .label('sdk.methodType', 'webAuth')
    .label('abuse-limit', 50)
    .label('abuse-key', 'ip:{ip}')
    .param('provider', '', new WhiteList(Object.keys(Config.getParam('oAuthProviders')), true), 'OAuth2 Provider. Currently, supported providers are: ' + Object.keys(Config.getParam('oAuthProviders')).filter((node: any) => !node.mock).join(', ') + '.')
    .param('success', '', clients => new Host(clients), 'URL to redirect back to your app after a successful login attempt.  Only URLs from hostnames in your project\'s platform list are allowed. This requirement helps to prevent an [open redirect](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html) attack against your project API.', true, ['clients'])
    .param('failure', '', clients => new Host(clients), 'URL to redirect back to your app after a failed login attempt.  Only URLs from hostnames in your project\'s platform list are allowed. This requirement helps to prevent an [open redirect](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html) attack against your project API.', true, ['clients'])
    .param('scopes', [], new ArrayList(new Text(APP_LIMIT_ARRAY_ELEMENT_SIZE), APP_LIMIT_ARRAY_PARAMS_SIZE), 'A list of custom OAuth2 scopes. Check each provider internal docs for a list of supported scopes. Maximum of ' + APP_LIMIT_ARRAY_PARAMS_SIZE + ' scopes are allowed, each ' + APP_LIMIT_ARRAY_ELEMENT_SIZE + ' characters long.', true)
    .inject('request')
    .inject('response')
    .inject('project')
    .action(async (provider: string, success: string, failure: string, scopes: string[], request: Request, response: Response, project: Document) => {
        const protocol = request.getProtocol();

        const callback = `${protocol}://${request.getHostname()}/v1/account/sessions/oauth2/callback/${provider}/${project.getId()}`;
        const providerEnabled = project.getAttribute('oAuthProviders', {})[`${provider}Enabled`] ?? false;

        if (!providerEnabled) {
            throw new Error('This provider is disabled. Please enable the provider from your console to continue.');
        }

        let appId = project.getAttribute('oAuthProviders', {})[`${provider}Appid`] ?? '';
        let appSecret = project.getAttribute('oAuthProviders', {})[`${provider}Secret`] ?? '{}';

        if (appSecret && appSecret.version) {
            const key = process.env[`_APP_OPENSSL_KEY_V${appSecret.version}`] as string;
            const bufferUtf8 = Buffer.from(key, "utf-8");
            //@ts-ignore
            appSecret = OpenSSL.decrypt(appSecret.data, appSecret.method, bufferUtf8, 0, Buffer.from(appSecret.iv, 'hex'), Buffer.from(appSecret.tag, 'hex'));
        }

        if (!appId || !appSecret) {
            throw new Error('This provider is disabled. Please configure the provider app ID and app secret key from your console to continue.');
        }

        const className = `Appconda\\Auth\\OAuth2\\${provider.charAt(0).toUpperCase() + provider.slice(1)}`;

        if (!(className in globalThis)) {
            throw new Error('PROJECT_PROVIDER_UNSUPPORTED');
        }

        if (!success) {
            success = `${protocol}://${request.getHostname()}${oauthDefaultSuccess}`;
        }

        if (!failure) {
            failure = `${protocol}://${request.getHostname()}${oauthDefaultFailure}`;
        }

        const oauth2 = new globalThis[className](appId, appSecret, callback, {
            success,
            failure,
            token: true,
        }, scopes);

        response
            .addHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
            .addHeader('Pragma', 'no-cache')
            .redirect(oauth2.getLoginURL());
    });

App.post('/v1/account/tokens/magic-url')
    .alias('/v1/account/sessions/magic-url')
    .desc('Create magic URL token')
    .groups(['api', 'account', 'auth'])
    .label('scope', 'sessions.write')
    .label('auth.type', 'magic-url')
    .label('audits.event', 'session.create')
    .label('audits.resource', 'user/{response.userId}')
    .label('audits.userId', '{response.userId}')
    .label('sdk.auth', [])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'createMagicURLToken')
    .label('sdk.description', '/docs/references/account/create-token-magic-url.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_TOKEN)
    .label('abuse-limit', 60)
    .label('abuse-key', ['url:{url},email:{param-email}', 'url:{url},ip:{ip}'])
    .param('userId', '', new CustomId(), 'Unique Id. Choose a custom ID or generate a random ID with `ID.unique()`. Valid chars are a-z, A-Z, 0-9, period, hyphen, and underscore. Can\'t start with a special char. Max length is 36 chars.')
    .param('email', '', new Email(), 'User email.')
    .param('url', '', clients => new Host(clients), 'URL to redirect the user back to your app from the magic URL login. Only URLs from hostnames in your project platform list are allowed. This requirement helps to prevent an [open redirect](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html) attack against your project API.', true, ['clients'])
    .param('phrase', false, new Boolean(), 'Toggle for security phrase. If enabled, email will be sent with a randomly generated phrase and the phrase will also be included in the response. Confirming phrases match increases the security of your authentication flow.', true)
    .inject('request')
    .inject('response')
    .inject('user')
    .inject('project')
    .inject('dbForProject')
    .inject('locale')
    .inject('queueForEvents')
    .inject('queueForMails')
    .action(async (userId: string, email: string, url: string, phrase: boolean, request: Request, response: Response, user: Document, project: Document, dbForProject: Database, locale: Locale, queueForEvents: Event, queueForMails: Mail) => {
        if (!process.env._APP_SMTP_HOST) {
            throw new Error('SMTP disabled');
        }

        function htmlentities(str: string): string {
            return str.replace(/[\u00A0-\u9999<>\&]/gim, function (i) {
                return `&#${i.charCodeAt(0)};`;
            });
        }

        url = htmlentities(url);

        if (phrase) {
            phrase = Phrase.generate() as any;
        }

        const roles = Authorization.getRoles();
        const isPrivilegedUser = Auth.isPrivilegedUser(roles);
        const isAppUser = Auth.isAppUser(roles);

        const result = await dbForProject.findOne('users', [Query.equal('email', [email])]);
        if (result && !result.isEmpty()) {
            user.setAttributes(result.getArrayCopy());
        } else {
            const limit = project.getAttribute('auths', [])['limit'] ?? 0;

            if (limit !== 0) {
                const total = await dbForProject.count('users', [], APP_LIMIT_USERS);

                if (total >= limit) {
                    throw new Error('USER_COUNT_EXCEEDED');
                }
            }

            const identityWithMatchingEmail = await dbForProject.findOne('identities', [
                Query.equal('providerEmail', [email]),
            ]);
            if (identityWithMatchingEmail && !identityWithMatchingEmail.isEmpty()) {
                throw new Error('USER_EMAIL_ALREADY_EXISTS');
            }

            userId = userId === 'unique()' ? ID.unique() : userId;

            user.setAttributes({
                '$id': userId,
                '$permissions': [
                    Permission.read(Role.any()),
                    Permission.update(Role.user(userId)),
                    Permission.delete(Role.user(userId)),
                ],
                'email': email,
                'emailVerification': false,
                'status': true,
                'password': null,
                'hash': Auth.DEFAULT_ALGO,
                'hashOptions': Auth.DEFAULT_ALGO_OPTIONS,
                'passwordUpdate': null,
                'registration': DateTime.now(),
                'reset': false,
                'mfa': false,
                'prefs': new Object(),
                'sessions': null,
                'tokens': null,
                'memberships': null,
                'authenticators': null,
                'search': [userId, email].join(' '),
                'accessedAt': DateTime.now(),
            });

            user.removeAttribute('$internalId');
            await Authorization.skip(() => dbForProject.createDocument('users', user));
        }

        const tokenSecret = Auth.tokenGenerator(Auth.TOKEN_LENGTH_MAGIC_URL);
        const expire = DateTime.formatTz(DateTime.addSeconds(new Date(), Auth.TOKEN_EXPIRATION_CONFIRM)) as string;

        const token = new Document({
            '$id': ID.unique(),
            'userId': user.getId(),
            'userInternalId': user.getInternalId(),
            'type': Auth.TOKEN_TYPE_MAGIC_URL,
            'secret': Auth.hash(tokenSecret),
            'expire': expire,
            'userAgent': request.getUserAgent('UNKNOWN'),
            'ip': request.getIP(),
        });

        Authorization.setRole(Role.user(user.getId()).toString());

        await dbForProject.createDocument('tokens', token.setAttribute('$permissions', [
            Permission.read(Role.user(user.getId())),
            Permission.update(Role.user(user.getId())),
            Permission.delete(Role.user(user.getId())),
        ]));

        await dbForProject.purgeCachedDocument('users', user.getId());

        if (!url) {
            url = `${request.getProtocol()}://${request.getHostname()}/auth/magic-url`;
        }

        const parsedURL = new URL(url);
        parsedURL.searchParams.set('userId', user.getId());
        parsedURL.searchParams.set('secret', tokenSecret);
        parsedURL.searchParams.set('expire', expire);
        parsedURL.searchParams.set('project', project.getId());
        url = parsedURL.toString();

        let subject = locale.getText("emails.magicSession.subject");
        const customTemplate = project.getAttribute('templates', {})[`email.magicSession-${locale.default}`] ?? {};

        const detector = new Detector(request.getUserAgent('UNKNOWN'));
        const agentOs = detector.getOS();
        const agentClient = detector.getClient();
        const agentDevice = detector.getDevice();

        const message = Template.fromFile(__dirname + '../../config/locale/templates/email-magic-url.tpl');
        message
            .setParam('{{hello}}', locale.getText("emails.magicSession.hello"))
            .setParam('{{optionButton}}', locale.getText("emails.magicSession.optionButton"))
            .setParam('{{buttonText}}', locale.getText("emails.magicSession.buttonText"))
            .setParam('{{optionUrl}}', locale.getText("emails.magicSession.optionUrl"))
            .setParam('{{clientInfo}}', locale.getText("emails.magicSession.clientInfo"))
            .setParam('{{thanks}}', locale.getText("emails.magicSession.thanks"))
            .setParam('{{signature}}', locale.getText("emails.magicSession.signature"));

        if (phrase) {
            message.setParam('{{securityPhrase}}', locale.getText("emails.magicSession.securityPhrase"));
        } else {
            message.setParam('{{securityPhrase}}', '');
        }

        let body = await message.render();

        const smtp = project.getAttribute('smtp', {});
        const smtpEnabled = smtp['enabled'] ?? false;

        let senderEmail = process.env._APP_SYSTEM_EMAIL_ADDRESS || APP_EMAIL_TEAM;
        let senderName = process.env._APP_SYSTEM_EMAIL_NAME || `${APP_NAME} Server`;
        let replyTo = "";

        if (smtpEnabled) {
            if (smtp['senderEmail']) {
                senderEmail = smtp['senderEmail'];
            }
            if (smtp['senderName']) {
                senderName = smtp['senderName'];
            }
            if (smtp['replyTo']) {
                replyTo = smtp['replyTo'];
            }

            queueForMails
                .setSmtpHost(smtp['host'] ?? '')
                .setSmtpPort(smtp['port'] ?? '')
                .setSmtpUsername(smtp['username'] ?? '')
                .setSmtpPassword(smtp['password'] ?? '')
                .setSmtpSecure(smtp['secure'] ?? '');

            if (customTemplate) {
                if (customTemplate['senderEmail']) {
                    senderEmail = customTemplate['senderEmail'];
                }
                if (customTemplate['senderName']) {
                    senderName = customTemplate['senderName'];
                }
                if (customTemplate['replyTo']) {
                    replyTo = customTemplate['replyTo'];
                }

                body = customTemplate['message'] ?? '';
                subject = customTemplate['subject'] ?? subject;
            }

            queueForMails
                .setSmtpReplyTo(replyTo)
                .setSmtpSenderEmail(senderEmail)
                .setSmtpSenderName(senderName);
        }

        const emailVariables = {
            'direction': locale.getText('settings.direction'),
            'user': user.getAttribute('name'),
            'project': project.getAttribute('name'),
            'redirect': url,
            'agentDevice': agentDevice['deviceBrand'] ?? 'UNKNOWN',
            'agentClient': agentClient['clientName'] ?? 'UNKNOWN',
            'agentOs': agentOs['osName'] ?? 'UNKNOWN',
            'phrase': phrase || '',
            'team': '',
        };

        queueForMails
            .setSubject(subject)
            .setBody(body)
            .setVariables(emailVariables)
            .setRecipient(email)
            .trigger();

        token.setAttribute('secret', tokenSecret);

        queueForEvents
            .setPayload(response.output(token, Response.MODEL_TOKEN), ['secret']);

        if (!isPrivilegedUser && !isAppUser) {
            token.setAttribute('secret', '');
        }

        if (phrase) {
            token.setAttribute('phrase', phrase);
        }

        response
            .setStatusCode(Response.STATUS_CODE_CREATED)
            .dynamic(token, Response.MODEL_TOKEN);
    });

App.post('/v1/account/tokens/email')
    .desc('Create email token (OTP)')
    .groups(['api', 'account', 'auth'])
    .label('scope', 'sessions.write')
    .label('auth.type', 'email-otp')
    .label('audits.event', 'session.create')
    .label('audits.resource', 'user/{response.userId}')
    .label('audits.userId', '{response.userId}')
    .label('sdk.auth', [])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'createEmailToken')
    .label('sdk.description', '/docs/references/account/create-token-email.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_TOKEN)
    .label('abuse-limit', 10)
    .label('abuse-key', 'url:{url},email:{param-email}')
    .param('userId', '', new CustomId(), 'User ID. Choose a custom ID or generate a random ID with `ID.unique()`. Valid chars are a-z, A-Z, 0-9, period, hyphen, and underscore. Can\'t start with a special char. Max length is 36 chars.')
    .param('email', '', new Email(), 'User email.')
    .param('phrase', false, new Boolean(), 'Toggle for security phrase. If enabled, email will be sent with a randomly generated phrase and the phrase will also be included in the response. Confirming phrases match increases the security of your authentication flow.', true)
    .inject('request')
    .inject('response')
    .inject('user')
    .inject('project')
    .inject('dbForProject')
    .inject('locale')
    .inject('queueForEvents')
    .inject('queueForMails')
    .action(async (userId: string, email: string, phrase: boolean, request: Request, response: Response, user: Document, project: Document, dbForProject: Database, locale: Locale, queueForEvents: Event, queueForMails: Mail) => {
        if (!process.env._APP_SMTP_HOST) {
            throw new Error('SMTP disabled');
        }

        if (phrase) {
            phrase = Phrase.generate() as any;
        }

        const roles = Authorization.getRoles();
        const isPrivilegedUser = Auth.isPrivilegedUser(roles);
        const isAppUser = Auth.isAppUser(roles);

        const result = await dbForProject.findOne('users', [Query.equal('email', [email])]);
        if (result && !result.isEmpty()) {
            user.setAttributes(result.getArrayCopy());
        } else {
            const limit = project.getAttribute('auths', [])['limit'] ?? 0;

            if (limit !== 0) {
                const total = await dbForProject.count('users', [], APP_LIMIT_USERS);

                if (total >= limit) {
                    throw new Error('USER_COUNT_EXCEEDED');
                }
            }

            const identityWithMatchingEmail = await dbForProject.findOne('identities', [
                Query.equal('providerEmail', [email]),
            ]);
            if (identityWithMatchingEmail && !identityWithMatchingEmail.isEmpty()) {
                throw new Error('GENERAL_BAD_REQUEST'); // Return a generic bad request to prevent exposing existing accounts
            }

            userId = userId === 'unique()' ? ID.unique() : userId;

            user.setAttributes({
                '$id': userId,
                '$permissions': [
                    Permission.read(Role.any()),
                    Permission.update(Role.user(userId)),
                    Permission.delete(Role.user(userId)),
                ],
                'email': email,
                'emailVerification': false,
                'status': true,
                'password': null,
                'hash': Auth.DEFAULT_ALGO,
                'hashOptions': Auth.DEFAULT_ALGO_OPTIONS,
                'passwordUpdate': null,
                'registration': DateTime.now(),
                'reset': false,
                'prefs': new Object(),
                'sessions': null,
                'tokens': null,
                'memberships': null,
                'search': [userId, email].join(' '),
                'accessedAt': DateTime.now(),
            });

            user.removeAttribute('$internalId');
            await Authorization.skip(() => dbForProject.createDocument('users', user));
        }

        const tokenSecret = Auth.codeGenerator(6);
        const expire = DateTime.formatTz(DateTime.addSeconds(new Date(), Auth.TOKEN_EXPIRATION_OTP));

        const token = new Document({
            '$id': ID.unique(),
            'userId': user.getId(),
            'userInternalId': user.getInternalId(),
            'type': Auth.TOKEN_TYPE_EMAIL,
            'secret': Auth.hash(tokenSecret), // One way hash encryption to protect DB leak
            'expire': expire,
            'userAgent': request.getUserAgent('UNKNOWN'),
            'ip': request.getIP(),
        });

        Authorization.setRole(Role.user(user.getId()).toString());

        await dbForProject.createDocument('tokens', token.setAttribute('$permissions', [
            Permission.read(Role.user(user.getId())),
            Permission.update(Role.user(user.getId())),
            Permission.delete(Role.user(user.getId())),
        ]));

        await dbForProject.purgeCachedDocument('users', user.getId());

        let subject = locale.getText("emails.otpSession.subject");
        const customTemplate = project.getAttribute('templates', {})[`email.otpSession-${locale.default}`] ?? [];

        const detector = new Detector(request.getUserAgent('UNKNOWN'));
        const agentOs = detector.getOS();
        const agentClient = detector.getClient();
        const agentDevice = detector.getDevice();

        const message = Template.fromFile(__dirname + '../../config/locale/templates/email-otp.tpl');
        message
            .setParam('{{hello}}', locale.getText("emails.otpSession.hello"))
            .setParam('{{description}}', locale.getText("emails.otpSession.description"))
            .setParam('{{clientInfo}}', locale.getText("emails.otpSession.clientInfo"))
            .setParam('{{thanks}}', locale.getText("emails.otpSession.thanks"))
            .setParam('{{signature}}', locale.getText("emails.otpSession.signature"));

        if (phrase) {
            message.setParam('{{securityPhrase}}', locale.getText("emails.otpSession.securityPhrase"));
        } else {
            message.setParam('{{securityPhrase}}', '');
        }

        let body = await message.render();

        const smtp = project.getAttribute('smtp', {});
        const smtpEnabled = smtp['enabled'] ?? false;

        let senderEmail = process.env._APP_SYSTEM_EMAIL_ADDRESS || APP_EMAIL_TEAM;
        let senderName = process.env._APP_SYSTEM_EMAIL_NAME || `${APP_NAME} Server`;
        let replyTo = "";

        if (smtpEnabled) {
            if (smtp['senderEmail']) {
                senderEmail = smtp['senderEmail'];
            }
            if (smtp['senderName']) {
                senderName = smtp['senderName'];
            }
            if (smtp['replyTo']) {
                replyTo = smtp['replyTo'];
            }

            queueForMails
                .setSmtpHost(smtp['host'] ?? '')
                .setSmtpPort(smtp['port'] ?? '')
                .setSmtpUsername(smtp['username'] ?? '')
                .setSmtpPassword(smtp['password'] ?? '')
                .setSmtpSecure(smtp['secure'] ?? '');

            if (customTemplate) {
                if (customTemplate['senderEmail']) {
                    senderEmail = customTemplate['senderEmail'];
                }
                if (customTemplate['senderName']) {
                    senderName = customTemplate['senderName'];
                }
                if (customTemplate['replyTo']) {
                    replyTo = customTemplate['replyTo'];
                }

                body = customTemplate['message'] ?? '';
                subject = customTemplate['subject'] ?? subject;
            }

            queueForMails
                .setSmtpReplyTo(replyTo)
                .setSmtpSenderEmail(senderEmail)
                .setSmtpSenderName(senderName);
        }

        const emailVariables = {
            'direction': locale.getText('settings.direction'),
            'user': user.getAttribute('name'),
            'project': project.getAttribute('name'),
            'otp': tokenSecret,
            'agentDevice': agentDevice['deviceBrand'] ?? 'UNKNOWN',
            'agentClient': agentClient['clientName'] ?? 'UNKNOWN',
            'agentOs': agentOs['osName'] ?? 'UNKNOWN',
            'phrase': phrase || '',
            'team': '',
        };

        queueForMails
            .setSubject(subject)
            .setBody(body)
            .setVariables(emailVariables)
            .setRecipient(email)
            .trigger();

        token.setAttribute('secret', tokenSecret);

        queueForEvents
            .setPayload(response.output(token, Response.MODEL_TOKEN), ['secret']);

        if (!isPrivilegedUser && !isAppUser) {
            token.setAttribute('secret', '');
        }

        if (phrase) {
            token.setAttribute('phrase', phrase);
        }

        response
            .setStatusCode(Response.STATUS_CODE_CREATED)
            .dynamic(token, Response.MODEL_TOKEN);
    });



App.put('/v1/account/sessions/magic-url')
    .desc('Update magic URL session')
    .label('event', 'users.[userId].sessions.[sessionId].create')
    .groups(['api', 'account', 'session'])
    .label('scope', 'sessions.write')
    .label('audits.event', 'session.create')
    .label('audits.resource', 'user/{response.userId}')
    .label('audits.userId', '{response.userId}')
    .label('sdk.auth', [])
    .label('sdk.deprecated', true)
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'updateMagicURLSession')
    .label('sdk.description', '/docs/references/account/create-session.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_SESSION)
    .label('abuse-limit', 10)
    .label('abuse-key', 'ip:{ip},userId:{param-userId}')
    .param('userId', '', new CustomId(), 'User ID. Choose a custom ID or generate a random ID with `ID.unique()`. Valid chars are a-z, A-Z, 0-9, period, hyphen, and underscore. Can\'t start with a special char. Max length is 36 chars.')
    .param('secret', '', new Text(256), 'Valid verification token.')
    .inject('request')
    .inject('response')
    .inject('user')
    .inject('dbForProject')
    .inject('project')
    .inject('locale')
    .inject('geodb')
    .inject('queueForEvents')
    .action(createSession);

App.put('/v1/account/sessions/phone')
    .desc('Update phone session')
    .label('event', 'users.[userId].sessions.[sessionId].create')
    .groups(['api', 'account', 'session'])
    .label('scope', 'sessions.write')
    .label('audits.event', 'session.create')
    .label('audits.resource', 'user/{response.userId}')
    .label('audits.userId', '{response.userId}')
    .label('sdk.auth', [])
    .label('sdk.deprecated', true)
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'updatePhoneSession')
    .label('sdk.description', '/docs/references/account/create-session.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_SESSION)
    .label('abuse-limit', 10)
    .label('abuse-key', 'ip:{ip},userId:{param-userId}')
    .param('userId', '', new CustomId(), 'User ID. Choose a custom ID or generate a random ID with `ID.unique()`. Valid chars are a-z, A-Z, 0-9, period, hyphen, and underscore. Can\'t start with a special char. Max length is 36 chars.')
    .param('secret', '', new Text(256), 'Valid verification token.')
    .inject('request')
    .inject('response')
    .inject('user')
    .inject('dbForProject')
    .inject('project')
    .inject('locale')
    .inject('geodb')
    .inject('queueForEvents')
    .action(createSession);

App.post('/v1/account/tokens/phone')
    .alias('/v1/account/sessions/phone')
    .desc('Create phone token')
    .groups(['api', 'account'])
    .label('scope', 'sessions.write')
    .label('auth.type', 'phone')
    .label('audits.event', 'session.create')
    .label('audits.resource', 'user/{response.userId}')
    .label('audits.userId', '{response.userId}')
    .label('sdk.auth', [])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'createPhoneToken')
    .label('sdk.description', '/docs/references/account/create-token-phone.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_TOKEN)
    .label('abuse-limit', 10)
    .label('abuse-key', ['url:{url},phone:{param-phone}', 'url:{url},ip:{ip}'])
    .param('userId', '', new CustomId(), 'Unique Id. Choose a custom ID or generate a random ID with `ID.unique()`. Valid chars are a-z, A-Z, 0-9, period, hyphen, and underscore. Can\'t start with a special char. Max length is 36 chars.')
    .param('phone', '', new Phone(), 'Phone number. Format this number with a leading \'+\' and a country code, e.g., +16175551212.')
    .inject('request')
    .inject('response')
    .inject('user')
    .inject('project')
    .inject('dbForProject')
    .inject('queueForEvents')
    .inject('queueForMessaging')
    .inject('locale')
    .action(async (userId: string, phone: string, request: Request, response: Response, user: Document, project: Document, dbForProject: Database, queueForEvents: Event, queueForMessaging: Messaging, locale: Locale) => {
        if (!process.env._APP_SMS_PROVIDER) {
            throw new Error('Phone provider not configured');
        }

        const roles = Authorization.getRoles();
        const isPrivilegedUser = Auth.isPrivilegedUser(roles);
        const isAppUser = Auth.isAppUser(roles);

        const result = await dbForProject.findOne('users', [Query.equal('phone', [phone])]);
        if (result && !result.isEmpty()) {
            user.setAttributes(result.getArrayCopy());
        } else {
            const limit = project.getAttribute('auths', [])['limit'] ?? 0;

            if (limit !== 0) {
                const total = await dbForProject.count('users', [], APP_LIMIT_USERS);

                if (total >= limit) {
                    throw new Error('USER_COUNT_EXCEEDED');
                }
            }

            userId = userId === 'unique()' ? ID.unique() : userId;
            user.setAttributes({
                '$id': userId,
                '$permissions': [
                    Permission.read(Role.any()),
                    Permission.update(Role.user(userId)),
                    Permission.delete(Role.user(userId)),
                ],
                'email': null,
                'phone': phone,
                'emailVerification': false,
                'phoneVerification': false,
                'status': true,
                'password': null,
                'passwordUpdate': null,
                'registration': DateTime.now(),
                'reset': false,
                'prefs': new Object(),
                'sessions': null,
                'tokens': null,
                'memberships': null,
                'search': [userId, phone].join(' '),
                'accessedAt': DateTime.now(),
            });

            user.removeAttribute('$internalId');
            Authorization.skip(() => dbForProject.createDocument('users', user));
            try {
                const target = Authorization.skip(() => dbForProject.createDocument('targets', new Document({
                    '$permissions': [
                        Permission.read(Role.user(user.getId())),
                        Permission.update(Role.user(user.getId())),
                        Permission.delete(Role.user(user.getId())),
                    ],
                    'userId': user.getId(),
                    'userInternalId': user.getInternalId(),
                    'providerType': MESSAGE_TYPE_SMS,
                    'identifier': phone,
                })));
                user.setAttribute('targets', [...user.getAttribute('targets', []), target]);
            } catch (Duplicate) {
                const existingTarget = await dbForProject.findOne('targets', [
                    Query.equal('identifier', [phone]),
                ]);
                user.setAttribute('targets', [...user.getAttribute('targets', []), existingTarget]);
            }
            await dbForProject.purgeCachedDocument('users', user.getId());
        }

        const secret = Auth.codeGenerator();
        const expire = DateTime.formatTz(DateTime.addSeconds(new Date(), Auth.TOKEN_EXPIRATION_OTP));

        const token = new Document({
            '$id': ID.unique(),
            'userId': user.getId(),
            'userInternalId': user.getInternalId(),
            'type': Auth.TOKEN_TYPE_PHONE,
            'secret': Auth.hash(secret),
            'expire': expire,
            'userAgent': request.getUserAgent('UNKNOWN'),
            'ip': request.getIP(),
        });

        Authorization.setRole(Role.user(user.getId()).toString());

        const createdToken = await dbForProject.createDocument('tokens', token.setAttribute('$permissions', [
            Permission.read(Role.user(user.getId())),
            Permission.update(Role.user(user.getId())),
            Permission.delete(Role.user(user.getId())),
        ]));

        await dbForProject.purgeCachedDocument('users', user.getId());

        let message = Template.fromFile(__dirname + '../../config/locale/templates/sms-base.tpl');

        const customTemplate = project.getAttribute('templates', [])[`sms.login-${locale.default}`] ?? [];
        if (customTemplate) {
            message = customTemplate['message'] ?? message;
        }

        const messageContent = Template.fromString(locale.getText("sms.verification.body"));
        messageContent
            .setParam('{{project}}', project.getAttribute('name'))
            .setParam('{{secret}}', secret);
        const messageText = messageContent.render();
        message = message.setParam('{{token}}', messageText);

        const messageDoc = new Document({
            '$id': createdToken.getId(),
            'data': {
                'content': message.render(),
            },
        });

        queueForMessaging
            .setType(MESSAGE_SEND_TYPE_INTERNAL)
            .setMessage(messageDoc)
            .setRecipients([phone])
            .setProviderType(MESSAGE_TYPE_SMS);

        createdToken.setAttribute('secret', secret);

        queueForEvents
            .setPayload(response.output(createdToken, Response.MODEL_TOKEN), ['secret']);

        createdToken.setAttribute('secret', (isPrivilegedUser || isAppUser) ? Auth.encodeSession(user.getId(), secret) : '');

        response
            .setStatusCode(Response.STATUS_CODE_CREATED)
            .dynamic(createdToken, Response.MODEL_TOKEN);
    });

App.post('/v1/account/jwt')
    .desc('Create JWT')
    .groups(['api', 'account', 'auth'])
    .label('scope', 'account')
    .label('auth.type', 'jwt')
    .label('sdk.auth', [])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'createJWT')
    .label('sdk.description', '/docs/references/account/create-jwt.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_JWT)
    .label('abuse-limit', 100)
    .label('abuse-key', 'url:{url},userId:{userId}')
    .inject('response')
    .inject('user')
    .inject('dbForProject')
    .action(async (response: Response, user: Document, dbForProject: Database) => {
        const sessions = user.getAttribute('sessions', []);
        let current = new Document();

        for (const session of sessions) {
            if (session.getAttribute('secret') === Auth.hash(Auth.secret)) {
                current = session;
                break;
            }
        }

        if (current.isEmpty()) {
            throw new Error('USER_SESSION_NOT_FOUND');
        }

        const secretKey = process.env._APP_OPENSSL_KEY_V1 || 'your-secret-key';


        const payload = process.env._APP_OPENSSL_KEY_V1; // You can put whatever you want in the payload
        const options = {
            algorithm: 'HS256',
            expiresIn: 900, // Token expiration in seconds (900 seconds = 15 minutes)
            notBefore: 10   // Token will not be valid before 10 seconds from now
        };

        const token = jwt.sign(
            { userId: user.getId(), sessionId: current.getId() }, // Payload
            secretKey,             // Secret key
            options
        );


        //const token = jwt.sign(payload, secretKey, options);

        //const jwt = new JWT(process.env._APP_OPENSSL_KEY_V1, 'HS256', 900, 10);

        response
            .setStatusCode(Response.STATUS_CODE_CREATED)
            .dynamic(new Document({
                jwt: token,
            }), Response.MODEL_JWT);
    });

App.get('/v1/account/prefs')
    .desc('Get account preferences')
    .groups(['api', 'account'])
    .label('scope', 'account')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'getPrefs')
    .label('sdk.description', '/docs/references/account/get-prefs.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_PREFERENCES)
    .label('sdk.offline.model', '/account/prefs')
    .label('sdk.offline.key', 'current')
    .inject('response')
    .inject('user')
    .action(async (response: Response, user: Document) => {
        const prefs = user.getAttribute('prefs', []);
        response.dynamic(new Document(prefs), Response.MODEL_PREFERENCES);
    });

App.get('/v1/account/logs')
    .desc('List logs')
    .groups(['api', 'account'])
    .label('scope', 'account')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'listLogs')
    .label('sdk.description', '/docs/references/account/list-logs.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_LOG_LIST)
    .param('queries', [], new Queries([new Limit(), new Offset()]), 'Array of query strings generated using the Query class provided by the SDK. [Learn more about queries](https://appconda.io/docs/queries). Only supported methods are limit and offset', true)
    .inject('response')
    .inject('request')
    .inject('user')
    .inject('locale')
    .inject('dbForProject')
    .action(async (queries: string[], response: Response, request: Request, user: Document, locale: Locale,
        dbForProject: Database) => {
        try {
            queries = Query.parseQueries(queries) as any;
        } catch (e: any) {
            throw new Exception('GENERAL_QUERY_INVALID', e.message);
        }

        const grouped = Query.groupByType(queries as any);
        const limit = grouped.limit ?? APP_LIMIT_COUNT;
        const offset = grouped.offset ?? 0;

        const audit = new Audit(dbForProject as any);
        const logs = await audit.getLogsByUser(user.getInternalId(), limit, offset);

        const output = logs.map(async (log: any) => {
            log.userAgent = log.userAgent || 'UNKNOWN';
            const detector = new Detector(log.userAgent);

            const record: any = await getGeoInfo(request.getIP());
            const countryCode = record ? locale.getText(`countries.${record.country.iso_code.toLowerCase()}`, false) ? record.country.iso_code.toLowerCase() : '--' : '--';
            const countryName = record ? locale.getText(`countries.${record.country.iso_code.toLowerCase()}`, locale.getText('locale.country.unknown')) : locale.getText('locale.country.unknown');

            return new Document({
                ...log.getArrayCopy(),
                ...log.data,
                ...detector.getOS(),
                ...detector.getClient(),
                ...detector.getDevice(),
                countryCode,
                countryName,
            });
        });

        response.dynamic(new Document({
            total: await audit.countLogsByUser(user.getInternalId()),
            logs: output,
        }), Response.MODEL_LOG_LIST);
    });

App.patch('/v1/account/name')
    .desc('Update name')
    .groups(['api', 'account'])
    .label('event', 'users.[userId].update.name')
    .label('scope', 'account')
    .label('audits.event', 'user.update')
    .label('audits.resource', 'user/{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'updateName')
    .label('sdk.description', '/docs/references/account/update-name.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USER)
    .label('sdk.offline.model', '/account')
    .label('sdk.offline.key', 'current')
    .param('name', '', new Text(128), 'User name. Max length: 128 chars.')
    .inject('requestTimestamp')
    .inject('response')
    .inject('user')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async (name: string, requestTimestamp: Date | null, response: Response, user: Document, dbForProject: Database, queueForEvents: Event) => {
        user.setAttribute('name', name);
        user = await dbForProject.withRequestTimestamp(requestTimestamp, () => dbForProject.updateDocument('users', user.getId(), user));
        queueForEvents.setParam('userId', user.getId());
        response.dynamic(user, Response.MODEL_ACCOUNT);
    });

App.patch('/v1/account/password')
    .desc('Update password')
    .groups(['api', 'account'])
    .label('event', 'users.[userId].update.password')
    .label('scope', 'account')
    .label('audits.event', 'user.update')
    .label('audits.resource', 'user/{response.$id}')
    .label('audits.userId', '{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'updatePassword')
    .label('sdk.description', '/docs/references/account/update-password.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USER)
    .label('sdk.offline.model', '/account')
    .label('sdk.offline.key', 'current')
    .label('abuse-limit', 10)
    .param('password', '', (project, passwordsDictionary) => new PasswordDictionary(passwordsDictionary, project.getAttribute('auths', [])['passwordDictionary'] ?? false), 'New user password. Must be at least 8 chars.', false, ['project', 'passwordsDictionary'])
    .param('oldPassword', '', new Password(), 'Current user password. Must be at least 8 chars.', true)
    .inject('requestTimestamp')
    .inject('response')
    .inject('user')
    .inject('project')
    .inject('dbForProject')
    .inject('queueForEvents')
    .inject('hooks')
    .action(async (password: string, oldPassword: string, requestTimestamp: Date | null, response: Response, user: Document, project: Document, dbForProject: Database, queueForEvents: Event, hooks: Hooks) => {
        if (!empty(user.getAttribute('passwordUpdate')) && !Auth.passwordVerify(oldPassword, user.getAttribute('password'), user.getAttribute('hash'), user.getAttribute('hashOptions'))) {
            throw new Error('USER_INVALID_CREDENTIALS');
        }

        const newPassword = Auth.passwordHash(password, Auth.DEFAULT_ALGO, Auth.DEFAULT_ALGO_OPTIONS);
        const historyLimit = project.getAttribute('auths', [])['passwordHistory'] ?? 0;
        let history = user.getAttribute('passwordHistory', []);
        if (historyLimit > 0) {
            const validator = new PasswordHistory(history, user.getAttribute('hash'), user.getAttribute('hashOptions'));
            if (!validator.isValid(password)) {
                throw new Error('USER_PASSWORD_RECENTLY_USED');
            }

            history.push(newPassword);
            history = history.slice(-historyLimit);
        }

        if (project.getAttribute('auths', [])['personalDataCheck'] ?? false) {
            const personalDataValidator = new PersonalData(user.getId(), user.getAttribute('email'), user.getAttribute('name'), user.getAttribute('phone'));
            if (!personalDataValidator.isValid(password)) {
                throw new Error('USER_PASSWORD_PERSONAL_DATA');
            }
        }

        hooks.trigger('passwordValidator', [dbForProject, project, password, user, true]);

        user
            .setAttribute('password', newPassword)
            .setAttribute('passwordHistory', history)
            .setAttribute('passwordUpdate', DateTime.now())
            .setAttribute('hash', Auth.DEFAULT_ALGO)
            .setAttribute('hashOptions', Auth.DEFAULT_ALGO_OPTIONS);

        user = await dbForProject.withRequestTimestamp(requestTimestamp, () => dbForProject.updateDocument('users', user.getId(), user));
        queueForEvents.setParam('userId', user.getId());
        response.dynamic(user, Response.MODEL_ACCOUNT);
    });

App.patch('/v1/account/email')
    .desc('Update email')
    .groups(['api', 'account'])
    .label('event', 'users.[userId].update.email')
    .label('scope', 'account')
    .label('audits.event', 'user.update')
    .label('audits.resource', 'user/{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'updateEmail')
    .label('sdk.description', '/docs/references/account/update-email.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USER)
    .label('sdk.offline.model', '/account')
    .label('sdk.offline.key', 'current')
    .param('email', '', new Email(), 'User email.')
    .param('password', '', new Password(), 'User password. Must be at least 8 chars.')
    .inject('requestTimestamp')
    .inject('response')
    .inject('user')
    .inject('dbForProject')
    .inject('queueForEvents')
    .inject('project')
    .inject('hooks')
    .action(async (email: string, password: string, requestTimestamp: Date | null, response: Response, user: Document, dbForProject: Database, queueForEvents: Event, project: Document, hooks: Hooks) => {
        const passwordUpdate = user.getAttribute('passwordUpdate');

        if (!empty(passwordUpdate) && !Auth.passwordVerify(password, user.getAttribute('password'), user.getAttribute('hash'), user.getAttribute('hashOptions'))) {
            throw new Error('USER_INVALID_CREDENTIALS');
        }

        hooks.trigger('passwordValidator', [dbForProject, project, password, user, false]);

        const oldEmail = user.getAttribute('email');
        email = email.toLowerCase();

        const identityWithMatchingEmail = await dbForProject.findOne('identities', [
            Query.equal('providerEmail', [email]),
            Query.notEqual('userInternalId', user.getInternalId()),
        ]);
        if (identityWithMatchingEmail && !identityWithMatchingEmail.isEmpty()) {
            throw new Error('GENERAL_BAD_REQUEST');
        }

        user.setAttribute('email', email).setAttribute('emailVerification', false);

        if (empty(passwordUpdate)) {
            user
                .setAttribute('password', Auth.passwordHash(password, Auth.DEFAULT_ALGO, Auth.DEFAULT_ALGO_OPTIONS))
                .setAttribute('hash', Auth.DEFAULT_ALGO)
                .setAttribute('hashOptions', Auth.DEFAULT_ALGO_OPTIONS)
                .setAttribute('passwordUpdate', DateTime.now());
        }

        const target = await Authorization.skip(() => dbForProject.findOne('targets', [
            Query.equal('identifier', [email]),
        ]));

        if (target && !target.isEmpty()) {
            throw new Error('USER_TARGET_ALREADY_EXISTS');
        }

        try {
            user = await dbForProject.withRequestTimestamp(requestTimestamp, () => dbForProject.updateDocument('users', user.getId(), user));
            const oldTarget = user.find('identifier', oldEmail, 'targets');

            if (oldTarget && !oldTarget.isEmpty()) {
                await Authorization.skip(() => dbForProject.updateDocument('targets', oldTarget.getId(), oldTarget.setAttribute('identifier', email)));
            }
            await dbForProject.purgeCachedDocument('users', user.getId());
        } catch (Duplicate) {
            throw new Error('GENERAL_BAD_REQUEST');
        }

        queueForEvents.setParam('userId', user.getId());
        response.dynamic(user, Response.MODEL_ACCOUNT);
    });

App.patch('/v1/account/phone')
    .desc('Update phone')
    .groups(['api', 'account'])
    .label('event', 'users.[userId].update.phone')
    .label('scope', 'account')
    .label('audits.event', 'user.update')
    .label('audits.resource', 'user/{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'updatePhone')
    .label('sdk.description', '/docs/references/account/update-phone.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USER)
    .label('sdk.offline.model', '/account')
    .label('sdk.offline.key', 'current')
    .param('phone', '', new Phone(), 'Phone number. Format this number with a leading \'+\' and a country code, e.g., +16175551212.')
    .param('password', '', new Password(), 'User password. Must be at least 8 chars.')
    .inject('requestTimestamp')
    .inject('response')
    .inject('user')
    .inject('dbForProject')
    .inject('queueForEvents')
    .inject('project')
    .inject('hooks')
    .action(async (phone: string, password: string, requestTimestamp: Date | null, response: Response, user: Document, dbForProject: Database, queueForEvents: Event, project: Document, hooks: Hooks) => {
        const passwordUpdate = user.getAttribute('passwordUpdate');

        if (!empty(passwordUpdate) && !Auth.passwordVerify(password, user.getAttribute('password'), user.getAttribute('hash'), user.getAttribute('hashOptions'))) {
            throw new Error('USER_INVALID_CREDENTIALS');
        }

        hooks.trigger('passwordValidator', [dbForProject, project, password, user, false]);

        const target = await Authorization.skip(() => dbForProject.findOne('targets', [
            Query.equal('identifier', [phone]),
        ]));

        if (target && !target.isEmpty()) {
            throw new Error('USER_TARGET_ALREADY_EXISTS');
        }

        const oldPhone = user.getAttribute('phone');
        user.setAttribute('phone', phone).setAttribute('phoneVerification', false);

        if (empty(passwordUpdate)) {
            user
                .setAttribute('password', Auth.passwordHash(password, Auth.DEFAULT_ALGO, Auth.DEFAULT_ALGO_OPTIONS))
                .setAttribute('hash', Auth.DEFAULT_ALGO)
                .setAttribute('hashOptions', Auth.DEFAULT_ALGO_OPTIONS)
                .setAttribute('passwordUpdate', DateTime.now());
        }

        try {
            user = await dbForProject.withRequestTimestamp(requestTimestamp, () => dbForProject.updateDocument('users', user.getId(), user));
            const oldTarget = user.find('identifier', oldPhone, 'targets');

            if (oldTarget && !oldTarget.isEmpty()) {
                await Authorization.skip(() => dbForProject.updateDocument('targets', oldTarget.getId(), oldTarget.setAttribute('identifier', phone)));
            }
            await dbForProject.purgeCachedDocument('users', user.getId());
        } catch (Duplicate) {
            throw new Error('USER_PHONE_ALREADY_EXISTS');
        }

        queueForEvents.setParam('userId', user.getId());
        response.dynamic(user, Response.MODEL_ACCOUNT);
    });

App.patch('/v1/account/prefs')
    .desc('Update preferences')
    .groups(['api', 'account'])
    .label('event', 'users.[userId].update.prefs')
    .label('scope', 'account')
    .label('audits.event', 'user.update')
    .label('audits.resource', 'user/{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'updatePrefs')
    .label('sdk.description', '/docs/references/account/update-prefs.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USER)
    .label('sdk.offline.model', '/account/prefs')
    .label('sdk.offline.key', 'current')
    .param('prefs', [], new Assoc(), 'Prefs key-value JSON object.')
    .inject('requestTimestamp')
    .inject('response')
    .inject('user')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async (prefs: object, requestTimestamp: Date | null, response: Response, user: Document, dbForProject: Database, queueForEvents: Event) => {
        user.setAttribute('prefs', prefs);
        user = await dbForProject.withRequestTimestamp(requestTimestamp, () => dbForProject.updateDocument('users', user.getId(), user));
        queueForEvents.setParam('userId', user.getId());
        response.dynamic(user, Response.MODEL_ACCOUNT);
    });

App.patch('/v1/account/status')
    .desc('Update status')
    .groups(['api', 'account'])
    .label('event', 'users.[userId].update.status')
    .label('scope', 'account')
    .label('audits.event', 'user.update')
    .label('audits.resource', 'user/{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'updateStatus')
    .label('sdk.description', '/docs/references/account/update-status.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USER)
    .inject('requestTimestamp')
    .inject('request')
    .inject('response')
    .inject('user')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async (requestTimestamp: Date | null, request: Request, response: Response, user: Document, dbForProject: Database, queueForEvents: Event) => {
        user.setAttribute('status', false);
        user = await dbForProject.withRequestTimestamp(requestTimestamp, () => dbForProject.updateDocument('users', user.getId(), user));
        queueForEvents
            .setParam('userId', user.getId())
            .setPayload(response.output(user, Response.MODEL_ACCOUNT));

        if (!Config.getParam('domainVerification')) {
            response.addHeader('X-Fallback-Cookies', JSON.stringify([]));
        }

        const protocol = request.getProtocol();
        response
            .addCookie(Auth.cookieName + '_legacy', '', Date.now() - 3600, '/', Config.getParam('cookieDomain'), protocol === 'https', true, null)
            .addCookie(Auth.cookieName, '', Date.now() - 3600, '/', Config.getParam('cookieDomain'), protocol === 'https', true, Config.getParam('cookieSamesite'));

        response.dynamic(user, Response.MODEL_ACCOUNT);
    });

App.post('/v1/account/recovery')
    .desc('Create password recovery')
    .groups(['api', 'account'])
    .label('scope', 'sessions.write')
    .label('event', 'users.[userId].recovery.[tokenId].create')
    .label('audits.event', 'recovery.create')
    .label('audits.resource', 'user/{response.userId}')
    .label('audits.userId', '{response.userId}')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'createRecovery')
    .label('sdk.description', '/docs/references/account/create-recovery.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_TOKEN)
    .label('abuse-limit', 10)
    .label('abuse-key', ['url:{url},email:{param-email}', 'url:{url},ip:{ip}'])
    .param('email', '', new Email(), 'User email.')
    .param('url', '', (clients) => new Host(clients), 'URL to redirect the user back to your app from the recovery email. Only URLs from hostnames in your project platform list are allowed. This requirement helps to prevent an [open redirect](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html) attack against your project API.', false, ['clients'])
    .inject('request')
    .inject('response')
    .inject('user')
    .inject('dbForProject')
    .inject('project')
    .inject('locale')
    .inject('queueForMails')
    .inject('queueForEvents')
    .action(async (email: string, url: string, request: Request, response: Response, user: Document, dbForProject: Database, project: Document, locale: Locale, queueForMails: Mail, queueForEvents: Event) => {
        if (!process.env._APP_SMTP_HOST) {
            throw new Error('SMTP Disabled');
        }

        url = encodeURIComponent(url);

        const roles = Authorization.getRoles();
        const isPrivilegedUser = Auth.isPrivilegedUser(roles);
        const isAppUser = Auth.isAppUser(roles);

        email = email.toLowerCase();

        const profile = await dbForProject.findOne('users', [
            Query.equal('email', [email]),
        ]);

        if (!profile) {
            throw new Error('USER_NOT_FOUND');
        }

        user.setAttributes(profile.getArrayCopy());

        if (!profile.getAttribute('status')) {
            throw new Error('USER_BLOCKED');
        }

        const expire = DateTime.addSeconds(new Date(), Auth.TOKEN_EXPIRATION_RECOVERY);
        const secret = Auth.tokenGenerator(Auth.TOKEN_LENGTH_RECOVERY);

        const recovery = new Document({
            '$id': ID.unique(),
            'userId': profile.getId(),
            'userInternalId': profile.getInternalId(),
            'type': Auth.TOKEN_TYPE_RECOVERY,
            'secret': Auth.hash(secret),
            'expire': expire,
            'userAgent': request.getUserAgent('UNKNOWN'),
            'ip': request.getIP(),
        });

        Authorization.setRole(Role.user(profile.getId()).toString());

        await dbForProject.createDocument('tokens', recovery.setAttribute('$permissions', [
            Permission.read(Role.user(profile.getId())),
            Permission.update(Role.user(profile.getId())),
            Permission.delete(Role.user(profile.getId())),
        ]));

        await dbForProject.purgeCachedDocument('users', profile.getId());

        url = Template.parseURL(url) as any;
        (url as any).query = Template.mergeQuery((url as any).query || '', { userId: profile.getId(), secret, expire });
        url = Template.unParseURL(url as any);

        const projectName = project.isEmpty() ? 'Console' : project.getAttribute('name', '[APP-NAME]');
        let body = locale.getText("emails.recovery.body");
        let subject = locale.getText("emails.recovery.subject");
        const customTemplate = project.getAttribute('templates', [])[`email.recovery-${locale.default}`] ?? [];

        let message = Template.fromFile(__dirname + '/../../config/locale/templates/email-inner-base.tpl');
        message
            .setParam('{{body}}', body, false)
            .setParam('{{hello}}', locale.getText("emails.recovery.hello"))
            .setParam('{{footer}}', locale.getText("emails.recovery.footer"))
            .setParam('{{thanks}}', locale.getText("emails.recovery.thanks"))
            .setParam('{{signature}}', locale.getText("emails.recovery.signature"));
        body = message.render();

        const smtp = project.getAttribute('smtp', []);
        const smtpEnabled = smtp.enabled || false;

        let senderEmail = process.env._APP_SYSTEM_EMAIL_ADDRESS || APP_EMAIL_TEAM;
        let senderName = process.env._APP_SYSTEM_EMAIL_NAME || `${APP_NAME} Server`;
        let replyTo = "";

        if (smtpEnabled) {
            if (smtp.senderEmail) {
                senderEmail = smtp.senderEmail;
            }
            if (smtp.senderName) {
                senderName = smtp.senderName;
            }
            if (smtp.replyTo) {
                replyTo = smtp.replyTo;
            }

            queueForMails
                .setSmtpHost(smtp.host || '')
                .setSmtpPort(smtp.port || '')
                .setSmtpUsername(smtp.username || '')
                .setSmtpPassword(smtp.password || '')
                .setSmtpSecure(smtp.secure || '');

            if (customTemplate) {
                if (customTemplate.senderEmail) {
                    senderEmail = customTemplate.senderEmail;
                }
                if (customTemplate.senderName) {
                    senderName = customTemplate.senderName;
                }
                if (customTemplate.replyTo) {
                    replyTo = customTemplate.replyTo;
                }

                body = customTemplate.message || '';
                subject = customTemplate.subject || subject;
            }

            queueForMails
                .setSmtpReplyTo(replyTo)
                .setSmtpSenderEmail(senderEmail)
                .setSmtpSenderName(senderName);
        }

        const emailVariables = {
            direction: locale.getText('settings.direction'),
            user: profile.getAttribute('name'),
            redirect: url,
            project: projectName,
            team: ''
        };

        queueForMails
            .setRecipient(profile.getAttribute('email', ''))
            .setName(profile.getAttribute('name', ''))
            .setBody(body)
            .setVariables(emailVariables)
            .setSubject(subject)
            .trigger();

        recovery.setAttribute('secret', secret);

        queueForEvents
            .setParam('userId', profile.getId())
            .setParam('tokenId', recovery.getId())
            .setUser(profile)
            .setPayload(response.output(recovery, Response.MODEL_TOKEN), ['secret']);

        if (!isPrivilegedUser && !isAppUser) {
            recovery.setAttribute('secret', '');
        }

        response
            .setStatusCode(Response.STATUS_CODE_CREATED)
            .dynamic(recovery, Response.MODEL_TOKEN);
    });




App.put('/v1/account/recovery')
    .desc('Create password recovery (confirmation)')
    .groups(['api', 'account'])
    .label('scope', 'sessions.write')
    .label('event', 'users.[userId].recovery.[tokenId].update')
    .label('audits.event', 'recovery.update')
    .label('audits.resource', 'user/{response.userId}')
    .label('audits.userId', '{response.userId}')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'updateRecovery')
    .label('sdk.description', '/docs/references/account/update-recovery.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_TOKEN)
    .label('abuse-limit', 10)
    .label('abuse-key', 'url:{url},userId:{param-userId}')
    .param('userId', '', new UID(), 'User ID.')
    .param('secret', '', new Text(256), 'Valid reset token.')
    .param('password', '', (project, passwordsDictionary) => new PasswordDictionary(passwordsDictionary, project.getAttribute('auths', [])['passwordDictionary'] ?? false), 'New user password. Must be between 8 and 256 chars.', false, ['project', 'passwordsDictionary'])
    .inject('response')
    .inject('user')
    .inject('dbForProject')
    .inject('project')
    .inject('queueForEvents')
    .inject('hooks')
    .action(async function (userId: string, secret: string, password: string, response: Response, user: Document, dbForProject: Database, project: Document, queueForEvents: Event, hooks: Hooks) {
        const profile = await dbForProject.getDocument('users', userId);

        if (profile.isEmpty()) {
            throw new Exception(AppcondaException.USER_NOT_FOUND);
        }

        const tokens = profile.getAttribute('tokens', []);
        const verifiedToken = Auth.tokenVerify(tokens, Auth.TOKEN_TYPE_RECOVERY, secret);

        if (!verifiedToken) {
            throw new Exception(AppcondaException.USER_INVALID_TOKEN);
        }

        Authorization.setRole(Role.user(profile.getId()).toString());

        const newPassword = Auth.passwordHash(password, Auth.DEFAULT_ALGO, Auth.DEFAULT_ALGO_OPTIONS);

        const historyLimit = project.getAttribute('auths', [])['passwordHistory'] ?? 0;
        let history = profile.getAttribute('passwordHistory', []);
        if (historyLimit > 0) {
            const validator = new PasswordHistory(history, profile.getAttribute('hash'), profile.getAttribute('hashOptions'));
            if (!validator.isValid(password)) {
                throw new Exception(AppcondaException.USER_PASSWORD_RECENTLY_USED);
            }

            history.push(newPassword);
            history = history.slice(-historyLimit);
        }

        hooks.trigger('passwordValidator', [dbForProject, project, password, user, true]);

        await dbForProject.updateDocument('users', profile.getId(), profile
            .setAttribute('password', newPassword)
            .setAttribute('passwordHistory', history)
            .setAttribute('passwordUpdate', DateTime.now())
            .setAttribute('hash', Auth.DEFAULT_ALGO)
            .setAttribute('hashOptions', Auth.DEFAULT_ALGO_OPTIONS)
            .setAttribute('emailVerification', true));

        user.setAttributes(profile.getArrayCopy());

        const recoveryDocument = await dbForProject.getDocument('tokens', verifiedToken.getId());

        await dbForProject.deleteDocument('tokens', verifiedToken.getId());
        dbForProject.purgeCachedDocument('users', profile.getId());

        queueForEvents
            .setParam('userId', profile.getId())
            .setParam('tokenId', recoveryDocument.getId());

        response.dynamic(recoveryDocument, Response.MODEL_TOKEN);
    });

App.post('/v1/account/verification')
    .desc('Create email verification')
    .groups(['api', 'account'])
    .label('scope', 'account')
    .label('event', 'users.[userId].verification.[tokenId].create')
    .label('audits.event', 'verification.create')
    .label('audits.resource', 'user/{response.userId}')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'createVerification')
    .label('sdk.description', '/docs/references/account/create-email-verification.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_TOKEN)
    .label('abuse-limit', 10)
    .label('abuse-key', 'url:{url},userId:{userId}')
    .param('url', '', (clients) => new Host(clients), 'URL to redirect the user back to your app from the verification email. Only URLs from hostnames in your project platform list are allowed. This requirement helps to prevent an [open redirect](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html) attack against your project API.', false, ['clients']) // TODO add built-in confirm page
    .inject('request')
    .inject('response')
    .inject('project')
    .inject('user')
    .inject('dbForProject')
    .inject('locale')
    .inject('queueForEvents')
    .inject('queueForMails')
    .action(async function (url: string, request: Request, response: Response, project: Document, user: Document, dbForProject: Database, locale: Locale, queueForEvents: Event, queueForMails: Mail) {

        if (!process.env._APP_SMTP_HOST) {
            throw new Error('SMTP Disabled');
        }

        url = encode(url);
        if (user.getAttribute('emailVerification')) {
            throw new Exception(AppcondaException.USER_EMAIL_ALREADY_VERIFIED);
        }

        const roles = Authorization.getRoles();
        const isPrivilegedUser = Auth.isPrivilegedUser(roles);
        const isAppUser = Auth.isAppUser(roles);
        const verificationSecret = Auth.tokenGenerator(Auth.TOKEN_LENGTH_VERIFICATION);
        const expire = DateTime.addSeconds(new Date(), Auth.TOKEN_EXPIRATION_CONFIRM);

        const verification = new Document({
            '$id': ID.unique(),
            'userId': user.getId(),
            'userInternalId': user.getInternalId(),
            'type': Auth.TOKEN_TYPE_VERIFICATION,
            'secret': Auth.hash(verificationSecret), // One way hash encryption to protect DB leak
            'expire': expire,
            'userAgent': request.getUserAgent('UNKNOWN'),
            'ip': request.getIP(),
        });

        Authorization.setRole(Role.user(user.getId()).toString());

        await dbForProject.createDocument('tokens', verification
            .setAttribute('$permissions', [
                Permission.read(Role.user(user.getId())),
                Permission.update(Role.user(user.getId())),
                Permission.delete(Role.user(user.getId())),
            ]));

        dbForProject.purgeCachedDocument('users', user.getId());

        url = Template.parseURL(url) as any;
        url['query'] = Template.mergeQuery((url['query'] ? url['query'] : ''),
            { 'userId': user.getId(), 'secret': verificationSecret, 'expire': expire });
        url = Template.unParseURL(url as any);

        const projectName = project.isEmpty() ? 'Console' : project.getAttribute('name', '[APP-NAME]');
        let body = locale.getText("emails.verification.body");
        let subject = locale.getText("emails.verification.subject");
        const customTemplate = project.getAttribute('templates', [])['email.verification-' + locale.default] ?? [];

        const message = Template.fromFile(__dirname + '../../config/locale/templates/email-inner-base.tpl');
        message
            .setParam('{{body}}', body, false)
            .setParam('{{hello}}', locale.getText("emails.verification.hello"))
            .setParam('{{footer}}', locale.getText("emails.verification.footer"))
            .setParam('{{thanks}}', locale.getText("emails.verification.thanks"))
            .setParam('{{signature}}', locale.getText("emails.verification.signature"));

        body = message.render();

        const smtp = project.getAttribute('smtp', []);
        const smtpEnabled = smtp['enabled'] ?? false;

        let senderEmail = process.env._APP_SYSTEM_EMAIL_ADDRESS || APP_EMAIL_TEAM;
        let senderName = process.env._APP_SYSTEM_EMAIL_NAME || (APP_NAME + ' Server');
        let replyTo = "";

        if (smtpEnabled) {
            if (!empty(smtp['senderEmail'])) {
                senderEmail = smtp['senderEmail'];
            }
            if (!empty(smtp['senderName'])) {
                senderName = smtp['senderName'];
            }
            if (!empty(smtp['replyTo'])) {
                replyTo = smtp['replyTo'];
            }

            queueForMails
                .setSmtpHost(smtp['host'] ?? '')
                .setSmtpPort(smtp['port'] ?? '')
                .setSmtpUsername(smtp['username'] ?? '')
                .setSmtpPassword(smtp['password'] ?? '')
                .setSmtpSecure(smtp['secure'] ?? '');

            if (!empty(customTemplate)) {
                if (!empty(customTemplate['senderEmail'])) {
                    senderEmail = customTemplate['senderEmail'];
                }
                if (!empty(customTemplate['senderName'])) {
                    senderName = customTemplate['senderName'];
                }
                if (!empty(customTemplate['replyTo'])) {
                    replyTo = customTemplate['replyTo'];
                }

                body = customTemplate['message'] ?? '';
                subject = customTemplate['subject'] ?? subject;
            }

            queueForMails
                .setSmtpReplyTo(replyTo)
                .setSmtpSenderEmail(senderEmail)
                .setSmtpSenderName(senderName);
        }

        const emailVariables = {
            'direction': locale.getText('settings.direction'),
            // {{user}}, {{redirect}} and {{project}} are required in default and custom templates
            'user': user.getAttribute('name'),
            'redirect': url,
            'project': projectName,
            // TODO: remove unnecessary team variable from this email
            'team': '',
        };

        queueForMails
            .setSubject(subject)
            .setBody(body)
            .setVariables(emailVariables)
            .setRecipient(user.getAttribute('email'))
            .setName(user.getAttribute('name') ?? '')
            .trigger();

        // Set to unhashed secret for events and server responses
        verification.setAttribute('secret', verificationSecret);

        queueForEvents
            .setParam('userId', user.getId())
            .setParam('tokenId', verification.getId())
            .setPayload(response.output(verification, Response.MODEL_TOKEN), ['secret']);

        // Hide secret for clients
        if (!isPrivilegedUser && !isAppUser) {
            verification.setAttribute('secret', '');
        }

        response
            .setStatusCode(Response.STATUS_CODE_CREATED)
            .dynamic(verification, Response.MODEL_TOKEN);
    });

App.put('/v1/account/verification')
    .desc('Create email verification (confirmation)')
    .groups(['api', 'account'])
    .label('scope', 'public')
    .label('event', 'users.[userId].verification.[tokenId].update')
    .label('audits.event', 'verification.update')
    .label('audits.resource', 'user/{response.userId}')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'updateVerification')
    .label('sdk.description', '/docs/references/account/update-email-verification.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_TOKEN)
    .label('abuse-limit', 10)
    .label('abuse-key', 'url:{url},userId:{param-userId}')
    .param('userId', '', new UID(), 'User ID.')
    .param('secret', '', new Text(256), 'Valid verification token.')
    .inject('response')
    .inject('user')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async function (userId: string, secret: string, response: Response, user: Document, dbForProject: Database, queueForEvents: Event) {

        const profile = await Authorization.skip(() => dbForProject.getDocument('users', userId));

        if (profile.isEmpty()) {
            throw new Exception(AppcondaException.USER_NOT_FOUND);
        }

        const tokens = profile.getAttribute('tokens', []);
        const verifiedToken = Auth.tokenVerify(tokens, Auth.TOKEN_TYPE_VERIFICATION, secret);

        if (!verifiedToken) {
            throw new Exception(AppcondaException.USER_INVALID_TOKEN);
        }

        Authorization.setRole(Role.user(profile.getId()).toString());

        const updatedProfile = await dbForProject.updateDocument('users', profile.getId(), profile.setAttribute('emailVerification', true));

        user.setAttributes(updatedProfile.getArrayCopy());

        const verification = await dbForProject.getDocument('tokens', verifiedToken.getId());

        // We act like we're updating and validating the verification token but actually we don't need it anymore.
        await dbForProject.deleteDocument('tokens', verifiedToken.getId());
        dbForProject.purgeCachedDocument('users', profile.getId());

        queueForEvents
            .setParam('userId', userId)
            .setParam('tokenId', verification.getId());

        response.dynamic(verification, Response.MODEL_TOKEN);
    });

App.post('/v1/account/verification/phone')
    .desc('Create phone verification')
    .groups(['api', 'account', 'auth'])
    .label('scope', 'account')
    .label('auth.type', 'phone')
    .label('event', 'users.[userId].verification.[tokenId].create')
    .label('audits.event', 'verification.create')
    .label('audits.resource', 'user/{response.userId}')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'createPhoneVerification')
    .label('sdk.description', '/docs/references/account/create-phone-verification.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_TOKEN)
    .label('abuse-limit', 10)
    .label('abuse-key', ['url:{url},userId:{userId}', 'url:{url},ip:{ip}'])
    .inject('request')
    .inject('response')
    .inject('user')
    .inject('dbForProject')
    .inject('queueForEvents')
    .inject('queueForMessaging')
    .inject('project')
    .inject('locale')
    .action(async function (request: Request, response: Response, user: Document, dbForProject: Database, queueForEvents: Event, queueForMessaging: Messaging, project: Document, locale: Locale) {
        if (!process.env._APP_SMS_PROVIDER) {
            throw new Error('Phone provider not configured');
        }

        if (empty(user.getAttribute('phone'))) {
            throw new Exception(AppcondaException.USER_PHONE_NOT_FOUND);
        }

        if (user.getAttribute('phoneVerification')) {
            throw new Exception(AppcondaException.USER_PHONE_ALREADY_VERIFIED);
        }

        const roles = Authorization.getRoles();
        const isPrivilegedUser = Auth.isPrivilegedUser(roles);
        const isAppUser = Auth.isAppUser(roles);
        const secret = Auth.codeGenerator();
        const expire = DateTime.addSeconds(new Date(), Auth.TOKEN_EXPIRATION_CONFIRM);

        const verification = new Document({
            '$id': ID.unique(),
            'userId': user.getId(),
            'userInternalId': user.getInternalId(),
            'type': Auth.TOKEN_TYPE_PHONE,
            'secret': Auth.hash(secret),
            'expire': expire,
            'userAgent': request.getUserAgent('UNKNOWN'),
            'ip': request.getIP(),
        });

        Authorization.setRole(Role.user(user.getId()).toString());

        await dbForProject.createDocument('tokens', verification
            .setAttribute('$permissions', [
                Permission.read(Role.user(user.getId())),
                Permission.update(Role.user(user.getId())),
                Permission.delete(Role.user(user.getId())),
            ]));

        dbForProject.purgeCachedDocument('users', user.getId());

        let message = Template.fromFile(__dirname + '/../../config/locale/templates/sms-base.tpl');

        const customTemplate = project.getAttribute('templates', [])['sms.verification-' + locale.default] ?? [];
        if (!empty(customTemplate)) {
            message = customTemplate['message'] ?? message;
        }

        let messageContent = Template.fromString(locale.getText("sms.verification.body"));
        messageContent
            .setParam('{{project}}', project.getAttribute('name'))
            .setParam('{{secret}}', secret);
        messageContent = strip_tags(await messageContent.render()) as any;
        message = message.setParam('{{token}}', messageContent);

        message = message.render() as any;

        const messageDoc = new Document({
            '$id': verification.getId(),
            'data': {
                'content': message,
            },
        });

        queueForMessaging
            .setType(MESSAGE_SEND_TYPE_INTERNAL)
            .setMessage(messageDoc)
            .setRecipients([user.getAttribute('phone')])
            .setProviderType(MESSAGE_TYPE_SMS);

        // Set to unhashed secret for events and server responses
        verification.setAttribute('secret', secret);

        queueForEvents
            .setParam('userId', user.getId())
            .setParam('tokenId', verification.getId())
            .setPayload(response.output(verification, Response.MODEL_TOKEN), ['secret']);

        // Hide secret for clients
        if (!isPrivilegedUser && !isAppUser) {
            verification.setAttribute('secret', '');
        }

        response
            .setStatusCode(Response.STATUS_CODE_CREATED)
            .dynamic(verification, Response.MODEL_TOKEN);
    });

App.put('/v1/account/verification/phone')
    .desc('Update phone verification (confirmation)')
    .groups(['api', 'account'])
    .label('scope', 'public')
    .label('event', 'users.[userId].verification.[tokenId].update')
    .label('audits.event', 'verification.update')
    .label('audits.resource', 'user/{response.userId}')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'updatePhoneVerification')
    .label('sdk.description', '/docs/references/account/update-phone-verification.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_TOKEN)
    .label('abuse-limit', 10)
    .label('abuse-key', 'userId:{param-userId}')
    .param('userId', '', new UID(), 'User ID.')
    .param('secret', '', new Text(256), 'Valid verification token.')
    .inject('response')
    .inject('user')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async function (userId: string, secret: string, response: Response, user: Document, dbForProject: Database, queueForEvents: Event) {

        const profile = await Authorization.skip(async () => await dbForProject.getDocument('users', userId));

        if (profile.isEmpty()) {
            throw new Exception(AppcondaException.USER_NOT_FOUND);
        }

        const verifiedToken = Auth.tokenVerify(user.getAttribute('tokens', []), Auth.TOKEN_TYPE_PHONE, secret);

        if (!verifiedToken) {
            throw new Exception(AppcondaException.USER_INVALID_TOKEN);
        }

        Authorization.setRole(Role.user(profile.getId()).toString());

        const updatedProfile = await dbForProject.updateDocument('users', profile.getId(), profile.setAttribute('phoneVerification', true));

        user.setAttributes(updatedProfile.getArrayCopy());

        const verificationDocument = await dbForProject.getDocument('tokens', verifiedToken.getId());

        /**
         * We act like we're updating and validating
         * the verification token but actually we don't need it anymore.
         */
        await dbForProject.deleteDocument('tokens', verifiedToken.getId());
        dbForProject.purgeCachedDocument('users', profile.getId());

        queueForEvents
            .setParam('userId', userId)
            .setParam('tokenId', verificationDocument.getId());

        response.dynamic(verificationDocument, Response.MODEL_TOKEN);
    });

App.patch('/v1/account/mfa')
    .desc('Update MFA')
    .groups(['api', 'account'])
    .label('event', 'users.[userId].update.mfa')
    .label('scope', 'account')
    .label('audits.event', 'user.update')
    .label('audits.resource', 'user/{response.$id}')
    .label('audits.userId', '{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'updateMFA')
    .label('sdk.description', '/docs/references/account/update-mfa.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USER)
    .label('sdk.offline.model', '/account')
    .label('sdk.offline.key', 'current')
    .param('mfa', null, new Boolean(), 'Enable or disable MFA.')
    .inject('requestTimestamp')
    .inject('response')
    .inject('user')
    .inject('session')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async function (mfa: boolean, requestTimestamp: Date | null, response: Response, user: Document, session: Document, dbForProject: Database, queueForEvents: Event) {

        user.setAttribute('mfa', mfa);

        const updatedUser = await dbForProject.withRequestTimestamp(requestTimestamp, async () => {
            return await dbForProject.updateDocument('users', user.getId(), user);
        });

        if (mfa) {
            let factors: string[] = session.getAttribute('factors', []);
            const totp = TOTP.getAuthenticatorFromUser(user);
            if (totp !== null && totp.getAttribute('verified', false)) {
                factors.push(Type.TOTP);
            }
            if (user.getAttribute('email', false) && user.getAttribute('emailVerification', false)) {
                factors.push(Type.EMAIL);
            }
            if (user.getAttribute('phone', false) && user.getAttribute('phoneVerification', false)) {
                factors.push(Type.PHONE);
            }
            factors = Array.from(new Set(factors));

            session.setAttribute('factors', factors);
            await dbForProject.updateDocument('sessions', session.getId(), session);
        }

        queueForEvents.setParam('userId', user.getId());

        response.dynamic(updatedUser, Response.MODEL_ACCOUNT);
    });

App.get('/v1/account/mfa/factors')
    .desc('List Factors')
    .groups(['api', 'account', 'mfa'])
    .label('scope', 'account')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'listMfaFactors')
    .label('sdk.description', '/docs/references/account/list-mfa-factors.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_MFA_FACTORS)
    .label('sdk.offline.model', '/account')
    .label('sdk.offline.key', 'current')
    .inject('response')
    .inject('user')
    .action(async function (response: Response, user: Document) {

        const mfaRecoveryCodes = user.getAttribute('mfaRecoveryCodes', []);
        const recoveryCodeEnabled = Array.isArray(mfaRecoveryCodes) && mfaRecoveryCodes.length > 0;

        const totp = TOTP.getAuthenticatorFromUser(user);

        const factors = new Document({
            [Type.TOTP]: totp !== null && totp.getAttribute('verified', false),
            [Type.EMAIL]: user.getAttribute('email', false) && user.getAttribute('emailVerification', false),
            [Type.PHONE]: user.getAttribute('phone', false) && user.getAttribute('phoneVerification', false),
            [Type.RECOVERY_CODE]: recoveryCodeEnabled
        });

        response.dynamic(factors, Response.MODEL_MFA_FACTORS);
    });


App.post('/v1/account/mfa/authenticators/:type')
    .desc('Create Authenticator')
    .groups(['api', 'account'])
    .label('event', 'users.[userId].update.mfa')
    .label('scope', 'account')
    .label('audits.event', 'user.update')
    .label('audits.resource', 'user/{response.$id}')
    .label('audits.userId', '{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'createMfaAuthenticator')
    .label('sdk.description', '/docs/references/account/create-mfa-authenticator.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_MFA_TYPE)
    .label('sdk.offline.model', '/account')
    .label('sdk.offline.key', 'current')
    .param('type', '', new WhiteList([Type.TOTP]), `Type of authenticator. Must be ${Type.TOTP}`)
    .inject('requestTimestamp')
    .inject('response')
    .inject('project')
    .inject('user')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async (type: string, requestTimestamp: Date | null, response: Response, project: Document, user: Document, dbForProject: Database, queueForEvents: Event) => {
        const otp = (() => {
            switch (type) {
                case Type.TOTP:
                    return new TOTP();
                default:
                    throw new Error('Unknown type.');
            }
        })();

        otp.setLabel(user.getAttribute('email'));
        otp.setIssuer(project.getAttribute('name'));

        let authenticator = TOTP.getAuthenticatorFromUser(user);

        if (authenticator) {
            if (authenticator.getAttribute('verified')) {
                throw new Error('USER_AUTHENTICATOR_ALREADY_VERIFIED');
            }
            await dbForProject.deleteDocument('authenticators', authenticator.getId());
        }

        authenticator = new Document({
            '$id': ID.unique(),
            'userId': user.getId(),
            'userInternalId': user.getInternalId(),
            'type': Type.TOTP,
            'verified': false,
            'data': {
                'secret': otp.getSecret(),
            },
            '$permissions': [
                Permission.read(Role.user(user.getId())),
                Permission.update(Role.user(user.getId())),
                Permission.delete(Role.user(user.getId())),
            ]
        });

        const model = new Document({
            'secret': otp.getSecret(),
            'uri': otp.getProvisioningUri()
        });

        await dbForProject.createDocument('authenticators', authenticator);
        await dbForProject.purgeCachedDocument('users', user.getId());

        queueForEvents.setParam('userId', user.getId());

        response.dynamic(model, Response.MODEL_MFA_TYPE);
    });


App.put('/v1/account/mfa/authenticators/:type')
    .desc('Verify Authenticator')
    .groups(['api', 'account'])
    .label('event', 'users.[userId].update.mfa')
    .label('scope', 'account')
    .label('audits.event', 'user.update')
    .label('audits.resource', 'user/{response.$id}')
    .label('audits.userId', '{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'updateMfaAuthenticator')
    .label('sdk.description', '/docs/references/account/update-mfa-authenticator.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USER)
    .label('sdk.offline.model', '/account')
    .label('sdk.offline.key', 'current')
    .param('type', '', new WhiteList([Type.TOTP]), 'Type of authenticator.')
    .param('otp', '', new Text(256), 'Valid verification token.')
    .inject('response')
    .inject('user')
    .inject('session')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async (type: string, otp: string, response: Response, user: Document, session: Document, dbForProject: Database, queueForEvents: Event) => {
        const authenticator = (() => {
            switch (type) {
                case Type.TOTP:
                    return TOTP.getAuthenticatorFromUser(user);
                default:
                    return null;
            }
        })();

        if (authenticator === null) {
            throw new Error('USER_AUTHENTICATOR_NOT_FOUND');
        }

        if (authenticator.getAttribute('verified')) {
            throw new Error('USER_AUTHENTICATOR_ALREADY_VERIFIED');
        }

        const success = (() => {
            switch (type) {
                case Type.TOTP:
                    return TOTPChallenge.verify(user, otp);
                default:
                    return false;
            }
        })();

        if (!success) {
            throw new Error('USER_INVALID_TOKEN');
        }

        authenticator.setAttribute('verified', true);

        await dbForProject.updateDocument('authenticators', authenticator.getId(), authenticator);
        await dbForProject.purgeCachedDocument('users', user.getId());

        let factors = session.getAttribute('factors', []);
        factors.push(type);
        factors = Array.from(new Set(factors));

        session.setAttribute('factors', factors);
        await dbForProject.updateDocument('sessions', session.getId(), session);

        queueForEvents.setParam('userId', user.getId());

        response.dynamic(user, Response.MODEL_ACCOUNT);
    });

App.post('/v1/account/mfa/recovery-codes')
    .desc('Create MFA Recovery Codes')
    .groups(['api', 'account'])
    .label('event', 'users.[userId].update.mfa')
    .label('scope', 'account')
    .label('audits.event', 'user.update')
    .label('audits.resource', 'user/{response.$id}')
    .label('audits.userId', '{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'createMfaRecoveryCodes')
    .label('sdk.description', '/docs/references/account/create-mfa-recovery-codes.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_MFA_RECOVERY_CODES)
    .label('sdk.offline.model', '/account')
    .label('sdk.offline.key', 'current')
    .inject('response')
    .inject('user')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async (response: Response, user: Document, dbForProject: Database, queueForEvents: Event) => {
        let mfaRecoveryCodes = user.getAttribute('mfaRecoveryCodes', []);

        if (mfaRecoveryCodes.length > 0) {
            throw new Error('USER_RECOVERY_CODES_ALREADY_EXISTS');
        }

        mfaRecoveryCodes = Type.generateBackupCodes();
        user.setAttribute('mfaRecoveryCodes', mfaRecoveryCodes);
        await dbForProject.updateDocument('users', user.getId(), user);

        queueForEvents.setParam('userId', user.getId());

        const document = new Document({
            'recoveryCodes': mfaRecoveryCodes
        });

        response.dynamic(document, Response.MODEL_MFA_RECOVERY_CODES);
    });


App.patch('/v1/account/mfa/recovery-codes')
    .desc('Regenerate MFA Recovery Codes')
    .groups(['api', 'account', 'mfaProtected'])
    .label('event', 'users.[userId].update.mfa')
    .label('scope', 'account')
    .label('audits.event', 'user.update')
    .label('audits.resource', 'user/{response.$id}')
    .label('audits.userId', '{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'updateMfaRecoveryCodes')
    .label('sdk.description', '/docs/references/account/update-mfa-recovery-codes.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_MFA_RECOVERY_CODES)
    .label('sdk.offline.model', '/account')
    .label('sdk.offline.key', 'current')
    .inject('dbForProject')
    .inject('response')
    .inject('user')
    .inject('queueForEvents')
    .action(async (dbForProject: Database, response: Response, user: Document, queueForEvents: Event) => {
        let mfaRecoveryCodes = user.getAttribute('mfaRecoveryCodes', []);
        if (mfaRecoveryCodes.length === 0) {
            throw new Error('USER_RECOVERY_CODES_NOT_FOUND');
        }

        mfaRecoveryCodes = Type.generateBackupCodes();
        user.setAttribute('mfaRecoveryCodes', mfaRecoveryCodes);
        await dbForProject.updateDocument('users', user.getId(), user);

        queueForEvents.setParam('userId', user.getId());

        const document = new Document({
            'recoveryCodes': mfaRecoveryCodes
        });

        response.dynamic(document, Response.MODEL_MFA_RECOVERY_CODES);
    });

App.get('/v1/account/mfa/recovery-codes')
    .desc('Get MFA Recovery Codes')
    .groups(['api', 'account', 'mfaProtected'])
    .label('scope', 'account')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'getMfaRecoveryCodes')
    .label('sdk.description', '/docs/references/account/get-mfa-recovery-codes.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_MFA_RECOVERY_CODES)
    .label('sdk.offline.model', '/account')
    .label('sdk.offline.key', 'current')
    .inject('response')
    .inject('user')
    .action(async (response: Response, user: Document) => {
        const mfaRecoveryCodes = user.getAttribute('mfaRecoveryCodes', []);

        if (mfaRecoveryCodes.length === 0) {
            throw new Error('USER_RECOVERY_CODES_NOT_FOUND');
        }

        const document = new Document({
            'recoveryCodes': mfaRecoveryCodes
        });

        response.dynamic(document, Response.MODEL_MFA_RECOVERY_CODES);
    });

App.delete('/v1/account/mfa/authenticators/:type')
    .desc('Delete Authenticator')
    .groups(['api', 'account'])
    .label('event', 'users.[userId].delete.mfa')
    .label('scope', 'account')
    .label('audits.event', 'user.update')
    .label('audits.resource', 'user/{response.$id}')
    .label('audits.userId', '{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'deleteMfaAuthenticator')
    .label('sdk.description', '/docs/references/account/delete-mfa-authenticator.md')
    .label('sdk.response.code', Response.STATUS_CODE_NOCONTENT)
    .label('sdk.response.model', Response.MODEL_NONE)
    .param('type', '', new WhiteList([Type.TOTP]), 'Type of authenticator.')
    .param('otp', '', new Text(256), 'Valid verification token.')
    .inject('response')
    .inject('user')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async (type: string, otp: string, response: Response, user: Document, dbForProject: Database, queueForEvents: Event) => {
        const authenticator = (() => {
            switch (type) {
                case Type.TOTP:
                    return TOTP.getAuthenticatorFromUser(user);
                default:
                    return null;
            }
        })();

        if (!authenticator) {
            throw new Error('USER_AUTHENTICATOR_NOT_FOUND');
        }

        let success = (() => {
            switch (type) {
                case Type.TOTP:
                    return TOTPChallenge.verify(user, otp);
                default:
                    return false;
            }
        })();

        if (!success) {
            let mfaRecoveryCodes = user.getAttribute('mfaRecoveryCodes', []);
            if (mfaRecoveryCodes.includes(otp)) {
                mfaRecoveryCodes = mfaRecoveryCodes.filter(code => code !== otp);
                user.setAttribute('mfaRecoveryCodes', mfaRecoveryCodes);
                await dbForProject.updateDocument('users', user.getId(), user);
                success = true;
            }
        }

        if (!success) {
            throw new Error('USER_INVALID_TOKEN');
        }

        await dbForProject.deleteDocument('authenticators', authenticator.getId());
        await dbForProject.purgeCachedDocument('users', user.getId());

        queueForEvents.setParam('userId', user.getId());

        response.noContent();
    });



App.post('/v1/account/mfa/challenge')
    .desc('Create MFA Challenge')
    .groups(['api', 'account', 'mfa'])
    .label('scope', 'account')
    .label('event', 'users.[userId].challenges.[challengeId].create')
    .label('audits.event', 'challenge.create')
    .label('audits.resource', 'user/{response.userId}')
    .label('audits.userId', '{response.userId}')
    .label('sdk.auth', [])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'createMfaChallenge')
    .label('sdk.description', '/docs/references/account/create-mfa-challenge.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_MFA_CHALLENGE)
    .label('abuse-limit', 10)
    .label('abuse-key', 'url:{url},token:{param-token}')
    .param('factor', '', new WhiteList([Type.EMAIL, Type.PHONE, Type.TOTP, Type.RECOVERY_CODE]), `Factor used for verification. Must be one of following: ${Type.EMAIL}, ${Type.PHONE}, ${Type.TOTP}, ${Type.RECOVERY_CODE}.`)
    .inject('response')
    .inject('dbForProject')
    .inject('user')
    .inject('locale')
    .inject('project')
    .inject('request')
    .inject('queueForEvents')
    .inject('queueForMessaging')
    .inject('queueForMails')
    .action(async (factor: string, response: Response, dbForProject: Database, user: Document, locale: Locale, project: Document, request: Request, queueForEvents: Event, queueForMessaging: Messaging, queueForMails: Mail) => {
        const expire = DateTime.addSeconds(new Date(), Auth.TOKEN_EXPIRATION_CONFIRM);
        const code = Auth.codeGenerator();
        let challenge = new Document({
            'userId': user.getId(),
            'userInternalId': user.getInternalId(),
            'type': factor,
            'token': Auth.tokenGenerator(),
            'code': code,
            'expire': expire,
            '$permissions': [
                Permission.read(Role.user(user.getId())),
                Permission.update(Role.user(user.getId())),
                Permission.delete(Role.user(user.getId())),
            ],
        });

        challenge = await dbForProject.createDocument('challenges', challenge);

        switch (factor) {
            case Type.PHONE:
                if (!process.env._APP_SMS_PROVIDER) {
                    throw new Error('Phone provider not configured');
                }
                if (!user.getAttribute('phone')) {
                    throw new Error('USER_PHONE_NOT_FOUND');
                }
                if (!user.getAttribute('phoneVerification')) {
                    throw new Error('USER_PHONE_NOT_VERIFIED');
                }

                let message = Template.fromFile(__dirname + '/../../config/locale/templates/sms-base.tpl');

                const customTemplate = project.getAttribute('templates', [])[`sms.mfaChallenge-${locale.default}`] ?? [];
                if (customTemplate) {
                    message = customTemplate['message'] ?? message;
                }

                let messageContent = Template.fromString(locale.getText("sms.verification.body"));
                messageContent
                    .setParam('{{project}}', project.getAttribute('name'))
                    .setParam('{{secret}}', code);
                messageContent = strip_tags(await messageContent.render()) as any;
                message = message.setParam('{{token}}', messageContent);

                message = message.render() as any;

                queueForMessaging
                    .setType(MESSAGE_SEND_TYPE_INTERNAL)
                    .setMessage(new Document({
                        '$id': challenge.getId(),
                        'data': {
                            'content': code,
                        },
                    }))
                    .setRecipients([user.getAttribute('phone')])
                    .setProviderType(MESSAGE_TYPE_SMS);
                break;
            case Type.EMAIL:
                if (!process.env._APP_SMTP_HOST) {
                    throw new Error('SMTP disabled');
                }
                if (!user.getAttribute('email')) {
                    throw new Error('USER_EMAIL_NOT_FOUND');
                }
                if (!user.getAttribute('emailVerification')) {
                    throw new Error('USER_EMAIL_NOT_VERIFIED');
                }

                let subject = locale.getText("emails.mfaChallenge.subject");
                const customEmailTemplate = project.getAttribute('templates', [])[`email.mfaChallenge-${locale.default}`] ?? [];

                const detector = new Detector(request.getUserAgent('UNKNOWN'));
                const agentOs = detector.getOS();
                const agentClient = detector.getClient();
                const agentDevice = detector.getDevice();

                let emailMessage = Template.fromFile(__dirname + '../../config/locale/templates/email-mfa-challenge.tpl');
                emailMessage
                    .setParam('{{hello}}', locale.getText("emails.mfaChallenge.hello"))
                    .setParam('{{description}}', locale.getText("emails.mfaChallenge.description"))
                    .setParam('{{clientInfo}}', locale.getText("emails.mfaChallenge.clientInfo"))
                    .setParam('{{thanks}}', locale.getText("emails.mfaChallenge.thanks"))
                    .setParam('{{signature}}', locale.getText("emails.mfaChallenge.signature"));

                let body = await emailMessage.render();

                const smtp = project.getAttribute('smtp', []);
                const smtpEnabled = smtp['enabled'] ?? false;

                let senderEmail = process.env._APP_SYSTEM_EMAIL_ADDRESS || APP_EMAIL_TEAM;
                let senderName = process.env._APP_SYSTEM_EMAIL_NAME || `${APP_NAME} Server`;
                let replyTo = "";

                if (smtpEnabled) {
                    if (smtp['senderEmail']) {
                        senderEmail = smtp['senderEmail'];
                    }
                    if (smtp['senderName']) {
                        senderName = smtp['senderName'];
                    }
                    if (smtp['replyTo']) {
                        replyTo = smtp['replyTo'];
                    }

                    queueForMails
                        .setSmtpHost(smtp['host'] ?? '')
                        .setSmtpPort(smtp['port'] ?? '')
                        .setSmtpUsername(smtp['username'] ?? '')
                        .setSmtpPassword(smtp['password'] ?? '')
                        .setSmtpSecure(smtp['secure'] ?? '');

                    if (customEmailTemplate) {
                        if (customEmailTemplate['senderEmail']) {
                            senderEmail = customEmailTemplate['senderEmail'];
                        }
                        if (customEmailTemplate['senderName']) {
                            senderName = customEmailTemplate['senderName'];
                        }
                        if (customEmailTemplate['replyTo']) {
                            replyTo = customEmailTemplate['replyTo'];
                        }

                        body = customEmailTemplate['message'] ?? '';
                        subject = customEmailTemplate['subject'] ?? subject;
                    }

                    queueForMails
                        .setSmtpReplyTo(replyTo)
                        .setSmtpSenderEmail(senderEmail)
                        .setSmtpSenderName(senderName);
                }

                const emailVariables = {
                    'direction': locale.getText('settings.direction'),
                    'user': user.getAttribute('name'),
                    'project': project.getAttribute('name'),
                    'otp': code,
                    'agentDevice': agentDevice['deviceBrand'] ?? 'UNKNOWN',
                    'agentClient': agentClient['clientName'] ?? 'UNKNOWN',
                    'agentOs': agentOs['osName'] ?? 'UNKNOWN'
                };

                queueForMails
                    .setSubject(subject)
                    .setBody(body)
                    .setVariables(emailVariables)
                    .setRecipient(user.getAttribute('email'))
                    .trigger();
                break;
        }

        queueForEvents
            .setParam('userId', user.getId())
            .setParam('challengeId', challenge.getId());

        response.dynamic(challenge, Response.MODEL_MFA_CHALLENGE);
    });

App.put('/v1/account/mfa/challenge')
    .desc('Create MFA Challenge (confirmation)')
    .groups(['api', 'account', 'mfa'])
    .label('scope', 'account')
    .label('event', 'users.[userId].sessions.[sessionId].create')
    .label('audits.event', 'challenges.update')
    .label('audits.resource', 'user/{response.userId}')
    .label('audits.userId', '{response.userId}')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'updateMfaChallenge')
    .label('sdk.description', '/docs/references/account/update-mfa-challenge.md')
    .label('sdk.response.code', Response.STATUS_CODE_NOCONTENT)
    .label('sdk.response.model', Response.MODEL_SESSION)
    .label('abuse-limit', 10)
    .label('abuse-key', 'userId:{param-userId}')
    .param('challengeId', '', new Text(256), 'ID of the challenge.')
    .param('otp', '', new Text(256), 'Valid verification token.')
    .inject('project')
    .inject('response')
    .inject('user')
    .inject('session')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async (challengeId: string, otp: string, project: Document, response: Response, user: Document, session: Document, dbForProject: Database, queueForEvents: Event) => {
        const challenge = await dbForProject.getDocument('challenges', challengeId);

        if (challenge.isEmpty()) {
            throw new Error('USER_INVALID_TOKEN');
        }

        const type = challenge.getAttribute('type');

        const recoveryCodeChallenge = async (challenge: Document, user: Document, otp: string) => {
            if (challenge.isSet('type') && challenge.getAttribute('type') === Type.RECOVERY_CODE.toLowerCase()) {
                let mfaRecoveryCodes = user.getAttribute('mfaRecoveryCodes', []);
                if (mfaRecoveryCodes.includes(otp)) {
                    mfaRecoveryCodes = mfaRecoveryCodes.filter(code => code !== otp);
                    user.setAttribute('mfaRecoveryCodes', mfaRecoveryCodes);
                    await dbForProject.updateDocument('users', user.getId(), user);
                    return true;
                }
                return false;
            }
            return false;
        };

        const success = await (async () => {
            switch (type) {
                case Type.TOTP:
                    return TOTPChallenge.challenge(challenge, user, otp);
                case Type.PHONE:
                    return PhoneChallenge.challenge(challenge, user, otp);
                case Type.EMAIL:
                    return EmailChallenge.challenge(challenge, user, otp);
                case Type.RECOVERY_CODE.toLowerCase():
                    return recoveryCodeChallenge(challenge, user, otp);
                default:
                    return false;
            }
        })();

        if (!success) {
            throw new Error('USER_INVALID_TOKEN');
        }

        await dbForProject.deleteDocument('challenges', challengeId);
        await dbForProject.purgeCachedDocument('users', user.getId());

        let factors = session.getAttribute('factors', []);
        factors.push(type);
        factors = Array.from(new Set(factors));

        session
            .setAttribute('factors', factors)
            .setAttribute('mfaUpdatedAt', DateTime.now());

        await dbForProject.updateDocument('sessions', session.getId(), session);

        queueForEvents
            .setParam('userId', user.getId())
            .setParam('sessionId', session.getId());

        response.dynamic(session, Response.MODEL_SESSION);
    });

App.post('/v1/account/targets/push')
    .desc('Create push target')
    .groups(['api', 'account'])
    .label('scope', 'targets.write')
    .label('audits.event', 'target.create')
    .label('audits.resource', 'target/response.$id')
    .label('event', 'users.[userId].targets.[targetId].create')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'createPushTarget')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_TARGET)
    .param('targetId', '', new CustomId(), 'Target ID. Choose a custom ID or generate a random ID with `ID.unique()`. Valid chars are a-z, A-Z, 0-9, period, hyphen, and underscore. Can\'t start with a special char. Max length is 36 chars.')
    .param('identifier', '', new Text(Database.LENGTH_KEY), 'The target identifier (token, email, phone etc.)')
    .param('providerId', '', new UID(), 'Provider ID. Message will be sent to this target from the specified provider ID. If no provider ID is set the first setup provider will be used.', true)
    .inject('queueForEvents')
    .inject('user')
    .inject('request')
    .inject('response')
    .inject('dbForProject')
    .action(async (targetId: string, identifier: string, providerId: string, queueForEvents: Event, user: Document, request: Request, response: Response, dbForProject: Database) => {
        targetId = targetId === 'unique()' ? ID.unique() : targetId;

        const provider = await Authorization.skip(async () => await dbForProject.getDocument('providers', providerId));

        const target = await Authorization.skip(async () => await dbForProject.getDocument('targets', targetId));

        if (!target.isEmpty()) {
            throw new Error('USER_TARGET_ALREADY_EXISTS');
        }

        const detector = new Detector(request.getUserAgent());
        detector.skipBotDetection(); // OPTIONAL: If called, bot detection will completely be skipped (bots will be detected as regular devices then)

        const device = detector.getDevice();

        const sessionId = Auth.sessionVerify(user.getAttribute('sessions'), Auth.secret) as any;
        const session = await dbForProject.getDocument('sessions', sessionId);

        let newTarget;
        try {
            newTarget = await dbForProject.createDocument('targets', new Document({
                '$id': targetId,
                '$permissions': [
                    Permission.read(Role.user(user.getId())),
                    Permission.update(Role.user(user.getId())),
                    Permission.delete(Role.user(user.getId())),
                ],
                'providerId': providerId ? providerId : null,
                'providerInternalId': providerId ? provider.getInternalId() : null,
                'providerType': MESSAGE_TYPE_PUSH,
                'userId': user.getId(),
                'userInternalId': user.getInternalId(),
                'sessionId': session.getId(),
                'sessionInternalId': session.getInternalId(),
                'identifier': identifier,
                'name': `${device.deviceBrand} ${device.deviceModel}`
            }));
        } catch (error) {
            if (error instanceof Duplicate) {
                throw new Error('USER_TARGET_ALREADY_EXISTS');
            }
            throw error;
        }

        await dbForProject.purgeCachedDocument('users', user.getId());

        queueForEvents
            .setParam('userId', user.getId())
            .setParam('targetId', targetId);

        response
            .setStatusCode(Response.STATUS_CODE_CREATED)
            .dynamic(newTarget, Response.MODEL_TARGET);
    });

App.put('/v1/account/targets/:targetId/push')
    .desc('Update push target')
    .groups(['api', 'account'])
    .label('scope', 'targets.write')
    .label('audits.event', 'target.update')
    .label('audits.resource', 'target/response.$id')
    .label('event', 'users.[userId].targets.[targetId].update')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'updatePushTarget')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_TARGET)
    .param('targetId', '', new UID(), 'Target ID.')
    .param('identifier', '', new Text(Database.LENGTH_KEY), 'The target identifier (token, email, phone etc.)')
    .inject('queueForEvents')
    .inject('user')
    .inject('request')
    .inject('response')
    .inject('dbForProject')
    .action(async (targetId: string, identifier: string, queueForEvents: Event, user: Document, request: Request, response: Response, dbForProject: Database) => {
        const target = await Authorization.skip(async () => await dbForProject.getDocument('targets', targetId));

        if (target.isEmpty()) {
            throw new Error('USER_TARGET_NOT_FOUND');
        }

        if (user.getId() !== target.getAttribute('userId')) {
            throw new Error('USER_TARGET_NOT_FOUND');
        }

        if (identifier) {
            target.setAttribute('identifier', identifier);
        }

        const detector = new Detector(request.getUserAgent());
        detector.skipBotDetection(); // OPTIONAL: If called, bot detection will completely be skipped (bots will be detected as regular devices then)

        const device = detector.getDevice();

        target.setAttribute('name', `${device.deviceBrand} ${device.deviceModel}`);

        await dbForProject.updateDocument('targets', target.getId(), target);

        await dbForProject.purgeCachedDocument('users', user.getId());

        queueForEvents
            .setParam('userId', user.getId())
            .setParam('targetId', target.getId());

        response.dynamic(target, Response.MODEL_TARGET);
    });

App.delete('/v1/account/targets/:targetId/push')
    .desc('Delete push target')
    .groups(['api', 'account'])
    .label('scope', 'targets.write')
    .label('audits.event', 'target.delete')
    .label('audits.resource', 'target/response.$id')
    .label('event', 'users.[userId].targets.[targetId].delete')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'deletePushTarget')
    .label('sdk.response.code', Response.STATUS_CODE_NOCONTENT)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_TARGET)
    .param('targetId', '', new UID(), 'Target ID.')
    .inject('queueForEvents')
    .inject('queueForDeletes')
    .inject('user')
    .inject('request')
    .inject('response')
    .inject('dbForProject')
    .action(async (targetId: string, queueForEvents: Event, queueForDeletes: Delete, user: Document, request: Request, response: Response, dbForProject: Database) => {
        const target = await Authorization.skip(async () => await dbForProject.getDocument('targets', targetId));

        if (target.isEmpty()) {
            throw new Error('USER_TARGET_NOT_FOUND');
        }

        if (user.getInternalId() !== target.getAttribute('userInternalId')) {
            throw new Error('USER_TARGET_NOT_FOUND');
        }

        await dbForProject.deleteDocument('targets', target.getId());

        await dbForProject.purgeCachedDocument('users', user.getId());

        queueForDeletes
            .setType(DELETE_TYPE_TARGET)
            .setDocument(target);

        queueForEvents
            .setParam('userId', user.getId())
            .setParam('targetId', target.getId())
            .setPayload(response.output(target, Response.MODEL_TARGET));

        response.noContent();
    });

App.get('/v1/account/identities')
    .desc('List Identities')
    .groups(['api', 'account'])
    .label('scope', 'account')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'listIdentities')
    .label('sdk.description', '/docs/references/account/list-identities.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_IDENTITY_LIST)
    .label('sdk.offline.model', '/account/identities')
    .param('queries', [], new Identities(), `Array of query strings generated using the Query class provided by the SDK. [Learn more about queries](https://appconda.io/docs/queries). Maximum of ${APP_LIMIT_ARRAY_PARAMS_SIZE} queries are allowed, each ${APP_LIMIT_ARRAY_ELEMENT_SIZE} characters long. You may filter on the following attributes: ${Identities.ALLOWED_ATTRIBUTES.join(', ')}`, true)
    .inject('response')
    .inject('user')
    .inject('dbForProject')
    .action(async (queries: string[], response: Response, user: Document, dbForProject: Database) => {
        try {
            queries = Query.parseQueries(queries) as any;
        } catch (e: any) {
            throw new Exception(`GENERAL_QUERY_INVALID: ${e.message}`);
        }


        (queries as any).push(Query.equal('userInternalId', [user.getInternalId()]));

        const cursor: any = queries.find((query: any) => [Query.TYPE_CURSOR_AFTER, Query.TYPE_CURSOR_BEFORE].includes(query.getMethod()));
        if (cursor) {
            const identityId = (cursor as Query).getValue();
            const cursorDocument = await dbForProject.getDocument('identities', identityId);

            if (cursorDocument.isEmpty()) {
                throw new Error(`GENERAL_CURSOR_NOT_FOUND: Identity '${identityId}' for the 'cursor' value not found.`);
            }

            cursor.setValue(cursorDocument);
        }

        const filterQueries = Query.groupByType(queries as any).filters;

        const results = await dbForProject.find('identities', queries as any);
        const total = await dbForProject.count('identities', filterQueries, APP_LIMIT_COUNT);

        response.dynamic(new Document({
            'identities': results,
            'total': total,
        }), Response.MODEL_IDENTITY_LIST);
    });

App.delete('/v1/account/identities/:identityId')
    .desc('Delete identity')
    .groups(['api', 'account'])
    .label('scope', 'account')
    .label('event', 'users.[userId].identities.[identityId].delete')
    .label('audits.event', 'identity.delete')
    .label('audits.resource', 'identity/{request.$identityId}')
    .label('audits.userId', '{user.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'deleteIdentity')
    .label('sdk.description', '/docs/references/account/delete-identity.md')
    .label('sdk.response.code', Response.STATUS_CODE_NOCONTENT)
    .label('sdk.response.model', Response.MODEL_NONE)
    .param('identityId', '', new UID(), 'Identity ID.')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async (identityId: string, response: Response, dbForProject: Database, queueForEvents: Event) => {
        const identity = await dbForProject.getDocument('identities', identityId);

        if (identity.isEmpty()) {
            throw new Error('USER_IDENTITY_NOT_FOUND');
        }

        await dbForProject.deleteDocument('identities', identityId);

        queueForEvents
            .setParam('userId', identity.getAttribute('userId'))
            .setParam('identityId', identity.getId())
            .setPayload(response.output(identity, Response.MODEL_IDENTITY));

        response.noContent();
    });








/* 



App
    .get('/v1/accounts')
    .desc('Get all users')
    .inject('request')
    .inject('response')
    .action(async (req: Request, res: Response) => {
        const localInstance = new Local(path.resolve(__dirname, '../../resources/disk-a'));
        await localInstance.createDirectory(path.resolve(__dirname, '../../resources/disk-a/test_memer'));
        await localInstance.write(localInstance.getPath('test_memer.txt'), 'tsdfsdest_memer');
        const text = await localInstance.read(localInstance.getPath('test_memer.txt'));
        console.log(text);
        res.send('Hello World from accounts');
    });

App
    .post('/v1/account')
    .desc('Get all users')
    .groups(['api', 'account', 'auth'])
    .label('event', 'users.[userId].create')
    .label('scope', 'sessions.write')
    .label('auth.type', 'emailPassword')
    .label('audits.event', 'user.create')
    .label('audits.resource', 'user/{response.$id}')
    .label('audits.userId', '{response.$id}')
    .label('sdk.auth', [])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'create')
    .label('sdk.description', '/docs/references/account/create.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    // .label('sdk.response.model', Response.MODEL_USER)
    .label('abuse-limit', 10)
    .inject('request')
    .inject('response')
    .action(async (req: Request, res: Response) => {

        res.send('Hello World from accounts');
    });
 */

/* App
    .get('/v1/service/mert')
    .desc('Create account')
    .groups(['api', 'account', 'auth'])
    .label('event', 'users.[userId].create')
    .label('scope', 'sessions.write')
    .label('auth.type', 'emailPassword')
    .label('audits.event', 'user.create')
    .label('audits.resource', 'user/{response.$id}')
    .label('audits.userId', '{response.$id}')
    .label('sdk.auth', [])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'create')
    .label('sdk.description', '/docs/references/account/create.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
   // .label('sdk.response.model', Response.MODEL_USER)
    .label('abuse-limit', 10)
    .inject('request')
    .inject('response')
    .action( (req: Request, res: Response) => {
        res.send('Hello World from accounts');
    }); */