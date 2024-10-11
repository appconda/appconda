import { BaseService } from "../BaseService";

const config = require('../config');

export default class ConfigService extends BaseService {

  public  get uid(): string {
    return 'com.realmocean.service.config';
  }

  get displayName(): string {
    return 'Config Service'
  }


    /*  static  getInstance(args) {
      const _ = new WebServerService(args);
      _._init();
      return _.app;
    } */



    getConfig() {
        return config;
    }

   
}


