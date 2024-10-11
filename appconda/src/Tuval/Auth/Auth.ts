import { Authorization, DateTime, Document, Role, Roles } from '../../Tuval/Core';
import argon2 from 'argon2';
import bcrypt from 'bcrypt';
import crypto from 'crypto-js';
import scrypt from 'scrypt-js';
import { v4 as uuidv4 } from 'uuid';


type HashOptions = { [key: string]: any };

export class Auth {
    public static readonly SUPPORTED_ALGOS = [
        'argon2',
        'bcrypt',
        'md5',
        'sha',
        'phpass',
        'scrypt',
        'scryptMod',
        'plaintext'
    ];

    public static readonly DEFAULT_ALGO = 'argon2';
    public static readonly DEFAULT_ALGO_OPTIONS = { 
        type: argon2.argon2id, memoryCost: 2048, timeCost: 4, threads: 3 };

    /**
     * User Roles.
     */
    public static readonly USER_ROLE_ANY = 'any';
    public static readonly USER_ROLE_GUESTS = 'guests';
    public static readonly USER_ROLE_USERS = 'users';
    public static readonly USER_ROLE_ADMIN = 'admin';
    public static readonly USER_ROLE_DEVELOPER = 'developer';
    public static readonly USER_ROLE_OWNER = 'owner';
    public static readonly USER_ROLE_APPS = 'apps';
    public static readonly USER_ROLE_SYSTEM = 'system';

    /**
     * Token Types.
     */
    public static readonly TOKEN_TYPE_LOGIN = 1; // Deprecated
    public static readonly TOKEN_TYPE_VERIFICATION = 2;
    public static readonly TOKEN_TYPE_RECOVERY = 3;
    public static readonly TOKEN_TYPE_INVITE = 4;
    public static readonly TOKEN_TYPE_MAGIC_URL = 5;
    public static readonly TOKEN_TYPE_PHONE = 6;
    public static readonly TOKEN_TYPE_OAUTH2 = 7;
    public static readonly TOKEN_TYPE_GENERIC = 8;
    public static readonly TOKEN_TYPE_EMAIL = 9; // OTP

    /**
     * Session Providers.
     */
    public static readonly SESSION_PROVIDER_EMAIL = 'email';
    public static readonly SESSION_PROVIDER_ANONYMOUS = 'anonymous';
    public static readonly SESSION_PROVIDER_MAGIC_URL = 'magic-url';
    public static readonly SESSION_PROVIDER_PHONE = 'phone';
    public static readonly SESSION_PROVIDER_OAUTH2 = 'oauth2';
    public static readonly SESSION_PROVIDER_TOKEN = 'token';
    public static readonly SESSION_PROVIDER_SERVER = 'server';

    /**
     * Token Expiration times.
     */
    public static readonly TOKEN_EXPIRATION_LOGIN_LONG = 31536000;      /* 1 year */
    public static readonly TOKEN_EXPIRATION_LOGIN_SHORT = 3600;         /* 1 hour */
    public static readonly TOKEN_EXPIRATION_RECOVERY = 3600;            /* 1 hour */
    public static readonly TOKEN_EXPIRATION_CONFIRM = 3600 * 1;         /* 1 hour */
    public static readonly TOKEN_EXPIRATION_OTP = 60 * 15;              /* 15 minutes */
    public static readonly TOKEN_EXPIRATION_GENERIC = 60 * 15;          /* 15 minutes */

    /**
     * Token Lengths.
     */
    public static readonly TOKEN_LENGTH_MAGIC_URL = 64;
    public static readonly TOKEN_LENGTH_VERIFICATION = 256;
    public static readonly TOKEN_LENGTH_RECOVERY = 256;
    public static readonly TOKEN_LENGTH_OAUTH2 = 64;
    public static readonly TOKEN_LENGTH_SESSION = 256;

    /**
     * MFA
     */
    public static readonly MFA_RECENT_DURATION = 1800; // 30 mins

    /**
     * @var string
     */
    public static cookieName: string = 'a_session';

    /**
     * User Unique ID.
     *
     * @var string
     */
    public static unique: string = '';

    /**
     * User Secret Key.
     *
     * @var string
     */
    public static secret: string = '';

    /**
     * Set Cookie Name.
     *
     * @param {string} name
     *
     * @return {string}
     */
    public static setCookieName(name: string): string {
        this.cookieName = name;
        return this.cookieName;
    }

    /**
     * Encode Session.
     *
     * @param {string} id
     * @param {string} secret
     *
     * @return {string}
     */
    public static encodeSession(id: string, secret: string): string {
        return Buffer.from(JSON.stringify({
            id: id,
            secret: secret,
        })).toString('base64');
    }

