import { useState, useEffect, useMemo } from "react";
import { academicService } from "@/services/academicService";
import { dashboardService } from "@/services/dashboardService";
import { type Schedule, type DayOfWeek, type Teacher } from "@/types/hierarchy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/ui/Modal";
import Loader from "@/components/ui/Loader";
import { Calendar, Users } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/ui/PageHeader";

const DAYS: DayOfWeek[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Reuse standard time slots used in the system
const TIME_SLOTS = [
    { id: "slot-1", start: "08:00", end: "09:00", label: "08:00 - 09:00" },
    { id: "slot-2", start: "09:00", end: "10:00", label: "09:00 - 10:00" },
    { id: "slot-3", start: "10:00", end: "11:00", label: "10:00 - 11:00" },
    { id: "slot-4", start: "11:00", end: "12:00", label: "11:00 - 12:00" },
    { id: "slot-5", start: "12:00", end: "13:00", label: "12:00 - 13:00" },
    { id: "slot-6", start: "13:00", end: "14:00", label: "13:00 - 14:00" },
    { id: "slot-7", start: "14:00", end: "15:00", label: "14:00 - 15:00" },
];

export default function TeacherScheduling() {
    const [isLoading, setIsLoading] = useState(true);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);

    // Filters
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>("all");

    // Modal State
    const [modalData, setModalData] = useState<{ isOpen: boolean; title: string; teachers: Teacher[] }>({
        isOpen: false,
        title: "",
        teachers: []
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [fetchedSchedules, fetchedTeachers] = await Promise.all([
                academicService.getAllSchedules(),
                dashboardService.getTeachersByDepartment("all")
            ]);
            setSchedules(fetchedSchedules);
            setTeachers(fetchedTeachers);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Grouping Transformation: map schedules to cells
    const cellMap = useMemo(() => {
        const map: Record<string, Teacher[]> = {};

        // Filter schedules if a specific teacher is selected
        const visibleSchedules = selectedTeacherId === "all"
            ? schedules
            : schedules.filter(s => String(s.teacherId) === selectedTeacherId);

        visibleSchedules.forEach(sch => {
            if (!sch.teacherId) return; // Skip unassigned lectures

            // Key maps to exact day & slot (using time boundaries to be safe)
            const key = `${sch.day}-${sch.startTime}-${sch.endTime}`;

            if (!map[key]) {
                map[key] = [];
            }

            // Deduplicate: same teacher might be teaching combined classes in same slot
            if (!map[key].some(t => String(t.id) === String(sch.teacherId))) {
                const tr = teachers.find(t => String(t.id) === String(sch.teacherId));
                if (tr) {
                    map[key].push(tr);
                }
            }
        });

        // Optionally sort teachers alphabetically per slot for consistency
        Object.keys(map).forEach(key => {
            map[key].sort((a, b) => a.name.localeCompare(b.name));
        });

        return map;
    }, [schedules, teachers, selectedTeacherId]);

    if (isLoading) {
        return <Loader />;
    }

    const openModal = (day: string, label: string, slotTeachers: Teacher[]) => {
        setModalData({
            isOpen: true,
            title: `Teachers Scheduled - ${day} (${label})`,
            teachers: slotTeachers
        });
    };

    return (
        <div className="space-y-6">
            <PageHeader
                breadcrumb={[
                    { label: 'Dashboard', to: '/' },
                    { label: 'Teacher Scheduling' }
                ]}
                title="Teacher Scheduling Matrix"
            />

            <div className="flex flex-col gap-4">
                {/* Filters */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Teacher Filter</label>
                        <div className="w-64 border-l border-slate-200 pl-3">
                            <Select
                                value={selectedTeacherId}
                                onValueChange={setSelectedTeacherId}
                            >
                                <SelectTrigger className="h-8 border-none shadow-none focus:ring-0 px-0 bg-transparent text-sm font-semibold">
                                    <SelectValue placeholder="Select a teacher" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="font-bold text-blue-600">All Teachers</SelectItem>
                                    {teachers.map(t => (
                                        <SelectItem key={t.id} value={String(t.id)} className="font-medium">
                                            {t.name} {t.departmentId ? `(${t.departmentId})` : ""}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Main: Weekly Timetable Grid */}
                <Card className="border-slate-200 shadow-sm overflow-hidden flex-1">
                    <CardHeader className="bg-white border-b border-slate-200 p-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    Master Schedule
                                </CardTitle>
                                <p className="text-slate-500 text-xs mt-0.5">Global view of teacher commitments and availability</p>
                            </div>
                            <div className="text-xs text-slate-400 font-medium">
                                24-Hour Format
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {/* Sticky Day Headers */}
                        <div className="grid grid-cols-6 border-b border-slate-200 bg-slate-50 sticky top-0 z-10 w-full min-w-[700px] overflow-x-auto">
                            {DAYS.map((day, idx) => (
                                <div
                                    key={day}
                                    className={`p-3 text-center border-r last:border-0 border-slate-200 ${idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}
                                >
                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">{day}</span>
                                </div>
                            ))}
                        </div>

                        {/* Grid with alternating column backgrounds */}
                        <div className="grid grid-cols-6 min-h-[450px] min-w-[700px] overflow-x-auto">
                            {DAYS.map((day, idx) => (
                                <div
                                    key={day}
                                    className={`flex flex-col border-r last:border-0 border-slate-200 ${idx % 2 === 0 ? 'bg-slate-50/30' : 'bg-white'}`}
                                >
                                    {TIME_SLOTS.map((slot) => {
                                        const slotKey = `${day}-${slot.start}-${slot.end}`;
                                        const slotTeachers = cellMap[slotKey] || [];

                                        // Max 2 requirement
                                        const visibleTeachers = slotTeachers.slice(0, 2);
                                        const remainingCount = slotTeachers.length - 2;

                                        return (
                                            <div
                                                key={slot.id}
                                                className="min-h-[100px] border-b border-slate-100 p-2 relative group hover:bg-blue-50/50 transition-colors"
                                            >
                                                {/* empty state text on hover (if empty) */}
                                                {slotTeachers.length === 0 && (
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                                        <span className="text-[10px] font-medium text-slate-400 bg-white/90 px-2 py-1 rounded shadow-sm border border-slate-100">
                                                            {slot.label} : Free
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="space-y-1.5 w-full">
                                                    {visibleTeachers.map((t, tIdx) => (
                                                        <div
                                                            key={`${t.id}-${tIdx}`}
                                                            className="flex items-center gap-1.5 p-1.5 bg-white rounded border-l-4 border-blue-400 shadow-sm border border-slate-200 group-hover:shadow-md transition-all duration-200"
                                                        >
                                                            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                                <span className="text-[9px] font-bold text-blue-700">
                                                                    {t.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-col min-w-0 flex-1">
                                                                <span className="text-[11px] font-bold text-slate-700 truncate leading-tight">
                                                                    {t.name}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {remainingCount > 0 && (
                                                        <button
                                                            onClick={() => openModal(day, slot.label, slotTeachers)}
                                                            className="w-full text-[10px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded py-1 px-2 mt-1 transition-colors flex items-center justify-center gap-1"
                                                        >
                                                            <Users className="w-3 h-3" />
                                                            + {remainingCount} More
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* See More Modal */}
            <Modal
                isOpen={modalData.isOpen}
                onClose={() => setModalData(prev => ({ ...prev, isOpen: false }))}
                title={modalData.title}
                size="md"
            >
                <div className="pb-4">
                    <p className="text-xs text-slate-500 font-medium mb-4">
                        All teachers scheduled for this exact time slot.
                    </p>

                    <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-2">
                        {modalData.teachers.map((t, idx) => (
                            <div key={`${t.id}-${idx}`} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm font-bold text-blue-700">
                                        {t.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-800">{t.name}</span>
                                    <span className="text-[11px] font-medium text-slate-500">
                                        {t.departmentId || "General Staff"} • {t.email}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => setModalData(prev => ({ ...prev, isOpen: false }))}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-md transition-colors"
                        >
                            Close Viewer
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
