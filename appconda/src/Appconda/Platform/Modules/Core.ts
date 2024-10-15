import { Module } from "../../../Tuval/Platform/Module";
import { Tasks } from "../Services/Tasks";
import { Workers } from "../Services/Workers";


export class Core extends Module {
    constructor() {
        super();
        this.addService('tasks', new Tasks());
        this.addService('workers', new Workers());
    }
}