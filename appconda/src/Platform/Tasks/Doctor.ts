import path from "path";
import { Network } from "../../Tuval/Clamav/Network";
import { Console } from "../../Tuval/CLI";
import { Config } from "../../Tuval/Config";
import { Domain } from "../../Tuval/Domains";
import { DSN } from "../../Tuval/DSN";
import { App } from "../../Tuval/Http";
import { Logger } from "../../Tuval/Logger";
import { Action } from "../../Tuval/Platform/Action";
import { Registry } from "../../Tuval/Registry";
import { Local, Storage } from "../../Tuval/Storage";

import { promises as fs } from 'fs';

async function isReadable(path: string): Promise<boolean> {
    try {
        await fs.access(path, fs.constants.R_OK);
        return true; // The directory is readable
    } catch (error) {
        return false; // The directory is not readable
    }
}

async function isWritable(dir: string): Promise<boolean> {
    const testFilePath = path.join(dir, 'test-write-access.tmp');

    try {
        // Try to write a temporary file to the directory
        await fs.writeFile(testFilePath, 'test');
        // If successful, delete the temporary file
        await fs.unlink(testFilePath);
        return true; // The directory is writable
    } catch (error) {
        return false; // The directory is not writable
    }
}

export class Doctor extends Action {
    public static getName(): string {
        return 'doctor';
    }

    constructor() {
        super();
        this.desc('Validate server health')
            .inject('register')
            .callback((register: Registry) => this.action(register));
    }

