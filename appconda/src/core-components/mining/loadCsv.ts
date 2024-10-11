import { BaseComponent } from "../../BaseComponent";
import { BaseService } from "../../BaseService";
import { Container } from "../../Container";
import { Services } from "../../Services";
import MiningService from "../../Services/MiningService";
import QDMSService from "../../Services/QdmsService";

export default class LoadCsv extends BaseComponent {

    get serviceName() {
        return Services.Mining;
    }

    get displayName(): string {
        return 'Load Csv'
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
        return 'com.realmocean.mining.load-csv'
    }

    public buildConfig() {
        return {
            "csv": {
                "type": 'file',
                "multiline": true,
                "required": true
            }

        }
    }

    public async build({ csv }: { csv: string }) {

        const qdmsService: MiningService = this.services.get(Services.Mining);
        const logId = await qdmsService.loadCsv(csv);
        return {
            logId
        };
    }
}

