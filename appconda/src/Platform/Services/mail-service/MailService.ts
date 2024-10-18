import { Agent } from "../log-service/service";
import { Service } from "../Service";
import { SendEmail } from "./Actions/SendEmail";
import { MailServiceAgent } from "./MailServiceAgent";


@Agent(MailServiceAgent)
export default class MailService extends Service {


  public init() {
    
  }

  public send() {
    const action = this.getAction(SendEmail.NAME);
    action.call({
    
    });
  }
 
}
