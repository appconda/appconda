import { SequenceFlow } from "../../Flows/SequenceFlow/Flow";
import { Execution, ProcessItem } from "../../ProcessItem";
import { Gateway } from "../Gateway";




export class ExclusiveGateway extends Gateway {

    private defaultRef: string;

    public get default(): SequenceFlow {
        return this.getProcess().getStepById(this.defaultRef);
    }


    public getDefaultRef(): string {
        return this.defaultRef;
    }
    public setDefault(defaultRef: string) {
        this.defaultRef = defaultRef;
    }

    constructor() {
        super()
        this
            .desc('SequenceFlow')
            .action()
            .action(this.execute.bind(this))
    }

    private execute() {
        return Execution.Contionue;
    }

    protected takeGatewayOutgoing(identity: string): ProcessItem[] {
        const outgoingSteps = [];
        const outgoings: SequenceFlow[] = this.takeOutgoingSteps(this.getOutgoings(), identity) as any;
      
        for (const flow of this.outgoings) {
            if (flow.hasExpression()) {
                const result = flow.evaluateExpression();
                if (result) {
                    outgoingSteps.push(flow.target);
                    break;
                }
            }
        }

        if (outgoingSteps.length === 0 && this.default != null) {
            outgoingSteps.push(this.default.target);
        }

        return outgoingSteps;


    }
}