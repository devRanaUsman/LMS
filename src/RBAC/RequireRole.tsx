import { Navigate, Outlet } from "react-router-dom";
import { useCurrentRole } from "./canMethod";
import type { Role } from "./roles";

interface RequireRoleProps {
    role: Role | Role[];
    redirectTo?: string;
}

export const RequireRole = ({ role, redirectTo = "/signin" }: RequireRoleProps) => {
    const currentRole = useCurrentRole();

    const authorized = Array.isArray(role)
        ? role.includes(currentRole)
        : currentRole === role;

    if (!authorized) {
        // If user is logged in (has a role) but not authorized, send to unauthorized page
        // If user is not logged in (no role or null), send to signin
        if (currentRole) {
            return <Navigate to="/unauthorized" replace />;
        }
        return <Navigate to={redirectTo} replace />;
    }

    return <Outlet />;
};
