import * as net from 'net';

export abstract class ClamAV {
    public static readonly CLAMAV_MAX: number = 20000;

    protected abstract getSocket(): Promise<net.Socket>;

    /**
     * Send a given command to ClamAV.
     *
     * @param command
     * @return Promise<string | null>
     */
    private async sendCommand(command: string): Promise<string | null> {
        const socket = await this.getSocket();
        return new Promise<string | null>((resolve, reject) => {
            socket.write(command, () => {
                let data = '';
                socket.on('data', (chunk) => {
                    data += chunk.toString();
                });

                socket.on('end', () => {
                    socket.destroy();
                    resolve(data.trim());
                });

                socket.on('error', (err) => {
                    socket.destroy();
                    reject(err);
                });
            });
        });
    }

    /**
     * Check if ClamAV is up and responsive.
     *
     * @return Promise<boolean>
     */
    public async ping(): Promise<boolean> {
        const response = await this.sendCommand('PING');
        return response === 'PONG';
    }

    /**
     * Check ClamAV Version.
     *
     * @return Promise<string>
     */
    public async version(): Promise<string> {
        return await this.sendCommand('VERSION') || '';
    }

    /**
     * Reload ClamAV virus databases.
     *
     * @return Promise<string | null>
     */
    public async reload(): Promise<string | null> {
        return await this.sendCommand('RELOAD');
    }

    /**
     * Shutdown ClamAV and perform a clean exit.
     *
     * @return Promise<string | null>
     */
    public async shutdown(): Promise<string | null> {
        return await this.sendCommand('SHUTDOWN');
    }

    /**
     * Scan a file or a directory (recursively) with archive support
     * enabled (if not disabled in clamd.conf). A full path is required.
     *
     * Returns whether the given file/directory is clean (true), or not (false).
     *
     * @param file
     * @return Promise<boolean>
     */
    public async fileScanInStream(file: string): Promise<boolean> {
        const socket = await this.getSocket();
        const fs = require('fs');
        const handle = fs.createReadStream(file, { highWaterMark: 8192 });
        const command = "zINSTREAM\0";

        return new Promise<boolean>((resolve, reject) => {
            socket.write(command);

            handle.on('data', (chunk) => {
                const packet = Buffer.concat([Buffer.alloc(4), chunk]);
                packet.writeUInt32BE(chunk.length, 0);
                socket.write(packet);
            });

            handle.on('end', () => {
                socket.write(Buffer.from([0, 0, 0, 0]));
                let data = '';
                socket.on('data', (chunk) => {
                    data += chunk.toString();
                });

                socket.on('end', () => {
                    socket.destroy();
                    const stats = data.split(':').pop()?.trim();
                    resolve(stats === 'OK');
                });

                socket.on('error', (err) => {
                    socket.destroy();
                    reject(err);
                });
            });

            handle.on('error', (err) => {
                socket.destroy();
                reject(err);
            });
        });
    }

    /**
     * Scan a file or a directory (recursively) with archive support
     * enabled (if not disabled in clamd.conf). A full path is required.
     *
     * Returns whether the given file/directory is clean (true), or not (false).
     *
     * @param file
     * @return Promise<boolean>
     */
    public async fileScan(file: string): Promise<boolean> {
        const response = await this.sendCommand('SCAN ' + file);
        const stats = response?.split(':').pop()?.trim();
        return stats === 'OK';
    }

    /**
     * Scan file or directory (recursively) with archive support
     * enabled, and don't stop the scanning when a virus is found.
     *
     * @param file
     * @return Promise<Array<{ file: string, stats: string }>>
     */
    public async continueScan(file: string): Promise<Array<{ file: string, stats: string }>> {
        const response = await this.sendCommand('CONTSCAN ' + file);
        const results = response?.trim().split("\n") || [];
        return results.map(result => {
            const [file, stats] = result.split(':');
            return { file, stats: stats.trim() };
        });
    }
}