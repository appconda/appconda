// src/Adapter/LogOwl.ts
import { Adapter } from '../Adapter';
import { Log } from '../Log';
import { Logger } from '../Logger';
import axios from 'axios';

export class LogOwl extends Adapter {
    private ticket: string;
    private logOwlHost: string;

    constructor(configKey: string) {
        super();
        const configChunks = configKey.split(';');
        this.ticket = configChunks[0];
        this.logOwlHost = 'https://api.logowl.io/logging/';

        if (configChunks.length > 1 && configChunks[1]) {
            this.logOwlHost = configChunks[1];
        }
    }

    static getName(): string {
        return 'logOwl';
    }

    static getAdapterType(): string {
        return 'utopia-logger';
    }

    static getAdapterVersion(): string {
        return Logger.LIBRARY_VERSION;
    }

    async push(log: Log): Promise<number> {
        const line = log.getExtra()['line'] || '';
        const file = log.getExtra()['file'] || '';
        const trace = log.getExtra()['trace'] || '';
        const id = log.getUser()?.getId() || null;
        const email = log.getUser()?.getEmail() || null;
        const username = log.getUser()?.getUsername() || null;

        const breadcrumbsArray = log.getBreadcrumbs().map(breadcrumb => ({
            type: 'log',
            log: breadcrumb.getMessage(),
            timestamp: Math.floor(breadcrumb.getTimestamp()),
        }));

        const requestBody = {
            ticket: this.ticket,
            message: log.getAction(),
            path: file,
            line: line,
            stacktrace: trace,
            badges: {
                environment: log.getEnvironment(),
                namespace: log.getNamespace(),
                version: log.getVersion(),
                message: log.getMessage(),
                id: id,
                $email: email,
                $username: username,
            },
            type: log.getType(),
            metrics: {
                platform: log.getServer(),
            },
            logs: breadcrumbsArray,
            timestamp: Math.floor(log.getTimestamp()),
            adapter: {
                name: LogOwl.getName(),
                type: LogOwl.getAdapterType(),
                version: LogOwl.getAdapterVersion(),
            },
        };

        try {
            const response = await axios.post(
                `${this.logOwlHost}${log.getType()}`,
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
            Log.TYPE_WARNING,
            Log.TYPE_ERROR,
        ];
    }
}
