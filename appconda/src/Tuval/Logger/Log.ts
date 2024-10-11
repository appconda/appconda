import { Breadcrumb } from "./Log/Breadcrumb";
import { User } from "./Log/User";

export class Log {
    static readonly TYPE_DEBUG = 'debug';
    static readonly TYPE_ERROR = 'error';
    static readonly TYPE_WARNING = 'warning';
    static readonly TYPE_INFO = 'info';
    static readonly TYPE_VERBOSE = 'verbose';

    static readonly ENVIRONMENT_PRODUCTION = 'production';
    static readonly ENVIRONMENT_STAGING = 'staging';

    private timestamp: number;
    private type?: string;
    private message?: string;
    private version?: string;
    private environment?: string;
    private action?: string;
    private tags: { [key: string]: string } = {};
    private extra: { [key: string]: any } = {};
    private namespace: string = 'UNKNOWN';
    private server: string  = null as any;
    private user: User  = null as any;
    private breadcrumbs: Breadcrumb[] = [];

    constructor() {
        this.timestamp = Date.now() / 1000;
    }

    setType(type: string): void {
        switch (type) {
            case Log.TYPE_DEBUG:
            case Log.TYPE_ERROR:
            case Log.TYPE_VERBOSE:
            case Log.TYPE_INFO:
            case Log.TYPE_WARNING:
                break;
            default:
                throw new Error('Unsupported log type. Must be one of Log.TYPE_DEBUG, Log.TYPE_ERROR, Log.TYPE_WARNING, Log.TYPE_INFO, Log.TYPE_VERBOSE.');
        }
        this.type = type;
    }

    getType(): string {
        return this.type ?? '';
    }

    setTimestamp(timestamp: number): void {
        this.timestamp = timestamp;
    }

    getTimestamp(): number {
        return this.timestamp;
    }

    setMessage(message: string): void {
        this.message = message;
    }

    getMessage(): string {
        return this.message ?? '';
    }

    setNamespace(namespace: string): void {
        this.namespace = namespace;
    }

    getNamespace(): string | null {
        return this.namespace;
    }

    setAction(action: string): void {
        this.action = action;
    }

    getAction(): string {
        return this.action ?? '';
    }

    setServer(server: string ): void {
        this.server = server;
    }

    getServer(): string | null {
        return this.server;
    }

    setVersion(version: string): void {
        this.version = version;
    }

    getVersion(): string {
        return this.version ?? '';
    }

    setEnvironment(environment: string): void {
        switch (environment) {
            case Log.ENVIRONMENT_PRODUCTION:
            case Log.ENVIRONMENT_STAGING:
                break;
            default:
                throw new Error('Unsupported environment of log. Must be one of ENVIRONMENT_PRODUCTION, ENVIRONMENT_STAGING.');
        }
        this.environment = environment;
    }

    getEnvironment(): string {
        return this.environment ?? '';
    }

    addTag(key: string, value: string): void {
        this.tags[key] = value;
    }

    getTags(): { [key: string]: string } {
        return this.tags;
    }

    addExtra(key: string, value: any): void {
        this.extra[key] = value;
    }

    getExtra(): { [key: string]: any } {
        return this.extra;
    }

    setUser(user: User): void {
        this.user = user;
    }

    getUser(): User  {
        return this.user;
    }

    addBreadcrumb(breadcrumb: Breadcrumb): void {
        this.breadcrumbs.push(breadcrumb);
    }

    getBreadcrumbs(): Breadcrumb[] {
        return this.breadcrumbs;
    }
}
