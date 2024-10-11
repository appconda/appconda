import { Response } from '../../Response';
import { Filter } from '../Filter';

export class V17 extends Filter {
    // Convert 1.5 Data format to 1.4 format
    public parse(content: Record<string, any>, model: string): Record<string, any> {
        let parsedResponse = content;

        switch (model) {
            case Response.MODEL_PROJECT:
                parsedResponse = this.parseProject(parsedResponse);
                break;
            case Response.MODEL_PROJECT_LIST:
                parsedResponse = this.handleList(content, 'projects', (item) => this.parseProject(item));
                break;
            case Response.MODEL_USER:
                parsedResponse = this.parseUser(parsedResponse);
                break;
            case Response.MODEL_USER_LIST:
                parsedResponse = this.handleList(content, 'users', (item) => this.parseUser(item));
                break;
            case Response.MODEL_MEMBERSHIP:
                parsedResponse = this.parseMembership(parsedResponse);
                break;
            case Response.MODEL_MEMBERSHIP_LIST:
                parsedResponse = this.handleList(content, 'memberships', (item) => this.parseMembership(item));
                break;
            case Response.MODEL_SESSION:
                parsedResponse = this.parseSession(parsedResponse);
                break;
            case Response.MODEL_SESSION_LIST:
                parsedResponse = this.handleList(content, 'sessions', (item) => this.parseSession(item));
                break;
            case Response.MODEL_WEBHOOK:
                parsedResponse = this.parseWebhook(parsedResponse);
                break;
            case Response.MODEL_WEBHOOK_LIST:
                parsedResponse = this.handleList(content, 'webhooks', (item) => this.parseWebhook(item));
                break;
            case Response.MODEL_TOKEN:
                parsedResponse = this.parseToken(parsedResponse);
                break;
            default:
                break;
        }

        return parsedResponse;
    }

    protected parseUser(content: Record<string, any>): Record<string, any> {
        delete content['targets'];
        delete content['mfa'];
        return content;
    }

    protected parseProject(content: Record<string, any>): Record<string, any> {
        content['providers'] = content['oAuthProviders'];
        delete content['oAuthProviders'];
        return content;
    }

    protected parseToken(content: Record<string, any>): Record<string, any> {
        delete content['phrase'];
        return content;
    }

    protected parseMembership(content: Record<string, any>): Record<string, any> {
        delete content['mfa'];
        return content;
    }

    protected parseSession(content: Record<string, any>): Record<string, any> {
        delete content['factors'];
        delete content['secret'];
        return content;
    }

    protected parseWebhook(content: Record<string, any>): Record<string, any> {
        delete content['enabled'];
        delete content['logs'];
        delete content['attempts'];
        return content;
    }
}
