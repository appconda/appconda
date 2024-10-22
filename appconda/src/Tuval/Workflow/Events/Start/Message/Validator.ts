import { Exception, Text } from "../../../../Core";
import { MessageStartEvent } from "./Event";


export class Validator {
    public isValid(messageStartEvent: MessageStartEvent): void {
        const textValidator: Text = new Text(255);
        if (!textValidator.isValid(messageStartEvent.getMessageName())) {
            throw new Exception(`messageName not found for ${messageStartEvent.getName()}`)
        }
    }
}