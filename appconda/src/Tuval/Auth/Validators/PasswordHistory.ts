
import { Auth } from "../Auth";
import { Password } from "./Password";


/**
 * PasswordHistory.
 *
 * Validates user password string against a history of passwords
 */
export class PasswordHistory extends Password {
    protected history: string[];
    protected algo: string;
    protected algoOptions: Record<string, any>;

    constructor(history: string[], algo: string, algoOptions: Record<string, any> = {}) {
        super();
        this.history = history;
        this.algo = algo;
        this.algoOptions = algoOptions;
    }

    /**
     * Get Description.
     *
     * Returns validator description
     *
     * @return string
     */
    getDescription(): string {
        return 'Password shouldn\'t be in the history.';
    }

    /**
     * Is valid.
     *
     * @param value
     *
     * @return boolean
     */
    //@ts-ignore
    async isValid(value: any): Promise<boolean> {
        for (const hash of this.history) {
            if (hash && await Auth.passwordVerify(value, hash, this.algo, this.algoOptions)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Is array
     *
     * Function will return true if object is array.
     *
     * @return boolean
     */
    isArray(): boolean {
        return false;
    }

    /**
     * Get Type
     *
     * Returns validator type.
     *
     * @return string
     */
    getType(): string {
        return 'string';
    }
}
