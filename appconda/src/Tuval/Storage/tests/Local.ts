import { Local } from "../Device/Local";


const path = require('path');

const start = async () => {
    const localInstance = new Local(path.resolve(__dirname, '../../resources/disk-a'));
    await localInstance.createDirectory(path.resolve(__dirname, '../../resources/disk-a/test_memer'));
    await localInstance.write(localInstance.getPath('test_memer.txt'), 'tsdfsdest_memer');
    const text = await localInstance.read(localInstance.getPath('test_memer.txt'));
    console.log(text);
    //await localInstance.move(localInstance.getPath('test_memer.txt'), localInstance.getPath('aa/test_memered.txt'));
   // const size = await localInstance.getFileHash(localInstance.getPath('aa/test_memered.txt'));
    //console.log(size);
}


start();
