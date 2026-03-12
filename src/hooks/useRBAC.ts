import { useCallback } from "react";
import { localStorageRepository } from "../services/localStorageRepository";
import { type Resource } from "../types/roles";

export function useRBAC() {
    // In a real app, we would get the current user's role from auth context.
    // For this prototype, we'll assume a "Principal" has full access, 
    // and we can simulate other roles or fetch from a hypothetical user state.

    // For now, let's provide a function that checks if a specific Role (by ID) has permission.

    const checkPermission = useCallback((roleId: string, resource: Resource, action: "read" | "write" | "delete"): boolean => {
        // Principal Bypass (hardcoded for simplicity in this prototype)
        if (roleId === "PRINCIPAL") return true;

        const roles = localStorageRepository.roles.getAll();
        const role = roles.find(r => r.id === roleId);

        if (!role) return false; // Default deny

        const permission = role.permissions[resource];
        if (!permission) return false;

        if (action === "read") return permission.canRead;
        if (action === "write") return permission.canWrite;
        if (action === "delete") return permission.canDelete;

        return false;
    }, []);

    return { checkPermission };
}
