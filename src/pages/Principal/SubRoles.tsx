
import { SubRoleManager } from "@/components/Dashboard/SubRoleManager";
import { useState } from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export default function SubRoleManagement() {
    const [institutionType] = useState<"UNIVERSITY" | "COLLEGE" | "SCHOOL">("UNIVERSITY");

    return (
        <div className="space-y-6">
            <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Sub-Roles' }]} />

            <SubRoleManager institutionType={institutionType} />
        </div>
    );
}
