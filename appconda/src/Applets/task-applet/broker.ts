import { BaseService } from "../../BaseService";
import { ITask } from "./task/ITask";
import { Task } from "./task/Task";

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
export default class TaskService extends BaseService {

    public get uid(): string {
        return 'com.appconda.service.task';
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

    public async setup( appId: string, appletId: string ) {

        await Task.setup(this, { appId, appletId });
        /*  await this.schemaService.createDatabase(appId, appletId,
             {
                 name: 'Task',
                 databases: ListAppletDatabase
             });
 
         return {
             success: true
         }; */
    }

    @Action({
        title: 'Add Task',
    })
    public async addTask(appId: string, appletId: string, taskInfo: ITask) {
        const taskDTO = await Task.create(this, appId, appletId, taskInfo);
        return taskDTO;
    }

    public async approveTask(appId: string, appletId: string, { taskId }: { taskId: string }) {
        console.log(appId + '_' + 'appletId' + 'approveTask');
        return {
            appId,
            appletId,
            taskId
        }
    }

    public async complateTask(appId: string, appletId: string, { taskId }: { taskId: string }) {
        console.log(appId + '_' + appletId + 'complateTask');
    }

    public async getCounters(appId: string, appletId: string, { taskId }: { taskId: string }) {
        console.log(appId + '_' + appletId + 'getCounters');
    }

    public async deferTask(appId: string, appletId: string, { taskId }: { taskId: string }) {
        console.log(appId + '_' + appletId + 'deferTask');
    }

    public async delegateTask(appId: string, appletId: string, { taskId, userId }:
        { taskId: string, userId: string }) {
        console.log(appId + '_' + appletId + 'delegateTask');
    }

    public async deleteTask(appId: string, appletId: string, { taskId }: { taskId: string }) {
        console.log(appId + '_' + appletId + 'deleteTask');
    }



    public disapproveTask(taskId: string) {
        console.log('disapproveTask')
    }

    public async getFields({ appId, appletId }: { appId: string, appletId: string }) {
        const fields = Task.getFields(this, { appId, appletId });
        return fields;
    }
}


