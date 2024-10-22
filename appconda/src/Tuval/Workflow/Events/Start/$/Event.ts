
import MailService from "../../../../../Platform/Services/mail-service/MailService";
import { Console } from "../../../../CLI";
import { ProcessItem, Execution } from "../../../ProcessItem";
import { Workflow } from "../../../Workflow";

export class StartEvent extends ProcessItem {

    constructor() {
        super()
        this.desc('Start event for workflow');

        this.init()
            .action(() => {
                // Console.info('Start event going to execute.')
            })

        this.shutdown()
            .action(() => {
                // Console.success('Start event executed.')
            })

        this.error()
            .action(() => {
                Console.error('Start event on error.')
            })


        this.action()
            .inject('workflow')
            .inject('mail-service')
            .action(this.execute.bind(this))
    }

    private execute(workflow: Workflow, mailService: MailService) {

        console.info(`${this.getName()} executed.`)


        return Execution.Contionue;

    }

}