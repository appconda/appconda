// src/Adapter/AppSignal.ts
import { Adapter } from '../Adapter';
import { Log } from '../Log';
import { Logger } from '../Logger';
import axios from 'axios';

export class AppSignal extends Adapter {
    private apiKey: string;

    constructor(configKey: string) {
        super();
        this.apiKey = configKey;
    }

    static getName(): string {
        return 'appSignal';
    }

    async push(log: Log): Promise<number> {
        const params: { [key: string]: any } = {};
        for (const [paramKey, paramValue] of Object.entries(log.getExtra())) {
            params[paramKey] = JSON.stringify(paramValue);
        }

        const breadcrumbsArray = log.getBreadcrumbs().map(breadcrumb => ({
            timestamp: Math.floor(breadcrumb.getTimestamp()),
            category: breadcrumb.getCategory(),
            action: breadcrumb.getMessage(),
            metadata: {
                type: breadcrumb.getType(),
            },
        }));

        const tags: { [key: string]: string } = {};
        for (const [tagKey, tagValue] of Object.entries(log.getTags())) {
            tags[tagKey] = tagValue;
        }

        if (log.getType()) {
            tags['type'] = log.getType();
        }
        if (log.getUser()) {
            if (log.getUser().getId()) {
                tags['userId'] = log.getUser().getId();
            }
            if (log.getUser().getUsername()) {
                tags['userName'] = log.getUser().getUsername();
            }
            if (log.getUser().getEmail()) {
                tags['userEmail'] = log.getUser().getEmail();
            }
        }

        tags['sdk'] = `utopia-logger/${Logger.LIBRARY_VERSION}`;

        const requestBody = {
            timestamp: Math.floor(log.getTimestamp()),
            namespace: log.getNamespace(),
            error: {
                name: log.getMessage(),
                message: log.getMessage(),
                backtrace: [],
            },
            environment: {
                environment: log.getEnvironment(),
                server: log.getServer(),
                version: log.getVersion(),
            },
            revision: log.getVersion(),
            action: log.getAction(),
            params,
            tags,
            breadcrumbs: breadcrumbsArray,
        };

        try {
            const response = await axios.post(
                `https://appsignal-endpoint.net/collect?api_key=${this.apiKey}&version=1.3.19`,
                requestBody,
                {
                    headers: {
                        'Content-Type': 'application/json',
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
