import { DateTime } from '../../../../Tuval/Core';
import { Response } from '../../Response';
import { Filter } from '../Filter';

import * as cronParser from 'cron-parser';

export class V16 extends Filter {
    // Convert 1.4 Data format to 1.3 format
    public parse(content: Record<string, any>, model: string): Record<string, any> {
        let parsedResponse = content;

        switch (model) {
            case Response.MODEL_DEPLOYMENT:
                parsedResponse = this.parseDeployment(parsedResponse);
                break;
            case Response.MODEL_DEPLOYMENT_LIST:
                parsedResponse = this.handleList(content, 'deployments', (item) => this.parseDeployment(item));
                break;
            case Response.MODEL_EXECUTION:
                parsedResponse = this.parseExecution(parsedResponse);
                break;
            case Response.MODEL_EXECUTION_LIST:
                parsedResponse = this.handleList(content, 'executions', (item) => this.parseExecution(item));
                break;
            case Response.MODEL_FUNCTION:
                parsedResponse = this.parseFunction(parsedResponse);
                break;
            case Response.MODEL_FUNCTION_LIST:
                parsedResponse = this.handleList(content, 'functions', (item) => this.parseFunction(item));
                break;
            case Response.MODEL_PROJECT:
                parsedResponse = this.parseProject(parsedResponse);
                break;
            case Response.MODEL_PROJECT_LIST:
                parsedResponse = this.handleList(content, 'projects', (item) => this.parseProject(item));
                break;
            case Response.MODEL_VARIABLE:
                parsedResponse = this.parseVariable(parsedResponse);
                break;
            case Response.MODEL_VARIABLE_LIST:
                parsedResponse = this.handleList(content, 'variables', (item) => this.parseVariable(item));
                break;
            default:
                break;
        }

        return parsedResponse;
    }

    protected parseDeployment(content: Record<string, any>): Record<string, any> {
        content['buildStderr'] = '';
        content['buildStdout'] = content['buildLogs'];
        delete content['buildLogs'];
        return content;
    }

    protected parseExecution(content: Record<string, any>): Record<string, any> {
        if (content['responseStatusCode']) {
            content['statusCode'] = content['responseStatusCode'];
            delete content['responseStatusCode'];
        }

        if (content['responseBody']) {
            content['response'] = content['responseBody'];
            delete content['responseBody'];
        }

        if (content['logs']) {
            content['stdout'] = content['logs'];
            delete content['logs'];
        }

        if (content['errors']) {
            content['stderr'] = content['errors'];
            delete content['errors'];
        }

        return content;
    }

 

    protected parseFunction(content: Record<string, any>): Record<string, any> {
        content.schedulePrevious = '';
        content.scheduleNext = '';
    
        if (content.schedule && content.schedule.trim() !== '') {
          try {
            const cron = cronParser.parseExpression(content.schedule);
    
            const previousRun = cron.prev().toDate();
            const nextRun = cron.next().toDate();
    
            content.schedulePrevious =  DateTime.formatTz(DateTime.format(previousRun));
            content.scheduleNext = DateTime.formatTz(DateTime.format(nextRun));
          } catch (error) {
            console.error('Cron expression parsing error:', error);
          }
        }
    
        return content;
      }

    protected parseProject(content: Record<string, any>): Record<string, any> {
        for (const provider of content['oAuthProviders'] ?? []) {
            provider['name'] = provider['key'].charAt(0).toUpperCase() + provider['key'].slice(1);
            delete provider['key'];
        }

        content['domains'] = [];
        return content;
    }

    protected parseVariable(content: Record<string, any>): Record<string, any> {
        if (content['resourceId']) {
            content['functionId'] = content['resourceId'];
            delete content['resourceId'];
        }

        return content;
    }
}