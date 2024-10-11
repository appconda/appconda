import { BaseComponent } from "../../BaseComponent";
import { BaseService } from "../../BaseService";
import { Container } from "../../Container";
import { Services } from "../../Services";
import EmailService from "../../Services/EmailService";
import MiningService from "../../Services/MiningService";
import QDMSService from "../../Services/QdmsService";

export default class WatchEmails extends BaseComponent {

    get serviceName() {
        return Services.Email;
    }

    get displayName(): string {
        return 'Watch Emails'
    }

    get groupName(): string {
        return 'Triggers'
    }
    get description(): string {
        return 'Triggers when a new email is received for processing according to specified criteria.'
    }
    get documentation(): string {
        return '';
    }

    public get uid() {
        return 'com.realmocean.email.watch-emails'
    }

    public buildConfig() {
        return [
            {
                "name": "account",
                "label": "Connection",
                "type": "account:imap,google-restricted,microsoft-smtp-imap",
                "required": true,
                "on": {
                    "change": "reset_epoch"
                },
                "options": {
                    "scope": {
                        "google-restricted": [
                            "https://mail.google.com/"
                        ],
                        "microsoft-smtp-imap": [
                            "IMAP.AccessAsUser.All"
                        ]
                    },
                    "nested": [
                        {
                            "name": "folder",
                            "label": "Folder",
                            "type": "folder",
                            "required": true,
                            "on": {
                                "change": "reset_epoch"
                            },
                            "options": {
                                "store": "rpc://RpcFolder",
                                "ids": true,
                                "showRoot": false,
                                "singleLevel": true
                            }
                        }
                    ]
                }
            },
            {
                "name": "criteria",
                "label": "Criteria",
                "type": "select",
                "required": true,
                "default": "all",
                "on": {
                    "change": "reset_epoch"
                },
                "options": [
                    {
                        "label": "All emails",
                        "value": "ALL"
                    },
                    {
                        "label": "Only Read emails ",
                        "value": "SEEN"
                    },
                    {
                        "label": "Only Unread emails",
                        "value": "UNSEEN"
                    }
                ]
            },
            {
                "name": "from",
                "label": "Sender email address",
                "help": "Processes only emails sent from a specified email address.",
                "type": "email",
                "required": false,
                "on": {
                    "change": "reset_epoch"
                }
            },
            {
                "name": "to",
                "label": "Recipient email address",
                "help": "Processes only emails sent to a specified email address.",
                "type": "email",
                "required": false,
                "on": {
                    "change": "reset_epoch"
                }
            },
            {
                "name": "subject",
                "label": "Subject",
                "help": "Processes only emails containing a specified character string in their subject field.",
                "type": "text",
                "required": false,
                "on": {
                    "change": "reset_epoch"
                }
            },
            {
                "name": "text",
                "label": "Phrase",
                "help": "Processes only emails containing a specified character string (anywhere).",
                "type": "text",
                "required": false,
                "on": {
                    "change": "reset_epoch"
                }
            },
            {
                "name": "markSeen",
                "label": "Mark message(s) as read when fetched",
                "type": "boolean",
                "required": false,
                "default": false
            },
            {
                "name": "maxResults",
                "label": "Maximum number of results",
                "type": "number",
                "required": false
            }
        ]
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

