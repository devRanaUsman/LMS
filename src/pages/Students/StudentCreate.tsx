import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Card } from "../../components/ui/card";
import { PageHeader } from "../../components/ui/PageHeader";
import { StudentForm } from "../../components/Students/StudentForm";
import { localStorageRepository } from "../../services/localStorageRepository";
import { type Student } from "../../types/hierarchy";

export default function StudentCreate() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            // Check for duplicate roll number or email
            const existingStudents = localStorageRepository.students.getAll();
            const isDuplicate = existingStudents.some(
                s => s.email.toLowerCase() === data.email.toLowerCase() ||
                    s.rollNumber.toLowerCase() === data.rollNumber.toLowerCase()
            );

            if (isDuplicate) {
                toast.error("A student with this email or roll number already exists.");
                setIsSubmitting(false);
                return;
            }

            // Construct full Name from first and last
            const fullName = `${data.firstName} ${data.lastName}`;

            // Create Student object
            const newStudent: Student = {
                id: `std_${Date.now()}`,
                name: fullName,
                rollNumber: data.rollNumber,
                email: data.email,
                phone: data.phone,
                departmentId: data.departmentId,
                classId: data.classId,
                joiningDate: new Date().toISOString(),
                guardianName: data.guardianName || "",
                guardianPhone: data.guardianPhone || "",
                cgpa: data.cgpa || 0,
                attendance: 100, // default
                status: "ACTIVE"
            };

            // Small delay to simulate API
            await new Promise(resolve => setTimeout(resolve, 600));

            localStorageRepository.students.add(newStudent);

            toast.success("Student Onboarded Successfully");
            navigate("/students");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save student details");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                breadcrumb={[
                    { label: 'Students Registry', to: '/students' },
                    { label: 'Onboard New Student' }
                ]}
                title="Onboard New Student"
            />

            <div className="max-w-3xl mx-auto">
                <Card className="p-6 bg-white shadow-sm border border-slate-200">
                    <StudentForm
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        onCancel={() => navigate("/students")}
                    />
                </Card>
            </div>
        </div>
    );
}
