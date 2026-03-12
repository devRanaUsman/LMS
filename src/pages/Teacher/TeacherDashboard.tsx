import { useState, useEffect } from "react";
import { localStorageRepository } from "@/services/localStorageRepository";
import { type Teacher, type Schedule } from "@/types/hierarchy";
import { PageHeader } from "@/components/ui/PageHeader";
import { TeacherProfile } from "@/components/Teacher/TeacherProfile";
import { TeacherTimetable } from "@/components/Teacher/TeacherTimetable";

export default function TeacherDashboard() {
    // In a real app, this would come from a context or auth hook
    const [teacher, setTeacher] = useState<Teacher | null>(null);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching current logged-in teacher
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            const teacherId = user.teacherId; // This was set in Sidebar handleRoleChange

            if (teacherId) {
                const t = localStorageRepository.teachers.getById(teacherId);
                if (t) {
                    setTeacher(t);
                    const w = localStorageRepository.schedules.getByTeacher(teacherId);
                    setSchedules(w);
                }
            }
        }
        setLoading(false);
    }, []);

    if (loading) return <div className="p-8">Loading Dashboard...</div>;

    if (!teacher) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-red-600">Access Error</h2>
                <p className="text-gray-600">Could not identify the logged-in teacher profile.</p>
                <p className="text-sm text-gray-500 mt-2">Try re-selecting the "TEACHER" role from the sidebar.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <PageHeader
                breadcrumb={[
                    { label: 'Dashboard' }
                ]}
                title={`Welcome, ${teacher.name}`}
                description="Manage your schedule and performance metrics."
            />

            {/* Identity Card & KPIs */}
            <TeacherProfile teacher={teacher} />

            {/* Weekly Timetable Grid */}
            <TeacherTimetable schedules={schedules} />
        </div>
    );
}
