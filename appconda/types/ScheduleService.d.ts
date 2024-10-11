export interface ScheduleService {
    addJob(cron: string, job: Function);
}