    /**
     * Token type to session provider mapping.
     */
    public static getSessionProviderByTokenType(type: number): string {
        switch (type) {
            case Auth.TOKEN_TYPE_VERIFICATION:
            case Auth.TOKEN_TYPE_RECOVERY:
            case Auth.TOKEN_TYPE_INVITE:
                return Auth.SESSION_PROVIDER_EMAIL;
            case Auth.TOKEN_TYPE_MAGIC_URL:
                return Auth.SESSION_PROVIDER_MAGIC_URL;
            case Auth.TOKEN_TYPE_PHONE:
                return Auth.SESSION_PROVIDER_PHONE;
            case Auth.TOKEN_TYPE_OAUTH2:
                return Auth.SESSION_PROVIDER_OAUTH2;
            default:
                return Auth.SESSION_PROVIDER_TOKEN;
        }
    }

    /**
     * Decode Session.
     *
     * @param {string} session
     *
     * @return {object}
     *
     * @throws {Error}
     */
    public static decodeSession(session: string): { id: string | null; secret: string } {
        try {
            const decoded = Buffer.from(session, 'base64').toString('utf-8');
            const parsed = JSON.parse(decoded);
            const defaultSession = { id: null, secret: '' };

            if (typeof parsed !== 'object' || parsed === null) {
                return defaultSession;
            }

            return { ...defaultSession, ...parsed };
        } catch (error) {
            return { id: null, secret: '' };
        }
    }

    /**
     * Encode.
     *
     * One-way encryption
     *
     * @param {string} input
     *
     * @return {string}
     */
    public static hash(input: string): string {
        return crypto.SHA256(input).toString();
    }

    /**
     * Password Hash.
     *
     * One way string hashing for user passwords
     *
     * @param {string} input
     * @param {string} algo hashing algorithm to use
     * @param {HashOptions} options algo-specific options
     *
     * @return {Promise<string | null>}
     */
    public static async passwordHash(input: string, algo: string, options: HashOptions = {}): Promise<string | null> {
        // Plain text not supported, just an alias. Switch to recommended algo
        if (algo === 'plaintext') {
            algo = Auth.DEFAULT_ALGO;
            options = Auth.DEFAULT_ALGO_OPTIONS;
        }

        if (!Auth.SUPPORTED_ALGOS.includes(algo)) {
            throw new Error(`Hashing algorithm '${algo}' is not supported.`);
        }

        switch (algo) {
            case 'argon2':
                const hash = await argon2.hash(input, options);
                return hash;
            case 'bcrypt':
                const saltRounds = options.saltRounds || 10;
                return await bcrypt.hash(input, saltRounds);
            case 'md5':
                return crypto.MD5(input).toString();
            case 'sha':
                return crypto.SHA256(input).toString();
            case 'phpass':
                // phpass is not directly available in npm, using bcrypt as an alternative
                return await bcrypt.hash(input, 10);
            case 'scrypt':
                return new Promise<string>(async (resolve, reject) => {
                    const password = Buffer.from(input);
                    const salt = Buffer.from(options.salt || '');
                    const N = options.N || 16384;
                    const r = options.r || 8;
                    const p = options.p || 1;
                    const dkLen = options.dkLen || 64;

                    try {
                        const key = await scrypt.scrypt(password, salt, N, r, p, dkLen);
                        resolve(Buffer.from(key).toString('hex'));
                    } catch (error) {
                        reject(error);
                    }
                });

            case 'scryptMod':

                // Assuming scryptMod is a modified version, using scrypt-js as well
                return new Promise<string>(async (resolve, reject) => {
                    const password = Buffer.from(input);
                    const salt = Buffer.from(options.salt || '');
                    const N = options.N || 16384;
                    const r = options.r || 8;
                    const p = options.p || 1;
                    const dkLen = options.dkLen || 64;
                    try {
                        const key = await scrypt.scrypt(password, salt, N, r, p, dkLen);
                        resolve(Buffer.from(key).toString('hex'));
                    }
                    catch (error) {
                        reject(error);
                    }
                });

            default:
                throw new Error(`Hashing algorithm '${algo}' is not supported.`);
        }
    }

    /**
     * Password verify.
     *
     * @param {string} plain
     * @param {string} hash
     * @param {string} algo hashing algorithm used to hash
     * @param {HashOptions} options algo-specific options
     *
     * @return {Promise<boolean>}
     */
    public static async passwordVerify(plain: string, hashValue: string, algo: string, options: HashOptions = {}): Promise<boolean> {
        // Plain text not supported, just an alias. Switch to recommended algo
        if (algo === 'plaintext') {
            algo = Auth.DEFAULT_ALGO;
            options = Auth.DEFAULT_ALGO_OPTIONS;
        }

        if (!Auth.SUPPORTED_ALGOS.includes(algo)) {
            throw new Error(`Hashing algorithm '${algo}' is not supported.`);
        }

        switch (algo) {
            case 'argon2':
                return await argon2.verify(hashValue, plain);
            case 'bcrypt':
                return await bcrypt.compare(plain, hashValue);
            case 'md5':
                return crypto.MD5(plain).toString() === hashValue;
            case 'sha':
                return crypto.SHA256(plain).toString() === hashValue;
            case 'phpass':
                // phpass is not directly available in npm, using bcrypt as an alternative
                return await bcrypt.compare(plain, hashValue);
            case 'scrypt':
            case 'scryptMod':
                const hashedPlain = await Auth.passwordHash(plain, algo, options);
                return hashedPlain === hashValue;
            default:
                throw new Error(`Hashing algorithm '${algo}' is not supported.`);
        }
    }

