import { BaseComponent } from "../../BaseComponent";
import { BaseService } from "../../BaseService";
import { Container } from "../../Container";
import { Services } from "../../Services";
import EmailService from "../../Services/EmailService";
import MiningService from "../../Services/MiningService";
import QDMSService from "../../Services/QdmsService";

export default class SendEmail extends BaseComponent {

    get serviceName() {
        return Services.Email;
    }

    get displayName(): string {
        return 'Send Email'
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
        return 'com.realmocean.email.send'
    }

    public buildConfig() {
        return {
            "accessKey": {
                "type": 'string',
                "required": true
            },
            "fromEmail": {
                "type": 'string',
                "required": true
            },
            "toEmail": {
                "type": 'string',
                "required": true
            },
            "subject": {
                "type": 'string',
                "required": true
            },
            "htmlTemplate": {
                "type": 'encoded-string',
                "required": true
            },
            "values": {
                "type": 'object',
                "required": false
            }

        }
    }

    public async build({ accessKey, fromEmail, toEmail, subject, htmlTemplate, values }: { accessKey: string, fromEmail: string, toEmail: string, subject: string, htmlTemplate: string, values: object }) {

        try {
            const qdmsService: EmailService = this.services.get(Services.Email);
            await qdmsService.sendEmail(accessKey, fromEmail, toEmail, subject, htmlTemplate, values);
            return {
                success: true
            };
        } catch (e: any) {
            return {
                success: false,
                error: e.toString()
            }
        }

    }
}

