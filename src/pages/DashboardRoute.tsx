import { Navigate } from "react-router-dom";
import { useCurrentRole } from "../RBAC/canMethod";
import PrincipalDashboard from "./PrincipalDashboard/PrincipalDashboard";
import TeacherDashboard from "./Teacher/TeacherDashboard";
import Home from "./Home";

export default function DashboardRoute() {
    const currentRole = useCurrentRole();

    if (currentRole === "GUEST") {
        return <Navigate to="/signin" replace />;
    }

    if (
        [
            "PRINCIPAL",
            "UNIVERSITY_PRINCIPAL",
            "COLLEGE_PRINCIPAL",
            "SCHOOL_PRINCIPAL",
            "HOD"
        ].includes(currentRole)
    ) {
        return <PrincipalDashboard />;
    }

    if (currentRole === "MAIN_AUTHORITY") {
        return <Home />;
    }



    if (currentRole === "TEACHER") {
        return <TeacherDashboard />;
    }

    return <Navigate to="/unauthorized" replace />;
}
