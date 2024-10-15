import { APP_PLATFORM_CLIENT, APP_PLATFORM_CONSOLE, APP_PLATFORM_SERVER } from "../../app/config/platforms";
import { APP_AUTH_TYPE_ADMIN, APP_AUTH_TYPE_JWT, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_SESSION, APP_EMAIL_TEAM, APP_NAME, APP_VERSION_STABLE } from "../../app/init";
import { Cache, None } from "../../Tuval/Cache";
import { Console } from "../../Tuval/CLI";
import { Config } from "../../Tuval/Config";
import { Text, WhiteList } from "../../Tuval/Core";
import { Database, MariaDB } from "../../Tuval/Database";
import { App } from "../../Tuval/Http";
import { Action } from "../../Tuval/Platform/Action";
import { Registry } from "../../Tuval/Registry";
import { Request } from "../../Appconda/Tuval/Request";
import { Response } from "../../Appconda/Tuval/Response";
const fs = require('fs');

export class Specs extends Action {
    public static getName(): string {
        return 'specs';
    }

    constructor() {
        super();
        this.desc('Generate Appconda API specifications')
            .param('version', 'latest', new Text(16), 'Spec version', true)
            .param('mode', 'normal', new WhiteList(['normal', 'mocks']), 'Spec Mode', true)
            .inject('register')
            .callback((version: string, mode: string, register: Registry) => this.action(version, mode, register));
    }

