import { Document } from '../../Tuval/Core';
import { Client, Connection } from '../../Tuval/Queue';


export class Event {
    public static readonly DATABASE_QUEUE_NAME = 'v1-database';
    public static readonly DATABASE_CLASS_NAME = 'DatabaseV1';

    public static readonly DELETE_QUEUE_NAME = 'v1-deletes';
    public static readonly DELETE_CLASS_NAME = 'DeletesV1';

    public static readonly AUDITS_QUEUE_NAME = 'v1-audits';
    public static readonly AUDITS_CLASS_NAME = 'AuditsV1';

    public static readonly MAILS_QUEUE_NAME = 'v1-mails';
    public static readonly MAILS_CLASS_NAME = 'MailsV1';

    public static readonly FUNCTIONS_QUEUE_NAME = 'v1-functions';
    public static readonly FUNCTIONS_CLASS_NAME = 'FunctionsV1';

    public static readonly USAGE_QUEUE_NAME = 'v1-usage';
    public static readonly USAGE_CLASS_NAME = 'UsageV1';

    public static readonly USAGE_DUMP_QUEUE_NAME = 'v1-usage-dump';
    public static readonly USAGE_DUMP_CLASS_NAME = 'UsageDumpV1';

    public static readonly WEBHOOK_QUEUE_NAME = 'v1-webhooks';
    public static readonly WEBHOOK_CLASS_NAME = 'WebhooksV1';

    public static readonly CERTIFICATES_QUEUE_NAME = 'v1-certificates';
    public static readonly CERTIFICATES_CLASS_NAME = 'CertificatesV1';

    public static readonly BUILDS_QUEUE_NAME = 'v1-builds';
    public static readonly BUILDS_CLASS_NAME = 'BuildsV1';

    public static readonly MESSAGING_QUEUE_NAME = 'v1-messaging';
    public static readonly MESSAGING_CLASS_NAME = 'MessagingV1';

    public static readonly MIGRATIONS_QUEUE_NAME = 'v1-migrations';
    public static readonly MIGRATIONS_CLASS_NAME = 'MigrationsV1';

    protected queue: string = '';
    protected class: string = '';
    protected event: string = '';
    protected params: Record<string, any> = {};
    protected sensitive: Record<string, boolean> = {};
    protected payload: Record<string, any> = {};
    protected context: Record<string, Document> = {};
    protected project: Document | null = null;
    protected user: Document | null = null;
    protected paused: boolean = false;

    constructor(protected connection: Connection) {}

    public setQueue(queue: string): this {
        this.queue = queue;
        return this;
    }

    public getQueue(): string {
        return this.queue;
    }

    public setEvent(event: string): this {
        this.event = event;
        return this;
    }

    public getEvent(): string {
        return this.event;
    }

    public setProject(project: Document): this {
        this.project = project;
        return this;
    }

    public getProject(): Document | null {
        return this.project;
    }

    public setUser(user: Document): this {
        this.user = user;
        return this;
    }

    public getUser(): Document | null {
        return this.user;
    }

    public setPayload(payload: Record<string, any>, sensitive: string[] = []): this {
        this.payload = payload;
        sensitive.forEach(key => {
            this.sensitive[key] = true;
        });
        return this;
    }

    public getPayload(): Record<string, any> {
        return this.payload;
    }

    public getRealtimePayload(): Record<string, any> {
        const payload: Record<string, any> = {};
        for (const key in this.payload) {
            if (!this.sensitive[key]) {
                payload[key] = this.payload[key];
            }
        }
        return payload;
    }

    public setContext(key: string, context: Document): this {
        this.context[key] = context;
        return this;
    }

    public getContext(key: string): Document | null {
        return this.context[key] ?? null;
    }

    public setClass(className: string): this {
        this.class = className;
        return this;
    }

    public getClass(): string {
        return this.class;
    }

    public setParam(key: string, value: any): this {
        this.params[key] = value;
        return this;
    }

    public setParamSensitive(key: string): this {
        this.sensitive[key] = true;
        return this;
    }

    public getParam(key: string): any {
        return this.params[key] ?? null;
    }

    public getParams(): Record<string, any> {
        return this.params;
    }

    public async trigger(): Promise<string | boolean> {
        if (this.paused) {
            return false;
        }

        const client = new Client(this.queue, this.connection);
        return client.enqueue({
            project: this.project,
            user: this.user,
            payload: this.payload,
            context: this.context,
            events: Event.generateEvents(this.getEvent(), this.getParams())
        });
    }

    public reset(): this {
        this.params = {};
        this.sensitive = {};
        return this;
    }

