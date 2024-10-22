import { Exception, Text } from "../../../../Core";
import { MessageEndEvent } from "./Event";


export class Validator {
    public isValid(messageEndEvent: MessageEndEvent): void {
        const textValidator: Text = new Text(255);
        if (!textValidator.isValid(messageEndEvent.getMessageName())) {
            // Console.error(`messageName not found for ${this.getName()}`);
            throw new Exception(`message not found for ${messageEndEvent.getName()}`)
        }
    }
}