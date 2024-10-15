
import { Database } from '../../Tuval/Database';
import { Group } from '../../Tuval/Pools';
import { Messaging } from '../../Appconda/Event/Messaging';
import { ScheduleBase } from './ScheduleBase';

export class ScheduleMessages extends ScheduleBase {
    public static readonly UPDATE_TIMER = 3; // seconds
    public static readonly ENQUEUE_TIMER = 4; // seconds

    public static getName(): string {
        return 'schedule-messages';
    }

    public static getSupportedResource(): string {
        return 'message';
    }

    protected async enqueueResources(pools: Group, dbForConsole: Database): Promise<void> {
        for (const key of Object.keys(this.schedules)) {
            const schedule = this.schedules[key];
            if (!schedule['active']) {
                continue;
            }

            const now = new Date();
            const scheduledAt = new Date(schedule['schedule']);

            if (scheduledAt > now) {
                continue;
            }

            setTimeout(async () => {
                const queue = await pools.get('queue').pop();
                const connection = queue.getResource();
                const queueForMessaging = new Messaging(connection);

                queueForMessaging
                    .setType('MESSAGE_SEND_TYPE_EXTERNAL')
                    .setMessageId(schedule['resourceId'])
                    .setProject(schedule['project'])
                    .trigger();

                await dbForConsole.deleteDocument('schedules', schedule['$id']);

                queue.reclaim();

                delete this.schedules[schedule['$internalId']];
            }, 0);
        }
    }
}