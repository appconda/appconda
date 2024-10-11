import { Device } from './Device'; // Assuming Device is defined in a separate file

export class Storage {
    // Constants remain largely the same
    static readonly DEVICE_LOCAL = 'local';
    static readonly DEVICE_S3 = 's3';
    static readonly DEVICE_DO_SPACES = 'dospaces';
    static readonly DEVICE_WASABI = 'wasabi';
    static readonly DEVICE_BACKBLAZE = 'backblaze';
    static readonly DEVICE_LINODE = 'linode';
    static readonly DEVICE_GOOGLE_DRIVE = 'google_drive';
    /**
     * Devices.
     *
     * List of all available storage devices
     */
    private static devices: Record<string, Device> = {};

    /**
     * Set Device.
     *
     * Add device by name
     */
    public static setDevice(name: string, device: Device): void {
        this.devices[name] = device;
    }

    /**
     * Get Device.
     *
     * Get device by name
     */
    public static getDevice(name: string): Device {
        if (!(name in this.devices)) {
            throw new Error(`The device "${name}" is not listed`);
        }
        return this.devices[name];
    }

    /**
     * Exists.
     *
     * Checks if given storage name is registered or not
     */
    public static exists(name: string): boolean {
        return name in this.devices;
    }

    /**
     * Human readable data size format from bytes input.
     *
     * Based on: https://stackoverflow.com/a/38659168/2299554
     */
    public static human(bytes: number, decimals: number = 2, system: 'metric' | 'binary' = 'metric'): string {
        const mod = system === 'binary' ? 1024 : 1000;

        const units = {
            binary: ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'],
            metric: ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        };

        const factor = Math.floor(Math.log(bytes) / Math.log(mod));

        return `${(bytes / Math.pow(mod, factor)).toFixed(decimals)}${units[system][factor]}`;
    }
}