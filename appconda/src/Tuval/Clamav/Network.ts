
import * as net from 'net';
import { ClamAV } from './ClamAV';

export class Network extends ClamAV {
    private static readonly CLAMAV_HOST: string = '127.0.0.1';
    private static readonly CLAMAV_PORT: number = 3310;

    private host: string;
    private port: number;

    /**
     * Network constructor
     *
     * You need to pass the host address and the port the server.
     *
     * @param host
     * @param port
     */
    constructor(host: string = Network.CLAMAV_HOST, port: number = Network.CLAMAV_PORT) {
        super();
        this.host = host;
        this.port = port;
    }

    /**
     * Returns a remote socket.
     *
     * @return net.Socket
     */
    protected  getSocket(): Promise<net.Socket> {
        const socket = new net.Socket();

        return new Promise<net.Socket>((resolve, reject) => {
            socket.connect(this.port, this.host, () => {
                resolve(socket);
            });

            socket.on('error', (err) => {
                reject(new Error('Unable to connect to ClamAV server'));
            });
        });
    }
}