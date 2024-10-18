import { Agent } from "../../../Tuval/Platform/Agent";
import { SendEmail } from "./Actions/SendEmail";

export class MailServiceAgent extends Agent {
    public static readonly NAME = 'com.appconda.agent.mail';

    constructor() {
        super();
        this.type = Agent.TYPE_SERVICE;
        this
            .addAction( new SendEmail())
    }

    public getName() : string {
        return MailServiceAgent.NAME;
    }
}