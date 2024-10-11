import * as crypto from 'crypto';
import * as jsonwebtoken from 'jsonwebtoken';

export class JWT {
    static readonly ERROR_KEY_EMPTY = 10;
    static readonly ERROR_KEY_INVALID = 12;
    static readonly ERROR_ALGO_UNSUPPORTED = 20;
    static readonly ERROR_ALGO_MISSING = 22;
    static readonly ERROR_INVALID_MAXAGE = 30;
    static readonly ERROR_INVALID_LEEWAY = 32;
    static readonly ERROR_JSON_FAILED = 40;
    static readonly ERROR_TOKEN_INVALID = 50;
    static readonly ERROR_TOKEN_EXPIRED = 52;
    static readonly ERROR_TOKEN_NOT_NOW = 54;
    static readonly ERROR_SIGNATURE_FAILED = 60;
    static readonly ERROR_KID_UNKNOWN = 70;

    // Supported algorithms
    protected algos: Record<string, string> = {
        'HS256': 'sha256',
        'HS384': 'sha384',
        'HS512': 'sha512',
        'RS256': 'RSA-SHA256',
        'RS384': 'RSA-SHA384',
        'RS512': 'RSA-SHA512'
    };

    protected key: string | Buffer;
    protected keys: Record<string, string | Buffer> = {};
    protected timestamp: number | null = null;
    protected algo: string = 'HS256';
    protected maxAge: number = 3600;
    protected leeway: number = 0;
    protected passphrase?: string;

    constructor(
        key: string | Buffer,
        algo: string = 'HS256',
        maxAge: number = 3600,
        leeway: number = 0,
        pass?: string
    ) {
        this.validateConfig(key, algo, maxAge, leeway);

        if (Array.isArray(key)) {
            this.registerKeys(key as any);
            key = key[0]; // First one
        }

        this.key = key;
        this.algo = algo;
        this.maxAge = maxAge;
        this.leeway = leeway;
        this.passphrase = pass;
    }

    // Register keys
    registerKeys(keys: Record<string, string | Buffer>): this {
        this.keys = { ...this.keys, ...keys };
        return this;
    }

    // Encode the payload into JWT token
    encode(payload: Record<string, any>, header: Record<string, any> = {}): string {
        header = { typ: 'JWT', alg: this.algo, ...header };

        this.validateKid(header);

        if (!payload.iat && !payload.exp) {
            payload.exp = (this.timestamp || Math.floor(Date.now() / 1000)) + this.maxAge;
        }

        const headerStr = this.urlSafeEncode(header);
        const payloadStr = this.urlSafeEncode(payload);
        const signature = this.urlSafeEncode(this.sign(`${headerStr}.${payloadStr}`));

        return `${headerStr}.${payloadStr}.${signature}`;
    }

    // Decode JWT token
    decode(token: string, verify: boolean = true): Record<string, any> {
        if ((token.match(/\./g) || []).length < 2) {
            throw new Error('Invalid token: Incomplete segments');
        }

        const segments = token.split('.');
        if (!verify) {
            return this.urlSafeDecode(segments[1]);
        }

        this.validateHeader(this.urlSafeDecode(segments[0]));

        if (!this.verify(`${segments[0]}.${segments[1]}`, segments[2])) {
            throw new Error('Invalid token: Signature failed');
        }

        const payload = this.urlSafeDecode(segments[1]);
        this.validateTimestamps(payload);

        return payload;
    }

    // Spoof current timestamp for testing
    setTestTimestamp(timestamp: number | null = null): this {
        this.timestamp = timestamp;
        return this;
    }

    // Sign the input with the configured key
    protected sign(input: string): string {
        if (this.algo.startsWith('HS')) {
            return crypto.createHmac(this.algos[this.algo], this.key).update(input).digest('base64');
        }

        this.validateKey();

        const sign = crypto.createSign(this.algos[this.algo]);
        sign.update(input);
        sign.end();
        return sign.sign({ key: this.key, passphrase: this.passphrase }).toString('hex');
    }

    // Verify the signature of the given input
    protected verify(input: string, signature: string): boolean {
        const algo = this.algos[this.algo];

        if (this.algo.startsWith('HS')) {
            const expectedSignature = this.urlSafeEncode(crypto.createHmac(algo, this.key).update(input).digest());
            return expectedSignature === signature;
        }

        this.validateKey();

        const pubKey = crypto.createPublicKey(this.key);
        const verify = crypto.createVerify(algo);
        verify.update(input);
        verify.end();

        return verify.verify(pubKey, signature, 'base64');
    }

    // URL safe base64 encode
    protected urlSafeEncode(data: any): string {
        if (typeof data === 'object') {
            data = JSON.stringify(data);
        }

        return Buffer.from(data)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }

    // URL safe base64 decode
    protected urlSafeDecode(data: string): any {
        data = data.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = Buffer.from(data, 'base64').toString();
        try {
            return JSON.parse(decoded);
        } catch {
            return decoded;
        }
    }

    // validateConfig: JWT constructor'daki parametrelerin geçerli olup olmadığını kontrol eder.
    protected validateConfig(key: string | Buffer, algo: string, maxAge: number, leeway: number): void {
        if (!key) {
            throw new Error('Key is empty');
        }

        if (!this.algos[algo]) {
            throw new Error('Unsupported algorithm: ' + algo);
        }

        if (maxAge <= 0) {
            throw new Error('Invalid maxAge: ' + maxAge);
        }

        if (leeway < 0 || leeway > 120) {
            throw new Error('Invalid leeway: ' + leeway);
        }
    }

    // validateKid: Header'da 'kid' (key id) var mı, varsa bu id'ye uygun bir anahtar var mı kontrol eder.
    protected validateKid(header: Record<string, any>): void {
        if (header.kid && !this.keys[header.kid]) {
            throw new Error('Unknown key ID (kid): ' + header.kid);
        }
    }

    // validateHeader: Header bölümünün JWT standardına uygun olup olmadığını kontrol eder.
    protected validateHeader(header: Record<string, any>): void {
        if (!header.alg || !this.algos[header.alg]) {
            throw new Error('Unsupported or missing algorithm in header');
        }

        if (header.typ !== 'JWT') {
            throw new Error('Invalid header type: ' + header.typ);
        }
    }

    // validateKey: RSA algoritmalarında anahtar geçerli mi kontrol eder.
    protected validateKey(): void {
        if (!this.key) {
            throw new Error('Key is empty');
        }

        // Eğer RSA kullanıyorsak, anahtarın geçerli bir formatta olup olmadığını kontrol edelim.
        if (this.algo.startsWith('RS')) {
            try {
                const pubKey = crypto.createPublicKey(this.key);
            } catch (error) {
                throw new Error('Invalid RSA key');
            }
        }
    }

    // validateTimestamps: JWT'nin zaman damgası geçerli mi, süresi dolmuş mu, erken mi kontrol eder.
    protected validateTimestamps(payload: Record<string, any>): void {
        const now = this.timestamp || Math.floor(Date.now() / 1000);

        // Token'ın geçerlilik süresi dolmuş mu (exp)
        if (payload.exp && now > payload.exp + this.leeway) {
            throw new Error('Token has expired');
        }

        // Token erken mi oluşturulmuş (nbf)
        if (payload.nbf && now < payload.nbf - this.leeway) {
            throw new Error('Token is not valid yet');
        }

        // Token'ın oluşturulma tarihi var mı (iat)
        if (payload.iat && now < payload.iat - this.leeway) {
            throw new Error('Token issued at future time');
        }
    }
    // Additional utility functions (validateConfig, validateKid, validateHeader, validateKey, validateTimestamps) would be here
}
