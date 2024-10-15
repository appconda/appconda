import { Appconda } from "../Appconda/Platform/Appconda";
import { Console } from "../Tuval/CLI";
import { Service } from "../Tuval/Platform/Service";
import { register } from "./init";


const start = async () => {
    const pools = register.get('pools');

    const workerName = 'mails';
    
    const platform = new Appconda();
    
    try {
        platform.init(Service.TYPE_WORKER, {
            workersNum: parseInt(process.env._APP_WORKERS_NUM || '1', 10),
            connection: (await pools.get('queue').pop()).getResource(),
            workerName: workerName.toLowerCase() ?? null,
            queueName: workerName
        });
    } catch (e) {
        Console.error(`${e.message}, File: ${e.file}, Line: ${e.line}`);
    }
    
    const worker = platform.getWorker();
    
    
    worker.workerStart()
        .action(() => {
            Console.info(`Worker ${workerName} started`);
        });

        worker.shutdown()
        .action(() => {
            Console.info(`Worker ${workerName} shutdown`);
        });
    
    worker.start();
}

start();
