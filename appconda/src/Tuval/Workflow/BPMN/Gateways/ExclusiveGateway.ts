

import { Execution } from "../../ProcessItem";
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



}