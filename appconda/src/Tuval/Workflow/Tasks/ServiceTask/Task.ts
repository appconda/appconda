import { Task } from "../$/Task";
import { AppcondaServicePlatform } from "../../../../Platform/Appconda";
import { Execution, ProcessItem } from "../../ProcessItem";



export class ServiceTask extends Task {

    private _service: string;
    private _action: string;
    private _payload: object;

    public getService(): string {
        return this._service;
    }
    public setService(valiue: string): this {
        this._service = valiue;
        return this;
    }


    public getServiceAction(): string {
        return this._action;
    }

    public setServiceAction(valiue: string): this {
        this._action = valiue;
        return this;
    }


    public getPayload(): object {
        return this._payload;
    }

    public setPayload(valiue: object): this {
        this._payload = valiue;
        return this;
    }

    constructor() {
        super()
        this
            .desc('Task event for workflow')
            .action()
            .inject('service-platform')
            .action(this.execute.bind(this))
    }

    private async execute(servicePlatform: AppcondaServicePlatform) {

        const action = servicePlatform.getServiceAction( this.getService(),this.getServiceAction());
        await action.call(this.getPayload());
       
        return Execution.Contionue;


    }


}