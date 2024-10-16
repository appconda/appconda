import { Agent } from "../../../Tuval/Platform/Agent";
import { CreateDatabase } from "./Actions/CreateDatabase";



export class DatabaseService extends Agent {
    public static readonly NAME = 'com.appconda.service.database';

    constructor() {
        super();
        this.type = Agent.TYPE_SERVICE;
        this
            .addAction(CreateDatabase.getName(), new CreateDatabase())
    }

    public getName() : string {
        return DatabaseService.NAME;
    }
}