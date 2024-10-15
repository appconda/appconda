import { Console } from "../../Tuval/CLI";
import { Action } from "../../Tuval/Platform/Action";

export class Version extends Action {
    public static getName(): string {
        return 'version';
    }

    constructor() {
        super();
        this.desc('Get the server version')
            .callback(() => {
                Console.log(process.env._APP_VERSION || 'UNKNOWN');
            });
    }
}