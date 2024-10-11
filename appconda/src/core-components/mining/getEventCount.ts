import { BaseComponent } from "../../BaseComponent";
import { BaseService } from "../../BaseService";
import { Container } from "../../Container";
import { Services } from "../../Services";
import MiningService from "../../Services/MiningService";
import QDMSService from "../../Services/QdmsService";

export default class GetEventCount extends BaseComponent {

    get serviceName() {
        return Services.Mining;
    }

    get displayName(): string {
        return 'Get Event Count'
    }

    get groupName(): string {
        return 'Create Access Key'
    }
    get description(): string {
        return 'Create Access Key'
    }
    get documentation(): string {
        return '';
    }

    public get uid() {
        return 'com.realmocean.mining.get-event-count'
    }

    public buildConfig() {
        return {
            "logId": {
                "type": 'string',
                "required": true
            }

        }
    }

    public async build({ logId }: { logId: string }) {

        const qdmsService: MiningService = this.services.get(Services.Mining);
        const result = await qdmsService.getEventCount(logId);
        return result;
    }
}

