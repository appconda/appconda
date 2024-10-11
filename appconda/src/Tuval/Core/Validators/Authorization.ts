import { Validator } from "../Validator";

export class Authorization extends Validator {
    private static roles: Record<string, boolean> = {
        'any': true
    };

    protected action: string = '';
    protected message: string = 'Authorization Error';

    constructor(action: string) {
        super();
        this.action = action;
    }

    public getDescription(): string {
        return this.message;
    }

    public isValid(permissions: any): boolean {
        if (!Authorization.status) {
            return true;
        }

        if (!permissions || permissions.length === 0) {
            this.message = `No permissions provided for action '${this.action}'`;
            return false;
        }

        for (const permission of permissions) {
            if (Authorization.roles[permission]) {
                return true;
            }
        }

        this.message = `Missing "${this.action}" permission for role "${permissions[0]}". Only "${JSON.stringify(Authorization.getRoles())}" scopes are allowed and "${JSON.stringify(permissions)}" was given.`;
        return false;
    }

    public static setRole(role: string): void {
        Authorization.roles[role] = true;
    }

    public static unsetRole(role: string): void {
        delete Authorization.roles[role];
    }

    public static getRoles(): string[] {
        return Object.keys(Authorization.roles);
    }

    public static cleanRoles(): void {
        Authorization.roles = {};
    }

    public static isRole(role: string): boolean {
        return Authorization.roles.hasOwnProperty(role);
    }

    public static status: boolean = true;
    public static statusDefault: boolean = true;

    public static setDefaultStatus(status: boolean): void {
        Authorization.statusDefault = status;
        Authorization.status = status;
    }

    public static async skip<T>(callback: () => Promise<T>): Promise<T> {
        const initialStatus = Authorization.status;
        Authorization.disable();

        try {
            return await callback();
        } finally {
            Authorization.status = initialStatus;
        }
    }

    public static enable(): void {
        Authorization.status = true;
    }

    public static disable(): void {
        Authorization.status = false;
    }

    public static reset(): void {
        Authorization.status = Authorization.statusDefault;
    }

    public isArray(): boolean {
        return false;
    }

    public getType(): string {
        return Validator.TYPE_ARRAY;
    }
}