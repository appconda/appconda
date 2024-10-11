// src/Utopia/Database/DateTime.ts

import { Exception } from "./Exception";


export class DateTime {
    private static formatDb: string = 'YYYY-MM-DD HH:mm:ss.SSS';
    private static _formatTz: string = 'YYYY-MM-DDTHH:mm:ss.SSSZ';

    private constructor() {}

    /**
     * @return string
     */
    public static now(): string {
        const date = new Date();
        return this.format(date);
    }

    /**
     * @param date
     * @return string
     */
    public static format(date: Date): string {
        return date.toISOString().replace('T', ' ').replace('Z', '').slice(0, -1);
    }

    /**
     * @param date
     * @param seconds
     * @return string
     * @throws DatabaseException
     */
    public static addSeconds(date: Date, seconds: number): string {
        if (isNaN(seconds)) {
            throw new Exception('Invalid interval');
        }

        date.setSeconds(date.getSeconds() + seconds);
        return this.format(date);
    }

    /**
     * @param datetime
     * @return string
     * @throws DatabaseException
     */
    public static setTimezone(datetime: string): string {
        try {
            const value = new Date(datetime);
            const timezoneOffset = value.getTimezoneOffset() * 60000;
            const localISOTime = new Date(value.getTime() - timezoneOffset).toISOString();
            return localISOTime.replace('T', ' ').replace('Z', '').slice(0, -1);
        } catch (e: any) {
            throw new Exception(e.message, e.code, e);
        }
    }

    /**
     * @param dbFormat
     * @return string | null
     */
    public static formatTz(dbFormat: string | null): string | null {
        if (dbFormat === null) {
            return null;
        }

        try {
            const value = new Date(dbFormat);
            return value.toISOString();
        } catch {
            return dbFormat;
        }
    }
}