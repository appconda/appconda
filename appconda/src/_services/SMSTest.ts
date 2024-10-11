import { BaseService } from "../BaseService";
import MiningService from "../Services/MiningService";
import { CsvImporter } from "../Services/mining-service/mining/objects/log/importer/csv/importer";
import { nanoid } from "../modules/nanoid/nanoid";

var fs = require('fs');
class CspTestService extends BaseService {
    get uid(): string {
        return 'sms-test-me-service';
    }
    get displayName(): string {
        return 'sms-test-me-service';
    }

    public async init() {

        /*      {
                 smtpServer: 'smtpout.secureserver.net',
                 smtpPort: '465',
                 username: 'team@celmino.io',
                 password: 'AAA123bbb'
               } */

        /*     {
               smtpServer: 'smtpout.secureserver.net',
               smtpPort: '465',
               username: 'team@celmino.io',
               password: 'AAA123bbb'
            } */




        const key = this.smsService.createKey({
            provider: 'vatan',
            sender: 'PEDASFTYZLM',
            providerData: {
                "api_id": "9919f7550941ae200253a8f9",
                "api_key": "c334e032dac06937c539740c",
                "message_type": "normal",
                "message_content_type": "bilgi"
            }
        });

       
        //    await this.smsService.send(key, 'Sms Servisi tamamdır :)', ['5451104747'])

        //console.log( flows);



    }
    public static get Name(): string {
        return 'email-test-service';
    }


}


module.exports = CspTestService;