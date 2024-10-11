import { CustomId } from "../../../Appconda/Database/Validators/CustomId";
import { Memberships } from "../../../Appconda/Database/Validators/Queries/Memberships";
import { Teams } from "../../../Appconda/Database/Validators/Queries/Teams";
import { Detector } from "../../../Appconda/Detector/Detector";
import { Delete } from "../../../Appconda/Event/Delete";
import { Event } from "../../../Appconda/Event/Event";
import { Mail } from "../../../Appconda/Event/Mail";
import { Messaging } from "../../../Appconda/Event/Messaging";
import { AppcondaException as Exception } from "../../../Appconda/Extend/Exception";
import { Email } from "../../../Appconda/Network/Validators/Email";
import { Template } from "../../../Appconda/Template/Template";
import { Request } from "../../../Appconda/Tuval/Request";
import { Response } from "../../../Appconda/Tuval/Response";
import { Audit } from "../../../Tuval/Audit";
import { Auth, Phone, TOTP } from "../../../Tuval/Auth";
import { Config } from "../../../Tuval/Config";
import { ArrayList, Assoc, Authorization, Document, Host, ID, Key, Permission, Role, Text } from "../../../Tuval/Core";
import { AuthorizationException, Database, Duplicate, Limit, Offset, Queries, Query, UID } from "../../../Tuval/Database";
import { App } from "../../../Tuval/Http";
import { Locale } from "../../../Tuval/Locale";
import { APP_AUTH_TYPE_ADMIN, APP_AUTH_TYPE_JWT, APP_AUTH_TYPE_KEY, APP_EMAIL_TEAM, APP_LIMIT_ARRAY_ELEMENT_SIZE, APP_LIMIT_ARRAY_PARAMS_SIZE, APP_LIMIT_COUNT, APP_LIMIT_USERS, APP_NAME, DELETE_TYPE_DOCUMENT, MESSAGE_SEND_TYPE_INTERNAL } from "../../init";
import { APP_AUTH_TYPE_SESSION } from "../../init";

