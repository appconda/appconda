import { Appconda } from "../Appconda/Platform/Appconda";
import { Console } from "../Tuval/CLI";


const platform = new Appconda();
const worker = platform.getWorker();
const workerName = 'mails';

worker.workerStart()
    .action(() => {
        Console.info(`Worker ${workerName} started`);
    });

worker.start();