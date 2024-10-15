import { BaseService } from "../BaseService";
import { ITask } from "../modules/task/ITask";
import e from "express";
import { ListAppletDatabase } from "../modules/task/TaskListDatabase";
import { Task } from "../modules/task/Task";
import { IAppletInfo } from "../modules/task/IAppletInfo";
import KVService from "./KVService";

const winston = require('winston');
const { combine, timestamp, json } = winston.format;

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
export default class LogService extends BaseService {

    public get uid(): string {
        return 'com.appconda.service.log';
    }

    get displayName(): string {
        return 'Log Service'
    }

    public async init() {
        console.log('>>>>>>>> Log Service initialized. <<<<<<<<<<')
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

    private async getLogger(appId: string, appletId: string) {
        let logger = await this.kvService.get('LogService_' + appId + '_' + appletId);
        if (logger == null) {
            logger = winston.createLogger({
                //level: 'info',
                format: combine(timestamp(), json()),
                defaultMeta: { service: 'user-service', user: 'hans' },
                transports: [
                    //
                    // - Write all logs with importance level of `error` or less to `error.log`
                    // - Write all logs with importance level of `info` or less to `combined.log`
                    //
                    new winston.transports.File({ filename: `/usr/services/log/${appId}/${appletId}/error.log`, level: 'error' }),
                    new winston.transports.File({ filename: `/usr/services/log/${appId}/${appletId}/info.log`, level: 'info' }),
                    //new winston.transports.File({ filename: '/usr/services/log/combined.log', 'timestamp': true }),
                ],
            });

            await this.kvService.set('LogService_' + appId + '_' + appletId, logger);
        }

        return logger;
    }

    @Action({
        title: 'Add Info Log',
    })
    public async info(appId: string, appletId: string,  logData: any ) {

        const logger = await this.getLogger(appId, appletId);

        logger.info({
            ...logData
        });

       // logger.info('Hello again distributed logs_sdfsfdf');

        return {
            appId,
            appletId,
            logData
        }
    }

    @Action({
        title: 'Add Debug Log',
    })
    public async debug(appId: string, appletId: string,  logData: any ) {

        const logger = await this.getLogger(appId, appletId);

        logger.debug({
            ...logData
        });

       // logger.info('Hello again distributed logs_sdfsfdf');

        return {
            appId,
            appletId,
            logData
        }
    }

    @Action({
        title: 'List Log',
    })
    public async list(appId: string, appletId: string, { fields }: { fields: string }): Promise<any> {
        return new Promise (async (resolve, reject)=> {
            const logger = await this.getLogger(appId, appletId);
    
            const options = {
                from: new (Date as any)() - (24 * 60 * 60 * 1000),
                until: new Date(),
                limit: 10,
                start: 0,
                order: 'desc',
                //fields: fields.split(',').map(s => s.trim())
            };
    
            //
            // Find items logged between today and yesterday.
            //
            logger.query(options, function (err, results) {
                if (err) {
                    /* TODO: handle me */
                    throw err;
                }
    
    
                 resolve(results);
            });
    
        })
    }
       


}


