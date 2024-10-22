import { Exception, Integer, Text } from "../../../../Core";
import { TimerStartEvent } from "./Event";


export class Validator {
    public isValid(timerStartEvent: TimerStartEvent): void {
        if (timerStartEvent.getTimeout() == null) {
            throw new Exception(`timeout not found for ${timerStartEvent.getName()}`);
        }

        const textValidator: Integer = new Integer();
        if (!textValidator.isValid(timerStartEvent.getTimeout())) {
            // Console.error(`messageName not found for ${this.getName()}`);
            throw new Exception(`timeout not valid format in ${timerStartEvent.getName()}`)
        }
    }
}