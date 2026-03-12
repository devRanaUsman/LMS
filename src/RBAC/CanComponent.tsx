import React from 'react';
import { useCan } from './canMethod';
import { type Permission } from './roles';

export function Can({
    permission,
    children,
}: {
    permission: Permission;
    children: React.ReactNode;
}) {
    const canAccess = useCan(permission);
    if (!canAccess) return null;

    return children;
}
