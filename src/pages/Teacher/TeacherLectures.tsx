import { useState, useEffect } from "react";
import { localStorageRepository } from "@/services/localStorageRepository";
import { type Schedule } from "@/types/hierarchy";
import { PageHeader } from "@/components/ui/PageHeader";
import DataTable, { type ColumnDef } from "@/components/ui/DataTable";
import { CalendarCheck, Clock, BookOpen, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FilterSearch } from "@/components/ui/Filters/FilterSearch";
import { ErrorState } from "@/components/ui/ErrorState";
import { normalizeError } from "@/utils/errorUtils";
import { Button } from "@/components/ui/button";

export default function TeacherLectures() {
    const navigate = useNavigate();
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [searchType, setSearchType] = useState("Class ID");

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            const userStr = localStorage.getItem("user");
            let foundSchedules: Schedule[] = [];

            if (userStr) {
                const user = JSON.parse(userStr);
                const teacherId = user.teacherId;
                if (teacherId) {
                    foundSchedules = localStorageRepository.schedules.getByTeacher(teacherId);
                }
            }

            // Fallback to dummy data if no schedules found (for demo purposes)
            if (foundSchedules.length === 0) {
                foundSchedules = [
                    {
                        id: "dummy_1",
                        day: "Monday",
                        startTime: "09:00 AM",
                        endTime: "10:30 AM",
                        classId: "BSCS-Semester 4-A", // Matches existing class
                        subjectId: "Software Engineering 1",
                        teacherId: "dummy_t",
                        teacherName: "Demo Teacher"
                    },
                    {
                        id: "dummy_2",
                        day: "Tuesday",
                        startTime: "11:00 AM",
                        endTime: "12:30 PM",
                        classId: "SE-Semester 2-B",
                        subjectId: "Web Engineering",
                        teacherId: "dummy_t",
                        teacherName: "Demo Teacher"
                    },
                    {
                        id: "dummy_3",
                        day: "Wednesday",
                        startTime: "08:30 AM",
                        endTime: "10:00 AM",
                        classId: "BSCS 3rd sem", // Matches user's screenshot requirement/seed
                        subjectId: "Data Structures",
                        teacherId: "dummy_t",
                        teacherName: "Demo Teacher"
                    }
                ];
            }

            setSchedules(foundSchedules);
        } catch (err) {
            console.error("Failed to load lectures", err);
            setError(normalizeError(err, "We couldn't fetch your lectures. Please try again."));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredSchedules = schedules.filter(schedule => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();

        if (searchType === "Class ID") {
            return schedule.classId.toLowerCase().includes(term);
        } else if (searchType === "Subject") {
            return schedule.subjectId.toLowerCase().includes(term);
        }
        return true;
    });

    const getAttendanceStatus = (scheduleId: string) => {
        const today = new Date().toISOString().split('T')[0];
        const record = localStorageRepository.attendance.getByScheduleAndDate(scheduleId, today);
        return record ? { isMarked: true, isLocked: record.isLocked } : { isMarked: false, isLocked: false };
    };

    const columns: ColumnDef<Schedule>[] = [
        {
            header: "Day / Time",
            accessorKey: "day",
            cell: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium text-slate-900 flex items-center gap-1">
                        <CalendarCheck className="w-3 h-3 text-slate-500" /> {row.day}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {row.startTime} - {row.endTime}
                    </span>
                </div>
            )
        },
        {
            header: "Class Info",
            accessorKey: "classId",
            cell: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium text-slate-900 flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-500" /> {row.classId}
                    </span>
                </div>
            )
        },
        {
            header: "Subject",
            accessorKey: "subjectId",
            cell: (row) => (
                <div className="flex items-center gap-1 text-slate-700">
                    <BookOpen className="w-3 h-3 text-slate-500" /> {row.subjectId}
                </div>
            )
        },
        {
            header: "Actions",
            cell: (row) => {
                const status = getAttendanceStatus(row.id || "dummy_1"); // Fallback for dummy data consistency if id missing

                let buttonText = "Mark Attendance";
                let buttonClass = "bg-blue-600 hover:bg-blue-700";

                if (status.isMarked) {
                    if (status.isLocked) {
                        buttonText = "Request to Edit";
                        buttonClass = "bg-amber-600 hover:bg-amber-700";
                    } else {
                        buttonText = "Edit Attendance";
                        buttonClass = "bg-green-600 hover:bg-green-700";
                    }
                }

                return (
                    <Button
                        size="sm"
                        onClick={() => navigate(`/teacher/attendance/mark/${row.id || 1}`)}
                        className={`text-xs h-8 ${buttonClass}`}
                        tooltip={status.isMarked ? (status.isLocked ? "Request permission to edit attendance" : "Edit submitted attendance") : "Mark attendance for this lecture"}
                    >
                        {buttonText}
                    </Button>
                );
            }
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                breadcrumb={[
                    { label: 'Dashboard', to: '/' },
                    { label: 'My Lectures' }
                ]}
                title="My Lectures"
                description="Manage your classes and mark attendance."
            />

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <FilterSearch
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder={`Search by ${searchType}...`}
                    currentType={searchType}
                    onTypeChange={setSearchType}
                    types={[
                        { label: "Class ID", value: "Class ID", description: "Search by Class ID" },
                        { label: "Subject", value: "Subject", description: "Search by Subject Name" }
                    ]}
                />
            </div>

            {error ? (
                <ErrorState
                    title="Unable to load lectures"
                    message={error}
                    variant="page"
                    onRetry={loadData}
                    retryLabel="Retry"
                    showRefreshPage={true}
                />
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <DataTable
                        data={filteredSchedules}
                        columns={columns}
                        isLoading={loading}
                        showSerialNumber={true}
                        emptyState={<div className="p-8 text-center text-gray-500">No lectures found assigned to you.</div>}
                    />
                </div>
            )}
        </div>
    );
}
