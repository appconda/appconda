import axios from 'axios';
import { Adapter } from '../Adapter';

export class ReCaptcha extends Adapter {
    protected secret: string = '';
    protected response: string = '';
    protected remoteIP: string = '';

    constructor(secret: string, response: string, remoteIP: string) {
        super();
        this.secret = secret;
        this.response = response;
        this.remoteIP = remoteIP;
    }

    /**
     * Check
     *
     * Check if user is human or not, compared to score
     *
     * @param  score
     * @return Promise<boolean>
     */
    public async check(score: number = 0.5): Promise<boolean> {
        const url = 'https://www.google.com/recaptcha/api/siteverify';
        const fields = {
            secret: this.secret,
            response: this.response,
            remoteip: this.remoteIP,
        };

        try {
            const response = await axios.post(url, new URLSearchParams(fields));
            const result = response.data;

            return result.success && result.score >= score;
        } catch (error) {
            console.error('ReCaptcha verification failed:', error);
            return false;
        }
    }

    /**
     * Delete logs older than datetime
     *
     * @param  datetime
     * @return boolean
     *
     * @throws Error
     */
    public async cleanup(datetime: string): Promise<boolean> {
        throw new Error('Method not supported');
    }

    /**
     * Get abuse logs
     *
     * Return logs with an offset and limit
     *
     * @param  offset
     * @param  limit
     * @return Record<string, any>
     *
     * @throws Error
     */
    public async getLogs(offset: number | null = null, limit: number | null = 25): Promise<Record<string, any>> {
        throw new Error('Method not supported');
    }
}