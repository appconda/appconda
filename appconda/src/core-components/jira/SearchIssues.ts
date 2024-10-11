import { BaseComponent } from "../../BaseComponent";
import { Services } from "../../Services";

export default class GetIssue extends BaseComponent {

    get serviceName() {
        return Services.Jira;
    }

    get displayName(): string {
        return 'Search Issues'
    }

    get groupName(): string {
        return 'Issue'
    }
    get description(): string {
        return 'Searches for issues.'
    }
    get documentation(): string {
        return '';
    }

    public get uid() {
        return 'com.realmocean.jira.search-issues'
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

