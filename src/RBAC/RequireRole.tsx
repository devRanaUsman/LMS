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
        // If user is not logged in (GUEST = no user in localStorage), send to signin
        // If user is logged in but doesn't have the required role, send to unauthorized
        if (currentRole === "GUEST") {
            return <Navigate to={redirectTo} replace />;
        }
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};
