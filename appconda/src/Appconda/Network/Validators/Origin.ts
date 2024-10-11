import { Validator, Hostname } from '../../../Tuval/Core';
import { parse } from 'url';

export class Origin extends Validator {
    public static readonly CLIENT_TYPE_UNKNOWN = 'unknown';
    public static readonly CLIENT_TYPE_WEB = 'web';
    public static readonly CLIENT_TYPE_FLUTTER_IOS = 'flutter-ios';
    public static readonly CLIENT_TYPE_FLUTTER_ANDROID = 'flutter-android';
    public static readonly CLIENT_TYPE_FLUTTER_MACOS = 'flutter-macos';
    public static readonly CLIENT_TYPE_FLUTTER_WINDOWS = 'flutter-windows';
    public static readonly CLIENT_TYPE_FLUTTER_LINUX = 'flutter-linux';
    public static readonly CLIENT_TYPE_FLUTTER_WEB = 'flutter-web';
    public static readonly CLIENT_TYPE_APPLE_IOS = 'apple-ios';
    public static readonly CLIENT_TYPE_APPLE_MACOS = 'apple-macos';
    public static readonly CLIENT_TYPE_APPLE_WATCHOS = 'apple-watchos';
    public static readonly CLIENT_TYPE_APPLE_TVOS = 'apple-tvos';
    public static readonly CLIENT_TYPE_ANDROID = 'android';
    public static readonly CLIENT_TYPE_UNITY = 'unity';

    public static readonly SCHEME_TYPE_HTTP = 'http';
    public static readonly SCHEME_TYPE_HTTPS = 'https';
    public static readonly SCHEME_TYPE_IOS = 'appconda-ios';
    public static readonly SCHEME_TYPE_MACOS = 'appconda-macos';
    public static readonly SCHEME_TYPE_WATCHOS = 'appconda-watchos';
    public static readonly SCHEME_TYPE_TVOS = 'appconda-tvos';
    public static readonly SCHEME_TYPE_ANDROID = 'appconda-android';
    public static readonly SCHEME_TYPE_WINDOWS = 'appconda-windows';
    public static readonly SCHEME_TYPE_LINUX = 'appconda-linux';

    protected platforms: { [key: string]: string } = {
        [Origin.SCHEME_TYPE_HTTP]: 'Web',
        [Origin.SCHEME_TYPE_HTTPS]: 'Web',
        [Origin.SCHEME_TYPE_IOS]: 'iOS',
        [Origin.SCHEME_TYPE_MACOS]: 'macOS',
        [Origin.SCHEME_TYPE_WATCHOS]: 'watchOS',
        [Origin.SCHEME_TYPE_TVOS]: 'tvOS',
        [Origin.SCHEME_TYPE_ANDROID]: 'Android',
        [Origin.SCHEME_TYPE_WINDOWS]: 'Windows',
        [Origin.SCHEME_TYPE_LINUX]: 'Linux',
    };

    protected clients: string[] = [];
    protected client: string = Origin.CLIENT_TYPE_UNKNOWN;
    protected host: string = '';

    constructor(platforms: any[]) {
        super();
        for (const platform of platforms) {
            const type = platform.type || '';

            switch (type) {
                case Origin.CLIENT_TYPE_WEB:
                case Origin.CLIENT_TYPE_FLUTTER_WEB:
                    this.clients.push(platform.hostname || '');
                    break;

                case Origin.CLIENT_TYPE_FLUTTER_IOS:
                case Origin.CLIENT_TYPE_FLUTTER_ANDROID:
                case Origin.CLIENT_TYPE_FLUTTER_MACOS:
                case Origin.CLIENT_TYPE_FLUTTER_WINDOWS:
                case Origin.CLIENT_TYPE_FLUTTER_LINUX:
                case Origin.CLIENT_TYPE_ANDROID:
                case Origin.CLIENT_TYPE_APPLE_IOS:
                case Origin.CLIENT_TYPE_APPLE_MACOS:
                case Origin.CLIENT_TYPE_APPLE_WATCHOS:
                case Origin.CLIENT_TYPE_APPLE_TVOS:
                    this.clients.push(platform.key || '');
                    break;

                default:
                    break;
            }
        }
    }

    public getDescription(): string {
        if (!this.platforms.hasOwnProperty(this.client)) {
            return 'Unsupported platform';
        }

        return `Invalid Origin. Register your new client (${this.host}) as a new ${this.platforms[this.client]} platform on your project console dashboard`;
    }

    public isValid(origin: any): boolean {
        if (typeof origin !== 'string') {
            return false;
        }

        const parsedUrl = parse(origin);
        const scheme = parsedUrl.protocol?.replace(':', '');
        const host = parsedUrl.hostname;

        this.host = host || '';
        this.client = scheme || '';

        if (!host) {
            return true;
        }

        const validator = new Hostname(this.clients);

        return validator.isValid(host);
    }

    public isArray(): boolean {
        return false;
    }

    public getType(): string {
        return Validator.TYPE_STRING;
    }
}