import { Mail } from "../../Appconda/Event/Mail";
import { Action } from "../../Tuval/Platform/Action";
import DatabaseService from "../Services/database-service/DatabaseService";
import MailService from "../Services/mail-service/MailService";

export class Test extends Action {
    public static getName(): string {
        return 'test';
    }

    constructor() {
        super();
        this
            .desc('List all the server environment variables')
            .inject('database-service')
            .inject('mail-service')
            .callback(this.action);
    }

    public action(databaseService: DatabaseService, mailService: MailService): void {
        console.log(mailService)
        mailService.send({
            smtp: ''
        });

        databaseService.create({
            project: 'project 1',
            name: 'databaseName'
        })
        // console.log(databaseService);

       /*  queueForMails
            .setSmtpHost('')
            .setSmtpPort(3456)
            .setSmtpUsername('')
            .setSmtpPassword('')
            .setSmtpSecure('');

        queueForMails
            .setSubject('')
            .setBody('body')
            .setVariables({})
            .setRecipient('email')
            .trigger(); */
    }
}