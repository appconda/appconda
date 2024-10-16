import parsePhoneNumber from 'libphonenumber-js'
import { Message } from './Message';

    export abstract class Adapter {

        /**
         * Get the name of the adapter.
         */
        abstract getName(): string;

        /**
         * Get the type of the adapter.
         */
        abstract getType(): string;

        /**
         * Get the type of the message the adapter can send.
         */
        abstract getMessageType(): string;

        /**
         * Get the maximum number of messages that can be sent in a single request.
         */
        abstract getMaxMessagesPerRequest(): number;

        /**
         * Send a message.
         */
        send(message: Message): any {
            if (!(message instanceof this.getMessageType())) {
                throw new Error('Invalid message type.');
            }
            if ('getTo' in message && message.getTo().length > this.getMaxMessagesPerRequest()) {
                throw new Error(`${this.getName()} can only send ${this.getMaxMessagesPerRequest()} messages per request.`);
            }
            if (typeof this.process !== 'function') {
                throw new Error('Adapter does not implement process method.');
            }

            return this.process(message);
        }

        /**
         * Send a single HTTP request.
         */
        protected request(
            method: string,
            url: string,
            headers: Record<string, string> = {},
            body: Record<string, any> | null = null,
            timeout: number = 30
        ): any {
            const options: RequestInit = {
                method: method,
                headers: headers,
                body: body ? JSON.stringify(body) : null,
                timeout: timeout * 1000,
            } as any;

            return fetch(url, options)
                .then((response: any) => response.json())
                .then(data => ({
                    url: url,
                    statusCode: response.status,
                    response: data,
                    error: null
                }))
                .catch(error => ({
                    url: url,
                    statusCode: 0,
                    response: null,
                    error: error.message
                }));
        }

        /**
         * Send multiple concurrent HTTP requests using HTTP/2 multiplexing.
         */
        protected requestMulti(
            method: string,
            urls: string[],
            headers: Record<string, string> = {},
            bodies: Record<string, any>[] = [],
            timeout: number = 30
        ): any[] {
            if (urls.length === 0) {
                throw new Error('No URLs provided. Must provide at least one URL.');
            }

            const requests = urls.map((url, index) => {
                const body = bodies[index] ? JSON.stringify(bodies[index]) : null;
                const options: RequestInit = {
                    method: method,
                    headers: headers,
                    body: body,
                    timeout: timeout * 1000,
                } as any;

                return fetch(url, options)
                    .then(response => response.json())
                    .then(data => ({
                        url: url,
                        statusCode: response.status,
                        response: data,
                        error: null
                    }))
                    .catch(error => ({
                        url: url,
                        statusCode: 0,
                        response: null,
                        error: error.message
                    }));
            });

            return Promise.all(requests);
        }

        /**
         * Get the country code from a phone number.
         */
        getCountryCode(phone: string): number | null {
            if (!phone) {
                throw new Error('$phone cannot be empty.');
            }

        

            try {
                const parsedNumber = parsePhoneNumber(phone);
                return Number.parseInt(parsedNumber.country);
            } catch (error) {
                throw new Error(`Error parsing phone: ${error.message}`);
            }
        }
    }