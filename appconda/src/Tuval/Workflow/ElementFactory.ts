import { Builder as MessageStartEventBuilder } from "./Events/Start/Message/Builder";
import { Builder as TimerStartEventBuilder} from "./Events/Start/Timer/Builder";


export class ElementFactory {

    private static isMessageEvent(bpmnItem: any) {
        if (bpmnItem['bpmn:messageEventDefinition'] != null) {
            return true;
        }
    }

    private static isTimerEvent(bpmnItem: any) {
        if (bpmnItem['bpmn:timerEventDefinition'] != null) {
            return true;
        }
    }

    public static build(key: string, bpmnItem: any) {
        switch (key) {
            case 'bpmn:startEvent':
                if (this.isMessageEvent(bpmnItem)) {
                    return MessageStartEventBuilder.build(bpmnItem);
                }
                if (this.isTimerEvent(bpmnItem)) {
                    return TimerStartEventBuilder.build(bpmnItem);
                }
                return StartEvent.build(bpmnItem);
            case 'bpmn:task':
                return Task.build(bpmnItem);
            case 'bpmn:sequenceFlow':
                return SequenceFlow.build(bpmnItem);
            case 'bpmn:endEvent':
                if (this.isMessageEvent(bpmnItem)) {
                    return MessageEndEvent.build(bpmnItem);
                }

                return EndEvent.build(bpmnItem);
            case 'bpmn:userTask':
                return UserTask.build(bpmnItem);
        }
    }
}