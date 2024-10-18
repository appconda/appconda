import { Agent } from "../../../Tuval/Platform/Agent";
import { CreateCollection } from "./Actions/CreateCollection";
import { CreateDatabase } from "./Actions/CreateDatabase";
import { ListDatabases } from "./Actions/ListDatabases";



export class DatabaseServiceAgent extends Agent {
    public static readonly NAME = 'com.appconda.service.database';

    constructor() {
        super();
        this.type = Agent.TYPE_SERVICE;
        this
            .addAction( new CreateDatabase())
            .addAction( new ListDatabases())
            .addAction(new CreateCollection())
    }

    public getName() : string {
        return DatabaseServiceAgent.NAME;
    }
}