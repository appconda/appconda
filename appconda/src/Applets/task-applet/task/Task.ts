import { BaseService } from "../../BaseService";
import { ID } from "../sdk/id";
import { Query } from "../sdk/query";
import { IAppletInfo } from "./IAppletInfo";
import { ITask } from "./ITask";
import { ListAppletDatabase } from "./TaskListDatabase";
const ID = require('../sdk/id');

export class Task {
    public static async setup(service: BaseService, { appId, appletId }: { appId: string, appletId: string }) {

        await service.schemaService.createDatabase(appId, appletId,
            {
                name: 'Task',
                databases: ListAppletDatabase
            });

        return {
            success: true
        };
    }

    public static async create(service: BaseService, appId: string, appletId: string, task: ITask) {
        const taskDocument = await service.databaseService.createDocument(appId, appletId, 'tasks',
            ID.unique(), task);

        return taskDocument;
    }

    public static async getFields(service: BaseService, { appId, appletId }: { appId: string, appletId: string }) {
        const fields = await service.databaseService.listDocuments(appId, appletId, 'fields', [
            Query.equal('collectionId', 'tasks')
        ]);

        return fields;
    }
}