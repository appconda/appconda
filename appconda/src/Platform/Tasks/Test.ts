import { Action } from "../../Tuval/Platform/Action";
import DatabaseServiceProxy from "../Services/database-service/DatabaseServiceProxy";

export class Test extends Action {
    public static getName(): string {
        return 'test';
    }

    constructor() {
        super();
        this
        .desc('List all the server environment variables')
        .inject('database-service')
            .callback( this.action);
    }

    public action(databaseService: DatabaseServiceProxy): void {
        console.log(databaseService);
    }
}