
import { Action } from "../../Decarators/Action";
import { Agent } from "../../Decarators/Agent";
import { Service } from "../../Services/Service";
import { CreateTask } from "./Actions/CreateTask";
import { TaskAppletAgent } from "./TaskAppletAgent";



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

@Agent(TaskAppletAgent)
export default class TaskApplet extends Service {

  @Action(CreateTask)
  public create(payload: Payloads.Create) { }

}
