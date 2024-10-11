'use strict';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}

/**
 * Helper class to generate query strings.
 */
class Query {
    /**
     * Constructor for Query class.
     *
     * @param {string} method
     * @param {AttributesTypes} attribute
     * @param {QueryTypes} values
     */
    constructor(method, attribute, values) {
        this.method = method;
        this.attribute = attribute;
        if (values !== undefined) {
            if (Array.isArray(values)) {
                this.values = values;
            }
            else {
                this.values = [values];
            }
        }
    }
    /**
     * Convert the query object to a JSON string.
     *
     * @returns {string}
     */
    toString() {
        return JSON.stringify({
            method: this.method,
            attribute: this.attribute,
            values: this.values,
        });
    }
}
/**
 * Filter resources where attribute is equal to value.
 *
 * @param {string} attribute
 * @param {QueryTypes} value
 * @returns {string}
 */
Query.equal = (attribute, value) => new Query("equal", attribute, value).toString();
/**
 * Filter resources where attribute is not equal to value.
 *
 * @param {string} attribute
 * @param {QueryTypes} value
 * @returns {string}
 */
Query.notEqual = (attribute, value) => new Query("notEqual", attribute, value).toString();
/**
 * Filter resources where attribute is less than value.
 *
 * @param {string} attribute
 * @param {QueryTypes} value
 * @returns {string}
 */
Query.lessThan = (attribute, value) => new Query("lessThan", attribute, value).toString();
/**
 * Filter resources where attribute is less than or equal to value.
 *
 * @param {string} attribute
 * @param {QueryTypes} value
 * @returns {string}
 */
Query.lessThanEqual = (attribute, value) => new Query("lessThanEqual", attribute, value).toString();
/**
 * Filter resources where attribute is greater than value.
 *
 * @param {string} attribute
 * @param {QueryTypes} value
 * @returns {string}
 */
Query.greaterThan = (attribute, value) => new Query("greaterThan", attribute, value).toString();
/**
 * Filter resources where attribute is greater than or equal to value.
 *
 * @param {string} attribute
 * @param {QueryTypes} value
 * @returns {string}
 */
Query.greaterThanEqual = (attribute, value) => new Query("greaterThanEqual", attribute, value).toString();
/**
 * Filter resources where attribute is null.
 *
 * @param {string} attribute
 * @returns {string}
 */
Query.isNull = (attribute) => new Query("isNull", attribute).toString();
/**
 * Filter resources where attribute is not null.
 *
 * @param {string} attribute
 * @returns {string}
 */
Query.isNotNull = (attribute) => new Query("isNotNull", attribute).toString();
/**
 * Filter resources where attribute is between start and end (inclusive).
 *
 * @param {string} attribute
 * @param {string | number} start
 * @param {string | number} end
 * @returns {string}
 */
Query.between = (attribute, start, end) => new Query("between", attribute, [start, end]).toString();
/**
 * Filter resources where attribute starts with value.
 *
 * @param {string} attribute
 * @param {string} value
 * @returns {string}
 */
Query.startsWith = (attribute, value) => new Query("startsWith", attribute, value).toString();
/**
 * Filter resources where attribute ends with value.
 *
 * @param {string} attribute
 * @param {string} value
 * @returns {string}
 */
Query.endsWith = (attribute, value) => new Query("endsWith", attribute, value).toString();
/**
 * Specify which attributes should be returned by the API call.
 *
 * @param {string[]} attributes
 * @returns {string}
 */
Query.select = (attributes) => new Query("select", undefined, attributes).toString();
/**
 * Filter resources by searching attribute for value.
 * A fulltext index on attribute is required for this query to work.
 *
 * @param {string} attribute
 * @param {string} value
 * @returns {string}
 */
Query.search = (attribute, value) => new Query("search", attribute, value).toString();
/**
 * Sort results by attribute descending.
 *
 * @param {string} attribute
 * @returns {string}
 */
Query.orderDesc = (attribute) => new Query("orderDesc", attribute).toString();
/**
 * Sort results by attribute ascending.
 *
 * @param {string} attribute
 * @returns {string}
 */
Query.orderAsc = (attribute) => new Query("orderAsc", attribute).toString();
/**
 * Return results after documentId.
 *
 * @param {string} documentId
 * @returns {string}
 */
Query.cursorAfter = (documentId) => new Query("cursorAfter", undefined, documentId).toString();
/**
 * Return results before documentId.
 *
 * @param {string} documentId
 * @returns {string}
 */
Query.cursorBefore = (documentId) => new Query("cursorBefore", undefined, documentId).toString();
/**
 * Return only limit results.
 *
 * @param {number} limit
 * @returns {string}
 */
Query.limit = (limit) => new Query("limit", undefined, limit).toString();
/**
 * Filter resources by skipping the first offset results.
 *
 * @param {number} offset
 * @returns {string}
 */
Query.offset = (offset) => new Query("offset", undefined, offset).toString();
/**
 * Filter resources where attribute contains the specified value.
 *
 * @param {string} attribute
 * @param {string | string[]} value
 * @returns {string}
 */
Query.contains = (attribute, value) => new Query("contains", attribute, value).toString();
/**
 * Combine multiple queries using logical OR operator.
 *
 * @param {string[]} queries
 * @returns {string}
 */
Query.or = (queries) => new Query("or", undefined, queries.map((query) => JSON.parse(query))).toString();
/**
 * Combine multiple queries using logical AND operator.
 *
 * @param {string[]} queries
 * @returns {string}
 */
Query.and = (queries) => new Query("and", undefined, queries.map((query) => JSON.parse(query))).toString();

/**
 * Exception thrown by the  package
 */
class AppwriteException extends Error {
    /**
     * Initializes a Appconda Exception.
     *
     * @param {string} message - The error message.
     * @param {number} code - The error code. Default is 0.
     * @param {string} type - The error type. Default is an empty string.
     * @param {string} response - The response string. Default is an empty string.
     */
    constructor(message, code = 0, type = '', response = '') {
        super(message);
        this.name = 'AppwriteException';
        this.message = message;
        this.code = code;
        this.type = type;
        this.response = response;
    }
}
/**
 * Client that handles requests to Appconda
 */
class Client {
    constructor() {
        /**
         * Holds configuration such as project.
         */
        this.config = {
            endpoint: 'https://cloud.appconda.io/v1',
            endpointRealtime: '',
            project: '',
            key: '',
            jwt: '',
            locale: '',
            mode: '',
        };
        /**
         * Custom headers for API requests.
         */
        this.headers = {
            'x-sdk-name': 'Console',
            'x-sdk-platform': 'console',
            'x-sdk-language': 'web',
            'x-sdk-version': '1.0.1',
            'X-Appconda-Response-Format': '1.6.0',
        };
        this.realtime = {
            socket: undefined,
            timeout: undefined,
            url: '',
            channels: new Set(),
            subscriptions: new Map(),
            subscriptionsCounter: 0,
            reconnect: true,
            reconnectAttempts: 0,
            lastMessage: undefined,
            connect: () => {
                clearTimeout(this.realtime.timeout);
                this.realtime.timeout = window === null || window === void 0 ? void 0 : window.setTimeout(() => {
                    this.realtime.createSocket();
                }, 50);
            },
            getTimeout: () => {
                switch (true) {
                    case this.realtime.reconnectAttempts < 5:
                        return 1000;
                    case this.realtime.reconnectAttempts < 15:
                        return 5000;
                    case this.realtime.reconnectAttempts < 100:
                        return 10000;
                    default:
                        return 60000;
                }
            },
            createSocket: () => {
                var _a, _b, _c;
                if (this.realtime.channels.size < 1) {
                    this.realtime.reconnect = false;
                    (_a = this.realtime.socket) === null || _a === void 0 ? void 0 : _a.close();
                    return;
                }
                const channels = new URLSearchParams();
                channels.set('project', this.config.project);
                this.realtime.channels.forEach(channel => {
                    channels.append('channels[]', channel);
                });
                const url = this.config.endpointRealtime + '/realtime?' + channels.toString();
                if (url !== this.realtime.url || // Check if URL is present
                    !this.realtime.socket || // Check if WebSocket has not been created
                    ((_b = this.realtime.socket) === null || _b === void 0 ? void 0 : _b.readyState) > WebSocket.OPEN // Check if WebSocket is CLOSING (3) or CLOSED (4)
                ) {
                    if (this.realtime.socket &&
                        ((_c = this.realtime.socket) === null || _c === void 0 ? void 0 : _c.readyState) < WebSocket.CLOSING // Close WebSocket if it is CONNECTING (0) or OPEN (1)
                    ) {
                        this.realtime.reconnect = false;
                        this.realtime.socket.close();
                    }
                    this.realtime.url = url;
                    this.realtime.socket = new WebSocket(url);
                    this.realtime.socket.addEventListener('message', this.realtime.onMessage);
                    this.realtime.socket.addEventListener('open', _event => {
                        this.realtime.reconnectAttempts = 0;
                    });
                    this.realtime.socket.addEventListener('close', event => {
                        var _a, _b, _c;
                        if (!this.realtime.reconnect ||
                            (((_b = (_a = this.realtime) === null || _a === void 0 ? void 0 : _a.lastMessage) === null || _b === void 0 ? void 0 : _b.type) === 'error' && // Check if last message was of type error
                                ((_c = this.realtime) === null || _c === void 0 ? void 0 : _c.lastMessage.data).code === 1008 // Check for policy violation 1008
                            )) {
                            this.realtime.reconnect = true;
                            return;
                        }
                        const timeout = this.realtime.getTimeout();
                        console.error(`Realtime got disconnected. Reconnect will be attempted in ${timeout / 1000} seconds.`, event.reason);
                        setTimeout(() => {
                            this.realtime.reconnectAttempts++;
                            this.realtime.createSocket();
                        }, timeout);
                    });
                }
            },
            onMessage: (event) => {
                var _a, _b;
                try {
                    const message = JSON.parse(event.data);
                    this.realtime.lastMessage = message;
                    switch (message.type) {
                        case 'connected':
                            const cookie = JSON.parse((_a = window.localStorage.getItem('cookieFallback')) !== null && _a !== void 0 ? _a : '{}');
                            const session = cookie === null || cookie === void 0 ? void 0 : cookie[`a_session_${this.config.project}`];
                            const messageData = message.data;
                            if (session && !messageData.user) {
                                (_b = this.realtime.socket) === null || _b === void 0 ? void 0 : _b.send(JSON.stringify({
                                    type: 'authentication',
                                    data: {
                                        session
                                    }
                                }));
                            }
                            break;
                        case 'event':
                            let data = message.data;
                            if (data === null || data === void 0 ? void 0 : data.channels) {
                                const isSubscribed = data.channels.some(channel => this.realtime.channels.has(channel));
                                if (!isSubscribed)
                                    return;
                                this.realtime.subscriptions.forEach(subscription => {
                                    if (data.channels.some(channel => subscription.channels.includes(channel))) {
                                        setTimeout(() => subscription.callback(data));
                                    }
                                });
                            }
                            break;
                        case 'error':
                            throw message.data;
                        default:
                            break;
                    }
                }
                catch (e) {
                    console.error(e);
                }
            },
            cleanUp: channels => {
                this.realtime.channels.forEach(channel => {
                    if (channels.includes(channel)) {
                        let found = Array.from(this.realtime.subscriptions).some(([_key, subscription]) => {
                            return subscription.channels.includes(channel);
                        });
                        if (!found) {
                            this.realtime.channels.delete(channel);
                        }
                    }
                });
            }
        };
    }
    /**
     * Set Endpoint
     *
     * Your project endpoint
     *
     * @param {string} endpoint
     *
     * @returns {this}
     */
    setEndpoint(endpoint) {
        this.config.endpoint = endpoint;
        this.config.endpointRealtime = this.config.endpointRealtime || this.config.endpoint.replace('https://', 'wss://').replace('http://', 'ws://');
        return this;
    }
    /**
     * Set Realtime Endpoint
     *
     * @param {string} endpointRealtime
     *
     * @returns {this}
     */
    setEndpointRealtime(endpointRealtime) {
        this.config.endpointRealtime = endpointRealtime;
        return this;
    }
    /**
     * Set Project
     *
     * Your project ID
     *
     * @param value string
     *
     * @return {this}
     */
    setProject(value) {
        this.headers['X-Appconda-Project'] = value;
        this.config.project = value;
        return this;
    }
    /**
     * Set Key
     *
     * Your secret API key
     *
     * @param value string
     *
     * @return {this}
     */
    setKey(value) {
        this.headers['X-Appconda-Key'] = value;
        this.config.key = value;
        return this;
    }
    /**
     * Set JWT
     *
     * Your secret JSON Web Token
     *
     * @param value string
     *
     * @return {this}
     */
    setJWT(value) {
        this.headers['X-Appconda-JWT'] = value;
        this.config.jwt = value;
        return this;
    }
    /**
     * Set Locale
     *
     * @param value string
     *
     * @return {this}
     */
    setLocale(value) {
        this.headers['X-Appconda-Locale'] = value;
        this.config.locale = value;
        return this;
    }
    /**
     * Set Mode
     *
     * @param value string
     *
     * @return {this}
     */
    setMode(value) {
        this.headers['X-Appconda-Mode'] = value;
        this.config.mode = value;
        return this;
    }
    /**
     * Subscribes to Appconda events and passes you the payload in realtime.
     *
     * @param {string|string[]} channels
     * Channel to subscribe - pass a single channel as a string or multiple with an array of strings.
     *
     * Possible channels are:
     * - account
     * - collections
     * - collections.[ID]
     * - collections.[ID].documents
     * - documents
     * - documents.[ID]
     * - files
     * - files.[ID]
     * - executions
     * - executions.[ID]
     * - functions.[ID]
     * - teams
     * - teams.[ID]
     * - memberships
     * - memberships.[ID]
     * @param {(payload: RealtimeMessage) => void} callback Is called on every realtime update.
     * @returns {() => void} Unsubscribes from events.
     */
    subscribe(channels, callback) {
        let channelArray = typeof channels === 'string' ? [channels] : channels;
        channelArray.forEach(channel => this.realtime.channels.add(channel));
        const counter = this.realtime.subscriptionsCounter++;
        this.realtime.subscriptions.set(counter, {
            channels: channelArray,
            callback
        });
        this.realtime.connect();
        return () => {
            this.realtime.subscriptions.delete(counter);
            this.realtime.cleanUp(channelArray);
            this.realtime.connect();
        };
    }
    prepareRequest(method, url, headers = {}, params = {}) {
        method = method.toUpperCase();
        headers = Object.assign({}, this.headers, headers);
        if (typeof window !== 'undefined' && window.localStorage) {
            const cookieFallback = window.localStorage.getItem('cookieFallback');
            if (cookieFallback) {
                headers['X-Fallback-Cookies'] = cookieFallback;
            }
        }
        let options = {
            method,
            headers,
        };
        if (method === 'GET') {
            for (const [key, value] of Object.entries(Client.flatten(params))) {
                url.searchParams.append(key, value);
            }
        }
        else {
            switch (headers['content-type']) {
                case 'application/json':
                    options.body = JSON.stringify(params);
                    break;
                case 'multipart/form-data':
                    const formData = new FormData();
                    for (const [key, value] of Object.entries(params)) {
                        if (value instanceof File) {
                            formData.append(key, value, value.name);
                        }
                        else if (Array.isArray(value)) {
                            for (const nestedValue of value) {
                                formData.append(`${key}[]`, nestedValue);
                            }
                        }
                        else {
                            formData.append(key, value);
                        }
                    }
                    options.body = formData;
                    delete headers['content-type'];
                    break;
            }
        }
        return { uri: url.toString(), options };
    }
    chunkedUpload(method, url, headers = {}, originalPayload = {}, onProgress) {
        return __awaiter(this, void 0, void 0, function* () {
            const file = Object.values(originalPayload).find((value) => value instanceof File);
            if (file.size <= Client.CHUNK_SIZE) {
                return yield this.call(method, url, headers, originalPayload);
            }
            let start = 0;
            let response = null;
            while (start < file.size) {
                let end = start + Client.CHUNK_SIZE; // Prepare end for the next chunk
                if (end >= file.size) {
                    end = file.size; // Adjust for the last chunk to include the last byte
                }
                headers['content-range'] = `bytes ${start}-${end - 1}/${file.size}`;
                const chunk = file.slice(start, end);
                let payload = Object.assign(Object.assign({}, originalPayload), { file: new File([chunk], file.name) });
                response = yield this.call(method, url, headers, payload);
                if (onProgress && typeof onProgress === 'function') {
                    onProgress({
                        $id: response.$id,
                        progress: Math.round((end / file.size) * 100),
                        sizeUploaded: end,
                        chunksTotal: Math.ceil(file.size / Client.CHUNK_SIZE),
                        chunksUploaded: Math.ceil(end / Client.CHUNK_SIZE)
                    });
                }
                if (response && response.$id) {
                    headers['x-appconda-id'] = response.$id;
                }
                start = end;
            }
            return response;
        });
    }
    call(method, url, headers = {}, params = {}, responseType = 'json') {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { uri, options } = this.prepareRequest(method, url, headers, params);
            let data = null;
            const response = yield fetch(uri, options);
            const warnings = response.headers.get('x-appconda-warning');
            if (warnings) {
                warnings.split(';').forEach((warning) => console.warn('Warning: ' + warning));
            }
            if ((_a = response.headers.get('content-type')) === null || _a === void 0 ? void 0 : _a.includes('application/json')) {
                data = yield response.json();
            }
            else if (responseType === 'arrayBuffer') {
                data = yield response.arrayBuffer();
            }
            else {
                data = {
                    message: yield response.text()
                };
            }
            if (400 <= response.status) {
                throw new AppwriteException(data === null || data === void 0 ? void 0 : data.message, response.status, data === null || data === void 0 ? void 0 : data.type, data);
            }
            const cookieFallback = response.headers.get('X-Fallback-Cookies');
            if (typeof window !== 'undefined' && window.localStorage && cookieFallback) {
                window.console.warn('Appconda is using localStorage for session management. Increase your security by adding a custom domain as your API endpoint.');
                window.localStorage.setItem('cookieFallback', cookieFallback);
            }
            return data;
        });
    }
    static flatten(data, prefix = '') {
        let output = {};
        for (const [key, value] of Object.entries(data)) {
            let finalKey = prefix ? prefix + '[' + key + ']' : key;
            if (Array.isArray(value)) {
                output = Object.assign(Object.assign({}, output), Client.flatten(value, finalKey));
            }
            else {
                output[finalKey] = value;
            }
        }
        return output;
    }
}
Client.CHUNK_SIZE = 1024 * 1024 * 5;

class Service {
    constructor(client) {
        this.client = client;
    }
    static flatten(data, prefix = '') {
        let output = {};
        for (const [key, value] of Object.entries(data)) {
            let finalKey = prefix ? prefix + '[' + key + ']' : key;
            if (Array.isArray(value)) {
                output = Object.assign(Object.assign({}, output), Service.flatten(value, finalKey));
            }
            else {
                output[finalKey] = value;
            }
        }
        return output;
    }
}
/**
 * The size for chunked uploads in bytes.
 */
Service.CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

