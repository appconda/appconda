import { EventRegistry } from "../../../Extensions/Events/EventRegistry";
import { MessageStartEvent } from "./Event";
import { Validator } from "./Validator";

export interface MessageStartEventMetadataType {
    messageName: string;
}

export class Builder {

    /**
     * Build MessageStartEvent object from bpmn json object
     * @param bpmnItem 
     * @returns 
     */
    public static build(bpmnItem: any) {

        const id = bpmnItem.$.id;
        const name = bpmnItem.$.name;
        const message = bpmnItem.$['appconda:message'];
        const eventType = EventRegistry[message]() ?? MessageStartEvent;
        const processItem: any = new eventType();

        processItem
            .setId(id)
            .setName(name)
            .setMessageName(message);

        const validator = new Validator();
        validator.isValid(processItem);

        processItem.validateMetadata();

        return processItem;
    }



}