import { Agent } from "../../Decarators/Agent";
import { Service } from "../Service";


export namespace Payloads {
  export interface Create {
    project: string;
    name: string;
  }

  export interface CreateCollection {
    project: string;
    name: string;
  }

  export interface ListDatabases {
    project: string;
    name: string;
  }
}

@Agent(ServiceDiscoveryService)
export default class ServiceDiscoveryService extends Service {


  public getServiceAction(serviceName: string, actionName: string) { 
  }

  
}
