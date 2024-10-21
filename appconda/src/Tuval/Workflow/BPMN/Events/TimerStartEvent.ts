
import MailService from "../../../../Platform/Services/mail-service/MailService";
import { Console } from "../../../CLI";
import { EventBus } from "../../../EventBus/EventBus";
import { Execution, ProcessItem } from "../../ProcessItem";
import { Workflow } from "../../Workflow";


export class TimerStartEvent extends ProcessItem {

    constructor() {
        super()
        this.desc('Start event for workflow');

        this.init()
        .action(()=> {
            Console.info('Timer start init.');
            this.execution = Execution.NOOP;
        })

        this.shutdown()
        .action(()=> {
            Console.success('Start event executed.')
        })

        this.error()
        .action(()=> {
            Console.error('Start event on error.')
        })


        this.action()
            .inject('workflow')
            .inject('mail-service')
            .inject('eventBus')
            .action(this.execute.bind(this))
    }

    private execute(workflow: Workflow, mailService: MailService, eventBus: EventBus) {
      Console.log('Timer waitin for timeout.');

      setTimeout(()=> {
        this.execution = Execution.Contionue;

        eventBus.publish('user_registered', 'User 123 has registered.')
        .then(() => console.log('Event published to Redis!'))
        .catch((err) => console.error('Error publishing event:', err));

      }, 5000)
      

    }

    /*  async run(path: Path, flow: Workflow) {
 
         await fetch('https://dummyjson.com/products')
             .then(res => res.json())
             .then(data => {
                 const { products } = data;
                 flow.state.vars.products = products;
             });
 
         console.log('Start Event executed.')
         return Execution.$continue(this.nextStep);
     } */

}