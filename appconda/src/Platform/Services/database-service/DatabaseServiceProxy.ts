import { Service } from "../Service";
import { CreateDatabase } from "./Actions/CreateDatabase";
import { DatabaseService } from "./DatabaseService";



export default class DatabaseServiceProxy extends Service {

    public get uid(): string {
        return DatabaseService.NAME;
    }

    public init() {
        const a = '';
       // this.createDatabase();
    }

    public createDatabase() {
        const action = this.getAction(CreateDatabase.NAME);
        action.call({
            project: '670ccd2600045e926e17',
            name: 'sdfdsf'
        })
    }
}