App.post('/v1/teams')
    .desc('Create team')
    .groups(['api', 'teams'])
    .label('event', 'teams.[teamId].create')
    .label('scope', 'teams.write')
    .label('audits.event', 'team.create')
    .label('audits.resource', 'team/{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'teams')
    .label('sdk.method', 'create')
    .label('sdk.description', '/docs/references/teams/create-team.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_TEAM)
    .param('teamId', '', new CustomId(), 'Team ID. Choose a custom ID or generate a random ID with `ID.unique()`. Valid chars are a-z, A-Z, 0-9, period, hyphen, and underscore. Can\'t start with a special char. Max length is 36 chars.')
    .param('name', null, new Text(128), 'Team name. Max length: 128 chars.')
    .param('roles', ['owner'], new ArrayList(new Key(), APP_LIMIT_ARRAY_PARAMS_SIZE), 'Array of strings. Use this param to set the roles in the team for the user who created it. The default role is **owner**. A role can be any string. Learn more about [roles and permissions](https://appconda.io/docs/permissions). Maximum of ' + APP_LIMIT_ARRAY_PARAMS_SIZE + ' roles are allowed, each 32 characters long.', true)
    .inject('response')
    .inject('user')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async ({ teamId, name, roles, response, user, dbForProject, queueForEvents }: { teamId: string, name: string, roles: string[], response: Response, user: Document, dbForProject: Database, queueForEvents: Event }) => {
        const isPrivilegedUser = Auth.isPrivilegedUser(Authorization.getRoles());
        const isAppUser = Auth.isAppUser(Authorization.getRoles());

        teamId = teamId === 'unique()' ? ID.unique() : teamId;

        let team;
        try {
            team = await Authorization.skip(async () => await dbForProject.createDocument('teams', new Document({
                '$id': teamId,
                '$permissions': [
                    Permission.read(Role.team(teamId)),
                    Permission.update(Role.team(teamId, 'owner')),
                    Permission.delete(Role.team(teamId, 'owner')),
                ],
                'name': name,
                'total': (isPrivilegedUser || isAppUser) ? 0 : 1,
                'prefs': {},
                'search': [teamId, name].join(' '),
            })));
        } catch (error) {
            if (error instanceof Duplicate) {
                throw new Exception(Exception.TEAM_ALREADY_EXISTS);
            }
            throw error;
        }

        if (!isPrivilegedUser && !isAppUser) {
            if (!roles.includes('owner')) {
                roles.push('owner');
            }

            const membershipId = ID.unique();
            const membership = new Document({
                '$id': membershipId,
                '$permissions': [
                    Permission.read(Role.user(user.getId())),
                    Permission.read(Role.team(team.getId())),
                    Permission.update(Role.user(user.getId())),
                    Permission.update(Role.team(team.getId(), 'owner')),
                    Permission.delete(Role.user(user.getId())),
                    Permission.delete(Role.team(team.getId(), 'owner')),
                ],
                'userId': user.getId(),
                'userInternalId': user.getInternalId(),
                'teamId': team.getId(),
                'teamInternalId': team.getInternalId(),
                'roles': roles,
                'invited': new Date().toISOString(),
                'joined': new Date().toISOString(),
                'confirm': true,
                'secret': '',
                'search': [membershipId, user.getId()].join(' ')
            });

            await dbForProject.createDocument('memberships', membership);
            await dbForProject.purgeCachedDocument('users', user.getId());
        }

        queueForEvents.setParam('teamId', team.getId());

        if (user.getId()) {
            queueForEvents.setParam('userId', user.getId());
        }

        response
            .setStatusCode(Response.STATUS_CODE_CREATED)
            .dynamic(team, Response.MODEL_TEAM);
    });


App.get('/v1/teams')
    .desc('List teams')
    .groups(['api', 'teams'])
    .label('scope', 'teams.read')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'teams')
    .label('sdk.method', 'list')
    .label('sdk.description', '/docs/references/teams/list-teams.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_TEAM_LIST)
    .label('sdk.offline.model', '/teams')
    .param('queries', [], new Teams(), 'Array of query strings generated using the Query class provided by the SDK. [Learn more about queries](https://appconda.io/docs/queries). Maximum of ' + APP_LIMIT_ARRAY_PARAMS_SIZE + ' queries are allowed, each ' + APP_LIMIT_ARRAY_ELEMENT_SIZE + ' characters long. You may filter on the following attributes: ' + Teams.ALLOWED_ATTRIBUTES.join(', '), true)
    .param('search', '', new Text(256), 'Search term to filter your list results. Max length: 256 chars.', true)
    .inject('response')
    .inject('dbForProject')
    .action(async ({ queries: _queries, search, response, dbForProject }: { queries: string[], search: string, response: Response, dbForProject: Database }) => {
        let queries: Query[] = [];
        try {
            queries = Query.parseQueries(_queries);
        } catch (e) {
            throw new Exception(Exception.GENERAL_QUERY_INVALID, e.message);
        }

        if (search) {
            queries.push(Query.search('search', search));
        }

        const cursor = queries.find(query => [Query.TYPE_CURSOR_AFTER, Query.TYPE_CURSOR_BEFORE].includes(query.getMethod()));
        if (cursor) {
            const teamId = cursor.getValue();
            const cursorDocument = await dbForProject.getDocument('teams', teamId);

            if (cursorDocument.isEmpty()) {
                throw new Exception(Exception.GENERAL_CURSOR_NOT_FOUND, `Team '${teamId}' for the 'cursor' value not found.`);
            }

            cursor.setValue(cursorDocument);
        }

        const filterQueries = Query.groupByType(queries)['filters'];

        const results = await dbForProject.find('teams', queries);
        const total = await dbForProject.count('teams', filterQueries, APP_LIMIT_COUNT);

        response.dynamic(new Document({
            teams: results,
            total: total,
        }), Response.MODEL_TEAM_LIST);
    });

App.get('/v1/teams/:teamId')
    .desc('Get team')
    .groups(['api', 'teams'])
    .label('scope', 'teams.read')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'teams')
    .label('sdk.method', 'get')
    .label('sdk.description', '/docs/references/teams/get-team.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_TEAM)
    .label('sdk.offline.model', '/teams')
    .label('sdk.offline.key', '{teamId}')
    .param('teamId', '', new UID(), 'Team ID.')
    .inject('response')
    .inject('dbForProject')
    .action(async ({ teamId, response, dbForProject }: { teamId: string, response: Response, dbForProject: Database }) => {
        const team = await dbForProject.getDocument('teams', teamId);

        if (team.isEmpty()) {
            throw new Exception(Exception.TEAM_NOT_FOUND);
        }

        response.dynamic(team, Response.MODEL_TEAM);
    });

App.get('/v1/teams/:teamId/prefs')
    .desc('Get team preferences')
    .groups(['api', 'teams'])
    .label('scope', 'teams.read')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'teams')
    .label('sdk.method', 'getPrefs')
    .label('sdk.description', '/docs/references/teams/get-team-prefs.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_PREFERENCES)
    .label('sdk.offline.model', '/teams/{teamId}/prefs')
    .param('teamId', '', new UID(), 'Team ID.')
    .inject('response')
    .inject('dbForProject')
    .action(async ({ teamId, response, dbForProject }: { teamId: string, response: Response, dbForProject: Database }) => {
        const team = await dbForProject.getDocument('teams', teamId);

        if (team.isEmpty()) {
            throw new Exception(Exception.TEAM_NOT_FOUND);
        }

        const prefs = team.getAttribute('prefs', {});

        response.dynamic(new Document(prefs), Response.MODEL_PREFERENCES);
    });

App.put('/v1/teams/:teamId')
    .desc('Update name')
    .groups(['api', 'teams'])
    .label('event', 'teams.[teamId].update')
    .label('scope', 'teams.write')
    .label('audits.event', 'team.update')
    .label('audits.resource', 'team/{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'teams')
    .label('sdk.method', 'updateName')
    .label('sdk.description', '/docs/references/teams/update-team-name.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_TEAM)
    .label('sdk.offline.model', '/teams')
    .label('sdk.offline.key', '{teamId}')
    .param('teamId', '', new UID(), 'Team ID.')
    .param('name', null, new Text(128), 'New team name. Max length: 128 chars.')
    .inject('requestTimestamp')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async ({ teamId, name, requestTimestamp, response, dbForProject, queueForEvents }: { teamId: string, name: string, requestTimestamp: Date | null, response: Response, dbForProject: Database, queueForEvents: Event }) => {
        const team = await dbForProject.getDocument('teams', teamId);

        if (team.isEmpty()) {
            throw new Exception(Exception.TEAM_NOT_FOUND);
        }

        team.setAttribute('name', name)
            .setAttribute('search', [teamId, name].join(' '));

        const updatedTeam = await dbForProject.withRequestTimestamp(requestTimestamp, async () => {
            return await dbForProject.updateDocument('teams', team.getId(), team);
        });

        queueForEvents.setParam('teamId', updatedTeam.getId());

        response.dynamic(updatedTeam, Response.MODEL_TEAM);
    });

App.put('/v1/teams/:teamId/prefs')
    .desc('Update preferences')
    .groups(['api', 'teams'])
    .label('event', 'teams.[teamId].update.prefs')
    .label('scope', 'teams.write')
    .label('audits.event', 'team.update')
    .label('audits.resource', 'team/{response.$id}')
    .label('audits.userId', '{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'teams')
    .label('sdk.method', 'updatePrefs')
    .label('sdk.description', '/docs/references/teams/update-team-prefs.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_PREFERENCES)
    .label('sdk.offline.model', '/teams/{teamId}/prefs')
    .param('teamId', '', new UID(), 'Team ID.')
    .param('prefs', '', new Assoc(), 'Prefs key-value JSON object.')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async ({ teamId, prefs, response, dbForProject, queueForEvents }: { teamId: string, prefs: Record<string, any>, response: Response, dbForProject: Database, queueForEvents: Event }) => {
        const team = await dbForProject.getDocument('teams', teamId);

        if (team.isEmpty()) {
            throw new Exception(Exception.TEAM_NOT_FOUND);
        }

        const updatedTeam = await dbForProject.updateDocument('teams', team.getId(), team.setAttribute('prefs', prefs));

        queueForEvents.setParam('teamId', updatedTeam.getId());

        response.dynamic(new Document(prefs), Response.MODEL_PREFERENCES);
    });

App.delete('/v1/teams/:teamId')
    .desc('Delete team')
    .groups(['api', 'teams'])
    .label('event', 'teams.[teamId].delete')
    .label('scope', 'teams.write')
    .label('audits.event', 'team.delete')
    .label('audits.resource', 'team/{request.teamId}')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'teams')
    .label('sdk.method', 'delete')
    .label('sdk.description', '/docs/references/teams/delete-team.md')
    .label('sdk.response.code', Response.STATUS_CODE_NOCONTENT)
    .label('sdk.response.model', Response.MODEL_NONE)
    .param('teamId', '', new UID(), 'Team ID.')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .inject('queueForDeletes')
    .action(async ({ teamId, response, dbForProject, queueForEvents, queueForDeletes }: { teamId: string, response: Response, dbForProject: Database, queueForEvents: Event, queueForDeletes: Delete }) => {
        const team = await dbForProject.getDocument('teams', teamId);

        if (team.isEmpty()) {
            throw new Exception(Exception.TEAM_NOT_FOUND);
        }

        const deleted = await dbForProject.deleteDocument('teams', teamId);
        if (!deleted) {
            throw new Exception(Exception.GENERAL_SERVER_ERROR, 'Failed to remove team from DB');
        }

        queueForDeletes
            .setType(DELETE_TYPE_DOCUMENT)
            .setDocument(team);

        queueForEvents
            .setParam('teamId', team.getId())
            .setPayload(response.output(team, Response.MODEL_TEAM));

        response.noContent();
    });

App.post('/v1/teams/:teamId/memberships')
    .desc('Create team membership')
    .groups(['api', 'teams', 'auth'])
    .label('event', 'teams.[teamId].memberships.[membershipId].create')
    .label('scope', 'teams.write')
    .label('auth.type', 'invites')
    .label('audits.event', 'membership.create')
    .label('audits.resource', 'team/{request.teamId}')
    .label('audits.userId', '{request.userId}')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'teams')
    .label('sdk.method', 'createMembership')
    .label('sdk.description', '/docs/references/teams/create-team-membership.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_MEMBERSHIP)
    .label('abuse-limit', 10)
    .param('teamId', '', new UID(), 'Team ID.')
    .param('email', '', new Email(), 'Email of the new team member.', true)
    .param('userId', '', new UID(), 'ID of the user to be added to a team.', true)
    .param('phone', '', new Phone(), 'Phone number. Format this number with a leading \'+\' and a country code, e.g., +16175551212.', true)
    .param('roles', [], new ArrayList(new Key(), APP_LIMIT_ARRAY_PARAMS_SIZE), 'Array of strings. Use this param to set the user roles in the team. A role can be any string. Learn more about [roles and permissions](https://appconda.io/docs/permissions). Maximum of ' + APP_LIMIT_ARRAY_PARAMS_SIZE + ' roles are allowed, each 32 characters long.')
    .param('url', '', (clients) => new Host(clients), 'URL to redirect the user back to your app from the invitation email. This parameter is not required when an API key is supplied. Only URLs from hostnames in your project platform list are allowed. This requirement helps to prevent an [open redirect](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html) attack against your project API.', true, ['clients'])
    .param('name', '', new Text(128), 'Name of the new team member. Max length: 128 chars.', true)
    .inject('response')
    .inject('project')
    .inject('user')
    .inject('dbForProject')
    .inject('locale')
    .inject('queueForMails')
    .inject('queueForMessaging')
    .inject('queueForEvents')
    .action(async ({ teamId, email, userId, phone, roles, url, name, response, project, user, dbForProject, locale, queueForMails, queueForMessaging, queueForEvents }: { teamId: string, email: string, userId: string, phone: string, roles: string[], url: string, name: string, response: Response, project: Document, user: Document, dbForProject: Database, locale: Locale, queueForMails: Mail, queueForMessaging: Messaging, queueForEvents: Event }) => {
        const isAPIKey = Auth.isAppUser(Authorization.getRoles());
        const isPrivilegedUser = Auth.isPrivilegedUser(Authorization.getRoles());


        function htmlentities(str: string): string {
            return str.replace(/[\u00A0-\u9999<>\&]/gim, function (i) {
                return `&#${i.charCodeAt(0)};`;
            });
        }

        url = htmlentities(url);
        if (!url) {
            if (!isAPIKey && !isPrivilegedUser) {
                throw new Exception(Exception.GENERAL_ARGUMENT_INVALID, 'URL is required');
            }
        }

        if (!userId && !email && !phone) {
            throw new Exception(Exception.GENERAL_ARGUMENT_INVALID, 'At least one of userId, email, or phone is required');
        }

        if (!isPrivilegedUser && !isAPIKey && !process.env._APP_SMTP_HOST) {
            throw new Exception(Exception.GENERAL_SMTP_DISABLED);
        }

        email = email.toLowerCase();
        name = name || email;
        const team = await dbForProject.getDocument('teams', teamId);

        if (team.isEmpty()) {
            throw new Exception(Exception.TEAM_NOT_FOUND);
        }

        let invitee;
        if (userId) {
            invitee = await dbForProject.getDocument('users', userId);
            if (invitee.isEmpty()) {
                throw new Exception(Exception.USER_NOT_FOUND, 'User with given userId doesn\'t exist.', 404);
            }
            if (email && invitee.getAttribute('email', '') !== email) {
                throw new Exception(Exception.USER_ALREADY_EXISTS, 'Given userId and email doesn\'t match', 409);
            }
            if (phone && invitee.getAttribute('phone', '') !== phone) {
                throw new Exception(Exception.USER_ALREADY_EXISTS, 'Given userId and phone doesn\'t match', 409);
            }
            email = invitee.getAttribute('email', '');
            phone = invitee.getAttribute('phone', '');
            name = name || invitee.getAttribute('name', '');
        } else if (email) {
            invitee = await dbForProject.findOne('users', [Query.equal('email', [email])]);
            if (invitee && phone && invitee.getAttribute('phone', '') !== phone) {
                throw new Exception(Exception.USER_ALREADY_EXISTS, 'Given email and phone doesn\'t match', 409);
            }
        } else if (phone) {
            invitee = await dbForProject.findOne('users', [Query.equal('phone', [phone])]);
            if (invitee && email && invitee.getAttribute('email', '') !== email) {
                throw new Exception(Exception.USER_ALREADY_EXISTS, 'Given phone and email doesn\'t match', 409);
            }
        }

        if (!invitee) {
            const limit = project.getAttribute('auths', [])['limit'] || 0;

            if (!isPrivilegedUser && !isAPIKey && limit !== 0 && project.getId() !== 'console') {
                const total = await dbForProject.count('users', [], APP_LIMIT_USERS);

                if (total >= limit) {
                    throw new Exception(Exception.USER_COUNT_EXCEEDED, 'Project registration is restricted. Contact your administrator for more information.');
                }
            }

            const identityWithMatchingEmail = await dbForProject.findOne('identities', [
                Query.equal('providerEmail', [email]),
            ]);
            if (identityWithMatchingEmail && !identityWithMatchingEmail.isEmpty()) {
                throw new Exception(Exception.USER_EMAIL_ALREADY_EXISTS);
            }

            try {
                userId = ID.unique();
                invitee = await Authorization.skip(() => dbForProject.createDocument('users', new Document({
                    '$id': userId,
                    '$permissions': [
                        Permission.read(Role.any()),
                        Permission.read(Role.user(userId)),
                        Permission.update(Role.user(userId)),
                        Permission.delete(Role.user(userId)),
                    ],
                    'email': email || null,
                    'phone': phone || null,
                    'emailVerification': false,
                    'status': true,
                    'password': Auth.passwordHash(Auth.passwordGenerator(), Auth.DEFAULT_ALGO, Auth.DEFAULT_ALGO_OPTIONS),
                    'hash': Auth.DEFAULT_ALGO,
                    'hashOptions': Auth.DEFAULT_ALGO_OPTIONS,
                    'passwordUpdate': null,
                    'registration': new Date().toISOString(),
                    'reset': false,
                    'name': name,
                    'prefs': {},
                    'sessions': null,
                    'tokens': null,
                    'memberships': null,
                    'search': [userId, email, name].join(' '),
                })));
            } catch (error) {
                if (error instanceof Duplicate) {
                    throw new Exception(Exception.USER_ALREADY_EXISTS);
                }
                throw error;
            }
        }

        const isOwner = Authorization.isRole(`team:${team.getId()}/owner`);

        if (!isOwner && !isPrivilegedUser && !isAPIKey) {
            throw new Exception(Exception.USER_UNAUTHORIZED, 'User is not allowed to send invitations for this team');
        }

        const secret = Auth.tokenGenerator();

        const membershipId = ID.unique();
        const membership = new Document({
            '$id': membershipId,
            '$permissions': [
                Permission.read(Role.any()),
                Permission.update(Role.user(invitee.getId())),
                Permission.update(Role.team(team.getId(), 'owner')),
                Permission.delete(Role.user(invitee.getId())),
                Permission.delete(Role.team(team.getId(), 'owner')),
            ],
            'userId': invitee.getId(),
            'userInternalId': invitee.getInternalId(),
            'teamId': team.getId(),
            'teamInternalId': team.getInternalId(),
            'roles': roles,
            'invited': new Date().toISOString(),
            'joined': (isPrivilegedUser || isAPIKey) ? new Date().toISOString() : null,
            'confirm': (isPrivilegedUser || isAPIKey),
            'secret': Auth.hash(secret),
            'search': [membershipId, invitee.getId()].join(' ')
        });

        if (isPrivilegedUser || isAPIKey) {
            try {
                await Authorization.skip(() => dbForProject.createDocument('memberships', membership));
            } catch (error) {
                if (error instanceof Duplicate) {
                    throw new Exception(Exception.TEAM_INVITE_ALREADY_EXISTS);
                }
                throw error;
            }

            await Authorization.skip(() => dbForProject.increaseDocumentAttribute('teams', team.getId(), 'total', 1));

            await dbForProject.purgeCachedDocument('users', invitee.getId());
        } else {
            try {
                await dbForProject.createDocument('memberships', membership);
            } catch (error) {
                if (error instanceof Duplicate) {
                    throw new Exception(Exception.TEAM_INVITE_ALREADY_EXISTS);
                }
                throw error;
            }

            const parsedUrl = Template.parseURL(url);
            parsedUrl.query = Template.mergeQuery(parsedUrl.query as any || '', { membershipId: membership.getId(), userId: invitee.getId(), secret, teamId });
            url = Template.unParseURL(parsedUrl);

            if (email) {
                const projectName = project.isEmpty() ? 'Console' : project.getAttribute('name', '[APP-NAME]');

                let body = locale.getText("emails.invitation.body");
                let subject = locale.getText("emails.invitation.subject").replace('%s', team.getAttribute('name')).replace('%s', projectName);
                const customTemplate = project.getAttribute('templates', {})[`email.invitation-${locale.default}`] || {};

                const message = Template.fromFile(__dirname + '/../../config/locale/templates/email-inner-base.tpl');
                message
                    .setParam('{{body}}', body, false)
                    .setParam('{{hello}}', locale.getText("emails.invitation.hello"))
                    .setParam('{{footer}}', locale.getText("emails.invitation.footer"))
                    .setParam('{{thanks}}', locale.getText("emails.invitation.thanks"))
                    .setParam('{{signature}}', locale.getText("emails.invitation.signature"));
                const renderedBody = await message.render();

                const smtp = project.getAttribute('smtp', {});
                const smtpEnabled = smtp['enabled'] || false;

                let senderEmail = process.env._APP_SYSTEM_EMAIL_ADDRESS || APP_EMAIL_TEAM;
                let senderName = process.env._APP_SYSTEM_EMAIL_NAME || `${APP_NAME} Server`;
                let replyTo = "";

                if (smtpEnabled) {
                    senderEmail = smtp['senderEmail'] || senderEmail;
                    senderName = smtp['senderName'] || senderName;
                    replyTo = smtp['replyTo'] || replyTo;

                    queueForMails
                        .setSmtpHost(smtp['host'] || '')
                        .setSmtpPort(smtp['port'] || '')
                        .setSmtpUsername(smtp['username'] || '')
                        .setSmtpPassword(smtp['password'] || '')
                        .setSmtpSecure(smtp['secure'] || '');

                    if (customTemplate) {
                        senderEmail = customTemplate['senderEmail'] || senderEmail;
                        senderName = customTemplate['senderName'] || senderName;
                        replyTo = customTemplate['replyTo'] || replyTo;

                        body = customTemplate['message'] || body;
                        subject = customTemplate['subject'] || subject;
                    }

                    queueForMails
                        .setSmtpReplyTo(replyTo)
                        .setSmtpSenderEmail(senderEmail)
                        .setSmtpSenderName(senderName);
                }

                const emailVariables = {
                    owner: user.getAttribute('name'),
                    direction: locale.getText('settings.direction'),
                    user: user.getAttribute('name'),
                    team: team.getAttribute('name'),
                    redirect: url,
                    project: projectName
                };

                queueForMails
                    .setSubject(subject)
                    .setBody(renderedBody)
                    .setRecipient(invitee.getAttribute('email'))
                    .setName(invitee.getAttribute('name'))
                    .setVariables(emailVariables)
                    .trigger();
            } else if (phone) {
                if (!process.env._APP_SMS_PROVIDER) {
                    throw new Exception(Exception.GENERAL_PHONE_DISABLED, 'Phone provider not configured');
                }

                let message = Template.fromFile(__dirname + '/../../config/locale/templates/sms-base.tpl');

                const customTemplate = project.getAttribute('templates', {})[`sms.invitation-${locale.default}`] || {};
                if (customTemplate) {
                    message = customTemplate['message'];
                }

                message = message.setParam('{{token}}', url);
                const renderedMessage = message.render();

                const messageDoc = new Document({
                    '$id': ID.unique(),
                    'data': {
                        'content': renderedMessage,
                    },
                });

                queueForMessaging
                    .setType(MESSAGE_SEND_TYPE_INTERNAL)
                    .setMessage(messageDoc)
                    .setRecipients([phone])
                    .setProviderType('SMS');
            }
        }

        queueForEvents
            .setParam('userId', invitee.getId())
            .setParam('teamId', team.getId())
            .setParam('membershipId', membership.getId());

        response
            .setStatusCode(Response.STATUS_CODE_CREATED)
            .dynamic(
                membership
                    .setAttribute('teamName', team.getAttribute('name'))
                    .setAttribute('userName', invitee.getAttribute('name'))
                    .setAttribute('userEmail', invitee.getAttribute('email')),
                Response.MODEL_MEMBERSHIP
            );
    });

App.get('/v1/teams/:teamId/memberships')
    .desc('List team memberships')
    .groups(['api', 'teams'])
    .label('scope', 'teams.read')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'teams')
    .label('sdk.method', 'listMemberships')
    .label('sdk.description', '/docs/references/teams/list-team-members.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_MEMBERSHIP_LIST)
    .label('sdk.offline.model', '/teams/{teamId}/memberships')
    .param('teamId', '', new UID(), 'Team ID.')
    .param('queries', [], new Memberships(), 'Array of query strings generated using the Query class provided by the SDK. [Learn more about queries](https://appconda.io/docs/queries). Maximum of ' + APP_LIMIT_ARRAY_PARAMS_SIZE + ' queries are allowed, each ' + APP_LIMIT_ARRAY_ELEMENT_SIZE + ' characters long. You may filter on the following attributes: ' + Memberships.ALLOWED_ATTRIBUTES.join(', '), true)
    .param('search', '', new Text(256), 'Search term to filter your list results. Max length: 256 chars.', true)
    .inject('response')
    .inject('dbForProject')
    .action(async ({ teamId, queries: _queries, search, response, dbForProject }: { teamId: string, queries: string[], search: string, response: Response, dbForProject: Database }) => {
        const team = await dbForProject.getDocument('teams', teamId);

        let queries: Query[] = [];

        if (team.isEmpty()) {
            throw new Exception(Exception.TEAM_NOT_FOUND);
        }

        try {
            queries = Query.parseQueries(_queries);
        } catch (e) {
            throw new Exception(Exception.GENERAL_QUERY_INVALID, e.message);
        }

        if (search) {
            queries.push(Query.search('search', search));
        }

        // Set internal queries
        queries.push(Query.equal('teamInternalId', [team.getInternalId()]));

        const cursor = queries.find(query => [Query.TYPE_CURSOR_AFTER, Query.TYPE_CURSOR_BEFORE].includes(query.getMethod()));
        if (cursor) {
            const membershipId = cursor.getValue();
            const cursorDocument = await dbForProject.getDocument('memberships', membershipId);

            if (cursorDocument.isEmpty()) {
                throw new Exception(Exception.GENERAL_CURSOR_NOT_FOUND, `Membership '${membershipId}' for the 'cursor' value not found.`);
            }

            cursor.setValue(cursorDocument);
        }

        const filterQueries = Query.groupByType(queries)['filters'];

        let memberships = await dbForProject.find('memberships', queries);
        const total = await dbForProject.count('memberships', filterQueries, APP_LIMIT_COUNT);

        memberships = memberships.filter((membership: Document) => membership.getAttribute('userId'));

        memberships = await Promise.all(memberships.map(async (membership: Document) => {
            const user = await dbForProject.getDocument('users', membership.getAttribute('userId'));

            let mfa = user.getAttribute('mfa', false);
            if (mfa) {
                const totp = TOTP.getAuthenticatorFromUser(user);
                const totpEnabled = totp && totp.getAttribute('verified', false);
                const emailEnabled = user.getAttribute('email', false) && user.getAttribute('emailVerification', false);
                const phoneEnabled = user.getAttribute('phone', false) && user.getAttribute('phoneVerification', false);

                if (!totpEnabled && !emailEnabled && !phoneEnabled) {
                    mfa = false;
                }
            }

            membership
                .setAttribute('mfa', mfa)
                .setAttribute('teamName', team.getAttribute('name'))
                .setAttribute('userName', user.getAttribute('name'))
                .setAttribute('userEmail', user.getAttribute('email'));

            return membership;
        }));

        response.dynamic(new Document({
            memberships: memberships,
            total: total,
        }), Response.MODEL_MEMBERSHIP_LIST);
    });

App.get('/v1/teams/:teamId/memberships/:membershipId')
    .desc('Get team membership')
    .groups(['api', 'teams'])
    .label('scope', 'teams.read')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'teams')
    .label('sdk.method', 'getMembership')
    .label('sdk.description', '/docs/references/teams/get-team-member.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_MEMBERSHIP)
    .label('sdk.offline.model', '/teams/{teamId}/memberships')
    .label('sdk.offline.key', '{membershipId}')
    .param('teamId', '', new UID(), 'Team ID.')
    .param('membershipId', '', new UID(), 'Membership ID.')
    .inject('response')
    .inject('dbForProject')
    .action(async ({ teamId, membershipId, response, dbForProject }: { teamId: string, membershipId: string, response: Response, dbForProject: Database }) => {
        const team = await dbForProject.getDocument('teams', teamId);

        if (team.isEmpty()) {
            throw new Exception(Exception.TEAM_NOT_FOUND);
        }

        const membership = await dbForProject.getDocument('memberships', membershipId);

        if (membership.isEmpty() || !membership.getAttribute('userId')) {
            throw new Exception(Exception.MEMBERSHIP_NOT_FOUND);
        }

        const user = await dbForProject.getDocument('users', membership.getAttribute('userId'));

        let mfa = user.getAttribute('mfa', false);

        if (mfa) {
            const totp = TOTP.getAuthenticatorFromUser(user);
            const totpEnabled = totp && totp.getAttribute('verified', false);
            const emailEnabled = user.getAttribute('email', false) && user.getAttribute('emailVerification', false);
            const phoneEnabled = user.getAttribute('phone', false) && user.getAttribute('phoneVerification', false);

            if (!totpEnabled && !emailEnabled && !phoneEnabled) {
                mfa = false;
            }
        }

        membership
            .setAttribute('mfa', mfa)
            .setAttribute('teamName', team.getAttribute('name'))
            .setAttribute('userName', user.getAttribute('name'))
            .setAttribute('userEmail', user.getAttribute('email'));

        response.dynamic(membership, Response.MODEL_MEMBERSHIP);
    });

App.patch('/v1/teams/:teamId/memberships/:membershipId')
    .desc('Update membership')
    .groups(['api', 'teams'])
    .label('event', 'teams.[teamId].memberships.[membershipId].update')
    .label('scope', 'teams.write')
    .label('audits.event', 'membership.update')
    .label('audits.resource', 'team/{request.teamId}')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'teams')
    .label('sdk.method', 'updateMembership')
    .label('sdk.description', '/docs/references/teams/update-team-membership.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_MEMBERSHIP)
    .param('teamId', '', new UID(), 'Team ID.')
    .param('membershipId', '', new UID(), 'Membership ID.')
    .param('roles', [], new ArrayList(new Key(), APP_LIMIT_ARRAY_PARAMS_SIZE), 'An array of strings. Use this param to set the user\'s roles in the team. A role can be any string. Learn more about [roles and permissions](https://appconda.io/docs/permissions). Maximum of ' + APP_LIMIT_ARRAY_PARAMS_SIZE + ' roles are allowed, each 32 characters long.')
    .inject('request')
    .inject('response')
    .inject('user')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async ({ teamId, membershipId, roles, request, response, user, dbForProject, queueForEvents }: { teamId: string, membershipId: string, roles: string[], request: Request, response: Response, user: Document, dbForProject: Database, queueForEvents: Event }) => {
        const team = await dbForProject.getDocument('teams', teamId);
        if (team.isEmpty()) {
            throw new Exception(Exception.TEAM_NOT_FOUND);
        }

        const membership = await dbForProject.getDocument('memberships', membershipId);
        if (membership.isEmpty()) {
            throw new Exception(Exception.MEMBERSHIP_NOT_FOUND);
        }

        const profile = await dbForProject.getDocument('users', membership.getAttribute('userId'));
        if (profile.isEmpty()) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        const isPrivilegedUser = Auth.isPrivilegedUser(Authorization.getRoles());
        const isAppUser = Auth.isAppUser(Authorization.getRoles());
        const isOwner = Authorization.isRole(`team:${team.getId()}/owner`);

        if (!isOwner && !isPrivilegedUser && !isAppUser) {
            throw new Exception(Exception.USER_UNAUTHORIZED, 'User is not allowed to modify roles');
        }

        // Update the roles
        membership.setAttribute('roles', roles);
        const updatedMembership = await dbForProject.updateDocument('memberships', membership.getId(), membership);

        // Replace membership on profile
        await dbForProject.purgeCachedDocument('users', profile.getId());

        queueForEvents
            .setParam('userId', profile.getId())
            .setParam('teamId', team.getId())
            .setParam('membershipId', updatedMembership.getId());

        response.dynamic(
            updatedMembership
                .setAttribute('teamName', team.getAttribute('name'))
                .setAttribute('userName', profile.getAttribute('name'))
                .setAttribute('userEmail', profile.getAttribute('email')),
            Response.MODEL_MEMBERSHIP
        );
    });

App.patch('/v1/teams/:teamId/memberships/:membershipId/status')
    .desc('Update team membership status')
    .groups(['api', 'teams'])
    .label('event', 'teams.[teamId].memberships.[membershipId].update.status')
    .label('scope', 'public')
    .label('audits.event', 'membership.update')
    .label('audits.resource', 'team/{request.teamId}')
    .label('audits.userId', '{request.userId}')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'teams')
    .label('sdk.method', 'updateMembershipStatus')
    .label('sdk.description', '/docs/references/teams/update-team-membership-status.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_MEMBERSHIP)
    .param('teamId', '', new UID(), 'Team ID.')
    .param('membershipId', '', new UID(), 'Membership ID.')
    .param('userId', '', new UID(), 'User ID.')
    .param('secret', '', new Text(256), 'Secret key.')
    .inject('request')
    .inject('response')
    .inject('user')
    .inject('dbForProject')
    .inject('project')
    .inject('geodb')
    .inject('queueForEvents')
    .action(async ({ teamId, membershipId, userId, secret, request, response, user, dbForProject, project, geodb, queueForEvents }: { teamId: string, membershipId: string, userId: string, secret: string, request: Request, response: Response, user: Document, dbForProject: Database, project: Document, geodb: any, queueForEvents: Event }) => {
        const protocol = request.getProtocol();

        const membership = await dbForProject.getDocument('memberships', membershipId);

        if (membership.isEmpty()) {
            throw new Exception(Exception.MEMBERSHIP_NOT_FOUND);
        }

        const team = await Authorization.skip(() => dbForProject.getDocument('teams', teamId));

        if (team.isEmpty()) {
            throw new Exception(Exception.TEAM_NOT_FOUND);
        }

        if (membership.getAttribute('teamInternalId') !== team.getInternalId()) {
            throw new Exception(Exception.TEAM_MEMBERSHIP_MISMATCH);
        }

        if (Auth.hash(secret) !== membership.getAttribute('secret')) {
            throw new Exception(Exception.TEAM_INVALID_SECRET);
        }

        if (userId !== membership.getAttribute('userId')) {
            throw new Exception(Exception.TEAM_INVITE_MISMATCH, `Invite does not belong to current user (${user.getAttribute('email')})`);
        }

        if (user.isEmpty()) {
            user.setAttributes((await dbForProject.getDocument('users', userId)).getArrayCopy());
        }

        if (membership.getAttribute('userInternalId') !== user.getInternalId()) {
            throw new Exception(Exception.TEAM_INVITE_MISMATCH, `Invite does not belong to current user (${user.getAttribute('email')})`);
        }

        if (membership.getAttribute('confirm') === true) {
            throw new Exception(Exception.MEMBERSHIP_ALREADY_CONFIRMED);
        }

        membership
            .setAttribute('joined', new Date())
            .setAttribute('confirm', true);

        await Authorization.skip(() => dbForProject.updateDocument('users', user.getId(), user.setAttribute('emailVerification', true)));

        // Log user in
        Authorization.setRole(Role.user(user.getId()).toString());

        const detector = new Detector(request.getUserAgent('UNKNOWN'));
        const record = geodb.get(request.getIP());
        const authDuration = project.getAttribute('auths', [])['duration'] || Auth.TOKEN_EXPIRATION_LOGIN_LONG;
        const expire = new Date(Date.now() + authDuration * 1000);
        const sessionSecret = Auth.tokenGenerator();
        const session = new Document({
            '$id': ID.unique(),
            'userId': user.getId(),
            'userInternalId': user.getInternalId(),
            'provider': Auth.SESSION_PROVIDER_EMAIL,
            'providerUid': user.getAttribute('email'),
            'secret': Auth.hash(sessionSecret),
            'userAgent': request.getUserAgent('UNKNOWN'),
            'ip': request.getIP(),
            'factors': ['email'],
            'countryCode': record ? record['country']['iso_code'].toLowerCase() : '--',
            'expire': expire,
            ...detector.getOS(),
            ...detector.getClient(),
            ...detector.getDevice()
        });

        await dbForProject.createDocument('sessions', session.setAttribute('$permissions', [
            Permission.read(Role.user(user.getId())),
            Permission.update(Role.user(user.getId())),
            Permission.delete(Role.user(user.getId())),
        ]));

        await dbForProject.purgeCachedDocument('users', user.getId());

        Authorization.setRole(Role.user(userId).toString());

        const updatedMembership = await dbForProject.updateDocument('memberships', membership.getId(), membership);

        await dbForProject.purgeCachedDocument('users', user.getId());

        await Authorization.skip(() => dbForProject.increaseDocumentAttribute('teams', team.getId(), 'total', 1));

        queueForEvents
            .setParam('userId', user.getId())
            .setParam('teamId', team.getId())
            .setParam('membershipId', updatedMembership.getId());

        if (!Config.getParam('domainVerification')) {
            response.addHeader('X-Fallback-Cookies', JSON.stringify({ [Auth.cookieName]: Auth.encodeSession(user.getId(), sessionSecret) }));
        }

        response
            .addCookie(`${Auth.cookieName}_legacy`, Auth.encodeSession(user.getId(), sessionSecret), expire.getTime(), '/', Config.getParam('cookieDomain'), protocol === 'https', true, null)
            .addCookie(Auth.cookieName, Auth.encodeSession(user.getId(), sessionSecret), expire.getTime(), '/', Config.getParam('cookieDomain'), protocol === 'https', true, Config.getParam('cookieSamesite'));

        response.dynamic(
            updatedMembership
                .setAttribute('teamName', team.getAttribute('name'))
                .setAttribute('userName', user.getAttribute('name'))
                .setAttribute('userEmail', user.getAttribute('email')),
            Response.MODEL_MEMBERSHIP
        );
    });
App.delete('/v1/teams/:teamId/memberships/:membershipId')
    .desc('Delete team membership')
    .groups(['api', 'teams'])
    .label('event', 'teams.[teamId].memberships.[membershipId].delete')
    .label('scope', 'teams.write')
    .label('audits.event', 'membership.delete')
    .label('audits.resource', 'team/{request.teamId}')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'teams')
    .label('sdk.method', 'deleteMembership')
    .label('sdk.description', '/docs/references/teams/delete-team-membership.md')
    .label('sdk.response.code', Response.STATUS_CODE_NOCONTENT)
    .label('sdk.response.model', Response.MODEL_NONE)
    .param('teamId', '', new UID(), 'Team ID.')
    .param('membershipId', '', new UID(), 'Membership ID.')
    .inject('response')
    .inject('dbForProject')
    .inject('queueForEvents')
    .action(async ({ teamId, membershipId, response, dbForProject, queueForEvents }: { teamId: string, membershipId: string, response: Response, dbForProject: Database, queueForEvents: Event }) => {
        const membership = await dbForProject.getDocument('memberships', membershipId);

        if (membership.isEmpty()) {
            throw new Exception(Exception.TEAM_INVITE_NOT_FOUND);
        }

        const user = await dbForProject.getDocument('users', membership.getAttribute('userId'));

        if (user.isEmpty()) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        const team = await dbForProject.getDocument('teams', teamId);

        if (team.isEmpty()) {
            throw new Exception(Exception.TEAM_NOT_FOUND);
        }

        if (membership.getAttribute('teamInternalId') !== team.getInternalId()) {
            throw new Exception(Exception.TEAM_MEMBERSHIP_MISMATCH);
        }

        try {
            await dbForProject.deleteDocument('memberships', membership.getId());
        } catch (error) {
            if (error instanceof AuthorizationException) { 
                throw new Exception(Exception.USER_UNAUTHORIZED);
               
            }
            throw new Exception(Exception.GENERAL_SERVER_ERROR, 'Failed to remove membership from DB');

           
        }/*  catch (error) {
            throw new Exception(Exception.GENERAL_SERVER_ERROR, 'Failed to remove membership from DB');
        } */

        await dbForProject.purgeCachedDocument('users', user.getId());

        if (membership.getAttribute('confirm')) { // Count only confirmed members
            await Authorization.skip(() => dbForProject.decreaseDocumentAttribute('teams', team.getId(), 'total', 1, 0));
        }

        queueForEvents
            .setParam('userId', user.getId())
            .setParam('teamId', team.getId())
            .setParam('membershipId', membership.getId())
            .setPayload(response.output(membership, Response.MODEL_MEMBERSHIP));

        response.noContent();
    });

    App.get('/v1/teams/:teamId/logs')
    .desc('List team logs')
    .groups(['api', 'teams'])
    .label('scope', 'teams.read')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'teams')
    .label('sdk.method', 'listLogs')
    .label('sdk.description', '/docs/references/teams/get-team-logs.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_LOG_LIST)
    .param('teamId', '', new UID(), 'Team ID.')
    .param('queries', [], new Queries([new Limit(), new Offset()]), 'Array of query strings generated using the Query class provided by the SDK. [Learn more about queries](https://appconda.io/docs/queries). Only supported methods are limit and offset', true)
    .inject('response')
    .inject('dbForProject')
    .inject('locale')
    .inject('geodb')
    .action(async ({ teamId, queries: _queries, response, dbForProject, locale, geodb }: { teamId: string, queries: string[], response: Response, dbForProject: Database, locale: Locale, geodb: any }) => {
        const team = await dbForProject.getDocument('teams', teamId);
        
        let queries: Query[] = [];

        if (team.isEmpty()) {
            throw new Exception(Exception.TEAM_NOT_FOUND);
        }

        try {
            queries = Query.parseQueries(_queries);
        } catch (e) {
            throw new Exception(Exception.GENERAL_QUERY_INVALID, e.message);
        }

        const grouped = Query.groupByType(queries);
        const limit = grouped['limit'] ?? APP_LIMIT_COUNT;
        const offset = grouped['offset'] ?? 0;

        const audit = new Audit(dbForProject);
        const resource = `team/${team.getId()}`;
        const logs = await audit.getLogsByResource(resource, limit, offset);

        const output = await Promise.all(logs.map(async (log: any, i: number) => {
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
                logDocument.setAttribute('countryCode', locale.getText(`countries.${record['country']['iso_code'].toLowerCase()}`, false) ? record['country']['iso_code'].toLowerCase() : '--');
                logDocument.setAttribute('countryName', locale.getText(`countries.${record['country']['iso_code'].toLowerCase()}`, locale.getText('locale.country.unknown')));
            } else {
                logDocument.setAttribute('countryCode', '--');
                logDocument.setAttribute('countryName', locale.getText('locale.country.unknown'));
            }

            return logDocument;
        }));

        response.dynamic(new Document({
            total: await audit.countLogsByResource(resource),
            logs: output,
        }), Response.MODEL_LOG_LIST);
    });