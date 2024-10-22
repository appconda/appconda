import { Agent } from "../../../Tuval/Platform/Agent";
import { CreateTask } from "./Actions/CreateTask";
import { GetTaskStatus } from "./Actions/GetTaskStatus";




export class TaskAppletAgent extends Agent {
    public static readonly NAME = 'com.appconda.applet.task';

    constructor() {
        super();
        this.type = Agent.TYPE_SERVICE;
        this
            .addAction( new CreateTask())
            .addAction( new GetTaskStatus())
    }

    public getName() : string {
        return TaskAppletAgent.NAME;
    }
}