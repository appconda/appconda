const Service = require('../service.js');
const RealmoceanException = require('../exception.js');
const InputFile = require('../inputFile.js');
const client = require('../client.js');
const Stream = require('stream');
const { promisify } = require('util');
const fs = require('fs');

class Databases extends Service {

     constructor(client)
     {
        super(client);
     }


    /**
     * List databases
     *
     * Get a list of all databases from the current realmocean project. You can use
     * the search parameter to filter your results.
     *
     * @param {string[]} queries
     * @param {string} search
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async list(projectId, queries, search) {
        this.client.setProject(projectId);
        
        const apiPath = '/databases';
        let payload = {};

        if (typeof queries !== 'undefined') {
            payload['queries'] = queries;
        }

        if (typeof search !== 'undefined') {
            payload['search'] = search;
        }

        return await this.client.call('get', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Create database
     *
     * Create a new Database.
     * 
     *
     * @param {string} databaseId
     * @param {string} name
     * @param {boolean} enabled
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async create(projectId, databaseId, name, enabled) {

        this.client.setProject(projectId);

        const apiPath = '/databases';
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof name === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "name"');
        }


        if (typeof databaseId !== 'undefined') {
            payload['databaseId'] = databaseId;
        }

        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }

        if (typeof enabled !== 'undefined') {
            payload['enabled'] = enabled;
        }

        return await this.client.call('post', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Get database
     *
     * Get a database by its unique ID. This endpoint response returns a JSON
     * object with the database metadata.
     *
     * @param {string} databaseId
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async get(projectId, databaseId) {
        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}'.replace('{databaseId}', databaseId);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }


        return await this.client.call('get', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Update database
     *
     * Update a database by its unique ID.
     *
     * @param {string} databaseId
     * @param {string} name
     * @param {boolean} enabled
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async update(projectId, databaseId, name, enabled) {

        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}'.replace('{databaseId}', databaseId);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof name === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "name"');
        }


        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }

        if (typeof enabled !== 'undefined') {
            payload['enabled'] = enabled;
        }

        return await this.client.call('put', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Delete database
     *
     * Delete a database by its unique ID. Only API keys with with databases.write
     * scope can delete a database.
     *
     * @param {string} databaseId
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async delete(projectId, databaseId) {

        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}'.replace('{databaseId}', databaseId);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }


        return await this.client.call('delete', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * List collections
     *
     * Get a list of all collections that belong to the provided databaseId. You
     * can use the search parameter to filter your results.
     *
     * @param {string} databaseId
     * @param {string[]} queries
     * @param {string} search
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async listCollections(projectId, databaseId, queries, search) {

        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections'.replace('{databaseId}', databaseId);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }


        if (typeof queries !== 'undefined') {
            payload['queries'] = queries;
        }

        if (typeof search !== 'undefined') {
            payload['search'] = search;
        }

        return await this.client.call('get', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Create collection
     *
     * Create a new Collection. Before using this route, you should create a new
     * database resource using either a [server
     * integration](https://realmocean.io/docs/server/databases#databasesCreateCollection)
     * API or directly from your database console.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} name
     * @param {string[]} permissions
     * @param {boolean} documentSecurity
     * @param {boolean} enabled
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async createCollection(projectId, databaseId, collectionId, name, permissions, documentSecurity, enabled) {
       
        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections'.replace('{databaseId}', databaseId);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }

        if (typeof name === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "name"');
        }


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

        return await this.client.call('post', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Get collection
     *
     * Get a collection by its unique ID. This endpoint response returns a JSON
     * object with the collection metadata.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async getCollection(projectId, databaseId, collectionId) {

        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }


        return await this.client.call('get', apiPath, {
            'content-type': 'application/json',
        }, payload);
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
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async updateCollection(projectId, databaseId, collectionId, name, permissions, documentSecurity, enabled) {
        
        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }

        if (typeof name === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "name"');
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

        return await this.client.call('put', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Delete collection
     *
     * Delete a collection by its unique ID. Only users with write permissions
     * have access to delete this resource.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async deleteCollection(projectId, databaseId, collectionId) {

        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }


        return await this.client.call('delete', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * List attributes
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string[]} queries
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async listAttributes(projectId, databaseId, collectionId, queries) {

        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }


        if (typeof queries !== 'undefined') {
            payload['queries'] = queries;
        }

        return await this.client.call('get', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Create boolean attribute
     *
     * Create a boolean attribute.
     * 
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {boolean} required
     * @param {boolean} xdefault
     * @param {boolean} array
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async createBooleanAttribute(projectId, databaseId, collectionId, key, required, xdefault, array) {
        
        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/boolean'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }

        if (typeof key === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "key"');
        }

        if (typeof required === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "required"');
        }


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

        return await this.client.call('post', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Update boolean attribute
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {boolean} required
     * @param {boolean} xdefault
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async updateBooleanAttribute(projectId, databaseId, collectionId, key, required, xdefault) {
        
        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/boolean/{key}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{key}', key);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }

        if (typeof key === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "key"');
        }

        if (typeof required === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "required"');
        }

        if (typeof xdefault === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "xdefault"');
        }


        if (typeof required !== 'undefined') {
            payload['required'] = required;
        }

        if (typeof xdefault !== 'undefined') {
            payload['default'] = xdefault;
        }

        return await this.client.call('patch', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Create datetime attribute
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {boolean} required
     * @param {string} xdefault
     * @param {boolean} array
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async createDatetimeAttribute(projectId, databaseId, collectionId, key, required, xdefault, array) {
       
        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/datetime'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }

        if (typeof key === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "key"');
        }

        if (typeof required === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "required"');
        }


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

        return await this.client.call('post', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Update dateTime attribute
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {boolean} required
     * @param {string} xdefault
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async updateDatetimeAttribute(projectId, databaseId, collectionId, key, required, xdefault) {

        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/datetime/{key}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{key}', key);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }

        if (typeof key === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "key"');
        }

        if (typeof required === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "required"');
        }

        if (typeof xdefault === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "xdefault"');
        }


        if (typeof required !== 'undefined') {
            payload['required'] = required;
        }

        if (typeof xdefault !== 'undefined') {
            payload['default'] = xdefault;
        }

        return await this.client.call('patch', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Create email attribute
     *
     * Create an email attribute.
     * 
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {boolean} required
     * @param {string} xdefault
     * @param {boolean} array
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async createEmailAttribute(projectId, databaseId, collectionId, key, required, xdefault, array) {
       
        this.client.setProject(projectId);
       
        const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/email'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }

        if (typeof key === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "key"');
        }

        if (typeof required === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "required"');
        }


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

        return await this.client.call('post', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Update email attribute
     *
     * Update an email attribute. Changing the `default` value will not update
     * already existing documents.
     * 
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {boolean} required
     * @param {string} xdefault
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async updateEmailAttribute(projectId, databaseId, collectionId, key, required, xdefault) {
        
        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/email/{key}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{key}', key);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }

        if (typeof key === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "key"');
        }

        if (typeof required === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "required"');
        }

        if (typeof xdefault === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "xdefault"');
        }


        if (typeof required !== 'undefined') {
            payload['required'] = required;
        }

        if (typeof xdefault !== 'undefined') {
            payload['default'] = xdefault;
        }

        return await this.client.call('patch', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Create enum attribute
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {string[]} elements
     * @param {boolean} required
     * @param {string} xdefault
     * @param {boolean} array
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async createEnumAttribute(projectId, databaseId, collectionId, key, elements, required, xdefault, array) {

        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/enum'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }

        if (typeof key === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "key"');
        }

        if (typeof elements === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "elements"');
        }

        if (typeof required === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "required"');
        }


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

        return await this.client.call('post', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Update enum attribute
     *
     * Update an enum attribute. Changing the `default` value will not update
     * already existing documents.
     * 
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {string[]} elements
     * @param {boolean} required
     * @param {string} xdefault
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async updateEnumAttribute(projectId, databaseId, collectionId, key, elements, required, xdefault) {

        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/enum/{key}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{key}', key);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }

        if (typeof key === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "key"');
        }

        if (typeof elements === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "elements"');
        }

        if (typeof required === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "required"');
        }

        if (typeof xdefault === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "xdefault"');
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

        return await this.client.call('patch', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Create float attribute
     *
     * Create a float attribute. Optionally, minimum and maximum values can be
     * provided.
     * 
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {boolean} required
     * @param {number} min
     * @param {number} max
     * @param {number} xdefault
     * @param {boolean} array
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async createFloatAttribute(projectId, databaseId, collectionId, key, required, min, max, xdefault, array) {

        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/float'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }

        if (typeof key === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "key"');
        }

        if (typeof required === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "required"');
        }


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

        return await this.client.call('post', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Update float attribute
     *
     * Update a float attribute. Changing the `default` value will not update
     * already existing documents.
     * 
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {boolean} required
     * @param {number} min
     * @param {number} max
     * @param {number} xdefault
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async updateFloatAttribute(projectId, databaseId, collectionId, key, required, min, max, xdefault) {

        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/float/{key}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{key}', key);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }

        if (typeof key === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "key"');
        }

        if (typeof required === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "required"');
        }

        if (typeof min === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "min"');
        }

        if (typeof max === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "max"');
        }

        if (typeof xdefault === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "xdefault"');
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

        return await this.client.call('patch', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Create integer attribute
     *
     * Create an integer attribute. Optionally, minimum and maximum values can be
     * provided.
     * 
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {boolean} required
     * @param {number} min
     * @param {number} max
     * @param {number} xdefault
     * @param {boolean} array
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async createIntegerAttribute(projectId, databaseId, collectionId, key, required, min, max, xdefault, array) {

        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/integer'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }

        if (typeof key === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "key"');
        }

        if (typeof required === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "required"');
        }


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

        return await this.client.call('post', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Update integer attribute
     *
     * Update an integer attribute. Changing the `default` value will not update
     * already existing documents.
     * 
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {boolean} required
     * @param {number} min
     * @param {number} max
     * @param {number} xdefault
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async updateIntegerAttribute(projectId, databaseId, collectionId, key, required, min, max, xdefault) {

        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/integer/{key}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{key}', key);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }

        if (typeof key === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "key"');
        }

        if (typeof required === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "required"');
        }

        if (typeof min === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "min"');
        }

        if (typeof max === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "max"');
        }

        if (typeof xdefault === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "xdefault"');
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

        return await this.client.call('patch', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Create IP address attribute
     *
     * Create IP address attribute.
     * 
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {boolean} required
     * @param {string} xdefault
     * @param {boolean} array
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async createIpAttribute(projectId, databaseId, collectionId, key, required, xdefault, array) {

        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/ip'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }

        if (typeof key === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "key"');
        }

        if (typeof required === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "required"');
        }


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

        return await this.client.call('post', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Update IP address attribute
     *
     * Update an ip attribute. Changing the `default` value will not update
     * already existing documents.
     * 
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {boolean} required
     * @param {string} xdefault
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async updateIpAttribute(projectId, databaseId, collectionId, key, required, xdefault) {

        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/ip/{key}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{key}', key);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }

        if (typeof key === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "key"');
        }

        if (typeof required === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "required"');
        }

        if (typeof xdefault === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "xdefault"');
        }


        if (typeof required !== 'undefined') {
            payload['required'] = required;
        }

        if (typeof xdefault !== 'undefined') {
            payload['default'] = xdefault;
        }

        return await this.client.call('patch', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Create relationship attribute
     *
     * Create relationship attribute. [Learn more about relationship
     * attributes](https://realmocean.io/docs/databases-relationships#relationship-attributes).
     * 
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} relatedCollectionId
     * @param {string} type
     * @param {boolean} twoWay
     * @param {string} key
     * @param {string} twoWayKey
     * @param {string} onDelete
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async createRelationshipAttribute(projectId, databaseId, collectionId, relatedCollectionId, type, twoWay, key, twoWayKey, onDelete) {

        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/relationship'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }

        if (typeof relatedCollectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "relatedCollectionId"');
        }

        if (typeof type === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "type"');
        }


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

        return await this.client.call('post', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Create string attribute
     *
     * Create a string attribute.
     * 
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {number} size
     * @param {boolean} required
     * @param {string} xdefault
     * @param {boolean} array
     * @param {boolean} encrypt
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async createStringAttribute(projectId, databaseId, collectionId, key, size, required, xdefault, array, encrypt) {

        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/string'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }

        if (typeof key === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "key"');
        }

        if (typeof size === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "size"');
        }

        if (typeof required === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "required"');
        }


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

        return await this.client.call('post', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Update string attribute
     *
     * Update a string attribute. Changing the `default` value will not update
     * already existing documents.
     * 
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {boolean} required
     * @param {string} xdefault
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async updateStringAttribute(projectId, databaseId, collectionId, key, required, xdefault) {

        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/string/{key}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{key}', key);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }

        if (typeof key === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "key"');
        }

        if (typeof required === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "required"');
        }

        if (typeof xdefault === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "xdefault"');
        }


        if (typeof required !== 'undefined') {
            payload['required'] = required;
        }

        if (typeof xdefault !== 'undefined') {
            payload['default'] = xdefault;
        }

        return await this.client.call('patch', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Create URL attribute
     *
     * Create a URL attribute.
     * 
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {boolean} required
     * @param {string} xdefault
     * @param {boolean} array
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async createUrlAttribute(projectId, databaseId, collectionId, key, required, xdefault, array) {

        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/url'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }

        if (typeof key === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "key"');
        }

        if (typeof required === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "required"');
        }


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

        return await this.client.call('post', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Update URL attribute
     *
     * Update an url attribute. Changing the `default` value will not update
     * already existing documents.
     * 
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {boolean} required
     * @param {string} xdefault
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async updateUrlAttribute(projectId, databaseId, collectionId, key, required, xdefault) {

        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/url/{key}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{key}', key);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }

        if (typeof key === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "key"');
        }

        if (typeof required === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "required"');
        }

        if (typeof xdefault === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "xdefault"');
        }


        if (typeof required !== 'undefined') {
            payload['required'] = required;
        }

        if (typeof xdefault !== 'undefined') {
            payload['default'] = xdefault;
        }

        return await this.client.call('patch', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Get attribute
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async getAttribute(projectId, databaseId, collectionId, key) {

        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/{key}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{key}', key);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }

        if (typeof key === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "key"');
        }


        return await this.client.call('get', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Delete attribute
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async deleteAttribute(projectId, databaseId, collectionId, key) {

        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/{key}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{key}', key);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }

        if (typeof key === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "key"');
        }


        return await this.client.call('delete', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Update relationship attribute
     *
     * Update relationship attribute. [Learn more about relationship
     * attributes](https://realmocean.io/docs/databases-relationships#relationship-attributes).
     * 
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {string} onDelete
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async updateRelationshipAttribute(projectId, databaseId, collectionId, key, onDelete) {

        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}/attributes/{key}/relationship'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{key}', key);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }

        if (typeof key === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "key"');
        }


        if (typeof onDelete !== 'undefined') {
            payload['onDelete'] = onDelete;
        }

        return await this.client.call('patch', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * List documents
     *
     * Get a list of all the user's documents in a given collection. You can use
     * the query params to filter your results.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string[]} queries
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async listDocuments(projectId,databaseId, collectionId, queries) {

        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}/documents'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }


        if (typeof queries !== 'undefined') {
            payload['queries'] = queries;
        }

        return await this.client.call('get', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Create document
     *
     * Create a new Document. Before using this route, you should create a new
     * collection resource using either a [server
     * integration](https://realmocean.io/docs/server/databases#databasesCreateCollection)
     * API or directly from your database console.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} documentId
     * @param {object} data
     * @param {string[]} permissions
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async createDocument(projectId, databaseId, collectionId, documentId, data, permissions) {

        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}/documents'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }

        if (typeof documentId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "documentId"');
        }

        if (typeof data === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "data"');
        }


        if (typeof documentId !== 'undefined') {
            payload['documentId'] = documentId;
        }

        if (typeof data !== 'undefined') {
            payload['data'] = data;
        }

        if (typeof permissions !== 'undefined') {
            payload['permissions'] = permissions;
        }

        return await this.client.call('post', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Get document
     *
     * Get a document by its unique ID. This endpoint response returns a JSON
     * object with the document data.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} documentId
     * @param {string[]} queries
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async getDocument(projectId, databaseId, collectionId, documentId, queries) {

        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}/documents/{documentId}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{documentId}', documentId);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }

        if (typeof documentId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "documentId"');
        }


        if (typeof queries !== 'undefined') {
            payload['queries'] = queries;
        }

        return await this.client.call('get', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Update document
     *
     * Update a document by its unique ID. Using the patch method you can pass
     * only specific fields that will get updated.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} documentId
     * @param {object} data
     * @param {string[]} permissions
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async updateDocument(projectId, databaseId, collectionId, documentId, data, permissions) {

        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}/documents/{documentId}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{documentId}', documentId);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }

        if (typeof documentId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "documentId"');
        }


        if (typeof data !== 'undefined') {
            payload['data'] = data;
        }

        if (typeof permissions !== 'undefined') {
            payload['permissions'] = permissions;
        }

        return await this.client.call('patch', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Delete document
     *
     * Delete a document by its unique ID.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} documentId
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async deleteDocument(projectId, databaseId, collectionId, documentId) {

        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}/documents/{documentId}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{documentId}', documentId);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }

        if (typeof documentId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "documentId"');
        }


        return await this.client.call('delete', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * List indexes
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string[]} queries
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async listIndexes(projectId, databaseId, collectionId, queries) {

        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}/indexes'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }


        if (typeof queries !== 'undefined') {
            payload['queries'] = queries;
        }

        return await this.client.call('get', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Create index
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @param {string} type
     * @param {string[]} attributes
     * @param {string[]} orders
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async createIndex(projectId, databaseId, collectionId, key, type, attributes, orders) {

        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}/indexes'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }

        if (typeof key === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "key"');
        }

        if (typeof type === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "type"');
        }

        if (typeof attributes === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "attributes"');
        }


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

        return await this.client.call('post', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Get index
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async getIndex(projectId, databaseId, collectionId, key) {

        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}/indexes/{key}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{key}', key);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }

        if (typeof key === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "key"');
        }


        return await this.client.call('get', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }

    /**
     * Delete index
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} key
     * @throws {RealmoceanException}
     * @returns {Promise}
     */
    async deleteIndex(projectId, databaseId, collectionId, key) {

        this.client.setProject(projectId);

        const apiPath = '/databases/{databaseId}/collections/{collectionId}/indexes/{key}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{key}', key);
        let payload = {};
        if (typeof databaseId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "databaseId"');
        }

        if (typeof collectionId === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "collectionId"');
        }

        if (typeof key === 'undefined') {
            throw new RealmoceanException('Missing required parameter: "key"');
        }


        return await this.client.call('delete', apiPath, {
            'content-type': 'application/json',
        }, payload);
    }
}

module.exports = Databases;
