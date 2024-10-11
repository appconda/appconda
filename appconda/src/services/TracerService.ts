import { BaseService } from "../BaseService";



export default class TraceService extends BaseService {
  public get uid(): string {
    return 'com.realmocean.service.tracer';
  }

  get displayName(): string {
    return 'Tracer Service'
  }

}

