import { GoOutInterface, WorkflowStep } from "../../Step";


export interface TakeOutgoingInterface {
    identity: string;
    pause?: boolean | string;
}

export class Gateway extends WorkflowStep {

    constructor() {
        super()
    }




    protected takeGatewayOutgoing(identity?: string) {
        let outgoing = this.takeOutgoingSteps(this.getOutgoings(), identity);


        return outgoing;
    }


    public takeOutgoing(identity: string, options?: { pause: boolean | string }) {
        if (!this.getOutgoings() || !this.getOutgoings()?.length) {
            return;
        }

        const outgoing = this.takeGatewayOutgoing(identity);

        if (!outgoing) return;

        this.goOut(outgoing.map((out) => ({ activity: out, pause: options?.pause })));
    }

    public takeOutgoings(options: TakeOutgoingInterface[]) {
        if (!this.outgoing || !this.outgoing?.length) return;

        const outgoing: { [id: string]: GoOutInterface } = {};

        for (const option of options) {
            const { identity, pause } = option;
            const activity = this.takeGatewayOutgoing(identity)?.pop();

            if (activity) {
                outgoing[activity.getId()] = { activity, pause };
            }
        }

        this.goOut(Object.values(outgoing));
    }


}