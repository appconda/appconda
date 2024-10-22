import { Console } from "../../../../Tuval/CLI";
import { Document, Text } from "../../../../Tuval/Core";
import { Log } from "../../../../Tuval/Logger";
import { Action } from "../../../../Tuval/Platform/Action";
import { Message } from "../../../../Tuval/Queue";

export class GetTaskStatus extends Action {
  public static readonly NAME = "GetTaskStatus";

  constructor() {
    super();
    this.desc("Get task status")
      .param("projectId", null, new Text(255), 'ID of project', false)
      .param("appletId", null, new Text(255), 'ID of applet', false)
      .param("taskId", null, new Text(255), 'Task name of creating.', false)
      .callback(this.action);
    // .callback((message: Message, dbForConsole: Database, queueForMails: Mail, queueForEvents: Event, queueForFunctions: Func, log: Log) => this.action(message, dbForConsole, queueForMails, queueForEvents, queueForFunctions, log));
  }

  public async action(project: Document, database: Document, taskId: string): Promise<void> {
    Console.log('task status get');
  }
}
