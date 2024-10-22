import { EventMessages } from "./EventMessages";
import { TaskCreatedStartEvent } from "./TaskCreatedStartEvent";

export class  EventRegistry  {
    static [EventMessages.Tasks.TaskCreated](): any  {
        return TaskCreatedStartEvent;
    }
}
