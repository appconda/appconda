
import { Module } from "../../Tuval/Platform/Module";
import { Tasks } from "../Agents/Tasks";
import { Workers } from "../Agents/Workers";
import { Agent } from "../../Tuval/Platform/Agent";
import { DatabaseService } from "../Services/database-service/DatabaseService";


export class Core extends Module {
    constructor() {
        super();
        this.addService(Agent.TYPE_TASK, new Tasks());
        this.addService(Agent.TYPE_WORKER, new Workers());
        this.addService(Agent.TYPE_SERVICE, new DatabaseService());
    }
}

export class ServiceModule extends Module {
    constructor() {
        super();
        this.addService(Agent.TYPE_SERVICE, new DatabaseService());
    }
}