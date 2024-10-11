import { BaseService } from "../BaseService";
import { ITask } from "../modules/task/ITask";
import e from "express";
import { ListAppletDatabase } from "../modules/task/TaskListDatabase";
import { Task } from "../modules/task/Task";
import { IAppletInfo } from "../modules/task/IAppletInfo";
import { Database, Query } from "../Tuval/Database";
import { Document } from "../Tuval/Core";

const actions = Symbol('Actions'); // just to be sure there won't be collisions

function Action(actionInfo: any) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        target[actions] = target[actions] || new Map();
        // Here we just add some information that class decorator will use
        target[actions].set(propertyKey, actionInfo);
    };
}

function Service<T extends { new(...args: any[]): {} }>(Base: T) {
    return class extends Base {
        constructor(...args: any[]) {
            super(...args);
            const _actions = Base.prototype[actions];
            //console.log(_actions)
        }
    };
}



@Service
export default class AccountService extends BaseService {

    public get uid(): string {
        return 'com.appconda.service.account';
    }

    get displayName(): string {
        return 'Task Service'
    }

    public async init() {
        console.log('>>>>>>>> Task Service initialized. <<<<<<<<<<')
        console.log(this[actions])

        this.setupRouter();

        /*  const router = this.webServer.getRouter();
 
         router.post(`/com.appconda.service.task/:methodName`, async (req: e.Request, res: e.Response) => {
            
             const methodName = req.params.methodName;
             const params: any = req.body;
 
             console.log(req.body)
 
             try {
                 const method = this[methodName];
                 if (typeof method === 'function') {
                     const result = await method(params);
                     res.json(result);
                 } else {
 
                     throw new Error('Method not found: ' + methodName);
                 }
 
             }
             catch (e: any) {
                 res.status(500);
                 res.send(e.toString())
             }
         }) */
    }



    public async create({userId, email }: { userId: string, email: string }) {

        email = email.toLowerCase();
        if (project.getId() === 'console') {
            const whitelistEmails = project.getAttribute('authWhitelistEmails');
            const whitelistIPs = project.getAttribute('authWhitelistIPs');

            if (whitelistEmails && !whitelistEmails.includes(email) && !whitelistEmails.includes(email.toUpperCase())) {
                throw new Error('USER_EMAIL_NOT_WHITELISTED');
            }

            if (whitelistIPs && !whitelistIPs.includes(request.getIP())) {
                throw new Error('USER_IP_NOT_WHITELISTED');
            }
        }

        const limit = project.getAttribute('auths', [])['limit'] ?? 0;

        if (limit !== 0) {
            const total = await dbForProject.count('users', { max: APP_LIMIT_USERS });

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
            user = await Authorization.skip(() => dbForProject.createDocument('users', user));
            try {
                const target = await Authorization.skip(() => dbForProject.createDocument('targets', new Document({
                    '$permissions': [
                        Permission.read(Role.user(user.getId())),
                        Permission.update(Role.user(user.getId())),
                        Permission.delete(Role.user(user.getId())),
                    ],
                    'userId': user.getId(),
                    'userInternalId': user.getInternalId(),
                    'providerType': MESSAGE_TYPE_EMAIL,
                    'identifier': email,
                })));
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
    }
}


