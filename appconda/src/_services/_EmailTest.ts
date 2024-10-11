import { BaseService } from "../BaseService";
import MiningService from "../Services/MiningService";
import { CsvImporter } from "../Services/mining-service/mining/objects/log/importer/csv/importer";
import { nanoid } from "../modules/nanoid/nanoid";

var fs = require('fs');
class CspTestService extends BaseService {
    get uid(): string {
       return 'email-test-me-service';
    }
    get displayName(): string {
        return 'email-test-me-service';
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


        const smtp_server = 'smtp-mail.outlook.com';
        const smtp_port = '587';
        const smtp_username = 'info@pedabilisim.com';
        const smtp_password = 'Pedasoft?2024_PDV';
        const form_email = 'info@pedabilisim.com';
        const to_email = 'yusuf.selek@pedabilisim.com';
        const subject = 'sdfsdf';
        const htmlTemplate = '<p>Test</p>';
        const values = {};

        const key = this.emailService.createKey({
            tls: false,
            smtpServer: smtp_server,
            smtpPort: smtp_port,
            username: smtp_username,
            password: smtp_password
        });
 
        console.log(key)
        console.log(key);
        console.log(this.databaseService);

        console.log(this.databaseService.Query)
      /*    await this.emailService
        .sendEmail(key,form_email,to_email,subject,htmlTemplate,values);  */
       
        //console.log( flows);



    }
    public static get Name(): string {
        return 'email-test-service';
    }


}


module.exports = CspTestService;