import { BaseService } from "../BaseService";

const soap = require('soap');
const url = 'http://_93.180.135.42/QDMS/QDMSNET/BSAT/BSATWebapi.asmx?WSDL';


/* const args = {
    ServiceToken: {
        User: '',  // Kullanıcı adınızı buraya girin
        Token: 'jG5KCJiNA0ßßßlcßßßGcDhApqGkU1f0KUsV5aNrKtc9r3zJnAJwtDyx4D$$$8DZiFCuHXoaqKLvvlr77nXtLKwSnrXvQ=='
    }
};

soap.createClient(url, function (err, client) {
    if (err) throw err;

    client.addSoapHeader({ 'tem:ServiceToken': args.ServiceToken }, '', 'tem', 'http://tempuri.org/');
    client.GetCustomers({}, function (err, result) {
        if (err) throw err;
        //console.log(result.GetCustomersResult.diffgram.NewDataSet.Table1);
        for (let i = 0; i < result.GetCustomersResult.diffgram.NewDataSet.Table1.length; i++) {
            console.log(result.GetCustomersResult.diffgram.NewDataSet.Table1[i]['ADI']);
        }
    });
}); */

export interface QDMSAccessObject {
    url: string;
    token: string;
}

export default class QDMSService extends BaseService {

    public get uid(): string {
        return 'com.realmocean.service.qdms';
    }

    get displayName(): string {
        return 'QDMS Service'
    }

    
    get  theme():string {
        return "#7C2A35";
    } 

    get icon(): string {
        return "/images/services/qdms.png";
    }

    async init() {

        const router = this.webServer.getRouter();
        //  const config = this.services.get('config-service').getConfig();

        const qdms = this.services.get('com.realmocean.service.qdms');

        router.get("/qdms/components", async (req: any, res: any) => {
            try {
                const components = this.components.map(component => ({
                    uid: component.uid,
                    name: component.displayName,
                    description: component.description,
                    config: component.buildConfig()
                }))
                return res.json({
                    components
                });
            }
            catch (e) {

                return res.json({
                    error: true
                });
            }
        });

        router.post("/qdms/token", async (req: any, res: any) => {
            console.log(req.body)
            const url = req.body.url;
            const user = req.body.user;
            const password = req.body.password;

            try {
                const token = await qdms.getToken(url, user, password);
                return res.json({
                    token
                });
            }
            catch (e) {
                console.error(e);
                res.status(500);
                return res.json({
                    error: true,
                    url,
                    user,
                    password
                });
            }
        });

        router.get("/qdms/users", async (req: any, res: any) => {
            const url = req.headers['x-qdms-url'];
            const token = req.headers['x-qdms-token'];
            try {
                //const token = await qdms.getToken(url, user, password);
                const users = await qdms.getUsers({ url, token });
                return res.json({
                    users
                });
            }
            catch (e) {
                console.error(e);
                res.status(500);
                return res.json({
                    error: 'error',
                    url,
                    token
                });
            }
        });

        router.get("/qdms/describe", async (req: any, res: any) => {

            try {

                return res.json(await this.describe());
            }
            catch (e) {
                console.error(e);
                res.status(500);
                return res.json({
                    error: 'error',
                    url
                });
            }
        });


    }

    async getToken(url: string, user: string, password: string) {
        return new Promise((resolve, reject) => {
            let params = {
                user,
                password
            };
            soap.createClient(url, function (err: any, client: any) {
                if (err) {
                    reject(err);
                    return;
                }

                client.ServiceAuth(params, (err: any, result: any, rawResponse: any, soapHeader: any) => {
                    if (result.ServiceAuthResult) {
                        resolve(soapHeader.ServiceToken.Token);
                    } else {
                        reject('hata');
                    }

                });
            });
        })



        /*   soap.createClient(url, function (err, client) {
              if (err) throw err;
  
              client.addSoapHeader({ 'tem:ServiceToken': args.ServiceToken }, '', 'tem', 'http://tempuri.org/');
              client.GetCustomers({}, function (err, result) {
                  if (err) throw err;
                  //console.log(result.GetCustomersResult.diffgram.NewDataSet.Table1);
                  for (let i = 0; i < result.GetCustomersResult.diffgram.NewDataSet.Table1.length; i++) {
                      console.log(result.GetCustomersResult.diffgram.NewDataSet.Table1[i]['ADI']);
                  }
              });
          }); */
    }

