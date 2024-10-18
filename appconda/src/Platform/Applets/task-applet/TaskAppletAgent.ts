import { Agent } from "../../../Tuval/Platform/Agent";
import { CreateTask } from "./Actions/CreateTask";




export class TaskAppletAgent extends Agent {
    public static readonly NAME = 'com.appconda.applet.task';

    constructor() {
        super();
        this.type = Agent.TYPE_SERVICE;
        this
            .addAction( new CreateTask())
    }

    public getName() : string {
        return TaskAppletAgent.NAME;
    }
}