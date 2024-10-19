import { Audit } from "../../Tuval/Audit";
import { Document, Exception } from "../../Tuval/Core";
import { Database } from "../../Tuval/Database";
import { Action } from "../../Tuval/Platform/Action";
import { Message } from "../../Tuval/Queue";

export class Workflow extends Action {
    public static getName(): string {
        return 'workflow';
    }

    constructor() {
        super();
        this.desc('Workflow Engine Worker')
            .inject('message')
            //.inject('dbForProject')
            
            .callback(this.action.bind(this));
    }

    public async action(): Promise<void> {
      
    }
}