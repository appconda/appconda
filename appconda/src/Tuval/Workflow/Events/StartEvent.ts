
import MailService from "../../../Platform/Services/mail-service/MailService";
import { Console } from "../../CLI";
import { Execution, ProcessItem } from "../ProcessItem";
import { Workflow } from "../Workflow";


export class StartEvent extends ProcessItem {

    constructor() {
        super()
        this.desc('Start event for workflow');

        this.init()
            .action(() => {
                // Console.info('Start event going to execute.')
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

    private execute(workflow: Workflow, mailService: MailService) {

        console.info(`${this.getName()} executed.`)


        return Execution.Contionue;

    }

    public static build(bpmnItem: any) {
        const processItem = new StartEvent();
        const id = ProcessItem.buildId(bpmnItem);
        const name = ProcessItem.buildName(bpmnItem);
        const metadata = ProcessItem.buildMetadata(bpmnItem);

        processItem
            .setId(id)
            .setName(name)

            return processItem;
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