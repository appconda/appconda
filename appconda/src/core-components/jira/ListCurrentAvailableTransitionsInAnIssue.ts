

import { BaseComponent } from "../../BaseComponent";
import { Services } from "../../Services";

export default class WatchIssues extends BaseComponent {

    get serviceName() {
        return Services.Jira;
    }

    get displayName(): string {
        return 'List Current Available Transitions in an Issue'
    }

    get groupName(): string {
        return 'Issue'
    }
    get description(): string {
        return 'Lists current available transitions in an issue.'
    }
    get documentation(): string {
        return '';
    }

    public get uid() {
        return 'com.realmocean.jira.list-current-available'
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

