import { Cache, Memory } from "@tuval/cache";

import { MariaDB } from "./Adapters/MariaDB";
import { Database } from "./Database";
import { Document } from "./Document";
import { ID } from "./Helpers/ID";


// ExpressApp.start(80, '0.0.0.0');

// ExpressApp.loadModules('./src/Modules');

const mysql = require('mysql2/promise');

async function main() {


    console.log(ID.unique(124))
    const $cache = new Cache(new Memory()); // veya istediğiniz herhangi bir önbellek adaptörünü kullanın

    const $database = new Database(new MariaDB(
        {
            host: 'localhost', // Kendi sunucunuzla değiştirin
            user: 'root',      // Veritabanı kullanıcınızla değiştirin
            password: 'password', // Veritabanı şifrenizle değiştirin
            database: 'yourdb',  // Veritabanı adınızla değiştirin
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        }
    ), $cache);

    $database.getNamespace();

    // Tüm koleksiyon isimlerinin önüne eklenen ad alanını ayarlar
    $database.setNamespace('my_namespace'
    );

    // Varsayılan veritabanını ayarlar
    $database.setDatabase('dbName');


    // Yeni bir veritabanı oluşturur.
    // Varsayılan veritabanı adını kullanır.
    await $database.create();

    const teams = await $database.getCollection('teams');
    const users = await $database.getCollection('users');

    const customers = await $database.getCollection('customers');

    if (users.isEmpty()) {
        await $database.createCollection('users');
    }

    if (teams.isEmpty()) {
        await $database.createCollection('teams', [
            new Document({
                '$id': 'ADI',
                'key': 'ADI',
                'type': Database.VAR_STRING,
                'size': 256,
                'required': true,
                'signed': true,
                'array': false,
                'filters': [],
            }),
        ]);
    }

    if (customers.isEmpty()) {
        await $database.createCollection('customers');
    }

    for (let i = 0; i < 120; i++) {

        try {
            const document = new Document({

            '$id': ID.unique(),
            'ADI': i + 'Captain Marvel',

        });

        await $database.createDocument(
            'teams',
                document
            );

            console.log('created')
        } catch (error) {
            console.log(error)
        }
    }


    try {
        const document = new Document({

        '$id': ID.unique(),
        'ADI':  'Captain Marvel',

    });

    await $database.createDocument(
        'teams',
            document
        );

        console.log('created')
    } catch (error) {
        console.log(error)
    }

    console.log('done')



    //  await $database.createAttribute('users', 'name', 'string', 255, false);
    // await $database.createAttribute('users', 'email', 'string');
    // await $database.createAttribute('users', 'password', 'string');

}

main()