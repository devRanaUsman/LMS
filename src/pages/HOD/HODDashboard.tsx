import { useState, useEffect } from "react";
import { academicService } from "@/services/academicService";
import { hierarchyService } from "@/services/hierarchyService";
import { type Class, type Subject, type Schedule, type DayOfWeek, type Teacher } from "@/types/hierarchy";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    GraduationCap, Calendar, Plus, Clock
} from "lucide-react";
import { toast } from "react-toastify";
import { Modal } from "@/ui/Modal";
import Loader from "@/components/ui/Loader";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const DAYS: DayOfWeek[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TIME_SLOTS = [
    { id: "slot-1", start: "08:00", end: "09:00", label: "08:00 - 09:00" },
    { id: "slot-2", start: "09:00", end: "10:00", label: "09:00 - 10:00" },
    { id: "slot-3", start: "10:00", end: "11:00", label: "10:00 - 11:00" },
    { id: "slot-4", start: "11:00", end: "12:00", label: "11:00 - 12:00" },
    { id: "slot-5", start: "12:00", end: "13:00", label: "12:00 - 13:00" },
    { id: "slot-6", start: "13:00", end: "14:00", label: "13:00 - 14:00" },
    { id: "slot-7", start: "14:00", end: "15:00", label: "14:00 - 15:00" },
];

// Subject color mapping for visual consistency
const getSubjectColor = (subjectName: string): { bg: string; border: string; text: string; dot: string } => {
    const name = subjectName.toLowerCase();
    if (name.includes('math')) return { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-700', dot: 'bg-blue-500' };
    if (name.includes('computer') || name.includes('cs')) return { bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-700', dot: 'bg-purple-500' };
    if (name.includes('physics')) return { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-700', dot: 'bg-green-500' };
    if (name.includes('chemistry')) return { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-700', dot: 'bg-orange-500' };
    if (name.includes('biology')) return { bg: 'bg-emerald-50', border: 'border-emerald-500', text: 'text-emerald-700', dot: 'bg-emerald-500' };
    if (name.includes('urdu') || name.includes('language')) return { bg: 'bg-pink-50', border: 'border-pink-500', text: 'text-pink-700', dot: 'bg-pink-500' };
    return { bg: 'bg-slate-50', border: 'border-slate-400', text: 'text-slate-700', dot: 'bg-slate-400' };
};

export default function HODDashboard() {
    const navigate = useNavigate();
    // In real app, we would get deptId from current user's profile
    const [deptId, setDeptId] = useState<string | null>(null);
    const [deptName, setDeptName] = useState("");

    const [classes, setClasses] = useState<Class[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [schedules, setSchedules] = useState<Schedule[]>([]);

    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [schedClass, setSchedClass] = useState<string>("");
    const [schedSubject, setSchedSubject] = useState("");
    const [schedDay, setSchedDay] = useState<DayOfWeek>("Monday");
    const [schedStart, setSchedStart] = useState("09:00");
    const [schedEnd, setSchedEnd] = useState("10:00");
    const [schedTeacher, setSchedTeacher] = useState<string>("unassigned");

    const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);

    useEffect(() => {
        if (schedClass) {
            academicService.getSubjectsByClass(schedClass).then(subs => {
                setAvailableSubjects(subs);
            });
        } else {
            setAvailableSubjects([]);
        }
    }, [schedClass]);

    const [isScheduling, setIsScheduling] = useState(false);

    useEffect(() => {
        setupUser();
    }, []);

    const setupUser = async () => {
        setIsLoading(true);
        try {
            // Find which department this user is HOD of
            const userStr = localStorage.getItem("user");
            if (!userStr) return;
            const user = JSON.parse(userStr);

            const depts = await hierarchyService.getDepartments(1);
            const myDept = depts.find(d => d.hodId === user.id);

            if (myDept) {
                setDeptId(myDept.id);
                setDeptName(myDept.name);
                loadDeptData(myDept.id);
            } else if (user.role === "HOD" || user.email === "admin@example.com") {
                // DEMO MODE BYPASS: If explicitly switched to HOD role but not assigned,
                // assume they are viewing the first available department for demonstration.
                if (depts.length > 0) {
                    setDeptId(depts[0].id);
                    setDeptName(depts[0].name);
                    loadDeptData(depts[0].id);
                    toast.info(`Demo Mode: Viewing ${depts[0].name} (No explicit HOD assignment found)`, { autoClose: 3000 });
                } else {
                    toast.error("No departments exist yet. Please ask Principal to create one.");
                }
            } else {
                toast.error("You are not assigned as HOD for any department");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadDeptData = async (dId: string) => {
        const [cls, subs, tchs] = await Promise.all([
            academicService.getClasses(dId),
            academicService.getSubjects(dId),
            hierarchyService.getTeachers()
        ]);
        setClasses(cls);
        setSubjects(subs);
        setTeachers(tchs);
        if (cls.length > 0 && !selectedClass) {
            setSelectedClass(cls[0].id);
            loadScheduleData(cls[0].id);
        }
    };

    const loadScheduleData = async (cId: string) => {
        const sch = await academicService.getSchedules(cId);
        setSchedules(sch);
    };

    const handleCellClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const { day, start, end } = e.currentTarget.dataset;
        if (!day || !start || !end) {
            toast.error("Could not determine target. Missing identifying attributes.");
            return;
        }

        if (!selectedClass) {
            toast.error("Please select a class first");
            return;
        }

        setSchedClass(selectedClass);
        setSchedDay(day as DayOfWeek);
        setSchedStart(start);
        setSchedEnd(end);
        setShowScheduleForm(true);
    };

    const handleScheduleLecture = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!schedClass) {
            toast.error("Please select a class");
            return;
        }
        if (!schedSubject) {
            toast.error("Please select a subject");
            return;
        }

        // Time validation
        const start = new Date(`2000-01-01T${schedStart}`);
        const end = new Date(`2000-01-01T${schedEnd}`);
        if (end <= start) {
            toast.error("End time must be after start time");
            return;
        }

        setIsScheduling(true);
        try {
            await academicService.scheduleLecture(
                schedClass,
                schedSubject,
                schedDay,
                schedStart,
                schedEnd,
                schedTeacher === "unassigned" ? undefined : schedTeacher
            );
            toast.success("Lecture scheduled");
            setShowScheduleForm(false);
            setSchedTeacher("unassigned");

            // If they scheduled for the visually selected class, reload the schedule. 
            // Or we can just automatically switch the visual schedule to the newly scheduled class:
            setSelectedClass(schedClass);
            loadScheduleData(schedClass);
        } catch (error: any) {
            toast.error(error.message || "Conflict detected");
        } finally {
            setIsScheduling(false);
        }
    };

    if (isLoading) return <Loader variant="page" text="Loading HOD workspace..." />;

    if (!deptId) {
        // Check if user is actually an HOD
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.role === "HOD" || user.email === "admin@example.com") {
                // User is HOD but no departments exist
                return (
                    <div className="p-20 text-center">
                        <div className="max-w-md mx-auto space-y-4">
                            <div className="text-6xl mb-4">📚</div>
                            <h2 className="text-xl font-bold text-slate-900">No Departments Available</h2>
                            <p className="text-slate-500">
                                There are currently no departments in the system. Please ask your Principal to create departments first.
                            </p>
                            <p className="text-sm text-slate-400 mt-2">
                                Once a department is created and you are assigned as HOD, you'll be able to manage schedules here.
                            </p>
                        </div>
                    </div>
                );
            }
        }
        return <div className="p-20 text-center text-slate-500 font-outfit">Access Denied: You are not an HOD.</div>;
    }

    return (
        <div className="p-4 max-w-[1600px] mx-auto space-y-4 bg-slate-50/50 min-h-screen">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Academic Management</span>
                <span>/</span>
                <span>Department</span>
                <span>/</span>
                <span className="text-slate-700 font-medium">{classes.find(c => c.id === selectedClass)?.name || deptName}</span>
            </div>

            {/* Header with Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <GraduationCap className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-semibold text-slate-500">Department</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">{deptName}</h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate('/classes/new', { state: { returnTo: '/hod/schedule', departmentId: deptId, mode: 'create' } })} className="border-slate-300">
                        <Plus className="w-4 h-4 mr-1.5" />
                        New Class
                    </Button>
                    <Button size="sm" onClick={() => {
                        setSchedClass(selectedClass || (classes.length > 0 ? classes[0].id : ""));
                        setShowScheduleForm(true);
                    }} className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                        <Calendar className="w-4 h-4 mr-1.5" />
                        Schedule Lecture
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {/* Unified Sidebar: Classes + Catalog Removed */}

                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Class Filter</label>
                        <div className="w-56 border-l border-slate-200 pl-3">
                            <Select
                                value={selectedClass || undefined}
                                onValueChange={(val) => {
                                    setSelectedClass(val);
                                    loadScheduleData(val);
                                }}
                            >
                                <SelectTrigger className="h-8 border-none shadow-none focus:ring-0 px-0 bg-transparent text-sm font-semibold">
                                    <SelectValue placeholder="Select a class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map(c => (
                                        <SelectItem key={c.id} value={c.id} className="font-medium">{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Main: Weekly Timetable Grid */}
                <div className="flex flex-col gap-4">
                    {/* Inbox Section Removed per simplification request */}

                    <Card className="border-slate-200 shadow-sm overflow-hidden flex-1">
                        <CardHeader className="bg-white border-b border-slate-200 p-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <CardTitle className="text-lg font-bold text-slate-900">
                                        {classes.find(c => c.id === selectedClass)?.name || "Weekly Schedule"}
                                    </CardTitle>
                                    <p className="text-slate-500 text-xs mt-0.5">Weekly lecture distribution and conflict monitoring</p>
                                </div>
                                <div className="text-xs text-slate-400 font-medium">
                                    24-Hour Format
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {!selectedClass ? (
                                <div className="flex flex-col items-center justify-center min-h-[450px] text-slate-400 bg-slate-50/50">
                                    <div className="w-16 h-16 bg-white shadow-sm ring-1 ring-slate-200 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                        <Calendar className="w-8 h-8" />
                                    </div>
                                    <p className="text-lg font-bold text-slate-600">Select a class to view the schedule</p>
                                    <p className="text-sm mt-1">Please use the Class Filter above to select a class schedule.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Sticky Day Headers */}
                                    <div className="grid grid-cols-6 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
                                        {DAYS.map((day, idx) => (
                                            <div
                                                key={day}
                                                className={`p-3 text-center border-r last:border-0 border-slate-200 ${idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'
                                                    }`}
                                            >
                                                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">{day}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Grid with alternating column backgrounds */}
                                    <div className="grid grid-cols-6 min-h-[450px]">
                                        {DAYS.map((day, idx) => (
                                            <div
                                                key={day}
                                                className={`border-r last:border-0 border-slate-100 flex flex-col ${idx % 2 === 0 ? 'bg-slate-50/30' : 'bg-white'}`}
                                            >
                                                {TIME_SLOTS.map(slot => {
                                                    const scheduledItems = schedules.filter(s => s.day === day && s.startTime >= slot.start && s.startTime < slot.end);

                                                    return (
                                                        <div
                                                            key={slot.id}
                                                            role="button"
                                                            data-day={day}
                                                            data-slot={slot.id}
                                                            data-class-id={selectedClass}
                                                            data-start={slot.start}
                                                            data-end={slot.end}
                                                            onClick={handleCellClick}
                                                            className="min-h-[100px] border-b border-slate-100 p-2 relative group hover:bg-blue-50/50 cursor-pointer transition-colors"
                                                        >
                                                            {/* empty state text on hover */}
                                                            {scheduledItems.length === 0 && (
                                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                                                    <span className="text-[10px] font-medium text-blue-500 bg-white/90 px-2 py-1 rounded shadow-sm border border-blue-100">
                                                                        + {slot.label}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            <div className="space-y-2 pointer-events-none">
                                                                {scheduledItems.map(s => {
                                                                    const subjectName = subjects.find(sub => sub.id === s.subjectId)?.name || "Subject";
                                                                    const colors = getSubjectColor(subjectName);
                                                                    return (
                                                                        <div
                                                                            key={s.id}
                                                                            className={`relative p-2.5 bg-white rounded border-l-4 ${colors.border} shadow-sm border border-slate-200 group-hover:shadow-md transition-all duration-200`}
                                                                        >
                                                                            {/* Time pill badge - top right */}
                                                                            <div className="absolute top-1.5 right-1.5">
                                                                                <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                                                                    {s.startTime} - {s.endTime}
                                                                                </span>
                                                                            </div>

                                                                            {/* Subject with colored dot */}
                                                                            <div className="flex items-start gap-1.5 mb-1.5 pr-14">
                                                                                <div className={`w-1.5 h-1.5 rounded-full ${colors.dot} mt-1 flex-shrink-0`}></div>
                                                                                <h4 className={`text-xs font-bold ${colors.text} leading-tight line-clamp-2`}>
                                                                                    {subjectName}
                                                                                </h4>
                                                                            </div>

                                                                            {/* Teacher info */}
                                                                            {s.teacherName && (
                                                                                <div className="flex items-center gap-1.5 mt-2 bg-slate-50 p-1.5 rounded-md border border-slate-100">
                                                                                    <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                                                                                        <span className="text-[8px] font-bold text-slate-500">
                                                                                            {s.teacherName.charAt(0)}
                                                                                        </span>
                                                                                    </div>
                                                                                    <span className="text-[10px] font-medium text-slate-600 truncate">
                                                                                        {s.teacherName}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modals placeholders for now */}

            <Modal
                isOpen={showScheduleForm}
                onClose={() => setShowScheduleForm(false)}
                title={
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span>Schedule Lecture</span>
                    </div>
                }
                size="md"
            >
                <div className="pb-2">
                    <p className="text-xs text-slate-500 font-medium mb-4">Add a new session to the weekly timetable</p>
                    <form onSubmit={handleScheduleLecture} className="space-y-5">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-slate-500">Class</label>
                                <Select value={schedClass} onValueChange={setSchedClass} required>
                                    <SelectTrigger className="w-full h-10 px-3 bg-white border-slate-200">
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.length === 0 ? (
                                            <SelectItem value="empty" disabled>No classes found</SelectItem>
                                        ) : (
                                            classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-slate-500">Subject</label>
                                <Select value={schedSubject} onValueChange={setSchedSubject} required>
                                    <SelectTrigger className="w-full h-10 px-3 bg-white border-slate-200">
                                        <SelectValue placeholder="Select Subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableSubjects.length === 0 ? (
                                            <SelectItem value="empty" disabled>No subjects found for this class</SelectItem>
                                        ) : (
                                            availableSubjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-slate-500">Teacher (Optional)</label>
                                <Select value={schedTeacher} onValueChange={setSchedTeacher}>
                                    <SelectTrigger className="w-full h-10 px-3 bg-white border-slate-200">
                                        <SelectValue placeholder="Select Teacher" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unassigned">None (Unassigned)</SelectItem>
                                        {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-slate-500">Day</label>
                                    <Select value={schedDay} onValueChange={(val) => setSchedDay(val as DayOfWeek)}>
                                        <SelectTrigger className="w-full h-10 px-3 bg-white border-slate-200">
                                            <SelectValue placeholder="Select Day" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DAYS.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="contents">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase text-slate-500">Start Time</label>
                                        <Input type="time" value={schedStart} onChange={(e) => setSchedStart(e.target.value)} required className="bg-white" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase text-slate-500">End Time</label>
                                        <Input type="time" value={schedEnd} onChange={(e) => setSchedEnd(e.target.value)} required className="bg-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="pt-2 flex gap-3 border-t border-slate-100 mt-2 justify-end">
                            <Button type="button" variant="outline" onClick={() => setShowScheduleForm(false)} disabled={isScheduling}>Cancel</Button>
                            <Button type="submit" isLoading={isScheduling} className="bg-blue-600 hover:bg-blue-700 font-semibold shadow-md shadow-blue-200">
                                Publish Schedule
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
}