class Account {
    constructor(client) {
        this.client = client;
    }
    /**
     * Get account
     *
     * Get the currently logged in user.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    get() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/account';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Create account
     *
     * Use this endpoint to allow a new user to register a new account in your project. After the user registration completes successfully, you can use the [/account/verfication](https://appconda.io/docs/references/cloud/client-web/account#createVerification) route to start verifying the user email address. To allow the new user to login to their new account, you need to create a new [account session](https://appconda.io/docs/references/cloud/client-web/account#createEmailSession).
     *
     * @param {string} userId
     * @param {string} email
     * @param {string} password
     * @param {string} name
     * @throws {AppwriteException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    create(userId, email, password, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof email === 'undefined') {
                throw new AppwriteException('Missing required parameter: "email"');
            }
            if (typeof password === 'undefined') {
                throw new AppwriteException('Missing required parameter: "password"');
            }
            const apiPath = '/account';
            const payload = {};
            if (typeof userId !== 'undefined') {
                payload['userId'] = userId;
            }
            if (typeof email !== 'undefined') {
                payload['email'] = email;
            }
            if (typeof password !== 'undefined') {
                payload['password'] = password;
            }
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete account
     *
     * Delete the currently logged in user.
     *
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    delete() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/account';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * Update email
     *
     * Update currently logged in user account email address. After changing user address, the user confirmation status will get reset. A new confirmation email is not sent automatically however you can use the send confirmation email endpoint again to send the confirmation email. For security measures, user password is required to complete this request.
This endpoint can also be used to convert an anonymous account to a normal one, by passing an email address and a new password.

     *
     * @param {string} email
     * @param {string} password
     * @throws {AppwriteException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    updateEmail(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof email === 'undefined') {
                throw new AppwriteException('Missing required parameter: "email"');
            }
            if (typeof password === 'undefined') {
                throw new AppwriteException('Missing required parameter: "password"');
            }
            const apiPath = '/account/email';
            const payload = {};
            if (typeof email !== 'undefined') {
                payload['email'] = email;
            }
            if (typeof password !== 'undefined') {
                payload['password'] = password;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * List Identities
     *
     * Get the list of identities for the currently logged in user.
     *
     * @param {string[]} queries
     * @throws {AppwriteException}
     * @returns {Promise<Models.IdentityList>}
     */
    listIdentities(queries) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/account/identities';
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete identity
     *
     * Delete an identity by its unique ID.
     *
     * @param {string} identityId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteIdentity(identityId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof identityId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "identityId"');
            }
            const apiPath = '/account/identities/{identityId}'.replace('{identityId}', identityId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * Create JWT
     *
     * Use this endpoint to create a JSON Web Token. You can use the resulting JWT to authenticate on behalf of the current user when working with the Appconda server-side API and SDKs. The JWT secret is valid for 15 minutes from its creation and will be invalid if the user will logout in that time frame.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.Jwt>}
     */
    createJWT() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/account/jwts';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * List logs
     *
     * Get the list of latest security activity logs for the currently logged in user. Each log returns user IP address, location and date and time of log.
     *
     * @param {string[]} queries
     * @throws {AppwriteException}
     * @returns {Promise<Models.LogList>}
     */
    listLogs(queries) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/account/logs';
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Update MFA
     *
     * Enable or disable MFA on an account.
     *
     * @param {boolean} mfa
     * @throws {AppwriteException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    updateMFA(mfa) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof mfa === 'undefined') {
                throw new AppwriteException('Missing required parameter: "mfa"');
            }
            const apiPath = '/account/mfa';
            const payload = {};
            if (typeof mfa !== 'undefined') {
                payload['mfa'] = mfa;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Create Authenticator
     *
     * Add an authenticator app to be used as an MFA factor. Verify the authenticator using the [verify authenticator](/docs/references/cloud/client-web/account#updateMfaAuthenticator) method.
     *
     * @param {AuthenticatorType} type
     * @throws {AppwriteException}
     * @returns {Promise<Models.MfaType>}
     */
    createMfaAuthenticator(type) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof type === 'undefined') {
                throw new AppwriteException('Missing required parameter: "type"');
            }
            const apiPath = '/account/mfa/authenticators/{type}'.replace('{type}', type);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Verify Authenticator
     *
     * Verify an authenticator app after adding it using the [add authenticator](/docs/references/cloud/client-web/account#createMfaAuthenticator) method.
     *
     * @param {AuthenticatorType} type
     * @param {string} otp
     * @throws {AppwriteException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    updateMfaAuthenticator(type, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof type === 'undefined') {
                throw new AppwriteException('Missing required parameter: "type"');
            }
            if (typeof otp === 'undefined') {
                throw new AppwriteException('Missing required parameter: "otp"');
            }
            const apiPath = '/account/mfa/authenticators/{type}'.replace('{type}', type);
            const payload = {};
            if (typeof otp !== 'undefined') {
                payload['otp'] = otp;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('put', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete Authenticator
     *
     * Delete an authenticator for a user by ID.
     *
     * @param {AuthenticatorType} type
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteMfaAuthenticator(type) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof type === 'undefined') {
                throw new AppwriteException('Missing required parameter: "type"');
            }
            const apiPath = '/account/mfa/authenticators/{type}'.replace('{type}', type);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * Create MFA Challenge
     *
     * Begin the process of MFA verification after sign-in. Finish the flow with [updateMfaChallenge](/docs/references/cloud/client-web/account#updateMfaChallenge) method.
     *
     * @param {AuthenticationFactor} factor
     * @throws {AppwriteException}
     * @returns {Promise<Models.MfaChallenge>}
     */
    createMfaChallenge(factor) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof factor === 'undefined') {
                throw new AppwriteException('Missing required parameter: "factor"');
            }
            const apiPath = '/account/mfa/challenge';
            const payload = {};
            if (typeof factor !== 'undefined') {
                payload['factor'] = factor;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Create MFA Challenge (confirmation)
     *
     * Complete the MFA challenge by providing the one-time password. Finish the process of MFA verification by providing the one-time password. To begin the flow, use [createMfaChallenge](/docs/references/cloud/client-web/account#createMfaChallenge) method.
     *
     * @param {string} challengeId
     * @param {string} otp
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    updateMfaChallenge(challengeId, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof challengeId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "challengeId"');
            }
            if (typeof otp === 'undefined') {
                throw new AppwriteException('Missing required parameter: "otp"');
            }
            const apiPath = '/account/mfa/challenge';
            const payload = {};
            if (typeof challengeId !== 'undefined') {
                payload['challengeId'] = challengeId;
            }
            if (typeof otp !== 'undefined') {
                payload['otp'] = otp;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('put', uri, apiHeaders, payload);
        });
    }
    /**
     * List Factors
     *
     * List the factors available on the account to be used as a MFA challange.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.MfaFactors>}
     */
    listMfaFactors() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/account/mfa/factors';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get MFA Recovery Codes
     *
     * Get recovery codes that can be used as backup for MFA flow. Before getting codes, they must be generated using [createMfaRecoveryCodes](/docs/references/cloud/client-web/account#createMfaRecoveryCodes) method. An OTP challenge is required to read recovery codes.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.MfaRecoveryCodes>}
     */
    getMfaRecoveryCodes() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/account/mfa/recovery-codes';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Create MFA Recovery Codes
     *
     * Generate recovery codes as backup for MFA flow. It&#039;s recommended to generate and show then immediately after user successfully adds their authehticator. Recovery codes can be used as a MFA verification type in [createMfaChallenge](/docs/references/cloud/client-web/account#createMfaChallenge) method.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.MfaRecoveryCodes>}
     */
    createMfaRecoveryCodes() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/account/mfa/recovery-codes';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Regenerate MFA Recovery Codes
     *
     * Regenerate recovery codes that can be used as backup for MFA flow. Before regenerating codes, they must be first generated using [createMfaRecoveryCodes](/docs/references/cloud/client-web/account#createMfaRecoveryCodes) method. An OTP challenge is required to regenreate recovery codes.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.MfaRecoveryCodes>}
     */
    updateMfaRecoveryCodes() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/account/mfa/recovery-codes';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Update name
     *
     * Update currently logged in user account name.
     *
     * @param {string} name
     * @throws {AppwriteException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    updateName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            const apiPath = '/account/name';
            const payload = {};
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Update password
     *
     * Update currently logged in user password. For validation, user is required to pass in the new password, and the old password. For users created with OAuth, Team Invites and Magic URL, oldPassword is optional.
     *
     * @param {string} password
     * @param {string} oldPassword
     * @throws {AppwriteException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    updatePassword(password, oldPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof password === 'undefined') {
                throw new AppwriteException('Missing required parameter: "password"');
            }
            const apiPath = '/account/password';
            const payload = {};
            if (typeof password !== 'undefined') {
                payload['password'] = password;
            }
            if (typeof oldPassword !== 'undefined') {
                payload['oldPassword'] = oldPassword;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Update phone
     *
     * Update the currently logged in user&#039;s phone number. After updating the phone number, the phone verification status will be reset. A confirmation SMS is not sent automatically, however you can use the [POST /account/verification/phone](https://appconda.io/docs/references/cloud/client-web/account#createPhoneVerification) endpoint to send a confirmation SMS.
     *
     * @param {string} phone
     * @param {string} password
     * @throws {AppwriteException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    updatePhone(phone, password) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof phone === 'undefined') {
                throw new AppwriteException('Missing required parameter: "phone"');
            }
            if (typeof password === 'undefined') {
                throw new AppwriteException('Missing required parameter: "password"');
            }
            const apiPath = '/account/phone';
            const payload = {};
            if (typeof phone !== 'undefined') {
                payload['phone'] = phone;
            }
            if (typeof password !== 'undefined') {
                payload['password'] = password;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Get account preferences
     *
     * Get the preferences as a key-value object for the currently logged in user.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Preferences>}
     */
    getPrefs() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/account/prefs';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Update preferences
     *
     * Update currently logged in user account preferences. The object you pass is stored as is, and replaces any previous value. The maximum allowed prefs size is 64kB and throws error if exceeded.
     *
     * @param {Partial<Preferences>} prefs
     * @throws {AppwriteException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    updatePrefs(prefs) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof prefs === 'undefined') {
                throw new AppwriteException('Missing required parameter: "prefs"');
            }
            const apiPath = '/account/prefs';
            const payload = {};
            if (typeof prefs !== 'undefined') {
                payload['prefs'] = prefs;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Create password recovery
     *
     * Sends the user an email with a temporary secret key for password reset. When the user clicks the confirmation link he is redirected back to your app password reset URL with the secret key and email address values attached to the URL query string. Use the query string params to submit a request to the [PUT /account/recovery](https://appconda.io/docs/references/cloud/client-web/account#updateRecovery) endpoint to complete the process. The verification link sent to the user&#039;s email address is valid for 1 hour.
     *
     * @param {string} email
     * @param {string} url
     * @throws {AppwriteException}
     * @returns {Promise<Models.Token>}
     */
    createRecovery(email, url) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof email === 'undefined') {
                throw new AppwriteException('Missing required parameter: "email"');
            }
            if (typeof url === 'undefined') {
                throw new AppwriteException('Missing required parameter: "url"');
            }
            const apiPath = '/account/recovery';
            const payload = {};
            if (typeof email !== 'undefined') {
                payload['email'] = email;
            }
            if (typeof url !== 'undefined') {
                payload['url'] = url;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Create password recovery (confirmation)
     *
     * Use this endpoint to complete the user account password reset. Both the **userId** and **secret** arguments will be passed as query parameters to the redirect URL you have provided when sending your request to the [POST /account/recovery](https://appconda.io/docs/references/cloud/client-web/account#createRecovery) endpoint.

Please note that in order to avoid a [Redirect Attack](https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.md) the only valid redirect URLs are the ones from domains you have set when adding your platforms in the console interface.
     *
     * @param {string} userId
     * @param {string} secret
     * @param {string} password
     * @throws {AppwriteException}
     * @returns {Promise<Models.Token>}
     */
    updateRecovery(userId, secret, password) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof secret === 'undefined') {
                throw new AppwriteException('Missing required parameter: "secret"');
            }
            if (typeof password === 'undefined') {
                throw new AppwriteException('Missing required parameter: "password"');
            }
            const apiPath = '/account/recovery';
            const payload = {};
            if (typeof userId !== 'undefined') {
                payload['userId'] = userId;
            }
            if (typeof secret !== 'undefined') {
                payload['secret'] = secret;
            }
            if (typeof password !== 'undefined') {
                payload['password'] = password;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('put', uri, apiHeaders, payload);
        });
    }
    /**
     * List sessions
     *
     * Get the list of active sessions across different devices for the currently logged in user.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.SessionList>}
     */
    listSessions() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/account/sessions';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete sessions
     *
     * Delete all sessions from the user account and remove any sessions cookies from the end client.
     *
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteSessions() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/account/sessions';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * Create anonymous session
     *
     * Use this endpoint to allow a new user to register an anonymous account in your project. This route will also create a new session for the user. To allow the new user to convert an anonymous account to a normal account, you need to update its [email and password](https://appconda.io/docs/references/cloud/client-web/account#updateEmail) or create an [OAuth2 session](https://appconda.io/docs/references/cloud/client-web/account#CreateOAuth2Session).
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.Session>}
     */
    createAnonymousSession() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/account/sessions/anonymous';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Create email password session
     *
     * Allow the user to login into their account by providing a valid email and password combination. This route will create a new session for the user.

A user is limited to 10 active sessions at a time by default. [Learn more about session limits](https://appconda.io/docs/authentication-security#limits).
     *
     * @param {string} email
     * @param {string} password
     * @throws {AppwriteException}
     * @returns {Promise<Models.Session>}
     */
    createEmailPasswordSession(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof email === 'undefined') {
                throw new AppwriteException('Missing required parameter: "email"');
            }
            if (typeof password === 'undefined') {
                throw new AppwriteException('Missing required parameter: "password"');
            }
            const apiPath = '/account/sessions/email';
            const payload = {};
            if (typeof email !== 'undefined') {
                payload['email'] = email;
            }
            if (typeof password !== 'undefined') {
                payload['password'] = password;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Update magic URL session
     *
     * Use this endpoint to create a session from token. Provide the **userId** and **secret** parameters from the successful response of authentication flows initiated by token creation. For example, magic URL and phone login.
     *
     * @param {string} userId
     * @param {string} secret
     * @throws {AppwriteException}
     * @returns {Promise<Models.Session>}
     */
    updateMagicURLSession(userId, secret) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof secret === 'undefined') {
                throw new AppwriteException('Missing required parameter: "secret"');
            }
            const apiPath = '/account/sessions/magic-url';
            const payload = {};
            if (typeof userId !== 'undefined') {
                payload['userId'] = userId;
            }
            if (typeof secret !== 'undefined') {
                payload['secret'] = secret;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('put', uri, apiHeaders, payload);
        });
    }
    /**
     * Create OAuth2 session
     *
     * Allow the user to login to their account using the OAuth2 provider of their choice. Each OAuth2 provider should be enabled from the Appconda console first. Use the success and failure arguments to provide a redirect URL&#039;s back to your app when login is completed.

If there is already an active session, the new session will be attached to the logged-in account. If there are no active sessions, the server will attempt to look for a user with the same email address as the email received from the OAuth2 provider and attach the new session to the existing user. If no matching user is found - the server will create a new user.

A user is limited to 10 active sessions at a time by default. [Learn more about session limits](https://appconda.io/docs/authentication-security#limits).

     *
     * @param {OAuthProvider} provider
     * @param {string} success
     * @param {string} failure
     * @param {string[]} scopes
     * @throws {AppwriteException}
     * @returns {Promise<void | string>}
     */
    createOAuth2Session(provider, success, failure, scopes) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof provider === 'undefined') {
                throw new AppwriteException('Missing required parameter: "provider"');
            }
            const apiPath = '/account/sessions/oauth2/{provider}'.replace('{provider}', provider);
            const payload = {};
            if (typeof success !== 'undefined') {
                payload['success'] = success;
            }
            if (typeof failure !== 'undefined') {
                payload['failure'] = failure;
            }
            if (typeof scopes !== 'undefined') {
                payload['scopes'] = scopes;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            payload['project'] = this.client.config.project;
            for (const [key, value] of Object.entries(Service.flatten(payload))) {
                uri.searchParams.append(key, value);
            }
            if (typeof window !== 'undefined' && (window === null || window === void 0 ? void 0 : window.location)) {
                window.location.href = uri.toString();
                return;
            }
            else {
                return uri.toString();
            }
        });
    }
    /**
     * Update phone session
     *
     * Use this endpoint to create a session from token. Provide the **userId** and **secret** parameters from the successful response of authentication flows initiated by token creation. For example, magic URL and phone login.
     *
     * @param {string} userId
     * @param {string} secret
     * @throws {AppwriteException}
     * @returns {Promise<Models.Session>}
     */
    updatePhoneSession(userId, secret) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof secret === 'undefined') {
                throw new AppwriteException('Missing required parameter: "secret"');
            }
            const apiPath = '/account/sessions/phone';
            const payload = {};
            if (typeof userId !== 'undefined') {
                payload['userId'] = userId;
            }
            if (typeof secret !== 'undefined') {
                payload['secret'] = secret;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('put', uri, apiHeaders, payload);
        });
    }
    /**
     * Create session
     *
     * Use this endpoint to create a session from token. Provide the **userId** and **secret** parameters from the successful response of authentication flows initiated by token creation. For example, magic URL and phone login.
     *
     * @param {string} userId
     * @param {string} secret
     * @throws {AppwriteException}
     * @returns {Promise<Models.Session>}
     */
    createSession(userId, secret) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof secret === 'undefined') {
                throw new AppwriteException('Missing required parameter: "secret"');
            }
            const apiPath = '/account/sessions/token';
            const payload = {};
            if (typeof userId !== 'undefined') {
                payload['userId'] = userId;
            }
            if (typeof secret !== 'undefined') {
                payload['secret'] = secret;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Get session
     *
     * Use this endpoint to get a logged in user&#039;s session using a Session ID. Inputting &#039;current&#039; will return the current session being used.
     *
     * @param {string} sessionId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Session>}
     */
    getSession(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof sessionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "sessionId"');
            }
            const apiPath = '/account/sessions/{sessionId}'.replace('{sessionId}', sessionId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Update session
     *
     * Use this endpoint to extend a session&#039;s length. Extending a session is useful when session expiry is short. If the session was created using an OAuth provider, this endpoint refreshes the access token from the provider.
     *
     * @param {string} sessionId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Session>}
     */
    updateSession(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof sessionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "sessionId"');
            }
            const apiPath = '/account/sessions/{sessionId}'.replace('{sessionId}', sessionId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete session
     *
     * Logout the user. Use &#039;current&#039; as the session ID to logout on this device, use a session ID to logout on another device. If you&#039;re looking to logout the user on all devices, use [Delete Sessions](https://appconda.io/docs/references/cloud/client-web/account#deleteSessions) instead.
     *
     * @param {string} sessionId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteSession(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof sessionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "sessionId"');
            }
            const apiPath = '/account/sessions/{sessionId}'.replace('{sessionId}', sessionId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * Update status
     *
     * Block the currently logged in user account. Behind the scene, the user record is not deleted but permanently blocked from any access. To completely delete a user, use the Users API instead.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    updateStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/account/status';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Create push target
     *
     *
     * @param {string} targetId
     * @param {string} identifier
     * @param {string} providerId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Target>}
     */
    createPushTarget(targetId, identifier, providerId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof targetId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "targetId"');
            }
            if (typeof identifier === 'undefined') {
                throw new AppwriteException('Missing required parameter: "identifier"');
            }
            const apiPath = '/account/targets/push';
            const payload = {};
            if (typeof targetId !== 'undefined') {
                payload['targetId'] = targetId;
            }
            if (typeof identifier !== 'undefined') {
                payload['identifier'] = identifier;
            }
            if (typeof providerId !== 'undefined') {
                payload['providerId'] = providerId;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Update push target
     *
     *
     * @param {string} targetId
     * @param {string} identifier
     * @throws {AppwriteException}
     * @returns {Promise<Models.Target>}
     */
    updatePushTarget(targetId, identifier) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof targetId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "targetId"');
            }
            if (typeof identifier === 'undefined') {
                throw new AppwriteException('Missing required parameter: "identifier"');
            }
            const apiPath = '/account/targets/{targetId}/push'.replace('{targetId}', targetId);
            const payload = {};
            if (typeof identifier !== 'undefined') {
                payload['identifier'] = identifier;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('put', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete push target
     *
     *
     * @param {string} targetId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deletePushTarget(targetId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof targetId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "targetId"');
            }
            const apiPath = '/account/targets/{targetId}/push'.replace('{targetId}', targetId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * Create email token (OTP)
     *
     * Sends the user an email with a secret key for creating a session. If the provided user ID has not be registered, a new user will be created. Use the returned user ID and secret and submit a request to the [POST /v1/account/sessions/token](https://appconda.io/docs/references/cloud/client-web/account#createSession) endpoint to complete the login process. The secret sent to the user&#039;s email is valid for 15 minutes.

A user is limited to 10 active sessions at a time by default. [Learn more about session limits](https://appconda.io/docs/authentication-security#limits).
     *
     * @param {string} userId
     * @param {string} email
     * @param {boolean} phrase
     * @throws {AppwriteException}
     * @returns {Promise<Models.Token>}
     */
    createEmailToken(userId, email, phrase) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof email === 'undefined') {
                throw new AppwriteException('Missing required parameter: "email"');
            }
            const apiPath = '/account/tokens/email';
            const payload = {};
            if (typeof userId !== 'undefined') {
                payload['userId'] = userId;
            }
            if (typeof email !== 'undefined') {
                payload['email'] = email;
            }
            if (typeof phrase !== 'undefined') {
                payload['phrase'] = phrase;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Create magic URL token
     *
     * Sends the user an email with a secret key for creating a session. If the provided user ID has not been registered, a new user will be created. When the user clicks the link in the email, the user is redirected back to the URL you provided with the secret key and userId values attached to the URL query string. Use the query string parameters to submit a request to the [POST /v1/account/sessions/token](https://appconda.io/docs/references/cloud/client-web/account#createSession) endpoint to complete the login process. The link sent to the user&#039;s email address is valid for 1 hour. If you are on a mobile device you can leave the URL parameter empty, so that the login completion will be handled by your Appconda instance by default.

A user is limited to 10 active sessions at a time by default. [Learn more about session limits](https://appconda.io/docs/authentication-security#limits).

     *
     * @param {string} userId
     * @param {string} email
     * @param {string} url
     * @param {boolean} phrase
     * @throws {AppwriteException}
     * @returns {Promise<Models.Token>}
     */
    createMagicURLToken(userId, email, url, phrase) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof email === 'undefined') {
                throw new AppwriteException('Missing required parameter: "email"');
            }
            const apiPath = '/account/tokens/magic-url';
            const payload = {};
            if (typeof userId !== 'undefined') {
                payload['userId'] = userId;
            }
            if (typeof email !== 'undefined') {
                payload['email'] = email;
            }
            if (typeof url !== 'undefined') {
                payload['url'] = url;
            }
            if (typeof phrase !== 'undefined') {
                payload['phrase'] = phrase;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Create OAuth2 token
     *
     * Allow the user to login to their account using the OAuth2 provider of their choice. Each OAuth2 provider should be enabled from the Appconda console first. Use the success and failure arguments to provide a redirect URL&#039;s back to your app when login is completed.

If authentication succeeds, `userId` and `secret` of a token will be appended to the success URL as query parameters. These can be used to create a new session using the [Create session](https://appconda.io/docs/references/cloud/client-web/account#createSession) endpoint.

A user is limited to 10 active sessions at a time by default. [Learn more about session limits](https://appconda.io/docs/authentication-security#limits).
     *
     * @param {OAuthProvider} provider
     * @param {string} success
     * @param {string} failure
     * @param {string[]} scopes
     * @throws {AppwriteException}
     * @returns {Promise<void | string>}
     */
    createOAuth2Token(provider, success, failure, scopes) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof provider === 'undefined') {
                throw new AppwriteException('Missing required parameter: "provider"');
            }
            const apiPath = '/account/tokens/oauth2/{provider}'.replace('{provider}', provider);
            const payload = {};
            if (typeof success !== 'undefined') {
                payload['success'] = success;
            }
            if (typeof failure !== 'undefined') {
                payload['failure'] = failure;
            }
            if (typeof scopes !== 'undefined') {
                payload['scopes'] = scopes;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            payload['project'] = this.client.config.project;
            for (const [key, value] of Object.entries(Service.flatten(payload))) {
                uri.searchParams.append(key, value);
            }
            if (typeof window !== 'undefined' && (window === null || window === void 0 ? void 0 : window.location)) {
                window.location.href = uri.toString();
                return;
            }
            else {
                return uri.toString();
            }
        });
    }
    /**
     * Create phone token
     *
     * Sends the user an SMS with a secret key for creating a session. If the provided user ID has not be registered, a new user will be created. Use the returned user ID and secret and submit a request to the [POST /v1/account/sessions/token](https://appconda.io/docs/references/cloud/client-web/account#createSession) endpoint to complete the login process. The secret sent to the user&#039;s phone is valid for 15 minutes.

A user is limited to 10 active sessions at a time by default. [Learn more about session limits](https://appconda.io/docs/authentication-security#limits).
     *
     * @param {string} userId
     * @param {string} phone
     * @throws {AppwriteException}
     * @returns {Promise<Models.Token>}
     */
    createPhoneToken(userId, phone) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof phone === 'undefined') {
                throw new AppwriteException('Missing required parameter: "phone"');
            }
            const apiPath = '/account/tokens/phone';
            const payload = {};
            if (typeof userId !== 'undefined') {
                payload['userId'] = userId;
            }
            if (typeof phone !== 'undefined') {
                payload['phone'] = phone;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Create email verification
     *
     * Use this endpoint to send a verification message to your user email address to confirm they are the valid owners of that address. Both the **userId** and **secret** arguments will be passed as query parameters to the URL you have provided to be attached to the verification email. The provided URL should redirect the user back to your app and allow you to complete the verification process by verifying both the **userId** and **secret** parameters. Learn more about how to [complete the verification process](https://appconda.io/docs/references/cloud/client-web/account#updateVerification). The verification link sent to the user&#039;s email address is valid for 7 days.

Please note that in order to avoid a [Redirect Attack](https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.md), the only valid redirect URLs are the ones from domains you have set when adding your platforms in the console interface.

     *
     * @param {string} url
     * @throws {AppwriteException}
     * @returns {Promise<Models.Token>}
     */
    createVerification(url) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof url === 'undefined') {
                throw new AppwriteException('Missing required parameter: "url"');
            }
            const apiPath = '/account/verification';
            const payload = {};
            if (typeof url !== 'undefined') {
                payload['url'] = url;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Create email verification (confirmation)
     *
     * Use this endpoint to complete the user email verification process. Use both the **userId** and **secret** parameters that were attached to your app URL to verify the user email ownership. If confirmed this route will return a 200 status code.
     *
     * @param {string} userId
     * @param {string} secret
     * @throws {AppwriteException}
     * @returns {Promise<Models.Token>}
     */
    updateVerification(userId, secret) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof secret === 'undefined') {
                throw new AppwriteException('Missing required parameter: "secret"');
            }
            const apiPath = '/account/verification';
            const payload = {};
            if (typeof userId !== 'undefined') {
                payload['userId'] = userId;
            }
            if (typeof secret !== 'undefined') {
                payload['secret'] = secret;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('put', uri, apiHeaders, payload);
        });
    }
    /**
     * Create phone verification
     *
     * Use this endpoint to send a verification SMS to the currently logged in user. This endpoint is meant for use after updating a user&#039;s phone number using the [accountUpdatePhone](https://appconda.io/docs/references/cloud/client-web/account#updatePhone) endpoint. Learn more about how to [complete the verification process](https://appconda.io/docs/references/cloud/client-web/account#updatePhoneVerification). The verification code sent to the user&#039;s phone number is valid for 15 minutes.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.Token>}
     */
    createPhoneVerification() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/account/verification/phone';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Update phone verification (confirmation)
     *
     * Use this endpoint to complete the user phone verification process. Use the **userId** and **secret** that were sent to your user&#039;s phone number to verify the user email ownership. If confirmed this route will return a 200 status code.
     *
     * @param {string} userId
     * @param {string} secret
     * @throws {AppwriteException}
     * @returns {Promise<Models.Token>}
     */
    updatePhoneVerification(userId, secret) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof secret === 'undefined') {
                throw new AppwriteException('Missing required parameter: "secret"');
            }
            const apiPath = '/account/verification/phone';
            const payload = {};
            if (typeof userId !== 'undefined') {
                payload['userId'] = userId;
            }
            if (typeof secret !== 'undefined') {
                payload['secret'] = secret;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('put', uri, apiHeaders, payload);
        });
    }
}

class Avatars {
    constructor(client) {
        this.client = client;
    }
    /**
     * Get browser icon
     *
     * You can use this endpoint to show different browser icons to your users. The code argument receives the browser code as it appears in your user [GET /account/sessions](https://appconda.io/docs/references/cloud/client-web/account#getSessions) endpoint. Use width, height and quality arguments to change the output settings.

When one dimension is specified and the other is 0, the image is scaled with preserved aspect ratio. If both dimensions are 0, the API provides an image at source quality. If dimensions are not specified, the default size of image returned is 100x100px.
     *
     * @param {Browser} code
     * @param {number} width
     * @param {number} height
     * @param {number} quality
     * @throws {AppwriteException}
     * @returns {string}
     */
    getBrowser(code, width, height, quality) {
        if (typeof code === 'undefined') {
            throw new AppwriteException('Missing required parameter: "code"');
        }
        const apiPath = '/avatars/browsers/{code}'.replace('{code}', code);
        const payload = {};
        if (typeof width !== 'undefined') {
            payload['width'] = width;
        }
        if (typeof height !== 'undefined') {
            payload['height'] = height;
        }
        if (typeof quality !== 'undefined') {
            payload['quality'] = quality;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(Service.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(Client.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        return uri.toString();
    }
    /**
     * Get credit card icon
     *
     * The credit card endpoint will return you the icon of the credit card provider you need. Use width, height and quality arguments to change the output settings.

When one dimension is specified and the other is 0, the image is scaled with preserved aspect ratio. If both dimensions are 0, the API provides an image at source quality. If dimensions are not specified, the default size of image returned is 100x100px.

     *
     * @param {CreditCard} code
     * @param {number} width
     * @param {number} height
     * @param {number} quality
     * @throws {AppwriteException}
     * @returns {string}
     */
    getCreditCard(code, width, height, quality) {
        if (typeof code === 'undefined') {
            throw new AppwriteException('Missing required parameter: "code"');
        }
        const apiPath = '/avatars/credit-cards/{code}'.replace('{code}', code);
        const payload = {};
        if (typeof width !== 'undefined') {
            payload['width'] = width;
        }
        if (typeof height !== 'undefined') {
            payload['height'] = height;
        }
        if (typeof quality !== 'undefined') {
            payload['quality'] = quality;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(Service.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(Client.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        return uri.toString();
    }
    /**
     * Get favicon
     *
     * Use this endpoint to fetch the favorite icon (AKA favicon) of any remote website URL.

This endpoint does not follow HTTP redirects.
     *
     * @param {string} url
     * @throws {AppwriteException}
     * @returns {string}
     */
    getFavicon(url) {
        if (typeof url === 'undefined') {
            throw new AppwriteException('Missing required parameter: "url"');
        }
        const apiPath = '/avatars/favicon';
        const payload = {};
        if (typeof url !== 'undefined') {
            payload['url'] = url;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(Service.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(Client.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        return uri.toString();
    }
    /**
     * Get country flag
     *
     * You can use this endpoint to show different country flags icons to your users. The code argument receives the 2 letter country code. Use width, height and quality arguments to change the output settings. Country codes follow the [ISO 3166-1](https://en.wikipedia.org/wiki/ISO_3166-1) standard.

When one dimension is specified and the other is 0, the image is scaled with preserved aspect ratio. If both dimensions are 0, the API provides an image at source quality. If dimensions are not specified, the default size of image returned is 100x100px.

     *
     * @param {Flag} code
     * @param {number} width
     * @param {number} height
     * @param {number} quality
     * @throws {AppwriteException}
     * @returns {string}
     */
    getFlag(code, width, height, quality) {
        if (typeof code === 'undefined') {
            throw new AppwriteException('Missing required parameter: "code"');
        }
        const apiPath = '/avatars/flags/{code}'.replace('{code}', code);
        const payload = {};
        if (typeof width !== 'undefined') {
            payload['width'] = width;
        }
        if (typeof height !== 'undefined') {
            payload['height'] = height;
        }
        if (typeof quality !== 'undefined') {
            payload['quality'] = quality;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(Service.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(Client.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        return uri.toString();
    }
    /**
     * Get image from URL
     *
     * Use this endpoint to fetch a remote image URL and crop it to any image size you want. This endpoint is very useful if you need to crop and display remote images in your app or in case you want to make sure a 3rd party image is properly served using a TLS protocol.

When one dimension is specified and the other is 0, the image is scaled with preserved aspect ratio. If both dimensions are 0, the API provides an image at source quality. If dimensions are not specified, the default size of image returned is 400x400px.

This endpoint does not follow HTTP redirects.
     *
     * @param {string} url
     * @param {number} width
     * @param {number} height
     * @throws {AppwriteException}
     * @returns {string}
     */
    getImage(url, width, height) {
        if (typeof url === 'undefined') {
            throw new AppwriteException('Missing required parameter: "url"');
        }
        const apiPath = '/avatars/image';
        const payload = {};
        if (typeof url !== 'undefined') {
            payload['url'] = url;
        }
        if (typeof width !== 'undefined') {
            payload['width'] = width;
        }
        if (typeof height !== 'undefined') {
            payload['height'] = height;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(Service.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(Client.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        return uri.toString();
    }
    /**
     * Get user initials
     *
     * Use this endpoint to show your user initials avatar icon on your website or app. By default, this route will try to print your logged-in user name or email initials. You can also overwrite the user name if you pass the &#039;name&#039; parameter. If no name is given and no user is logged, an empty avatar will be returned.

You can use the color and background params to change the avatar colors. By default, a random theme will be selected. The random theme will persist for the user&#039;s initials when reloading the same theme will always return for the same initials.

When one dimension is specified and the other is 0, the image is scaled with preserved aspect ratio. If both dimensions are 0, the API provides an image at source quality. If dimensions are not specified, the default size of image returned is 100x100px.

     *
     * @param {string} name
     * @param {number} width
     * @param {number} height
     * @param {string} background
     * @throws {AppwriteException}
     * @returns {string}
     */
    getInitials(name, width, height, background) {
        const apiPath = '/avatars/initials';
        const payload = {};
        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }
        if (typeof width !== 'undefined') {
            payload['width'] = width;
        }
        if (typeof height !== 'undefined') {
            payload['height'] = height;
        }
        if (typeof background !== 'undefined') {
            payload['background'] = background;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(Service.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(Client.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        return uri.toString();
    }
    /**
     * Get QR code
     *
     * Converts a given plain text to a QR code image. You can use the query parameters to change the size and style of the resulting image.

     *
     * @param {string} text
     * @param {number} size
     * @param {number} margin
     * @param {boolean} download
     * @throws {AppwriteException}
     * @returns {string}
     */
    getQR(text, size, margin, download) {
        if (typeof text === 'undefined') {
            throw new AppwriteException('Missing required parameter: "text"');
        }
        const apiPath = '/avatars/qr';
        const payload = {};
        if (typeof text !== 'undefined') {
            payload['text'] = text;
        }
        if (typeof size !== 'undefined') {
            payload['size'] = size;
        }
        if (typeof margin !== 'undefined') {
            payload['margin'] = margin;
        }
        if (typeof download !== 'undefined') {
            payload['download'] = download;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(Service.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(Client.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        return uri.toString();
    }
}

class Assistant {
    constructor(client) {
        this.client = client;
    }
    /**
     * Ask Query
     *
     *
     * @param {string} prompt
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    chat(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof prompt === 'undefined') {
                throw new AppwriteException('Missing required parameter: "prompt"');
            }
            const apiPath = '/console/assistant';
            const payload = {};
            if (typeof prompt !== 'undefined') {
                payload['prompt'] = prompt;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
}

class Console {
    constructor(client) {
        this.client = client;
    }
    /**
     * Get variables
     *
     * Get all Environment Variables that are relevant for the console.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.ConsoleVariables>}
     */
    variables() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/console/variables';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
}

class Databases {
    constructor(client) {
        this.client = client;
    }
    /**
     * List databases
     *
     * Get a list of all databases from the current Appconda project. You can use the search parameter to filter your results.
     *
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppwriteException}
     * @returns {Promise<Models.DatabaseList>}
     */
    list(queries, search) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/databases';
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            if (typeof search !== 'undefined') {
                payload['search'] = search;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Create database
     *
     * Create a new Database.

     *
     * @param {string} databaseId
     * @param {string} name
     * @param {boolean} enabled
     * @throws {AppwriteException}
     * @returns {Promise<Models.Database>}
     */
    create(databaseId, name, enabled) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            const apiPath = '/databases';
            const payload = {};
            if (typeof databaseId !== 'undefined') {
                payload['databaseId'] = databaseId;
            }
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Get databases usage stats
     *
     *
     * @param {DatabaseUsageRange} range
     * @throws {AppwriteException}
     * @returns {Promise<Models.UsageDatabases>}
     */
    getUsage(range) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/databases/usage';
            const payload = {};
            if (typeof range !== 'undefined') {
                payload['range'] = range;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get database
     *
     * Get a database by its unique ID. This endpoint response returns a JSON object with the database metadata.
     *
     * @param {string} databaseId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Database>}
     */
    get(databaseId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            const apiPath = '/databases/{databaseId}'.replace('{databaseId}', databaseId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Update database
     *
     * Update a database by its unique ID.
     *
     * @param {string} databaseId
     * @param {string} name
     * @param {boolean} enabled
     * @throws {AppwriteException}
     * @returns {Promise<Models.Database>}
     */
    update(databaseId, name, enabled) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            const apiPath = '/databases/{databaseId}'.replace('{databaseId}', databaseId);
            const payload = {};
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('put', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete database
     *
     * Delete a database by its unique ID. Only API keys with with databases.write scope can delete a database.
     *
     * @param {string} databaseId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    delete(databaseId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            const apiPath = '/databases/{databaseId}'.replace('{databaseId}', databaseId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * List collections
     *
     * Get a list of all collections that belong to the provided databaseId. You can use the search parameter to filter your results.
     *
     * @param {string} databaseId
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppwriteException}
     * @returns {Promise<Models.CollectionList>}
     */
    listCollections(databaseId, queries, search) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            const apiPath = '/databases/{databaseId}/collections'.replace('{databaseId}', databaseId);
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            if (typeof search !== 'undefined') {
                payload['search'] = search;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Create collection
     *
     * Create a new Collection. Before using this route, you should create a new database resource using either a [server integration](https://appconda.io/docs/server/databases#databasesCreateCollection) API or directly from your database console.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} name
     * @param {string[]} permissions
     * @param {boolean} documentSecurity
     * @param {boolean} enabled
     * @throws {AppwriteException}
     * @returns {Promise<Models.Collection>}
     */
    createCollection(databaseId, collectionId, name, permissions, documentSecurity, enabled) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            const apiPath = '/databases/{databaseId}/collections'.replace('{databaseId}', databaseId);
            const payload = {};
            if (typeof collectionId !== 'undefined') {
                payload['collectionId'] = collectionId;
            }
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof permissions !== 'undefined') {
                payload['permissions'] = permissions;
            }
            if (typeof documentSecurity !== 'undefined') {
                payload['documentSecurity'] = documentSecurity;
            }
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Get collection
     *
     * Get a collection by its unique ID. This endpoint response returns a JSON object with the collection metadata.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Collection>}
     */
    getCollection(databaseId, collectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Update collection
     *
     * Update a collection by its unique ID.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} name
     * @param {string[]} permissions
     * @param {boolean} documentSecurity
     * @param {boolean} enabled
     * @throws {AppwriteException}
     * @returns {Promise<Models.Collection>}
     */
    updateCollection(databaseId, collectionId, name, permissions, documentSecurity, enabled) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
            const payload = {};
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof permissions !== 'undefined') {
                payload['permissions'] = permissions;
            }
            if (typeof documentSecurity !== 'undefined') {
                payload['documentSecurity'] = documentSecurity;
            }
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('put', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete collection
     *
     * Delete a collection by its unique ID. Only users with write permissions have access to delete this resource.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteCollection(databaseId, collectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * List attributes
     *
     * List attributes in the collection.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string[]} queries
     * @throws {AppwriteException}
     * @returns {Promise<Models.AttributeList>}
     */
    listAttributes(databaseId, collectionId, queries) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Create boolean attribute
     *
     * Create a boolean attribute.

     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {boolean} required
     * @param {boolean} xdefault
     * @param {boolean} array
     * @throws {AppwriteException}
     * @returns {Promise<Models.AttributeBoolean>}
     */
    createBooleanAttribute(databaseId, collectionId, key, required, xdefault, array) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof key === 'undefined') {
                throw new AppwriteException('Missing required parameter: "key"');
            }
            if (typeof required === 'undefined') {
                throw new AppwriteException('Missing required parameter: "required"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/boolean'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
            const payload = {};
            if (typeof key !== 'undefined') {
                payload['key'] = key;
            }
            if (typeof required !== 'undefined') {
                payload['required'] = required;
            }
            if (typeof xdefault !== 'undefined') {
                payload['default'] = xdefault;
            }
            if (typeof array !== 'undefined') {
                payload['array'] = array;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Update boolean attribute
     *
     * Update a boolean attribute. Changing the `default` value will not update already existing documents.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {boolean} required
     * @param {boolean} xdefault
     * @throws {AppwriteException}
     * @returns {Promise<Models.AttributeBoolean>}
     */
    updateBooleanAttribute(databaseId, collectionId, key, required, xdefault) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof key === 'undefined') {
                throw new AppwriteException('Missing required parameter: "key"');
            }
            if (typeof required === 'undefined') {
                throw new AppwriteException('Missing required parameter: "required"');
            }
            if (typeof xdefault === 'undefined') {
                throw new AppwriteException('Missing required parameter: "xdefault"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/boolean/{key}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{key}', key);
            const payload = {};
            if (typeof required !== 'undefined') {
                payload['required'] = required;
            }
            if (typeof xdefault !== 'undefined') {
                payload['default'] = xdefault;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Create datetime attribute
     *
     * Create a date time attribute according to the ISO 8601 standard.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {boolean} required
     * @param {string} xdefault
     * @param {boolean} array
     * @throws {AppwriteException}
     * @returns {Promise<Models.AttributeDatetime>}
     */
    createDatetimeAttribute(databaseId, collectionId, key, required, xdefault, array) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof key === 'undefined') {
                throw new AppwriteException('Missing required parameter: "key"');
            }
            if (typeof required === 'undefined') {
                throw new AppwriteException('Missing required parameter: "required"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/datetime'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
            const payload = {};
            if (typeof key !== 'undefined') {
                payload['key'] = key;
            }
            if (typeof required !== 'undefined') {
                payload['required'] = required;
            }
            if (typeof xdefault !== 'undefined') {
                payload['default'] = xdefault;
            }
            if (typeof array !== 'undefined') {
                payload['array'] = array;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Update dateTime attribute
     *
     * Update a date time attribute. Changing the `default` value will not update already existing documents.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {boolean} required
     * @param {string} xdefault
     * @throws {AppwriteException}
     * @returns {Promise<Models.AttributeDatetime>}
     */
    updateDatetimeAttribute(databaseId, collectionId, key, required, xdefault) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof key === 'undefined') {
                throw new AppwriteException('Missing required parameter: "key"');
            }
            if (typeof required === 'undefined') {
                throw new AppwriteException('Missing required parameter: "required"');
            }
            if (typeof xdefault === 'undefined') {
                throw new AppwriteException('Missing required parameter: "xdefault"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/datetime/{key}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{key}', key);
            const payload = {};
            if (typeof required !== 'undefined') {
                payload['required'] = required;
            }
            if (typeof xdefault !== 'undefined') {
                payload['default'] = xdefault;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Create email attribute
     *
     * Create an email attribute.

     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {boolean} required
     * @param {string} xdefault
     * @param {boolean} array
     * @throws {AppwriteException}
     * @returns {Promise<Models.AttributeEmail>}
     */
    createEmailAttribute(databaseId, collectionId, key, required, xdefault, array) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof key === 'undefined') {
                throw new AppwriteException('Missing required parameter: "key"');
            }
            if (typeof required === 'undefined') {
                throw new AppwriteException('Missing required parameter: "required"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/email'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
            const payload = {};
            if (typeof key !== 'undefined') {
                payload['key'] = key;
            }
            if (typeof required !== 'undefined') {
                payload['required'] = required;
            }
            if (typeof xdefault !== 'undefined') {
                payload['default'] = xdefault;
            }
            if (typeof array !== 'undefined') {
                payload['array'] = array;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Update email attribute
     *
     * Update an email attribute. Changing the `default` value will not update already existing documents.

     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {boolean} required
     * @param {string} xdefault
     * @throws {AppwriteException}
     * @returns {Promise<Models.AttributeEmail>}
     */
    updateEmailAttribute(databaseId, collectionId, key, required, xdefault) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof key === 'undefined') {
                throw new AppwriteException('Missing required parameter: "key"');
            }
            if (typeof required === 'undefined') {
                throw new AppwriteException('Missing required parameter: "required"');
            }
            if (typeof xdefault === 'undefined') {
                throw new AppwriteException('Missing required parameter: "xdefault"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/email/{key}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{key}', key);
            const payload = {};
            if (typeof required !== 'undefined') {
                payload['required'] = required;
            }
            if (typeof xdefault !== 'undefined') {
                payload['default'] = xdefault;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Create enum attribute
     *
     * Create an enumeration attribute. The `elements` param acts as a white-list of accepted values for this attribute.

     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {string[]} elements
     * @param {boolean} required
     * @param {string} xdefault
     * @param {boolean} array
     * @throws {AppwriteException}
     * @returns {Promise<Models.AttributeEnum>}
     */
    createEnumAttribute(databaseId, collectionId, key, elements, required, xdefault, array) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof key === 'undefined') {
                throw new AppwriteException('Missing required parameter: "key"');
            }
            if (typeof elements === 'undefined') {
                throw new AppwriteException('Missing required parameter: "elements"');
            }
            if (typeof required === 'undefined') {
                throw new AppwriteException('Missing required parameter: "required"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/enum'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
            const payload = {};
            if (typeof key !== 'undefined') {
                payload['key'] = key;
            }
            if (typeof elements !== 'undefined') {
                payload['elements'] = elements;
            }
            if (typeof required !== 'undefined') {
                payload['required'] = required;
            }
            if (typeof xdefault !== 'undefined') {
                payload['default'] = xdefault;
            }
            if (typeof array !== 'undefined') {
                payload['array'] = array;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Update enum attribute
     *
     * Update an enum attribute. Changing the `default` value will not update already existing documents.

     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {string[]} elements
     * @param {boolean} required
     * @param {string} xdefault
     * @throws {AppwriteException}
     * @returns {Promise<Models.AttributeEnum>}
     */
    updateEnumAttribute(databaseId, collectionId, key, elements, required, xdefault) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof key === 'undefined') {
                throw new AppwriteException('Missing required parameter: "key"');
            }
            if (typeof elements === 'undefined') {
                throw new AppwriteException('Missing required parameter: "elements"');
            }
            if (typeof required === 'undefined') {
                throw new AppwriteException('Missing required parameter: "required"');
            }
            if (typeof xdefault === 'undefined') {
                throw new AppwriteException('Missing required parameter: "xdefault"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/enum/{key}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{key}', key);
            const payload = {};
            if (typeof elements !== 'undefined') {
                payload['elements'] = elements;
            }
            if (typeof required !== 'undefined') {
                payload['required'] = required;
            }
            if (typeof xdefault !== 'undefined') {
                payload['default'] = xdefault;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Create float attribute
     *
     * Create a float attribute. Optionally, minimum and maximum values can be provided.

     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {boolean} required
     * @param {number} min
     * @param {number} max
     * @param {number} xdefault
     * @param {boolean} array
     * @throws {AppwriteException}
     * @returns {Promise<Models.AttributeFloat>}
     */
    createFloatAttribute(databaseId, collectionId, key, required, min, max, xdefault, array) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof key === 'undefined') {
                throw new AppwriteException('Missing required parameter: "key"');
            }
            if (typeof required === 'undefined') {
                throw new AppwriteException('Missing required parameter: "required"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/float'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
            const payload = {};
            if (typeof key !== 'undefined') {
                payload['key'] = key;
            }
            if (typeof required !== 'undefined') {
                payload['required'] = required;
            }
            if (typeof min !== 'undefined') {
                payload['min'] = min;
            }
            if (typeof max !== 'undefined') {
                payload['max'] = max;
            }
            if (typeof xdefault !== 'undefined') {
                payload['default'] = xdefault;
            }
            if (typeof array !== 'undefined') {
                payload['array'] = array;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Update float attribute
     *
     * Update a float attribute. Changing the `default` value will not update already existing documents.

     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {boolean} required
     * @param {number} min
     * @param {number} max
     * @param {number} xdefault
     * @throws {AppwriteException}
     * @returns {Promise<Models.AttributeFloat>}
     */
    updateFloatAttribute(databaseId, collectionId, key, required, min, max, xdefault) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof key === 'undefined') {
                throw new AppwriteException('Missing required parameter: "key"');
            }
            if (typeof required === 'undefined') {
                throw new AppwriteException('Missing required parameter: "required"');
            }
            if (typeof min === 'undefined') {
                throw new AppwriteException('Missing required parameter: "min"');
            }
            if (typeof max === 'undefined') {
                throw new AppwriteException('Missing required parameter: "max"');
            }
            if (typeof xdefault === 'undefined') {
                throw new AppwriteException('Missing required parameter: "xdefault"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/float/{key}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{key}', key);
            const payload = {};
            if (typeof required !== 'undefined') {
                payload['required'] = required;
            }
            if (typeof min !== 'undefined') {
                payload['min'] = min;
            }
            if (typeof max !== 'undefined') {
                payload['max'] = max;
            }
            if (typeof xdefault !== 'undefined') {
                payload['default'] = xdefault;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Create integer attribute
     *
     * Create an integer attribute. Optionally, minimum and maximum values can be provided.

     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {boolean} required
     * @param {number} min
     * @param {number} max
     * @param {number} xdefault
     * @param {boolean} array
     * @throws {AppwriteException}
     * @returns {Promise<Models.AttributeInteger>}
     */
    createIntegerAttribute(databaseId, collectionId, key, required, min, max, xdefault, array) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof key === 'undefined') {
                throw new AppwriteException('Missing required parameter: "key"');
            }
            if (typeof required === 'undefined') {
                throw new AppwriteException('Missing required parameter: "required"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/integer'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
            const payload = {};
            if (typeof key !== 'undefined') {
                payload['key'] = key;
            }
            if (typeof required !== 'undefined') {
                payload['required'] = required;
            }
            if (typeof min !== 'undefined') {
                payload['min'] = min;
            }
            if (typeof max !== 'undefined') {
                payload['max'] = max;
            }
            if (typeof xdefault !== 'undefined') {
                payload['default'] = xdefault;
            }
            if (typeof array !== 'undefined') {
                payload['array'] = array;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Update integer attribute
     *
     * Update an integer attribute. Changing the `default` value will not update already existing documents.

     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {boolean} required
     * @param {number} min
     * @param {number} max
     * @param {number} xdefault
     * @throws {AppwriteException}
     * @returns {Promise<Models.AttributeInteger>}
     */
    updateIntegerAttribute(databaseId, collectionId, key, required, min, max, xdefault) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof key === 'undefined') {
                throw new AppwriteException('Missing required parameter: "key"');
            }
            if (typeof required === 'undefined') {
                throw new AppwriteException('Missing required parameter: "required"');
            }
            if (typeof min === 'undefined') {
                throw new AppwriteException('Missing required parameter: "min"');
            }
            if (typeof max === 'undefined') {
                throw new AppwriteException('Missing required parameter: "max"');
            }
            if (typeof xdefault === 'undefined') {
                throw new AppwriteException('Missing required parameter: "xdefault"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/integer/{key}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{key}', key);
            const payload = {};
            if (typeof required !== 'undefined') {
                payload['required'] = required;
            }
            if (typeof min !== 'undefined') {
                payload['min'] = min;
            }
            if (typeof max !== 'undefined') {
                payload['max'] = max;
            }
            if (typeof xdefault !== 'undefined') {
                payload['default'] = xdefault;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Create IP address attribute
     *
     * Create IP address attribute.

     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {boolean} required
     * @param {string} xdefault
     * @param {boolean} array
     * @throws {AppwriteException}
     * @returns {Promise<Models.AttributeIp>}
     */
    createIpAttribute(databaseId, collectionId, key, required, xdefault, array) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof key === 'undefined') {
                throw new AppwriteException('Missing required parameter: "key"');
            }
            if (typeof required === 'undefined') {
                throw new AppwriteException('Missing required parameter: "required"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/ip'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
            const payload = {};
            if (typeof key !== 'undefined') {
                payload['key'] = key;
            }
            if (typeof required !== 'undefined') {
                payload['required'] = required;
            }
            if (typeof xdefault !== 'undefined') {
                payload['default'] = xdefault;
            }
            if (typeof array !== 'undefined') {
                payload['array'] = array;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Update IP address attribute
     *
     * Update an ip attribute. Changing the `default` value will not update already existing documents.

     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {boolean} required
     * @param {string} xdefault
     * @throws {AppwriteException}
     * @returns {Promise<Models.AttributeIp>}
     */
    updateIpAttribute(databaseId, collectionId, key, required, xdefault) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof key === 'undefined') {
                throw new AppwriteException('Missing required parameter: "key"');
            }
            if (typeof required === 'undefined') {
                throw new AppwriteException('Missing required parameter: "required"');
            }
            if (typeof xdefault === 'undefined') {
                throw new AppwriteException('Missing required parameter: "xdefault"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/ip/{key}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{key}', key);
            const payload = {};
            if (typeof required !== 'undefined') {
                payload['required'] = required;
            }
            if (typeof xdefault !== 'undefined') {
                payload['default'] = xdefault;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Create relationship attribute
     *
     * Create relationship attribute. [Learn more about relationship attributes](https://appconda.io/docs/databases-relationships#relationship-attributes).

     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} relatedCollectionId
     * @param {RelationshipType} type
     * @param {boolean} twoWay
     * @param {string} key
     * @param {string} twoWayKey
     * @param {RelationMutate} onDelete
     * @throws {AppwriteException}
     * @returns {Promise<Models.AttributeRelationship>}
     */
    createRelationshipAttribute(databaseId, collectionId, relatedCollectionId, type, twoWay, key, twoWayKey, onDelete) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof relatedCollectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "relatedCollectionId"');
            }
            if (typeof type === 'undefined') {
                throw new AppwriteException('Missing required parameter: "type"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/relationship'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
            const payload = {};
            if (typeof relatedCollectionId !== 'undefined') {
                payload['relatedCollectionId'] = relatedCollectionId;
            }
            if (typeof type !== 'undefined') {
                payload['type'] = type;
            }
            if (typeof twoWay !== 'undefined') {
                payload['twoWay'] = twoWay;
            }
            if (typeof key !== 'undefined') {
                payload['key'] = key;
            }
            if (typeof twoWayKey !== 'undefined') {
                payload['twoWayKey'] = twoWayKey;
            }
            if (typeof onDelete !== 'undefined') {
                payload['onDelete'] = onDelete;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Create string attribute
     *
     * Create a string attribute.

     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {number} size
     * @param {boolean} required
     * @param {string} xdefault
     * @param {boolean} array
     * @param {boolean} encrypt
     * @throws {AppwriteException}
     * @returns {Promise<Models.AttributeString>}
     */
    createStringAttribute(databaseId, collectionId, key, size, required, xdefault, array, encrypt) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof key === 'undefined') {
                throw new AppwriteException('Missing required parameter: "key"');
            }
            if (typeof size === 'undefined') {
                throw new AppwriteException('Missing required parameter: "size"');
            }
            if (typeof required === 'undefined') {
                throw new AppwriteException('Missing required parameter: "required"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/string'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
            const payload = {};
            if (typeof key !== 'undefined') {
                payload['key'] = key;
            }
            if (typeof size !== 'undefined') {
                payload['size'] = size;
            }
            if (typeof required !== 'undefined') {
                payload['required'] = required;
            }
            if (typeof xdefault !== 'undefined') {
                payload['default'] = xdefault;
            }
            if (typeof array !== 'undefined') {
                payload['array'] = array;
            }
            if (typeof encrypt !== 'undefined') {
                payload['encrypt'] = encrypt;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Update string attribute
     *
     * Update a string attribute. Changing the `default` value will not update already existing documents.

     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {boolean} required
     * @param {string} xdefault
     * @throws {AppwriteException}
     * @returns {Promise<Models.AttributeString>}
     */
    updateStringAttribute(databaseId, collectionId, key, required, xdefault) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof key === 'undefined') {
                throw new AppwriteException('Missing required parameter: "key"');
            }
            if (typeof required === 'undefined') {
                throw new AppwriteException('Missing required parameter: "required"');
            }
            if (typeof xdefault === 'undefined') {
                throw new AppwriteException('Missing required parameter: "xdefault"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/string/{key}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{key}', key);
            const payload = {};
            if (typeof required !== 'undefined') {
                payload['required'] = required;
            }
            if (typeof xdefault !== 'undefined') {
                payload['default'] = xdefault;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Create URL attribute
     *
     * Create a URL attribute.

     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {boolean} required
     * @param {string} xdefault
     * @param {boolean} array
     * @throws {AppwriteException}
     * @returns {Promise<Models.AttributeUrl>}
     */
    createUrlAttribute(databaseId, collectionId, key, required, xdefault, array) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof key === 'undefined') {
                throw new AppwriteException('Missing required parameter: "key"');
            }
            if (typeof required === 'undefined') {
                throw new AppwriteException('Missing required parameter: "required"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/url'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
            const payload = {};
            if (typeof key !== 'undefined') {
                payload['key'] = key;
            }
            if (typeof required !== 'undefined') {
                payload['required'] = required;
            }
            if (typeof xdefault !== 'undefined') {
                payload['default'] = xdefault;
            }
            if (typeof array !== 'undefined') {
                payload['array'] = array;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Update URL attribute
     *
     * Update an url attribute. Changing the `default` value will not update already existing documents.

     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {boolean} required
     * @param {string} xdefault
     * @throws {AppwriteException}
     * @returns {Promise<Models.AttributeUrl>}
     */
    updateUrlAttribute(databaseId, collectionId, key, required, xdefault) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof key === 'undefined') {
                throw new AppwriteException('Missing required parameter: "key"');
            }
            if (typeof required === 'undefined') {
                throw new AppwriteException('Missing required parameter: "required"');
            }
            if (typeof xdefault === 'undefined') {
                throw new AppwriteException('Missing required parameter: "xdefault"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/url/{key}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{key}', key);
            const payload = {};
            if (typeof required !== 'undefined') {
                payload['required'] = required;
            }
            if (typeof xdefault !== 'undefined') {
                payload['default'] = xdefault;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Get attribute
     *
     * Get attribute by ID.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    getAttribute(databaseId, collectionId, key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof key === 'undefined') {
                throw new AppwriteException('Missing required parameter: "key"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/{key}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{key}', key);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete attribute
     *
     * Deletes an attribute.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteAttribute(databaseId, collectionId, key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof key === 'undefined') {
                throw new AppwriteException('Missing required parameter: "key"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/{key}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{key}', key);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * Update relationship attribute
     *
     * Update relationship attribute. [Learn more about relationship attributes](https://appconda.io/docs/databases-relationships#relationship-attributes).

     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {RelationMutate} onDelete
     * @throws {AppwriteException}
     * @returns {Promise<Models.AttributeRelationship>}
     */
    updateRelationshipAttribute(databaseId, collectionId, key, onDelete) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof key === 'undefined') {
                throw new AppwriteException('Missing required parameter: "key"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/{key}/relationship'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{key}', key);
            const payload = {};
            if (typeof onDelete !== 'undefined') {
                payload['onDelete'] = onDelete;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * List documents
     *
     * Get a list of all the user&#039;s documents in a given collection. You can use the query params to filter your results.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string[]} queries
     * @throws {AppwriteException}
     * @returns {Promise<Models.DocumentList<Document>>}
     */
    listDocuments(databaseId, collectionId, queries) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/documents'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Create document
     *
     * Create a new Document. Before using this route, you should create a new collection resource using either a [server integration](https://appconda.io/docs/server/databases#databasesCreateCollection) API or directly from your database console.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} documentId
     * @param {Omit<Document, keyof Models.Document>} data
     * @param {string[]} permissions
     * @throws {AppwriteException}
     * @returns {Promise<Document>}
     */
    createDocument(databaseId, collectionId, documentId, data, permissions) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof documentId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "documentId"');
            }
            if (typeof data === 'undefined') {
                throw new AppwriteException('Missing required parameter: "data"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/documents'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
            const payload = {};
            if (typeof documentId !== 'undefined') {
                payload['documentId'] = documentId;
            }
            if (typeof data !== 'undefined') {
                payload['data'] = data;
            }
            if (typeof permissions !== 'undefined') {
                payload['permissions'] = permissions;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Get document
     *
     * Get a document by its unique ID. This endpoint response returns a JSON object with the document data.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} documentId
     * @param {string[]} queries
     * @throws {AppwriteException}
     * @returns {Promise<Document>}
     */
    getDocument(databaseId, collectionId, documentId, queries) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof documentId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "documentId"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/documents/{documentId}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{documentId}', documentId);
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Update document
     *
     * Update a document by its unique ID. Using the patch method you can pass only specific fields that will get updated.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} documentId
     * @param {Partial<Omit<Document, keyof Models.Document>>} data
     * @param {string[]} permissions
     * @throws {AppwriteException}
     * @returns {Promise<Document>}
     */
    updateDocument(databaseId, collectionId, documentId, data, permissions) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof documentId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "documentId"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/documents/{documentId}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{documentId}', documentId);
            const payload = {};
            if (typeof data !== 'undefined') {
                payload['data'] = data;
            }
            if (typeof permissions !== 'undefined') {
                payload['permissions'] = permissions;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete document
     *
     * Delete a document by its unique ID.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} documentId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteDocument(databaseId, collectionId, documentId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof documentId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "documentId"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/documents/{documentId}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{documentId}', documentId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * List document logs
     *
     * Get the document activity logs list by its unique ID.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} documentId
     * @param {string[]} queries
     * @throws {AppwriteException}
     * @returns {Promise<Models.LogList>}
     */
    listDocumentLogs(databaseId, collectionId, documentId, queries) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof documentId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "documentId"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/documents/{documentId}/logs'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{documentId}', documentId);
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * List indexes
     *
     * List indexes in the collection.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string[]} queries
     * @throws {AppwriteException}
     * @returns {Promise<Models.IndexList>}
     */
    listIndexes(databaseId, collectionId, queries) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/indexes'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Create index
     *
     * Creates an index on the attributes listed. Your index should include all the attributes you will query in a single request.
Attributes can be `key`, `fulltext`, and `unique`.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {IndexType} type
     * @param {string[]} attributes
     * @param {string[]} orders
     * @throws {AppwriteException}
     * @returns {Promise<Models.Index>}
     */
    createIndex(databaseId, collectionId, key, type, attributes, orders) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof key === 'undefined') {
                throw new AppwriteException('Missing required parameter: "key"');
            }
            if (typeof type === 'undefined') {
                throw new AppwriteException('Missing required parameter: "type"');
            }
            if (typeof attributes === 'undefined') {
                throw new AppwriteException('Missing required parameter: "attributes"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/indexes'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
            const payload = {};
            if (typeof key !== 'undefined') {
                payload['key'] = key;
            }
            if (typeof type !== 'undefined') {
                payload['type'] = type;
            }
            if (typeof attributes !== 'undefined') {
                payload['attributes'] = attributes;
            }
            if (typeof orders !== 'undefined') {
                payload['orders'] = orders;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Get index
     *
     * Get index by ID.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @throws {AppwriteException}
     * @returns {Promise<Models.Index>}
     */
    getIndex(databaseId, collectionId, key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof key === 'undefined') {
                throw new AppwriteException('Missing required parameter: "key"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/indexes/{key}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{key}', key);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete index
     *
     * Delete an index.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteIndex(databaseId, collectionId, key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof key === 'undefined') {
                throw new AppwriteException('Missing required parameter: "key"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/indexes/{key}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{key}', key);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * List collection logs
     *
     * Get the collection activity logs list by its unique ID.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string[]} queries
     * @throws {AppwriteException}
     * @returns {Promise<Models.LogList>}
     */
    listCollectionLogs(databaseId, collectionId, queries) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/logs'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get collection usage stats
     *
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {DatabaseUsageRange} range
     * @throws {AppwriteException}
     * @returns {Promise<Models.UsageCollection>}
     */
    getCollectionUsage(databaseId, collectionId, range) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/usage'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
            const payload = {};
            if (typeof range !== 'undefined') {
                payload['range'] = range;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * List database logs
     *
     * Get the database activity logs list by its unique ID.
     *
     * @param {string} databaseId
     * @param {string[]} queries
     * @throws {AppwriteException}
     * @returns {Promise<Models.LogList>}
     */
    listLogs(databaseId, queries) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            const apiPath = '/databases/{databaseId}/logs'.replace('{databaseId}', databaseId);
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get database usage stats
     *
     *
     * @param {string} databaseId
     * @param {DatabaseUsageRange} range
     * @throws {AppwriteException}
     * @returns {Promise<Models.UsageDatabase>}
     */
    getDatabaseUsage(databaseId, range) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            const apiPath = '/databases/{databaseId}/usage'.replace('{databaseId}', databaseId);
            const payload = {};
            if (typeof range !== 'undefined') {
                payload['range'] = range;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
}

class Functions {
    constructor(client) {
        this.client = client;
    }
    /**
     * List functions
     *
     * Get a list of all the project&#039;s functions. You can use the query params to filter your results.
     *
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppwriteException}
     * @returns {Promise<Models.FunctionList>}
     */
    list(queries, search) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/functions';
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            if (typeof search !== 'undefined') {
                payload['search'] = search;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Create function
     *
     * Create a new function. You can pass a list of [permissions](https://appconda.io/docs/permissions) to allow different project users or team with access to execute the function using the client API.
     *
     * @param {string} functionId
     * @param {string} name
     * @param {Runtime} runtime
     * @param {string[]} execute
     * @param {string[]} events
     * @param {string} schedule
     * @param {number} timeout
     * @param {boolean} enabled
     * @param {boolean} logging
     * @param {string} entrypoint
     * @param {string} commands
     * @param {string[]} scopes
     * @param {string} installationId
     * @param {string} providerRepositoryId
     * @param {string} providerBranch
     * @param {boolean} providerSilentMode
     * @param {string} providerRootDirectory
     * @param {string} templateRepository
     * @param {string} templateOwner
     * @param {string} templateRootDirectory
     * @param {string} templateVersion
     * @param {string} specification
     * @throws {AppwriteException}
     * @returns {Promise<Models.Function>}
     */
    create(functionId, name, runtime, execute, events, schedule, timeout, enabled, logging, entrypoint, commands, scopes, installationId, providerRepositoryId, providerBranch, providerSilentMode, providerRootDirectory, templateRepository, templateOwner, templateRootDirectory, templateVersion, specification) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof functionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "functionId"');
            }
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            if (typeof runtime === 'undefined') {
                throw new AppwriteException('Missing required parameter: "runtime"');
            }
            const apiPath = '/functions';
            const payload = {};
            if (typeof functionId !== 'undefined') {
                payload['functionId'] = functionId;
            }
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof runtime !== 'undefined') {
                payload['runtime'] = runtime;
            }
            if (typeof execute !== 'undefined') {
                payload['execute'] = execute;
            }
            if (typeof events !== 'undefined') {
                payload['events'] = events;
            }
            if (typeof schedule !== 'undefined') {
                payload['schedule'] = schedule;
            }
            if (typeof timeout !== 'undefined') {
                payload['timeout'] = timeout;
            }
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            if (typeof logging !== 'undefined') {
                payload['logging'] = logging;
            }
            if (typeof entrypoint !== 'undefined') {
                payload['entrypoint'] = entrypoint;
            }
            if (typeof commands !== 'undefined') {
                payload['commands'] = commands;
            }
            if (typeof scopes !== 'undefined') {
                payload['scopes'] = scopes;
            }
            if (typeof installationId !== 'undefined') {
                payload['installationId'] = installationId;
            }
            if (typeof providerRepositoryId !== 'undefined') {
                payload['providerRepositoryId'] = providerRepositoryId;
            }
            if (typeof providerBranch !== 'undefined') {
                payload['providerBranch'] = providerBranch;
            }
            if (typeof providerSilentMode !== 'undefined') {
                payload['providerSilentMode'] = providerSilentMode;
            }
            if (typeof providerRootDirectory !== 'undefined') {
                payload['providerRootDirectory'] = providerRootDirectory;
            }
            if (typeof templateRepository !== 'undefined') {
                payload['templateRepository'] = templateRepository;
            }
            if (typeof templateOwner !== 'undefined') {
                payload['templateOwner'] = templateOwner;
            }
            if (typeof templateRootDirectory !== 'undefined') {
                payload['templateRootDirectory'] = templateRootDirectory;
            }
            if (typeof templateVersion !== 'undefined') {
                payload['templateVersion'] = templateVersion;
            }
            if (typeof specification !== 'undefined') {
                payload['specification'] = specification;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * List runtimes
     *
     * Get a list of all runtimes that are currently active on your instance.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.RuntimeList>}
     */
    listRuntimes() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/functions/runtimes';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * List available function runtime specifications
     *
     * List allowed function specifications for this instance.

     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.SpecificationList>}
     */
    listSpecifications() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/functions/specifications';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * List function templates
     *
     * List available function templates. You can use template details in [createFunction](/docs/references/cloud/server-nodejs/functions#create) method.
     *
     * @param {string[]} runtimes
     * @param {string[]} useCases
     * @param {number} limit
     * @param {number} offset
     * @throws {AppwriteException}
     * @returns {Promise<Models.TemplateFunctionList>}
     */
    listTemplates(runtimes, useCases, limit, offset) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/functions/templates';
            const payload = {};
            if (typeof runtimes !== 'undefined') {
                payload['runtimes'] = runtimes;
            }
            if (typeof useCases !== 'undefined') {
                payload['useCases'] = useCases;
            }
            if (typeof limit !== 'undefined') {
                payload['limit'] = limit;
            }
            if (typeof offset !== 'undefined') {
                payload['offset'] = offset;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get function template
     *
     * Get a function template using ID. You can use template details in [createFunction](/docs/references/cloud/server-nodejs/functions#create) method.
     *
     * @param {string} templateId
     * @throws {AppwriteException}
     * @returns {Promise<Models.TemplateFunction>}
     */
    getTemplate(templateId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof templateId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "templateId"');
            }
            const apiPath = '/functions/templates/{templateId}'.replace('{templateId}', templateId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get functions usage
     *
     *
     * @param {FunctionUsageRange} range
     * @throws {AppwriteException}
     * @returns {Promise<Models.UsageFunctions>}
     */
    getUsage(range) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/functions/usage';
            const payload = {};
            if (typeof range !== 'undefined') {
                payload['range'] = range;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get function
     *
     * Get a function by its unique ID.
     *
     * @param {string} functionId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Function>}
     */
    get(functionId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof functionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "functionId"');
            }
            const apiPath = '/functions/{functionId}'.replace('{functionId}', functionId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Update function
     *
     * Update function by its unique ID.
     *
     * @param {string} functionId
     * @param {string} name
     * @param {Runtime} runtime
     * @param {string[]} execute
     * @param {string[]} events
     * @param {string} schedule
     * @param {number} timeout
     * @param {boolean} enabled
     * @param {boolean} logging
     * @param {string} entrypoint
     * @param {string} commands
     * @param {string[]} scopes
     * @param {string} installationId
     * @param {string} providerRepositoryId
     * @param {string} providerBranch
     * @param {boolean} providerSilentMode
     * @param {string} providerRootDirectory
     * @param {string} specification
     * @throws {AppwriteException}
     * @returns {Promise<Models.Function>}
     */
    update(functionId, name, runtime, execute, events, schedule, timeout, enabled, logging, entrypoint, commands, scopes, installationId, providerRepositoryId, providerBranch, providerSilentMode, providerRootDirectory, specification) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof functionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "functionId"');
            }
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            const apiPath = '/functions/{functionId}'.replace('{functionId}', functionId);
            const payload = {};
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof runtime !== 'undefined') {
                payload['runtime'] = runtime;
            }
            if (typeof execute !== 'undefined') {
                payload['execute'] = execute;
            }
            if (typeof events !== 'undefined') {
                payload['events'] = events;
            }
            if (typeof schedule !== 'undefined') {
                payload['schedule'] = schedule;
            }
            if (typeof timeout !== 'undefined') {
                payload['timeout'] = timeout;
            }
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            if (typeof logging !== 'undefined') {
                payload['logging'] = logging;
            }
            if (typeof entrypoint !== 'undefined') {
                payload['entrypoint'] = entrypoint;
            }
            if (typeof commands !== 'undefined') {
                payload['commands'] = commands;
            }
            if (typeof scopes !== 'undefined') {
                payload['scopes'] = scopes;
            }
            if (typeof installationId !== 'undefined') {
                payload['installationId'] = installationId;
            }
            if (typeof providerRepositoryId !== 'undefined') {
                payload['providerRepositoryId'] = providerRepositoryId;
            }
            if (typeof providerBranch !== 'undefined') {
                payload['providerBranch'] = providerBranch;
            }
            if (typeof providerSilentMode !== 'undefined') {
                payload['providerSilentMode'] = providerSilentMode;
            }
            if (typeof providerRootDirectory !== 'undefined') {
                payload['providerRootDirectory'] = providerRootDirectory;
            }
            if (typeof specification !== 'undefined') {
                payload['specification'] = specification;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('put', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete function
     *
     * Delete a function by its unique ID.
     *
     * @param {string} functionId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    delete(functionId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof functionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "functionId"');
            }
            const apiPath = '/functions/{functionId}'.replace('{functionId}', functionId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * List deployments
     *
     * Get a list of all the project&#039;s code deployments. You can use the query params to filter your results.
     *
     * @param {string} functionId
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppwriteException}
     * @returns {Promise<Models.DeploymentList>}
     */
    listDeployments(functionId, queries, search) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof functionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "functionId"');
            }
            const apiPath = '/functions/{functionId}/deployments'.replace('{functionId}', functionId);
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            if (typeof search !== 'undefined') {
                payload['search'] = search;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Create deployment
     *
     * Create a new function code deployment. Use this endpoint to upload a new version of your code function. To execute your newly uploaded code, you&#039;ll need to update the function&#039;s deployment to use your new deployment UID.

This endpoint accepts a tar.gz file compressed with your code. Make sure to include any dependencies your code has within the compressed file. You can learn more about code packaging in the [Appconda Cloud Functions tutorial](https://appconda.io/docs/functions).

Use the &quot;command&quot; param to set the entrypoint used to execute your code.
     *
     * @param {string} functionId
     * @param {File} code
     * @param {boolean} activate
     * @param {string} entrypoint
     * @param {string} commands
     * @throws {AppwriteException}
     * @returns {Promise<Models.Deployment>}
     */
    createDeployment(functionId, code, activate, entrypoint, commands, onProgress = (progress) => { }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof functionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "functionId"');
            }
            if (typeof code === 'undefined') {
                throw new AppwriteException('Missing required parameter: "code"');
            }
            if (typeof activate === 'undefined') {
                throw new AppwriteException('Missing required parameter: "activate"');
            }
            const apiPath = '/functions/{functionId}/deployments'.replace('{functionId}', functionId);
            const payload = {};
            if (typeof entrypoint !== 'undefined') {
                payload['entrypoint'] = entrypoint;
            }
            if (typeof commands !== 'undefined') {
                payload['commands'] = commands;
            }
            if (typeof code !== 'undefined') {
                payload['code'] = code;
            }
            if (typeof activate !== 'undefined') {
                payload['activate'] = activate;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'multipart/form-data',
            };
            return yield this.client.chunkedUpload('post', uri, apiHeaders, payload, onProgress);
        });
    }
    /**
     * Get deployment
     *
     * Get a code deployment by its unique ID.
     *
     * @param {string} functionId
     * @param {string} deploymentId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Deployment>}
     */
    getDeployment(functionId, deploymentId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof functionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "functionId"');
            }
            if (typeof deploymentId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "deploymentId"');
            }
            const apiPath = '/functions/{functionId}/deployments/{deploymentId}'.replace('{functionId}', functionId).replace('{deploymentId}', deploymentId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Update deployment
     *
     * Update the function code deployment ID using the unique function ID. Use this endpoint to switch the code deployment that should be executed by the execution endpoint.
     *
     * @param {string} functionId
     * @param {string} deploymentId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Function>}
     */
    updateDeployment(functionId, deploymentId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof functionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "functionId"');
            }
            if (typeof deploymentId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "deploymentId"');
            }
            const apiPath = '/functions/{functionId}/deployments/{deploymentId}'.replace('{functionId}', functionId).replace('{deploymentId}', deploymentId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete deployment
     *
     * Delete a code deployment by its unique ID.
     *
     * @param {string} functionId
     * @param {string} deploymentId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteDeployment(functionId, deploymentId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof functionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "functionId"');
            }
            if (typeof deploymentId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "deploymentId"');
            }
            const apiPath = '/functions/{functionId}/deployments/{deploymentId}'.replace('{functionId}', functionId).replace('{deploymentId}', deploymentId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * Rebuild deployment
     *
     *
     * @param {string} functionId
     * @param {string} deploymentId
     * @param {string} buildId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    createBuild(functionId, deploymentId, buildId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof functionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "functionId"');
            }
            if (typeof deploymentId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "deploymentId"');
            }
            const apiPath = '/functions/{functionId}/deployments/{deploymentId}/build'.replace('{functionId}', functionId).replace('{deploymentId}', deploymentId);
            const payload = {};
            if (typeof buildId !== 'undefined') {
                payload['buildId'] = buildId;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Cancel deployment
     *
     *
     * @param {string} functionId
     * @param {string} deploymentId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Build>}
     */
    updateDeploymentBuild(functionId, deploymentId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof functionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "functionId"');
            }
            if (typeof deploymentId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "deploymentId"');
            }
            const apiPath = '/functions/{functionId}/deployments/{deploymentId}/build'.replace('{functionId}', functionId).replace('{deploymentId}', deploymentId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Download deployment
     *
     * Get a Deployment&#039;s contents by its unique ID. This endpoint supports range requests for partial or streaming file download.
     *
     * @param {string} functionId
     * @param {string} deploymentId
     * @throws {AppwriteException}
     * @returns {string}
     */
    getDeploymentDownload(functionId, deploymentId) {
        if (typeof functionId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "functionId"');
        }
        if (typeof deploymentId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "deploymentId"');
        }
        const apiPath = '/functions/{functionId}/deployments/{deploymentId}/download'.replace('{functionId}', functionId).replace('{deploymentId}', deploymentId);
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(Service.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(Client.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        return uri.toString();
    }
    /**
     * List executions
     *
     * Get a list of all the current user function execution logs. You can use the query params to filter your results.
     *
     * @param {string} functionId
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppwriteException}
     * @returns {Promise<Models.ExecutionList>}
     */
    listExecutions(functionId, queries, search) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof functionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "functionId"');
            }
            const apiPath = '/functions/{functionId}/executions'.replace('{functionId}', functionId);
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            if (typeof search !== 'undefined') {
                payload['search'] = search;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Create execution
     *
     * Trigger a function execution. The returned object will return you the current execution status. You can ping the `Get Execution` endpoint to get updates on the current execution status. Once this endpoint is called, your function execution process will start asynchronously.
     *
     * @param {string} functionId
     * @param {string} body
     * @param {boolean} async
     * @param {string} xpath
     * @param {ExecutionMethod} method
     * @param {object} headers
     * @param {string} scheduledAt
     * @throws {AppwriteException}
     * @returns {Promise<Models.Execution>}
     */
    createExecution(functionId, body, async, xpath, method, headers, scheduledAt) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof functionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "functionId"');
            }
            const apiPath = '/functions/{functionId}/executions'.replace('{functionId}', functionId);
            const payload = {};
            if (typeof body !== 'undefined') {
                payload['body'] = body;
            }
            if (typeof async !== 'undefined') {
                payload['async'] = async;
            }
            if (typeof xpath !== 'undefined') {
                payload['path'] = xpath;
            }
            if (typeof method !== 'undefined') {
                payload['method'] = method;
            }
            if (typeof headers !== 'undefined') {
                payload['headers'] = headers;
            }
            if (typeof scheduledAt !== 'undefined') {
                payload['scheduledAt'] = scheduledAt;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Get execution
     *
     * Get a function execution log by its unique ID.
     *
     * @param {string} functionId
     * @param {string} executionId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Execution>}
     */
    getExecution(functionId, executionId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof functionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "functionId"');
            }
            if (typeof executionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "executionId"');
            }
            const apiPath = '/functions/{functionId}/executions/{executionId}'.replace('{functionId}', functionId).replace('{executionId}', executionId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete execution
     *
     * Delete a function execution by its unique ID.

     *
     * @param {string} functionId
     * @param {string} executionId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteExecution(functionId, executionId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof functionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "functionId"');
            }
            if (typeof executionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "executionId"');
            }
            const apiPath = '/functions/{functionId}/executions/{executionId}'.replace('{functionId}', functionId).replace('{executionId}', executionId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * Get function usage
     *
     *
     * @param {string} functionId
     * @param {FunctionUsageRange} range
     * @throws {AppwriteException}
     * @returns {Promise<Models.UsageFunction>}
     */
    getFunctionUsage(functionId, range) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof functionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "functionId"');
            }
            const apiPath = '/functions/{functionId}/usage'.replace('{functionId}', functionId);
            const payload = {};
            if (typeof range !== 'undefined') {
                payload['range'] = range;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * List variables
     *
     * Get a list of all variables of a specific function.
     *
     * @param {string} functionId
     * @throws {AppwriteException}
     * @returns {Promise<Models.VariableList>}
     */
    listVariables(functionId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof functionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "functionId"');
            }
            const apiPath = '/functions/{functionId}/variables'.replace('{functionId}', functionId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Create variable
     *
     * Create a new function environment variable. These variables can be accessed in the function at runtime as environment variables.
     *
     * @param {string} functionId
     * @param {string} key
     * @param {string} value
     * @throws {AppwriteException}
     * @returns {Promise<Models.Variable>}
     */
    createVariable(functionId, key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof functionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "functionId"');
            }
            if (typeof key === 'undefined') {
                throw new AppwriteException('Missing required parameter: "key"');
            }
            if (typeof value === 'undefined') {
                throw new AppwriteException('Missing required parameter: "value"');
            }
            const apiPath = '/functions/{functionId}/variables'.replace('{functionId}', functionId);
            const payload = {};
            if (typeof key !== 'undefined') {
                payload['key'] = key;
            }
            if (typeof value !== 'undefined') {
                payload['value'] = value;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Get variable
     *
     * Get a variable by its unique ID.
     *
     * @param {string} functionId
     * @param {string} variableId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Variable>}
     */
    getVariable(functionId, variableId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof functionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "functionId"');
            }
            if (typeof variableId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "variableId"');
            }
            const apiPath = '/functions/{functionId}/variables/{variableId}'.replace('{functionId}', functionId).replace('{variableId}', variableId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Update variable
     *
     * Update variable by its unique ID.
     *
     * @param {string} functionId
     * @param {string} variableId
     * @param {string} key
     * @param {string} value
     * @throws {AppwriteException}
     * @returns {Promise<Models.Variable>}
     */
    updateVariable(functionId, variableId, key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof functionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "functionId"');
            }
            if (typeof variableId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "variableId"');
            }
            if (typeof key === 'undefined') {
                throw new AppwriteException('Missing required parameter: "key"');
            }
            const apiPath = '/functions/{functionId}/variables/{variableId}'.replace('{functionId}', functionId).replace('{variableId}', variableId);
            const payload = {};
            if (typeof key !== 'undefined') {
                payload['key'] = key;
            }
            if (typeof value !== 'undefined') {
                payload['value'] = value;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('put', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete variable
     *
     * Delete a variable by its unique ID.
     *
     * @param {string} functionId
     * @param {string} variableId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteVariable(functionId, variableId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof functionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "functionId"');
            }
            if (typeof variableId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "variableId"');
            }
            const apiPath = '/functions/{functionId}/variables/{variableId}'.replace('{functionId}', functionId).replace('{variableId}', variableId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
}

class Graphql {
    constructor(client) {
        this.client = client;
    }
    /**
     * GraphQL endpoint
     *
     * Execute a GraphQL mutation.
     *
     * @param {object} query
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    query(query) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof query === 'undefined') {
                throw new AppwriteException('Missing required parameter: "query"');
            }
            const apiPath = '/graphql';
            const payload = {};
            if (typeof query !== 'undefined') {
                payload['query'] = query;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'x-sdk-graphql': 'true',
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * GraphQL endpoint
     *
     * Execute a GraphQL mutation.
     *
     * @param {object} query
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    mutation(query) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof query === 'undefined') {
                throw new AppwriteException('Missing required parameter: "query"');
            }
            const apiPath = '/graphql/mutation';
            const payload = {};
            if (typeof query !== 'undefined') {
                payload['query'] = query;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'x-sdk-graphql': 'true',
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
}

class Health {
    constructor(client) {
        this.client = client;
    }
    /**
     * Get HTTP
     *
     * Check the Appconda HTTP server is up and responsive.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthStatus>}
     */
    get() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/health';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get antivirus
     *
     * Check the Appconda Antivirus server is up and connection is successful.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthAntivirus>}
     */
    getAntivirus() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/health/anti-virus';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get cache
     *
     * Check the Appconda in-memory cache servers are up and connection is successful.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthStatus>}
     */
    getCache() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/health/cache';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get the SSL certificate for a domain
     *
     * Get the SSL certificate for a domain
     *
     * @param {string} domain
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthCertificate>}
     */
    getCertificate(domain) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/health/certificate';
            const payload = {};
            if (typeof domain !== 'undefined') {
                payload['domain'] = domain;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get DB
     *
     * Check the Appconda database servers are up and connection is successful.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthStatus>}
     */
    getDB() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/health/db';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get pubsub
     *
     * Check the Appconda pub-sub servers are up and connection is successful.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthStatus>}
     */
    getPubSub() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/health/pubsub';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get queue
     *
     * Check the Appconda queue messaging servers are up and connection is successful.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthStatus>}
     */
    getQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/health/queue';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get builds queue
     *
     * Get the number of builds that are waiting to be processed in the Appconda internal queue server.
     *
     * @param {number} threshold
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthQueue>}
     */
    getQueueBuilds(threshold) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/health/queue/builds';
            const payload = {};
            if (typeof threshold !== 'undefined') {
                payload['threshold'] = threshold;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get certificates queue
     *
     * Get the number of certificates that are waiting to be issued against [Letsencrypt](https://letsencrypt.org/) in the Appconda internal queue server.
     *
     * @param {number} threshold
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthQueue>}
     */
    getQueueCertificates(threshold) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/health/queue/certificates';
            const payload = {};
            if (typeof threshold !== 'undefined') {
                payload['threshold'] = threshold;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get databases queue
     *
     * Get the number of database changes that are waiting to be processed in the Appconda internal queue server.
     *
     * @param {string} name
     * @param {number} threshold
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthQueue>}
     */
    getQueueDatabases(name, threshold) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/health/queue/databases';
            const payload = {};
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof threshold !== 'undefined') {
                payload['threshold'] = threshold;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get deletes queue
     *
     * Get the number of background destructive changes that are waiting to be processed in the Appconda internal queue server.
     *
     * @param {number} threshold
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthQueue>}
     */
    getQueueDeletes(threshold) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/health/queue/deletes';
            const payload = {};
            if (typeof threshold !== 'undefined') {
                payload['threshold'] = threshold;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get number of failed queue jobs
     *
     * Returns the amount of failed jobs in a given queue.

     *
     * @param {Name} name
     * @param {number} threshold
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthQueue>}
     */
    getFailedJobs(name, threshold) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            const apiPath = '/health/queue/failed/{name}'.replace('{name}', name);
            const payload = {};
            if (typeof threshold !== 'undefined') {
                payload['threshold'] = threshold;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get functions queue
     *
     * Get the number of function executions that are waiting to be processed in the Appconda internal queue server.
     *
     * @param {number} threshold
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthQueue>}
     */
    getQueueFunctions(threshold) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/health/queue/functions';
            const payload = {};
            if (typeof threshold !== 'undefined') {
                payload['threshold'] = threshold;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get logs queue
     *
     * Get the number of logs that are waiting to be processed in the Appconda internal queue server.
     *
     * @param {number} threshold
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthQueue>}
     */
    getQueueLogs(threshold) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/health/queue/logs';
            const payload = {};
            if (typeof threshold !== 'undefined') {
                payload['threshold'] = threshold;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get mails queue
     *
     * Get the number of mails that are waiting to be processed in the Appconda internal queue server.
     *
     * @param {number} threshold
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthQueue>}
     */
    getQueueMails(threshold) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/health/queue/mails';
            const payload = {};
            if (typeof threshold !== 'undefined') {
                payload['threshold'] = threshold;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get messaging queue
     *
     * Get the number of messages that are waiting to be processed in the Appconda internal queue server.
     *
     * @param {number} threshold
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthQueue>}
     */
    getQueueMessaging(threshold) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/health/queue/messaging';
            const payload = {};
            if (typeof threshold !== 'undefined') {
                payload['threshold'] = threshold;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get migrations queue
     *
     * Get the number of migrations that are waiting to be processed in the Appconda internal queue server.
     *
     * @param {number} threshold
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthQueue>}
     */
    getQueueMigrations(threshold) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/health/queue/migrations';
            const payload = {};
            if (typeof threshold !== 'undefined') {
                payload['threshold'] = threshold;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get usage queue
     *
     * Get the number of metrics that are waiting to be processed in the Appconda internal queue server.
     *
     * @param {number} threshold
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthQueue>}
     */
    getQueueUsage(threshold) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/health/queue/usage';
            const payload = {};
            if (typeof threshold !== 'undefined') {
                payload['threshold'] = threshold;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get usage dump queue
     *
     * Get the number of projects containing metrics that are waiting to be processed in the Appconda internal queue server.
     *
     * @param {number} threshold
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthQueue>}
     */
    getQueueUsageDump(threshold) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/health/queue/usage-dump';
            const payload = {};
            if (typeof threshold !== 'undefined') {
                payload['threshold'] = threshold;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get webhooks queue
     *
     * Get the number of webhooks that are waiting to be processed in the Appconda internal queue server.
     *
     * @param {number} threshold
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthQueue>}
     */
    getQueueWebhooks(threshold) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/health/queue/webhooks';
            const payload = {};
            if (typeof threshold !== 'undefined') {
                payload['threshold'] = threshold;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get storage
     *
     * Check the Appconda storage device is up and connection is successful.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthStatus>}
     */
    getStorage() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/health/storage';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get local storage
     *
     * Check the Appconda local storage device is up and connection is successful.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthStatus>}
     */
    getStorageLocal() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/health/storage/local';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get time
     *
     * Check the Appconda server time is synced with Google remote NTP server. We use this technology to smoothly handle leap seconds with no disruptive events. The [Network Time Protocol](https://en.wikipedia.org/wiki/Network_Time_Protocol) (NTP) is used by hundreds of millions of computers and devices to synchronize their clocks over the Internet. If your computer sets its own clock, it likely uses NTP.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthTime>}
     */
    getTime() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/health/time';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
}

class Locale {
    constructor(client) {
        this.client = client;
    }
    /**
     * Get user locale
     *
     * Get the current user location based on IP. Returns an object with user country code, country name, continent name, continent code, ip address and suggested currency. You can use the locale header to get the data in a supported language.

([IP Geolocation by DB-IP](https://db-ip.com))
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.Locale>}
     */
    get() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/locale';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * List Locale Codes
     *
     * List of all locale codes in [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.LocaleCodeList>}
     */
    listCodes() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/locale/codes';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * List continents
     *
     * List of all continents. You can use the locale header to get the data in a supported language.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.ContinentList>}
     */
    listContinents() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/locale/continents';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * List countries
     *
     * List of all countries. You can use the locale header to get the data in a supported language.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.CountryList>}
     */
    listCountries() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/locale/countries';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * List EU countries
     *
     * List of all countries that are currently members of the EU. You can use the locale header to get the data in a supported language.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.CountryList>}
     */
    listCountriesEU() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/locale/countries/eu';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * List countries phone codes
     *
     * List of all countries phone codes. You can use the locale header to get the data in a supported language.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.PhoneList>}
     */
    listCountriesPhones() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/locale/countries/phones';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * List currencies
     *
     * List of all currencies, including currency symbol, name, plural, and decimal digits for all major and minor currencies. You can use the locale header to get the data in a supported language.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.CurrencyList>}
     */
    listCurrencies() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/locale/currencies';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * List languages
     *
     * List of all languages classified by ISO 639-1 including 2-letter code, name in English, and name in the respective language.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.LanguageList>}
     */
    listLanguages() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/locale/languages';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
}

class Messaging {
    constructor(client) {
        this.client = client;
    }
    /**
     * List messages
     *
     * Get a list of all messages from the current Appconda project.
     *
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppwriteException}
     * @returns {Promise<Models.MessageList>}
     */
    listMessages(queries, search) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/messaging/messages';
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            if (typeof search !== 'undefined') {
                payload['search'] = search;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Create email
     *
     * Create a new email message.
     *
     * @param {string} messageId
     * @param {string} subject
     * @param {string} content
     * @param {string[]} topics
     * @param {string[]} users
     * @param {string[]} targets
     * @param {string[]} cc
     * @param {string[]} bcc
     * @param {string[]} attachments
     * @param {boolean} draft
     * @param {boolean} html
     * @param {string} scheduledAt
     * @throws {AppwriteException}
     * @returns {Promise<Models.Message>}
     */
    createEmail(messageId, subject, content, topics, users, targets, cc, bcc, attachments, draft, html, scheduledAt) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof messageId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "messageId"');
            }
            if (typeof subject === 'undefined') {
                throw new AppwriteException('Missing required parameter: "subject"');
            }
            if (typeof content === 'undefined') {
                throw new AppwriteException('Missing required parameter: "content"');
            }
            const apiPath = '/messaging/messages/email';
            const payload = {};
            if (typeof messageId !== 'undefined') {
                payload['messageId'] = messageId;
            }
            if (typeof subject !== 'undefined') {
                payload['subject'] = subject;
            }
            if (typeof content !== 'undefined') {
                payload['content'] = content;
            }
            if (typeof topics !== 'undefined') {
                payload['topics'] = topics;
            }
            if (typeof users !== 'undefined') {
                payload['users'] = users;
            }
            if (typeof targets !== 'undefined') {
                payload['targets'] = targets;
            }
            if (typeof cc !== 'undefined') {
                payload['cc'] = cc;
            }
            if (typeof bcc !== 'undefined') {
                payload['bcc'] = bcc;
            }
            if (typeof attachments !== 'undefined') {
                payload['attachments'] = attachments;
            }
            if (typeof draft !== 'undefined') {
                payload['draft'] = draft;
            }
            if (typeof html !== 'undefined') {
                payload['html'] = html;
            }
            if (typeof scheduledAt !== 'undefined') {
                payload['scheduledAt'] = scheduledAt;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Update email
     *
     * Update an email message by its unique ID.

     *
     * @param {string} messageId
     * @param {string[]} topics
     * @param {string[]} users
     * @param {string[]} targets
     * @param {string} subject
     * @param {string} content
     * @param {boolean} draft
     * @param {boolean} html
     * @param {string[]} cc
     * @param {string[]} bcc
     * @param {string} scheduledAt
     * @param {string[]} attachments
     * @throws {AppwriteException}
     * @returns {Promise<Models.Message>}
     */
    updateEmail(messageId, topics, users, targets, subject, content, draft, html, cc, bcc, scheduledAt, attachments) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof messageId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "messageId"');
            }
            const apiPath = '/messaging/messages/email/{messageId}'.replace('{messageId}', messageId);
            const payload = {};
            if (typeof topics !== 'undefined') {
                payload['topics'] = topics;
            }
            if (typeof users !== 'undefined') {
                payload['users'] = users;
            }
            if (typeof targets !== 'undefined') {
                payload['targets'] = targets;
            }
            if (typeof subject !== 'undefined') {
                payload['subject'] = subject;
            }
            if (typeof content !== 'undefined') {
                payload['content'] = content;
            }
            if (typeof draft !== 'undefined') {
                payload['draft'] = draft;
            }
            if (typeof html !== 'undefined') {
                payload['html'] = html;
            }
            if (typeof cc !== 'undefined') {
                payload['cc'] = cc;
            }
            if (typeof bcc !== 'undefined') {
                payload['bcc'] = bcc;
            }
            if (typeof scheduledAt !== 'undefined') {
                payload['scheduledAt'] = scheduledAt;
            }
            if (typeof attachments !== 'undefined') {
                payload['attachments'] = attachments;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Create push notification
     *
     * Create a new push notification.
     *
     * @param {string} messageId
     * @param {string} title
     * @param {string} body
     * @param {string[]} topics
     * @param {string[]} users
     * @param {string[]} targets
     * @param {object} data
     * @param {string} action
     * @param {string} image
     * @param {string} icon
     * @param {string} sound
     * @param {string} color
     * @param {string} tag
     * @param {string} badge
     * @param {boolean} draft
     * @param {string} scheduledAt
     * @throws {AppwriteException}
     * @returns {Promise<Models.Message>}
     */
    createPush(messageId, title, body, topics, users, targets, data, action, image, icon, sound, color, tag, badge, draft, scheduledAt) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof messageId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "messageId"');
            }
            if (typeof title === 'undefined') {
                throw new AppwriteException('Missing required parameter: "title"');
            }
            if (typeof body === 'undefined') {
                throw new AppwriteException('Missing required parameter: "body"');
            }
            const apiPath = '/messaging/messages/push';
            const payload = {};
            if (typeof messageId !== 'undefined') {
                payload['messageId'] = messageId;
            }
            if (typeof title !== 'undefined') {
                payload['title'] = title;
            }
            if (typeof body !== 'undefined') {
                payload['body'] = body;
            }
            if (typeof topics !== 'undefined') {
                payload['topics'] = topics;
            }
            if (typeof users !== 'undefined') {
                payload['users'] = users;
            }
            if (typeof targets !== 'undefined') {
                payload['targets'] = targets;
            }
            if (typeof data !== 'undefined') {
                payload['data'] = data;
            }
            if (typeof action !== 'undefined') {
                payload['action'] = action;
            }
            if (typeof image !== 'undefined') {
                payload['image'] = image;
            }
            if (typeof icon !== 'undefined') {
                payload['icon'] = icon;
            }
            if (typeof sound !== 'undefined') {
                payload['sound'] = sound;
            }
            if (typeof color !== 'undefined') {
                payload['color'] = color;
            }
            if (typeof tag !== 'undefined') {
                payload['tag'] = tag;
            }
            if (typeof badge !== 'undefined') {
                payload['badge'] = badge;
            }
            if (typeof draft !== 'undefined') {
                payload['draft'] = draft;
            }
            if (typeof scheduledAt !== 'undefined') {
                payload['scheduledAt'] = scheduledAt;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Update push notification
     *
     * Update a push notification by its unique ID.

     *
     * @param {string} messageId
     * @param {string[]} topics
     * @param {string[]} users
     * @param {string[]} targets
     * @param {string} title
     * @param {string} body
     * @param {object} data
     * @param {string} action
     * @param {string} image
     * @param {string} icon
     * @param {string} sound
     * @param {string} color
     * @param {string} tag
     * @param {number} badge
     * @param {boolean} draft
     * @param {string} scheduledAt
     * @throws {AppwriteException}
     * @returns {Promise<Models.Message>}
     */
    updatePush(messageId, topics, users, targets, title, body, data, action, image, icon, sound, color, tag, badge, draft, scheduledAt) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof messageId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "messageId"');
            }
            const apiPath = '/messaging/messages/push/{messageId}'.replace('{messageId}', messageId);
            const payload = {};
            if (typeof topics !== 'undefined') {
                payload['topics'] = topics;
            }
            if (typeof users !== 'undefined') {
                payload['users'] = users;
            }
            if (typeof targets !== 'undefined') {
                payload['targets'] = targets;
            }
            if (typeof title !== 'undefined') {
                payload['title'] = title;
            }
            if (typeof body !== 'undefined') {
                payload['body'] = body;
            }
            if (typeof data !== 'undefined') {
                payload['data'] = data;
            }
            if (typeof action !== 'undefined') {
                payload['action'] = action;
            }
            if (typeof image !== 'undefined') {
                payload['image'] = image;
            }
            if (typeof icon !== 'undefined') {
                payload['icon'] = icon;
            }
            if (typeof sound !== 'undefined') {
                payload['sound'] = sound;
            }
            if (typeof color !== 'undefined') {
                payload['color'] = color;
            }
            if (typeof tag !== 'undefined') {
                payload['tag'] = tag;
            }
            if (typeof badge !== 'undefined') {
                payload['badge'] = badge;
            }
            if (typeof draft !== 'undefined') {
                payload['draft'] = draft;
            }
            if (typeof scheduledAt !== 'undefined') {
                payload['scheduledAt'] = scheduledAt;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Create SMS
     *
     * Create a new SMS message.
     *
     * @param {string} messageId
     * @param {string} content
     * @param {string[]} topics
     * @param {string[]} users
     * @param {string[]} targets
     * @param {boolean} draft
     * @param {string} scheduledAt
     * @throws {AppwriteException}
     * @returns {Promise<Models.Message>}
     */
    createSms(messageId, content, topics, users, targets, draft, scheduledAt) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof messageId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "messageId"');
            }
            if (typeof content === 'undefined') {
                throw new AppwriteException('Missing required parameter: "content"');
            }
            const apiPath = '/messaging/messages/sms';
            const payload = {};
            if (typeof messageId !== 'undefined') {
                payload['messageId'] = messageId;
            }
            if (typeof content !== 'undefined') {
                payload['content'] = content;
            }
            if (typeof topics !== 'undefined') {
                payload['topics'] = topics;
            }
            if (typeof users !== 'undefined') {
                payload['users'] = users;
            }
            if (typeof targets !== 'undefined') {
                payload['targets'] = targets;
            }
            if (typeof draft !== 'undefined') {
                payload['draft'] = draft;
            }
            if (typeof scheduledAt !== 'undefined') {
                payload['scheduledAt'] = scheduledAt;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Update SMS
     *
     * Update an email message by its unique ID.

     *
     * @param {string} messageId
     * @param {string[]} topics
     * @param {string[]} users
     * @param {string[]} targets
     * @param {string} content
     * @param {boolean} draft
     * @param {string} scheduledAt
     * @throws {AppwriteException}
     * @returns {Promise<Models.Message>}
     */
    updateSms(messageId, topics, users, targets, content, draft, scheduledAt) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof messageId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "messageId"');
            }
            const apiPath = '/messaging/messages/sms/{messageId}'.replace('{messageId}', messageId);
            const payload = {};
            if (typeof topics !== 'undefined') {
                payload['topics'] = topics;
            }
            if (typeof users !== 'undefined') {
                payload['users'] = users;
            }
            if (typeof targets !== 'undefined') {
                payload['targets'] = targets;
            }
            if (typeof content !== 'undefined') {
                payload['content'] = content;
            }
            if (typeof draft !== 'undefined') {
                payload['draft'] = draft;
            }
            if (typeof scheduledAt !== 'undefined') {
                payload['scheduledAt'] = scheduledAt;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Get message
     *
     * Get a message by its unique ID.

     *
     * @param {string} messageId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Message>}
     */
    getMessage(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof messageId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "messageId"');
            }
            const apiPath = '/messaging/messages/{messageId}'.replace('{messageId}', messageId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete message
     *
     * Delete a message. If the message is not a draft or scheduled, but has been sent, this will not recall the message.
     *
     * @param {string} messageId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    delete(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof messageId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "messageId"');
            }
            const apiPath = '/messaging/messages/{messageId}'.replace('{messageId}', messageId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * List message logs
     *
     * Get the message activity logs listed by its unique ID.
     *
     * @param {string} messageId
     * @param {string[]} queries
     * @throws {AppwriteException}
     * @returns {Promise<Models.LogList>}
     */
    listMessageLogs(messageId, queries) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof messageId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "messageId"');
            }
            const apiPath = '/messaging/messages/{messageId}/logs'.replace('{messageId}', messageId);
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * List message targets
     *
     * Get a list of the targets associated with a message.
     *
     * @param {string} messageId
     * @param {string[]} queries
     * @throws {AppwriteException}
     * @returns {Promise<Models.TargetList>}
     */
    listTargets(messageId, queries) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof messageId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "messageId"');
            }
            const apiPath = '/messaging/messages/{messageId}/targets'.replace('{messageId}', messageId);
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * List providers
     *
     * Get a list of all providers from the current Appconda project.
     *
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppwriteException}
     * @returns {Promise<Models.ProviderList>}
     */
    listProviders(queries, search) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/messaging/providers';
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            if (typeof search !== 'undefined') {
                payload['search'] = search;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Create APNS provider
     *
     * Create a new Apple Push Notification service provider.
     *
     * @param {string} providerId
     * @param {string} name
     * @param {string} authKey
     * @param {string} authKeyId
     * @param {string} teamId
     * @param {string} bundleId
     * @param {boolean} sandbox
     * @param {boolean} enabled
     * @throws {AppwriteException}
     * @returns {Promise<Models.Provider>}
     */
    createApnsProvider(providerId, name, authKey, authKeyId, teamId, bundleId, sandbox, enabled) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof providerId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "providerId"');
            }
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            const apiPath = '/messaging/providers/apns';
            const payload = {};
            if (typeof providerId !== 'undefined') {
                payload['providerId'] = providerId;
            }
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof authKey !== 'undefined') {
                payload['authKey'] = authKey;
            }
            if (typeof authKeyId !== 'undefined') {
                payload['authKeyId'] = authKeyId;
            }
            if (typeof teamId !== 'undefined') {
                payload['teamId'] = teamId;
            }
            if (typeof bundleId !== 'undefined') {
                payload['bundleId'] = bundleId;
            }
            if (typeof sandbox !== 'undefined') {
                payload['sandbox'] = sandbox;
            }
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Update APNS provider
     *
     * Update a Apple Push Notification service provider by its unique ID.
     *
     * @param {string} providerId
     * @param {string} name
     * @param {boolean} enabled
     * @param {string} authKey
     * @param {string} authKeyId
     * @param {string} teamId
     * @param {string} bundleId
     * @param {boolean} sandbox
     * @throws {AppwriteException}
     * @returns {Promise<Models.Provider>}
     */
    updateApnsProvider(providerId, name, enabled, authKey, authKeyId, teamId, bundleId, sandbox) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof providerId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "providerId"');
            }
            const apiPath = '/messaging/providers/apns/{providerId}'.replace('{providerId}', providerId);
            const payload = {};
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            if (typeof authKey !== 'undefined') {
                payload['authKey'] = authKey;
            }
            if (typeof authKeyId !== 'undefined') {
                payload['authKeyId'] = authKeyId;
            }
            if (typeof teamId !== 'undefined') {
                payload['teamId'] = teamId;
            }
            if (typeof bundleId !== 'undefined') {
                payload['bundleId'] = bundleId;
            }
            if (typeof sandbox !== 'undefined') {
                payload['sandbox'] = sandbox;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Create FCM provider
     *
     * Create a new Firebase Cloud Messaging provider.
     *
     * @param {string} providerId
     * @param {string} name
     * @param {object} serviceAccountJSON
     * @param {boolean} enabled
     * @throws {AppwriteException}
     * @returns {Promise<Models.Provider>}
     */
    createFcmProvider(providerId, name, serviceAccountJSON, enabled) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof providerId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "providerId"');
            }
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            const apiPath = '/messaging/providers/fcm';
            const payload = {};
            if (typeof providerId !== 'undefined') {
                payload['providerId'] = providerId;
            }
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof serviceAccountJSON !== 'undefined') {
                payload['serviceAccountJSON'] = serviceAccountJSON;
            }
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Update FCM provider
     *
     * Update a Firebase Cloud Messaging provider by its unique ID.
     *
     * @param {string} providerId
     * @param {string} name
     * @param {boolean} enabled
     * @param {object} serviceAccountJSON
     * @throws {AppwriteException}
     * @returns {Promise<Models.Provider>}
     */
    updateFcmProvider(providerId, name, enabled, serviceAccountJSON) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof providerId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "providerId"');
            }
            const apiPath = '/messaging/providers/fcm/{providerId}'.replace('{providerId}', providerId);
            const payload = {};
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            if (typeof serviceAccountJSON !== 'undefined') {
                payload['serviceAccountJSON'] = serviceAccountJSON;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Create Mailgun provider
     *
     * Create a new Mailgun provider.
     *
     * @param {string} providerId
     * @param {string} name
     * @param {string} apiKey
     * @param {string} domain
     * @param {boolean} isEuRegion
     * @param {string} fromName
     * @param {string} fromEmail
     * @param {string} replyToName
     * @param {string} replyToEmail
     * @param {boolean} enabled
     * @throws {AppwriteException}
     * @returns {Promise<Models.Provider>}
     */
    createMailgunProvider(providerId, name, apiKey, domain, isEuRegion, fromName, fromEmail, replyToName, replyToEmail, enabled) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof providerId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "providerId"');
            }
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            const apiPath = '/messaging/providers/mailgun';
            const payload = {};
            if (typeof providerId !== 'undefined') {
                payload['providerId'] = providerId;
            }
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof apiKey !== 'undefined') {
                payload['apiKey'] = apiKey;
            }
            if (typeof domain !== 'undefined') {
                payload['domain'] = domain;
            }
            if (typeof isEuRegion !== 'undefined') {
                payload['isEuRegion'] = isEuRegion;
            }
            if (typeof fromName !== 'undefined') {
                payload['fromName'] = fromName;
            }
            if (typeof fromEmail !== 'undefined') {
                payload['fromEmail'] = fromEmail;
            }
            if (typeof replyToName !== 'undefined') {
                payload['replyToName'] = replyToName;
            }
            if (typeof replyToEmail !== 'undefined') {
                payload['replyToEmail'] = replyToEmail;
            }
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Update Mailgun provider
     *
     * Update a Mailgun provider by its unique ID.
     *
     * @param {string} providerId
     * @param {string} name
     * @param {string} apiKey
     * @param {string} domain
     * @param {boolean} isEuRegion
     * @param {boolean} enabled
     * @param {string} fromName
     * @param {string} fromEmail
     * @param {string} replyToName
     * @param {string} replyToEmail
     * @throws {AppwriteException}
     * @returns {Promise<Models.Provider>}
     */
    updateMailgunProvider(providerId, name, apiKey, domain, isEuRegion, enabled, fromName, fromEmail, replyToName, replyToEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof providerId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "providerId"');
            }
            const apiPath = '/messaging/providers/mailgun/{providerId}'.replace('{providerId}', providerId);
            const payload = {};
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof apiKey !== 'undefined') {
                payload['apiKey'] = apiKey;
            }
            if (typeof domain !== 'undefined') {
                payload['domain'] = domain;
            }
            if (typeof isEuRegion !== 'undefined') {
                payload['isEuRegion'] = isEuRegion;
            }
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            if (typeof fromName !== 'undefined') {
                payload['fromName'] = fromName;
            }
            if (typeof fromEmail !== 'undefined') {
                payload['fromEmail'] = fromEmail;
            }
            if (typeof replyToName !== 'undefined') {
                payload['replyToName'] = replyToName;
            }
            if (typeof replyToEmail !== 'undefined') {
                payload['replyToEmail'] = replyToEmail;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Create Msg91 provider
     *
     * Create a new MSG91 provider.
     *
     * @param {string} providerId
     * @param {string} name
     * @param {string} templateId
     * @param {string} senderId
     * @param {string} authKey
     * @param {boolean} enabled
     * @throws {AppwriteException}
     * @returns {Promise<Models.Provider>}
     */
    createMsg91Provider(providerId, name, templateId, senderId, authKey, enabled) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof providerId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "providerId"');
            }
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            const apiPath = '/messaging/providers/msg91';
            const payload = {};
            if (typeof providerId !== 'undefined') {
                payload['providerId'] = providerId;
            }
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof templateId !== 'undefined') {
                payload['templateId'] = templateId;
            }
            if (typeof senderId !== 'undefined') {
                payload['senderId'] = senderId;
            }
            if (typeof authKey !== 'undefined') {
                payload['authKey'] = authKey;
            }
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Update Msg91 provider
     *
     * Update a MSG91 provider by its unique ID.
     *
     * @param {string} providerId
     * @param {string} name
     * @param {boolean} enabled
     * @param {string} templateId
     * @param {string} senderId
     * @param {string} authKey
     * @throws {AppwriteException}
     * @returns {Promise<Models.Provider>}
     */
    updateMsg91Provider(providerId, name, enabled, templateId, senderId, authKey) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof providerId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "providerId"');
            }
            const apiPath = '/messaging/providers/msg91/{providerId}'.replace('{providerId}', providerId);
            const payload = {};
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            if (typeof templateId !== 'undefined') {
                payload['templateId'] = templateId;
            }
            if (typeof senderId !== 'undefined') {
                payload['senderId'] = senderId;
            }
            if (typeof authKey !== 'undefined') {
                payload['authKey'] = authKey;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Create Sendgrid provider
     *
     * Create a new Sendgrid provider.
     *
     * @param {string} providerId
     * @param {string} name
     * @param {string} apiKey
     * @param {string} fromName
     * @param {string} fromEmail
     * @param {string} replyToName
     * @param {string} replyToEmail
     * @param {boolean} enabled
     * @throws {AppwriteException}
     * @returns {Promise<Models.Provider>}
     */
    createSendgridProvider(providerId, name, apiKey, fromName, fromEmail, replyToName, replyToEmail, enabled) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof providerId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "providerId"');
            }
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            const apiPath = '/messaging/providers/sendgrid';
            const payload = {};
            if (typeof providerId !== 'undefined') {
                payload['providerId'] = providerId;
            }
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof apiKey !== 'undefined') {
                payload['apiKey'] = apiKey;
            }
            if (typeof fromName !== 'undefined') {
                payload['fromName'] = fromName;
            }
            if (typeof fromEmail !== 'undefined') {
                payload['fromEmail'] = fromEmail;
            }
            if (typeof replyToName !== 'undefined') {
                payload['replyToName'] = replyToName;
            }
            if (typeof replyToEmail !== 'undefined') {
                payload['replyToEmail'] = replyToEmail;
            }
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Update Sendgrid provider
     *
     * Update a Sendgrid provider by its unique ID.
     *
     * @param {string} providerId
     * @param {string} name
     * @param {boolean} enabled
     * @param {string} apiKey
     * @param {string} fromName
     * @param {string} fromEmail
     * @param {string} replyToName
     * @param {string} replyToEmail
     * @throws {AppwriteException}
     * @returns {Promise<Models.Provider>}
     */
    updateSendgridProvider(providerId, name, enabled, apiKey, fromName, fromEmail, replyToName, replyToEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof providerId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "providerId"');
            }
            const apiPath = '/messaging/providers/sendgrid/{providerId}'.replace('{providerId}', providerId);
            const payload = {};
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            if (typeof apiKey !== 'undefined') {
                payload['apiKey'] = apiKey;
            }
            if (typeof fromName !== 'undefined') {
                payload['fromName'] = fromName;
            }
            if (typeof fromEmail !== 'undefined') {
                payload['fromEmail'] = fromEmail;
            }
            if (typeof replyToName !== 'undefined') {
                payload['replyToName'] = replyToName;
            }
            if (typeof replyToEmail !== 'undefined') {
                payload['replyToEmail'] = replyToEmail;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Create SMTP provider
     *
     * Create a new SMTP provider.
     *
     * @param {string} providerId
     * @param {string} name
     * @param {string} host
     * @param {number} port
     * @param {string} username
     * @param {string} password
     * @param {SmtpEncryption} encryption
     * @param {boolean} autoTLS
     * @param {string} mailer
     * @param {string} fromName
     * @param {string} fromEmail
     * @param {string} replyToName
     * @param {string} replyToEmail
     * @param {boolean} enabled
     * @throws {AppwriteException}
     * @returns {Promise<Models.Provider>}
     */
    createSmtpProvider(providerId, name, host, port, username, password, encryption, autoTLS, mailer, fromName, fromEmail, replyToName, replyToEmail, enabled) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof providerId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "providerId"');
            }
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            if (typeof host === 'undefined') {
                throw new AppwriteException('Missing required parameter: "host"');
            }
            const apiPath = '/messaging/providers/smtp';
            const payload = {};
            if (typeof providerId !== 'undefined') {
                payload['providerId'] = providerId;
            }
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof host !== 'undefined') {
                payload['host'] = host;
            }
            if (typeof port !== 'undefined') {
                payload['port'] = port;
            }
            if (typeof username !== 'undefined') {
                payload['username'] = username;
            }
            if (typeof password !== 'undefined') {
                payload['password'] = password;
            }
            if (typeof encryption !== 'undefined') {
                payload['encryption'] = encryption;
            }
            if (typeof autoTLS !== 'undefined') {
                payload['autoTLS'] = autoTLS;
            }
            if (typeof mailer !== 'undefined') {
                payload['mailer'] = mailer;
            }
            if (typeof fromName !== 'undefined') {
                payload['fromName'] = fromName;
            }
            if (typeof fromEmail !== 'undefined') {
                payload['fromEmail'] = fromEmail;
            }
            if (typeof replyToName !== 'undefined') {
                payload['replyToName'] = replyToName;
            }
            if (typeof replyToEmail !== 'undefined') {
                payload['replyToEmail'] = replyToEmail;
            }
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Update SMTP provider
     *
     * Update a SMTP provider by its unique ID.
     *
     * @param {string} providerId
     * @param {string} name
     * @param {string} host
     * @param {number} port
     * @param {string} username
     * @param {string} password
     * @param {SmtpEncryption} encryption
     * @param {boolean} autoTLS
     * @param {string} mailer
     * @param {string} fromName
     * @param {string} fromEmail
     * @param {string} replyToName
     * @param {string} replyToEmail
     * @param {boolean} enabled
     * @throws {AppwriteException}
     * @returns {Promise<Models.Provider>}
     */
    updateSmtpProvider(providerId, name, host, port, username, password, encryption, autoTLS, mailer, fromName, fromEmail, replyToName, replyToEmail, enabled) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof providerId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "providerId"');
            }
            const apiPath = '/messaging/providers/smtp/{providerId}'.replace('{providerId}', providerId);
            const payload = {};
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof host !== 'undefined') {
                payload['host'] = host;
            }
            if (typeof port !== 'undefined') {
                payload['port'] = port;
            }
            if (typeof username !== 'undefined') {
                payload['username'] = username;
            }
            if (typeof password !== 'undefined') {
                payload['password'] = password;
            }
            if (typeof encryption !== 'undefined') {
                payload['encryption'] = encryption;
            }
            if (typeof autoTLS !== 'undefined') {
                payload['autoTLS'] = autoTLS;
            }
            if (typeof mailer !== 'undefined') {
                payload['mailer'] = mailer;
            }
            if (typeof fromName !== 'undefined') {
                payload['fromName'] = fromName;
            }
            if (typeof fromEmail !== 'undefined') {
                payload['fromEmail'] = fromEmail;
            }
            if (typeof replyToName !== 'undefined') {
                payload['replyToName'] = replyToName;
            }
            if (typeof replyToEmail !== 'undefined') {
                payload['replyToEmail'] = replyToEmail;
            }
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Create Telesign provider
     *
     * Create a new Telesign provider.
     *
     * @param {string} providerId
     * @param {string} name
     * @param {string} from
     * @param {string} customerId
     * @param {string} apiKey
     * @param {boolean} enabled
     * @throws {AppwriteException}
     * @returns {Promise<Models.Provider>}
     */
    createTelesignProvider(providerId, name, from, customerId, apiKey, enabled) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof providerId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "providerId"');
            }
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            const apiPath = '/messaging/providers/telesign';
            const payload = {};
            if (typeof providerId !== 'undefined') {
                payload['providerId'] = providerId;
            }
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof from !== 'undefined') {
                payload['from'] = from;
            }
            if (typeof customerId !== 'undefined') {
                payload['customerId'] = customerId;
            }
            if (typeof apiKey !== 'undefined') {
                payload['apiKey'] = apiKey;
            }
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Update Telesign provider
     *
     * Update a Telesign provider by its unique ID.
     *
     * @param {string} providerId
     * @param {string} name
     * @param {boolean} enabled
     * @param {string} customerId
     * @param {string} apiKey
     * @param {string} from
     * @throws {AppwriteException}
     * @returns {Promise<Models.Provider>}
     */
    updateTelesignProvider(providerId, name, enabled, customerId, apiKey, from) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof providerId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "providerId"');
            }
            const apiPath = '/messaging/providers/telesign/{providerId}'.replace('{providerId}', providerId);
            const payload = {};
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            if (typeof customerId !== 'undefined') {
                payload['customerId'] = customerId;
            }
            if (typeof apiKey !== 'undefined') {
                payload['apiKey'] = apiKey;
            }
            if (typeof from !== 'undefined') {
                payload['from'] = from;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Create Textmagic provider
     *
     * Create a new Textmagic provider.
     *
     * @param {string} providerId
     * @param {string} name
     * @param {string} from
     * @param {string} username
     * @param {string} apiKey
     * @param {boolean} enabled
     * @throws {AppwriteException}
     * @returns {Promise<Models.Provider>}
     */
    createTextmagicProvider(providerId, name, from, username, apiKey, enabled) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof providerId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "providerId"');
            }
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            const apiPath = '/messaging/providers/textmagic';
            const payload = {};
            if (typeof providerId !== 'undefined') {
                payload['providerId'] = providerId;
            }
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof from !== 'undefined') {
                payload['from'] = from;
            }
            if (typeof username !== 'undefined') {
                payload['username'] = username;
            }
            if (typeof apiKey !== 'undefined') {
                payload['apiKey'] = apiKey;
            }
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Update Textmagic provider
     *
     * Update a Textmagic provider by its unique ID.
     *
     * @param {string} providerId
     * @param {string} name
     * @param {boolean} enabled
     * @param {string} username
     * @param {string} apiKey
     * @param {string} from
     * @throws {AppwriteException}
     * @returns {Promise<Models.Provider>}
     */
    updateTextmagicProvider(providerId, name, enabled, username, apiKey, from) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof providerId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "providerId"');
            }
            const apiPath = '/messaging/providers/textmagic/{providerId}'.replace('{providerId}', providerId);
            const payload = {};
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            if (typeof username !== 'undefined') {
                payload['username'] = username;
            }
            if (typeof apiKey !== 'undefined') {
                payload['apiKey'] = apiKey;
            }
            if (typeof from !== 'undefined') {
                payload['from'] = from;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Create Twilio provider
     *
     * Create a new Twilio provider.
     *
     * @param {string} providerId
     * @param {string} name
     * @param {string} from
     * @param {string} accountSid
     * @param {string} authToken
     * @param {boolean} enabled
     * @throws {AppwriteException}
     * @returns {Promise<Models.Provider>}
     */
    createTwilioProvider(providerId, name, from, accountSid, authToken, enabled) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof providerId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "providerId"');
            }
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            const apiPath = '/messaging/providers/twilio';
            const payload = {};
            if (typeof providerId !== 'undefined') {
                payload['providerId'] = providerId;
            }
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof from !== 'undefined') {
                payload['from'] = from;
            }
            if (typeof accountSid !== 'undefined') {
                payload['accountSid'] = accountSid;
            }
            if (typeof authToken !== 'undefined') {
                payload['authToken'] = authToken;
            }
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Update Twilio provider
     *
     * Update a Twilio provider by its unique ID.
     *
     * @param {string} providerId
     * @param {string} name
     * @param {boolean} enabled
     * @param {string} accountSid
     * @param {string} authToken
     * @param {string} from
     * @throws {AppwriteException}
     * @returns {Promise<Models.Provider>}
     */
    updateTwilioProvider(providerId, name, enabled, accountSid, authToken, from) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof providerId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "providerId"');
            }
            const apiPath = '/messaging/providers/twilio/{providerId}'.replace('{providerId}', providerId);
            const payload = {};
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            if (typeof accountSid !== 'undefined') {
                payload['accountSid'] = accountSid;
            }
            if (typeof authToken !== 'undefined') {
                payload['authToken'] = authToken;
            }
            if (typeof from !== 'undefined') {
                payload['from'] = from;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Create Vonage provider
     *
     * Create a new Vonage provider.
     *
     * @param {string} providerId
     * @param {string} name
     * @param {string} from
     * @param {string} apiKey
     * @param {string} apiSecret
     * @param {boolean} enabled
     * @throws {AppwriteException}
     * @returns {Promise<Models.Provider>}
     */
    createVonageProvider(providerId, name, from, apiKey, apiSecret, enabled) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof providerId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "providerId"');
            }
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            const apiPath = '/messaging/providers/vonage';
            const payload = {};
            if (typeof providerId !== 'undefined') {
                payload['providerId'] = providerId;
            }
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof from !== 'undefined') {
                payload['from'] = from;
            }
            if (typeof apiKey !== 'undefined') {
                payload['apiKey'] = apiKey;
            }
            if (typeof apiSecret !== 'undefined') {
                payload['apiSecret'] = apiSecret;
            }
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Update Vonage provider
     *
     * Update a Vonage provider by its unique ID.
     *
     * @param {string} providerId
     * @param {string} name
     * @param {boolean} enabled
     * @param {string} apiKey
     * @param {string} apiSecret
     * @param {string} from
     * @throws {AppwriteException}
     * @returns {Promise<Models.Provider>}
     */
    updateVonageProvider(providerId, name, enabled, apiKey, apiSecret, from) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof providerId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "providerId"');
            }
            const apiPath = '/messaging/providers/vonage/{providerId}'.replace('{providerId}', providerId);
            const payload = {};
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            if (typeof apiKey !== 'undefined') {
                payload['apiKey'] = apiKey;
            }
            if (typeof apiSecret !== 'undefined') {
                payload['apiSecret'] = apiSecret;
            }
            if (typeof from !== 'undefined') {
                payload['from'] = from;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Get provider
     *
     * Get a provider by its unique ID.

     *
     * @param {string} providerId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Provider>}
     */
    getProvider(providerId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof providerId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "providerId"');
            }
            const apiPath = '/messaging/providers/{providerId}'.replace('{providerId}', providerId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete provider
     *
     * Delete a provider by its unique ID.
     *
     * @param {string} providerId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteProvider(providerId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof providerId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "providerId"');
            }
            const apiPath = '/messaging/providers/{providerId}'.replace('{providerId}', providerId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * List provider logs
     *
     * Get the provider activity logs listed by its unique ID.
     *
     * @param {string} providerId
     * @param {string[]} queries
     * @throws {AppwriteException}
     * @returns {Promise<Models.LogList>}
     */
    listProviderLogs(providerId, queries) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof providerId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "providerId"');
            }
            const apiPath = '/messaging/providers/{providerId}/logs'.replace('{providerId}', providerId);
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * List subscriber logs
     *
     * Get the subscriber activity logs listed by its unique ID.
     *
     * @param {string} subscriberId
     * @param {string[]} queries
     * @throws {AppwriteException}
     * @returns {Promise<Models.LogList>}
     */
    listSubscriberLogs(subscriberId, queries) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof subscriberId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "subscriberId"');
            }
            const apiPath = '/messaging/subscribers/{subscriberId}/logs'.replace('{subscriberId}', subscriberId);
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * List topics
     *
     * Get a list of all topics from the current Appconda project.
     *
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppwriteException}
     * @returns {Promise<Models.TopicList>}
     */
    listTopics(queries, search) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/messaging/topics';
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            if (typeof search !== 'undefined') {
                payload['search'] = search;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Create topic
     *
     * Create a new topic.
     *
     * @param {string} topicId
     * @param {string} name
     * @param {string[]} subscribe
     * @throws {AppwriteException}
     * @returns {Promise<Models.Topic>}
     */
    createTopic(topicId, name, subscribe) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof topicId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "topicId"');
            }
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            const apiPath = '/messaging/topics';
            const payload = {};
            if (typeof topicId !== 'undefined') {
                payload['topicId'] = topicId;
            }
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof subscribe !== 'undefined') {
                payload['subscribe'] = subscribe;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Get topic
     *
     * Get a topic by its unique ID.

     *
     * @param {string} topicId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Topic>}
     */
    getTopic(topicId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof topicId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "topicId"');
            }
            const apiPath = '/messaging/topics/{topicId}'.replace('{topicId}', topicId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Update topic
     *
     * Update a topic by its unique ID.

     *
     * @param {string} topicId
     * @param {string} name
     * @param {string[]} subscribe
     * @throws {AppwriteException}
     * @returns {Promise<Models.Topic>}
     */
    updateTopic(topicId, name, subscribe) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof topicId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "topicId"');
            }
            const apiPath = '/messaging/topics/{topicId}'.replace('{topicId}', topicId);
            const payload = {};
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof subscribe !== 'undefined') {
                payload['subscribe'] = subscribe;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete topic
     *
     * Delete a topic by its unique ID.
     *
     * @param {string} topicId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteTopic(topicId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof topicId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "topicId"');
            }
            const apiPath = '/messaging/topics/{topicId}'.replace('{topicId}', topicId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * List topic logs
     *
     * Get the topic activity logs listed by its unique ID.
     *
     * @param {string} topicId
     * @param {string[]} queries
     * @throws {AppwriteException}
     * @returns {Promise<Models.LogList>}
     */
    listTopicLogs(topicId, queries) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof topicId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "topicId"');
            }
            const apiPath = '/messaging/topics/{topicId}/logs'.replace('{topicId}', topicId);
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * List subscribers
     *
     * Get a list of all subscribers from the current Appconda project.
     *
     * @param {string} topicId
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppwriteException}
     * @returns {Promise<Models.SubscriberList>}
     */
    listSubscribers(topicId, queries, search) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof topicId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "topicId"');
            }
            const apiPath = '/messaging/topics/{topicId}/subscribers'.replace('{topicId}', topicId);
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            if (typeof search !== 'undefined') {
                payload['search'] = search;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Create subscriber
     *
     * Create a new subscriber.
     *
     * @param {string} topicId
     * @param {string} subscriberId
     * @param {string} targetId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Subscriber>}
     */
    createSubscriber(topicId, subscriberId, targetId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof topicId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "topicId"');
            }
            if (typeof subscriberId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "subscriberId"');
            }
            if (typeof targetId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "targetId"');
            }
            const apiPath = '/messaging/topics/{topicId}/subscribers'.replace('{topicId}', topicId);
            const payload = {};
            if (typeof subscriberId !== 'undefined') {
                payload['subscriberId'] = subscriberId;
            }
            if (typeof targetId !== 'undefined') {
                payload['targetId'] = targetId;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Get subscriber
     *
     * Get a subscriber by its unique ID.

     *
     * @param {string} topicId
     * @param {string} subscriberId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Subscriber>}
     */
    getSubscriber(topicId, subscriberId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof topicId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "topicId"');
            }
            if (typeof subscriberId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "subscriberId"');
            }
            const apiPath = '/messaging/topics/{topicId}/subscribers/{subscriberId}'.replace('{topicId}', topicId).replace('{subscriberId}', subscriberId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete subscriber
     *
     * Delete a subscriber by its unique ID.
     *
     * @param {string} topicId
     * @param {string} subscriberId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteSubscriber(topicId, subscriberId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof topicId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "topicId"');
            }
            if (typeof subscriberId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "subscriberId"');
            }
            const apiPath = '/messaging/topics/{topicId}/subscribers/{subscriberId}'.replace('{topicId}', topicId).replace('{subscriberId}', subscriberId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
}

class Migrations {
    constructor(client) {
        this.client = client;
    }
    /**
     * List Migrations
     *
     *
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppwriteException}
     * @returns {Promise<Models.MigrationList>}
     */
    list(queries, search) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/migrations';
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            if (typeof search !== 'undefined') {
                payload['search'] = search;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Migrate Appconda Data
     *
     *
     * @param {string[]} resources
     * @param {string} endpoint
     * @param {string} projectId
     * @param {string} apiKey
     * @throws {AppwriteException}
     * @returns {Promise<Models.Migration>}
     */
    createAppwriteMigration(resources, endpoint, projectId, apiKey) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof resources === 'undefined') {
                throw new AppwriteException('Missing required parameter: "resources"');
            }
            if (typeof endpoint === 'undefined') {
                throw new AppwriteException('Missing required parameter: "endpoint"');
            }
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof apiKey === 'undefined') {
                throw new AppwriteException('Missing required parameter: "apiKey"');
            }
            const apiPath = '/migrations/appconda';
            const payload = {};
            if (typeof resources !== 'undefined') {
                payload['resources'] = resources;
            }
            if (typeof endpoint !== 'undefined') {
                payload['endpoint'] = endpoint;
            }
            if (typeof projectId !== 'undefined') {
                payload['projectId'] = projectId;
            }
            if (typeof apiKey !== 'undefined') {
                payload['apiKey'] = apiKey;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Generate a report on Appconda Data
     *
     *
     * @param {string[]} resources
     * @param {string} endpoint
     * @param {string} projectID
     * @param {string} key
     * @throws {AppwriteException}
     * @returns {Promise<Models.MigrationReport>}
     */
    getAppwriteReport(resources, endpoint, projectID, key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof resources === 'undefined') {
                throw new AppwriteException('Missing required parameter: "resources"');
            }
            if (typeof endpoint === 'undefined') {
                throw new AppwriteException('Missing required parameter: "endpoint"');
            }
            if (typeof projectID === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectID"');
            }
            if (typeof key === 'undefined') {
                throw new AppwriteException('Missing required parameter: "key"');
            }
            const apiPath = '/migrations/appconda/report';
            const payload = {};
            if (typeof resources !== 'undefined') {
                payload['resources'] = resources;
            }
            if (typeof endpoint !== 'undefined') {
                payload['endpoint'] = endpoint;
            }
            if (typeof projectID !== 'undefined') {
                payload['projectID'] = projectID;
            }
            if (typeof key !== 'undefined') {
                payload['key'] = key;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Migrate Firebase Data (Service Account)
     *
     *
     * @param {string[]} resources
     * @param {string} serviceAccount
     * @throws {AppwriteException}
     * @returns {Promise<Models.Migration>}
     */
    createFirebaseMigration(resources, serviceAccount) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof resources === 'undefined') {
                throw new AppwriteException('Missing required parameter: "resources"');
            }
            if (typeof serviceAccount === 'undefined') {
                throw new AppwriteException('Missing required parameter: "serviceAccount"');
            }
            const apiPath = '/migrations/firebase';
            const payload = {};
            if (typeof resources !== 'undefined') {
                payload['resources'] = resources;
            }
            if (typeof serviceAccount !== 'undefined') {
                payload['serviceAccount'] = serviceAccount;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Revoke Appconda&#039;s authorization to access Firebase Projects
     *
     *
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteFirebaseAuth() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/migrations/firebase/deauthorize';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Migrate Firebase Data (OAuth)
     *
     *
     * @param {string[]} resources
     * @param {string} projectId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Migration>}
     */
    createFirebaseOAuthMigration(resources, projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof resources === 'undefined') {
                throw new AppwriteException('Missing required parameter: "resources"');
            }
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            const apiPath = '/migrations/firebase/oauth';
            const payload = {};
            if (typeof resources !== 'undefined') {
                payload['resources'] = resources;
            }
            if (typeof projectId !== 'undefined') {
                payload['projectId'] = projectId;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * List Firebase Projects
     *
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.FirebaseProjectList>}
     */
    listFirebaseProjects() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/migrations/firebase/projects';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Generate a report on Firebase Data
     *
     *
     * @param {string[]} resources
     * @param {string} serviceAccount
     * @throws {AppwriteException}
     * @returns {Promise<Models.MigrationReport>}
     */
    getFirebaseReport(resources, serviceAccount) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof resources === 'undefined') {
                throw new AppwriteException('Missing required parameter: "resources"');
            }
            if (typeof serviceAccount === 'undefined') {
                throw new AppwriteException('Missing required parameter: "serviceAccount"');
            }
            const apiPath = '/migrations/firebase/report';
            const payload = {};
            if (typeof resources !== 'undefined') {
                payload['resources'] = resources;
            }
            if (typeof serviceAccount !== 'undefined') {
                payload['serviceAccount'] = serviceAccount;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Generate a report on Firebase Data using OAuth
     *
     *
     * @param {string[]} resources
     * @param {string} projectId
     * @throws {AppwriteException}
     * @returns {Promise<Models.MigrationReport>}
     */
    getFirebaseReportOAuth(resources, projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof resources === 'undefined') {
                throw new AppwriteException('Missing required parameter: "resources"');
            }
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            const apiPath = '/migrations/firebase/report/oauth';
            const payload = {};
            if (typeof resources !== 'undefined') {
                payload['resources'] = resources;
            }
            if (typeof projectId !== 'undefined') {
                payload['projectId'] = projectId;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Migrate NHost Data
     *
     *
     * @param {string[]} resources
     * @param {string} subdomain
     * @param {string} region
     * @param {string} adminSecret
     * @param {string} database
     * @param {string} username
     * @param {string} password
     * @param {number} port
     * @throws {AppwriteException}
     * @returns {Promise<Models.Migration>}
     */
    createNHostMigration(resources, subdomain, region, adminSecret, database, username, password, port) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof resources === 'undefined') {
                throw new AppwriteException('Missing required parameter: "resources"');
            }
            if (typeof subdomain === 'undefined') {
                throw new AppwriteException('Missing required parameter: "subdomain"');
            }
            if (typeof region === 'undefined') {
                throw new AppwriteException('Missing required parameter: "region"');
            }
            if (typeof adminSecret === 'undefined') {
                throw new AppwriteException('Missing required parameter: "adminSecret"');
            }
            if (typeof database === 'undefined') {
                throw new AppwriteException('Missing required parameter: "database"');
            }
            if (typeof username === 'undefined') {
                throw new AppwriteException('Missing required parameter: "username"');
            }
            if (typeof password === 'undefined') {
                throw new AppwriteException('Missing required parameter: "password"');
            }
            const apiPath = '/migrations/nhost';
            const payload = {};
            if (typeof resources !== 'undefined') {
                payload['resources'] = resources;
            }
            if (typeof subdomain !== 'undefined') {
                payload['subdomain'] = subdomain;
            }
            if (typeof region !== 'undefined') {
                payload['region'] = region;
            }
            if (typeof adminSecret !== 'undefined') {
                payload['adminSecret'] = adminSecret;
            }
            if (typeof database !== 'undefined') {
                payload['database'] = database;
            }
            if (typeof username !== 'undefined') {
                payload['username'] = username;
            }
            if (typeof password !== 'undefined') {
                payload['password'] = password;
            }
            if (typeof port !== 'undefined') {
                payload['port'] = port;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Generate a report on NHost Data
     *
     *
     * @param {string[]} resources
     * @param {string} subdomain
     * @param {string} region
     * @param {string} adminSecret
     * @param {string} database
     * @param {string} username
     * @param {string} password
     * @param {number} port
     * @throws {AppwriteException}
     * @returns {Promise<Models.MigrationReport>}
     */
    getNHostReport(resources, subdomain, region, adminSecret, database, username, password, port) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof resources === 'undefined') {
                throw new AppwriteException('Missing required parameter: "resources"');
            }
            if (typeof subdomain === 'undefined') {
                throw new AppwriteException('Missing required parameter: "subdomain"');
            }
            if (typeof region === 'undefined') {
                throw new AppwriteException('Missing required parameter: "region"');
            }
            if (typeof adminSecret === 'undefined') {
                throw new AppwriteException('Missing required parameter: "adminSecret"');
            }
            if (typeof database === 'undefined') {
                throw new AppwriteException('Missing required parameter: "database"');
            }
            if (typeof username === 'undefined') {
                throw new AppwriteException('Missing required parameter: "username"');
            }
            if (typeof password === 'undefined') {
                throw new AppwriteException('Missing required parameter: "password"');
            }
            const apiPath = '/migrations/nhost/report';
            const payload = {};
            if (typeof resources !== 'undefined') {
                payload['resources'] = resources;
            }
            if (typeof subdomain !== 'undefined') {
                payload['subdomain'] = subdomain;
            }
            if (typeof region !== 'undefined') {
                payload['region'] = region;
            }
            if (typeof adminSecret !== 'undefined') {
                payload['adminSecret'] = adminSecret;
            }
            if (typeof database !== 'undefined') {
                payload['database'] = database;
            }
            if (typeof username !== 'undefined') {
                payload['username'] = username;
            }
            if (typeof password !== 'undefined') {
                payload['password'] = password;
            }
            if (typeof port !== 'undefined') {
                payload['port'] = port;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Migrate Supabase Data
     *
     *
     * @param {string[]} resources
     * @param {string} endpoint
     * @param {string} apiKey
     * @param {string} databaseHost
     * @param {string} username
     * @param {string} password
     * @param {number} port
     * @throws {AppwriteException}
     * @returns {Promise<Models.Migration>}
     */
    createSupabaseMigration(resources, endpoint, apiKey, databaseHost, username, password, port) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof resources === 'undefined') {
                throw new AppwriteException('Missing required parameter: "resources"');
            }
            if (typeof endpoint === 'undefined') {
                throw new AppwriteException('Missing required parameter: "endpoint"');
            }
            if (typeof apiKey === 'undefined') {
                throw new AppwriteException('Missing required parameter: "apiKey"');
            }
            if (typeof databaseHost === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseHost"');
            }
            if (typeof username === 'undefined') {
                throw new AppwriteException('Missing required parameter: "username"');
            }
            if (typeof password === 'undefined') {
                throw new AppwriteException('Missing required parameter: "password"');
            }
            const apiPath = '/migrations/supabase';
            const payload = {};
            if (typeof resources !== 'undefined') {
                payload['resources'] = resources;
            }
            if (typeof endpoint !== 'undefined') {
                payload['endpoint'] = endpoint;
            }
            if (typeof apiKey !== 'undefined') {
                payload['apiKey'] = apiKey;
            }
            if (typeof databaseHost !== 'undefined') {
                payload['databaseHost'] = databaseHost;
            }
            if (typeof username !== 'undefined') {
                payload['username'] = username;
            }
            if (typeof password !== 'undefined') {
                payload['password'] = password;
            }
            if (typeof port !== 'undefined') {
                payload['port'] = port;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Generate a report on Supabase Data
     *
     *
     * @param {string[]} resources
     * @param {string} endpoint
     * @param {string} apiKey
     * @param {string} databaseHost
     * @param {string} username
     * @param {string} password
     * @param {number} port
     * @throws {AppwriteException}
     * @returns {Promise<Models.MigrationReport>}
     */
    getSupabaseReport(resources, endpoint, apiKey, databaseHost, username, password, port) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof resources === 'undefined') {
                throw new AppwriteException('Missing required parameter: "resources"');
            }
            if (typeof endpoint === 'undefined') {
                throw new AppwriteException('Missing required parameter: "endpoint"');
            }
            if (typeof apiKey === 'undefined') {
                throw new AppwriteException('Missing required parameter: "apiKey"');
            }
            if (typeof databaseHost === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseHost"');
            }
            if (typeof username === 'undefined') {
                throw new AppwriteException('Missing required parameter: "username"');
            }
            if (typeof password === 'undefined') {
                throw new AppwriteException('Missing required parameter: "password"');
            }
            const apiPath = '/migrations/supabase/report';
            const payload = {};
            if (typeof resources !== 'undefined') {
                payload['resources'] = resources;
            }
            if (typeof endpoint !== 'undefined') {
                payload['endpoint'] = endpoint;
            }
            if (typeof apiKey !== 'undefined') {
                payload['apiKey'] = apiKey;
            }
            if (typeof databaseHost !== 'undefined') {
                payload['databaseHost'] = databaseHost;
            }
            if (typeof username !== 'undefined') {
                payload['username'] = username;
            }
            if (typeof password !== 'undefined') {
                payload['password'] = password;
            }
            if (typeof port !== 'undefined') {
                payload['port'] = port;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get Migration
     *
     *
     * @param {string} migrationId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Migration>}
     */
    get(migrationId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof migrationId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "migrationId"');
            }
            const apiPath = '/migrations/{migrationId}'.replace('{migrationId}', migrationId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Retry Migration
     *
     *
     * @param {string} migrationId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Migration>}
     */
    retry(migrationId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof migrationId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "migrationId"');
            }
            const apiPath = '/migrations/{migrationId}'.replace('{migrationId}', migrationId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete Migration
     *
     *
     * @param {string} migrationId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    delete(migrationId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof migrationId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "migrationId"');
            }
            const apiPath = '/migrations/{migrationId}'.replace('{migrationId}', migrationId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
}

class Project {
    constructor(client) {
        this.client = client;
    }
    /**
     * Get project usage stats
     *
     *
     * @param {string} startDate
     * @param {string} endDate
     * @param {ProjectUsageRange} period
     * @throws {AppwriteException}
     * @returns {Promise<Models.UsageProject>}
     */
    getUsage(startDate, endDate, period) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof startDate === 'undefined') {
                throw new AppwriteException('Missing required parameter: "startDate"');
            }
            if (typeof endDate === 'undefined') {
                throw new AppwriteException('Missing required parameter: "endDate"');
            }
            const apiPath = '/project/usage';
            const payload = {};
            if (typeof startDate !== 'undefined') {
                payload['startDate'] = startDate;
            }
            if (typeof endDate !== 'undefined') {
                payload['endDate'] = endDate;
            }
            if (typeof period !== 'undefined') {
                payload['period'] = period;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * List Variables
     *
     * Get a list of all project variables. These variables will be accessible in all Appconda Functions at runtime.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.VariableList>}
     */
    listVariables() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/project/variables';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Create Variable
     *
     * Create a new project variable. This variable will be accessible in all Appconda Functions at runtime.
     *
     * @param {string} key
     * @param {string} value
     * @throws {AppwriteException}
     * @returns {Promise<Models.Variable>}
     */
    createVariable(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof key === 'undefined') {
                throw new AppwriteException('Missing required parameter: "key"');
            }
            if (typeof value === 'undefined') {
                throw new AppwriteException('Missing required parameter: "value"');
            }
            const apiPath = '/project/variables';
            const payload = {};
            if (typeof key !== 'undefined') {
                payload['key'] = key;
            }
            if (typeof value !== 'undefined') {
                payload['value'] = value;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Get Variable
     *
     * Get a project variable by its unique ID.
     *
     * @param {string} variableId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Variable>}
     */
    getVariable(variableId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof variableId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "variableId"');
            }
            const apiPath = '/project/variables/{variableId}'.replace('{variableId}', variableId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Update Variable
     *
     * Update project variable by its unique ID. This variable will be accessible in all Appconda Functions at runtime.
     *
     * @param {string} variableId
     * @param {string} key
     * @param {string} value
     * @throws {AppwriteException}
     * @returns {Promise<Models.Variable>}
     */
    updateVariable(variableId, key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof variableId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "variableId"');
            }
            if (typeof key === 'undefined') {
                throw new AppwriteException('Missing required parameter: "key"');
            }
            const apiPath = '/project/variables/{variableId}'.replace('{variableId}', variableId);
            const payload = {};
            if (typeof key !== 'undefined') {
                payload['key'] = key;
            }
            if (typeof value !== 'undefined') {
                payload['value'] = value;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('put', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete Variable
     *
     * Delete a project variable by its unique ID.
     *
     * @param {string} variableId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteVariable(variableId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof variableId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "variableId"');
            }
            const apiPath = '/project/variables/{variableId}'.replace('{variableId}', variableId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
}

class Projects {
    constructor(client) {
        this.client = client;
    }
    /**
     * List projects
     *
     *
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppwriteException}
     * @returns {Promise<Models.ProjectList>}
     */
    list(queries, search) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/projects';
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            if (typeof search !== 'undefined') {
                payload['search'] = search;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Create project
     *
     *
     * @param {string} projectId
     * @param {string} name
     * @param {string} teamId
     * @param {Region} region
     * @param {string} description
     * @param {string} logo
     * @param {string} url
     * @param {string} legalName
     * @param {string} legalCountry
     * @param {string} legalState
     * @param {string} legalCity
     * @param {string} legalAddress
     * @param {string} legalTaxId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    create(projectId, name, teamId, region, description, logo, url, legalName, legalCountry, legalState, legalCity, legalAddress, legalTaxId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            if (typeof teamId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "teamId"');
            }
            const apiPath = '/projects';
            const payload = {};
            if (typeof projectId !== 'undefined') {
                payload['projectId'] = projectId;
            }
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof teamId !== 'undefined') {
                payload['teamId'] = teamId;
            }
            if (typeof region !== 'undefined') {
                payload['region'] = region;
            }
            if (typeof description !== 'undefined') {
                payload['description'] = description;
            }
            if (typeof logo !== 'undefined') {
                payload['logo'] = logo;
            }
            if (typeof url !== 'undefined') {
                payload['url'] = url;
            }
            if (typeof legalName !== 'undefined') {
                payload['legalName'] = legalName;
            }
            if (typeof legalCountry !== 'undefined') {
                payload['legalCountry'] = legalCountry;
            }
            if (typeof legalState !== 'undefined') {
                payload['legalState'] = legalState;
            }
            if (typeof legalCity !== 'undefined') {
                payload['legalCity'] = legalCity;
            }
            if (typeof legalAddress !== 'undefined') {
                payload['legalAddress'] = legalAddress;
            }
            if (typeof legalTaxId !== 'undefined') {
                payload['legalTaxId'] = legalTaxId;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Get project
     *
     *
     * @param {string} projectId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    get(projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            const apiPath = '/projects/{projectId}'.replace('{projectId}', projectId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Update project
     *
     *
     * @param {string} projectId
     * @param {string} name
     * @param {string} description
     * @param {string} logo
     * @param {string} url
     * @param {string} legalName
     * @param {string} legalCountry
     * @param {string} legalState
     * @param {string} legalCity
     * @param {string} legalAddress
     * @param {string} legalTaxId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    update(projectId, name, description, logo, url, legalName, legalCountry, legalState, legalCity, legalAddress, legalTaxId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            const apiPath = '/projects/{projectId}'.replace('{projectId}', projectId);
            const payload = {};
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof description !== 'undefined') {
                payload['description'] = description;
            }
            if (typeof logo !== 'undefined') {
                payload['logo'] = logo;
            }
            if (typeof url !== 'undefined') {
                payload['url'] = url;
            }
            if (typeof legalName !== 'undefined') {
                payload['legalName'] = legalName;
            }
            if (typeof legalCountry !== 'undefined') {
                payload['legalCountry'] = legalCountry;
            }
            if (typeof legalState !== 'undefined') {
                payload['legalState'] = legalState;
            }
            if (typeof legalCity !== 'undefined') {
                payload['legalCity'] = legalCity;
            }
            if (typeof legalAddress !== 'undefined') {
                payload['legalAddress'] = legalAddress;
            }
            if (typeof legalTaxId !== 'undefined') {
                payload['legalTaxId'] = legalTaxId;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete project
     *
     *
     * @param {string} projectId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    delete(projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            const apiPath = '/projects/{projectId}'.replace('{projectId}', projectId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * Update API status
     *
     *
     * @param {string} projectId
     * @param {Api} api
     * @param {boolean} status
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updateApiStatus(projectId, api, status) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof api === 'undefined') {
                throw new AppwriteException('Missing required parameter: "api"');
            }
            if (typeof status === 'undefined') {
                throw new AppwriteException('Missing required parameter: "status"');
            }
            const apiPath = '/projects/{projectId}/api'.replace('{projectId}', projectId);
            const payload = {};
            if (typeof api !== 'undefined') {
                payload['api'] = api;
            }
            if (typeof status !== 'undefined') {
                payload['status'] = status;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Update all API status
     *
     *
     * @param {string} projectId
     * @param {boolean} status
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updateApiStatusAll(projectId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof status === 'undefined') {
                throw new AppwriteException('Missing required parameter: "status"');
            }
            const apiPath = '/projects/{projectId}/api/all'.replace('{projectId}', projectId);
            const payload = {};
            if (typeof status !== 'undefined') {
                payload['status'] = status;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Update project authentication duration
     *
     *
     * @param {string} projectId
     * @param {number} duration
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updateAuthDuration(projectId, duration) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof duration === 'undefined') {
                throw new AppwriteException('Missing required parameter: "duration"');
            }
            const apiPath = '/projects/{projectId}/auth/duration'.replace('{projectId}', projectId);
            const payload = {};
            if (typeof duration !== 'undefined') {
                payload['duration'] = duration;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Update project users limit
     *
     *
     * @param {string} projectId
     * @param {number} limit
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updateAuthLimit(projectId, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof limit === 'undefined') {
                throw new AppwriteException('Missing required parameter: "limit"');
            }
            const apiPath = '/projects/{projectId}/auth/limit'.replace('{projectId}', projectId);
            const payload = {};
            if (typeof limit !== 'undefined') {
                payload['limit'] = limit;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Update project user sessions limit
     *
     *
     * @param {string} projectId
     * @param {number} limit
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updateAuthSessionsLimit(projectId, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof limit === 'undefined') {
                throw new AppwriteException('Missing required parameter: "limit"');
            }
            const apiPath = '/projects/{projectId}/auth/max-sessions'.replace('{projectId}', projectId);
            const payload = {};
            if (typeof limit !== 'undefined') {
                payload['limit'] = limit;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Update the mock numbers for the project
     *
     *
     * @param {string} projectId
     * @param {object[]} numbers
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updateMockNumbers(projectId, numbers) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof numbers === 'undefined') {
                throw new AppwriteException('Missing required parameter: "numbers"');
            }
            const apiPath = '/projects/{projectId}/auth/mock-numbers'.replace('{projectId}', projectId);
            const payload = {};
            if (typeof numbers !== 'undefined') {
                payload['numbers'] = numbers;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Update authentication password dictionary status. Use this endpoint to enable or disable the dicitonary check for user password
     *
     *
     * @param {string} projectId
     * @param {boolean} enabled
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updateAuthPasswordDictionary(projectId, enabled) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof enabled === 'undefined') {
                throw new AppwriteException('Missing required parameter: "enabled"');
            }
            const apiPath = '/projects/{projectId}/auth/password-dictionary'.replace('{projectId}', projectId);
            const payload = {};
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Update authentication password history. Use this endpoint to set the number of password history to save and 0 to disable password history.
     *
     *
     * @param {string} projectId
     * @param {number} limit
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updateAuthPasswordHistory(projectId, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof limit === 'undefined') {
                throw new AppwriteException('Missing required parameter: "limit"');
            }
            const apiPath = '/projects/{projectId}/auth/password-history'.replace('{projectId}', projectId);
            const payload = {};
            if (typeof limit !== 'undefined') {
                payload['limit'] = limit;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Enable or disable checking user passwords for similarity with their personal data.
     *
     *
     * @param {string} projectId
     * @param {boolean} enabled
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updatePersonalDataCheck(projectId, enabled) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof enabled === 'undefined') {
                throw new AppwriteException('Missing required parameter: "enabled"');
            }
            const apiPath = '/projects/{projectId}/auth/personal-data'.replace('{projectId}', projectId);
            const payload = {};
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Update project sessions emails
     *
     *
     * @param {string} projectId
     * @param {boolean} alerts
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updateSessionAlerts(projectId, alerts) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof alerts === 'undefined') {
                throw new AppwriteException('Missing required parameter: "alerts"');
            }
            const apiPath = '/projects/{projectId}/auth/session-alerts'.replace('{projectId}', projectId);
            const payload = {};
            if (typeof alerts !== 'undefined') {
                payload['alerts'] = alerts;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Update project auth method status. Use this endpoint to enable or disable a given auth method for this project.
     *
     *
     * @param {string} projectId
     * @param {AuthMethod} method
     * @param {boolean} status
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updateAuthStatus(projectId, method, status) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof method === 'undefined') {
                throw new AppwriteException('Missing required parameter: "method"');
            }
            if (typeof status === 'undefined') {
                throw new AppwriteException('Missing required parameter: "status"');
            }
            const apiPath = '/projects/{projectId}/auth/{method}'.replace('{projectId}', projectId).replace('{method}', method);
            const payload = {};
            if (typeof status !== 'undefined') {
                payload['status'] = status;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Create JWT
     *
     *
     * @param {string} projectId
     * @param {string[]} scopes
     * @param {number} duration
     * @throws {AppwriteException}
     * @returns {Promise<Models.Jwt>}
     */
    createJWT(projectId, scopes, duration) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof scopes === 'undefined') {
                throw new AppwriteException('Missing required parameter: "scopes"');
            }
            const apiPath = '/projects/{projectId}/jwts'.replace('{projectId}', projectId);
            const payload = {};
            if (typeof scopes !== 'undefined') {
                payload['scopes'] = scopes;
            }
            if (typeof duration !== 'undefined') {
                payload['duration'] = duration;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * List keys
     *
     *
     * @param {string} projectId
     * @throws {AppwriteException}
     * @returns {Promise<Models.KeyList>}
     */
    listKeys(projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            const apiPath = '/projects/{projectId}/keys'.replace('{projectId}', projectId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Create key
     *
     *
     * @param {string} projectId
     * @param {string} name
     * @param {string[]} scopes
     * @param {string} expire
     * @throws {AppwriteException}
     * @returns {Promise<Models.Key>}
     */
    createKey(projectId, name, scopes, expire) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            if (typeof scopes === 'undefined') {
                throw new AppwriteException('Missing required parameter: "scopes"');
            }
            const apiPath = '/projects/{projectId}/keys'.replace('{projectId}', projectId);
            const payload = {};
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof scopes !== 'undefined') {
                payload['scopes'] = scopes;
            }
            if (typeof expire !== 'undefined') {
                payload['expire'] = expire;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Get key
     *
     *
     * @param {string} projectId
     * @param {string} keyId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Key>}
     */
    getKey(projectId, keyId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof keyId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "keyId"');
            }
            const apiPath = '/projects/{projectId}/keys/{keyId}'.replace('{projectId}', projectId).replace('{keyId}', keyId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Update key
     *
     *
     * @param {string} projectId
     * @param {string} keyId
     * @param {string} name
     * @param {string[]} scopes
     * @param {string} expire
     * @throws {AppwriteException}
     * @returns {Promise<Models.Key>}
     */
    updateKey(projectId, keyId, name, scopes, expire) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof keyId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "keyId"');
            }
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            if (typeof scopes === 'undefined') {
                throw new AppwriteException('Missing required parameter: "scopes"');
            }
            const apiPath = '/projects/{projectId}/keys/{keyId}'.replace('{projectId}', projectId).replace('{keyId}', keyId);
            const payload = {};
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof scopes !== 'undefined') {
                payload['scopes'] = scopes;
            }
            if (typeof expire !== 'undefined') {
                payload['expire'] = expire;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('put', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete key
     *
     *
     * @param {string} projectId
     * @param {string} keyId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteKey(projectId, keyId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof keyId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "keyId"');
            }
            const apiPath = '/projects/{projectId}/keys/{keyId}'.replace('{projectId}', projectId).replace('{keyId}', keyId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * Update project OAuth2
     *
     *
     * @param {string} projectId
     * @param {OAuthProvider} provider
     * @param {string} appId
     * @param {string} secret
     * @param {boolean} enabled
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updateOAuth2(projectId, provider, appId, secret, enabled) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof provider === 'undefined') {
                throw new AppwriteException('Missing required parameter: "provider"');
            }
            const apiPath = '/projects/{projectId}/oauth2'.replace('{projectId}', projectId);
            const payload = {};
            if (typeof provider !== 'undefined') {
                payload['provider'] = provider;
            }
            if (typeof appId !== 'undefined') {
                payload['appId'] = appId;
            }
            if (typeof secret !== 'undefined') {
                payload['secret'] = secret;
            }
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * List platforms
     *
     *
     * @param {string} projectId
     * @throws {AppwriteException}
     * @returns {Promise<Models.PlatformList>}
     */
    listPlatforms(projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            const apiPath = '/projects/{projectId}/platforms'.replace('{projectId}', projectId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Create platform
     *
     *
     * @param {string} projectId
     * @param {PlatformType} type
     * @param {string} name
     * @param {string} key
     * @param {string} store
     * @param {string} hostname
     * @throws {AppwriteException}
     * @returns {Promise<Models.Platform>}
     */
    createPlatform(projectId, type, name, key, store, hostname) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof type === 'undefined') {
                throw new AppwriteException('Missing required parameter: "type"');
            }
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            const apiPath = '/projects/{projectId}/platforms'.replace('{projectId}', projectId);
            const payload = {};
            if (typeof type !== 'undefined') {
                payload['type'] = type;
            }
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof key !== 'undefined') {
                payload['key'] = key;
            }
            if (typeof store !== 'undefined') {
                payload['store'] = store;
            }
            if (typeof hostname !== 'undefined') {
                payload['hostname'] = hostname;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Get platform
     *
     *
     * @param {string} projectId
     * @param {string} platformId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Platform>}
     */
    getPlatform(projectId, platformId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof platformId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "platformId"');
            }
            const apiPath = '/projects/{projectId}/platforms/{platformId}'.replace('{projectId}', projectId).replace('{platformId}', platformId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Update platform
     *
     *
     * @param {string} projectId
     * @param {string} platformId
     * @param {string} name
     * @param {string} key
     * @param {string} store
     * @param {string} hostname
     * @throws {AppwriteException}
     * @returns {Promise<Models.Platform>}
     */
    updatePlatform(projectId, platformId, name, key, store, hostname) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof platformId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "platformId"');
            }
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            const apiPath = '/projects/{projectId}/platforms/{platformId}'.replace('{projectId}', projectId).replace('{platformId}', platformId);
            const payload = {};
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof key !== 'undefined') {
                payload['key'] = key;
            }
            if (typeof store !== 'undefined') {
                payload['store'] = store;
            }
            if (typeof hostname !== 'undefined') {
                payload['hostname'] = hostname;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('put', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete platform
     *
     *
     * @param {string} projectId
     * @param {string} platformId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deletePlatform(projectId, platformId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof platformId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "platformId"');
            }
            const apiPath = '/projects/{projectId}/platforms/{platformId}'.replace('{projectId}', projectId).replace('{platformId}', platformId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * Update service status
     *
     *
     * @param {string} projectId
     * @param {ApiService} service
     * @param {boolean} status
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updateServiceStatus(projectId, service, status) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof service === 'undefined') {
                throw new AppwriteException('Missing required parameter: "service"');
            }
            if (typeof status === 'undefined') {
                throw new AppwriteException('Missing required parameter: "status"');
            }
            const apiPath = '/projects/{projectId}/service'.replace('{projectId}', projectId);
            const payload = {};
            if (typeof service !== 'undefined') {
                payload['service'] = service;
            }
            if (typeof status !== 'undefined') {
                payload['status'] = status;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Update all service status
     *
     *
     * @param {string} projectId
     * @param {boolean} status
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updateServiceStatusAll(projectId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof status === 'undefined') {
                throw new AppwriteException('Missing required parameter: "status"');
            }
            const apiPath = '/projects/{projectId}/service/all'.replace('{projectId}', projectId);
            const payload = {};
            if (typeof status !== 'undefined') {
                payload['status'] = status;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Update SMTP
     *
     *
     * @param {string} projectId
     * @param {boolean} enabled
     * @param {string} senderName
     * @param {string} senderEmail
     * @param {string} replyTo
     * @param {string} host
     * @param {number} port
     * @param {string} username
     * @param {string} password
     * @param {SMTPSecure} secure
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updateSmtp(projectId, enabled, senderName, senderEmail, replyTo, host, port, username, password, secure) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof enabled === 'undefined') {
                throw new AppwriteException('Missing required parameter: "enabled"');
            }
            const apiPath = '/projects/{projectId}/smtp'.replace('{projectId}', projectId);
            const payload = {};
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            if (typeof senderName !== 'undefined') {
                payload['senderName'] = senderName;
            }
            if (typeof senderEmail !== 'undefined') {
                payload['senderEmail'] = senderEmail;
            }
            if (typeof replyTo !== 'undefined') {
                payload['replyTo'] = replyTo;
            }
            if (typeof host !== 'undefined') {
                payload['host'] = host;
            }
            if (typeof port !== 'undefined') {
                payload['port'] = port;
            }
            if (typeof username !== 'undefined') {
                payload['username'] = username;
            }
            if (typeof password !== 'undefined') {
                payload['password'] = password;
            }
            if (typeof secure !== 'undefined') {
                payload['secure'] = secure;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Create SMTP test
     *
     *
     * @param {string} projectId
     * @param {string[]} emails
     * @param {string} senderName
     * @param {string} senderEmail
     * @param {string} host
     * @param {string} replyTo
     * @param {number} port
     * @param {string} username
     * @param {string} password
     * @param {SMTPSecure} secure
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    createSmtpTest(projectId, emails, senderName, senderEmail, host, replyTo, port, username, password, secure) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof emails === 'undefined') {
                throw new AppwriteException('Missing required parameter: "emails"');
            }
            if (typeof senderName === 'undefined') {
                throw new AppwriteException('Missing required parameter: "senderName"');
            }
            if (typeof senderEmail === 'undefined') {
                throw new AppwriteException('Missing required parameter: "senderEmail"');
            }
            if (typeof host === 'undefined') {
                throw new AppwriteException('Missing required parameter: "host"');
            }
            const apiPath = '/projects/{projectId}/smtp/tests'.replace('{projectId}', projectId);
            const payload = {};
            if (typeof emails !== 'undefined') {
                payload['emails'] = emails;
            }
            if (typeof senderName !== 'undefined') {
                payload['senderName'] = senderName;
            }
            if (typeof senderEmail !== 'undefined') {
                payload['senderEmail'] = senderEmail;
            }
            if (typeof replyTo !== 'undefined') {
                payload['replyTo'] = replyTo;
            }
            if (typeof host !== 'undefined') {
                payload['host'] = host;
            }
            if (typeof port !== 'undefined') {
                payload['port'] = port;
            }
            if (typeof username !== 'undefined') {
                payload['username'] = username;
            }
            if (typeof password !== 'undefined') {
                payload['password'] = password;
            }
            if (typeof secure !== 'undefined') {
                payload['secure'] = secure;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Update project team
     *
     *
     * @param {string} projectId
     * @param {string} teamId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updateTeam(projectId, teamId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof teamId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "teamId"');
            }
            const apiPath = '/projects/{projectId}/team'.replace('{projectId}', projectId);
            const payload = {};
            if (typeof teamId !== 'undefined') {
                payload['teamId'] = teamId;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Get custom email template
     *
     *
     * @param {string} projectId
     * @param {EmailTemplateType} type
     * @param {EmailTemplateLocale} locale
     * @throws {AppwriteException}
     * @returns {Promise<Models.EmailTemplate>}
     */
    getEmailTemplate(projectId, type, locale) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof type === 'undefined') {
                throw new AppwriteException('Missing required parameter: "type"');
            }
            if (typeof locale === 'undefined') {
                throw new AppwriteException('Missing required parameter: "locale"');
            }
            const apiPath = '/projects/{projectId}/templates/email/{type}/{locale}'.replace('{projectId}', projectId).replace('{type}', type).replace('{locale}', locale);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Update custom email templates
     *
     *
     * @param {string} projectId
     * @param {EmailTemplateType} type
     * @param {EmailTemplateLocale} locale
     * @param {string} subject
     * @param {string} message
     * @param {string} senderName
     * @param {string} senderEmail
     * @param {string} replyTo
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updateEmailTemplate(projectId, type, locale, subject, message, senderName, senderEmail, replyTo) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof type === 'undefined') {
                throw new AppwriteException('Missing required parameter: "type"');
            }
            if (typeof locale === 'undefined') {
                throw new AppwriteException('Missing required parameter: "locale"');
            }
            if (typeof subject === 'undefined') {
                throw new AppwriteException('Missing required parameter: "subject"');
            }
            if (typeof message === 'undefined') {
                throw new AppwriteException('Missing required parameter: "message"');
            }
            const apiPath = '/projects/{projectId}/templates/email/{type}/{locale}'.replace('{projectId}', projectId).replace('{type}', type).replace('{locale}', locale);
            const payload = {};
            if (typeof subject !== 'undefined') {
                payload['subject'] = subject;
            }
            if (typeof message !== 'undefined') {
                payload['message'] = message;
            }
            if (typeof senderName !== 'undefined') {
                payload['senderName'] = senderName;
            }
            if (typeof senderEmail !== 'undefined') {
                payload['senderEmail'] = senderEmail;
            }
            if (typeof replyTo !== 'undefined') {
                payload['replyTo'] = replyTo;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Reset custom email template
     *
     *
     * @param {string} projectId
     * @param {EmailTemplateType} type
     * @param {EmailTemplateLocale} locale
     * @throws {AppwriteException}
     * @returns {Promise<Models.EmailTemplate>}
     */
    deleteEmailTemplate(projectId, type, locale) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof type === 'undefined') {
                throw new AppwriteException('Missing required parameter: "type"');
            }
            if (typeof locale === 'undefined') {
                throw new AppwriteException('Missing required parameter: "locale"');
            }
            const apiPath = '/projects/{projectId}/templates/email/{type}/{locale}'.replace('{projectId}', projectId).replace('{type}', type).replace('{locale}', locale);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * Get custom SMS template
     *
     *
     * @param {string} projectId
     * @param {SmsTemplateType} type
     * @param {SmsTemplateLocale} locale
     * @throws {AppwriteException}
     * @returns {Promise<Models.SmsTemplate>}
     */
    getSmsTemplate(projectId, type, locale) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof type === 'undefined') {
                throw new AppwriteException('Missing required parameter: "type"');
            }
            if (typeof locale === 'undefined') {
                throw new AppwriteException('Missing required parameter: "locale"');
            }
            const apiPath = '/projects/{projectId}/templates/sms/{type}/{locale}'.replace('{projectId}', projectId).replace('{type}', type).replace('{locale}', locale);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Update custom SMS template
     *
     *
     * @param {string} projectId
     * @param {SmsTemplateType} type
     * @param {SmsTemplateLocale} locale
     * @param {string} message
     * @throws {AppwriteException}
     * @returns {Promise<Models.SmsTemplate>}
     */
    updateSmsTemplate(projectId, type, locale, message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof type === 'undefined') {
                throw new AppwriteException('Missing required parameter: "type"');
            }
            if (typeof locale === 'undefined') {
                throw new AppwriteException('Missing required parameter: "locale"');
            }
            if (typeof message === 'undefined') {
                throw new AppwriteException('Missing required parameter: "message"');
            }
            const apiPath = '/projects/{projectId}/templates/sms/{type}/{locale}'.replace('{projectId}', projectId).replace('{type}', type).replace('{locale}', locale);
            const payload = {};
            if (typeof message !== 'undefined') {
                payload['message'] = message;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Reset custom SMS template
     *
     *
     * @param {string} projectId
     * @param {SmsTemplateType} type
     * @param {SmsTemplateLocale} locale
     * @throws {AppwriteException}
     * @returns {Promise<Models.SmsTemplate>}
     */
    deleteSmsTemplate(projectId, type, locale) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof type === 'undefined') {
                throw new AppwriteException('Missing required parameter: "type"');
            }
            if (typeof locale === 'undefined') {
                throw new AppwriteException('Missing required parameter: "locale"');
            }
            const apiPath = '/projects/{projectId}/templates/sms/{type}/{locale}'.replace('{projectId}', projectId).replace('{type}', type).replace('{locale}', locale);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * List webhooks
     *
     *
     * @param {string} projectId
     * @throws {AppwriteException}
     * @returns {Promise<Models.WebhookList>}
     */
    listWebhooks(projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            const apiPath = '/projects/{projectId}/webhooks'.replace('{projectId}', projectId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Create webhook
     *
     *
     * @param {string} projectId
     * @param {string} name
     * @param {string[]} events
     * @param {string} url
     * @param {boolean} security
     * @param {boolean} enabled
     * @param {string} httpUser
     * @param {string} httpPass
     * @throws {AppwriteException}
     * @returns {Promise<Models.Webhook>}
     */
    createWebhook(projectId, name, events, url, security, enabled, httpUser, httpPass) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            if (typeof events === 'undefined') {
                throw new AppwriteException('Missing required parameter: "events"');
            }
            if (typeof url === 'undefined') {
                throw new AppwriteException('Missing required parameter: "url"');
            }
            if (typeof security === 'undefined') {
                throw new AppwriteException('Missing required parameter: "security"');
            }
            const apiPath = '/projects/{projectId}/webhooks'.replace('{projectId}', projectId);
            const payload = {};
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            if (typeof events !== 'undefined') {
                payload['events'] = events;
            }
            if (typeof url !== 'undefined') {
                payload['url'] = url;
            }
            if (typeof security !== 'undefined') {
                payload['security'] = security;
            }
            if (typeof httpUser !== 'undefined') {
                payload['httpUser'] = httpUser;
            }
            if (typeof httpPass !== 'undefined') {
                payload['httpPass'] = httpPass;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Get webhook
     *
     *
     * @param {string} projectId
     * @param {string} webhookId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Webhook>}
     */
    getWebhook(projectId, webhookId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof webhookId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "webhookId"');
            }
            const apiPath = '/projects/{projectId}/webhooks/{webhookId}'.replace('{projectId}', projectId).replace('{webhookId}', webhookId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Update webhook
     *
     *
     * @param {string} projectId
     * @param {string} webhookId
     * @param {string} name
     * @param {string[]} events
     * @param {string} url
     * @param {boolean} security
     * @param {boolean} enabled
     * @param {string} httpUser
     * @param {string} httpPass
     * @throws {AppwriteException}
     * @returns {Promise<Models.Webhook>}
     */
    updateWebhook(projectId, webhookId, name, events, url, security, enabled, httpUser, httpPass) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof webhookId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "webhookId"');
            }
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            if (typeof events === 'undefined') {
                throw new AppwriteException('Missing required parameter: "events"');
            }
            if (typeof url === 'undefined') {
                throw new AppwriteException('Missing required parameter: "url"');
            }
            if (typeof security === 'undefined') {
                throw new AppwriteException('Missing required parameter: "security"');
            }
            const apiPath = '/projects/{projectId}/webhooks/{webhookId}'.replace('{projectId}', projectId).replace('{webhookId}', webhookId);
            const payload = {};
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            if (typeof events !== 'undefined') {
                payload['events'] = events;
            }
            if (typeof url !== 'undefined') {
                payload['url'] = url;
            }
            if (typeof security !== 'undefined') {
                payload['security'] = security;
            }
            if (typeof httpUser !== 'undefined') {
                payload['httpUser'] = httpUser;
            }
            if (typeof httpPass !== 'undefined') {
                payload['httpPass'] = httpPass;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('put', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete webhook
     *
     *
     * @param {string} projectId
     * @param {string} webhookId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteWebhook(projectId, webhookId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof webhookId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "webhookId"');
            }
            const apiPath = '/projects/{projectId}/webhooks/{webhookId}'.replace('{projectId}', projectId).replace('{webhookId}', webhookId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * Update webhook signature key
     *
     *
     * @param {string} projectId
     * @param {string} webhookId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Webhook>}
     */
    updateWebhookSignature(projectId, webhookId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof projectId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "projectId"');
            }
            if (typeof webhookId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "webhookId"');
            }
            const apiPath = '/projects/{projectId}/webhooks/{webhookId}/signature'.replace('{projectId}', projectId).replace('{webhookId}', webhookId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
}

class Proxy {
    constructor(client) {
        this.client = client;
    }
    /**
     * List Rules
     *
     * Get a list of all the proxy rules. You can use the query params to filter your results.
     *
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppwriteException}
     * @returns {Promise<Models.ProxyRuleList>}
     */
    listRules(queries, search) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/proxy/rules';
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            if (typeof search !== 'undefined') {
                payload['search'] = search;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Create Rule
     *
     * Create a new proxy rule.
     *
     * @param {string} domain
     * @param {ResourceType} resourceType
     * @param {string} resourceId
     * @throws {AppwriteException}
     * @returns {Promise<Models.ProxyRule>}
     */
    createRule(domain, resourceType, resourceId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof domain === 'undefined') {
                throw new AppwriteException('Missing required parameter: "domain"');
            }
            if (typeof resourceType === 'undefined') {
                throw new AppwriteException('Missing required parameter: "resourceType"');
            }
            const apiPath = '/proxy/rules';
            const payload = {};
            if (typeof domain !== 'undefined') {
                payload['domain'] = domain;
            }
            if (typeof resourceType !== 'undefined') {
                payload['resourceType'] = resourceType;
            }
            if (typeof resourceId !== 'undefined') {
                payload['resourceId'] = resourceId;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Get Rule
     *
     * Get a proxy rule by its unique ID.
     *
     * @param {string} ruleId
     * @throws {AppwriteException}
     * @returns {Promise<Models.ProxyRule>}
     */
    getRule(ruleId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof ruleId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "ruleId"');
            }
            const apiPath = '/proxy/rules/{ruleId}'.replace('{ruleId}', ruleId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete Rule
     *
     * Delete a proxy rule by its unique ID.
     *
     * @param {string} ruleId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteRule(ruleId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof ruleId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "ruleId"');
            }
            const apiPath = '/proxy/rules/{ruleId}'.replace('{ruleId}', ruleId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * Update Rule Verification Status
     *
     *
     * @param {string} ruleId
     * @throws {AppwriteException}
     * @returns {Promise<Models.ProxyRule>}
     */
    updateRuleVerification(ruleId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof ruleId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "ruleId"');
            }
            const apiPath = '/proxy/rules/{ruleId}/verification'.replace('{ruleId}', ruleId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
}

class Storage {
    constructor(client) {
        this.client = client;
    }
    /**
     * List buckets
     *
     * Get a list of all the storage buckets. You can use the query params to filter your results.
     *
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppwriteException}
     * @returns {Promise<Models.BucketList>}
     */
    listBuckets(queries, search) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/storage/buckets';
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            if (typeof search !== 'undefined') {
                payload['search'] = search;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Create bucket
     *
     * Create a new storage bucket.
     *
     * @param {string} bucketId
     * @param {string} name
     * @param {string[]} permissions
     * @param {boolean} fileSecurity
     * @param {boolean} enabled
     * @param {number} maximumFileSize
     * @param {string[]} allowedFileExtensions
     * @param {Compression} compression
     * @param {boolean} encryption
     * @param {boolean} antivirus
     * @throws {AppwriteException}
     * @returns {Promise<Models.Bucket>}
     */
    createBucket(bucketId, name, permissions, fileSecurity, enabled, maximumFileSize, allowedFileExtensions, compression, encryption, antivirus) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof bucketId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "bucketId"');
            }
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            const apiPath = '/storage/buckets';
            const payload = {};
            if (typeof bucketId !== 'undefined') {
                payload['bucketId'] = bucketId;
            }
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof permissions !== 'undefined') {
                payload['permissions'] = permissions;
            }
            if (typeof fileSecurity !== 'undefined') {
                payload['fileSecurity'] = fileSecurity;
            }
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            if (typeof maximumFileSize !== 'undefined') {
                payload['maximumFileSize'] = maximumFileSize;
            }
            if (typeof allowedFileExtensions !== 'undefined') {
                payload['allowedFileExtensions'] = allowedFileExtensions;
            }
            if (typeof compression !== 'undefined') {
                payload['compression'] = compression;
            }
            if (typeof encryption !== 'undefined') {
                payload['encryption'] = encryption;
            }
            if (typeof antivirus !== 'undefined') {
                payload['antivirus'] = antivirus;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Get bucket
     *
     * Get a storage bucket by its unique ID. This endpoint response returns a JSON object with the storage bucket metadata.
     *
     * @param {string} bucketId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Bucket>}
     */
    getBucket(bucketId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof bucketId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "bucketId"');
            }
            const apiPath = '/storage/buckets/{bucketId}'.replace('{bucketId}', bucketId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Update bucket
     *
     * Update a storage bucket by its unique ID.
     *
     * @param {string} bucketId
     * @param {string} name
     * @param {string[]} permissions
     * @param {boolean} fileSecurity
     * @param {boolean} enabled
     * @param {number} maximumFileSize
     * @param {string[]} allowedFileExtensions
     * @param {Compression} compression
     * @param {boolean} encryption
     * @param {boolean} antivirus
     * @throws {AppwriteException}
     * @returns {Promise<Models.Bucket>}
     */
    updateBucket(bucketId, name, permissions, fileSecurity, enabled, maximumFileSize, allowedFileExtensions, compression, encryption, antivirus) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof bucketId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "bucketId"');
            }
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            const apiPath = '/storage/buckets/{bucketId}'.replace('{bucketId}', bucketId);
            const payload = {};
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof permissions !== 'undefined') {
                payload['permissions'] = permissions;
            }
            if (typeof fileSecurity !== 'undefined') {
                payload['fileSecurity'] = fileSecurity;
            }
            if (typeof enabled !== 'undefined') {
                payload['enabled'] = enabled;
            }
            if (typeof maximumFileSize !== 'undefined') {
                payload['maximumFileSize'] = maximumFileSize;
            }
            if (typeof allowedFileExtensions !== 'undefined') {
                payload['allowedFileExtensions'] = allowedFileExtensions;
            }
            if (typeof compression !== 'undefined') {
                payload['compression'] = compression;
            }
            if (typeof encryption !== 'undefined') {
                payload['encryption'] = encryption;
            }
            if (typeof antivirus !== 'undefined') {
                payload['antivirus'] = antivirus;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('put', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete bucket
     *
     * Delete a storage bucket by its unique ID.
     *
     * @param {string} bucketId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteBucket(bucketId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof bucketId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "bucketId"');
            }
            const apiPath = '/storage/buckets/{bucketId}'.replace('{bucketId}', bucketId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * List files
     *
     * Get a list of all the user files. You can use the query params to filter your results.
     *
     * @param {string} bucketId
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppwriteException}
     * @returns {Promise<Models.FileList>}
     */
    listFiles(bucketId, queries, search) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof bucketId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "bucketId"');
            }
            const apiPath = '/storage/buckets/{bucketId}/files'.replace('{bucketId}', bucketId);
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            if (typeof search !== 'undefined') {
                payload['search'] = search;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Create file
     *
     * Create a new file. Before using this route, you should create a new bucket resource using either a [server integration](https://appconda.io/docs/server/storage#storageCreateBucket) API or directly from your Appconda console.

Larger files should be uploaded using multiple requests with the [content-range](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Range) header to send a partial request with a maximum supported chunk of `5MB`. The `content-range` header values should always be in bytes.

When the first request is sent, the server will return the **File** object, and the subsequent part request must include the file&#039;s **id** in `x-appconda-id` header to allow the server to know that the partial upload is for the existing file and not for a new one.

If you&#039;re creating a new file using one of the Appconda SDKs, all the chunking logic will be managed by the SDK internally.

     *
     * @param {string} bucketId
     * @param {string} fileId
     * @param {File} file
     * @param {string[]} permissions
     * @throws {AppwriteException}
     * @returns {Promise<Models.File>}
     */
    createFile(bucketId, fileId, file, permissions, onProgress = (progress) => { }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof bucketId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "bucketId"');
            }
            if (typeof fileId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "fileId"');
            }
            if (typeof file === 'undefined') {
                throw new AppwriteException('Missing required parameter: "file"');
            }
            const apiPath = '/storage/buckets/{bucketId}/files'.replace('{bucketId}', bucketId);
            const payload = {};
            if (typeof fileId !== 'undefined') {
                payload['fileId'] = fileId;
            }
            if (typeof file !== 'undefined') {
                payload['file'] = file;
            }
            if (typeof permissions !== 'undefined') {
                payload['permissions'] = permissions;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'multipart/form-data',
            };
            return yield this.client.chunkedUpload('post', uri, apiHeaders, payload, onProgress);
        });
    }
    /**
     * Get file
     *
     * Get a file by its unique ID. This endpoint response returns a JSON object with the file metadata.
     *
     * @param {string} bucketId
     * @param {string} fileId
     * @throws {AppwriteException}
     * @returns {Promise<Models.File>}
     */
    getFile(bucketId, fileId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof bucketId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "bucketId"');
            }
            if (typeof fileId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "fileId"');
            }
            const apiPath = '/storage/buckets/{bucketId}/files/{fileId}'.replace('{bucketId}', bucketId).replace('{fileId}', fileId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Update file
     *
     * Update a file by its unique ID. Only users with write permissions have access to update this resource.
     *
     * @param {string} bucketId
     * @param {string} fileId
     * @param {string} name
     * @param {string[]} permissions
     * @throws {AppwriteException}
     * @returns {Promise<Models.File>}
     */
    updateFile(bucketId, fileId, name, permissions) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof bucketId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "bucketId"');
            }
            if (typeof fileId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "fileId"');
            }
            const apiPath = '/storage/buckets/{bucketId}/files/{fileId}'.replace('{bucketId}', bucketId).replace('{fileId}', fileId);
            const payload = {};
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof permissions !== 'undefined') {
                payload['permissions'] = permissions;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('put', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete File
     *
     * Delete a file by its unique ID. Only users with write permissions have access to delete this resource.
     *
     * @param {string} bucketId
     * @param {string} fileId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteFile(bucketId, fileId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof bucketId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "bucketId"');
            }
            if (typeof fileId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "fileId"');
            }
            const apiPath = '/storage/buckets/{bucketId}/files/{fileId}'.replace('{bucketId}', bucketId).replace('{fileId}', fileId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * Get file for download
     *
     * Get a file content by its unique ID. The endpoint response return with a &#039;Content-Disposition: attachment&#039; header that tells the browser to start downloading the file to user downloads directory.
     *
     * @param {string} bucketId
     * @param {string} fileId
     * @throws {AppwriteException}
     * @returns {string}
     */
    getFileDownload(bucketId, fileId) {
        if (typeof bucketId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "bucketId"');
        }
        if (typeof fileId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "fileId"');
        }
        const apiPath = '/storage/buckets/{bucketId}/files/{fileId}/download'.replace('{bucketId}', bucketId).replace('{fileId}', fileId);
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(Service.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(Client.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        return uri.toString();
    }
    /**
     * Get file preview
     *
     * Get a file preview image. Currently, this method supports preview for image files (jpg, png, and gif), other supported formats, like pdf, docs, slides, and spreadsheets, will return the file icon image. You can also pass query string arguments for cutting and resizing your preview image. Preview is supported only for image files smaller than 10MB.
     *
     * @param {string} bucketId
     * @param {string} fileId
     * @param {number} width
     * @param {number} height
     * @param {ImageGravity} gravity
     * @param {number} quality
     * @param {number} borderWidth
     * @param {string} borderColor
     * @param {number} borderRadius
     * @param {number} opacity
     * @param {number} rotation
     * @param {string} background
     * @param {ImageFormat} output
     * @throws {AppwriteException}
     * @returns {string}
     */
    getFilePreview(bucketId, fileId, width, height, gravity, quality, borderWidth, borderColor, borderRadius, opacity, rotation, background, output) {
        if (typeof bucketId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "bucketId"');
        }
        if (typeof fileId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "fileId"');
        }
        const apiPath = '/storage/buckets/{bucketId}/files/{fileId}/preview'.replace('{bucketId}', bucketId).replace('{fileId}', fileId);
        const payload = {};
        if (typeof width !== 'undefined') {
            payload['width'] = width;
        }
        if (typeof height !== 'undefined') {
            payload['height'] = height;
        }
        if (typeof gravity !== 'undefined') {
            payload['gravity'] = gravity;
        }
        if (typeof quality !== 'undefined') {
            payload['quality'] = quality;
        }
        if (typeof borderWidth !== 'undefined') {
            payload['borderWidth'] = borderWidth;
        }
        if (typeof borderColor !== 'undefined') {
            payload['borderColor'] = borderColor;
        }
        if (typeof borderRadius !== 'undefined') {
            payload['borderRadius'] = borderRadius;
        }
        if (typeof opacity !== 'undefined') {
            payload['opacity'] = opacity;
        }
        if (typeof rotation !== 'undefined') {
            payload['rotation'] = rotation;
        }
        if (typeof background !== 'undefined') {
            payload['background'] = background;
        }
        if (typeof output !== 'undefined') {
            payload['output'] = output;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(Service.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(Client.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        return uri.toString();
    }
    /**
     * Get file for view
     *
     * Get a file content by its unique ID. This endpoint is similar to the download method but returns with no  &#039;Content-Disposition: attachment&#039; header.
     *
     * @param {string} bucketId
     * @param {string} fileId
     * @throws {AppwriteException}
     * @returns {string}
     */
    getFileView(bucketId, fileId) {
        if (typeof bucketId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "bucketId"');
        }
        if (typeof fileId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "fileId"');
        }
        const apiPath = '/storage/buckets/{bucketId}/files/{fileId}/view'.replace('{bucketId}', bucketId).replace('{fileId}', fileId);
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(Service.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(Client.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        return uri.toString();
    }
    /**
     * Get storage usage stats
     *
     *
     * @param {StorageUsageRange} range
     * @throws {AppwriteException}
     * @returns {Promise<Models.UsageStorage>}
     */
    getUsage(range) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/storage/usage';
            const payload = {};
            if (typeof range !== 'undefined') {
                payload['range'] = range;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get bucket usage stats
     *
     *
     * @param {string} bucketId
     * @param {StorageUsageRange} range
     * @throws {AppwriteException}
     * @returns {Promise<Models.UsageBuckets>}
     */
    getBucketUsage(bucketId, range) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof bucketId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "bucketId"');
            }
            const apiPath = '/storage/{bucketId}/usage'.replace('{bucketId}', bucketId);
            const payload = {};
            if (typeof range !== 'undefined') {
                payload['range'] = range;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
}

class Teams {
    constructor(client) {
        this.client = client;
    }
    /**
     * List teams
     *
     * Get a list of all the teams in which the current user is a member. You can use the parameters to filter your results.
     *
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppwriteException}
     * @returns {Promise<Models.TeamList<Preferences>>}
     */
    list(queries, search) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/teams';
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            if (typeof search !== 'undefined') {
                payload['search'] = search;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Create team
     *
     * Create a new team. The user who creates the team will automatically be assigned as the owner of the team. Only the users with the owner role can invite new members, add new owners and delete or update the team.
     *
     * @param {string} teamId
     * @param {string} name
     * @param {string[]} roles
     * @throws {AppwriteException}
     * @returns {Promise<Models.Team<Preferences>>}
     */
    create(teamId, name, roles) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof teamId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "teamId"');
            }
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            const apiPath = '/teams';
            const payload = {};
            if (typeof teamId !== 'undefined') {
                payload['teamId'] = teamId;
            }
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof roles !== 'undefined') {
                payload['roles'] = roles;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Get team
     *
     * Get a team by its ID. All team members have read access for this resource.
     *
     * @param {string} teamId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Team<Preferences>>}
     */
    get(teamId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof teamId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "teamId"');
            }
            const apiPath = '/teams/{teamId}'.replace('{teamId}', teamId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Update name
     *
     * Update the team&#039;s name by its unique ID.
     *
     * @param {string} teamId
     * @param {string} name
     * @throws {AppwriteException}
     * @returns {Promise<Models.Team<Preferences>>}
     */
    updateName(teamId, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof teamId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "teamId"');
            }
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            const apiPath = '/teams/{teamId}'.replace('{teamId}', teamId);
            const payload = {};
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('put', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete team
     *
     * Delete a team using its ID. Only team members with the owner role can delete the team.
     *
     * @param {string} teamId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    delete(teamId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof teamId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "teamId"');
            }
            const apiPath = '/teams/{teamId}'.replace('{teamId}', teamId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * List team logs
     *
     * Get the team activity logs list by its unique ID.
     *
     * @param {string} teamId
     * @param {string[]} queries
     * @throws {AppwriteException}
     * @returns {Promise<Models.LogList>}
     */
    listLogs(teamId, queries) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof teamId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "teamId"');
            }
            const apiPath = '/teams/{teamId}/logs'.replace('{teamId}', teamId);
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * List team memberships
     *
     * Use this endpoint to list a team&#039;s members using the team&#039;s ID. All team members have read access to this endpoint.
     *
     * @param {string} teamId
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppwriteException}
     * @returns {Promise<Models.MembershipList>}
     */
    listMemberships(teamId, queries, search) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof teamId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "teamId"');
            }
            const apiPath = '/teams/{teamId}/memberships'.replace('{teamId}', teamId);
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            if (typeof search !== 'undefined') {
                payload['search'] = search;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Create team membership
     *
     * Invite a new member to join your team. Provide an ID for existing users, or invite unregistered users using an email or phone number. If initiated from a Client SDK, Appconda will send an email or sms with a link to join the team to the invited user, and an account will be created for them if one doesn&#039;t exist. If initiated from a Server SDK, the new member will be added automatically to the team.

You only need to provide one of a user ID, email, or phone number. Appconda will prioritize accepting the user ID &gt; email &gt; phone number if you provide more than one of these parameters.

Use the `url` parameter to redirect the user from the invitation email to your app. After the user is redirected, use the [Update Team Membership Status](https://appconda.io/docs/references/cloud/client-web/teams#updateMembershipStatus) endpoint to allow the user to accept the invitation to the team.

Please note that to avoid a [Redirect Attack](https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.md) Appconda will accept the only redirect URLs under the domains you have added as a platform on the Appconda Console.

     *
     * @param {string} teamId
     * @param {string[]} roles
     * @param {string} email
     * @param {string} userId
     * @param {string} phone
     * @param {string} url
     * @param {string} name
     * @throws {AppwriteException}
     * @returns {Promise<Models.Membership>}
     */
    createMembership(teamId, roles, email, userId, phone, url, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof teamId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "teamId"');
            }
            if (typeof roles === 'undefined') {
                throw new AppwriteException('Missing required parameter: "roles"');
            }
            const apiPath = '/teams/{teamId}/memberships'.replace('{teamId}', teamId);
            const payload = {};
            if (typeof email !== 'undefined') {
                payload['email'] = email;
            }
            if (typeof userId !== 'undefined') {
                payload['userId'] = userId;
            }
            if (typeof phone !== 'undefined') {
                payload['phone'] = phone;
            }
            if (typeof roles !== 'undefined') {
                payload['roles'] = roles;
            }
            if (typeof url !== 'undefined') {
                payload['url'] = url;
            }
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Get team membership
     *
     * Get a team member by the membership unique id. All team members have read access for this resource.
     *
     * @param {string} teamId
     * @param {string} membershipId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Membership>}
     */
    getMembership(teamId, membershipId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof teamId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "teamId"');
            }
            if (typeof membershipId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "membershipId"');
            }
            const apiPath = '/teams/{teamId}/memberships/{membershipId}'.replace('{teamId}', teamId).replace('{membershipId}', membershipId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Update membership
     *
     * Modify the roles of a team member. Only team members with the owner role have access to this endpoint. Learn more about [roles and permissions](https://appconda.io/docs/permissions).

     *
     * @param {string} teamId
     * @param {string} membershipId
     * @param {string[]} roles
     * @throws {AppwriteException}
     * @returns {Promise<Models.Membership>}
     */
    updateMembership(teamId, membershipId, roles) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof teamId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "teamId"');
            }
            if (typeof membershipId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "membershipId"');
            }
            if (typeof roles === 'undefined') {
                throw new AppwriteException('Missing required parameter: "roles"');
            }
            const apiPath = '/teams/{teamId}/memberships/{membershipId}'.replace('{teamId}', teamId).replace('{membershipId}', membershipId);
            const payload = {};
            if (typeof roles !== 'undefined') {
                payload['roles'] = roles;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete team membership
     *
     * This endpoint allows a user to leave a team or for a team owner to delete the membership of any other team member. You can also use this endpoint to delete a user membership even if it is not accepted.
     *
     * @param {string} teamId
     * @param {string} membershipId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteMembership(teamId, membershipId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof teamId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "teamId"');
            }
            if (typeof membershipId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "membershipId"');
            }
            const apiPath = '/teams/{teamId}/memberships/{membershipId}'.replace('{teamId}', teamId).replace('{membershipId}', membershipId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * Update team membership status
     *
     * Use this endpoint to allow a user to accept an invitation to join a team after being redirected back to your app from the invitation email received by the user.

If the request is successful, a session for the user is automatically created.

     *
     * @param {string} teamId
     * @param {string} membershipId
     * @param {string} userId
     * @param {string} secret
     * @throws {AppwriteException}
     * @returns {Promise<Models.Membership>}
     */
    updateMembershipStatus(teamId, membershipId, userId, secret) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof teamId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "teamId"');
            }
            if (typeof membershipId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "membershipId"');
            }
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof secret === 'undefined') {
                throw new AppwriteException('Missing required parameter: "secret"');
            }
            const apiPath = '/teams/{teamId}/memberships/{membershipId}/status'.replace('{teamId}', teamId).replace('{membershipId}', membershipId);
            const payload = {};
            if (typeof userId !== 'undefined') {
                payload['userId'] = userId;
            }
            if (typeof secret !== 'undefined') {
                payload['secret'] = secret;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Get team preferences
     *
     * Get the team&#039;s shared preferences by its unique ID. If a preference doesn&#039;t need to be shared by all team members, prefer storing them in [user preferences](https://appconda.io/docs/references/cloud/client-web/account#getPrefs).
     *
     * @param {string} teamId
     * @throws {AppwriteException}
     * @returns {Promise<Preferences>}
     */
    getPrefs(teamId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof teamId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "teamId"');
            }
            const apiPath = '/teams/{teamId}/prefs'.replace('{teamId}', teamId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Update preferences
     *
     * Update the team&#039;s preferences by its unique ID. The object you pass is stored as is and replaces any previous value. The maximum allowed prefs size is 64kB and throws an error if exceeded.
     *
     * @param {string} teamId
     * @param {object} prefs
     * @throws {AppwriteException}
     * @returns {Promise<Preferences>}
     */
    updatePrefs(teamId, prefs) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof teamId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "teamId"');
            }
            if (typeof prefs === 'undefined') {
                throw new AppwriteException('Missing required parameter: "prefs"');
            }
            const apiPath = '/teams/{teamId}/prefs'.replace('{teamId}', teamId);
            const payload = {};
            if (typeof prefs !== 'undefined') {
                payload['prefs'] = prefs;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('put', uri, apiHeaders, payload);
        });
    }
}

class Users {
    constructor(client) {
        this.client = client;
    }
    /**
     * List users
     *
     * Get a list of all the project&#039;s users. You can use the query params to filter your results.
     *
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppwriteException}
     * @returns {Promise<Models.UserList<Preferences>>}
     */
    list(queries, search) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/users';
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            if (typeof search !== 'undefined') {
                payload['search'] = search;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
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
     * @throws {AppwriteException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    create(userId, email, phone, password, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            const apiPath = '/users';
            const payload = {};
            if (typeof userId !== 'undefined') {
                payload['userId'] = userId;
            }
            if (typeof email !== 'undefined') {
                payload['email'] = email;
            }
            if (typeof phone !== 'undefined') {
                payload['phone'] = phone;
            }
            if (typeof password !== 'undefined') {
                payload['password'] = password;
            }
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Create user with Argon2 password
     *
     * Create a new user. Password provided must be hashed with the [Argon2](https://en.wikipedia.org/wiki/Argon2) algorithm. Use the [POST /users](https://appconda.io/docs/server/users#usersCreate) endpoint to create users with a plain text password.
     *
     * @param {string} userId
     * @param {string} email
     * @param {string} password
     * @param {string} name
     * @throws {AppwriteException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    createArgon2User(userId, email, password, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof email === 'undefined') {
                throw new AppwriteException('Missing required parameter: "email"');
            }
            if (typeof password === 'undefined') {
                throw new AppwriteException('Missing required parameter: "password"');
            }
            const apiPath = '/users/argon2';
            const payload = {};
            if (typeof userId !== 'undefined') {
                payload['userId'] = userId;
            }
            if (typeof email !== 'undefined') {
                payload['email'] = email;
            }
            if (typeof password !== 'undefined') {
                payload['password'] = password;
            }
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Create user with bcrypt password
     *
     * Create a new user. Password provided must be hashed with the [Bcrypt](https://en.wikipedia.org/wiki/Bcrypt) algorithm. Use the [POST /users](https://appconda.io/docs/server/users#usersCreate) endpoint to create users with a plain text password.
     *
     * @param {string} userId
     * @param {string} email
     * @param {string} password
     * @param {string} name
     * @throws {AppwriteException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    createBcryptUser(userId, email, password, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof email === 'undefined') {
                throw new AppwriteException('Missing required parameter: "email"');
            }
            if (typeof password === 'undefined') {
                throw new AppwriteException('Missing required parameter: "password"');
            }
            const apiPath = '/users/bcrypt';
            const payload = {};
            if (typeof userId !== 'undefined') {
                payload['userId'] = userId;
            }
            if (typeof email !== 'undefined') {
                payload['email'] = email;
            }
            if (typeof password !== 'undefined') {
                payload['password'] = password;
            }
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * List Identities
     *
     * Get identities for all users.
     *
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppwriteException}
     * @returns {Promise<Models.IdentityList>}
     */
    listIdentities(queries, search) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/users/identities';
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            if (typeof search !== 'undefined') {
                payload['search'] = search;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete identity
     *
     * Delete an identity by its unique ID.
     *
     * @param {string} identityId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteIdentity(identityId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof identityId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "identityId"');
            }
            const apiPath = '/users/identities/{identityId}'.replace('{identityId}', identityId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * Create user with MD5 password
     *
     * Create a new user. Password provided must be hashed with the [MD5](https://en.wikipedia.org/wiki/MD5) algorithm. Use the [POST /users](https://appconda.io/docs/server/users#usersCreate) endpoint to create users with a plain text password.
     *
     * @param {string} userId
     * @param {string} email
     * @param {string} password
     * @param {string} name
     * @throws {AppwriteException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    createMD5User(userId, email, password, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof email === 'undefined') {
                throw new AppwriteException('Missing required parameter: "email"');
            }
            if (typeof password === 'undefined') {
                throw new AppwriteException('Missing required parameter: "password"');
            }
            const apiPath = '/users/md5';
            const payload = {};
            if (typeof userId !== 'undefined') {
                payload['userId'] = userId;
            }
            if (typeof email !== 'undefined') {
                payload['email'] = email;
            }
            if (typeof password !== 'undefined') {
                payload['password'] = password;
            }
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Create user with PHPass password
     *
     * Create a new user. Password provided must be hashed with the [PHPass](https://www.openwall.com/phpass/) algorithm. Use the [POST /users](https://appconda.io/docs/server/users#usersCreate) endpoint to create users with a plain text password.
     *
     * @param {string} userId
     * @param {string} email
     * @param {string} password
     * @param {string} name
     * @throws {AppwriteException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    createPHPassUser(userId, email, password, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof email === 'undefined') {
                throw new AppwriteException('Missing required parameter: "email"');
            }
            if (typeof password === 'undefined') {
                throw new AppwriteException('Missing required parameter: "password"');
            }
            const apiPath = '/users/phpass';
            const payload = {};
            if (typeof userId !== 'undefined') {
                payload['userId'] = userId;
            }
            if (typeof email !== 'undefined') {
                payload['email'] = email;
            }
            if (typeof password !== 'undefined') {
                payload['password'] = password;
            }
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
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
     * @throws {AppwriteException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    createScryptUser(userId, email, password, passwordSalt, passwordCpu, passwordMemory, passwordParallel, passwordLength, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof email === 'undefined') {
                throw new AppwriteException('Missing required parameter: "email"');
            }
            if (typeof password === 'undefined') {
                throw new AppwriteException('Missing required parameter: "password"');
            }
            if (typeof passwordSalt === 'undefined') {
                throw new AppwriteException('Missing required parameter: "passwordSalt"');
            }
            if (typeof passwordCpu === 'undefined') {
                throw new AppwriteException('Missing required parameter: "passwordCpu"');
            }
            if (typeof passwordMemory === 'undefined') {
                throw new AppwriteException('Missing required parameter: "passwordMemory"');
            }
            if (typeof passwordParallel === 'undefined') {
                throw new AppwriteException('Missing required parameter: "passwordParallel"');
            }
            if (typeof passwordLength === 'undefined') {
                throw new AppwriteException('Missing required parameter: "passwordLength"');
            }
            const apiPath = '/users/scrypt';
            const payload = {};
            if (typeof userId !== 'undefined') {
                payload['userId'] = userId;
            }
            if (typeof email !== 'undefined') {
                payload['email'] = email;
            }
            if (typeof password !== 'undefined') {
                payload['password'] = password;
            }
            if (typeof passwordSalt !== 'undefined') {
                payload['passwordSalt'] = passwordSalt;
            }
            if (typeof passwordCpu !== 'undefined') {
                payload['passwordCpu'] = passwordCpu;
            }
            if (typeof passwordMemory !== 'undefined') {
                payload['passwordMemory'] = passwordMemory;
            }
            if (typeof passwordParallel !== 'undefined') {
                payload['passwordParallel'] = passwordParallel;
            }
            if (typeof passwordLength !== 'undefined') {
                payload['passwordLength'] = passwordLength;
            }
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
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
     * @throws {AppwriteException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    createScryptModifiedUser(userId, email, password, passwordSalt, passwordSaltSeparator, passwordSignerKey, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof email === 'undefined') {
                throw new AppwriteException('Missing required parameter: "email"');
            }
            if (typeof password === 'undefined') {
                throw new AppwriteException('Missing required parameter: "password"');
            }
            if (typeof passwordSalt === 'undefined') {
                throw new AppwriteException('Missing required parameter: "passwordSalt"');
            }
            if (typeof passwordSaltSeparator === 'undefined') {
                throw new AppwriteException('Missing required parameter: "passwordSaltSeparator"');
            }
            if (typeof passwordSignerKey === 'undefined') {
                throw new AppwriteException('Missing required parameter: "passwordSignerKey"');
            }
            const apiPath = '/users/scrypt-modified';
            const payload = {};
            if (typeof userId !== 'undefined') {
                payload['userId'] = userId;
            }
            if (typeof email !== 'undefined') {
                payload['email'] = email;
            }
            if (typeof password !== 'undefined') {
                payload['password'] = password;
            }
            if (typeof passwordSalt !== 'undefined') {
                payload['passwordSalt'] = passwordSalt;
            }
            if (typeof passwordSaltSeparator !== 'undefined') {
                payload['passwordSaltSeparator'] = passwordSaltSeparator;
            }
            if (typeof passwordSignerKey !== 'undefined') {
                payload['passwordSignerKey'] = passwordSignerKey;
            }
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
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
     * @throws {AppwriteException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    createSHAUser(userId, email, password, passwordVersion, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof email === 'undefined') {
                throw new AppwriteException('Missing required parameter: "email"');
            }
            if (typeof password === 'undefined') {
                throw new AppwriteException('Missing required parameter: "password"');
            }
            const apiPath = '/users/sha';
            const payload = {};
            if (typeof userId !== 'undefined') {
                payload['userId'] = userId;
            }
            if (typeof email !== 'undefined') {
                payload['email'] = email;
            }
            if (typeof password !== 'undefined') {
                payload['password'] = password;
            }
            if (typeof passwordVersion !== 'undefined') {
                payload['passwordVersion'] = passwordVersion;
            }
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Get users usage stats
     *
     *
     * @param {UserUsageRange} range
     * @throws {AppwriteException}
     * @returns {Promise<Models.UsageUsers>}
     */
    getUsage(range) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/users/usage';
            const payload = {};
            if (typeof range !== 'undefined') {
                payload['range'] = range;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get user
     *
     * Get a user by its unique ID.
     *
     * @param {string} userId
     * @throws {AppwriteException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    get(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            const apiPath = '/users/{userId}'.replace('{userId}', userId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete user
     *
     * Delete a user by its unique ID, thereby releasing it&#039;s ID. Since ID is released and can be reused, all user-related resources like documents or storage files should be deleted before user deletion. If you want to keep ID reserved, use the [updateStatus](https://appconda.io/docs/server/users#usersUpdateStatus) endpoint instead.
     *
     * @param {string} userId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    delete(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            const apiPath = '/users/{userId}'.replace('{userId}', userId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * Update email
     *
     * Update the user email by its unique ID.
     *
     * @param {string} userId
     * @param {string} email
     * @throws {AppwriteException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    updateEmail(userId, email) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof email === 'undefined') {
                throw new AppwriteException('Missing required parameter: "email"');
            }
            const apiPath = '/users/{userId}/email'.replace('{userId}', userId);
            const payload = {};
            if (typeof email !== 'undefined') {
                payload['email'] = email;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Create user JWT
     *
     * Use this endpoint to create a JSON Web Token for user by its unique ID. You can use the resulting JWT to authenticate on behalf of the user. The JWT secret will become invalid if the session it uses gets deleted.
     *
     * @param {string} userId
     * @param {string} sessionId
     * @param {number} duration
     * @throws {AppwriteException}
     * @returns {Promise<Models.Jwt>}
     */
    createJWT(userId, sessionId, duration) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            const apiPath = '/users/{userId}/jwts'.replace('{userId}', userId);
            const payload = {};
            if (typeof sessionId !== 'undefined') {
                payload['sessionId'] = sessionId;
            }
            if (typeof duration !== 'undefined') {
                payload['duration'] = duration;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Update user labels
     *
     * Update the user labels by its unique ID.

Labels can be used to grant access to resources. While teams are a way for user&#039;s to share access to a resource, labels can be defined by the developer to grant access without an invitation. See the [Permissions docs](https://appconda.io/docs/permissions) for more info.
     *
     * @param {string} userId
     * @param {string[]} labels
     * @throws {AppwriteException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    updateLabels(userId, labels) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof labels === 'undefined') {
                throw new AppwriteException('Missing required parameter: "labels"');
            }
            const apiPath = '/users/{userId}/labels'.replace('{userId}', userId);
            const payload = {};
            if (typeof labels !== 'undefined') {
                payload['labels'] = labels;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('put', uri, apiHeaders, payload);
        });
    }
    /**
     * List user logs
     *
     * Get the user activity logs list by its unique ID.
     *
     * @param {string} userId
     * @param {string[]} queries
     * @throws {AppwriteException}
     * @returns {Promise<Models.LogList>}
     */
    listLogs(userId, queries) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            const apiPath = '/users/{userId}/logs'.replace('{userId}', userId);
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * List user memberships
     *
     * Get the user membership list by its unique ID.
     *
     * @param {string} userId
     * @throws {AppwriteException}
     * @returns {Promise<Models.MembershipList>}
     */
    listMemberships(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            const apiPath = '/users/{userId}/memberships'.replace('{userId}', userId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Update MFA
     *
     * Enable or disable MFA on a user account.
     *
     * @param {string} userId
     * @param {boolean} mfa
     * @throws {AppwriteException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    updateMfa(userId, mfa) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof mfa === 'undefined') {
                throw new AppwriteException('Missing required parameter: "mfa"');
            }
            const apiPath = '/users/{userId}/mfa'.replace('{userId}', userId);
            const payload = {};
            if (typeof mfa !== 'undefined') {
                payload['mfa'] = mfa;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete Authenticator
     *
     * Delete an authenticator app.
     *
     * @param {string} userId
     * @param {AuthenticatorType} type
     * @throws {AppwriteException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    deleteMfaAuthenticator(userId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof type === 'undefined') {
                throw new AppwriteException('Missing required parameter: "type"');
            }
            const apiPath = '/users/{userId}/mfa/authenticators/{type}'.replace('{userId}', userId).replace('{type}', type);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * List Factors
     *
     * List the factors available on the account to be used as a MFA challange.
     *
     * @param {string} userId
     * @throws {AppwriteException}
     * @returns {Promise<Models.MfaFactors>}
     */
    listMfaFactors(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            const apiPath = '/users/{userId}/mfa/factors'.replace('{userId}', userId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get MFA Recovery Codes
     *
     * Get recovery codes that can be used as backup for MFA flow by User ID. Before getting codes, they must be generated using [createMfaRecoveryCodes](/docs/references/cloud/client-web/account#createMfaRecoveryCodes) method.
     *
     * @param {string} userId
     * @throws {AppwriteException}
     * @returns {Promise<Models.MfaRecoveryCodes>}
     */
    getMfaRecoveryCodes(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            const apiPath = '/users/{userId}/mfa/recovery-codes'.replace('{userId}', userId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Regenerate MFA Recovery Codes
     *
     * Regenerate recovery codes that can be used as backup for MFA flow by User ID. Before regenerating codes, they must be first generated using [createMfaRecoveryCodes](/docs/references/cloud/client-web/account#createMfaRecoveryCodes) method.
     *
     * @param {string} userId
     * @throws {AppwriteException}
     * @returns {Promise<Models.MfaRecoveryCodes>}
     */
    updateMfaRecoveryCodes(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            const apiPath = '/users/{userId}/mfa/recovery-codes'.replace('{userId}', userId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('put', uri, apiHeaders, payload);
        });
    }
    /**
     * Create MFA Recovery Codes
     *
     * Generate recovery codes used as backup for MFA flow for User ID. Recovery codes can be used as a MFA verification type in [createMfaChallenge](/docs/references/cloud/client-web/account#createMfaChallenge) method by client SDK.
     *
     * @param {string} userId
     * @throws {AppwriteException}
     * @returns {Promise<Models.MfaRecoveryCodes>}
     */
    createMfaRecoveryCodes(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            const apiPath = '/users/{userId}/mfa/recovery-codes'.replace('{userId}', userId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Update name
     *
     * Update the user name by its unique ID.
     *
     * @param {string} userId
     * @param {string} name
     * @throws {AppwriteException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    updateName(userId, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            const apiPath = '/users/{userId}/name'.replace('{userId}', userId);
            const payload = {};
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Update password
     *
     * Update the user password by its unique ID.
     *
     * @param {string} userId
     * @param {string} password
     * @throws {AppwriteException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    updatePassword(userId, password) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof password === 'undefined') {
                throw new AppwriteException('Missing required parameter: "password"');
            }
            const apiPath = '/users/{userId}/password'.replace('{userId}', userId);
            const payload = {};
            if (typeof password !== 'undefined') {
                payload['password'] = password;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Update phone
     *
     * Update the user phone by its unique ID.
     *
     * @param {string} userId
     * @param {string} number
     * @throws {AppwriteException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    updatePhone(userId, number) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof number === 'undefined') {
                throw new AppwriteException('Missing required parameter: "number"');
            }
            const apiPath = '/users/{userId}/phone'.replace('{userId}', userId);
            const payload = {};
            if (typeof number !== 'undefined') {
                payload['number'] = number;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Get user preferences
     *
     * Get the user preferences by its unique ID.
     *
     * @param {string} userId
     * @throws {AppwriteException}
     * @returns {Promise<Preferences>}
     */
    getPrefs(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            const apiPath = '/users/{userId}/prefs'.replace('{userId}', userId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Update user preferences
     *
     * Update the user preferences by its unique ID. The object you pass is stored as is, and replaces any previous value. The maximum allowed prefs size is 64kB and throws error if exceeded.
     *
     * @param {string} userId
     * @param {object} prefs
     * @throws {AppwriteException}
     * @returns {Promise<Preferences>}
     */
    updatePrefs(userId, prefs) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof prefs === 'undefined') {
                throw new AppwriteException('Missing required parameter: "prefs"');
            }
            const apiPath = '/users/{userId}/prefs'.replace('{userId}', userId);
            const payload = {};
            if (typeof prefs !== 'undefined') {
                payload['prefs'] = prefs;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * List user sessions
     *
     * Get the user sessions list by its unique ID.
     *
     * @param {string} userId
     * @throws {AppwriteException}
     * @returns {Promise<Models.SessionList>}
     */
    listSessions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            const apiPath = '/users/{userId}/sessions'.replace('{userId}', userId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Create session
     *
     * Creates a session for a user. Returns an immediately usable session object.

If you want to generate a token for a custom authentication flow, use the [POST /users/{userId}/tokens](https://appconda.io/docs/server/users#createToken) endpoint.
     *
     * @param {string} userId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Session>}
     */
    createSession(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            const apiPath = '/users/{userId}/sessions'.replace('{userId}', userId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete user sessions
     *
     * Delete all user&#039;s sessions by using the user&#039;s unique ID.
     *
     * @param {string} userId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteSessions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            const apiPath = '/users/{userId}/sessions'.replace('{userId}', userId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete user session
     *
     * Delete a user sessions by its unique ID.
     *
     * @param {string} userId
     * @param {string} sessionId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteSession(userId, sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof sessionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "sessionId"');
            }
            const apiPath = '/users/{userId}/sessions/{sessionId}'.replace('{userId}', userId).replace('{sessionId}', sessionId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * Update user status
     *
     * Update the user status by its unique ID. Use this endpoint as an alternative to deleting a user if you want to keep user&#039;s ID reserved.
     *
     * @param {string} userId
     * @param {boolean} status
     * @throws {AppwriteException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    updateStatus(userId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof status === 'undefined') {
                throw new AppwriteException('Missing required parameter: "status"');
            }
            const apiPath = '/users/{userId}/status'.replace('{userId}', userId);
            const payload = {};
            if (typeof status !== 'undefined') {
                payload['status'] = status;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * List User Targets
     *
     * List the messaging targets that are associated with a user.
     *
     * @param {string} userId
     * @param {string[]} queries
     * @throws {AppwriteException}
     * @returns {Promise<Models.TargetList>}
     */
    listTargets(userId, queries) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            const apiPath = '/users/{userId}/targets'.replace('{userId}', userId);
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
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
     * @throws {AppwriteException}
     * @returns {Promise<Models.Target>}
     */
    createTarget(userId, targetId, providerType, identifier, providerId, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof targetId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "targetId"');
            }
            if (typeof providerType === 'undefined') {
                throw new AppwriteException('Missing required parameter: "providerType"');
            }
            if (typeof identifier === 'undefined') {
                throw new AppwriteException('Missing required parameter: "identifier"');
            }
            const apiPath = '/users/{userId}/targets'.replace('{userId}', userId);
            const payload = {};
            if (typeof targetId !== 'undefined') {
                payload['targetId'] = targetId;
            }
            if (typeof providerType !== 'undefined') {
                payload['providerType'] = providerType;
            }
            if (typeof identifier !== 'undefined') {
                payload['identifier'] = identifier;
            }
            if (typeof providerId !== 'undefined') {
                payload['providerId'] = providerId;
            }
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Get User Target
     *
     * Get a user&#039;s push notification target by ID.
     *
     * @param {string} userId
     * @param {string} targetId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Target>}
     */
    getTarget(userId, targetId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof targetId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "targetId"');
            }
            const apiPath = '/users/{userId}/targets/{targetId}'.replace('{userId}', userId).replace('{targetId}', targetId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
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
     * @throws {AppwriteException}
     * @returns {Promise<Models.Target>}
     */
    updateTarget(userId, targetId, identifier, providerId, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof targetId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "targetId"');
            }
            const apiPath = '/users/{userId}/targets/{targetId}'.replace('{userId}', userId).replace('{targetId}', targetId);
            const payload = {};
            if (typeof identifier !== 'undefined') {
                payload['identifier'] = identifier;
            }
            if (typeof providerId !== 'undefined') {
                payload['providerId'] = providerId;
            }
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete user target
     *
     * Delete a messaging target.
     *
     * @param {string} userId
     * @param {string} targetId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteTarget(userId, targetId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof targetId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "targetId"');
            }
            const apiPath = '/users/{userId}/targets/{targetId}'.replace('{userId}', userId).replace('{targetId}', targetId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
    /**
     * Create token
     *
     * Returns a token with a secret key for creating a session. Use the user ID and secret and submit a request to the [PUT /account/sessions/token](https://appconda.io/docs/references/cloud/client-web/account#createSession) endpoint to complete the login process.

     *
     * @param {string} userId
     * @param {number} length
     * @param {number} expire
     * @throws {AppwriteException}
     * @returns {Promise<Models.Token>}
     */
    createToken(userId, length, expire) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            const apiPath = '/users/{userId}/tokens'.replace('{userId}', userId);
            const payload = {};
            if (typeof length !== 'undefined') {
                payload['length'] = length;
            }
            if (typeof expire !== 'undefined') {
                payload['expire'] = expire;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Update email verification
     *
     * Update the user email verification status by its unique ID.
     *
     * @param {string} userId
     * @param {boolean} emailVerification
     * @throws {AppwriteException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    updateEmailVerification(userId, emailVerification) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof emailVerification === 'undefined') {
                throw new AppwriteException('Missing required parameter: "emailVerification"');
            }
            const apiPath = '/users/{userId}/verification'.replace('{userId}', userId);
            const payload = {};
            if (typeof emailVerification !== 'undefined') {
                payload['emailVerification'] = emailVerification;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * Update phone verification
     *
     * Update the user phone verification status by its unique ID.
     *
     * @param {string} userId
     * @param {boolean} phoneVerification
     * @throws {AppwriteException}
     * @returns {Promise<Models.User<Preferences>>}
     */
    updatePhoneVerification(userId, phoneVerification) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof phoneVerification === 'undefined') {
                throw new AppwriteException('Missing required parameter: "phoneVerification"');
            }
            const apiPath = '/users/{userId}/verification/phone'.replace('{userId}', userId);
            const payload = {};
            if (typeof phoneVerification !== 'undefined') {
                payload['phoneVerification'] = phoneVerification;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
}

class Vcs {
    constructor(client) {
        this.client = client;
    }
    /**
     * List Repositories
     *
     *
     * @param {string} installationId
     * @param {string} search
     * @throws {AppwriteException}
     * @returns {Promise<Models.ProviderRepositoryList>}
     */
    listRepositories(installationId, search) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof installationId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "installationId"');
            }
            const apiPath = '/vcs/github/installations/{installationId}/providerRepositories'.replace('{installationId}', installationId);
            const payload = {};
            if (typeof search !== 'undefined') {
                payload['search'] = search;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Create repository
     *
     *
     * @param {string} installationId
     * @param {string} name
     * @param {boolean} xprivate
     * @throws {AppwriteException}
     * @returns {Promise<Models.ProviderRepository>}
     */
    createRepository(installationId, name, xprivate) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof installationId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "installationId"');
            }
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            if (typeof xprivate === 'undefined') {
                throw new AppwriteException('Missing required parameter: "xprivate"');
            }
            const apiPath = '/vcs/github/installations/{installationId}/providerRepositories'.replace('{installationId}', installationId);
            const payload = {};
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof xprivate !== 'undefined') {
                payload['private'] = xprivate;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Get repository
     *
     *
     * @param {string} installationId
     * @param {string} providerRepositoryId
     * @throws {AppwriteException}
     * @returns {Promise<Models.ProviderRepository>}
     */
    getRepository(installationId, providerRepositoryId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof installationId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "installationId"');
            }
            if (typeof providerRepositoryId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "providerRepositoryId"');
            }
            const apiPath = '/vcs/github/installations/{installationId}/providerRepositories/{providerRepositoryId}'.replace('{installationId}', installationId).replace('{providerRepositoryId}', providerRepositoryId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * List Repository Branches
     *
     *
     * @param {string} installationId
     * @param {string} providerRepositoryId
     * @throws {AppwriteException}
     * @returns {Promise<Models.BranchList>}
     */
    listRepositoryBranches(installationId, providerRepositoryId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof installationId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "installationId"');
            }
            if (typeof providerRepositoryId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "providerRepositoryId"');
            }
            const apiPath = '/vcs/github/installations/{installationId}/providerRepositories/{providerRepositoryId}/branches'.replace('{installationId}', installationId).replace('{providerRepositoryId}', providerRepositoryId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get files and directories of a VCS repository
     *
     *
     * @param {string} installationId
     * @param {string} providerRepositoryId
     * @param {string} providerRootDirectory
     * @throws {AppwriteException}
     * @returns {Promise<Models.VcsContentList>}
     */
    getRepositoryContents(installationId, providerRepositoryId, providerRootDirectory) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof installationId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "installationId"');
            }
            if (typeof providerRepositoryId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "providerRepositoryId"');
            }
            const apiPath = '/vcs/github/installations/{installationId}/providerRepositories/{providerRepositoryId}/contents'.replace('{installationId}', installationId).replace('{providerRepositoryId}', providerRepositoryId);
            const payload = {};
            if (typeof providerRootDirectory !== 'undefined') {
                payload['providerRootDirectory'] = providerRootDirectory;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Detect runtime settings from source code
     *
     *
     * @param {string} installationId
     * @param {string} providerRepositoryId
     * @param {string} providerRootDirectory
     * @throws {AppwriteException}
     * @returns {Promise<Models.Detection>}
     */
    createRepositoryDetection(installationId, providerRepositoryId, providerRootDirectory) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof installationId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "installationId"');
            }
            if (typeof providerRepositoryId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "providerRepositoryId"');
            }
            const apiPath = '/vcs/github/installations/{installationId}/providerRepositories/{providerRepositoryId}/detection'.replace('{installationId}', installationId).replace('{providerRepositoryId}', providerRepositoryId);
            const payload = {};
            if (typeof providerRootDirectory !== 'undefined') {
                payload['providerRootDirectory'] = providerRootDirectory;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('post', uri, apiHeaders, payload);
        });
    }
    /**
     * Authorize external deployment
     *
     *
     * @param {string} installationId
     * @param {string} repositoryId
     * @param {string} providerPullRequestId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    updateExternalDeployments(installationId, repositoryId, providerPullRequestId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof installationId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "installationId"');
            }
            if (typeof repositoryId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "repositoryId"');
            }
            if (typeof providerPullRequestId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "providerPullRequestId"');
            }
            const apiPath = '/vcs/github/installations/{installationId}/repositories/{repositoryId}'.replace('{installationId}', installationId).replace('{repositoryId}', repositoryId);
            const payload = {};
            if (typeof providerPullRequestId !== 'undefined') {
                payload['providerPullRequestId'] = providerPullRequestId;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('patch', uri, apiHeaders, payload);
        });
    }
    /**
     * List installations
     *
     *
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppwriteException}
     * @returns {Promise<Models.InstallationList>}
     */
    listInstallations(queries, search) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiPath = '/vcs/installations';
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            if (typeof search !== 'undefined') {
                payload['search'] = search;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Get installation
     *
     *
     * @param {string} installationId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Installation>}
     */
    getInstallation(installationId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof installationId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "installationId"');
            }
            const apiPath = '/vcs/installations/{installationId}'.replace('{installationId}', installationId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('get', uri, apiHeaders, payload);
        });
    }
    /**
     * Delete Installation
     *
     *
     * @param {string} installationId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteInstallation(installationId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof installationId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "installationId"');
            }
            const apiPath = '/vcs/installations/{installationId}'.replace('{installationId}', installationId);
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'content-type': 'application/json',
            };
            return yield this.client.call('delete', uri, apiHeaders, payload);
        });
    }
}

/**
 * Helper class to generate permission strings for resources.
 */
class Permission {
}
/**
 * Generate read permission string for the provided role.
 *
 * @param {string} role
 * @returns {string}
 */
Permission.read = (role) => {
    return `read("${role}")`;
};
/**
 * Generate write permission string for the provided role.
 *
 * This is an alias of update, delete, and possibly create.
 * Don't use write in combination with update, delete, or create.
 *
 * @param {string} role
 * @returns {string}
 */
Permission.write = (role) => {
    return `write("${role}")`;
};
/**
 * Generate create permission string for the provided role.
 *
 * @param {string} role
 * @returns {string}
 */
Permission.create = (role) => {
    return `create("${role}")`;
};
/**
 * Generate update permission string for the provided role.
 *
 * @param {string} role
 * @returns {string}
 */
Permission.update = (role) => {
    return `update("${role}")`;
};
/**
 * Generate delete permission string for the provided role.
 *
 * @param {string} role
 * @returns {string}
 */
Permission.delete = (role) => {
    return `delete("${role}")`;
};

/**
 * Helper class to generate role strings for `Permission`.
 */
class Role {
    /**
     * Grants access to anyone.
     *
     * This includes authenticated and unauthenticated users.
     *
     * @returns {string}
     */
    static any() {
        return 'any';
    }
    /**
     * Grants access to a specific user by user ID.
     *
     * You can optionally pass verified or unverified for
     * `status` to target specific types of users.
     *
     * @param {string} id
     * @param {string} status
     * @returns {string}
     */
    static user(id, status = '') {
        if (status === '') {
            return `user:${id}`;
        }
        return `user:${id}/${status}`;
    }
    /**
     * Grants access to any authenticated or anonymous user.
     *
     * You can optionally pass verified or unverified for
     * `status` to target specific types of users.
     *
     * @param {string} status
     * @returns {string}
     */
    static users(status = '') {
        if (status === '') {
            return 'users';
        }
        return `users/${status}`;
    }
    /**
     * Grants access to any guest user without a session.
     *
     * Authenticated users don't have access to this role.
     *
     * @returns {string}
     */
    static guests() {
        return 'guests';
    }
    /**
     * Grants access to a team by team ID.
     *
     * You can optionally pass a role for `role` to target
     * team members with the specified role.
     *
     * @param {string} id
     * @param {string} role
     * @returns {string}
     */
    static team(id, role = '') {
        if (role === '') {
            return `team:${id}`;
        }
        return `team:${id}/${role}`;
    }
    /**
     * Grants access to a specific member of a team.
     *
     * When the member is removed from the team, they will
     * no longer have access.
     *
     * @param {string} id
     * @returns {string}
     */
    static member(id) {
        return `member:${id}`;
    }
    /**
     * Grants access to a user with the specified label.
     *
     * @param {string} name
     * @returns  {string}
     */
    static label(name) {
        return `label:${name}`;
    }
}

var _a, _ID_hexTimestamp;
/**
 * Helper class to generate ID strings for resources.
 */
class ID {
    /**
     * Uses the provided ID as the ID for the resource.
     *
     * @param {string} id
     * @returns {string}
     */
    static custom(id) {
        return id;
    }
    /**
     * Have Appconda generate a unique ID for you.
     *
     * @param {number} padding. Default is 7.
     * @returns {string}
     */
    static unique(padding = 7) {
        // Generate a unique ID with padding to have a longer ID
        const baseId = __classPrivateFieldGet(ID, _a, "m", _ID_hexTimestamp).call(ID);
        let randomPadding = '';
        for (let i = 0; i < padding; i++) {
            const randomHexDigit = Math.floor(Math.random() * 16).toString(16);
            randomPadding += randomHexDigit;
        }
        return baseId + randomPadding;
    }
}
_a = ID, _ID_hexTimestamp = function _ID_hexTimestamp() {
    const now = new Date();
    const sec = Math.floor(now.getTime() / 1000);
    const msec = now.getMilliseconds();
    // Convert to hexadecimal
    const hexTimestamp = sec.toString(16) + msec.toString(16).padStart(5, '0');
    return hexTimestamp;
};

exports.AuthenticatorType = void 0;
(function (AuthenticatorType) {
    AuthenticatorType["Totp"] = "totp";
})(exports.AuthenticatorType || (exports.AuthenticatorType = {}));

exports.AuthenticationFactor = void 0;
(function (AuthenticationFactor) {
    AuthenticationFactor["Email"] = "email";
    AuthenticationFactor["Phone"] = "phone";
    AuthenticationFactor["Totp"] = "totp";
    AuthenticationFactor["Recoverycode"] = "recoverycode";
})(exports.AuthenticationFactor || (exports.AuthenticationFactor = {}));

exports.OAuthProvider = void 0;
(function (OAuthProvider) {
    OAuthProvider["Amazon"] = "amazon";
    OAuthProvider["Apple"] = "apple";
    OAuthProvider["Auth0"] = "auth0";
    OAuthProvider["Authentik"] = "authentik";
    OAuthProvider["Autodesk"] = "autodesk";
    OAuthProvider["Bitbucket"] = "bitbucket";
    OAuthProvider["Bitly"] = "bitly";
    OAuthProvider["Box"] = "box";
    OAuthProvider["Dailymotion"] = "dailymotion";
    OAuthProvider["Discord"] = "discord";
    OAuthProvider["Disqus"] = "disqus";
    OAuthProvider["Dropbox"] = "dropbox";
    OAuthProvider["Etsy"] = "etsy";
    OAuthProvider["Facebook"] = "facebook";
    OAuthProvider["Github"] = "github";
    OAuthProvider["Gitlab"] = "gitlab";
    OAuthProvider["Google"] = "google";
    OAuthProvider["Linkedin"] = "linkedin";
    OAuthProvider["Microsoft"] = "microsoft";
    OAuthProvider["Notion"] = "notion";
    OAuthProvider["Oidc"] = "oidc";
    OAuthProvider["Okta"] = "okta";
    OAuthProvider["Paypal"] = "paypal";
    OAuthProvider["PaypalSandbox"] = "paypalSandbox";
    OAuthProvider["Podio"] = "podio";
    OAuthProvider["Salesforce"] = "salesforce";
    OAuthProvider["Slack"] = "slack";
    OAuthProvider["Spotify"] = "spotify";
    OAuthProvider["Stripe"] = "stripe";
    OAuthProvider["Tradeshift"] = "tradeshift";
    OAuthProvider["TradeshiftBox"] = "tradeshiftBox";
    OAuthProvider["Twitch"] = "twitch";
    OAuthProvider["Wordpress"] = "wordpress";
    OAuthProvider["Yahoo"] = "yahoo";
    OAuthProvider["Yammer"] = "yammer";
    OAuthProvider["Yandex"] = "yandex";
    OAuthProvider["Zoho"] = "zoho";
    OAuthProvider["Zoom"] = "zoom";
    OAuthProvider["Mock"] = "mock";
})(exports.OAuthProvider || (exports.OAuthProvider = {}));

exports.Browser = void 0;
(function (Browser) {
    Browser["AvantBrowser"] = "aa";
    Browser["AndroidWebViewBeta"] = "an";
    Browser["GoogleChrome"] = "ch";
    Browser["GoogleChromeIOS"] = "ci";
    Browser["GoogleChromeMobile"] = "cm";
    Browser["Chromium"] = "cr";
    Browser["MozillaFirefox"] = "ff";
    Browser["Safari"] = "sf";
    Browser["MobileSafari"] = "mf";
    Browser["MicrosoftEdge"] = "ps";
    Browser["MicrosoftEdgeIOS"] = "oi";
    Browser["OperaMini"] = "om";
    Browser["Opera"] = "op";
    Browser["OperaNext"] = "on";
})(exports.Browser || (exports.Browser = {}));

exports.CreditCard = void 0;
(function (CreditCard) {
    CreditCard["AmericanExpress"] = "amex";
    CreditCard["Argencard"] = "argencard";
    CreditCard["Cabal"] = "cabal";
    CreditCard["Cencosud"] = "cencosud";
    CreditCard["DinersClub"] = "diners";
    CreditCard["Discover"] = "discover";
    CreditCard["Elo"] = "elo";
    CreditCard["Hipercard"] = "hipercard";
    CreditCard["JCB"] = "jcb";
    CreditCard["Mastercard"] = "mastercard";
    CreditCard["Naranja"] = "naranja";
    CreditCard["TarjetaShopping"] = "targeta-shopping";
    CreditCard["UnionChinaPay"] = "union-china-pay";
    CreditCard["Visa"] = "visa";
    CreditCard["MIR"] = "mir";
    CreditCard["Maestro"] = "maestro";
})(exports.CreditCard || (exports.CreditCard = {}));

exports.Flag = void 0;
(function (Flag) {
    Flag["Afghanistan"] = "af";
    Flag["Angola"] = "ao";
    Flag["Albania"] = "al";
    Flag["Andorra"] = "ad";
    Flag["UnitedArabEmirates"] = "ae";
    Flag["Argentina"] = "ar";
    Flag["Armenia"] = "am";
    Flag["AntiguaAndBarbuda"] = "ag";
    Flag["Australia"] = "au";
    Flag["Austria"] = "at";
    Flag["Azerbaijan"] = "az";
    Flag["Burundi"] = "bi";
    Flag["Belgium"] = "be";
    Flag["Benin"] = "bj";
    Flag["BurkinaFaso"] = "bf";
    Flag["Bangladesh"] = "bd";
    Flag["Bulgaria"] = "bg";
    Flag["Bahrain"] = "bh";
    Flag["Bahamas"] = "bs";
    Flag["BosniaAndHerzegovina"] = "ba";
    Flag["Belarus"] = "by";
    Flag["Belize"] = "bz";
    Flag["Bolivia"] = "bo";
    Flag["Brazil"] = "br";
    Flag["Barbados"] = "bb";
    Flag["BruneiDarussalam"] = "bn";
    Flag["Bhutan"] = "bt";
    Flag["Botswana"] = "bw";
    Flag["CentralAfricanRepublic"] = "cf";
    Flag["Canada"] = "ca";
    Flag["Switzerland"] = "ch";
    Flag["Chile"] = "cl";
    Flag["China"] = "cn";
    Flag["CoteDIvoire"] = "ci";
    Flag["Cameroon"] = "cm";
    Flag["DemocraticRepublicOfTheCongo"] = "cd";
    Flag["RepublicOfTheCongo"] = "cg";
    Flag["Colombia"] = "co";
    Flag["Comoros"] = "km";
    Flag["CapeVerde"] = "cv";
    Flag["CostaRica"] = "cr";
    Flag["Cuba"] = "cu";
    Flag["Cyprus"] = "cy";
    Flag["CzechRepublic"] = "cz";
    Flag["Germany"] = "de";
    Flag["Djibouti"] = "dj";
    Flag["Dominica"] = "dm";
    Flag["Denmark"] = "dk";
    Flag["DominicanRepublic"] = "do";
    Flag["Algeria"] = "dz";
    Flag["Ecuador"] = "ec";
    Flag["Egypt"] = "eg";
    Flag["Eritrea"] = "er";
    Flag["Spain"] = "es";
    Flag["Estonia"] = "ee";
    Flag["Ethiopia"] = "et";
    Flag["Finland"] = "fi";
    Flag["Fiji"] = "fj";
    Flag["France"] = "fr";
    Flag["MicronesiaFederatedStatesOf"] = "fm";
    Flag["Gabon"] = "ga";
    Flag["UnitedKingdom"] = "gb";
    Flag["Georgia"] = "ge";
    Flag["Ghana"] = "gh";
    Flag["Guinea"] = "gn";
    Flag["Gambia"] = "gm";
    Flag["GuineaBissau"] = "gw";
    Flag["EquatorialGuinea"] = "gq";
    Flag["Greece"] = "gr";
    Flag["Grenada"] = "gd";
    Flag["Guatemala"] = "gt";
    Flag["Guyana"] = "gy";
    Flag["Honduras"] = "hn";
    Flag["Croatia"] = "hr";
    Flag["Haiti"] = "ht";
    Flag["Hungary"] = "hu";
    Flag["Indonesia"] = "id";
    Flag["India"] = "in";
    Flag["Ireland"] = "ie";
    Flag["IranIslamicRepublicOf"] = "ir";
    Flag["Iraq"] = "iq";
    Flag["Iceland"] = "is";
    Flag["Israel"] = "il";
    Flag["Italy"] = "it";
    Flag["Jamaica"] = "jm";
    Flag["Jordan"] = "jo";
    Flag["Japan"] = "jp";
    Flag["Kazakhstan"] = "kz";
    Flag["Kenya"] = "ke";
    Flag["Kyrgyzstan"] = "kg";
    Flag["Cambodia"] = "kh";
    Flag["Kiribati"] = "ki";
    Flag["SaintKittsAndNevis"] = "kn";
    Flag["SouthKorea"] = "kr";
    Flag["Kuwait"] = "kw";
    Flag["LaoPeopleSDemocraticRepublic"] = "la";
    Flag["Lebanon"] = "lb";
    Flag["Liberia"] = "lr";
    Flag["Libya"] = "ly";
    Flag["SaintLucia"] = "lc";
    Flag["Liechtenstein"] = "li";
    Flag["SriLanka"] = "lk";
    Flag["Lesotho"] = "ls";
    Flag["Lithuania"] = "lt";
    Flag["Luxembourg"] = "lu";
    Flag["Latvia"] = "lv";
    Flag["Morocco"] = "ma";
    Flag["Monaco"] = "mc";
    Flag["Moldova"] = "md";
    Flag["Madagascar"] = "mg";
    Flag["Maldives"] = "mv";
    Flag["Mexico"] = "mx";
    Flag["MarshallIslands"] = "mh";
    Flag["NorthMacedonia"] = "mk";
    Flag["Mali"] = "ml";
    Flag["Malta"] = "mt";
    Flag["Myanmar"] = "mm";
    Flag["Montenegro"] = "me";
    Flag["Mongolia"] = "mn";
    Flag["Mozambique"] = "mz";
    Flag["Mauritania"] = "mr";
    Flag["Mauritius"] = "mu";
    Flag["Malawi"] = "mw";
    Flag["Malaysia"] = "my";
    Flag["Namibia"] = "na";
    Flag["Niger"] = "ne";
    Flag["Nigeria"] = "ng";
    Flag["Nicaragua"] = "ni";
    Flag["Netherlands"] = "nl";
    Flag["Norway"] = "no";
    Flag["Nepal"] = "np";
    Flag["Nauru"] = "nr";
    Flag["NewZealand"] = "nz";
    Flag["Oman"] = "om";
    Flag["Pakistan"] = "pk";
    Flag["Panama"] = "pa";
    Flag["Peru"] = "pe";
    Flag["Philippines"] = "ph";
    Flag["Palau"] = "pw";
    Flag["PapuaNewGuinea"] = "pg";
    Flag["Poland"] = "pl";
    Flag["FrenchPolynesia"] = "pf";
    Flag["NorthKorea"] = "kp";
    Flag["Portugal"] = "pt";
    Flag["Paraguay"] = "py";
    Flag["Qatar"] = "qa";
    Flag["Romania"] = "ro";
    Flag["Russia"] = "ru";
    Flag["Rwanda"] = "rw";
    Flag["SaudiArabia"] = "sa";
    Flag["Sudan"] = "sd";
    Flag["Senegal"] = "sn";
    Flag["Singapore"] = "sg";
    Flag["SolomonIslands"] = "sb";
    Flag["SierraLeone"] = "sl";
    Flag["ElSalvador"] = "sv";
    Flag["SanMarino"] = "sm";
    Flag["Somalia"] = "so";
    Flag["Serbia"] = "rs";
    Flag["SouthSudan"] = "ss";
    Flag["SaoTomeAndPrincipe"] = "st";
    Flag["Suriname"] = "sr";
    Flag["Slovakia"] = "sk";
    Flag["Slovenia"] = "si";
    Flag["Sweden"] = "se";
    Flag["Eswatini"] = "sz";
    Flag["Seychelles"] = "sc";
    Flag["Syria"] = "sy";
    Flag["Chad"] = "td";
    Flag["Togo"] = "tg";
    Flag["Thailand"] = "th";
    Flag["Tajikistan"] = "tj";
    Flag["Turkmenistan"] = "tm";
    Flag["TimorLeste"] = "tl";
    Flag["Tonga"] = "to";
    Flag["TrinidadAndTobago"] = "tt";
    Flag["Tunisia"] = "tn";
    Flag["Turkey"] = "tr";
    Flag["Tuvalu"] = "tv";
    Flag["Tanzania"] = "tz";
    Flag["Uganda"] = "ug";
    Flag["Ukraine"] = "ua";
    Flag["Uruguay"] = "uy";
    Flag["UnitedStates"] = "us";
    Flag["Uzbekistan"] = "uz";
    Flag["VaticanCity"] = "va";
    Flag["SaintVincentAndTheGrenadines"] = "vc";
    Flag["Venezuela"] = "ve";
    Flag["Vietnam"] = "vn";
    Flag["Vanuatu"] = "vu";
    Flag["Samoa"] = "ws";
    Flag["Yemen"] = "ye";
    Flag["SouthAfrica"] = "za";
    Flag["Zambia"] = "zm";
    Flag["Zimbabwe"] = "zw";
})(exports.Flag || (exports.Flag = {}));

exports.DatabaseUsageRange = void 0;
(function (DatabaseUsageRange) {
    DatabaseUsageRange["TwentyFourHours"] = "24h";
    DatabaseUsageRange["ThirtyDays"] = "30d";
    DatabaseUsageRange["NinetyDays"] = "90d";
})(exports.DatabaseUsageRange || (exports.DatabaseUsageRange = {}));

exports.RelationshipType = void 0;
(function (RelationshipType) {
    RelationshipType["OneToOne"] = "oneToOne";
    RelationshipType["ManyToOne"] = "manyToOne";
    RelationshipType["ManyToMany"] = "manyToMany";
    RelationshipType["OneToMany"] = "oneToMany";
})(exports.RelationshipType || (exports.RelationshipType = {}));

exports.RelationMutate = void 0;
(function (RelationMutate) {
    RelationMutate["Cascade"] = "cascade";
    RelationMutate["Restrict"] = "restrict";
    RelationMutate["SetNull"] = "setNull";
})(exports.RelationMutate || (exports.RelationMutate = {}));

exports.IndexType = void 0;
(function (IndexType) {
    IndexType["Key"] = "key";
    IndexType["Fulltext"] = "fulltext";
    IndexType["Unique"] = "unique";
})(exports.IndexType || (exports.IndexType = {}));

exports.Runtime = void 0;
(function (Runtime) {
    Runtime["Node145"] = "node-14.5";
    Runtime["Node160"] = "node-16.0";
    Runtime["Node180"] = "node-18.0";
    Runtime["Node190"] = "node-19.0";
    Runtime["Node200"] = "node-20.0";
    Runtime["Node210"] = "node-21.0";
    Runtime["Php80"] = "php-8.0";
    Runtime["Php81"] = "php-8.1";
    Runtime["Php82"] = "php-8.2";
    Runtime["Php83"] = "php-8.3";
    Runtime["Ruby30"] = "ruby-3.0";
    Runtime["Ruby31"] = "ruby-3.1";
    Runtime["Ruby32"] = "ruby-3.2";
    Runtime["Ruby33"] = "ruby-3.3";
    Runtime["Python38"] = "python-3.8";
    Runtime["Python39"] = "python-3.9";
    Runtime["Python310"] = "python-3.10";
    Runtime["Python311"] = "python-3.11";
    Runtime["Python312"] = "python-3.12";
    Runtime["Pythonml311"] = "python-ml-3.11";
    Runtime["Deno140"] = "deno-1.40";
    Runtime["Dart215"] = "dart-2.15";
    Runtime["Dart216"] = "dart-2.16";
    Runtime["Dart217"] = "dart-2.17";
    Runtime["Dart218"] = "dart-2.18";
    Runtime["Dart30"] = "dart-3.0";
    Runtime["Dart31"] = "dart-3.1";
    Runtime["Dart33"] = "dart-3.3";
    Runtime["Dotnet31"] = "dotnet-3.1";
    Runtime["Dotnet60"] = "dotnet-6.0";
    Runtime["Dotnet70"] = "dotnet-7.0";
    Runtime["Java80"] = "java-8.0";
    Runtime["Java110"] = "java-11.0";
    Runtime["Java170"] = "java-17.0";
    Runtime["Java180"] = "java-18.0";
    Runtime["Java210"] = "java-21.0";
    Runtime["Swift55"] = "swift-5.5";
    Runtime["Swift58"] = "swift-5.8";
    Runtime["Swift59"] = "swift-5.9";
    Runtime["Kotlin16"] = "kotlin-1.6";
    Runtime["Kotlin18"] = "kotlin-1.8";
    Runtime["Kotlin19"] = "kotlin-1.9";
    Runtime["Cpp17"] = "cpp-17";
    Runtime["Cpp20"] = "cpp-20";
    Runtime["Bun10"] = "bun-1.0";
    Runtime["Go123"] = "go-1.23";
})(exports.Runtime || (exports.Runtime = {}));

exports.FunctionUsageRange = void 0;
(function (FunctionUsageRange) {
    FunctionUsageRange["TwentyFourHours"] = "24h";
    FunctionUsageRange["ThirtyDays"] = "30d";
    FunctionUsageRange["NinetyDays"] = "90d";
})(exports.FunctionUsageRange || (exports.FunctionUsageRange = {}));

exports.ExecutionMethod = void 0;
(function (ExecutionMethod) {
    ExecutionMethod["GET"] = "GET";
    ExecutionMethod["POST"] = "POST";
    ExecutionMethod["PUT"] = "PUT";
    ExecutionMethod["PATCH"] = "PATCH";
    ExecutionMethod["DELETE"] = "DELETE";
    ExecutionMethod["OPTIONS"] = "OPTIONS";
})(exports.ExecutionMethod || (exports.ExecutionMethod = {}));

exports.Name = void 0;
(function (Name) {
    Name["V1database"] = "v1-database";
    Name["V1deletes"] = "v1-deletes";
    Name["V1audits"] = "v1-audits";
    Name["V1mails"] = "v1-mails";
    Name["V1functions"] = "v1-functions";
    Name["V1usage"] = "v1-usage";
    Name["V1usagedump"] = "v1-usage-dump";
    Name["V1webhooks"] = "v1-webhooks";
    Name["V1certificates"] = "v1-certificates";
    Name["V1builds"] = "v1-builds";
    Name["V1messaging"] = "v1-messaging";
    Name["V1migrations"] = "v1-migrations";
})(exports.Name || (exports.Name = {}));

exports.SmtpEncryption = void 0;
(function (SmtpEncryption) {
    SmtpEncryption["None"] = "none";
    SmtpEncryption["Ssl"] = "ssl";
    SmtpEncryption["Tls"] = "tls";
})(exports.SmtpEncryption || (exports.SmtpEncryption = {}));

exports.ProjectUsageRange = void 0;
(function (ProjectUsageRange) {
    ProjectUsageRange["OneHour"] = "1h";
    ProjectUsageRange["OneDay"] = "1d";
})(exports.ProjectUsageRange || (exports.ProjectUsageRange = {}));

exports.Region = void 0;
(function (Region) {
    Region["Default"] = "default";
    Region["Fra"] = "fra";
})(exports.Region || (exports.Region = {}));

exports.Api = void 0;
(function (Api) {
    Api["Rest"] = "rest";
    Api["Graphql"] = "graphql";
    Api["Realtime"] = "realtime";
})(exports.Api || (exports.Api = {}));

exports.AuthMethod = void 0;
(function (AuthMethod) {
    AuthMethod["Emailpassword"] = "email-password";
    AuthMethod["Magicurl"] = "magic-url";
    AuthMethod["Emailotp"] = "email-otp";
    AuthMethod["Anonymous"] = "anonymous";
    AuthMethod["Invites"] = "invites";
    AuthMethod["Jwt"] = "jwt";
    AuthMethod["Phone"] = "phone";
})(exports.AuthMethod || (exports.AuthMethod = {}));

exports.PlatformType = void 0;
(function (PlatformType) {
    PlatformType["Web"] = "web";
    PlatformType["Flutterweb"] = "flutter-web";
    PlatformType["Flutterios"] = "flutter-ios";
    PlatformType["Flutterandroid"] = "flutter-android";
    PlatformType["Flutterlinux"] = "flutter-linux";
    PlatformType["Fluttermacos"] = "flutter-macos";
    PlatformType["Flutterwindows"] = "flutter-windows";
    PlatformType["Appleios"] = "apple-ios";
    PlatformType["Applemacos"] = "apple-macos";
    PlatformType["Applewatchos"] = "apple-watchos";
    PlatformType["Appletvos"] = "apple-tvos";
    PlatformType["Android"] = "android";
    PlatformType["Unity"] = "unity";
    PlatformType["Reactnativeios"] = "react-native-ios";
    PlatformType["Reactnativeandroid"] = "react-native-android";
})(exports.PlatformType || (exports.PlatformType = {}));

exports.ApiService = void 0;
(function (ApiService) {
    ApiService["Account"] = "account";
    ApiService["Avatars"] = "avatars";
    ApiService["Databases"] = "databases";
    ApiService["Locale"] = "locale";
    ApiService["Health"] = "health";
    ApiService["Storage"] = "storage";
    ApiService["Teams"] = "teams";
    ApiService["Users"] = "users";
    ApiService["Functions"] = "functions";
    ApiService["Graphql"] = "graphql";
    ApiService["Messaging"] = "messaging";
})(exports.ApiService || (exports.ApiService = {}));

exports.SMTPSecure = void 0;
(function (SMTPSecure) {
    SMTPSecure["Tls"] = "tls";
})(exports.SMTPSecure || (exports.SMTPSecure = {}));

exports.EmailTemplateType = void 0;
(function (EmailTemplateType) {
    EmailTemplateType["Verification"] = "verification";
    EmailTemplateType["Magicsession"] = "magicsession";
    EmailTemplateType["Recovery"] = "recovery";
    EmailTemplateType["Invitation"] = "invitation";
    EmailTemplateType["Mfachallenge"] = "mfachallenge";
    EmailTemplateType["Sessionalert"] = "sessionalert";
    EmailTemplateType["Otpsession"] = "otpsession";
})(exports.EmailTemplateType || (exports.EmailTemplateType = {}));

exports.EmailTemplateLocale = void 0;
(function (EmailTemplateLocale) {
    EmailTemplateLocale["Af"] = "af";
    EmailTemplateLocale["Arae"] = "ar-ae";
    EmailTemplateLocale["Arbh"] = "ar-bh";
    EmailTemplateLocale["Ardz"] = "ar-dz";
    EmailTemplateLocale["Areg"] = "ar-eg";
    EmailTemplateLocale["Ariq"] = "ar-iq";
    EmailTemplateLocale["Arjo"] = "ar-jo";
    EmailTemplateLocale["Arkw"] = "ar-kw";
    EmailTemplateLocale["Arlb"] = "ar-lb";
    EmailTemplateLocale["Arly"] = "ar-ly";
    EmailTemplateLocale["Arma"] = "ar-ma";
    EmailTemplateLocale["Arom"] = "ar-om";
    EmailTemplateLocale["Arqa"] = "ar-qa";
    EmailTemplateLocale["Arsa"] = "ar-sa";
    EmailTemplateLocale["Arsy"] = "ar-sy";
    EmailTemplateLocale["Artn"] = "ar-tn";
    EmailTemplateLocale["Arye"] = "ar-ye";
    EmailTemplateLocale["As"] = "as";
    EmailTemplateLocale["Az"] = "az";
    EmailTemplateLocale["Be"] = "be";
    EmailTemplateLocale["Bg"] = "bg";
    EmailTemplateLocale["Bh"] = "bh";
    EmailTemplateLocale["Bn"] = "bn";
    EmailTemplateLocale["Bs"] = "bs";
    EmailTemplateLocale["Ca"] = "ca";
    EmailTemplateLocale["Cs"] = "cs";
    EmailTemplateLocale["Cy"] = "cy";
    EmailTemplateLocale["Da"] = "da";
    EmailTemplateLocale["De"] = "de";
    EmailTemplateLocale["Deat"] = "de-at";
    EmailTemplateLocale["Dech"] = "de-ch";
    EmailTemplateLocale["Deli"] = "de-li";
    EmailTemplateLocale["Delu"] = "de-lu";
    EmailTemplateLocale["El"] = "el";
    EmailTemplateLocale["En"] = "en";
    EmailTemplateLocale["Enau"] = "en-au";
    EmailTemplateLocale["Enbz"] = "en-bz";
    EmailTemplateLocale["Enca"] = "en-ca";
    EmailTemplateLocale["Engb"] = "en-gb";
    EmailTemplateLocale["Enie"] = "en-ie";
    EmailTemplateLocale["Enjm"] = "en-jm";
    EmailTemplateLocale["Ennz"] = "en-nz";
    EmailTemplateLocale["Entt"] = "en-tt";
    EmailTemplateLocale["Enus"] = "en-us";
    EmailTemplateLocale["Enza"] = "en-za";
    EmailTemplateLocale["Eo"] = "eo";
    EmailTemplateLocale["Es"] = "es";
    EmailTemplateLocale["Esar"] = "es-ar";
    EmailTemplateLocale["Esbo"] = "es-bo";
    EmailTemplateLocale["Escl"] = "es-cl";
    EmailTemplateLocale["Esco"] = "es-co";
    EmailTemplateLocale["Escr"] = "es-cr";
    EmailTemplateLocale["Esdo"] = "es-do";
    EmailTemplateLocale["Esec"] = "es-ec";
    EmailTemplateLocale["Esgt"] = "es-gt";
    EmailTemplateLocale["Eshn"] = "es-hn";
    EmailTemplateLocale["Esmx"] = "es-mx";
    EmailTemplateLocale["Esni"] = "es-ni";
    EmailTemplateLocale["Espa"] = "es-pa";
    EmailTemplateLocale["Espe"] = "es-pe";
    EmailTemplateLocale["Espr"] = "es-pr";
    EmailTemplateLocale["Espy"] = "es-py";
    EmailTemplateLocale["Essv"] = "es-sv";
    EmailTemplateLocale["Esuy"] = "es-uy";
    EmailTemplateLocale["Esve"] = "es-ve";
    EmailTemplateLocale["Et"] = "et";
    EmailTemplateLocale["Eu"] = "eu";
    EmailTemplateLocale["Fa"] = "fa";
    EmailTemplateLocale["Fi"] = "fi";
    EmailTemplateLocale["Fo"] = "fo";
    EmailTemplateLocale["Fr"] = "fr";
    EmailTemplateLocale["Frbe"] = "fr-be";
    EmailTemplateLocale["Frca"] = "fr-ca";
    EmailTemplateLocale["Frch"] = "fr-ch";
    EmailTemplateLocale["Frlu"] = "fr-lu";
    EmailTemplateLocale["Ga"] = "ga";
    EmailTemplateLocale["Gd"] = "gd";
    EmailTemplateLocale["He"] = "he";
    EmailTemplateLocale["Hi"] = "hi";
    EmailTemplateLocale["Hr"] = "hr";
    EmailTemplateLocale["Hu"] = "hu";
    EmailTemplateLocale["Id"] = "id";
    EmailTemplateLocale["Is"] = "is";
    EmailTemplateLocale["It"] = "it";
    EmailTemplateLocale["Itch"] = "it-ch";
    EmailTemplateLocale["Ja"] = "ja";
    EmailTemplateLocale["Ji"] = "ji";
    EmailTemplateLocale["Ko"] = "ko";
    EmailTemplateLocale["Ku"] = "ku";
    EmailTemplateLocale["Lt"] = "lt";
    EmailTemplateLocale["Lv"] = "lv";
    EmailTemplateLocale["Mk"] = "mk";
    EmailTemplateLocale["Ml"] = "ml";
    EmailTemplateLocale["Ms"] = "ms";
    EmailTemplateLocale["Mt"] = "mt";
    EmailTemplateLocale["Nb"] = "nb";
    EmailTemplateLocale["Ne"] = "ne";
    EmailTemplateLocale["Nl"] = "nl";
    EmailTemplateLocale["Nlbe"] = "nl-be";
    EmailTemplateLocale["Nn"] = "nn";
    EmailTemplateLocale["No"] = "no";
    EmailTemplateLocale["Pa"] = "pa";
    EmailTemplateLocale["Pl"] = "pl";
    EmailTemplateLocale["Pt"] = "pt";
    EmailTemplateLocale["Ptbr"] = "pt-br";
    EmailTemplateLocale["Rm"] = "rm";
    EmailTemplateLocale["Ro"] = "ro";
    EmailTemplateLocale["Romd"] = "ro-md";
    EmailTemplateLocale["Ru"] = "ru";
    EmailTemplateLocale["Rumd"] = "ru-md";
    EmailTemplateLocale["Sb"] = "sb";
    EmailTemplateLocale["Sk"] = "sk";
    EmailTemplateLocale["Sl"] = "sl";
    EmailTemplateLocale["Sq"] = "sq";
    EmailTemplateLocale["Sr"] = "sr";
    EmailTemplateLocale["Sv"] = "sv";
    EmailTemplateLocale["Svfi"] = "sv-fi";
    EmailTemplateLocale["Th"] = "th";
    EmailTemplateLocale["Tn"] = "tn";
    EmailTemplateLocale["Tr"] = "tr";
    EmailTemplateLocale["Ts"] = "ts";
    EmailTemplateLocale["Ua"] = "ua";
    EmailTemplateLocale["Ur"] = "ur";
    EmailTemplateLocale["Ve"] = "ve";
    EmailTemplateLocale["Vi"] = "vi";
    EmailTemplateLocale["Xh"] = "xh";
    EmailTemplateLocale["Zhcn"] = "zh-cn";
    EmailTemplateLocale["Zhhk"] = "zh-hk";
    EmailTemplateLocale["Zhsg"] = "zh-sg";
    EmailTemplateLocale["Zhtw"] = "zh-tw";
    EmailTemplateLocale["Zu"] = "zu";
})(exports.EmailTemplateLocale || (exports.EmailTemplateLocale = {}));

exports.SmsTemplateType = void 0;
(function (SmsTemplateType) {
    SmsTemplateType["Verification"] = "verification";
    SmsTemplateType["Login"] = "login";
    SmsTemplateType["Invitation"] = "invitation";
    SmsTemplateType["Mfachallenge"] = "mfachallenge";
})(exports.SmsTemplateType || (exports.SmsTemplateType = {}));

exports.SmsTemplateLocale = void 0;
(function (SmsTemplateLocale) {
    SmsTemplateLocale["Af"] = "af";
    SmsTemplateLocale["Arae"] = "ar-ae";
    SmsTemplateLocale["Arbh"] = "ar-bh";
    SmsTemplateLocale["Ardz"] = "ar-dz";
    SmsTemplateLocale["Areg"] = "ar-eg";
    SmsTemplateLocale["Ariq"] = "ar-iq";
    SmsTemplateLocale["Arjo"] = "ar-jo";
    SmsTemplateLocale["Arkw"] = "ar-kw";
    SmsTemplateLocale["Arlb"] = "ar-lb";
    SmsTemplateLocale["Arly"] = "ar-ly";
    SmsTemplateLocale["Arma"] = "ar-ma";
    SmsTemplateLocale["Arom"] = "ar-om";
    SmsTemplateLocale["Arqa"] = "ar-qa";
    SmsTemplateLocale["Arsa"] = "ar-sa";
    SmsTemplateLocale["Arsy"] = "ar-sy";
    SmsTemplateLocale["Artn"] = "ar-tn";
    SmsTemplateLocale["Arye"] = "ar-ye";
    SmsTemplateLocale["As"] = "as";
    SmsTemplateLocale["Az"] = "az";
    SmsTemplateLocale["Be"] = "be";
    SmsTemplateLocale["Bg"] = "bg";
    SmsTemplateLocale["Bh"] = "bh";
    SmsTemplateLocale["Bn"] = "bn";
    SmsTemplateLocale["Bs"] = "bs";
    SmsTemplateLocale["Ca"] = "ca";
    SmsTemplateLocale["Cs"] = "cs";
    SmsTemplateLocale["Cy"] = "cy";
    SmsTemplateLocale["Da"] = "da";
    SmsTemplateLocale["De"] = "de";
    SmsTemplateLocale["Deat"] = "de-at";
    SmsTemplateLocale["Dech"] = "de-ch";
    SmsTemplateLocale["Deli"] = "de-li";
    SmsTemplateLocale["Delu"] = "de-lu";
    SmsTemplateLocale["El"] = "el";
    SmsTemplateLocale["En"] = "en";
    SmsTemplateLocale["Enau"] = "en-au";
    SmsTemplateLocale["Enbz"] = "en-bz";
    SmsTemplateLocale["Enca"] = "en-ca";
    SmsTemplateLocale["Engb"] = "en-gb";
    SmsTemplateLocale["Enie"] = "en-ie";
    SmsTemplateLocale["Enjm"] = "en-jm";
    SmsTemplateLocale["Ennz"] = "en-nz";
    SmsTemplateLocale["Entt"] = "en-tt";
    SmsTemplateLocale["Enus"] = "en-us";
    SmsTemplateLocale["Enza"] = "en-za";
    SmsTemplateLocale["Eo"] = "eo";
    SmsTemplateLocale["Es"] = "es";
    SmsTemplateLocale["Esar"] = "es-ar";
    SmsTemplateLocale["Esbo"] = "es-bo";
    SmsTemplateLocale["Escl"] = "es-cl";
    SmsTemplateLocale["Esco"] = "es-co";
    SmsTemplateLocale["Escr"] = "es-cr";
    SmsTemplateLocale["Esdo"] = "es-do";
    SmsTemplateLocale["Esec"] = "es-ec";
    SmsTemplateLocale["Esgt"] = "es-gt";
    SmsTemplateLocale["Eshn"] = "es-hn";
    SmsTemplateLocale["Esmx"] = "es-mx";
    SmsTemplateLocale["Esni"] = "es-ni";
    SmsTemplateLocale["Espa"] = "es-pa";
    SmsTemplateLocale["Espe"] = "es-pe";
    SmsTemplateLocale["Espr"] = "es-pr";
    SmsTemplateLocale["Espy"] = "es-py";
    SmsTemplateLocale["Essv"] = "es-sv";
    SmsTemplateLocale["Esuy"] = "es-uy";
    SmsTemplateLocale["Esve"] = "es-ve";
    SmsTemplateLocale["Et"] = "et";
    SmsTemplateLocale["Eu"] = "eu";
    SmsTemplateLocale["Fa"] = "fa";
    SmsTemplateLocale["Fi"] = "fi";
    SmsTemplateLocale["Fo"] = "fo";
    SmsTemplateLocale["Fr"] = "fr";
    SmsTemplateLocale["Frbe"] = "fr-be";
    SmsTemplateLocale["Frca"] = "fr-ca";
    SmsTemplateLocale["Frch"] = "fr-ch";
    SmsTemplateLocale["Frlu"] = "fr-lu";
    SmsTemplateLocale["Ga"] = "ga";
    SmsTemplateLocale["Gd"] = "gd";
    SmsTemplateLocale["He"] = "he";
    SmsTemplateLocale["Hi"] = "hi";
    SmsTemplateLocale["Hr"] = "hr";
    SmsTemplateLocale["Hu"] = "hu";
    SmsTemplateLocale["Id"] = "id";
    SmsTemplateLocale["Is"] = "is";
    SmsTemplateLocale["It"] = "it";
    SmsTemplateLocale["Itch"] = "it-ch";
    SmsTemplateLocale["Ja"] = "ja";
    SmsTemplateLocale["Ji"] = "ji";
    SmsTemplateLocale["Ko"] = "ko";
    SmsTemplateLocale["Ku"] = "ku";
    SmsTemplateLocale["Lt"] = "lt";
    SmsTemplateLocale["Lv"] = "lv";
    SmsTemplateLocale["Mk"] = "mk";
    SmsTemplateLocale["Ml"] = "ml";
    SmsTemplateLocale["Ms"] = "ms";
    SmsTemplateLocale["Mt"] = "mt";
    SmsTemplateLocale["Nb"] = "nb";
    SmsTemplateLocale["Ne"] = "ne";
    SmsTemplateLocale["Nl"] = "nl";
    SmsTemplateLocale["Nlbe"] = "nl-be";
    SmsTemplateLocale["Nn"] = "nn";
    SmsTemplateLocale["No"] = "no";
    SmsTemplateLocale["Pa"] = "pa";
    SmsTemplateLocale["Pl"] = "pl";
    SmsTemplateLocale["Pt"] = "pt";
    SmsTemplateLocale["Ptbr"] = "pt-br";
    SmsTemplateLocale["Rm"] = "rm";
    SmsTemplateLocale["Ro"] = "ro";
    SmsTemplateLocale["Romd"] = "ro-md";
    SmsTemplateLocale["Ru"] = "ru";
    SmsTemplateLocale["Rumd"] = "ru-md";
    SmsTemplateLocale["Sb"] = "sb";
    SmsTemplateLocale["Sk"] = "sk";
    SmsTemplateLocale["Sl"] = "sl";
    SmsTemplateLocale["Sq"] = "sq";
    SmsTemplateLocale["Sr"] = "sr";
    SmsTemplateLocale["Sv"] = "sv";
    SmsTemplateLocale["Svfi"] = "sv-fi";
    SmsTemplateLocale["Th"] = "th";
    SmsTemplateLocale["Tn"] = "tn";
    SmsTemplateLocale["Tr"] = "tr";
    SmsTemplateLocale["Ts"] = "ts";
    SmsTemplateLocale["Ua"] = "ua";
    SmsTemplateLocale["Ur"] = "ur";
    SmsTemplateLocale["Ve"] = "ve";
    SmsTemplateLocale["Vi"] = "vi";
    SmsTemplateLocale["Xh"] = "xh";
    SmsTemplateLocale["Zhcn"] = "zh-cn";
    SmsTemplateLocale["Zhhk"] = "zh-hk";
    SmsTemplateLocale["Zhsg"] = "zh-sg";
    SmsTemplateLocale["Zhtw"] = "zh-tw";
    SmsTemplateLocale["Zu"] = "zu";
})(exports.SmsTemplateLocale || (exports.SmsTemplateLocale = {}));

exports.ResourceType = void 0;
(function (ResourceType) {
    ResourceType["Api"] = "api";
    ResourceType["Function"] = "function";
})(exports.ResourceType || (exports.ResourceType = {}));

exports.Compression = void 0;
(function (Compression) {
    Compression["None"] = "none";
    Compression["Gzip"] = "gzip";
    Compression["Zstd"] = "zstd";
})(exports.Compression || (exports.Compression = {}));

exports.ImageGravity = void 0;
(function (ImageGravity) {
    ImageGravity["Center"] = "center";
    ImageGravity["Topleft"] = "top-left";
    ImageGravity["Top"] = "top";
    ImageGravity["Topright"] = "top-right";
    ImageGravity["Left"] = "left";
    ImageGravity["Right"] = "right";
    ImageGravity["Bottomleft"] = "bottom-left";
    ImageGravity["Bottom"] = "bottom";
    ImageGravity["Bottomright"] = "bottom-right";
})(exports.ImageGravity || (exports.ImageGravity = {}));

exports.ImageFormat = void 0;
(function (ImageFormat) {
    ImageFormat["Jpg"] = "jpg";
    ImageFormat["Jpeg"] = "jpeg";
    ImageFormat["Gif"] = "gif";
    ImageFormat["Png"] = "png";
    ImageFormat["Webp"] = "webp";
})(exports.ImageFormat || (exports.ImageFormat = {}));

exports.StorageUsageRange = void 0;
(function (StorageUsageRange) {
    StorageUsageRange["TwentyFourHours"] = "24h";
    StorageUsageRange["ThirtyDays"] = "30d";
    StorageUsageRange["NinetyDays"] = "90d";
})(exports.StorageUsageRange || (exports.StorageUsageRange = {}));

exports.PasswordHash = void 0;
(function (PasswordHash) {
    PasswordHash["Sha1"] = "sha1";
    PasswordHash["Sha224"] = "sha224";
    PasswordHash["Sha256"] = "sha256";
    PasswordHash["Sha384"] = "sha384";
    PasswordHash["Sha512224"] = "sha512/224";
    PasswordHash["Sha512256"] = "sha512/256";
    PasswordHash["Sha512"] = "sha512";
    PasswordHash["Sha3224"] = "sha3-224";
    PasswordHash["Sha3256"] = "sha3-256";
    PasswordHash["Sha3384"] = "sha3-384";
    PasswordHash["Sha3512"] = "sha3-512";
})(exports.PasswordHash || (exports.PasswordHash = {}));

exports.UserUsageRange = void 0;
(function (UserUsageRange) {
    UserUsageRange["TwentyFourHours"] = "24h";
    UserUsageRange["ThirtyDays"] = "30d";
    UserUsageRange["NinetyDays"] = "90d";
})(exports.UserUsageRange || (exports.UserUsageRange = {}));

exports.MessagingProviderType = void 0;
(function (MessagingProviderType) {
    MessagingProviderType["Email"] = "email";
    MessagingProviderType["Sms"] = "sms";
    MessagingProviderType["Push"] = "push";
})(exports.MessagingProviderType || (exports.MessagingProviderType = {}));

exports.Account = Account;
exports.AppwriteException = AppwriteException;
exports.Assistant = Assistant;
exports.Avatars = Avatars;
exports.Client = Client;
exports.Console = Console;
exports.Databases = Databases;
exports.Functions = Functions;
exports.Graphql = Graphql;
exports.Health = Health;
exports.ID = ID;
exports.Locale = Locale;
exports.Messaging = Messaging;
exports.Migrations = Migrations;
exports.Permission = Permission;
exports.Project = Project;
exports.Projects = Projects;
exports.Proxy = Proxy;
exports.Query = Query;
exports.Role = Role;
exports.Storage = Storage;
exports.Teams = Teams;
exports.Users = Users;
exports.Vcs = Vcs;
//# sourceMappingURL=sdk.js.map
