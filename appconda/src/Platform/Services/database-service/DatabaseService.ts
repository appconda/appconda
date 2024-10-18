import { Service } from "../Service";
import { CreateCollection } from "./Actions/CreateCollection";
import { CreateDatabase } from "./Actions/CreateDatabase";
import { ListDatabases } from "./Actions/ListDatabases";
import { DatabaseServiceAgent } from "./DatabaseServiceAgent";


export default class DatabaseService extends Service {

  public init() {
    
  }

  public create(projectId: string, name: string) {
    const action = this.getAction(CreateDatabase.NAME);
    action.call({
      project: projectId,
      name: name,
    });
  }
  public createCollection(projectId: string, databaseId: string, name: string) {
    const action = this.getAction(CreateCollection.NAME);
    action.call({
      project: projectId,
      database: databaseId,
      name: name,
    });
  }

  public list(projectId: string) {
    const action = this.getAction(ListDatabases.NAME);
    action.call({
      project: projectId,
    });
  }
}
