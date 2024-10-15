import { Console } from "../../../Tuval/CLI";
import { DateTime, Document } from "../../../Tuval/Core";
import { Database, Query } from "../../../Tuval/Database";
import { Action } from "../../../Tuval/Platform/Action";
import { Group } from "../../../Tuval/Pools";


export abstract class ScheduleBase extends Action {
    protected static  UPDATE_TIMER = 10; // seconds
    protected static  ENQUEUE_TIMER = 60; // seconds

    protected schedules: Record<string, any> = {};

     public static  getName(): string { return ''}
     public static  getSupportedResource(): string { return ''}

    protected abstract  enqueueResources(
        pools: Group,
        dbForConsole: Database
    ): void;

    constructor() {
        super();
        const type = (this.constructor as typeof ScheduleBase).getSupportedResource();

        this.desc(`Execute ${type}s scheduled in Appconda`)
            .inject('pools')
            .inject('dbForConsole')
            .inject('getProjectDB')
            .callback((pools: Group, dbForConsole: Database, getProjectDB: Function) => this.action(pools, dbForConsole, getProjectDB));
    }

    /**
     * 1. Load all documents from 'schedules' collection to create local copy
     * 2. Create timer that sync all changes from 'schedules' collection to local copy. Only reading changes thanks to 'resourceUpdatedAt' attribute
     * 3. Create timer that prepares coroutines for soon-to-execute schedules. When it's ready, coroutine sleeps until exact time before sending request to worker.
     */
    public async action(pools: Group, dbForConsole: Database, getProjectDB: Function): Promise<void> {
        Console.title(`${(this.constructor as any).getSupportedResource()} scheduler V1`);
        Console.success(`${process.env.APP_NAME} ${(this.constructor as any).getSupportedResource()} scheduler v1 has started`);

        const getSchedule = async (schedule: Document): Promise<any> => {
            const project = await dbForConsole.getDocument('projects', schedule.getAttribute('projectId'));

            const collectionId = (() => {
                switch (schedule.getAttribute('resourceType')) {
                    case 'function':
                        return 'functions';
                    case 'message':
                        return 'messages';
                    case 'execution':
                        return 'executions';
                    default:
                        throw new Error('Unsupported resource type');
                }
            })();

            const resource = await getProjectDB(project).getDocument(
                collectionId,
                schedule.getAttribute('resourceId')
            );

            return {
                $internalId: schedule.getInternalId(),
                $id: schedule.getId(),
                resourceId: schedule.getAttribute('resourceId'),
                schedule: schedule.getAttribute('schedule'),
                active: schedule.getAttribute('active'),
                resourceUpdatedAt: schedule.getAttribute('resourceUpdatedAt'),
                project: project, // TODO: Send only ID to worker to reduce memory usage here
                resource: resource, // TODO: Send only ID to worker to reduce memory usage here
            };
        };

        let lastSyncUpdate = DateTime.now();

        const limit = 10000;
        let sum = limit;
        let total = 0;
        const loadStart = Date.now();
        let latestDocument: Document | null = null;

        while (sum === limit) {
            const paginationQueries = [Query.limit(limit)];

            if (latestDocument) {
                paginationQueries.push(Query.cursorAfter(latestDocument));
            }

            const results = await dbForConsole.find('schedules', [
                ...paginationQueries,
                Query.equal('region', [process.env._APP_REGION || 'default']),
                Query.equal('resourceType', [(this.constructor as any).getSupportedResource()]),
                Query.equal('active', [true]),
            ]);

            sum = results.length;
            total += sum;

            for (const document of results) {
                try {
                    this.schedules[document.getInternalId()] = await getSchedule(document);
                } catch (error) {
                    const collectionId = (() => {
                        switch (document.getAttribute('resourceType')) {
                            case 'function':
                                return 'functions';
                            case 'message':
                                return 'messages';
                            case 'execution':
                                return 'executions';
                            default:
                                throw new Error('Unsupported resource type');
                        }
                    })();

                    Console.error(`Failed to load schedule for project ${document.getAttribute('projectId')} ${collectionId} ${document.getAttribute('resourceId')}`);
                    Console.error(error.message);
                }
            }

            latestDocument = results[results.length - 1];
        }

        pools.reclaim();

        Console.success(`${total} resources were loaded in ${(Date.now() - loadStart) / 1000} seconds`);
        Console.success(`Starting timers at ${DateTime.now()}`);

        run(() => {
            Timer.tick(ScheduleBase.UPDATE_TIMER * 1000, async () => {
                const time = DateTime.now();
                const timerStart = Date.now();

                const limit = 1000;
                let sum = limit;
                let total = 0;
                let latestDocument: Document | null = null;

                Console.log(`Sync tick: Running at ${time}`);

                while (sum === limit) {
                    const paginationQueries = [Query.limit(limit)];

                    if (latestDocument) {
                        paginationQueries.push(Query.cursorAfter(latestDocument));
                    }

                    const results = await dbForConsole.find('schedules', [
                        ...paginationQueries,
                        Query.equal('region', [process.env._APP_REGION || 'default']),
                        Query.equal('resourceType', [(this.constructor as any).getSupportedResource()]),
                        Query.greaterThanEqual('resourceUpdatedAt', lastSyncUpdate),
                    ]);

                    sum = results.length;
                    total += sum;

                    for (const document of results) {
                        const localDocument = this.schedules[document.getAttribute('resourceId')] ?? null;

                        const org = localDocument !== null ? new Date(localDocument.resourceUpdatedAt).getTime() : null;
                        const newTime = new Date(document.getAttribute('resourceUpdatedAt')).getTime();

                        if (!document.getAttribute('active')) {
                            Console.info(`Removing: ${document.getAttribute('resourceId')}`);
                            delete this.schedules[document.getInternalId()];
                        } else if (newTime !== org) {
                            Console.info(`Updating: ${document.getAttribute('resourceId')}`);
                            this.schedules[document.getInternalId()] = await getSchedule(document);
                        }
                    }

                    latestDocument = results[results.length - 1];
                }

                lastSyncUpdate = time;
                const timerEnd = Date.now();

                pools.reclaim();

                Console.log(`Sync tick: ${total} schedules were updated in ${(timerEnd - timerStart) / 1000} seconds`);
            });

            Timer.tick(
                ScheduleBase.ENQUEUE_TIMER * 1000,
                () => this.enqueueResources(pools, dbForConsole)
            );

            this.enqueueResources(pools, dbForConsole);
        });
    }
}