    /**
     * Password Generator.
     *
     * Generate random password string
     *
     * @param {number} length
     *
     * @return {string}
     */
    public static passwordGenerator(length: number = 20): string {
        return crypto.lib.WordArray.random(length).toString();
    }

    /**
     * Token Generator.
     *
     * Generate random token string
     *
     * @param {number} length Length of returned token
     *
     * @return {string}
     */
    public static tokenGenerator(length: number = 256): string {
        if (length <= 0) {
            throw new Error('Token length must be greater than 0');
        }

        const bytesLength = Math.ceil(length / 2);
        const token = crypto.lib.WordArray.random(bytesLength).toString();
        return token.substring(0, length);
    }

    /**
     * Code Generator.
     *
     * Generate random code string
     *
     * @param {number} length
     *
     * @return {string}
     */
    public static codeGenerator(length: number = 6): string {
        let value = '';
        for (let i = 0; i < length; i++) {
            value += Math.floor(Math.random() * 10).toString();
        }
        return value;
    }

    /**
     * Verify token and check that its not expired.
     *
     * @param {Document[]} tokens
     * @param {number | null} type Type of token to verify, if null will verify any type
     * @param {string} secret
     *
     * @return {Document | false}
     */
    public static tokenVerify(tokens: Document[], type: number | null, secret: string): Document | false {
        const hashedSecret = Auth.hash(secret);

        for (const token of tokens) {
            if (
                token?.getAttribute('secret') === hashedSecret &&
                //@ts-ignore
                DateTime.formatTz(token?.getAttribute('expire')) >= DateTime.formatTz(DateTime.now())
            ) {
                return token;
            }
        }

        return false;
    }

    /**
     * Verify session and check that its not expired.
     *
     * @param {Document[]} sessions
     * @param {string} secret
     *
     * @return {boolean | string}
     */
    public static sessionVerify(sessions: Document[], secret: string): boolean | string {
        const hashedSecret = Auth.hash(secret);

        for (const session of sessions) {
            if (
                session.isSet('secret') &&
                session.isSet('provider') &&
                session.getAttribute('secret') === hashedSecret &&
                //@ts-ignore
                DateTime.formatTz(new Date(session.getAttribute('expire'))) >= DateTime.formatTz(DateTime.now())
            ) {
                return session.getId();
            }
        }

        return false;
    }

    /**
     * Is Privileged User?
     *
     * @param {string[]} roles
     *
     * @return {boolean}
     */
    public static isPrivilegedUser(roles: string[]): boolean {
        return roles.includes(Auth.USER_ROLE_OWNER) ||
            roles.includes(Auth.USER_ROLE_DEVELOPER) ||
            roles.includes(Auth.USER_ROLE_ADMIN);
    }

    /**
     * Is App User?
     *
     * @param {string[]} roles
     *
     * @return {boolean}
     */
    public static isAppUser(roles: string[]): boolean {
        return roles.includes(Auth.USER_ROLE_APPS);
    }

    /**
     * Returns all roles for a user.
     *
     * @param {Document} user
     * @return {string[]}
     */
    public static getRoles(user: Document): string[] {
        const roles: string[] = [];

        const currentRoles = Authorization.getRoles();

        if (!Auth.isPrivilegedUser(currentRoles) && !Auth.isAppUser(currentRoles)) {
            if (user.getId()) {
                roles.push(Role.user(user.getId()).toString());
                roles.push(Role.users().toString());

                const emailVerified = user.getAttribute('emailVerification', false);
                const phoneVerified = user.getAttribute('phoneVerification', false);

                if (emailVerified || phoneVerified) {
                    roles.push(Role.user(user.getId(), Roles.DIMENSION_VERIFIED).toString());
                    roles.push(Role.users(Roles.DIMENSION_VERIFIED).toString());
                } else {
                    roles.push(Role.user(user.getId(), Roles.DIMENSION_UNVERIFIED).toString());
                    roles.push(Role.users(Roles.DIMENSION_UNVERIFIED).toString());
                }
            } else {
                return [Role.guests().toString()];
            }
        }

        const memberships = user.getAttribute('memberships', []);
        for (const node of memberships) {
            if (!node.confirm) {
                continue;
            }

            if (node.$id && node.teamId) {
                roles.push(Role.team(node.teamId).toString());
                roles.push(Role.member(node.$id).toString());

                if (node.roles) {
                    for (const nodeRole of node.roles) { // Set all team roles
                        roles.push(Role.team(node.teamId, nodeRole).toString());
                    }
                }
            }
        }

        const labels = user.getAttribute('labels', []);
        for (const label of labels) {
            roles.push(`label:${label}`);
        }

        return roles;
    }

    /**
     * Check if user is anonymous.
     *
     * @param {Document} user
     * @return {boolean}
     */
    public static isAnonymousUser(user: Document): boolean {
        return user.getAttribute('email') === null && user.getAttribute('phone') === null;
    }
}