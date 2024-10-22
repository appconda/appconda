
import { Action } from "../../Decarators/Action";
import { Agent } from "../../Decarators/Agent";
import { Service } from "../../Services/Service";
import { CreateTask } from "./Actions/CreateTask";
import { GetTaskStatus } from "./Actions/GetTaskStatus";
import { TaskAppletAgent } from "./TaskAppletAgent";



export namespace Payloads {
  export interface Create {
    projectId: string;
    appletId: string;
    name: string;
  }

  export interface CreateCollection {
    projectId: string;
    name: string;
  }

  export interface ListDatabases {
    projectId: string;
    name: string;
  }

  export interface GetTaskStatus {
    projectId: string;
    appletId: string;
    taskId: string;
  }
}

@Agent(TaskAppletAgent)
export default class TaskApplet extends Service {

  @Action(CreateTask)
  public create(payload: Payloads.Create) { }

  @Action(GetTaskStatus)
  public getTaskStatus(payload: Payloads.GetTaskStatus) { }

}
