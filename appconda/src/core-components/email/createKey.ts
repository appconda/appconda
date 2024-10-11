import { BaseComponent } from "../../BaseComponent";
import { BaseService } from "../../BaseService";
import { Container } from "../../Container";
import { Services } from "../../Services";
import EmailService, { EmailServiceAccessObject } from "../../Services/EmailService";
import QDMSService from "../../Services/QdmsService";

export default class CreateAccessKey extends BaseComponent {

    get serviceName() {
        return Services.Email;
    }

    get displayName(): string {
        return 'Create Access Key'
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
        return 'com.realmocean.email.create-key'
    }

    public buildConfig() {
        return {
            "smtpServer": {
                "required": true
            },
            "smtpPort": {
                "required": true
            },
            "username": {
                "required": true
            },
            "password": {
                "required": true
            },
            "tls": {
                "required": true
            }
        }
    }

    public async build(accessObject: EmailServiceAccessObject) {
       
        const qdmsService: EmailService = this.services.get(Services.Email);
        const key = qdmsService.createKey(accessObject);
        return {
            accessKey: key
        };
    }
}