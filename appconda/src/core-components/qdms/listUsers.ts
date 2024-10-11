import { BaseComponent } from "../../BaseComponent";
import { BaseService } from "../../BaseService";
import { Container } from "../../Container";
import { Services } from "../../Services";
import QDMSService from "../../Services/QdmsService";



export default class ListUsers extends BaseComponent {
    

    get serviceName() {
        return Services.Qdms;
    }

    get displayName(): string {
        return 'List Users'
    }

    get groupName(): string {
        return 'Users'
    }
    get description(): string {
       return 'List Users'
    }
    get documentation(): string {
       return '';
    }

    public get uid() {
        return 'com.realmocean.qdms.list-users'
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