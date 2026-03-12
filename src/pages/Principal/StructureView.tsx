
import { DepartmentManager } from "@/components/Dashboard/DepartmentManager";
import { GradeSectionManager } from "@/components/Dashboard/GradeSectionManager";
import { useState } from "react";
import { useRoleAccess } from "@/hooks/usePermissions";

import { PageHeader } from "@/components/ui/PageHeader";

export default function StructureManagement() {
    useRoleAccess();
    const [institutionType] = useState<"UNIVERSITY" | "COLLEGE" | "SCHOOL">("UNIVERSITY");

    return (
        <div className="space-y-6">
            <PageHeader
                breadcrumb={[
                    { label: 'Dashboard', to: '/' },
                    { label: 'Structure' }
                ]}
                title={institutionType === "SCHOOL" ? "Grade & Section Management" : "Department Management"}
            />

            {(institutionType === "UNIVERSITY" || institutionType === "COLLEGE") && (
                <DepartmentManager />
            )}

            {institutionType === "SCHOOL" && (
                <GradeSectionManager />
            )}
        </div>
    );
}
