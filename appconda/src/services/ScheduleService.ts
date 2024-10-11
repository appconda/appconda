import { BaseService } from "../BaseService";

const cronJobs = require('node-cron');

export default class ScheduleService extends BaseService {

  public get uid(): string {
    return 'com.realmocean.service.schedule';
  }

  get displayName(): string {
    return 'Scheduled Service'
  }


  addJob(cron: string, job: Function) {
    cronJobs.schedule(cron, job);
  }
}

