/**
 * Custom hooks for permissions and scope filtering
 */

import { useMemo } from 'react';
import { canAccess, hasAnyPermission, hasAllPermissions, type Permission } from '@/utils/permissions';
import { getCurrentUser, applyScope, getScopeLabel, isScoped } from '@/utils/scopeFilter';

// Re-export types for convenience
export type { Role, Permission } from '@/utils/permissions';
export type { User } from '@/utils/scopeFilter';

/**
 * Hook to access current user and permission checks
 */
export function usePermissions() {
    const user = useMemo(() => getCurrentUser(), []);

    return {
        user,
        canAccess: (permission: Permission) => canAccess(user.role, permission),
        hasAny: (permissions: Permission[]) => hasAnyPermission(user.role, permissions),
        hasAll: (permissions: Permission[]) => hasAllPermissions(user.role, permissions),
        role: user.role,
    };
}

/**
 * Hook for scope filtering with user context
 */
export function useScopeFilter() {
    const user = useMemo(() => getCurrentUser(), []);

    return {
        user,
        filterByScope: <T extends { departmentId?: string }>(data: T[]) => applyScope(data, user),
        isScoped: isScoped(user),
        scopeLabel: getScopeLabel(user),
        departmentId: user.departmentId,
    };
}

/**
 * Combined hook for both permissions and scope filtering
 */
export function useRoleAccess() {
    const permissions = usePermissions();
    const scope = useScopeFilter();

    return {
        ...permissions,
        ...scope,
    };
}
