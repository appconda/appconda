import { BaseComponent } from "../../BaseComponent";
import { BaseService } from "../../BaseService";
import { Container } from "../../Container";
import { Services } from "../../Services";
import QDMSService from "../../Services/QdmsService";

export default class CreateAccessKey extends BaseComponent {

    get serviceName() {
        return Services.Qdms;
    }

    get displayName(): string {
        return 'Create Qdms Access Key'
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
        return 'com.realmocean.qdms.create-key'
    }

    public buildConfig() {
        return {
            "url": {
                "multiline": false,
                "required": true
            },
            "username": {
                "required": true
            },
            "password": {
                "required": true
            },

        }
    }

    public async build({ url, token }: { url: string, token: string }) {
       
        const qdmsService: QDMSService = this.services.get('qdms-service');
        const key = qdmsService.createKey({ url, token });
        return {
            accessKey: key
        };
    }
}