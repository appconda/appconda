import e from "express";
import { BaseService } from "../BaseService";
const axios = require('axios');
interface CSPAccessObject {
    domain: string,
    token: string,
    eData: string;
}

export default class CspService extends BaseService {

    public get uid(): string {
        return 'com.realmocean.service.csp';
    }

    get displayName(): string {
        return 'Csp Service'
    }


    async init() {



        const router = this.webServer.getRouter();
        /*   router.get('/jira/projects', async (req: e.Request, res: e.Response) => {
             // const projects = await this.getProjects(key);
              res.json(projects);
          })
  
          router.get('/jira/project/:key/issues', async (req: e.Request, res: e.Response) => {
              const projects = await this.getIssues(key, req.params.key);
              res.json(projects);
          }) */
        const domain = 'https://dev.bimser.net';
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBdXRoZW50aWNhdGlvblR5cGUiOiIxIiwiSW5zdGFuY2UiOiJkZXYiLCJJbnRlcm5hbFVzZXJJZCI6IjQiLCJJbnRlcm5hbFVzZXJuYW1lIjoicmd1ciIsIlBvc2l0aW9ucyI6IltdIiwiRGVsZWdhdGlvbklkIjoiIiwiVG9rZW5JZCI6IjJhMjAxZGJlLTAxOGEtNDYwMS04YjU0LTkyYTZiYTlkYjdmMiIsIlVzZXJuYW1lIjoicmd1ciIsIlVzZXJJZCI6IjQiLCJUaW1lVG9MaXZlIjoiODY0MDAwMDAiLCJTY29wZSI6IjMiLCJuYmYiOjE3MTQ0MTE1NTksImV4cCI6MTcxNDQ5Nzk1OSwiaXNzIjoiQmltc2VyIMOHw7Z6w7xtIiwiYXVkIjoiU3luZXJneSBVc2VycyJ9.q-hZcBvKbIu8nMuPeie8_AqYvw5kgIXn-YaSDC3Ui9w';
        const eData = 'k1locoKLE4dVg9kmquJp3LWYzFVXmzJ46BwSuzNKEptxs8+gLZO9ONk/tdlDEWJSaMx7NBf8sNAzyyyW4RCsZOkPGU3BsuRO2mFrjPCDvewng68pktys1/6CXjQNWr9cwaRVRqn43smAUn0cEE+pBN+O4cRg5hj9+QVdH7y+9Dk=';

        const accessKey = this.createKey({ domain, token, eData });
        /*   const projects = await this.getFlows(accessKey, '2xZ2IAMWM8C+naEzBxBMYKAalvJ1n6AUArWfPbuxlayRq9RJYzECEIlkDwxnIaS7TFxabjNp02+8s0V9IohqaUX0XXRuhueWRFQhoD4vcjbGhw4St4q69jKoKVG2Ukx0HY9xULBIq/nAcg1TtG7G4jVvzBWycVjNclgpPtcLAMks0f8xfhbvrsgR/Pxax6ENpwY0Ri29tvw3u+6Ovn9L/VIaTt8ucQdSGYEY4ZjUzFArRXVEyOiOeSzIKq83CEVVoKhEXDdt9ITJq7zy8T5MrND4oizvFqxIWIoEdaQTZiOf+ng+KY1j37mk71U5q/gO',
             '04833a1b-01be-4c1a-8dd3-fc30a93bd2d8'
 
         );  */

        router.get('/csp/projects', async (req: e.Request, res: e.Response) => {
            const accessKey = req.headers['x-access-key'] as string;

            //const accessKey = this.createKey({ domain, token, eData });

            const projects = await this.getProjects(accessKey);
            res.json(projects);
        })

        router.post('/csp/:projectId/flows', async (req: e.Request, res: e.Response) => {
            const accessKey = req.headers['x-access-key'] as string;
            const projectSecretKey: string = decodeURIComponent(req.body.projectSecretKey);
            const projectId: string = decodeURIComponent(req.params.projectId);
            //const accessKey = this.createKey({ domain, token, eData });

            const flows = await this.getFlows(accessKey, projectSecretKey, projectId);
            console.log('----------------------')
            console.log(flows)
            res.json(flows);
        })

        router.get('/csp/:projectId/:flowId/processes', async (req: e.Request, res: e.Response) => {
            const accessKey = req.headers['x-access-key'] as string;
            const projectId: string = decodeURIComponent(req.params.projectId);
            const flowId: string = decodeURIComponent(req.params.flowId);
            //const accessKey = this.createKey({ domain, token, eData });

            const flows = await this.getProcesses(accessKey, projectId, flowId);
            res.json(flows);
        })

        router.post('/csp/createKey', async (req: e.Request, res: e.Response) => {
            const domain = req.body.domain;
            const token = req.body.token;
            const eData = req.body.eData;

            const accessKey = this.createKey({ domain, token, eData });


            res.json({ accessKey });
        })

        //console.log(projects);
    }

