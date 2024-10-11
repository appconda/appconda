import {Exception as DatabaseException } from '../Exception';

export class ID {
    /**
     * Create a new unique ID
     *
     * @throws DatabaseException
     */
    public static unique(padding: number = 7): string {
        let uniqid = Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

        if (padding > 0) {
            try {
                const bytes = crypto.getRandomValues(new Uint8Array(Math.max(1, Math.ceil(padding / 2))));
                uniqid += Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join('').substr(0, padding);
            } catch (e: any) {
                throw new DatabaseException(e.message, e.code, e);
            }
        }

        return uniqid;
    }

    /**
     * Create a new ID from a string
     */
    public static custom(id: string): string {
        return id;
    }
}