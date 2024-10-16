import { Console } from "../../../../Tuval/CLI";
import { Text } from "../../../../Tuval/Core";
import { Log } from "../../../../Tuval/Logger";
import { Action } from "../../../../Tuval/Platform/Action";
import { Message } from "../../../../Tuval/Queue";


export class CreateDatabase extends Action {
    public static readonly NAME = 'CreateDatabase';
    public static getName(): string {
        return 'Create Database';
    }

    constructor() {
        super();
        this
            .name('CreateDatabase')
            .desc('Create Database In Project')
            /*       .inject('message')
                  .inject('dbForConsole')
                  .inject('queueForMails')
                  .inject('queueForEvents')
                  .inject('queueForFunctions') */
            .param('name','', new Text(255))
        // .callback((message: Message, dbForConsole: Database, queueForMails: Mail, queueForEvents: Event, queueForFunctions: Func, log: Log) => this.action(message, dbForConsole, queueForMails, queueForEvents, queueForFunctions, log));
    }

    public async action(log: Log): Promise<void> {
        Console.info('DB Created.')
    }
}
