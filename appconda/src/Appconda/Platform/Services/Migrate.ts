import { Authorization, Document, Text } from "../../../Tuval/Core";
import { Database, Query } from "../../../Tuval/Database";
import { Action } from "../../../Tuval/Platform/Action";
import Redis from 'ioredis';
import { Registry } from "../../../Tuval/Registry";
import { Console } from "../../../Tuval/CLI";
import { App } from "../../../Tuval/Http";

class Migrate extends Action {
    protected redis: Redis;

    public static getName(): string {
        return 'migrate';
    }

    constructor() {
        super();
        this.desc('Migrate Appconda to new version')
            .param('version', process.env.APP_VERSION_STABLE, new Text(8), 'Version to migrate to.', true)
            .inject('dbForConsole')
            .inject('getProjectDB')
            .inject('register')
            .callback((version: string, dbForConsole: Database, getProjectDB: Function, register: Registry) => {
                this.action(version, dbForConsole, getProjectDB, register);
            });
    }

    private async clearProjectsCache(project: Document) {
        try {
            let cursor = '0';
            do {
                const [newCursor, keys] = await this.redis.scan(cursor, 'MATCH', `default-cache-_{$project.getInternalId()}:*`, 'COUNT', '1000');
                cursor = newCursor;
                if (keys.length > 0) {
                    await this.redis.del(keys);
                }
            } while (cursor !== '0');
        } catch (error) {
            Console.error(`Failed to clear project ("${project.getId()}") cache with error: ${error.message}`);
        }
    }

    public async action(version: string, dbForConsole: Database, getProjectDB: Function, register: Registry) {
        Authorization.disable();
        if (!Migration.versions.hasOwnProperty(version)) {
            Console.error(`Version ${version} not found.`);
            process.exit(1);
            return;
        }

        this.redis = new Redis({
            host: process.env._APP_REDIS_HOST || 'localhost',
            port: parseInt(process.env._APP_REDIS_PORT || '6379'),
            connectTimeout: 3000,
            maxRetriesPerRequest: 10,
        });

        const app = new App('UTC');

        Console.success(`Starting Data Migration to version ${version}`);

        const consoleProject: Document = await app.getResource('console');

        const limit = 30;
        let offset = 0;
        let projects = [consoleProject];
        let count = 0;
        let totalProjects;
        try {
            totalProjects = await dbForConsole.count('projects') + 1;
        } catch (error) {
            dbForConsole.setNamespace('_console');
            totalProjects = await dbForConsole.count('projects') + 1;
        }

        const MigrationClass = require(`./Migration/Version/${Migration.versions[version]}`).default;
        const migration = new MigrationClass();

        while (projects.length > 0) {
            for (const project of projects) {
                if (project.getId() === 'console' && project.getInternalId() !== 'console') {
                    continue;
                }

                await this.clearProjectsCache(project);

                try {
                    const projectDB = await getProjectDB(project);
                    projectDB.disableValidation();
                    await migration
                        .setProject(project, projectDB, dbForConsole)
                        .setPDO(register.get('db', true))
                        .execute();
                } catch (error) {
                    Console.error(`Failed to update project ("${project.getId()}") version with error: ${error.message}`);
                    throw error;
                }

                await this.clearProjectsCache(project);
            }

            projects = await dbForConsole.find('projects', [Query.limit(limit), Query.offset(offset)]);
            offset += limit;
            count += projects.length;

            Console.log(`Migrated ${count}/${totalProjects} projects...`);
        }

        Console.success('Data Migration Completed');
    }
}