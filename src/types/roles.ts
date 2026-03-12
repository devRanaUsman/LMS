export interface RolePermission {
    resource: string; // e.g., "teachers", "classes", "reports"
    canRead: boolean;
    canWrite: boolean;
    canDelete: boolean;
}

export interface Role {
    id: string;
    name: string; // e.g., "Attendance Clerk", "Data Entry"
    permissions: Record<Resource, RolePermission>;
    color?: string; // Kept for backward compatibility or fallback
    logo?: string; // Base64 image string
    description?: string;
}

export interface PermissionMatrix {
    [roleId: string]: RolePermission[];
}

export const RESOURCES = [
    "TEACHERS",
    "CLASSES",
    "CUSTOM_ROLES",
    "REPORTS",
    "SETTINGS"
] as const;

export type Resource = typeof RESOURCES[number];
