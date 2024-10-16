export class JWT {
    protected static ALGORITHMS: Record<string, [string, any]> = {
        'ES384': ['openssl', 'sha384'],
        'ES256': ['openssl', 'sha256'],
        'ES256K': ['openssl', 'sha256'],
        'RS256': ['openssl', 'sha256'],
        'RS384': ['openssl', 'sha384'],
        'RS512': ['openssl', 'sha512'],
        'HS256': ['hash_hmac', 'SHA256'],
        'HS384': ['hash_hmac', 'SHA384'],
        'HS512': ['hash_hmac', 'SHA512'],
    };

    /**
     * Convert an array to a JWT, signed with the given key and algorithm.
     */
    public static encode(payload: Record<string, any>, key: string, algorithm: string, keyId: string | null = null): string {
        const header: Record<string, any> = {
            typ: 'JWT',
            alg: algorithm,
        };

        if (keyId !== null) {
            header['kid'] = keyId;
        }

        const headerEncoded = this.safeBase64Encode(JSON.stringify(header));
        const payloadEncoded = this.safeBase64Encode(JSON.stringify(payload));

        const signingMaterial = `${headerEncoded}.${payloadEncoded}`;

        const signature = this.sign(signingMaterial, key, algorithm);

        return `${headerEncoded}.${payloadEncoded}.${this.safeBase64Encode(signature)}`;
    }

    private static sign(data: string, key: string, alg: string): string {
        if (!this.ALGORITHMS[alg]) {
            throw new Error('Algorithm not supported');
        }

        const [functionName, algorithm] = this.ALGORITHMS[alg];

        switch (functionName) {
            case 'openssl':
                // OpenSSL signing logic would go here
                throw new Error('OpenSSL signing not implemented in TypeScript');
            case 'hash_hmac':
                return this.hashHmac(algorithm, data, key);
            default:
                throw new Error('Algorithm not supported');
        }
    }

    private static hashHmac(algorithm: string, data: string, key: string): string {
        // Node.js crypto module can be used here for HMAC
        const crypto = require('crypto');
        return crypto.createHmac(algorithm, key).update(data).digest('base64');
    }

    private static safeBase64Encode(input: string): string {
        return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
}