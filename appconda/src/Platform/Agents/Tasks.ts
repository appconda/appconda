import { Agent } from "../../Tuval/Platform/Agent";
import { Doctor } from "../Tasks/Doctor";
import { Install } from "../Tasks/Install";
import { Maintenance } from "../Tasks/Maintenance";
import { Migrate } from "../Tasks/Migrate";
import { QueueCount } from "../Tasks/QueueCount";
import { QueueRetry } from "../Tasks/QueueRetry";
import { ScheduleExecutions } from "../Tasks/ScheduleExecutions";
import { ScheduleFunctions } from "../Tasks/ScheduleFunctions";
import { ScheduleMessages } from "../Tasks/ScheduleMessages";
import { Specs } from "../Tasks/Specs";
import { SSL } from "../Tasks/SSL";
import { Test } from "../Tasks/Test";
import { Upgrade } from "../Tasks/Upgrade";
import { Vars } from "../Tasks/Vars";
import { Version } from "../Tasks/Version";
import { WorkflowEngine } from "../Tasks/WorkflowEngine";


export class Tasks extends Agent {
    constructor() {
        super();
        this.type = Agent.TYPE_TASK;
        this
            .addAction(Doctor.getName(), new Doctor())
            .addAction(Install.getName(), new Install())
            .addAction(Maintenance.getName(), new Maintenance())
            .addAction(Migrate.getName(), new Migrate())
            .addAction(QueueCount.getName(), new QueueCount())
            .addAction(QueueRetry.getName(), new QueueRetry())
            //.addAction(SDKs.getName(), new SDKs())
            .addAction(SSL.getName(), new SSL())
            .addAction(ScheduleFunctions.getName(), new ScheduleFunctions())
            .addAction(ScheduleExecutions.getName(), new ScheduleExecutions())
            .addAction(ScheduleMessages.getName(), new ScheduleMessages())
            .addAction(Specs.getName(), new Specs())
            .addAction(Upgrade.getName(), new Upgrade())
            .addAction(Vars.getName(), new Vars())
            .addAction(Version.getName(), new Version())
            .addAction(Test.getName(), new Test())
            .addAction(WorkflowEngine.getName(), new WorkflowEngine())
    }
}