    public createKey({ domain, token, eData }: CSPAccessObject) {

        return this.createKeyInternal({
            domain, token, eData
        })
    }

    public async getProjects(accessKey: string) {
        const accessObject: CSPAccessObject = this.decodeKey(accessKey);
        console.log(accessObject)

        const result = await this.cspPost(accessKey, `${accessObject.domain}/api/ide/ProjectManager/GetProjects`, {});
        return result.projects;

    }

    public async getForms(accessKey: string, projectSecretKey: string, projectId: string) {
        const accessObject: CSPAccessObject = this.decodeKey(accessKey);

        const result = await this.cspPost(accessKey, `${accessObject.domain}/api/ide/ProjectManager/GetForms`, {
            projectSecretKey,
            projectId
        });
        return result.forms;
    }

    public async getFlows(accessKey: string, projectSecretKey: string, projectId: string) {
        const accessObject: CSPAccessObject = this.decodeKey(accessKey);
        try {
            const result = await this.cspPost(accessKey, `${accessObject.domain}/api/ide/ProjectManager/GetFlows`, {
                projectSecretKey,
                projectId
            });
            return result.flows;
        } catch (e) {
            console.error(e);
        }
    }

    public async getProcesses(accessKey: string, projectId: string, flowId: string) {
        const accessObject: CSPAccessObject = this.decodeKey(accessKey);
        const result = await this.cspPost(accessKey, `${accessObject.domain}/api/ide/ProjectManager/GetProcesses`, {
            projectId,
            flowId,
        });
        return result.processes;
    }

    public async getProcessSteps(accessKey: string, processId: string) {
        const accessObject: CSPAccessObject = this.decodeKey(accessKey);
        const result = await this.cspPost(accessKey, `${accessObject.domain}/api/ide/ProjectManager/GetProcessSteps`, {
            processId
        });
        return result.processSteps;
    }

    private async cspPost(accessKey: string, url: string, params: object) {
        const accessObject: CSPAccessObject = this.decodeKey(accessKey);

        try {
            const myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${accessObject.token}`);
            myHeaders.append("Bimser-Encrypted-Data", accessObject.eData);
            myHeaders.append("Bimser-Language", "tr-TR");
            myHeaders.append("Content-Type", "application/json");


            const raw = JSON.stringify(params);

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: raw,
                redirect: "follow"
            };

            const response = await fetch(url, requestOptions as any);
            if (response.status === 200) {
                const resultData = await response.json();
                return resultData.result;
            } else {
                console.log('Statuc code : ', response.status)
            }
        }
        catch (e) {
            console.error('Hata:', e);
        }

    }

    async getConnector(): Promise<any> {
        return {
            uid: 'com.realmocean.connector.csp',
            name: 'Bimser Synergy',
            image: '/images/CSP.png',
            image2:'/images/bimser-synergy.png',
            dialog: {
                "title": 'Create CSP connection',
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


