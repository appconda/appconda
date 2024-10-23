import { Console } from "../../../CLI";
import { EventBus } from "../../../EventBus/EventBus";
import { MessageStartEvent } from "../../Events/Start/Message/Event";
import { Execution, ProcessItem } from "../../ProcessItem";
import { EventMessages } from "./EventMessages";



export class TaskCreatedStartEvent extends MessageStartEvent {

    constructor() {
        super();
        
        this.desc('Triggered event when new task created in appconda.');

        this.init()
            .inject('eventBus')
            .action(async (eventBus: EventBus) => {

                this.execution = Execution.NOOP; // No operation until message received
                
                // We subscribe to registed message 
                eventBus.subscribe(EventMessages.Tasks.TaskCreated, (message) => {
                    this.execution = Execution.Contionue; // Resume the process
                });
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

    private execute() {
       // We do nothing in execution
    }
}