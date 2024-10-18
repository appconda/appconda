
import { Mail } from "../../../../Appconda/Event/Mail";
import { Console } from "../../../../Tuval/CLI";
import { Document, Text } from "../../../../Tuval/Core";
import { Log } from "../../../../Tuval/Logger";
import { Action } from "../../../../Tuval/Platform/Action";
import { Message } from "../../../../Tuval/Queue";

export class SendEmail extends Action {
  public static readonly NAME = "SendEmail";

  constructor() {
    super();
    this
    .desc("Send Email")
      .inject("queueForMails")
     
      .callback(this.action);
    // .callback((message: Message, dbForConsole: Database, queueForMails: Mail, queueForEvents: Event, queueForFunctions: Func, log: Log) => this.action(message, dbForConsole, queueForMails, queueForEvents, queueForFunctions, log));
  }

  public async action(queueForMails: Mail): Promise<void> {
    
    Console.info("Collection Created." + queueForMails);
  }
}
