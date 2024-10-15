import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';
import { Action } from '../../Tuval/Platform/Action';
import { Boolean, Text, View } from '../../Tuval/Core';
import { Config } from '../../Tuval/Config';
import { Console } from '../../Tuval/CLI';
import { Compose } from '../../Appconda/Docker/Compose';
import { Env } from '../../Appconda/Docker/Env';
import { Auth } from '../../Tuval/Auth';

export class Install extends Action {
    protected path: string = '/usr/src/code/appconda';

    public static getName(): string {
        return 'install';
    }

    constructor() {
        super();
        this.desc('Install Appconda')
            .param('http-port', '', new Text(4), 'Server HTTP port', true)
            .param('https-port', '', new Text(4), 'Server HTTPS port', true)
            .param('organization', 'appconda', new Text(0), 'Docker Registry organization', true)
            .param('image', 'appconda', new Text(0), 'Main appconda docker image', true)
            .param('interactive', 'Y', new Text(1), 'Run an interactive session', true)
            .param('no-start', false, new Boolean(true), 'Run an interactive session', true)
            .callback((httpPort, httpsPort, organization, image, interactive, noStart) => this.action(httpPort, httpsPort, organization, image, interactive, noStart));
    }

    public action(httpPort: string, httpsPort: string, organization: string, image: string, interactive: string, noStart: boolean): void {
        const config = Config.getParam('variables');
        let defaultHTTPPort = '80';
        let defaultHTTPSPort = '443';
        const vars: { [key: string]: any } = {};

        for (const category of config) {
            for (const variable of category.variables || []) {
                vars[variable.name] = variable;
            }
        }

        Console.success('Starting Appconda installation...');

        // Create directory with write permissions
        if (!fs.existsSync(path.dirname(this.path))) {
            try {
                fs.mkdirSync(path.dirname(this.path), { recursive: true, mode: 0o755 });
            } catch (error) {
                Console.error(`Can't create directory ${path.dirname(this.path)}`);
                process.exit(1);
            }
        }

        let data = fs.readFileSync(`${this.path}/docker-compose.yml`, 'utf8');

        if (data) {
            if (interactive === 'Y' && Console.isInteractive()) {
                const answer = Console.confirm('Previous installation found, do you want to overwrite it (a backup will be created before overwriting)? (Y/n)');

                if (answer.toLowerCase() !== 'y') {
                    Console.info('No action taken.');
                    return;
                }
            }

            const time = Date.now();
            Console.info(`Compose file found, creating backup: docker-compose.yml.${time}.backup`);
            fs.writeFileSync(`${this.path}/docker-compose.yml.${time}.backup`, data);
            const compose = new Compose(data);
            const appconda = compose.getService('appconda');
            const oldVersion = appconda?.getImageVersion();
            let ports: { [key: string]: string };

            try {
                ports = compose.getService('traefik').getPorts();
            } catch (error) {
                ports = {
                    [defaultHTTPPort]: defaultHTTPPort,
                    [defaultHTTPSPort]: defaultHTTPSPort
                };
                Console.warning('Traefik not found. Falling back to default ports.');
            }

            if (oldVersion) {
                for (const service of compose.getServices()) {
                    if (!service) continue;

                    const env = service.getEnvironment().list();

                    for (const [key, value] of Object.entries(env)) {
                        if (value === null) continue;

                        const configVar = vars[key] || {};
                        if (configVar && !configVar.overwrite) {
                            vars[key].default = value;
                        }
                    }
                }

                data = fs.readFileSync(`${this.path}/.env`, 'utf8');

                if (data) {
                    Console.info(`Env file found, creating backup: .env.${time}.backup`);
                    fs.writeFileSync(`${this.path}/.env.${time}.backup`, data);
                    const env = new Env(data);

                    for (const [key, value] of Object.entries(env.list())) {
                        if (value === null) continue;

                        const configVar = vars[key] || {};
                        if (configVar && !configVar.overwrite) {
                            vars[key].default = value;
                        }
                    }
                }

                for (const [key, value] of Object.entries(ports)) {
                    if (value === defaultHTTPPort) {
                        defaultHTTPPort = key;
                    }

                    if (value === defaultHTTPSPort) {
                        defaultHTTPSPort = key;
                    }
                }
            }
        }

        if (!httpPort) {
            httpPort = Console.confirm(`Choose your server HTTP port: (default: ${defaultHTTPPort})`) || defaultHTTPPort;
        }

        if (!httpsPort) {
            httpsPort = Console.confirm(`Choose your server HTTPS port: (default: ${defaultHTTPSPort})`) || defaultHTTPSPort;
        }

        const input: { [key: string]: any } = {};

        for (const variable of Object.values(vars)) {
            if (variable.filter && (interactive !== 'Y' || !Console.isInteractive())) {
                if (data && variable.default !== null) {
                    input[variable.name] = variable.default;
                    continue;
                }

                if (variable.filter === 'token') {
                    input[variable.name] = Auth.tokenGenerator();
                    continue;
                }

                if (variable.filter === 'password') {
                    input[variable.name] = Auth.passwordGenerator();
                    continue;
                }
            }

            if (!variable.required || !Console.isInteractive() || interactive !== 'Y') {
                input[variable.name] = variable.default;
                continue;
            }

            input[variable.name] = Console.confirm(`${variable.question} (default: '${variable.default}')`) || variable.default;

            if (variable.filter === 'domainTarget' && input[variable.name] !== 'localhost') {
                Console.warning(`\nIf you haven't already done so, set the following record for ${input[variable.name]} on your DNS provider:\n`);
                Console.warning(`Type           Name       Value`);
                Console.warning(`A or AAAA      @          <YOUR PUBLIC IP>`);
                Console.warning(`\nUse 'AAAA' if you're using an IPv6 address and 'A' if you're using an IPv4 address.\n`);
            }
        }

        const templateForCompose = new View(path.join(__dirname, '../../../../app/views/install/compose.phtml'));
        const templateForEnv = new View(path.join(__dirname, '../../../../app/views/install/env.phtml'));

        templateForCompose
            .setParam('httpPort', httpPort)
            .setParam('httpsPort', httpsPort)
            .setParam('version', process.env.APP_VERSION_STABLE)
            .setParam('organization', organization)
            .setParam('image', image);

        templateForEnv.setParam('vars', input);

        try {
            fs.writeFileSync(`${this.path}/docker-compose.yml`, templateForCompose.render(false));
        } catch (error) {
            const message = 'Failed to save Docker Compose file';
            Console.error(message);
            process.exit(1);
        }

        try {
            fs.writeFileSync(`${this.path}/.env`, templateForEnv.render(false));
        } catch (error) {
            const message = 'Failed to save environment variables file';
            Console.error(message);
            process.exit(1);
        }

        let env = '';
        let stdout = '';
        let stderr = '';

        for (const [key, value] of Object.entries(input)) {
            if (value) {
                env += `${key}=${child_process.execSync(`echo ${value}`).toString().trim()} `;
            }
        }

        let exit = 0 as any;
        if (!noStart) {
            Console.log(`Running "docker compose up -d --remove-orphans --renew-anon-volumes"`);
            exit = child_process.execSync(`${env} docker compose --project-directory ${this.path} up -d --remove-orphans --renew-anon-volumes`, { stdio: 'inherit' });
        }

        if (exit !== 0) {
            const message = 'Failed to install Appconda dockers';
            Console.error(message);
            Console.error(stderr);
            process.exit(exit);
        } else {
            const message = 'Appconda installed successfully';
            Console.success(message);
        }
    }
}
