import { ROLE_PERMISSIONS } from "./roles";
import type { Permission, Role } from "./roles";

export function useCan(
    permission: Permission
) {
    // Frontend-only: Read from localStorage
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    // Default to a safe fallback if no user
    const role = (user?.role || "GUEST") as Role;

    const permissions = ROLE_PERMISSIONS?.[role] as readonly Permission[];

    return (
        permissions?.includes("*") ||
        permissions?.includes(permission)
    );
}

export function useCurrentRole(): Role {
    // Frontend-only: Read from localStorage
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    return (user?.role || "GUEST") as Role;
}
