import UAParser from 'ua-parser-js';

interface OSInfo {
    osCode: string;
    osName: string;
    osVersion: string;
}

interface ClientInfo {
    clientType: string;
    clientCode: string;
    clientName: string;
    clientVersion: string;
    clientEngine?: string;
    clientEngineVersion?: string;
}

interface DeviceInfo {
    deviceName: string | null;
    deviceBrand: string | null;
    deviceModel: string | null;
}

export class Detector {
    /**
     * @param string
     */
    protected userAgent: string = '';

    /**
     * @param UAParser.Instance
     */
    protected parser: UAParser.Instance;

    /**
     * @param string $userAgent
     */
    constructor(userAgent: string) {
        this.userAgent = userAgent;
        this.parser = new UAParser(this.userAgent);
    }

    /**
     * Get OS info
     *
     * @return OSInfo
     */
    public getOS(): OSInfo {
        const os = this.parser.getOS();

        return {
            osCode: os.name || '',
            osName: os.name || '',
            osVersion: os.version || '',
        };
    }

    /**
     * Get client info
     *
     * @return ClientInfo
     */
    public getClient(): ClientInfo {
        let client: UAParser.IResult['browser'];

        if (this.userAgent.includes('AppwriteCLI')) {
            const version = this.userAgent.split(' ')[0].split('/')[1];
            client = {
                name: 'Appconda CLI',
                version: version,
                major: '',
            };
        } else {
            client = this.parser.getBrowser();
        }

        return {
            clientType: this.determineClientType(client.name),
            clientCode: client.name ? client.name.toLowerCase().replace(/\s+/g, '') : '',
            clientName: client.name || '',
            clientVersion: client.version || '',
            clientEngine: this.parser.getEngine().name || '',
            clientEngineVersion: this.parser.getEngine().version || '',
        };
    }

    /**
     * Get device info
     *
     * @return DeviceInfo
     */
    public getDevice(): DeviceInfo {
        const device = this.parser.getDevice();

        return {
            deviceName: device.type ? device.type : null,
            deviceBrand: device.vendor || null,
            deviceModel: device.model || null,
        };
    }

    /**
     * Determines the client type based on the client name
     *
     * @param name string
     * @return string
     */
    private determineClientType(name: string | undefined): string {
        if (!name) return '';
        const lowerName = name.toLowerCase();
        if (lowerName.includes('cli')) {
            return 'desktop';
        }
        // Add more conditions as needed
        return 'unknown';
    }

    /**
     * Sets whether to skip bot detection.
     * Note: `ua-parser-js` does not support bot detection out of the box.
     * You might need to implement additional logic if bot detection is required.
     *
     * @param skip boolean
     */
    public skipBotDetection(skip: boolean = true): void {
        // ua-parser-js does not support skipping bot detection directly.
        // Implement custom logic if necessary.
    }
}