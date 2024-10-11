import { BaseComponent } from "../../BaseComponent";
import { BaseService } from "../../BaseService";
import { Container } from "../../Container";
import { Services } from "../../Services";
import EmailService from "../../Services/EmailService";
import MiningService from "../../Services/MiningService";
import QDMSService from "../../Services/QdmsService";
import SmsService from "../../Services/SMSService";

export default class SendSms extends BaseComponent {

    get serviceName() {
        return Services.Sms;
    }

    get displayName(): string {
        return 'Send Sms'
    }

    get groupName(): string {
        return 'Actions'
    }
    get description(): string {
        return 'Create Access Key'
    }
    get documentation(): string {
        return '';
    }

    public get uid() {
        return 'com.realmocean.sms.send'
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

    public async build({ accessKey,message, phones }: { accessKey: string, message: string, phones: string[]}) {

        try {
            const smsService: SmsService = this.services.get(Services.Sms);
            await smsService.send(accessKey, message, phones);
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

