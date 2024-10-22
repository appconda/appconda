

import { Execution, ProcessItem } from "../ProcessItem";
import { Gateway } from "./Gateway";


export class ExclusiveGateway extends Gateway {

    constructor() {
        super()
        this
            .desc('Start event for workflow')
            .action()
            .inject('workflow')
            .inject('mail-service')
            .action(this.execute.bind(this))
    }

    private execute() {
        return Execution.Contionue;

    }


  
    protected takeGatewayOutgoing(identity: string) {
        let outgoing = this.takeOutgoingSteps(this.getOutgoings(), identity);
    
        return outgoing;
      }

      public static build(bpmnItem: any) {
        const processItem = new ExclusiveGateway();
        const id = ProcessItem.buildId(bpmnItem);
        const name = ProcessItem.buildName(bpmnItem);
        const metadata = ProcessItem.buildMetadata(bpmnItem);

        processItem
            .setId(id)
            .setName(name)

            return processItem;
    }



}