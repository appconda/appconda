

import { Agent } from "../../Tuval/Platform/Agent";
import { ServiceModule } from "../../Tuval/Platform/ServiceModule";
import { Tasks } from "../Agents/Tasks";
import { Workers } from "../Agents/Workers";
import { TaskAppletAgent } from "../Applets/task-applet/TaskAppletAgent";
import { DatabaseServiceAgent } from "../Services/database-service/DatabaseServiceAgent";
import { MailServiceAgent } from "../Services/mail-service/MailServiceAgent";


export class ServiceCore extends ServiceModule {
    constructor() {
        super();
        this.addService(Agent.TYPE_SERVICE, new DatabaseServiceAgent());
        this.addService(Agent.TYPE_SERVICE, new MailServiceAgent());

        this.addService(Agent.TYPE_SERVICE, new TaskAppletAgent());
    }
}