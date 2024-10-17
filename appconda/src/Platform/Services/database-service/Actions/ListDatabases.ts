import { Console } from "../../../../Tuval/CLI";
import { Document, Text } from "../../../../Tuval/Core";
import { Log } from "../../../../Tuval/Logger";
import { Action } from "../../../../Tuval/Platform/Action";
import { Message } from "../../../../Tuval/Queue";

export class ListDatabases extends Action {
  public static readonly NAME = "ListDatabases";


  constructor() {
    super();
    this.desc("List Databases")
      .inject("project")
     // .param("name", "Collection Name", new Text(255))
      .callback(this.action);
    // .callback((message: Message, dbForConsole: Database, queueForMails: Mail, queueForEvents: Event, queueForFunctions: Func, log: Log) => this.action(message, dbForConsole, queueForMails, queueForEvents, queueForFunctions, log));
  }

  public async action(project: Document, name: string): Promise<void> {
    Console.log(project);
    Console.info("Collection Created." + name);
  }
}
