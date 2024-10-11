import { randomBytes, createCipheriv, createDecipheriv, CipherGCMTypes, createHash } from 'crypto';

export class OpenSSL {
    public static readonly CIPHER_AES_128_GCM = 'aes-128-gcm' as CipherGCMTypes;

    /**
     * Encrypts data using the specified method and key.
     *
     * @param data - The data to encrypt.
     * @param method - The encryption method (e.g., 'aes-128-gcm').
     * @param key - The encryption key.
     * @param options - Encryption options.
     * @param iv - Initialization vector.
     * @param tag - Authentication tag for GCM.
     * @param aad - Additional authenticated data.
     * @param tagLength - Length of the authentication tag.
     * @returns The encrypted data.
     */
    public static encrypt(
        data: string,
        method: CipherGCMTypes,
        key: Buffer,
        options: number = 0,
        iv: Buffer = randomBytes(12),
        tag: Buffer | null = null,
        aad: Buffer = Buffer.alloc(0),
        tagLength: number = 16
    ): string {
        //@ts-ignore
        key = createHash('sha256').update(key).digest().slice(0, 16);
        //@ts-ignore
        const cipher = createCipheriv(method, key, iv, { authTagLength: tagLength });
        if (aad.length > 0) {
            //@ts-ignore
            cipher.setAAD(aad);
        }
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        if (cipher.getAuthTag) {
            tag = cipher.getAuthTag();
        }
        // You might want to store the IV and tag along with the encrypted data
        return iv.toString('hex') + ':' + (tag ? tag.toString('hex') : '') + ':' + encrypted;
    }

    public static decrypt(
        encryptedData: string,
        method: CipherGCMTypes,
        key: Buffer,
        options: number = 0,
        aad: Buffer = Buffer.alloc(0),
        tagLength: number = 16
    ): string {
        //@ts-ignore
        key = createHash('sha256').update(key).digest().slice(0, 16);

        const parts = encryptedData.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const tag = Buffer.from(parts[1], 'hex');
        //@ts-ignore
        const encrypted = parts[2];

        //@ts-ignore
        const decipher = createDecipheriv(method, key, iv, { authTagLength: tagLength });
        if (aad.length > 0) {
            //@ts-ignore
            decipher.setAAD(aad);
        }
        //@ts-ignore
        decipher.setAuthTag(tag);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        //decrypted += decipher.final('utf8');
        return decrypted;
    }


    /**
     * Gets the Initialization Vector length for the specified cipher method.
     *
     * @param method - The cipher method.
     * @returns The IV length.
     */
    public static cipherIVLength(method: CipherGCMTypes, value: string): number {

        const key = randomBytes(16); // 128-bit key
        const iv = randomBytes(12);  // 96-bit IV for GCM
        //@ts-ignore
        const cipher = createCipheriv('aes-128-gcm', key, iv);

        let encrypted = cipher.update(value, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        console.log('Encrypted:', encrypted);
        console.log('Auth Tag:', authTag.toString('hex'));


        /*   const key = randomBytes(16); // 128-bit key
          const iv = randomBytes(12);  // 96-bit IV for GCM
  
          const cipher = createCipheriv(method, key, iv);
          const authTag = cipher.getAuthTag(); */
        return cipher.getAuthTag().length;

        // return createCipheriv(method, Buffer.alloc(16), Buffer.alloc(12)).getAuthTag().length;
    }

    /**
     * Generates cryptographically strong pseudo-random data.
     *
     * @param length - The number of bytes to generate.
     * @returns The random bytes as a hex string.
     */
    public static randomPseudoBytes(length: number): Buffer {
        return randomBytes(length);
    }
}