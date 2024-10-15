import { Database } from "../../Tuval/Database";
import { Group } from "../../Tuval/Pools";
import { Func } from "../../Appconda/Event/Func";
import { ScheduleBase } from "./ScheduleBase";


export class ScheduleExecutions extends ScheduleBase {
    protected static readonly UPDATE_TIMER = 3; // seconds
    protected static readonly ENQUEUE_TIMER = 4; // seconds

    public static getName(): string {
        return 'schedule-executions';
    }

    public static getSupportedResource(): string {
        return 'execution';
    }

    protected async enqueueResources(pools: Group, dbForConsole: Database): Promise<void> {
        const queue = await pools.get('queue').pop();
        const connection =  queue.getResource();
        const queueForFunctions = new Func(connection);
        const intervalEnd = new Date(Date.now() + ScheduleExecutions.ENQUEUE_TIMER * 1000);

        for (const schedule of Object.values(this.schedules)) {
            if (!schedule.active) {
                await dbForConsole.deleteDocument('schedules', schedule.$id);
                delete this.schedules[schedule.$internalId];
                continue;
            }

            const scheduledAt = new Date(schedule.schedule);
            if (scheduledAt > intervalEnd) {
                continue;
            }

            const data = (await dbForConsole.getDocument('schedules', schedule.$id)).getAttribute('data', []);
            const delay = scheduledAt.getTime() - Date.now();

            Co.run(async () => {
                await Co.sleep(delay / 1000);

                queueForFunctions.setType('schedule')
                    .setFunctionId(schedule.resource.functionId)
                    .setExecution(schedule.resource)
                    .setMethod(data.method ?? 'POST')
                    .setPath(data.path ?? '/')
                    .setHeaders(data.headers ?? [])
                    .setBody(data.body ?? '')
                    .setProject(schedule.project)
                    .setUserId(data.userId ?? '')
                    .trigger();
            });

            await dbForConsole.deleteDocument('schedules', schedule.$id);
            delete this.schedules[schedule.$internalId];
        }

        queue.reclaim();
    }
}