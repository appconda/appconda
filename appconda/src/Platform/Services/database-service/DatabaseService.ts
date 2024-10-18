
import { Action } from "../../Decarators/Action";
import { Agent } from "../../Decarators/Agent";
import { Service } from "../Service";
import { CreateCollection } from "./Actions/CreateCollection";
import { CreateDatabase } from "./Actions/CreateDatabase";
import { ListDatabases } from "./Actions/ListDatabases";
import { DatabaseServiceAgent } from "./DatabaseServiceAgent";


export namespace Payloads {
  export interface Create {
    project: string;
    name: string;
  }

  export interface CreateCollection {
    project: string;
    name: string;
  }

  export interface ListDatabases {
    project: string;
    name: string;
  }
}

@Agent(DatabaseServiceAgent)
export default class DatabaseService extends Service {

  @Action(CreateDatabase)
  public create(payload: Payloads.Create) { }

  @Action(CreateCollection)
  public createCollection(payload: Payloads.CreateCollection) { }

  @Action(ListDatabases)
  public list(payload: Payloads.ListDatabases) { }
}
