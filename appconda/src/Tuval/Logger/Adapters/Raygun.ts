// src/Adapter/Raygun.ts
import { Adapter } from '../Adapter';
import { Log } from '../Log';
import { Logger } from '../Logger';
import axios from 'axios';

class Raygun extends Adapter {
    private apiKey: string;

    constructor(configKey: string) {
        super();
        this.apiKey = configKey;
    }

    static getName(): string {
        return 'raygun';
    }

    async push(log: Log): Promise<number> {
        const breadcrumbsArray = log.getBreadcrumbs().map(breadcrumb => ({
            category: breadcrumb.getCategory(),
            message: breadcrumb.getMessage(),
            type: breadcrumb.getType(),
            level: 'request',
            timestamp: Math.floor(breadcrumb.getTimestamp()),
        }));

        const tagsArray: string[] = [];

        for (const [tagKey, tagValue] of Object.entries(log.getTags())) {
            tagsArray.push(`${tagKey}: ${tagValue}`);
        }

        tagsArray.push(`type: ${log.getType()}`);
        tagsArray.push(`environment: ${log.getEnvironment()}`);
        tagsArray.push(`sdk: utopia-logger/${Logger.LIBRARY_VERSION}`);

        const requestBody = {
            occurredOn: Math.floor(log.getTimestamp()),
            details: {
                machineName: log.getServer(),
                groupingKey: log.getNamespace(),
                version: log.getVersion(),
                error: {
                    className: log.getAction(),
                    message: log.getMessage(),
                },
                tags: tagsArray,
                userCustomData: log.getExtra(),
                user: {
                    isAnonymous: !log.getUser(),
                    identifier: log.getUser()?.getId() || null,
                    email: log.getUser()?.getEmail() || null,
                    fullName: log.getUser()?.getUsername() || null,
                },
                breadcrumbs: breadcrumbsArray,
            },
        };

        try {
            const response = await axios.post(
                'https://api.raygun.com/entries',
                requestBody,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-ApiKey': this.apiKey,
                    },
                }
            );
            return response.status;
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(`Log could not be pushed with status code ${error.response.status}: ${error.message}`);
            } else {
                throw new Error(`Log could not be pushed: ${error.message}`);
            }
        }
    }

    getSupportedTypes(): string[] {
        return [
            Log.TYPE_INFO,
            Log.TYPE_DEBUG,
            Log.TYPE_VERBOSE,
            Log.TYPE_WARNING,
            Log.TYPE_ERROR,
        ];
    }

    getSupportedEnvironments(): string[] {
        return [
            Log.ENVIRONMENT_STAGING,
            Log.ENVIRONMENT_PRODUCTION,
        ];
    }

    getSupportedBreadcrumbTypes(): string[] {
        return [
            Log.TYPE_INFO,
            Log.TYPE_DEBUG,
            Log.TYPE_VERBOSE,
            Log.TYPE_WARNING,
            Log.TYPE_ERROR,
        ];
    }
}