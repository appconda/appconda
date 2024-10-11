import { scrypt } from 'scrypt-js';
import { Hash } from '../Hash';
import { randomBytes } from 'crypto';

export class Scrypt extends Hash {
    /**
     * Hash the input password
     * @param password Input password to hash
     * @returns Promise<string> hash
     */
    public async hash(password: string): Promise<string> {
        const options = this.getOptions();
        const salt = options.salt ? Buffer.from(options.salt, 'hex') : randomBytes(16);
        const keyLength = options.length || 64;

        const hashBuffer = await new Promise<Buffer>((resolve, reject) => {
            scrypt(
                Buffer.from(password),
                salt,
                1 << options.costCpu,
                1 << options.costMemory,
                options.costParallel,
                keyLength/* ,
                (error, progress, key) => { 
                    if (error) {
                        reject(error);
                    } else if (key) {
                        resolve(Buffer.from(key));
                    }
                } */
            );
        });

        return `${salt.toString('hex')}:${hashBuffer.toString('hex')}`;
    }

    /**
     * Verify the input password against the hash
     * @param password Input password to validate
     * @param hash Hash to verify password against
     * @returns Promise<boolean> true if password matches hash
     */
    public async verify(password: string, hash: string): Promise<boolean> {
        const [saltHex, hashHex] = hash.split(':');
        const options = this.getOptions();
        const salt = Buffer.from(saltHex, 'hex');
        const keyLength = options.length || 64;

        const hashBuffer = await new Promise<Buffer>((resolve, reject) => {
            scrypt(
                Buffer.from(password),
                salt,
                1 << options.costCpu,
                1 << options.costMemory,
                options.costParallel,
                keyLength/* ,
                (error, progress, key) => {
                    if (error) {
                        reject(error);
                    } else if (key) {
                        resolve(Buffer.from(key));
                    }
                } */
            );
        });

        return hashBuffer.toString('hex') === hashHex;
    }

    /**
     * Get default options for specific hashing algo
     * @returns { costCpu: number, costMemory: number, costParallel: number, length: number } options object
     */
    public async getDefaultOptions(): Promise<{ costCpu: number, costMemory: number, costParallel: number, length: number }> {
        return { costCpu: 8, costMemory: 14, costParallel: 1, length: 64 };
    }
}