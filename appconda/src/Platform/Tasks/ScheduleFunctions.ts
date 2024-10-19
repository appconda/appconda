import { Console } from "../../Tuval/CLI";
import { DateTime } from "../../Tuval/Core";
import { Database } from "../../Tuval/Database";
import { Group } from "../../Tuval/Pools";
import { Func } from "../../Appconda/Event/Func";
import { ScheduleBase } from "./ScheduleBase";
import * as parser from 'cron-parser';

export class ScheduleFunctions extends ScheduleBase {
    public static readonly UPDATE_TIMER = 10; // seconds
    public static readonly ENQUEUE_TIMER = 60; // seconds

    private lastEnqueueUpdate: number | null = null;

    public static getName(): string {
        return 'schedule-functions';
    }

    public  getSupportedResource(): string {
        return 'function';
    }

    protected async enqueueResources(pools: Group, dbForConsole: Database): Promise<void> {
        const timerStart = Date.now() / 1000;
        const time = DateTime.now();

        const enqueueDiff = this.lastEnqueueUpdate === null ? 0 : timerStart - this.lastEnqueueUpdate;
        const timeFrame = DateTime.addSeconds(new Date(), ScheduleFunctions.ENQUEUE_TIMER - enqueueDiff);

        Console.log(`Enqueue tick: started at: ${time} (with diff ${enqueueDiff})`);

        let total = 0;

        const delayedExecutions: Record<number, string[]> = {}; // Group executions with same delay to share one coroutine

        for (const [key, schedule] of Object.entries(this.schedules)) {
            const cron = parser.parseExpression(schedule.schedule);
            const nextDate = cron.next().toDate();
            const next = DateTime.format(nextDate);

            const currentTick = next < timeFrame;

            if (!currentTick) {
                continue;
            }

            total++;

            const promiseStart = Math.floor(Date.now() / 1000); // in seconds
            const executionStart = Math.floor(nextDate.getTime() / 1000); // in seconds
            const delay = executionStart - promiseStart; // Time to wait from now until execution needs to be queued

            if (!delayedExecutions[delay]) {
                delayedExecutions[delay] = [];
            }

            delayedExecutions[delay].push(key);
        }

        for (const [delay, scheduleKeys] of Object.entries(delayedExecutions)) {
            setTimeout(async () => {
                const queue = await pools.get('queue').pop();
                const connection =  queue.getResource();

                for (const scheduleKey of scheduleKeys) {
                    // Ensure schedule was not deleted
                    if (!(scheduleKey in this.schedules)) {
                        return;
                    }

                    const schedule = this.schedules[scheduleKey];

                    const queueForFunctions = new Func(connection);

                    queueForFunctions
                        .setType('schedule')
                        .setFunction(schedule['resource'])
                        .setMethod('POST')
                        .setPath('/')
                        .setProject(schedule['project'])
                        .trigger();
                }

                queue.reclaim();
            }, Number(delay) * 1000); // Convert delay to milliseconds
        }

        const timerEnd = Date.now() / 1000;

        // TODO: This was a bug before because it wasn't passed by reference, enabling it breaks scheduling
        // this.lastEnqueueUpdate = timerStart;

        Console.log(`Enqueue tick: ${total} executions were enqueued in ${timerEnd - timerStart} seconds`);
    }
}