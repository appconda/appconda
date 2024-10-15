import { Console } from "../../../Tuval/CLI";
import { Document } from "../../../Tuval/Core";
import { Database, Query } from "../../../Tuval/Database";
import { Log } from "../../../Tuval/Logger";
import { Action } from "../../../Tuval/Platform/Action";
import { Message } from "../../../Tuval/Queue";
import { Event } from "../../Event/Event";
import { Realtime } from "../../Messaging/Adapters/Realtime";


export class Databases extends Action {
    public static getName(): string {
        return 'databases';
    }

    constructor() {
        super();
        this.desc('Databases worker')
            .inject('message')
            .inject('dbForConsole')
            .inject('dbForProject')
            .inject('log')
            .callback((message: Message, dbForConsole: Database, dbForProject: Database, log: Log) => this.action(message, dbForConsole, dbForProject, log));
    }

    public async action(message: Message, dbForConsole: Database, dbForProject: Database, log: Log): Promise<void> {
        const payload = message.getPayload() ?? {};

        if (Object.keys(payload).length === 0) {
            throw new Error('Missing payload');
        }

        const type = payload['type'];
        const project = new Document(payload['project']);
        const collection = new Document(payload['collection'] ?? []);
        const document = new Document(payload['document'] ?? []);
        const database = new Document(payload['database'] ?? []);

        log.addTag('projectId', project.getId());
        log.addTag('type', type);

        if (database.isEmpty()) {
            throw new Error('Missing database');
        }

        log.addTag('databaseId', database.getId());

        switch (String(type)) {
            case 'DATABASE_TYPE_DELETE_DATABASE':
                await this.deleteDatabase(database, project, dbForProject);
                break;
            case 'DATABASE_TYPE_DELETE_COLLECTION':
                await this.deleteCollection(database, collection, project, dbForProject);
                break;
            case 'DATABASE_TYPE_CREATE_ATTRIBUTE':
                await this.createAttribute(database, collection, document, project, dbForConsole, dbForProject);
                break;
            case 'DATABASE_TYPE_DELETE_ATTRIBUTE':
                await this.deleteAttribute(database, collection, document, project, dbForConsole, dbForProject);
                break;
            case 'DATABASE_TYPE_CREATE_INDEX':
                await this.createIndex(database, collection, document, project, dbForConsole, dbForProject);
                break;
            case 'DATABASE_TYPE_DELETE_INDEX':
                await this.deleteIndex(database, collection, document, project, dbForConsole, dbForProject);
                break;
            default:
                throw new Error('No database operation for type: ' + String(type));
        }
    }

    private async createAttribute(database: Document, collection: Document, attribute: Document, project: Document, dbForConsole: Database, dbForProject: Database): Promise<void> {
        if (collection.isEmpty()) {
            throw new Error('Missing collection');
        }
        if (attribute.isEmpty()) {
            throw new Error('Missing attribute');
        }

        const projectId = project.getId();

        const events = Event.generateEvents('databases.[databaseId].collections.[collectionId].attributes.[attributeId].update', {
            'databaseId': database.getId(),
            'collectionId': collection.getId(),
            'attributeId': attribute.getId()
        });

        attribute = await dbForProject.getDocument('attributes', attribute.getId());

        if (attribute.isEmpty()) {
            return;
        }

        const collectionId = collection.getId();
        const key = attribute.getAttribute('key', '');
        const type = attribute.getAttribute('type', '');
        const size = attribute.getAttribute('size', 0);
        const required = attribute.getAttribute('required', false);
        const defaultValue = attribute.getAttribute('default', null);
        const signed = attribute.getAttribute('signed', true);
        const array = attribute.getAttribute('array', false);
        const format = attribute.getAttribute('format', '');
        const formatOptions = attribute.getAttribute('formatOptions', []);
        const filters = attribute.getAttribute('filters', []);
        const options = attribute.getAttribute('options', []);
        const projectDoc = await dbForConsole.getDocument('projects', projectId);
        let relatedCollection;
        try {
            switch (type) {
                case Database.VAR_RELATIONSHIP:
                    relatedCollection = await dbForProject.getDocument('database_' + database.getInternalId(), options['relatedCollection']);
                    if (relatedCollection.isEmpty()) {
                        throw new Error('Collection not found');
                    }

                    if (
                        !(await dbForProject.createRelationship(
                            'database_' + database.getInternalId() + '_collection_' + collection.getInternalId(),
                            'database_' + database.getInternalId() + '_collection_' + relatedCollection.getInternalId(),
                            options['relationType'],
                            options['twoWay'],
                            key,
                            options['twoWayKey'],
                            options['onDelete']
                        ))
                    ) {
                        throw new Error('Failed to create Attribute');
                    }

                    if (options['twoWay']) {
                        const relatedAttribute = await dbForProject.getDocument('attributes', database.getInternalId() + '_' + relatedCollection.getInternalId() + '_' + options['twoWayKey']);
                        await dbForProject.updateDocument('attributes', relatedAttribute.getId(), relatedAttribute.setAttribute('status', 'available'));
                    }
                    break;
                default:
                    if (!(await dbForProject.createAttribute('database_' + database.getInternalId() + '_collection_' + collection.getInternalId(), key, type, size, required, defaultValue, signed, array, format, formatOptions, filters))) {
                        throw new Error('Failed to create Attribute');
                    }
            }

            await dbForProject.updateDocument('attributes', attribute.getId(), attribute.setAttribute('status', 'available'));
        } catch (error) {
            Console.error((error as Error).message);

            if (error instanceof Error) {
                attribute.setAttribute('error', error.message);
            }

            await dbForProject.updateDocument('attributes', attribute.getId(), attribute.setAttribute('status', 'failed'));
        } finally {
            this.trigger(database, collection, attribute, projectDoc, projectId, events);
        }

        if (type === Database.VAR_RELATIONSHIP && options['twoWay']) {
            await dbForProject.purgeCachedDocument('database_' + database.getInternalId(), relatedCollection.getId());
        }

        await dbForProject.purgeCachedDocument('database_' + database.getInternalId(), collectionId);
    }

