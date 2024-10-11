import { BaseComponent } from "../../BaseComponent";
import { BaseService } from "../../BaseService";
import { Container } from "../../Container";
import { Services } from "../../Services";
import EmailService from "../../Services/EmailService";
import MiningService from "../../Services/MiningService";
import QDMSService from "../../Services/QdmsService";

export default class WatchIssues extends BaseComponent {

    get serviceName() {
        return Services.Jira;
    }

    get displayName(): string {
        return 'Create an Issues'
    }

    get groupName(): string {
        return 'Issue'
    }
    get description(): string {
        return 'Creates a new issue.'
    }
    get documentation(): string {
        return '';
    }

    public get uid() {
        return 'com.realmocean.jira.create-issue'
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

    }
}

