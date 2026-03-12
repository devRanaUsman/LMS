/**
 * Permission System
 * Defines role-based permissions for Principal and HOD roles
 */

export type Role = 'PRINCIPAL' | 'HOD' | 'TEACHER' | 'MAIN_AUTHORITY' | 'UNIVERSITY_PRINCIPAL' | 'COLLEGE_PRINCIPAL' | 'SCHOOL_PRINCIPAL';
export type Permission = string;

const PRINCIPAL_PERMISSIONS = {
    // People Management - Full Access
    'students.view': true,
    'students.create': true,
    'students.edit': true,
    'students.delete': true,
    'teachers.view': true,
    'teachers.create': true,
    'teachers.edit': true,
    'teachers.delete': true,
    'teachers.assign': true,

    // Academics - Full Access
    'classes.view': true,
    'classes.create': true,
    'classes.edit': true,
    'classes.delete': true,
    'subjects.view': true,
    'subjects.create': true,
    'subjects.edit': true,
    'subjects.delete': true,
    'timetable.view': true,
    'timetable.edit': true,
    'timetable.create': true,
    'attendance.view': true,
    'attendance.mark': true,
    'exams.view': true,
    'exams.create': true,

    // Finance & Operations - Full Access
    'fees.view': true,
    'fees.manage': true,
    'transport.view': true,
    'transport.manage': true,
    'payroll.view': true,
    'payroll.manage': true,

    // Administration - Full Access
    'settings.view': true,
    'settings.edit': true,
    'departments.view': true,
    'departments.create': true,
    'departments.edit': true,
    'departments.delete': true,
    'reports.all': true,
    'reports.financial': true,
    'reports.academic': true,
    'notices.view': true,
    'notices.create': true,
    'notices.edit': true,
};

export const PERMISSIONS: Record<Role, Record<Permission, boolean>> = {
    PRINCIPAL: PRINCIPAL_PERMISSIONS,
    UNIVERSITY_PRINCIPAL: PRINCIPAL_PERMISSIONS,
    COLLEGE_PRINCIPAL: PRINCIPAL_PERMISSIONS,
    SCHOOL_PRINCIPAL: PRINCIPAL_PERMISSIONS,

    HOD: {
        // People Management - Department Scope Only
        'students.view': true,
        'teachers.view': true,
        'classes.edit': true,
        'classes.delete': false,
        'subjects.view': true,
        'subjects.create': true,      // Can create department subjects
        'subjects.edit': true,
        'subjects.delete': false,
        'timetable.view': true,
        'timetable.edit': true,       // Can manage department timetable
        'timetable.create': true,
        'attendance.view': true,
        'attendance.mark': true,      // Can mark department attendance
        'exams.view': true,
        'exams.create': false,

        // Finance & Operations - DENIED
        'fees.view': false,
        'fees.manage': false,
        'transport.view': false,
        'transport.manage': false,
        'payroll.view': false,
        'payroll.manage': false,

        // Administration - LIMITED
        'settings.view': false,
        'settings.edit': false,
        'departments.view': true,     // Can view own department
        'departments.create': false,
        'departments.edit': false,
        'departments.delete': false,
        'roles.view': false,          // Cannot view roles
        'roles.create': false,        // Cannot create roles or HODs
        'roles.edit': false,
        'roles.delete': false,
        'emergency.control': false,   // Cannot open/close school
        'reports.all': false,
        'reports.financial': false,
        'reports.academic': true,     // Department academic reports only
        'notices.view': true,
        'notices.create': true,       // Can create department notices
        'notices.edit': true,
    },

    // Default permissions for other roles
    TEACHER: {},
    MAIN_AUTHORITY: {
        'settings.view': true,
        'roles.view': true,
        // Add other permissions as needed, but for now specific to the request
    },

};

/**
 * Check if a role has permission to perform an action
 */
export function canAccess(role: Role, permission: Permission): boolean {
    return PERMISSIONS[role]?.[permission] ?? false;
}

/**
 * Check if a role has ANY of the given permissions
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
    return permissions.some(permission => canAccess(role, permission));
}

/**
 * Check if a role has ALL of the given permissions
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
    return permissions.every(permission => canAccess(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Record<Permission, boolean> {
    return PERMISSIONS[role] || {};
}
