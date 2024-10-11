import e from "express";
import { BaseService } from "../BaseService";
import { Version3Client } from '../modules/jira';

const axios = require('axios');

interface JiraAccessObject {
    host: string,
    username: string,
    token: string
}

export default class JiraService extends BaseService {

    public get uid(): string {
        return 'com.realmocean.service.jira';
    }

    get displayName(): string {
        return 'Jira Cloud Platform'
    }

    get  theme():string {
        return "#0052CC";
    } 

    get icon(): string {
        return "/images/services/jira_64.png";
    }

    async init() {

        const apiToken = '';
        const username = 'stanoncloud@gmail.com';
        const jiraDomain = 'https://tuvalsoft.atlassian.net';

        //  const key =  this.createKey(jiraDomain, username, apiToken);
        /* 
                console.log(key);
                const decodedKey = this.decodeKey(key);
                console.log(decodedKey)
         */
        const router = this.webServer.getRouter();

        router.post('/jira/createKey', async (req: e.Request, res: e.Response) => {
            const host = req.body.host;
            const username = req.body.username;
            const token = req.body.token;

            const accessKey = this.createKey({ host, username, token });


            res.json({ accessKey });
        })

        router.get('/jira/projects', async (req: e.Request, res: e.Response) => {
            const accessKey = req.headers['x-access-key'] as string;
            const projects = await this.getProjects(accessKey);
            res.json(projects);
        })

        router.get('/jira/project/:key/issues', async (req: e.Request, res: e.Response) => {
            const accessKey = req.headers['x-access-key'] as string;
            const projects = await this.getIssues(accessKey, req.params.key);
            res.json(projects);
        })
    }

    public createKey({ host, username, token }) {
        console.log('--------------------')
        return this.createKeyInternal({
            host, username, token
        })
    }

    async getProjects(accessKey: string) {
        const accessObject: JiraAccessObject = this.decodeKey(accessKey);
        console.log(accessObject)

        try {
            const jiraUrl = `${accessObject.host}/rest/api/3/project`;
            const basicAuth = 'Basic ' + Buffer.from(accessObject.username + ':' + accessObject.token).toString('base64');

            const response = await axios.get(jiraUrl, {
                headers: {
                    'Authorization': basicAuth,
                    'Accept': 'application/json'
                }
            });

            console.log(response.data)
            return response.data;

        } catch (e) {
            console.error('Hata:', e);
        }

       
    }

    async getIssues(accessKey: string, projectKey: string) {
        const accessObject: JiraAccessObject = this.decodeKey(accessKey);
        try {
            const jiraUrl = `${accessObject.host}/rest/api/3/search`;
            const basicAuth = 'Basic ' + Buffer.from(accessObject.username + ':' + accessObject.token).toString('base64');

            // JQL sorgusu ile belirli bir projeye ait issue'ları ara
            const jqlQuery = `project = ${projectKey}`;

            const response = await axios.get(jiraUrl, {
                headers: {
                    'Authorization': basicAuth,
                    'Accept': 'application/json'
                },
                params: {
                    jql: jqlQuery
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('Hata:', error);
        }
    }

    async getConnector() {
        return {
            uid: 'com.realmocean.connector.jira',
            name: 'Jira Cloud Platform',
            image: '/images/jira-logo.svg',
            image2: '/images/jira.png',
            dialog: {
                "title": 'Create jira connection',
                "image": '/images/jira.png',
                "type": "jira",
                "fieldMap": {
                    "name": {
                        "label": "Connection Name",
                        "type": "text",
                        "name": "name"
                    },
                    "application": {
                        "label": "Connection Type",
                        "type": "text",
                        "name": "type",
                        "isDisabled": true,
                        "defaultValue": "com.celmino.connection.jira"

                    },
                    "host": {
                        "label": "Base URI *",
                        "type": "text",
                        "name": "key.host",
                        "helpMessage": 'Your Jira cloud host address. For example "https://my-jira.atlassian.net"'
                    },
                    "username": {
                        "label": "Username *",
                        "type": "text",
                        "name": "key.username",
                        "helpMessage": 'Email you are using for logging to Jira'
                    },
                    "token": {
                        "label": "API token *",
                        "type": "text",
                        "name": "key.token",
                        "helpMessage": 'Your Jira token created for Celmino'
                    },
                    "secret": {
                        "type": "virtual",
                        "name": "secret",
                        "value": ['key.token']
                    }
                },
                "layout": {
                    "type": "collapse",
                    "containers": [
                        {
                            "label": "General",
                            "fields": [
                                "name",
                                "application"
                            ]
                        },
                        {
                            "label": "Connection Details",
                            "fields": [
                                "host",
                                "username",
                                "token"
                            ]
                        }


                    ]
                }
            }
        }
    }
}


