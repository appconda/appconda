// src/Adapter/Sentry.ts
import { Adapter } from '../Adapter';
import { Log } from '../Log';
import { Logger } from '../Logger';
import axios from 'axios';

export class Sentry extends Adapter {
    private sentryKey: string;
    private projectId: string;
    private sentryHost: string;

    constructor(dsn: string) {
        super();
        const parsedDsn = new URL(dsn);

        if (!parsedDsn) {
            throw new Error(`The '${dsn}' DSN is invalid.`);
        }

        const host = parsedDsn.hostname;
        const path = parsedDsn.pathname;
        const user = parsedDsn.username;
        const scheme = parsedDsn.protocol.slice(0, -1); // Remove trailing colon

        if (!scheme || !host || !path || !user) {
            throw new Error(`The '${dsn}' DSN must contain a scheme, a host, a user, and a path component.`);
        }

        if (!['http', 'https'].includes(scheme)) {
            throw new Error(`The scheme of the ${dsn} DSN must be either 'http' or 'https'`);
        }

        const segmentPaths = path.split('/');
        const projectId = segmentPaths.pop();

        let url = `${scheme}://${host}`;
        const port = parsedDsn.port || (scheme === 'http' ? '80' : '443');
        if ((scheme === 'http' && port !== '80') || (scheme === 'https' && port !== '443')) {
            url += `:${port}`;
        }

        this.sentryHost = url;
        this.sentryKey = user;
        this.projectId = projectId || '';
    }

    static getName(): string {
        return 'sentry';
    }

    async push(log: Log): Promise<number> {
        const breadcrumbsArray = log.getBreadcrumbs().map(breadcrumb => ({
            type: 'default',
            level: breadcrumb.getType(),
            category: breadcrumb.getCategory(),
            message: breadcrumb.getMessage(),
            timestamp: breadcrumb.getTimestamp(),
        }));

        const stackFrames: any[] = [];

        if (log.getExtra()['detailedTrace']) {
            const detailedTrace = log.getExtra()['detailedTrace'];
            if (!Array.isArray(detailedTrace)) {
                throw new Error('detailedTrace must be an array');
            }
            for (const trace of detailedTrace) {
                if (!Array.isArray(trace)) {
                    throw new Error('detailedTrace must be an array of arrays');
                }
                stackFrames.push({
                    filename: trace['file'] || '',
                    lineno: trace['line'] || 0,
                    function: trace['function'] || '',
                });
            }
        }

        // Reverse array (because Sentry expects the list to go from the oldest to the newest calls)
        stackFrames.reverse();

        const requestBody = {
            timestamp: log.getTimestamp(),
            platform: 'javascript',
            level: 'error',
            logger: log.getNamespace(),
            transaction: log.getAction(),
            server_name: log.getServer(),
            release: log.getVersion(),
            environment: log.getEnvironment(),
            message: {
                message: log.getMessage(),
            },
            exception: {
                values: [
                    {
                        type: log.getMessage(),
                        stacktrace: {
                            frames: stackFrames,
                        },
                    },
                ],
            },
            tags: log.getTags(),
            extra: log.getExtra(),
            breadcrumbs: breadcrumbsArray,
            user: log.getUser() ? {
                id: log.getUser().getId(),
                email: log.getUser().getEmail(),
                username: log.getUser().getUsername(),
            } : null,
        };

        try {
            const response = await axios.post(
                `${this.sentryHost}/api/${this.projectId}/store/`,
                requestBody,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${this.sentryKey}, sentry_client=utopia-logger/${Logger.LIBRARY_VERSION}`,
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
            Log.TYPE_WARNING,
            Log.TYPE_ERROR,
        ];
    }
}