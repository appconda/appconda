import { Response } from "../../Response";
import { User } from "./User";


export class Account extends User {
    constructor() {
        super();

        this
            .removeRule('password')
            .removeRule('hash')
            .removeRule('mfaRecoveryCodes')
            .removeRule('hashOptions');
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Account';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_ACCOUNT;
    }
}
