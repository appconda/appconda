import { EventRegistry } from "../../../Extensions/Events/EventRegistry";
import { TimerStartEvent } from "./Event";
import { Validator } from "./Validator";


export class Builder {

    /**
     * Build MessageStartEvent object from bpmn json object
     * @param bpmnItem 
     * @returns 
     */
    public static build(bpmnItem: any) {

        const timerStartEvent = new TimerStartEvent();
        const id = bpmnItem.$.id;
        const name = bpmnItem.$.name;
        const timeout = bpmnItem.$['appconda:timeout'];

        timerStartEvent
            .setId(id)
            .setName(name)
            .setTimeout(timeout ?? 1000)

        timerStartEvent.validateMetadata();

        const validator = new Validator();
        validator.isValid(timerStartEvent);

        return timerStartEvent;
    }



}