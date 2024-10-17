var crypto = require('crypto');

export class Webhook {
    public static readonly DEFAULT_TOLERANCE = 300;
    public static readonly EXPECTED_SCHEME = 'v1';

    private static isHashEqualsAvailable: boolean | null = null;

    /**
     * Verifies the signature header sent by Stripe.
     */
    isValid(payload: string, header: string, secret: string, tolerance: number | null = null): boolean {
        // Extract timestamp and signatures from header
        const timestamp = this.getTimestamp(header);
        const signatures = this.getSignatures(header, Webhook.EXPECTED_SCHEME);
        if (timestamp === -1) {
            return false;
        }
        if (signatures.length === 0) {
            return false;
        }

        // Check if expected signature is found in list of signatures from header
        const signedPayload = `${timestamp}.${payload}`;
        const expectedSignature = this.computeSignature(signedPayload, secret);
        let signatureFound = false;
        for (const signature of signatures) {
            if (this.secureCompare(expectedSignature, signature)) {
                signatureFound = true;
                break;
            }
        }
        if (!signatureFound) {
            return false;
        }

        // Check if timestamp is within tolerance
        if (tolerance && Math.abs(Date.now() / 1000 - timestamp) > tolerance) {
            return false;
        }

        return true;
    }

    secureCompare(a: string, b: string): boolean {
        if (Webhook.isHashEqualsAvailable === null) {
            Webhook.isHashEqualsAvailable = typeof crypto.timingSafeEqual === 'function';
        }

        if (Webhook.isHashEqualsAvailable) {
            const bufferA = Buffer.from(a);
            const bufferB = Buffer.from(b);
            return bufferA.length === bufferB.length && crypto.timingSafeEqual(bufferA, bufferB);
        }

        if (a.length !== b.length) {
            return false;
        }

        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }

        return result === 0;
    }

    /**
     * Extracts the timestamp in a signature header.
     */
    private getTimestamp(header: string): number {
        const items = header.split(',');

        for (const item of items) {
            const itemParts = item.split('=', 2);
            if (itemParts[0] === 't') {
                if (isNaN(Number(itemParts[1]))) {
                    return -1;
                }

                return parseInt(itemParts[1], 10);
            }
        }

        return -1;
    }

    /**
     * Extracts the signatures matching a given scheme in a signature header.
     */
    private getSignatures(header: string, scheme: string): string[] {
        const signatures: string[] = [];
        const items = header.split(',');

        for (const item of items) {
            const itemParts = item.split('=', 2);
            if (itemParts[0].trim() === scheme) {
                signatures.push(itemParts[1]);
            }
        }

        return signatures;
    }

    /**
     * Computes the signature for a given payload and secret.
     */
    private computeSignature(payload: string, secret: string): string {
        return crypto.createHmac('sha256', secret).update(payload).digest('hex');
    }
}