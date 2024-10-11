import e from "express";
import { BaseService } from "../BaseService";

const axios = require('axios');

export default class GithubService extends BaseService {

    public get uid(): string {
        return 'com.realmocean.service.github';
    }

    get displayName(): string {
        return 'Github Service'
    }

    get  theme():string {
      return "#2c0058";
  } 

  get icon(): string {
      return "/images/services/github_256.png";
  }
    /*  static  getInstance(args) {
      const _ = new WebServerService(args);
      _._init();
      return _.app;
    } */

    async init() {

        const app = this.webServer.getExpressApp();

        app.post("/github/issue/create", async (req: e.Request, res: e.Response) => {
            try {
                console.log(req.headers);
                const username = req.headers['x-github-username'] as string;
                const repo = req.headers['x-github-repo'] as string;
                const token = req.headers['x-github-token'] as string;
                const issue = req.body.issue;
                const issueUrl = await this.createIssue(username, repo, token, issue)
                res.status(200);
                return res.json({
                    issueUrl
                });
            }
            catch (e) {
                console.error(e);
                res.status(500);
                return res.json({
                    error: e
                });
            }
        });
    }

    async createIssue(username: string, repo: string, token: string, issue: any) {
        return new Promise((resolve, reject) => {
            const url = `https://api.github.com/repos/${username}/${repo}/issues`;

            axios.post(url, issue, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            })
                .then((response: any) => {
                    resolve(response.data.html_url)
                    // console.log('Issue başarıyla oluşturuldu:', response.data.html_url);
                })
                .catch((error: any) => {
                    //console.error('Bir hata oluştu:', error.message);
                    reject(error.message)
                });
        })

    }

    async getConnector(): Promise<any> {
        return {
          uid: 'com.realmocean.connector.github',
          name: 'Github',
          image: '/images/azure-devops.svg',
          dialog: {
            "title": 'Create Github Connection',
            "image": '/images/jira.png',
            "type": "csp",
    
            "fieldMap": {
              "name": {
                "label": "Connection Name",
                "type": "text",
                "name": "name"
              },
              "application": {
                "label": "Application",
                "type": "text",
                "name": "type",
                "isDisabled": true,
                "defaultValue": "com.celmino.connection.csp"
              },
              "domain": {
                "label": "Base URI *",
                "type": "text",
                "name": "key.domain",
                "helpMessage": 'Your Jira cloud host address. For example "https://my-jira.atlassian.net"'
              },
              "eData": {
                "label": "Bimser Encript Data",
                "type": "text",
                "name": "key.eData",
                "helpMessage": 'Email you are using for logging to Jira'
              },
              "token": {
                "label": "API token ",
                "type": "text",
                "name": "key.token",
                "helpMessage": 'Your Jira token created for Celmino'
              },
              "secret": {
                "type": "virtual",
                "name": "secret",
                "value": ['key.token', 'key.eData']
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
                    "domain",
                    "eData",
                    "token"
                  ]
                }
    
    
              ]
    
            }
          }
        }
      }
}

