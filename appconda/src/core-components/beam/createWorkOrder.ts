import { BaseComponent } from "../../BaseComponent";
import { BaseService } from "../../BaseService";
import { Container } from "../../Container";
import { Services } from "../../Services";
import QDMSService from "../../Services/QdmsService";



export default class CreateWorkOrder extends BaseComponent {
    

    get serviceName() {
        return Services.Beam;
    }

    get displayName(): string {
        return 'Create Work Order'
    }

    get groupName(): string {
        return 'Actions'
    }
    get description(): string {
       return 'Create a work order.'
    }
    get documentation(): string {
       return '';
    }

    public get uid() {
        return 'com.realmocean.beam.create-work-order'
    }

    public buildConfig() {
        return {
            "key":
            {
                "multiline": false,
                "required": true
            }
        }
    }

    public async build(key: string) {
        const qdmsService: QDMSService = this.services.get('qdms-service');
        const users = await qdmsService.getUsers(key);
        return users;
    }
}