    async getCustomers({ url, token }: { url: string, token: string }) {
        return new Promise((resolve, reject) => {

            soap.createClient(url, function (err: any, client: any) {
                if (err) {
                    reject(err);
                    return;
                }

                const args = {
                    ServiceToken: {
                        User: '',  // Kullanıcı adınızı buraya girin
                        Token: token
                    }
                };

                client.addSoapHeader({ 'tem:ServiceToken': args.ServiceToken }, '', 'tem', 'http://tempuri.org/');
                client.GetCustomers({}, function (err: any, result: any) {
                    if (err) throw err;
                    //console.log(result.GetCustomersResult.diffgram.NewDataSet.Table1);
                    const customers: any = [];
                    for (let i = 0; i < result.GetCustomersResult.diffgram.NewDataSet.Table1.length; i++) {
                        customers.push({
                            name: result.GetCustomersResult.diffgram.NewDataSet.Table1[i]['ADI']
                        })
                        //console.log(result.GetCustomersResult.diffgram.NewDataSet.Table1[i]['ADI']);
                    }
                    resolve(customers);
                });
            });
        })
    }

    async getUsers(accessKey: string) {

        const { url, token }: QDMSAccessObject = this.decodeKey(accessKey);

        return new Promise((resolve, reject) => {
            soap.createClient(url, function (err: any, client: any) {
                if (err) {
                    reject(err);
                    return;
                }

                const args = {
                    ServiceToken: {
                        User: '',  // Kullanıcı adınızı buraya girin
                        Token: token
                    }
                };

                client.addSoapHeader({ 'tem:ServiceToken': args.ServiceToken }, '', 'tem', 'http://tempuri.org/');
                client.GetUsers({}, function (err: any, result: any) {
                    if (err) throw err;
                    //console.log(result.GetCustomersResult.diffgram.NewDataSet.Table1);
                    const customers: any = [];
                    for (let i = 0; i < result.GetUsersResult.diffgram.NewDataSet.Table1.length; i++) {
                        customers.push({
                            name: result.GetUsersResult.diffgram.NewDataSet.Table1[i]['ADI'],
                            surname: result.GetUsersResult.diffgram.NewDataSet.Table1[i]['SOYADI'],
                            role: result.GetUsersResult.diffgram.NewDataSet.Table1[i]['UNVAN_KODU'],
                            department: result.GetUsersResult.diffgram.NewDataSet.Table1[i]['DEPARTMAN_KODU']

                        })
                        //console.log(result.GetCustomersResult.diffgram.NewDataSet.Table1[i]['ADI']);
                    }
                    resolve(customers);
                });
            });
        })
    }

    public createKey({ url, token }: QDMSAccessObject) {

        return this.createKeyInternal({
            url, token
        })
    }

    async describe() {
        return {
            name: 'Qdms Service',
            version: '1.0',
            exports: [
                {
                    name: 'getToken',
                    parameters: [
                        {
                            name: 'url',
                            type: 'string'
                        },
                        {
                            name: 'user',
                            type: 'string'
                        },
                        {
                            name: 'password',
                            type: 'string'
                        }
                    ]
                }
            ]


        }
    }

    async getConnector(): Promise<any> {
        return {
            uid: 'com.realmocean.connector.qdms',
            name: 'QDMS',
            image: '/images/qdms.png',
            dialog: {
                "title": 'Create Qdms connection',
                "image": '/images/qdms.png',
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
                    "name":"secret",
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


