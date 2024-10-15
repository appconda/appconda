import { BaseService } from "../BaseService";
import { FlowExecuter } from "../modules/flow/FlowExecuter";


export default class FlowService extends BaseService {
  
    public get uid(): string {
        return 'com.realmocean.service.flow';
    }

    get displayName(): string {
        return 'Flow Service'
    }

    async executeFlow(flow: any) {
        const flowExecuter = new FlowExecuter(this.services);
        await flowExecuter.execute(flow);
    }
}

