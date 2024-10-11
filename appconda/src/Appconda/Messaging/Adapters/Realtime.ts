import { Document, DateTime, ID, Role } from '../../../Tuval/Core';
import { Adapter } from '../Adapter';
import { createClient } from 'redis';

export class Realtime extends Adapter {
    public connections: Record<string, any> = {};
    public subscriptions: Record<string, any> = {};

    public subscribe(projectId: string, identifier: any, roles: string[], channels: string[]): void {
        if (!this.subscriptions[projectId]) {
            this.subscriptions[projectId] = {};
        }

        for (const role of roles) {
            if (!this.subscriptions[projectId][role]) {
                this.subscriptions[projectId][role] = {};
            }

            for (const channel of channels) {
                if (!this.subscriptions[projectId][role][channel]) {
                    this.subscriptions[projectId][role][channel] = {};
                }
                this.subscriptions[projectId][role][channel][identifier] = true;
            }
        }

        this.connections[identifier] = {
            projectId,
            roles,
            channels
        };
    }

    public unsubscribe(identifier: any): void {
        const projectId = this.connections[identifier]?.projectId ?? '';
        const roles = this.connections[identifier]?.roles ?? [];

        for (const role of roles) {
            for (const channel in this.subscriptions[projectId][role]) {
                delete this.subscriptions[projectId][role][channel][identifier];

                if (Object.keys(this.subscriptions[projectId][role][channel]).length === 0) {
                    delete this.subscriptions[projectId][role][channel];
                }
            }

            if (Object.keys(this.subscriptions[projectId][role]).length === 0) {
                delete this.subscriptions[projectId][role];
            }
        }

        if (Object.keys(this.subscriptions[projectId]).length === 0) {
            delete this.subscriptions[projectId];
        }

        delete this.connections[identifier];
    }

    public hasSubscriber(projectId: string, role: string, channel: string = ''): boolean {
        if (channel === '') {
            return projectId in this.subscriptions && role in this.subscriptions[projectId];
        }

        return projectId in this.subscriptions &&
            role in this.subscriptions[projectId] &&
            channel in this.subscriptions[projectId][role];
    }

    public static async send(projectId: string, payload: any[], events: any[], channels: string[], roles: string[], options: any = {}): Promise<void> {
        if (channels.length === 0 || roles.length === 0 || projectId === '') {
            return;
        }

        const permissionsChanged = options.permissionsChanged ?? false;
        const userId = options.userId ?? null;

        const redisClient = createClient({
            url: `redis://${process.env._APP_REDIS_HOST}:${process.env._APP_REDIS_PORT}`
        });

        await redisClient.connect();

        await redisClient.publish('realtime', JSON.stringify({
            project: projectId,
            roles,
            permissionsChanged,
            userId,
            data: {
                events,
                channels,
                timestamp: DateTime.formatTz(DateTime.now()),
                payload
            }
        }));

        await redisClient.disconnect();
    }

    public getSubscribers(event: any): string[] {
        const receivers: Record<string, number> = {};

        if (this.subscriptions[event.project]) {
            for (const role in this.subscriptions[event.project]) {
                for (const channel of event.data.channels) {
                    if (this.subscriptions[event.project][role][channel] &&
                        (event.roles.includes(role) || event.roles.includes(Role.any().toString()))) {
                        for (const id in this.subscriptions[event.project][role][channel]) {
                            receivers[id] = 0;
                        }
                        break;
                    }
                }
            }
        }

        return Object.keys(receivers);
    }

    public static convertChannels(channels: string[], userId: string): string[] {
        const channelMap = new Map(channels.map(channel => [channel, true]));

        for (const key of channelMap.keys()) {
            if (key.startsWith('account.')) {
                channelMap.delete(key);
            } else if (key === 'account' && userId) {
                channelMap.set(`account.${userId}`, true);
                channelMap.delete(key);
            }
        }

        return Array.from(channelMap.keys());
    }

    public static fromPayload(event: string, payload: Document, project: Document | null = null, database: Document | null = null, collection: Document | null = null, bucket: Document | null = null): { channels: string[], roles: string[], permissionsChanged: boolean, projectId: string | null } {
        const channels: string[] = [];
        let roles: string[] = [];
        let permissionsChanged = false;
        let projectId: string | null = null;
        const parts = event.split('.');

        switch (parts[0]) {
            case 'users':
                channels.push('account', `account.${parts[1]}`);
                roles = [Role.user(ID.custom(parts[1])).toString()];
                break;
            case 'rules':
                channels.push('console');
                projectId = 'console';
                roles = [Role.team(project?.getAttribute('teamId') ?? '').toString()];
                break;
            case 'teams':
                if (parts[2] === 'memberships') {
                    permissionsChanged = !!parts[4];
                    channels.push('memberships', `memberships.${parts[3]}`);
                } else {
                    permissionsChanged = parts[2] === 'create';
                    channels.push('teams', `teams.${parts[1]}`);
                }
                roles = [Role.team(ID.custom(parts[1])).toString()];
                break;
            case 'databases':
                if (['attributes', 'indexes'].includes(parts[4] ?? '')) {
                    channels.push('console');
                    projectId = 'console';
                    roles = [Role.team(project?.getAttribute('teamId') ?? '').toString()];
                } else if (parts[4] === 'documents') {
                    if (!database || !collection) {
                        throw new Error('Database and Collection need to be passed to Realtime for Document events in the Database.');
                    }
                    channels.push('documents', `databases.${database.getId()}.collections.${payload.getAttribute('$collectionId')}.documents`, `databases.${database.getId()}.collections.${payload.getAttribute('$collectionId')}.documents.${payload.getId()}`);
                    roles = collection.getAttribute('documentSecurity', false) ? [...collection.getRead(), ...payload.getRead()] : collection.getRead();
                }
                break;
            case 'buckets':
                if (parts[2] === 'files') {
                    if (!bucket) {
                        throw new Error('Bucket needs to be passed to Realtime for File events in the Storage.');
                    }
                    channels.push('files', `buckets.${payload.getAttribute('bucketId')}.files`, `buckets.${payload.getAttribute('bucketId')}.files.${payload.getId()}`);
                    roles = bucket.getAttribute('fileSecurity', false) ? [...bucket.getRead(), ...payload.getRead()] : bucket.getRead();
                }
                break;
            case 'functions':
                if (parts[2] === 'executions') {
                    if (payload.getRead().length > 0) {
                        channels.push('console', 'executions', `executions.${payload.getId()}`, `functions.${payload.getAttribute('functionId')}`);
                        roles = payload.getRead();
                    }
                } else if (parts[2] === 'deployments') {
                    channels.push('console');
                    projectId = 'console';
                    roles = [Role.team(project?.getAttribute('teamId') ?? '').toString()];
                }
                break;
            case 'migrations':
                channels.push('console');
                projectId = 'console';
                roles = [Role.team(project?.getAttribute('teamId') ?? '').toString()];
                break;
        }

        return { channels, roles, permissionsChanged, projectId };
    }
}