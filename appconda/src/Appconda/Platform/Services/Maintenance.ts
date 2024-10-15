import { Console } from "../../../Tuval/CLI";
import { DateTime, Document } from "../../../Tuval/Core";
import { Database, Query } from "../../../Tuval/Database";
import { Action } from "../../../Tuval/Platform/Action";
import { Certificate } from "../../Event/Certificate";
import { Delete } from "../../Event/Delete";


class Maintenance extends Action {
    public static getName(): string {
        return 'maintenance';
    }

    constructor() {
        super();
        this.desc('Schedules maintenance tasks and publishes them to our queues')
            .inject('dbForConsole')
            .inject('queueForCertificates')
            .inject('queueForDeletes')
            .callback((dbForConsole: Database, queueForCertificates: Certificate, queueForDeletes: Delete) => this.action(dbForConsole, queueForCertificates, queueForDeletes));
    }

    public action(dbForConsole: Database, queueForCertificates: Certificate, queueForDeletes: Delete): void {
        Console.title('Maintenance V1');
        Console.success(`${process.env.APP_NAME} maintenance process v1 has started`);
        const interval = parseInt(process.env._APP_MAINTENANCE_INTERVAL || '86400');
        const delay = parseInt(process.env._APP_MAINTENANCE_DELAY || '0');
        const usageStatsRetentionHourly = parseInt(process.env._APP_MAINTENANCE_RETENTION_USAGE_HOURLY || '8640000');
        const cacheRetention = parseInt(process.env._APP_MAINTENANCE_RETENTION_CACHE || '2592000');
        const schedulesDeletionRetention = parseInt(process.env._APP_MAINTENANCE_RETENTION_SCHEDULES || '86400');

        Console.loop(() => {
            const time = DateTime.now();

            Console.info(`[${time}] Notifying workers with maintenance tasks every ${interval} seconds`);

            this.foreachProject(dbForConsole, (project: Document) => {
                queueForDeletes.setProject(project);

                this.notifyDeleteTargets(queueForDeletes);
                this.notifyDeleteExecutionLogs(queueForDeletes);
                this.notifyDeleteAbuseLogs(queueForDeletes);
                this.notifyDeleteAuditLogs(queueForDeletes);
                this.notifyDeleteUsageStats(usageStatsRetentionHourly, queueForDeletes);
                this.notifyDeleteExpiredSessions(queueForDeletes);
            });

            this.notifyDeleteConnections(queueForDeletes);
            this.renewCertificates(dbForConsole, queueForCertificates);
            this.notifyDeleteCache(cacheRetention, queueForDeletes);
            this.notifyDeleteSchedules(schedulesDeletionRetention, queueForDeletes);
        }, interval, delay);
    }

    protected async foreachProject(dbForConsole: Database, callback: (project: Document) => void): Promise<void> {
        let count = 0;
        let chunk = 0;
        const limit = 50;
        let sum = limit;
        const executionStart = Date.now();

        while (sum === limit) {
            const projects = await dbForConsole.find('projects', [Query.limit(limit), Query.offset(chunk * limit)]);
            chunk++;
            sum = projects.length;

            for (const project of projects) {
                callback(project);
                count++;
            }
        }

        const executionEnd = Date.now();
        Console.info(`Found ${count} projects in ${(executionEnd - executionStart) / 1000} seconds`);
    }

    private notifyDeleteExecutionLogs(queueForDeletes: Delete): void {
        queueForDeletes
            .setType('DELETE_TYPE_EXECUTIONS')
            .trigger();
    }

    private notifyDeleteAbuseLogs(queueForDeletes: Delete): void {
        queueForDeletes
            .setType('DELETE_TYPE_ABUSE')
            .trigger();
    }

    private notifyDeleteAuditLogs(queueForDeletes: Delete): void {
        queueForDeletes
            .setType('DELETE_TYPE_AUDIT')
            .trigger();
    }

    private notifyDeleteUsageStats(usageStatsRetentionHourly: number, queueForDeletes: Delete): void {
        queueForDeletes
            .setType('DELETE_TYPE_USAGE')
            .setUsageRetentionHourlyDateTime(DateTime.addSeconds(new Date(), -1 * usageStatsRetentionHourly))
            .trigger();
    }

    private notifyDeleteConnections(queueForDeletes: Delete): void {
        queueForDeletes
            .setType('DELETE_TYPE_REALTIME')
            .setDatetime(DateTime.addSeconds(new Date(), -60))
            .trigger();
    }

    private notifyDeleteExpiredSessions(queueForDeletes: Delete): void {
        queueForDeletes
            .setType('DELETE_TYPE_SESSIONS')
            .trigger();
    }

    private async renewCertificates(dbForConsole: Database, queueForCertificate: Certificate): Promise<void> {
        const time = DateTime.now();

        const certificates = await dbForConsole.find('certificates', [
            Query.lessThan('attempts', 5),
            Query.lessThanEqual('renewDate', time),
            Query.limit(200),
        ]);

        if (certificates.length > 0) {
            Console.info(`[${time}] Found ${certificates.length} certificates for renewal, scheduling jobs.`);

            for (const certificate of certificates) {
                queueForCertificate
                    .setDomain(new Document({
                        domain: certificate.getAttribute('domain')
                    }))
                    .trigger();
            }
        } else {
            Console.info(`[${time}] No certificates for renewal.`);
        }
    }

    private notifyDeleteCache(interval: number, queueForDeletes: Delete): void {
        queueForDeletes
            .setType('DELETE_TYPE_CACHE_BY_TIMESTAMP')
            .setDatetime(DateTime.addSeconds(new Date(), -1 * interval))
            .trigger();
    }

    private notifyDeleteSchedules(interval: number, queueForDeletes: Delete): void {
        queueForDeletes
            .setType('DELETE_TYPE_SCHEDULES')
            .setDatetime(DateTime.addSeconds(new Date(), -1 * interval))
            .trigger();
    }

    private notifyDeleteTargets(queueForDeletes: Delete): void {
        queueForDeletes
            .setType('DELETE_TYPE_EXPIRED_TARGETS')
            .trigger();
    }
}