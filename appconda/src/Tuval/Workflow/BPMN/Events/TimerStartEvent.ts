
import MailService from "../../../../Platform/Services/mail-service/MailService";
import { Console } from "../../../CLI";
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
            .action(this.execute.bind(this))
    }

    private execute(workflow: Workflow, mailService: MailService) {
      Console.log('Timer waitin for timeout.');

      setTimeout(()=> {
        this.execution = Execution.Contionue;
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