    public async action(version: string, mode: string, register: Registry): Promise<void> {
        const appRoutes = App.getRoutes();
        const response = new Response(new HttpResponse());
        const mocks = (mode === 'mocks');

        // Mock dependencies
        App.setResource('request', () => new Request());
        App.setResource('response', () => response);
        App.setResource('dbForConsole', () => new Database(new MariaDB(''), new Cache(new None())));
        App.setResource('dbForProject', () => new Database(new MariaDB(''), new Cache(new None())));

        const platforms = {
            client: APP_PLATFORM_CLIENT,
            server: APP_PLATFORM_SERVER,
            console: APP_PLATFORM_CONSOLE,
        };

        const authCounts = {
            client: 1,
            server: 2,
            console: 1,
        };

        const keys = {
            [APP_PLATFORM_CLIENT]: {
                Project: {
                    type: 'apiKey',
                    name: 'X-Appconda-Project',
                    description: 'Your project ID',
                    in: 'header',
                },
                JWT: {
                    type: 'apiKey',
                    name: 'X-Appconda-JWT',
                    description: 'Your secret JSON Web Token',
                    in: 'header',
                },
                Locale: {
                    type: 'apiKey',
                    name: 'X-Appconda-Locale',
                    description: '',
                    in: 'header',
                },
                Session: {
                    type: 'apiKey',
                    name: 'X-Appconda-Session',
                    description: 'The user session to authenticate with',
                    in: 'header',
                }
            },
            [APP_PLATFORM_SERVER]: {
                Project: {
                    type: 'apiKey',
                    name: 'X-Appconda-Project',
                    description: 'Your project ID',
                    in: 'header',
                },
                Key: {
                    type: 'apiKey',
                    name: 'X-Appconda-Key',
                    description: 'Your secret API key',
                    in: 'header',
                },
                JWT: {
                    type: 'apiKey',
                    name: 'X-Appconda-JWT',
                    description: 'Your secret JSON Web Token',
                    in: 'header',
                },
                Locale: {
                    type: 'apiKey',
                    name: 'X-Appconda-Locale',
                    description: '',
                    in: 'header',
                },
                Session: {
                    type: 'apiKey',
                    name: 'X-Appconda-Session',
                    description: 'The user session to authenticate with',
                    in: 'header',
                },
                ForwardedUserAgent: {
                    type: 'apiKey',
                    name: 'X-Forwarded-User-Agent',
                    description: 'The user agent string of the client that made the request',
                    in: 'header',
                },
            },
            [APP_PLATFORM_CONSOLE]: {
                Project: {
                    type: 'apiKey',
                    name: 'X-Appconda-Project',
                    description: 'Your project ID',
                    in: 'header',
                },
                Key: {
                    type: 'apiKey',
                    name: 'X-Appconda-Key',
                    description: 'Your secret API key',
                    in: 'header',
                },
                JWT: {
                    type: 'apiKey',
                    name: 'X-Appconda-JWT',
                    description: 'Your secret JSON Web Token',
                    in: 'header',
                },
                Locale: {
                    type: 'apiKey',
                    name: 'X-Appconda-Locale',
                    description: '',
                    in: 'header',
                },
                Mode: {
                    type: 'apiKey',
                    name: 'X-Appconda-Mode',
                    description: '',
                    in: 'header',
                },
            },
        };

        for (const platform of Object.values(platforms)) {
            const routes = [];
            let models = [];
            const services = [];

            for (const method of Object.values(appRoutes)) {
                for (const route of method) {
                    const hide = route.getLabel('sdk.hide', false);
                    if (hide === true || (Array.isArray(hide) && hide.includes(platform))) {
                        continue;
                    }

                    const routeSecurity = route.getLabel('sdk.auth', []);
                    const sdkPlatforms = [];

                    for (const value of routeSecurity) {
                        switch (value) {
                            case APP_AUTH_TYPE_SESSION:
                                sdkPlatforms.push(APP_PLATFORM_CLIENT);
                                break;
                            case APP_AUTH_TYPE_KEY:
                                sdkPlatforms.push(APP_PLATFORM_SERVER);
                                break;
                            case APP_AUTH_TYPE_JWT:
                                sdkPlatforms.push(APP_PLATFORM_SERVER);
                                break;
                            case APP_AUTH_TYPE_ADMIN:
                                sdkPlatforms.push(APP_PLATFORM_CONSOLE);
                                break;
                        }
                    }

                    if (routeSecurity.length === 0) {
                        sdkPlatforms.push(APP_PLATFORM_SERVER, APP_PLATFORM_CLIENT);
                    }

                    if (!route.getLabel('docs', true)) {
                        continue;
                    }

                    if (route.getLabel('sdk.mock', false) && !mocks) {
                        continue;
                    }

                    if (!route.getLabel('sdk.mock', false) && mocks) {
                        continue;
                    }

                    if (!route.getLabel('sdk.namespace', null)) {
                        continue;
                    }

                    if (platform !== APP_PLATFORM_CONSOLE && !sdkPlatforms.includes(platform)) {
                        continue;
                    }

                    routes.push(route);
                }
            }

            for (const service of Config.getParam('services', [])) {
                if (!service.docs || !service.sdk) {
                    continue;
                }

                services.push({
                    name: service.key ?? '',
                    description: service.subtitle ?? '',
                    'x-globalAttributes': service.globalAttributes ?? [],
                });
            }

             models = response.getModels();

            for (const [key, value] of Object.entries(models)) {
                if (platform !== APP_PLATFORM_CONSOLE && !value.isPublic()) {
                    delete models[key];
                }
            }

            const _arguments = [new App('UTC'), services, routes, models, keys[platform], authCounts[platform] ?? 0];
            for (const format of ['swagger2', 'open-api3']) {
                const formatInstance = format === 'swagger2' ? new Swagger2(..._arguments) : new OpenAPI3(..._arguments);

                const specs = new Specification(formatInstance);
                const endpoint = process.env._APP_HOME || '[HOSTNAME]';
                const email = process.env._APP_SYSTEM_TEAM_EMAIL || APP_EMAIL_TEAM;

                formatInstance
                    .setParam('name', APP_NAME)
                    .setParam('description', 'Appconda backend as a service cuts up to 70% of the time and costs required for building a modern application. We abstract and simplify common development tasks behind a REST APIs, to help you develop your app in a fast and secure way. For full API documentation and tutorials go to [https://appconda.io/docs](https://appconda.io/docs)')
                    .setParam('endpoint', 'https://cloud.appconda.io/v1')
                    .setParam('version', APP_VERSION_STABLE)
                    .setParam('terms', `${endpoint}/policy/terms`)
                    .setParam('support.email', email)
                    .setParam('support.url', `${endpoint}/support`)
                    .setParam('contact.name', `${APP_NAME} Team`)
                    .setParam('contact.email', email)
                    .setParam('contact.url', `${endpoint}/support`)
                    .setParam('license.name', 'BSD-3-Clause')
                    .setParam('license.url', 'https://raw.githubusercontent.com/appconda/appconda/master/LICENSE')
                    .setParam('docs.description', 'Full API docs, specs and tutorials')
                    .setParam('docs.url', `${endpoint}/docs`);

                const path = mocks
                    ? `${__dirname}/../../../../app/config/specs/${format}-mocks-${platform}.json`
                    : `${__dirname}/../../../../app/config/specs/${format}-${version}-${platform}.json`;

                if (!fs.writeFileSync(path, JSON.stringify(specs.parse(), null, 2))) {
                    throw new Error(`Failed to save ${mocks ? 'mocks ' : ''}spec file: ${path}`);
                }

                Console.success(`Saved ${mocks ? 'mocks ' : ''}spec file: ${path}`);
            }
        }
    }
}