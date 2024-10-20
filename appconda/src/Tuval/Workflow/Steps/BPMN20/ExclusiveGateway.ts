
import { Execution } from "../../Workflow";
import { Gateway } from "./Gateway";


export class ExclusiveGateway extends Gateway {

    constructor() {
        super()
        this
            .desc('Start event for workflow')
            .inject('workflow')
            .inject('mail-service')
            .callback(this.action.bind(this))
    }

    private action() {
        return Execution.$continue('');

    }


  
    protected takeGatewayOutgoing(identity: string) {
        let outgoing = this.takeOutgoingSteps(this.getOutgoings(), identity);
    
        return outgoing;
      }



}