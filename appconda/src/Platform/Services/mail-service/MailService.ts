
import { Action } from "../Decarators/Action";
import { Agent } from "../Decarators/Agent";
import { Service } from "../Service";
import { SendEmail } from "./Actions/SendEmail";
import { MailServiceAgent } from "./MailServiceAgent";



export interface SendEmailPayload {
  smtp: string
}

@Agent(MailServiceAgent)
export default class MailService extends Service {

  public init() {

  }

  @Action(SendEmail)
  public send(payload: SendEmailPayload) { }

}
