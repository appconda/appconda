
import MailService from "../../../../Platform/Services/mail-service/MailService";
import { Console } from "../../../CLI";
import { Exception, Text } from "../../../Core";
import { EventBus } from "../../../EventBus/EventBus";
import { Execution, ProcessItem } from "../../ProcessItem";
import { Workflow } from "../../Workflow";

export interface MessageStartEventMetadataType {
    messageName: string;
}

export class MessageStartEvent extends ProcessItem {

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
                Console.info('Message Start event going to execute.');
                this.execution = Execution.NOOP;
                eventBus.subscribe(this.getMessageName(), (message) => {
                  //  console.log(`Received message: ${message}`);
                    this.execution = Execution.Contionue;
                });
            })

        this.shutdown()
            .action(() => {
                Console.success('Start event executed.')
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

    private execute(workflow: Workflow, mailService: MailService, eventBus: EventBus) {
        Console.info(`${this.getName()} executed`);
    }

    public static build(bpmnItem: any) {
        const processItem = new MessageStartEvent();
        const id = ProcessItem.buildId(bpmnItem);
        const name = ProcessItem.buildName(bpmnItem);
        const metadata: MessageStartEventMetadataType = ProcessItem.buildMetadata(bpmnItem);

        processItem
            .setId(id)
            .setName(name)
            .setMessageName(metadata.messageName)

        processItem.validateMetadata();

        return processItem;
    }

    public validateMetadata(): void {
        const textValidator: Text = new Text(255);
        if (!textValidator.isValid(this.messageName)) {
            // Console.error(`messageName not found for ${this.getName()}`);
            throw new Exception(`messageName not found for ${this.getName()}`)
        }
    }

}