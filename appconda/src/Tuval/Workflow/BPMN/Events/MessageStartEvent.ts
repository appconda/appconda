
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
            .action(this.initAction.bind(this))

        this.shutdown()
            .action(() => {
            })

        this.error()
            .action(() => {
                Console.error('Start event on error.')
            })


        this.action()
            .inject('workflow')
            .inject('mail-service')
            .inject('eventBus')
            .action(this.executeAction.bind(this))
    }

    /**
     * Init hook action. Only call one time 
     * @param eventBus 
     */
    private async initAction(eventBus: EventBus) {
        this.execution = Execution.NOOP;

        // We subscribe to registed message 
        eventBus.subscribe(this.getMessageName(), (message) => {
            this.execution = Execution.Contionue;
        });
    }

    private async executeAction(workflow: Workflow, mailService: MailService, eventBus: EventBus) {
    }

    /**
     * Build MessageStartEvent object from bpmn json object
     * @param bpmnItem 
     * @returns 
     */
    public static build(bpmnItem: any) {
        const processItem = new MessageStartEvent();
        const id = ProcessItem.buildId(bpmnItem);
        const name = ProcessItem.buildName(bpmnItem);
        const messageName = bpmnItem.$['appconda:messageName'];

        processItem
            .setId(id)
            .setName(name)
            .setMessageName(messageName)

        processItem.validateMetadata();

        return processItem;
    }

    /**
     * validate object
     */
    public validateMetadata(): void {
        const textValidator: Text = new Text(255);
        if (!textValidator.isValid(this.messageName)) {
            // Console.error(`messageName not found for ${this.getName()}`);
            throw new Exception(`messageName not found for ${this.getName()}`)
        }
    }

}