    public static parseEventPattern(pattern: string): Record<string, any> {
        const parts = pattern.split('.');
        const count = parts.length;

        const type = parts[0] ?? false;
        const resource = parts[1] ?? false;
        const hasSubResource = count > 3 && parts[3].startsWith('[');
        const hasSubSubResource = count > 5 && parts[5].startsWith('[') && hasSubResource;

        let subType, subResource, subSubType, subSubResource, attribute;

        if (hasSubResource) {
            subType = parts[2];
            subResource = parts[3];
        }

        if (hasSubSubResource) {
            subSubType = parts[4];
            subSubResource = parts[5];
            if (count === 8) {
                attribute = parts[7];
            }
        }

        if (hasSubResource && !hasSubSubResource) {
            if (count === 6) {
                attribute = parts[5];
            }
        }

        if (!hasSubResource) {
            if (count === 4) {
                attribute = parts[3];
            }
        }

        const action = (() => {
            if (!hasSubResource && count > 2) return parts[2];
            if (hasSubSubResource) return parts[6] ?? false;
            if (hasSubResource && count > 4) return parts[4];
            return false;
        })();

        return {
            type,
            resource,
            subType: subType ?? false,
            subResource: subResource ?? false,
            subSubType: subSubType ?? false,
            subSubResource: subSubResource ?? false,
            action,
            attribute: attribute ?? false,
        };
    }

    public static generateEvents(pattern: string, params: Record<string, any> = {}): string[] {
        const paramKeys = Object.keys(params);
        const paramValues = Object.values(params);

        const patterns: string[] = [];

        const parsed = this.parseEventPattern(pattern);
        const { type, resource, subType, subResource, subSubType, subSubResource, action, attribute } = parsed;

        if (resource && !paramKeys.includes(resource.replace(/[\[\]]/g, ''))) {
            throw new Error(`${resource} is missing from the params.`);
        }

        if (subResource && !paramKeys.includes(subResource.replace(/[\[\]]/g, ''))) {
            throw new Error(`${subResource} is missing from the params.`);
        }

        if (subSubResource && !paramKeys.includes(subSubResource.replace(/[\[\]]/g, ''))) {
            throw new Error(`${subSubResource} is missing from the params.`);
        }

        if (action) {
            if (subSubResource) {
                if (attribute) {
                    patterns.push([type, resource, subType, subResource, subSubType, subSubResource, action, attribute].join('.'));
                }
                patterns.push([type, resource, subType, subResource, subSubType, subSubResource, action].join('.'));
                patterns.push([type, resource, subType, subResource, subSubType, subSubResource].join('.'));
            } else if (subResource) {
                if (attribute) {
                    patterns.push([type, resource, subType, subResource, action, attribute].join('.'));
                }
                patterns.push([type, resource, subType, subResource, action].join('.'));
                patterns.push([type, resource, subType, subResource].join('.'));
            } else {
                patterns.push([type, resource, action].join('.'));
            }
            if (attribute) {
                patterns.push([type, resource, action, attribute].join('.'));
            }
        }
        if (subSubResource) {
            patterns.push([type, resource, subType, subResource, subSubType, subSubResource].join('.'));
        }
        if (subResource) {
            patterns.push([type, resource, subType, subResource].join('.'));
        }
        patterns.push([type, resource].join('.'));

        const uniquePatterns = Array.from(new Set(patterns));

        const events: string[] = [];
        uniquePatterns.forEach(eventPattern => {
            events.push(eventPattern.replace(new RegExp(paramKeys.join('|'), 'g'), match => params[match]));
            events.push(eventPattern.replace(new RegExp(paramKeys.join('|'), 'g'), '*'));
            paramKeys.forEach(key => {
                paramKeys.forEach(current => {
                    if (subSubResource) {
                        paramKeys.forEach(subCurrent => {
                            if (subCurrent === current || subCurrent === key) return;
                            const filtered1 = paramKeys.filter(k => k === subCurrent);
                            events.push(eventPattern.replace(new RegExp(paramKeys.join('|'), 'g'), match => params[match]).replace(new RegExp(filtered1.join('|'), 'g'), '*'));
                            const filtered2 = paramKeys.filter(k => k === current);
                            events.push(eventPattern.replace(new RegExp(paramKeys.join('|'), 'g'), match => params[match]).replace(new RegExp(filtered2.join('|'), 'g'), '*').replace(new RegExp(filtered1.join('|'), 'g'), '*'));
                            events.push(eventPattern.replace(new RegExp(paramKeys.join('|'), 'g'), match => params[match]).replace(new RegExp(filtered2.join('|'), 'g'), '*'));
                        });
                    } else {
                        if (current === key) return;
                        const filtered = paramKeys.filter(k => k === current);
                        events.push(eventPattern.replace(new RegExp(paramKeys.join('|'), 'g'), match => params[match]).replace(new RegExp(filtered.join('|'), 'g'), '*'));
                    }
                });
            });
        });

        return Array.from(new Set(events.map(event => event.replace(/[\[\]]/g, ''))));
    }

    public isPaused(): boolean {
        return this.paused;
    }

    public setPaused(paused: boolean): this {
        this.paused = paused;
        return this;
    }
}