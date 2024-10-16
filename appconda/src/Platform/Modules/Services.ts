

import { Agent } from "../../Tuval/Platform/Agent";
import { ServiceModule } from "../../Tuval/Platform/ServiceModule";
import { Tasks } from "../Agents/Tasks";
import { Workers } from "../Agents/Workers";
import { DatabaseService } from "../Services/database-service/DatabaseService";


export class ServiceCore extends ServiceModule {
    constructor() {
        super();
        this.addService(Agent.TYPE_SERVICE, new DatabaseService());
    }
}