import { Module } from "../../Tuval/Platform/Module";
import { Tasks } from "../Agents/Tasks";
import { Workers } from "../Agents/Workers";


export class Core extends Module {
    constructor() {
        super();
        this.addService('tasks', new Tasks());
        this.addService('workers', new Workers());
    }
}