    private async deleteAttribute(database: Document, collection: Document, attribute: Document, project: Document, dbForConsole: Database, dbForProject: Database): Promise<void> {
        if (collection.isEmpty()) {
            throw new Error('Missing collection');
        }
        if (attribute.isEmpty()) {
            throw new Error('Missing attribute');
        }

        const projectId = project.getId();

        const events = Event.generateEvents('databases.[databaseId].collections.[collectionId].attributes.[attributeId].delete', {
            'databaseId': database.getId(),
            'collectionId': collection.getId(),
            'attributeId': attribute.getId()
        });
        const collectionId = collection.getId();
        const key = attribute.getAttribute('key', '');
        const status = attribute.getAttribute('status', '');
        const type = attribute.getAttribute('type', '');
        const projectDoc = await dbForConsole.getDocument('projects', projectId);
        const options = attribute.getAttribute('options', []);
        let relatedAttribute = new Document();
        let relatedCollection = new Document();

        try {
            if (status !== 'failed') {
                if (type === Database.VAR_RELATIONSHIP) {
                    if (options['twoWay']) {
                        relatedCollection = await dbForProject.getDocument('database_' + database.getInternalId(), options['relatedCollection']);
                        if (relatedCollection.isEmpty()) {
                            throw new Error('Collection not found');
                        }
                        relatedAttribute = await dbForProject.getDocument('attributes', database.getInternalId() + '_' + relatedCollection.getInternalId() + '_' + options['twoWayKey']);
                    }

                    if (!(await dbForProject.deleteRelationship('database_' + database.getInternalId() + '_collection_' + collection.getInternalId(), key))) {
                        await dbForProject.updateDocument('attributes', relatedAttribute.getId(), relatedAttribute.setAttribute('status', 'stuck'));
                        throw new Error('Failed to delete Relationship');
                    }
                } else if (!(await dbForProject.deleteAttribute('database_' + database.getInternalId() + '_collection_' + collection.getInternalId(), key))) {
                    throw new Error('Failed to delete Attribute');
                }
            }

            await dbForProject.deleteDocument('attributes', attribute.getId());

            if (!relatedAttribute.isEmpty()) {
                await dbForProject.deleteDocument('attributes', relatedAttribute.getId());
            }
        } catch (error) {
            Console.error((error as Error).message);

            if (error instanceof Error) {
                attribute.setAttribute('error', error.message);
            }
            await dbForProject.updateDocument('attributes', attribute.getId(), attribute.setAttribute('status', 'stuck'));
            if (!relatedAttribute.isEmpty()) {
                await dbForProject.updateDocument('attributes', relatedAttribute.getId(), relatedAttribute.setAttribute('status', 'stuck'));
            }
        } finally {
            this.trigger(database, collection, attribute, projectDoc, projectId, events);
        }

        const indexes = collection.getAttribute('indexes', []);

        for (const index of indexes) {
            const attributes = index.getAttribute('attributes');
            const lengths = index.getAttribute('lengths');
            const orders = index.getAttribute('orders');

            const found = attributes.indexOf(key);

            if (found !== -1) {
                attributes.splice(found, 1);
                lengths.splice(found, 1);
                orders.splice(found, 1);

                if (attributes.length === 0) {
                    await dbForProject.deleteDocument('indexes', index.getId());
                } else {
                    index.setAttribute('attributes', attributes);
                    index.setAttribute('lengths', lengths);
                    index.setAttribute('orders', orders);

                    let exists = false;
                    for (const existing of indexes) {
                        if (
                            existing.getAttribute('key') !== index.getAttribute('key') &&
                            existing.getAttribute('attributes') === index.getAttribute('attributes') &&
                            existing.getAttribute('orders') === index.getAttribute('orders')
                        ) {
                            exists = true;
                            break;
                        }
                    }

                    if (exists) {
                        await this.deleteIndex(database, collection, index, projectDoc, dbForConsole, dbForProject);
                    } else {
                        await dbForProject.updateDocument('indexes', index.getId(), index);
                    }
                }
            }
        }

        await dbForProject.purgeCachedDocument('database_' + database.getInternalId(), collectionId);
        await dbForProject.purgeCachedCollection('database_' + database.getInternalId() + '_collection_' + collection.getInternalId());

        if (!relatedCollection.isEmpty() && !relatedAttribute.isEmpty()) {
            await dbForProject.purgeCachedDocument('database_' + database.getInternalId(), relatedCollection.getId());
            await dbForProject.purgeCachedCollection('database_' + database.getInternalId() + '_collection_' + relatedCollection.getInternalId());
        }
    }

