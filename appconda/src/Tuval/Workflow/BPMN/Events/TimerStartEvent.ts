
import MailService from "../../../../Platform/Services/mail-service/MailService";
import { Console } from "../../../CLI";
import { Exception, Integer } from "../../../Core";
import { EventBus } from "../../../EventBus/EventBus";
import { Execution, ProcessItem } from "../../ProcessItem";
import { Workflow } from "../../Workflow";


export class TimerStartEvent extends ProcessItem {

    private timeout: number;

    public setTimeout(value: number) {
        this.timeout = value;
        return this;
    }

    public getTimeout(): number {
        return this.timeout;
    }

    constructor() {
        super()
        this.desc('Start event for workflow');

        this.init()
            .inject('eventBus')
            .action((eventBus: EventBus) => {
                Console.info('Timer start init.');

                //Waiting Timeout for continue
                this.execution = Execution.NOOP;

                setTimeout(() => {
                    this.execution = Execution.Contionue;

                    eventBus.publish('user_registered', 'User 123 has registered.')
                        .then(() => console.log('Event published to Redis!'))
                        .catch((err) => console.error('Error publishing event:', err));

                }, this.getTimeout())
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
        const timerStartEvent = new TimerStartEvent();
        const id = ProcessItem.buildId(bpmnItem);
        const name = ProcessItem.buildName(bpmnItem);
        const metadata = ProcessItem.buildMetadata(bpmnItem);

        timerStartEvent
            .setId(id)
            .setName(name)
            .setTimeout((metadata as any).timeout ?? 1000)

            timerStartEvent.validateMetadata();

            return timerStartEvent;
    }

    public validateMetadata(): void {
        if (this.timeout == null) {
            throw new Exception(`timeout not found for ${this.getName()}`);
        }

        const textValidator: Integer = new Integer();
        if (!textValidator.isValid(this.timeout)) {
            // Console.error(`messageName not found for ${this.getName()}`);
            throw new Exception(`timeout not valid format in ${this.getName()}`)
        }
    }

}