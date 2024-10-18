import { Mail } from "../../Appconda/Event/Mail";
import { Console } from "../../Tuval/CLI";
import { Action } from "../../Tuval/Platform/Action";
import TaskApplet from "../Applets/task-applet/TaskApplet";
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
            .inject('task-applet')
            .callback(this.action);
    }

    public action(databaseService: DatabaseService, mailService: MailService, taskApplet: TaskApplet): void {
       /*  console.log(mailService)
        mailService.send({
            smtp: ''
        });

        databaseService.create({
            project: 'project 1',
            name: 'databaseName'
        }) */

        if (taskApplet) {
            taskApplet.create({
                name:'',
                project:'sdf'
            });
            Console.success('Task Applet Loaded.');
        }
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