
import { BaseService } from "../BaseService";


export default class AzureDevOpsService extends BaseService {


  public get uid(): string {
    return 'com.realmocean.service.azuredevops';
  }

  get displayName(): string {
    return 'Azure DevOps Service'
  }

  async getConnector(): Promise<any> {
    return {
      uid: 'com.realmocean.connector.azure-devops',
      name: 'Azure DevOps',
      image: '/images/azure-devops.svg',
      dialog: {
        "title": 'Create Azure Devops Connection',
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

