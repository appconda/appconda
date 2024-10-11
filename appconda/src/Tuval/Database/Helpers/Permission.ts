
import { Database } from '../Database';
import { Exception as DatabaseException } from '../Exception';
import { Role } from './Role';

export class Permission {
    private role: Role;

    public static readonly PERMISSION_CREATE = 'create';
    public static readonly PERMISSION_READ = 'read';
    public static readonly PERMISSION_UPDATE = 'update';
    public static readonly PERMISSION_DELETE = 'delete';

    private static aggregates: Record<string, string[]> = {
        'write': [
            Permission.PERMISSION_CREATE,
            Permission.PERMISSION_UPDATE,
            Permission.PERMISSION_DELETE,
        ]
    };

    constructor(
        private permission: string,
        role: string,
        identifier: string = '',
        dimension: string = '',
    ) {
        this.role = new Role(role, identifier, dimension);
    }

    public toString(): string {
        return `${this.permission}("${this.role.toString()}")`;
    }

    public getPermission(): string {
        return this.permission;
    }

    public getRole(): string {
        return this.role.getRole();
    }

    public getIdentifier(): string {
        return this.role.getIdentifier();
    }

    public getDimension(): string {
        return this.role.getDimension();
    }

    public static parse(permission: string): Permission {
        const permissionParts = permission.split('("');

        if (permissionParts.length !== 2) {
            throw new DatabaseException(`Invalid permission string format: "${permission}".`);
        }

        const perm = permissionParts[0];

        if (!Database.PERMISSIONS.includes(perm) && perm !== Database.PERMISSION_WRITE) {
            throw new DatabaseException(`Invalid permission type: "${perm}".`);
        }

        const fullRole = permissionParts[1].replace('")', '');
        const roleParts = fullRole.split(':');
        const role = roleParts[0];

        const hasIdentifier = roleParts.length > 1;
        const hasDimension = fullRole.includes('/');

        if (!hasIdentifier && !hasDimension) {
            return new Permission(perm, role);
        }

        if (hasIdentifier && !hasDimension) {
            const identifier = roleParts[1];
            return new Permission(perm, role, identifier);
        }

        if (!hasIdentifier) {
            const dimensionParts = fullRole.split('/');
            if (dimensionParts.length !== 2) {
                throw new DatabaseException('Only one dimension can be provided');
            }

            const role = dimensionParts[0];
            const dimension = dimensionParts[1];

            if (!dimension) {
                throw new DatabaseException('Dimension must not be empty');
            }
            return new Permission(perm, role, '', dimension);
        }

        const dimensionParts = roleParts[1].split('/');
        if (dimensionParts.length !== 2) {
            throw new DatabaseException('Only one dimension can be provided');
        }

        const identifier = dimensionParts[0];
        const dimension = dimensionParts[1];

        if (!dimension) {
            throw new DatabaseException('Dimension must not be empty');
        }

        return new Permission(perm, role, identifier, dimension);
    }

    public static aggregate(permissions: string[] | null, allowed: string[] = Database.PERMISSIONS): string[] | null {
        if (permissions === null) {
            return null;
        }

        const mutated: string[] = [];
        for (const permission of permissions) {
            const parsedPermission = Permission.parse(permission);
            for (const [type, subTypes] of Object.entries(Permission.aggregates)) {
                if (parsedPermission.getPermission() !== type) {
                    mutated.push(parsedPermission.toString());
                    continue;
                }
                for (const subType of subTypes) {
                    if (!allowed.includes(subType)) {
                        continue;
                    }
                    mutated.push(new Permission(
                        subType,
                        parsedPermission.getRole(),
                        parsedPermission.getIdentifier(),
                        parsedPermission.getDimension()
                    ).toString());
                }
            }
        }
        return Array.from(new Set(mutated));
    }

    public static read(role: Role): string {
        const permission = new Permission(
            'read',
            role.getRole(),
            role.getIdentifier(),
            role.getDimension()
        );
        return permission.toString();
    }

    public static create(role: Role): string {
        const permission = new Permission(
            'create',
            role.getRole(),
            role.getIdentifier(),
            role.getDimension()
        );
        return permission.toString();
    }

    public static update(role: Role): string {
        const permission = new Permission(
            'update',
            role.getRole(),
            role.getIdentifier(),
            role.getDimension()
        );
        return permission.toString();
    }

    public static delete(role: Role): string {
        const permission = new Permission(
            'delete',
            role.getRole(),
            role.getIdentifier(),
            role.getDimension()
        );
        return permission.toString();
    }

    public static write(role: Role): string {
        const permission = new Permission(
            'write',
            role.getRole(),
            role.getIdentifier(),
            role.getDimension()
        );
        return permission.toString();
    }
}