import { Client } from '../client';
import type { Models } from '../models';
import { PasswordHash } from '../enums/password-hash';
import { UserUsageRange } from '../enums/user-usage-range';
import { AuthenticatorType } from '../enums/authenticator-type';
import { MessagingProviderType } from '../enums/messaging-provider-type';
export declare class Users {
    client: Client;
    constructor(client: Client);
    /**
     * List users
     *
     * Get a list of all the project&#039;s users. You can use the query params to filter your results.
     *
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppcondaException}
     * @returns {Promise<Models.UserList<Preferences>>}
     */
    list<Preferences extends Models.Preferences>(queries?: string[], search?: string): Promise<Models.UserList<Preferences>>;
    /**
     * Create user
     *
     * Create a new user.
     *
     * @param {string} userId
     * @param {string} email
     * @param {string} phone
     * @param {string} password
     * @param {string} name
     * @throws {AppcondaException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    create<Preferences extends Models.Preferences>(userId: string, email?: string, phone?: string, password?: string, name?: string): Promise<Models.User<Preferences>>;
    /**
     * Create user with Argon2 password
     *
     * Create a new user. Password provided must be hashed with the [Argon2](https://en.wikipedia.org/wiki/Argon2) algorithm. Use the [POST /users](https://appconda.io/docs/server/users#usersCreate) endpoint to create users with a plain text password.
     *
     * @param {string} userId
     * @param {string} email
     * @param {string} password
     * @param {string} name
     * @throws {AppcondaException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    createArgon2User<Preferences extends Models.Preferences>(userId: string, email: string, password: string, name?: string): Promise<Models.User<Preferences>>;
    /**
     * Create user with bcrypt password
     *
     * Create a new user. Password provided must be hashed with the [Bcrypt](https://en.wikipedia.org/wiki/Bcrypt) algorithm. Use the [POST /users](https://appconda.io/docs/server/users#usersCreate) endpoint to create users with a plain text password.
     *
     * @param {string} userId
     * @param {string} email
     * @param {string} password
     * @param {string} name
     * @throws {AppcondaException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    createBcryptUser<Preferences extends Models.Preferences>(userId: string, email: string, password: string, name?: string): Promise<Models.User<Preferences>>;
    /**
     * List Identities
     *
     * Get identities for all users.
     *
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppcondaException}
     * @returns {Promise<Models.IdentityList>}
     */
    listIdentities(queries?: string[], search?: string): Promise<Models.IdentityList>;
    /**
     * Delete identity
     *
     * Delete an identity by its unique ID.
     *
     * @param {string} identityId
     * @throws {AppcondaException}
     * @returns {Promise<{}>}
     */
    deleteIdentity(identityId: string): Promise<{}>;
    /**
     * Create user with MD5 password
     *
     * Create a new user. Password provided must be hashed with the [MD5](https://en.wikipedia.org/wiki/MD5) algorithm. Use the [POST /users](https://appconda.io/docs/server/users#usersCreate) endpoint to create users with a plain text password.
     *
     * @param {string} userId
     * @param {string} email
     * @param {string} password
     * @param {string} name
     * @throws {AppcondaException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    createMD5User<Preferences extends Models.Preferences>(userId: string, email: string, password: string, name?: string): Promise<Models.User<Preferences>>;
    /**
     * Create user with PHPass password
     *
     * Create a new user. Password provided must be hashed with the [PHPass](https://www.openwall.com/phpass/) algorithm. Use the [POST /users](https://appconda.io/docs/server/users#usersCreate) endpoint to create users with a plain text password.
     *
     * @param {string} userId
     * @param {string} email
     * @param {string} password
     * @param {string} name
     * @throws {AppcondaException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    createPHPassUser<Preferences extends Models.Preferences>(userId: string, email: string, password: string, name?: string): Promise<Models.User<Preferences>>;
    /**
     * Create user with Scrypt password
     *
     * Create a new user. Password provided must be hashed with the [Scrypt](https://github.com/Tarsnap/scrypt) algorithm. Use the [POST /users](https://appconda.io/docs/server/users#usersCreate) endpoint to create users with a plain text password.
     *
     * @param {string} userId
     * @param {string} email
     * @param {string} password
     * @param {string} passwordSalt
     * @param {number} passwordCpu
     * @param {number} passwordMemory
     * @param {number} passwordParallel
     * @param {number} passwordLength
     * @param {string} name
     * @throws {AppcondaException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    createScryptUser<Preferences extends Models.Preferences>(userId: string, email: string, password: string, passwordSalt: string, passwordCpu: number, passwordMemory: number, passwordParallel: number, passwordLength: number, name?: string): Promise<Models.User<Preferences>>;
    /**
     * Create user with Scrypt modified password
     *
     * Create a new user. Password provided must be hashed with the [Scrypt Modified](https://gist.github.com/Meldiron/eecf84a0225eccb5a378d45bb27462cc) algorithm. Use the [POST /users](https://appconda.io/docs/server/users#usersCreate) endpoint to create users with a plain text password.
     *
     * @param {string} userId
     * @param {string} email
     * @param {string} password
     * @param {string} passwordSalt
     * @param {string} passwordSaltSeparator
     * @param {string} passwordSignerKey
     * @param {string} name
     * @throws {AppcondaException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    createScryptModifiedUser<Preferences extends Models.Preferences>(userId: string, email: string, password: string, passwordSalt: string, passwordSaltSeparator: string, passwordSignerKey: string, name?: string): Promise<Models.User<Preferences>>;
    /**
     * Create user with SHA password
     *
     * Create a new user. Password provided must be hashed with the [SHA](https://en.wikipedia.org/wiki/Secure_Hash_Algorithm) algorithm. Use the [POST /users](https://appconda.io/docs/server/users#usersCreate) endpoint to create users with a plain text password.
     *
     * @param {string} userId
     * @param {string} email
     * @param {string} password
     * @param {PasswordHash} passwordVersion
     * @param {string} name
     * @throws {AppcondaException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    createSHAUser<Preferences extends Models.Preferences>(userId: string, email: string, password: string, passwordVersion?: PasswordHash, name?: string): Promise<Models.User<Preferences>>;
    /**
     * Get users usage stats
     *
     *
     * @param {UserUsageRange} range
     * @throws {AppcondaException}
     * @returns {Promise<Models.UsageUsers>}
     */
    getUsage(range?: UserUsageRange): Promise<Models.UsageUsers>;
    /**
     * Get user
     *
     * Get a user by its unique ID.
     *
     * @param {string} userId
     * @throws {AppcondaException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    get<Preferences extends Models.Preferences>(userId: string): Promise<Models.User<Preferences>>;
    /**
     * Delete user
     *
     * Delete a user by its unique ID, thereby releasing it&#039;s ID. Since ID is released and can be reused, all user-related resources like documents or storage files should be deleted before user deletion. If you want to keep ID reserved, use the [updateStatus](https://appconda.io/docs/server/users#usersUpdateStatus) endpoint instead.
     *
     * @param {string} userId
     * @throws {AppcondaException}
     * @returns {Promise<{}>}
     */
    delete(userId: string): Promise<{}>;
    /**
     * Update email
     *
     * Update the user email by its unique ID.
     *
     * @param {string} userId
     * @param {string} email
     * @throws {AppcondaException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    updateEmail<Preferences extends Models.Preferences>(userId: string, email: string): Promise<Models.User<Preferences>>;
    /**
     * Create user JWT
     *
     * Use this endpoint to create a JSON Web Token for user by its unique ID. You can use the resulting JWT to authenticate on behalf of the user. The JWT secret will become invalid if the session it uses gets deleted.
     *
     * @param {string} userId
     * @param {string} sessionId
     * @param {number} duration
     * @throws {AppcondaException}
     * @returns {Promise<Models.Jwt>}
     */
    createJWT(userId: string, sessionId?: string, duration?: number): Promise<Models.Jwt>;
    /**
     * Update user labels
     *
     * Update the user labels by its unique ID.

Labels can be used to grant access to resources. While teams are a way for user&#039;s to share access to a resource, labels can be defined by the developer to grant access without an invitation. See the [Permissions docs](https://appconda.io/docs/permissions) for more info.
     *
     * @param {string} userId
     * @param {string[]} labels
     * @throws {AppcondaException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    updateLabels<Preferences extends Models.Preferences>(userId: string, labels: string[]): Promise<Models.User<Preferences>>;
    /**
     * List user logs
     *
     * Get the user activity logs list by its unique ID.
     *
     * @param {string} userId
     * @param {string[]} queries
     * @throws {AppcondaException}
     * @returns {Promise<Models.LogList>}
     */
    listLogs(userId: string, queries?: string[]): Promise<Models.LogList>;
    /**
     * List user memberships
     *
     * Get the user membership list by its unique ID.
     *
     * @param {string} userId
     * @throws {AppcondaException}
     * @returns {Promise<Models.MembershipList>}
     */
    listMemberships(userId: string): Promise<Models.MembershipList>;
    /**
     * Update MFA
     *
     * Enable or disable MFA on a user account.
     *
     * @param {string} userId
     * @param {boolean} mfa
     * @throws {AppcondaException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    updateMfa<Preferences extends Models.Preferences>(userId: string, mfa: boolean): Promise<Models.User<Preferences>>;
    /**
     * Delete Authenticator
     *
     * Delete an authenticator app.
     *
     * @param {string} userId
     * @param {AuthenticatorType} type
     * @throws {AppcondaException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    deleteMfaAuthenticator<Preferences extends Models.Preferences>(userId: string, type: AuthenticatorType): Promise<Models.User<Preferences>>;
    /**
     * List Factors
     *
     * List the factors available on the account to be used as a MFA challange.
     *
     * @param {string} userId
     * @throws {AppcondaException}
     * @returns {Promise<Models.MfaFactors>}
     */
    listMfaFactors(userId: string): Promise<Models.MfaFactors>;
    /**
     * Get MFA Recovery Codes
     *
     * Get recovery codes that can be used as backup for MFA flow by User ID. Before getting codes, they must be generated using [createMfaRecoveryCodes](/docs/references/cloud/client-web/account#createMfaRecoveryCodes) method.
     *
     * @param {string} userId
     * @throws {AppcondaException}
     * @returns {Promise<Models.MfaRecoveryCodes>}
     */
    getMfaRecoveryCodes(userId: string): Promise<Models.MfaRecoveryCodes>;
    /**
     * Regenerate MFA Recovery Codes
     *
     * Regenerate recovery codes that can be used as backup for MFA flow by User ID. Before regenerating codes, they must be first generated using [createMfaRecoveryCodes](/docs/references/cloud/client-web/account#createMfaRecoveryCodes) method.
     *
     * @param {string} userId
     * @throws {AppcondaException}
     * @returns {Promise<Models.MfaRecoveryCodes>}
     */
    updateMfaRecoveryCodes(userId: string): Promise<Models.MfaRecoveryCodes>;
    /**
     * Create MFA Recovery Codes
     *
     * Generate recovery codes used as backup for MFA flow for User ID. Recovery codes can be used as a MFA verification type in [createMfaChallenge](/docs/references/cloud/client-web/account#createMfaChallenge) method by client SDK.
     *
     * @param {string} userId
     * @throws {AppcondaException}
     * @returns {Promise<Models.MfaRecoveryCodes>}
     */
    createMfaRecoveryCodes(userId: string): Promise<Models.MfaRecoveryCodes>;
    /**
     * Update name
     *
     * Update the user name by its unique ID.
     *
     * @param {string} userId
     * @param {string} name
     * @throws {AppcondaException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    updateName<Preferences extends Models.Preferences>(userId: string, name: string): Promise<Models.User<Preferences>>;
    /**
     * Update password
     *
     * Update the user password by its unique ID.
     *
     * @param {string} userId
     * @param {string} password
     * @throws {AppcondaException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    updatePassword<Preferences extends Models.Preferences>(userId: string, password: string): Promise<Models.User<Preferences>>;
    /**
     * Update phone
     *
     * Update the user phone by its unique ID.
     *
     * @param {string} userId
     * @param {string} number
     * @throws {AppcondaException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    updatePhone<Preferences extends Models.Preferences>(userId: string, number: string): Promise<Models.User<Preferences>>;
    /**
     * Get user preferences
     *
     * Get the user preferences by its unique ID.
     *
     * @param {string} userId
     * @throws {AppcondaException}
     * @returns {Promise<Preferences>}
     */
    getPrefs<Preferences extends Models.Preferences>(userId: string): Promise<Preferences>;
    /**
     * Update user preferences
     *
     * Update the user preferences by its unique ID. The object you pass is stored as is, and replaces any previous value. The maximum allowed prefs size is 64kB and throws error if exceeded.
     *
     * @param {string} userId
     * @param {object} prefs
     * @throws {AppcondaException}
     * @returns {Promise<Preferences>}
     */
    updatePrefs<Preferences extends Models.Preferences>(userId: string, prefs: object): Promise<Preferences>;
    /**
     * List user sessions
     *
     * Get the user sessions list by its unique ID.
     *
     * @param {string} userId
     * @throws {AppcondaException}
     * @returns {Promise<Models.SessionList>}
     */
    listSessions(userId: string): Promise<Models.SessionList>;
    /**
     * Create session
     *
     * Creates a session for a user. Returns an immediately usable session object.

If you want to generate a token for a custom authentication flow, use the [POST /users/{userId}/tokens](https://appconda.io/docs/server/users#createToken) endpoint.
     *
     * @param {string} userId
     * @throws {AppcondaException}
     * @returns {Promise<Models.Session>}
     */
    createSession(userId: string): Promise<Models.Session>;
    /**
     * Delete user sessions
     *
     * Delete all user&#039;s sessions by using the user&#039;s unique ID.
     *
     * @param {string} userId
     * @throws {AppcondaException}
     * @returns {Promise<{}>}
     */
    deleteSessions(userId: string): Promise<{}>;
    /**
     * Delete user session
     *
     * Delete a user sessions by its unique ID.
     *
     * @param {string} userId
     * @param {string} sessionId
     * @throws {AppcondaException}
     * @returns {Promise<{}>}
     */
    deleteSession(userId: string, sessionId: string): Promise<{}>;
    /**
     * Update user status
     *
     * Update the user status by its unique ID. Use this endpoint as an alternative to deleting a user if you want to keep user&#039;s ID reserved.
     *
     * @param {string} userId
     * @param {boolean} status
     * @throws {AppcondaException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    updateStatus<Preferences extends Models.Preferences>(userId: string, status: boolean): Promise<Models.User<Preferences>>;
    /**
     * List User Targets
     *
     * List the messaging targets that are associated with a user.
     *
     * @param {string} userId
     * @param {string[]} queries
     * @throws {AppcondaException}
     * @returns {Promise<Models.TargetList>}
     */
    listTargets(userId: string, queries?: string[]): Promise<Models.TargetList>;
    /**
     * Create User Target
     *
     * Create a messaging target.
     *
     * @param {string} userId
     * @param {string} targetId
     * @param {MessagingProviderType} providerType
     * @param {string} identifier
     * @param {string} providerId
     * @param {string} name
     * @throws {AppcondaException}
     * @returns {Promise<Models.Target>}
     */
    createTarget(userId: string, targetId: string, providerType: MessagingProviderType, identifier: string, providerId?: string, name?: string): Promise<Models.Target>;
    /**
     * Get User Target
     *
     * Get a user&#039;s push notification target by ID.
     *
     * @param {string} userId
     * @param {string} targetId
     * @throws {AppcondaException}
     * @returns {Promise<Models.Target>}
     */
    getTarget(userId: string, targetId: string): Promise<Models.Target>;
    /**
     * Update User target
     *
     * Update a messaging target.
     *
     * @param {string} userId
     * @param {string} targetId
     * @param {string} identifier
     * @param {string} providerId
     * @param {string} name
     * @throws {AppcondaException}
     * @returns {Promise<Models.Target>}
     */
    updateTarget(userId: string, targetId: string, identifier?: string, providerId?: string, name?: string): Promise<Models.Target>;
    /**
     * Delete user target
     *
     * Delete a messaging target.
     *
     * @param {string} userId
     * @param {string} targetId
     * @throws {AppcondaException}
     * @returns {Promise<{}>}
     */
    deleteTarget(userId: string, targetId: string): Promise<{}>;
    /**
     * Create token
     *
     * Returns a token with a secret key for creating a session. Use the user ID and secret and submit a request to the [PUT /account/sessions/token](https://appconda.io/docs/references/cloud/client-web/account#createSession) endpoint to complete the login process.

     *
     * @param {string} userId
     * @param {number} length
     * @param {number} expire
     * @throws {AppcondaException}
     * @returns {Promise<Models.Token>}
     */
    createToken(userId: string, length?: number, expire?: number): Promise<Models.Token>;
    /**
     * Update email verification
     *
     * Update the user email verification status by its unique ID.
     *
     * @param {string} userId
     * @param {boolean} emailVerification
     * @throws {AppcondaException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    updateEmailVerification<Preferences extends Models.Preferences>(userId: string, emailVerification: boolean): Promise<Models.User<Preferences>>;
    /**
     * Update phone verification
     *
     * Update the user phone verification status by its unique ID.
     *
     * @param {string} userId
     * @param {boolean} phoneVerification
     * @throws {AppcondaException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    updatePhoneVerification<Preferences extends Models.Preferences>(userId: string, phoneVerification: boolean): Promise<Models.User<Preferences>>;
}
