import MailService from "../../../../Platform/Services/mail-service/MailService";
import { ProcessItem } from "../../ProcessItem";
import { Workflow, Execution } from "../../Workflow";


export class EndEvent extends ProcessItem {

    constructor() {
        super()
        this
            .desc('End event for process')
            .action()
            .inject('workflow')
            .inject('mail-service')
            .action(this.execute.bind(this))
    }

    private execute(workflow: Workflow, mailService: MailService) {
        mailService.send({
            smtp: 'sdf'
        });

        console.log(workflow);
        console.log('End event executed.')
        if (this.outgoings.length > 0) {
            return Execution.$continue(this.outgoings[0].getId());
        }
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