    private async createIndex(database: Document, collection: Document, index: Document, project: Document, dbForConsole: Database, dbForProject: Database): Promise<void> {
        if (collection.isEmpty()) {
            throw new Error('Missing collection');
        }
        if (index.isEmpty()) {
            throw new Error('Missing index');
        }

        const projectId = project.getId();

        const events = Event.generateEvents('databases.[databaseId].collections.[collectionId].indexes.[indexId].update', {
            'databaseId': database.getId(),
            'collectionId': collection.getId(),
            'indexId': index.getId()
        });
        const collectionId = collection.getId();
        const key = index.getAttribute('key', '');
        const type = index.getAttribute('type', '');
        const attributes = index.getAttribute('attributes', []);
        const lengths = index.getAttribute('lengths', []);
        const orders = index.getAttribute('orders', []);
        const projectDoc = await dbForConsole.getDocument('projects', projectId);

        try {
            if (!(await dbForProject.createIndex('database_' + database.getInternalId() + '_collection_' + collection.getInternalId(), key, type, attributes, lengths, orders))) {
                throw new Error('Failed to create Index');
            }
            await dbForProject.updateDocument('indexes', index.getId(), index.setAttribute('status', 'available'));
        } catch (error) {
            Console.error((error as Error).message);

            if (error instanceof Error) {
                index.setAttribute('error', error.message);
            }
            await dbForProject.updateDocument('indexes', index.getId(), index.setAttribute('status', 'failed'));
        } finally {
            this.trigger(database, collection, index, projectDoc, projectId, events);
        }

        await dbForProject.purgeCachedDocument('database_' + database.getInternalId(), collectionId);
    }

    private async deleteIndex(database: Document, collection: Document, index: Document, project: Document, dbForConsole: Database, dbForProject: Database): Promise<void> {
        if (collection.isEmpty()) {
            throw new Error('Missing collection');
        }
        if (index.isEmpty()) {
            throw new Error('Missing index');
        }

        const projectId = project.getId();

        const events = Event.generateEvents('databases.[databaseId].collections.[collectionId].indexes.[indexId].delete', {
            'databaseId': database.getId(),
            'collectionId': collection.getId(),
            'indexId': index.getId()
        });
        const key = index.getAttribute('key');
        const status = index.getAttribute('status', '');
        const projectDoc = await dbForConsole.getDocument('projects', projectId);

        try {
            if (status !== 'failed' && !(await dbForProject.deleteIndex('database_' + database.getInternalId() + '_collection_' + collection.getInternalId(), key))) {
                throw new Error('Failed to delete index');
            }
            await dbForProject.deleteDocument('indexes', index.getId());
            index.setAttribute('status', 'deleted');
        } catch (error) {
            Console.error((error as Error).message);

            if (error instanceof Error) {
                index.setAttribute('error', error.message);
            }
            await dbForProject.updateDocument('indexes', index.getId(), index.setAttribute('status', 'stuck'));
        } finally {
            this.trigger(database, collection, index, projectDoc, projectId, events);
        }

        await dbForProject.purgeCachedDocument('database_' + database.getInternalId(), collection.getId());
    }

