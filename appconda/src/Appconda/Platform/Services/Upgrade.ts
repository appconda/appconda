import { Console } from "../../../Tuval/CLI";
import { Boolean, Text } from "../../../Tuval/Core";
import { Install } from "./Install";
const fs = require('fs');

export class Upgrade extends Install {
    public static getName(): string {
        return 'upgrade';
    }

    constructor() {
        super();
        this.desc('Upgrade Appwrite')
            .param('http-port', '', new Text(4), 'Server HTTP port', true)
            .param('https-port', '', new Text(4), 'Server HTTPS port', true)
            .param('organization', 'appwrite', new Text(0), 'Docker Registry organization', true)
            .param('image', 'appwrite', new Text(0), 'Main appwrite docker image', true)
            .param('interactive', 'Y', new Text(1), 'Run an interactive session', true)
            .param('no-start', false, new Boolean(true), 'Run an interactive session', true)
            .callback((httpPort: string, httpsPort: string, organization: string, image: string, interactive: string, noStart: boolean) => this.action(httpPort, httpsPort, organization, image, interactive, noStart));
    }

    public action(httpPort: string, httpsPort: string, organization: string, image: string, interactive: string, noStart: boolean): void {
        // Check for previous installation
        const data = fs.readFileSync(`${this.path}/docker-compose.yml`, 'utf8');
        if (!data) {
            Console.error('Appwrite installation not found.');
            Console.log('The command was not run in the parent folder of your appwrite installation.');
            Console.log('Please navigate to the parent directory of the Appwrite installation and try again.');
            Console.log('  parent_directory <= you run the command in this directory');
            Console.log('  └── appwrite');
            Console.log('      └── docker-compose.yml');
            process.exit(1);
        }
        super.action(httpPort, httpsPort, organization, image, interactive, noStart);
    }
}