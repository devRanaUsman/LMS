import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Card } from "../../components/ui/card";
import { PageHeader } from "../../components/ui/PageHeader";
import { TeacherForm } from "../../components/Teachers/TeacherForm";
import { localStorageRepository } from "../../services/localStorageRepository";
import { type Teacher } from "../../types/hierarchy";

export default function TeacherCreate() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            // Check for duplicate email (simple check)
            const existingTeachers = localStorageRepository.teachers.getAll();
            const isDuplicate = existingTeachers.some(t => t.email.toLowerCase() === data.email.toLowerCase());

            if (isDuplicate) {
                toast.error("A teacher with this email already exists.");
                setIsSubmitting(false);
                return;
            }

            // Construct full Name from first and last
            const fullName = `${data.firstName} ${data.lastName}`;

            // Create Teacher object
            const newTeacher: Teacher = {
                id: `tch_${Date.now()}`,
                ...data,
                name: fullName,
                // Default values for fields not in form
                departmentId: data.departmentId,
                type: "NORMAL",
                joiningDate: new Date().toISOString(),
                status: "Active",
                createdAt: new Date().toISOString(),

                // Default Performance Metrics
                totalWorkload: 0,
                punctuality: 100,
                deliveryRate: 100,
                monthlyAttendance: 100,
                scheduledHours: 0,
                actualHours: 0
            };

            // Small delay to simulate API
            await new Promise(resolve => setTimeout(resolve, 600));

            localStorageRepository.teachers.add(newTeacher);

            toast.success("Teacher Onboarded Successfully. Credentials will be shared with the teacher via email.");
            navigate("/teachers");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save teacher details");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <PageHeader
                breadcrumb={[
                    { label: 'Teachers Registry', to: '/teachers' },
                    { label: 'Onboard New Teacher' }
                ]}
                title="Onboard New Teacher"
            />

            <div className="max-w-3xl mx-auto">
                <Card className="p-6 bg-white shadow-sm border border-slate-200">
                    <TeacherForm
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        onCancel={() => navigate("/teachers")}
                    />
                </Card>
            </div>
        </div>
    );
}
