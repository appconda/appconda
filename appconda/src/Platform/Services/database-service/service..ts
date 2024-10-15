import { RealmoceanClientService } from "../../RealmoceanService";
import { Query } from "../../modules/sdk/query";
const databaseService = require('../modules/sdk/services/databases');

export default class DatabaseService extends RealmoceanClientService {

    public get uid(): string {
        return 'com.realmocean.service.database';
    }

    get displayName(): string {
        return 'Database Service'
    }

    _databaseService: any;


    initClient() {
        this._databaseService = new databaseService(this.client);
    }

    get Query() {
        return Query;
    }

    async list(projectId: string) {
        return await this._databaseService.list(projectId);
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
    async create(projectId: string, databaseId: string, name: string, enabled: boolean) {
        return await this._databaseService.create(projectId, databaseId, name, enabled);
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
        return await this._databaseService.get(projectId, databaseId);
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
        return await this._databaseService.update(projectId, databaseId, name, enabled);
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
        return await this._databaseService.delete(projectId, databaseId);
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
        return await this._databaseService.listCollections(projectId, databaseId, queries, search);
    }

    /**
     * Create collection
     *
     * Create a new Collection. Before using this route, you should create a new
     * database resource using either a [server
     * integration](https://appconda.io/docs/server/databases#databasesCreateCollection)
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
    async createCollection(projectId: string, databaseId: string, collectionId: string, name: string, permissions?: string[], documentSecurity?: boolean, enabled?: boolean) {
        return await this._databaseService.createCollection(projectId, databaseId, collectionId, name, permissions, documentSecurity, enabled);
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
        return await this._databaseService.getCollection(projectId, databaseId, collectionId);
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
        return await this._databaseService.updateCollection(projectId, databaseId, collectionId, name, permissions, documentSecurity, enabled);
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
        return await this._databaseService.deleteCollection(projectId, databaseId, collectionId);
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
        return await this._databaseService.listAttributes(projectId, databaseId, collectionId, queries);
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
    async createBooleanAttribute(projectId: string, databaseId: string, collectionId: string, key: string, required: boolean, xdefault: boolean, array?: boolean) {
        return await this._databaseService.createBooleanAttribute(projectId, databaseId, collectionId, key, required, xdefault, array);
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
        return await this._databaseService.updateBooleanAttribute(projectId, databaseId, collectionId, key, required, xdefault);
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
    async createDatetimeAttribute(projectId: string, databaseId: string, collectionId: string, key: string, required: boolean, xdefault?: any, array?: boolean) {
        return await this._databaseService.createDatetimeAttribute(projectId, databaseId, collectionId, key, required, xdefault, array);
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
    async updateDatetimeAttribute(projectId: string, databaseId: string, collectionId: string, key: string, required: boolean, xdefault?: boolean) {
        return await this._databaseService.updateDatetimeAttribute(projectId, databaseId, collectionId, key, required, xdefault);
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
        return await this._databaseService.createEmailAttribute(projectId, databaseId, collectionId, key, required, xdefault, array);
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
        return await this._databaseService.updateEmailAttribute(projectId, databaseId, collectionId, key, required, xdefault);
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
        return this._databaseService.createEnumAttribute(projectId, databaseId, collectionId, key, elements, required, xdefault, array);
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
        return this._databaseService.updateEnumAttribute(projectId, databaseId, collectionId, key, elements, required, xdefault);
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
        return this._databaseService.createFloatAttribute(projectId, databaseId, collectionId, key, required, min, max, xdefault, array);
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
        return this._databaseService.updateFloatAttribute(projectId, databaseId, collectionId, key, required, min, max, xdefault);
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
    async createIntegerAttribute(projectId: string, databaseId: string, collectionId: string, key: string, required: boolean, min?: number, max?: number, xdefault?: number, array?: boolean) {
        return this._databaseService.createIntegerAttribute(projectId, databaseId, collectionId, key, required, min, max, xdefault, array);
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
        return this._databaseService.updateIntegerAttribute(projectId, databaseId, collectionId, key, required, min, max, xdefault);
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
        return this._databaseService.createIpAttribute(projectId, databaseId, collectionId, key, required, xdefault, array);
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
        return this._databaseService.updateIpAttribute(projectId, databaseId, collectionId, key, required, xdefault);
    }

    /**
     * Create relationship attribute
     *
     * Create relationship attribute. [Learn more about relationship
     * attributes](https://appconda.io/docs/databases-relationships#relationship-attributes).
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
        return this._databaseService.createRelationshipAttribute(projectId, databaseId, collectionId, relatedCollectionId, type, twoWay, key, twoWayKey, onDelete);
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
    async createStringAttribute(projectId: string, databaseId: string, collectionId: string, key: string, size: string, required: boolean, xdefault: string, array: boolean, encrypt?: any) {
        return this._databaseService.createStringAttribute(projectId, databaseId, collectionId, key, size, required, xdefault, array, encrypt);
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
        return this._databaseService.updateStringAttribute(projectId, databaseId, collectionId, key, required, xdefault);
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
        return this._databaseService.createUrlAttribute(projectId, databaseId, collectionId, key, required, xdefault, array);
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
        return this._databaseService.updateUrlAttribute(projectId, databaseId, collectionId, key, required, xdefault);
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
        return this._databaseService.getAttribute(projectId, databaseId, collectionId, key);
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
        return this._databaseService.deleteAttribute(projectId, databaseId, collectionId, key);
    }

    /**
     * Update relationship attribute
     *
     * Update relationship attribute. [Learn more about relationship
     * attributes](https://appconda.io/docs/databases-relationships#relationship-attributes).
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
        return this._databaseService.pdateRelationshipAttribute(projectId, databaseId, collectionId, key, onDelete);
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
    async listDocuments(projectId, databaseId, collectionId, queries) {
        return this._databaseService.listDocuments(projectId, databaseId, collectionId, queries);
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
    async createDocument(projectId: string, databaseId: string, collectionId: string, documentId: string, data: any, permissions?: any) {
        return this._databaseService.createDocument(projectId, databaseId, collectionId, documentId, data, permissions);
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
        return this._databaseService.getDocument(projectId, databaseId, collectionId, documentId, queries);
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
    async updateDocument(projectId, databaseId, collectionId, documentId, data, permissions?) {
        return this._databaseService.updateDocument(projectId, databaseId, collectionId, documentId, data, permissions);
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
        return this._databaseService.deleteDocument(projectId, databaseId, collectionId, documentId);
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
        return this._databaseService.listIndexes(projectId, databaseId, collectionId, queries);
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
        return this._databaseService.createIndex(projectId, databaseId, collectionId, key, type, attributes, orders);
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
        return this._databaseService.getIndex(projectId, databaseId, collectionId, key);
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
        return this._databaseService.deleteIndex(projectId, databaseId, collectionId, key);
    }

}

