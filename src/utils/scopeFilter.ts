/**
 * Scope Filtering System
 * Handles department-level data filtering for HOD role
 */

import type { Role } from './permissions';

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    departmentId?: string;  // Set for HOD users
    schoolId?: string;
}

interface ScopedData {
    departmentId?: string;
}

/**
 * Apply department scope to data based on user role
 * - Principal sees all data
 * - HOD sees only their department's data
 */
export function applyScope<T extends ScopedData>(
    data: T[],
    user: User
): T[] {
    // Principal has full access to all data
    if (user.role === 'PRINCIPAL' || user.role === 'MAIN_AUTHORITY') {
        return data;
    }

    // HOD sees only their department's data
    if (user.role === 'HOD' && user.departmentId) {
        return data.filter(item => item.departmentId === user.departmentId);
    }

    // No access for other roles or missing departmentId
    return [];
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser(): User {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            return {
                id: 'guest',
                name: 'Guest',
                email: 'guest@example.com',
                role: 'TEACHER',
            };
        }
        return JSON.parse(userStr);
    } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        return {
            id: 'guest',
            name: 'Guest',
            email: 'guest@example.com',
            role: 'TEACHER',
        };
    }
}

/**
 * Get scope label for UI display
 */
export function getScopeLabel(user: User, departmentName?: string): string {
    if (user.role === 'HOD') {
        return departmentName || user.departmentId || 'Department';
    }
    return 'All Departments';
}

/**
 * Check if user data is scoped (limited view)
 */
export function isScoped(user: User): boolean {
    return user.role === 'HOD';
}
