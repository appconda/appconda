
import { BaseService } from './BaseService';

const clientService = require('./modules/sdk/client');
var process = require("process");

process.env._APP_OPTIONS_FORCE_HTTPS

export class RealmoceanClientService extends BaseService {
  client: any;

  async _init() {
    this.client = new clientService();
    this.client
      .setEndpoint('http://realmocean-dev/v1');
    this.initClient();
  }
  initClient() {
    throw new Error('Method not implemented.');
  }
}
