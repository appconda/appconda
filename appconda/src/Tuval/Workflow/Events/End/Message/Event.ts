
import MailService from "../../../../../Platform/Services/mail-service/MailService";
import { Console } from "../../../../CLI";
import { EventBus } from "../../../../EventBus/EventBus";
import { ProcessItem, Execution } from "../../../ProcessItem";
import { Workflow } from "../../../Workflow";


export class MessageEndEvent extends ProcessItem {

    private messageName: string;

    public setMessageName(value: string) {
        this.messageName = value;
        return this;
    }

    public getMessageName(): string {
        return this.messageName;
    }

    constructor() {
        super()
        this.desc('Start event for workflow');

        this.init()
            .inject('eventBus')
            .action((eventBus: EventBus) => {

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
            .inject('eventBus')
            .action(this.execute.bind(this))
    }

    private async execute(workflow: Workflow, mailService: MailService, eventBus: EventBus) {

        Console.success(`${this.getName()} executed`);
        await eventBus.publish(this.getMessageName(), 'User 123 has registered.');
        this.execution = Execution.End;


    }


}