    public async action(register: Registry): Promise<void> {

        console.log(`%c
   _____                                         .___       
  /  _  \ ______ ______   ____  ____   ____    __| _/____   
 /  /_\  \\____ \\____ \_/ ___\/  _ \ /    \  / __ |\__  \  
/    |    \  |_> >  |_> >  \__(  <_> )   |  \/ /_/ | / __ \_
\____|__  /   __/|   __/ \___  >____/|___|  /\____ |(____  /
        \/|__|   |__|        \/           \/      \/     \/ `, `font-family: monospace`);



        Console.log(`\n👩‍⚕️ Running ${process.env.APP_NAME} Doctor for version ${process.env._APP_VERSION || 'UNKNOWN'} ...\n`);

        Console.log('[Settings]');

        let domain = new Domain(process.env._APP_DOMAIN);

        if (!domain.isKnown() || domain.isTest()) {
            Console.error(`🔴 Hostname has no public suffix (${domain.get()})`);
        } else {
            Console.success(`🟢 Hostname has a public suffix (${domain.get()})`);
        }

        domain = new Domain(process.env._APP_DOMAIN_TARGET);

        if (!domain.isKnown() || domain.isTest()) {
            Console.error(`🔴 CNAME target has no public suffix (${domain.get()})`);
        } else {
            Console.success(`🟢 CNAME target has a public suffix (${domain.get()})`);
        }

        if (process.env._APP_OPENSSL_KEY_V1 === 'your-secret-key' || !process.env._APP_OPENSSL_KEY_V1) {
            Console.error('🔴 Not using a unique secret key for encryption');
        } else {
            Console.success('🟢 Using a unique secret key for encryption');
        }

        if (process.env._APP_ENV !== 'production') {
            Console.error('🔴 App environment is set for development');
        } else {
            Console.success('🟢 App environment is set for production');
        }

        if (process.env._APP_OPTIONS_ABUSE !== 'enabled') {
            Console.error('🔴 Abuse protection is disabled');
        } else {
            Console.success('🟢 Abuse protection is enabled');
        }
         

        const authWhitelistRoot = process.env._APP_CONSOLE_WHITELIST_ROOT || null;
        const authWhitelistEmails = process.env._APP_CONSOLE_WHITELIST_EMAILS || null;
        const authWhitelistIPs = process.env._APP_CONSOLE_WHITELIST_IPS || null;

        if (!authWhitelistRoot && !authWhitelistEmails && !authWhitelistIPs) {
            Console.error('🔴 Console access limits are disabled');
        } else {
            Console.success('🟢 Console access limits are enabled');
        }

        if (process.env._APP_OPTIONS_FORCE_HTTPS !== 'enabled') {
            Console.error('🔴 HTTPS force option is disabled');
        } else {
            Console.success('🟢 HTTPS force option is enabled');
        }

        if (process.env._APP_OPTIONS_FUNCTIONS_FORCE_HTTPS !== 'enabled') {
            Console.error('🔴 HTTPS force option is disabled for function domains');
        } else {
            Console.success('🟢 HTTPS force option is enabled for function domains');
        }

        const providerConfig = process.env._APP_LOGGING_CONFIG || '';

        try {
            const loggingProvider = new DSN(providerConfig ?? '');

            const providerName = loggingProvider.getScheme();

            if (!providerName || !Logger.hasProvider(providerName)) {
                Console.error('🔴 Logging adapter is disabled');
            } else {
                Console.success(`🟢 Logging adapter is enabled (${providerName})`);
            }
        } catch (error) {
            Console.error('🔴 Logging adapter is misconfigured');
        }

        setTimeout(() => {}, 200);

        try {
            Console.info('\n[Connectivity]');
        } catch (error) {
            // Handle error
        }

        const pools = register.get('pools'); // Assuming pools is an object with a get method
        const configs = {
            'Console.DB': Config.getParam('pools-console'),
            'Projects.DB': Config.getParam('pools-database'),
        };

        for (const [key, config] of Object.entries(configs)) {
            for (const database of config) {
                try {
                    const connection  = await pools.get(database).pop();
                    const adapter = connection.getResource();

                    if (adapter.ping()) {
                        Console.success(`🟢 ${key}(${database}) connected`);
                    } else {
                        Console.error(`🔴 ${key}(${database}) disconnected`);
                    }
                } catch (error) {
                    Console.error(`🔴 ${key}(${database}) disconnected`);
                }
            }
        }

        const otherConfigs = {
            'Cache': Config.getParam('pools-cache'),
            'Queue': Config.getParam('pools-queue'),
            'PubSub': Config.getParam('pools-pubsub'),
        };

        for (const [key, config] of Object.entries(otherConfigs)) {
            for (const pool of config) {
                try {
                    const connection =  await pools.get(pool).pop();
                    const adapter = connection.getResource();

                    if (adapter.ping()) {
                        Console.success(`🟢 ${key}(${pool}) connected`);
                    } else {
                        Console.error(`🔴 ${key}(${pool}) disconnected`);
                    }
                } catch (error) {
                    Console.error(`🔴 ${key}(${pool}) disconnected`);
                }
            }
        }

        if (process.env._APP_STORAGE_ANTIVIRUS === 'enabled') {
            try {
                const antivirus = new Network(
                    process.env._APP_STORAGE_ANTIVIRUS_HOST || 'clamav',
                    parseInt(process.env._APP_STORAGE_ANTIVIRUS_PORT || '3310')
                );

                if (antivirus.ping()) {
                    Console.success('🟢 Antivirus connected');
                } else {
                    Console.error('🔴 Antivirus disconnected');
                }
            } catch (error) {
                Console.error('🔴 Antivirus disconnected');
            }
        }

        try {
            const mail = register.get('smtp'); // Assuming mail is an object with necessary methods

            mail.addAddress('demo@example.com', 'Example.com');
            mail.Subject = 'Test SMTP Connection';
            mail.Body = 'Hello World';
            mail.AltBody = 'Hello World';

            mail.send();
            Console.success('🟢 SMTP connected');
        } catch (error) {
            Console.error('🔴 SMTP disconnected');
        }

        setTimeout(() => {}, 200);

        Console.log('');
        Console.log('[Volumes]');

        const volumes = {
            'Uploads': process.env.APP_STORAGE_UPLOADS,
            'Cache': process.env.APP_STORAGE_CACHE,
            'Config': process.env.APP_STORAGE_CONFIG,
            'Certs': process.env.APP_STORAGE_CERTIFICATES,
        };

        for (const [key, volume] of Object.entries(volumes)) {
            const device = new Local(volume);

            if (isReadable(device.getRoot())) {
                Console.success(`🟢 ${key} Volume is readable`);
            } else {
                Console.error(`🔴 ${key} Volume is unreadable`);
            }

            if (isWritable(device.getRoot())) {
                Console.success(`🟢 ${key} Volume is writable`);
            } else {
                Console.error(`🔴 ${key} Volume is unwritable`);
            }
        }

        setTimeout(() => {}, 200);

        Console.log('');
        Console.log('[Disk Space]');

        for (const [key, volume] of Object.entries(volumes)) {
            if (volume == null) {
                Console.error(`🔴 ${key} not specified`);
                continue;
            }
            const device = new Local(volume);

            const percentage = (( await device.getPartitionTotalSpace() - await device.getPartitionFreeSpace()) / await device.getPartitionTotalSpace()) * 100;

            const message = `${key} Volume has ${Storage.human(await device.getPartitionFreeSpace())} free space (${percentage.toFixed(2)}% used)`;

            if (percentage < 80) {
                Console.success(`🟢 ${message}`);
            } else {
                Console.error(`🔴 ${message}`);
            }
        }

        try {
            if (App.isProduction()) {
                Console.log('');
                const version = JSON.parse(await fetch(process.env._APP_HOME || 'http://localhost' + '/version').then(res => res.text()));

                if (version && version.version) {
                    if (version.version === process.env._APP_VERSION || 'UNKNOWN') {
                        Console.info(`You are running the latest version of ${process.env.APP_NAME}! 🥳`);
                    } else {
                        Console.info(`A new version (${version.version}) is available! 🥳\n`);
                    }
                } else {
                    Console.error('Failed to check for a newer version\n');
                }
            }
        } catch (error) {
            Console.error('Failed to check for a newer version\n');
        }
    }
}