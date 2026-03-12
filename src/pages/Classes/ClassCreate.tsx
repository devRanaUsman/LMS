import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Card } from "../../components/ui/card";
import { PageHeader } from "../../components/ui/PageHeader";
import { ClassForm } from "../../components/Classes/ClassForm";
import { localStorageRepository } from "../../services/localStorageRepository";
import { type Class } from "../../types/hierarchy";
import { VerticalType } from "../../types/institution";
import { academicService } from "../../services/academicService";

export default function ClassCreate() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const returnTo = location.state?.returnTo || "/classes";

    const isHOD = returnTo === '/hod/schedule';
    const initMode = location.state?.mode || (isHOD ? "manage" : "create");
    const [mode, setMode] = useState<"create" | "manage">(initMode as "create" | "manage");
    const [availableClasses, setAvailableClasses] = useState<Class[]>([]);

    useEffect(() => {
        if (mode === "manage") {
            setAvailableClasses(localStorageRepository.classes.getAll());
        }
    }, [mode]);

    // In a real app, this comes from context/API. Simulating loading the user's institution.
    // Assuming the user belongs to the first institution found for this demo.
    const institution = localStorageRepository.institutions.getAll()[0];

    // Safety check just in case
    if (!institution) {
        return <div className="p-8">Institution not found. Please setup an institution first.</div>;
    }

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            if (mode === "create") {
                let finalName = data.name;
                if (institution.verticalType === VerticalType.K12 && data.gradeLevel && data.section) {
                    finalName = `${data.gradeLevel} - ${data.section}`;
                }

                const newClass: Class = {
                    id: `CLS-${Date.now()}`,
                    name: finalName || "New Class",
                    departmentId: location.state?.departmentId || (institution.verticalType === VerticalType.UNIVERSITY && !isHOD ? data.departmentId : 'GENERAL'),
                    classTeacherId: data.classTeacherId
                };

                // Small delay to simulate API
                await new Promise(resolve => setTimeout(resolve, 600));

                localStorageRepository.classes.add(newClass);

                if (data.subjects && data.subjects.length > 0) {
                    for (const sub of data.subjects) {
                        await academicService.createSubject(newClass.departmentId, sub.name, newClass.id);
                    }
                }

                toast.success("Class created successfully");
                navigate(returnTo);
            } else {
                // Manage Subject Assignment
                await new Promise(resolve => setTimeout(resolve, 600));

                const classId = data.classId;
                const cls = availableClasses.find(c => c.id === classId);
                if (!cls) throw new Error("Select a valid class");

                if (data.subjects && data.subjects.length > 0) {
                    for (const sub of data.subjects) {
                        if (!sub.id && sub.name.trim()) {
                            await academicService.createSubject(cls.departmentId, sub.name, classId);
                        }
                    }
                }

                toast.success("Subjects added successfully");
                navigate(returnTo);
            }
        } catch (error) {
            console.error(error);
            toast.error(mode === "create" ? "Failed to create class" : "Failed to add subjects");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                breadcrumb={[
                    { label: isHOD ? 'HOD Schedule' : 'Classes Registry', to: returnTo },
                    { label: mode === "create" ? 'Create New Class' : 'Manage Subjects' }
                ]}
                title={mode === "create" ? "Create New Class" : "Manage Subjects"}
            />

            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
                    <button
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${mode === "create" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                        onClick={() => setMode("create")}
                    >
                        Create Class
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${mode === "manage" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                        onClick={() => setMode("manage")}
                    >
                        Assign Subjects
                    </button>
                </div>

                <Card className="p-6 bg-white shadow-sm border border-slate-200">
                    <ClassForm
                        verticalType={institution.verticalType}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        onCancel={() => navigate(returnTo)}
                        hideDepartment={isHOD}
                        mode={mode}
                        availableClasses={availableClasses}
                    />
                </Card>
            </div>
        </div>
    );
}
