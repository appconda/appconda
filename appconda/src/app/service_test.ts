import { Appconda, AppcondaServicePlatform } from "../Platform/Appconda";
import { CreateDatabase } from "../Platform/Services/database-service/Actions/CreateDatabase";
import { DatabaseService } from "../Platform/Services/database-service/DatabaseService";
import { Console } from "../Tuval/CLI";
import { Agent } from "../Tuval/Platform/Agent";
import { register } from "./init";


const start = async () => {
    const pools = register.get('pools');

    const workerName = 'mails';

    const platform = new AppcondaServicePlatform();

    try {
        platform.init(Agent.TYPE_SERVICE);
        platform.start();
    } catch (e) {
        Console.error(`${e.message}, File: ${e.file}, Line: ${e.line}`);
    }

    const action = platform.getServiceAction(DatabaseService.NAME, CreateDatabase.NAME);

    action.call({
        name: 'test'
    })

    /*  action.workerStart()
         .action(() => {
             Console.info(`Service ${workerName} started`);
         });
 
         action.shutdown()
         .action(() => {
             Console.info(`Service ${workerName} shutdown`);
         }); */

    // action.start();

   

}

start();
