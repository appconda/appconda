import { BaseComponent } from "../../BaseComponent";
import { BaseService } from "../../BaseService";
import { Container } from "../../Container";
import { Services } from "../../Services";
import EmailService from "../../Services/EmailService";
import MiningService from "../../Services/MiningService";
import QDMSService from "../../Services/QdmsService";

export default class UpdateIssueStatus extends BaseComponent {

    get serviceName() {
        return Services.Jira;
    }

    get displayName(): string {
        return 'Update an Issue Status (Transition Issue)'
    }

    get groupName(): string {
        return 'Issue'
    }
    get description(): string {
        return 'Updates an issue status.'
    }
    get documentation(): string {
        return '';
    }

    public get uid() {
        return 'com.realmocean.jira.update-issue-status'
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

