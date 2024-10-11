
import { Database } from '../Database';
import { Permission } from '../Helpers/Permission';
import { Roles } from './Roles';

export class Permissions extends Roles {
    protected message: string = 'Permissions Error';
    //@ts-ignore
    protected allowed: string[];
    //@ts-ignore
    protected length: number;

    constructor(length: number = 0, allowed: string[] = [...Database.PERMISSIONS, Database.PERMISSION_WRITE]) {
        super();
        this.length = length;
        this.allowed = allowed;
    }

    public getDescription(): string {
        return this.message;
    }

    public isValid(permissions: any): boolean {
        if (!Array.isArray(permissions)) {
            this.message = 'Permissions must be an array of strings.';
            return false;
        }

        if (this.length && permissions.length > this.length) {
            this.message = `You can only provide up to ${this.length} permissions.`;
            return false;
        }

        for (const permission of permissions) {
            if (typeof permission !== 'string') {
                this.message = 'Every permission must be of type string.';
                return false;
            }

            if (permission === '*') {
                this.message = 'Wildcard permission "*" has been replaced. Use "any" instead.';
                return false;
            }

            if (permission.includes('role:')) {
                this.message = 'Permissions using the "role:" prefix have been replaced. Use "users", "guests", or "any" instead.';
                return false;
            }

            let isAllowed = false;
            for (const allowed of this.allowed) {
                if (permission.startsWith(allowed)) {
                    isAllowed = true;
                    break;
                }
            }
            if (!isAllowed) {
                this.message = `Permission "${permission}" is not allowed. Must be one of: ${this.allowed.join(', ')}.`;
                return false;
            }

            try {
                const parsedPermission = Permission.parse(permission);
                const role = parsedPermission.getRole();
                const identifier = parsedPermission.getIdentifier();
                const dimension = parsedPermission.getDimension();

                if (!this.isValidRole(role, identifier, dimension)) {
                    return false;
                }
            } catch (e: any) {
                this.message = e.message;
                return false;
            }
        }
        return true;
    }

    public isArray(): boolean {
        return false;
    }

    public getType(): string {
        return Permissions.TYPE_ARRAY;
    }
}