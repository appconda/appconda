import { Status } from "../../Context/Status";
import { Token } from "../../Context/Token";
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

        if (this.context && this.token) {
            const tokens = this.context.getTokens(this.getId());

            if (this.getIncomings().length > 1) {
                tokens.forEach((t) => {
                    t.locked = true;
                    t.status = Status.Terminated;
                });

                this.token = Token.build({ history: [this.token.state.clone()] });
                this.context.addToken(this.token);
            }
        }


        const outgoingSteps = [];
        const outgoings: SequenceFlow[] = this.takeOutgoingSteps(this.getOutgoings(), identity) as any;

        if (this.outgoings.length === 1) {
            outgoingSteps.push(this.outgoings[0].target);
        } else {
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
        }

        return outgoingSteps;


    }
}