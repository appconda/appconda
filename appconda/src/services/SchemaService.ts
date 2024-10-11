
/**
 * Schema Service
 * 
 */

import { BaseService } from "../BaseService";
import DatabaseService from "./database-service/service.ts";


function delay(time: number) {
    return new Promise(resolve => setTimeout(resolve, time));
}

export default class SchemaService extends BaseService {

    public get uid(): string {
        return 'com.realmocean.service.schema';
    }

    get displayName(): string {
        return 'Schema Service'
    }

     async init(): Promise<void> {
        const router = this.webServer.getRouter();
     


        /*   setTimeout(async () => {
              console.log('AppletService initialized.');
              const databases = await databaseService.list('the');
              console.log(databases);
          }, 5000); */

          router.post("/schema/create", async (req, res) => {
            
            const realmId = req.headers['x-realm-id'];
            const databaseId = req.body.databaseId;

            const schema = req.body.schema;

            console.log(req.headers);
            console.log(schema);
            console.log(typeof schema);
            try {
                const applet = await this.createDatabase(realmId, databaseId, schema);
                return res.json(applet);
            } catch (e) {
                console.error(e);
                res.statusCode = 500;
                return res.json(e);
            }
        });
    }


    /*  static  getInstance(args) {
      const _ = new WebServerService(args);
      _._init();
      return _.app;
    } */

    async createDatabase(realmId: string, databaseId: string, schema: any) {
       this.databaseService;
        return new Promise(async (resolve, reject) => {
            // Create Applet Database
            console.log('Creating schema ' , schema.name);
            console.log( schema)
            for (let i = 0; i < schema.databases.length; i++) {
                const template = schema.databases[i];
                console.log(template)
                const { name, id, category, collections } = template;
                try {
                    const db = await this.databaseService.create(realmId, databaseId ?? id, schema.name ?? name, true);
                    for (let j = 0; j < collections.length; j++) {
                        const collection = collections[j];
                        const { name, id, attributes, documents = [] } = collection;
                        const col = await this.databaseService.createCollection(realmId, db.$id, id, name, [], false);

                        for (let i = 0; i < attributes.length; i++) {
                            const { key, type, defaultValue = null, size = 255 } = attributes[i];
                            switch (type) {
                                case 'string':
                                    await this.databaseService.createStringAttribute(realmId, db.$id, col.$id, key, size, false, '', false);
                                    break;
                                case 'number':
                                    await this.databaseService.createIntegerAttribute(realmId, db.$id, col.$id, key, false);
                                    break;
                                case 'datetime':
                                    await this.databaseService.createDatetimeAttribute(realmId, db.$id, col.$id, key, false);
                                    break;
                                case 'boolean':
                                    await this.databaseService.createBooleanAttribute(realmId, db.$id, col.$id, key, false, defaultValue ?? false);
                                    break;
                            }
                        }
                    }

                    // Tablo alan olusturma asenkron oldugu icin zaman veriyoruz.
                    await delay(1000)

                    // create documents loop
                    for (let j = 0; j < collections.length; j++) {
                        const collection = collections[j];
                        const { name, id, attributes, documents = [] } = collection;
                        console.log(documents);

                        documents?.forEach(async (document: any) => {
                            let $id = 'unique()';
                            if (document.$id != null) {
                                $id = document.$id;
                                delete document.$id;
                            }
                            const doc = await this.databaseService.createDocument(realmId, db.$id, id, $id, document);


                        });

                    }

                } catch (error) {
                    console.error(error)
                    reject(error);
                }

                resolve(schema);
            }
        })
    }



}

