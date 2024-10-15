import { Platform } from "../../Tuval/Platform/Platform";
import { Core } from "./Modules/Core";


export class Appconda extends Platform {
    constructor() {
        super(new Core());
    }
}