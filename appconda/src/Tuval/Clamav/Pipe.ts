import { ClamAV } from './ClamAV';
import * as net from 'net';

export class Pipe extends ClamAV {
    private static readonly CLAMAV_HOST: string = '/run/clamav/clamd.sock';

    private pip: string;

    /**
     * Pipe constructor.
     *
     * This class can be used to connect to local socket.
     * You need to pass the path to the socket pipe.
     *
     * @param pip
     */
    constructor(pip: string = Pipe.CLAMAV_HOST) {
        super();
        this.pip = pip;
    }

    /**
     * Returns a local socket.
     *
     * @return Promise<net.Socket>
     */
    protected  getSocket(): Promise<net.Socket> {
        return new Promise<net.Socket>((resolve, reject) => {
            const socket = new net.Socket();
            socket.connect(this.pip, () => {
                resolve(socket);
            });

            socket.on('error', (err) => {
                reject(new Error('Unable to connect to ClamAV socket'));
            });
        });
    }
}