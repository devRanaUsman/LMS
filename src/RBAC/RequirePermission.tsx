import { Navigate, Outlet } from "react-router-dom";
import { useCan } from "./canMethod";

interface RequirePermissionProps {
    permission: string;
    redirectTo?: string;
}

export const RequirePermission = ({ permission, redirectTo = "/" }: RequirePermissionProps) => {
    const canAccess = useCan(permission) || useCan("schools.manage"); // Fallback for admin

    if (!canAccess) {
        return <Navigate to={redirectTo} replace />;
    }

    return <Outlet />;
};
