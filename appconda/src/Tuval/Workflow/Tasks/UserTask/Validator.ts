import { Exception, Text } from "../../../Core";
import { UserTask } from "./Task";





export class Validator {
    public isValid(userTask: UserTask): void {
        const textValidator: Text = new Text(255);
        if (!textValidator.isValid(userTask.getUserId())) {
            // Console.error(`messageName not found for ${this.getName()}`);
            throw new Exception(`User Id not found for ${userTask.getName()}`)
        }
    }
}