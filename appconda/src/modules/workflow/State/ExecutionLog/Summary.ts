import { Describable } from "./Describable";

export class Summary implements Describable {
    private description: string;

    constructor(description: string) {
        this.description = description;
    }

    public getDescription(): string {
        return this.description;
    }
}
