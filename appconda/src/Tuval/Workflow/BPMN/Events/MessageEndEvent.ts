
import MailService from "../../../../Platform/Services/mail-service/MailService";
import { Console } from "../../../CLI";
import { Exception, Text } from "../../../Core";
import { EventBus } from "../../../EventBus/EventBus";
import { Execution, ProcessItem } from "../../ProcessItem";
import { Workflow } from "../../Workflow";

export interface MessageEndEventMetadataType {
    messageName: string;
}

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

    private async execute(workflow: Workflow, mailService: MailService, eventBus: EventBus) {

        await eventBus.publish(this.getMessageName(), 'User 123 has registered.');
        this.execution = Execution.Contionue;


    }

    public static build(bpmnItem: any) {
        const processItem = new MessageEndEvent();
        const id = ProcessItem.buildId(bpmnItem);
        const name = ProcessItem.buildName(bpmnItem);
        const metadata: MessageEndEventMetadataType = ProcessItem.buildMetadata(bpmnItem);

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