    protected async deleteDatabase(database: Document, project: Document, dbForProject: Database): Promise<void> {
        await this.deleteByGroup('database_' + database.getInternalId(), [], dbForProject, async (collection) => {
            await this.deleteCollection(database, collection, project, dbForProject);
        });

        await dbForProject.deleteCollection('database_' + database.getInternalId());

        await this.deleteAuditLogsByResource('database/' + database.getId(), project, dbForProject);
    }

    protected async deleteCollection(database: Document, collection: Document, project: Document, dbForProject: Database): Promise<void> {
        if (collection.isEmpty()) {
            throw new Error('Missing collection');
        }

        const collectionId = collection.getId();
        const collectionInternalId = collection.getInternalId();
        const databaseId = database.getId();
        const databaseInternalId = database.getInternalId();

        await this.deleteByGroup(
            'attributes',
            [
                Query.equal('databaseInternalId', [databaseInternalId]),
                Query.equal('type', [Database.VAR_RELATIONSHIP]),
                Query.notEqual('collectionInternalId', collectionInternalId),
                Query.contains('options', [`"relatedCollection":"${collectionId}"`]),
            ],
            dbForProject,
            async (attribute) => {
                await dbForProject.purgeCachedDocument('database_' + databaseInternalId, attribute.getAttribute('collectionId'));
                await dbForProject.purgeCachedCollection('database_' + databaseInternalId + '_collection_' + attribute.getAttribute('collectionInternalId'));
            }
        );

        await dbForProject.deleteCollection('database_' + databaseInternalId + '_collection_' + collection.getInternalId());

        await this.deleteByGroup('attributes', [
            Query.equal('databaseInternalId', [databaseInternalId]),
            Query.equal('collectionInternalId', [collectionInternalId])
        ], dbForProject);

        await this.deleteByGroup('indexes', [
            Query.equal('databaseInternalId', [databaseInternalId]),
            Query.equal('collectionInternalId', [collectionInternalId])
        ], dbForProject);

        await this.deleteAuditLogsByResource('database/' + databaseId + '/collection/' + collectionId, project, dbForProject);
    }

    protected async deleteAuditLogsByResource(resource: string, project: Document, dbForProject: Database): Promise<void> {
        await this.deleteByGroup('audit', [
            Query.equal('resource', [resource])
        ], dbForProject);
    }

    protected async deleteByGroup(collection: string, queries: Query[], database: Database, callback: ((document: Document) => Promise<void>) | null = null): Promise<void> {
        let count = 0;
        let chunk = 0;
        const limit = 50;
        let sum = limit;

        const executionStart = Date.now();

        while (sum === limit) {
            chunk++;

            const results = await database.find(collection, [Query.limit(limit), ...queries]);

            sum = results.length;

            Console.info('Deleting chunk #' + chunk + '. Found ' + sum + ' documents');

            for (const document of results) {
                if (await database.deleteDocument(document.getCollection(), document.getId())) {
                    Console.success('Deleted document "' + document.getId() + '" successfully');

                    if (callback) {
                        await callback(document);
                    }
                } else {
                    Console.warning('Failed to delete document: ' + document.getId());
                }
                count++;
            }
        }

        const executionEnd = Date.now();

        Console.info(`Deleted ${count} document by group in ${(executionEnd - executionStart) / 1000} seconds`);
    }

    protected trigger(
        database: Document,
        collection: Document,
        attribute: Document,
        project: Document,
        projectId: string,
        events: string[]
    ): void {
        const target = Realtime.fromPayload(
            events[0],
            attribute,
            project
        );
        Realtime.send(
            'console',
            attribute.getArrayCopy(),
            events,
            target.channels,
            target.roles,
            {
                projectId,
                databaseId: database.getId(),
                collectionId: collection.getId()
            }
        );
    }
}