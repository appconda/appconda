import * as crypto from 'crypto';
import { Hash } from '../Hash';

export class Phpass extends Hash {
    protected itoa64: string = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

    public async getDefaultOptions(): Promise<{ iteration_count_log2: number, portable_hashes: boolean, random_state: string }> {
        let randomState = new Date().getTime().toString();
        try {
            randomState += process.pid.toString();
        } catch (e) {
            // process.pid is not available in some environments
        }

        return { iteration_count_log2: 8, portable_hashes: false, random_state: randomState };
    }

    public async hash(password: string): Promise<string> {
        const options = await this.getDefaultOptions();

        let random = '';
        if (options.portable_hashes === false) {
            random = this.getRandomBytes(16, options);
            const hash = this.crypt(password, this.gensaltBlowfish(random, options));
            if (hash.length === 60) {
                return hash;
            }
        }
        if (random.length < 6) {
            random = this.getRandomBytes(6, options);
        }
        const hash = this.cryptPrivate(password, this.gensaltPrivate(random, options));
        if (hash.length === 34) {
            return hash;
        }

        return '*';
    }

    public async verify(password: string, hash: string): Promise<boolean> {
        let verificationHash = this.cryptPrivate(password, hash);
        if (verificationHash[0] === '*') {
            verificationHash = this.crypt(password, hash);
        }

        return hash === verificationHash;
    }

    protected getRandomBytes(count: number, options: { iteration_count_log2: number, portable_hashes: boolean, random_state: string }): string {
        if (count < 1) {
            throw new Error('Argument count must be a positive integer');
        }
        let output = '';
        try {
            output = crypto.randomBytes(count).toString('binary');
        } catch (e) {
            for (let i = 0; i < count; i += 16) {
                options.random_state = crypto.createHash('md5').update(options.random_state).digest('binary');
                output += options.random_state;
            }
            output = output.substring(0, count);
        }

        return output;
    }

    protected encode64(input: string, count: number): string {
        if (count < 1) {
            throw new Error('Argument count must be a positive integer');
        }
        let output = '';
        let i = 0;
        do {
            let value = input.charCodeAt(i++);
            output += this.itoa64[value & 0x3f];
            if (i < count) {
                value |= input.charCodeAt(i) << 8;
            }
            output += this.itoa64[(value >> 6) & 0x3f];
            if (i++ >= count) {
                break;
            }
            if (i < count) {
                value |= input.charCodeAt(i) << 16;
            }
            output += this.itoa64[(value >> 12) & 0x3f];
            if (i++ >= count) {
                break;
            }
            output += this.itoa64[(value >> 18) & 0x3f];
        } while (i < count);

        return output;
    }

    private gensaltPrivate(input: string, options: { iteration_count_log2: number, portable_hashes: boolean, random_state: string }): string {
        let output = '$P$';
        output += this.itoa64[Math.min(options.iteration_count_log2 + 5, 30)];
        output += this.encode64(input, 6);

        return output;
    }

    private cryptPrivate(password: string, setting: string): string {
        let output = '*0';
        if (setting.substring(0, 2) === output) {
            output = '*1';
        }
        const id = setting.substring(0, 3);
        if (id !== '$P$' && id !== '$H$') {
            return output;
        }
        const count_log2 = this.itoa64.indexOf(setting[3]);
        if (count_log2 < 7 || count_log2 > 30) {
            return output;
        }
        const count = 1 << count_log2;
        const salt = setting.substring(4, 12);
        if (salt.length !== 8) {
            return output;
        }
        let hash = crypto.createHash('md5').update(salt + password).digest('binary');
        for (let i = 0; i < count; i++) {
            hash = crypto.createHash('md5').update(hash + password).digest('binary');
        }
        output = setting.substring(0, 12);
        output += this.encode64(hash, 16);

        return output;
    }

    private gensaltBlowfish(input: string, options: { iteration_count_log2: number, portable_hashes: boolean, random_state: string }): string {
        const itoa64 = './ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let output = '$2a$';
        output += String.fromCharCode('0'.charCodeAt(0) + Math.floor(options.iteration_count_log2 / 10));
        output += String.fromCharCode('0'.charCodeAt(0) + options.iteration_count_log2 % 10);
        output += '$';
        let i = 0;
        do {
            let c1 = input.charCodeAt(i++);
            output += itoa64[c1 >> 2];
            c1 = (c1 & 0x03) << 4;
            if (i >= 16) {
                output += itoa64[c1];
                break;
            }
            let c2 = input.charCodeAt(i++);
            c1 |= c2 >> 4;
            output += itoa64[c1];
            c1 = (c2 & 0x0f) << 2;
            c2 = input.charCodeAt(i++);
            c1 |= c2 >> 6;
            output += itoa64[c1];
            output += itoa64[c2 & 0x3f];
        } while (1);

        return output;
    }

    /**
     * One-way string hashing
     * crypt() will return a hashed string using the standard Unix DES-based algorithm or alternative algorithms.
     * password_verify() is compatible with crypt(). Therefore, password hashes created by crypt() can be used with password_verify().
     *
     * @param string $string The string to be hashed. Caution Using the `CRYPT_BLOWFISH` algorithm, will result in the `string` parameter being truncated to a maximum length of 72 bytes.
     * @param string $salt A salt string to base the hashing on. If not provided, the behaviour is defined by the algorithm implementation and can lead to unexpected results.
     * @return string Returns the hashed string or a string that is shorter than 13 characters and is guaranteed to differ from the salt on failure.
     */
    public crypt(string: string, salt: string): string {
        if (!salt) {
            throw new Error('Salt is required for crypt function');
        }

        // Using Node.js crypto module to mimic the behavior of PHP's crypt function
        const hash = crypto.createHash('md5').update(salt + string).digest('hex');
        return hash.length >= 13 ? hash : '*';
    }
}