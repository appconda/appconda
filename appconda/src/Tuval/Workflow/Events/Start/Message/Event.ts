import { Console } from "../../../../CLI";
import { EventBus } from "../../../../EventBus/EventBus";
import { Execution, ProcessItem } from "../../../ProcessItem";




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

    private async executeAction() {
    }

   


}