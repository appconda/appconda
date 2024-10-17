import { Console } from "../../../../Tuval/CLI";
import { Document, Text } from "../../../../Tuval/Core";
import { Log } from "../../../../Tuval/Logger";
import { Action } from "../../../../Tuval/Platform/Action";
import { Message } from "../../../../Tuval/Queue";


export class CreateDatabase extends Action {
    public static readonly NAME = 'CreateDatabase';


    constructor() {
        super();
        this
            .name('CreateDatabase')
            .desc('Create Database In Project')
            .inject('project')
            /*       .inject('message')
                  .inject('dbForConsole')
                  .inject('queueForMails')
                  .inject('queueForEvents')
                  .inject('queueForFunctions') */
            .param('name','', new Text(255))
            .callback(this.action)
        // .callback((message: Message, dbForConsole: Database, queueForMails: Mail, queueForEvents: Event, queueForFunctions: Func, log: Log) => this.action(message, dbForConsole, queueForMails, queueForEvents, queueForFunctions, log));
    }

    public async action(project: Document, name: string): Promise<void> {
        Console.log(project);
        Console.info('DB Created.' + name)
    }
}
