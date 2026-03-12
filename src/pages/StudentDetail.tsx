import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { localStorageRepository } from "../services/localStorageRepository";
import { type Student, type Schedule, type Class } from "../types/hierarchy";
import { PageHeader } from "@/components/ui/PageHeader";
import { Mail, Phone, Calendar, User, BookOpen, Clock, Award, AlertTriangle } from "lucide-react";
import { ErrorState } from "@/components/ui/ErrorState";
import { normalizeError } from "@/utils/errorUtils";

export default function StudentDetail() {
    const { id, classId } = useParams();
    const [student, setStudent] = useState<Student | null>(null);
    const [classData, setClassData] = useState<Class | null>(null);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        if (!id) return;
        setIsLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            const s = localStorageRepository.students.getById(id);
            if (s) {
                setStudent(s);
                const w = localStorageRepository.schedules.getByClass(s.classId);
                setSchedules(w);

                if (classId) {
                    const c = localStorageRepository.classes.getAll().find((cls: Class) => cls.id === classId);
                    if (c) setClassData(c);
                }
            } else {
                throw new Error("Student not found");
            }
        } catch (err) {
            console.error("Failed to fetch student details", err);
            setError(normalizeError(err, "We couldn't fetch student details. Please try again."));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    if (isLoading) return <div className="p-8 text-center text-slate-500">Loading Profile...</div>;
    if (error) return <ErrorState title="Unable to load profile" message={error} variant="page" onRetry={loadData} showRefreshPage={true} />;
    if (!student) return <div className="p-8 text-center text-red-500">Student not found</div>;

    // Visual Timetable Helper
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "01:00", "02:00"];

    const getScheduleForSlot = (day: string, timePrefix: string) => {
        return schedules.find(s => s.day === day && s.startTime.startsWith(timePrefix));
    };

    return (
        <div className="space-y-8">
            <PageHeader
                breadcrumb={classId && classData ? [
                    { label: 'Classes Registry', to: '/classes' },
                    { label: classData.name, to: `/classes/detail/${classId}` },
                    { label: student.name }
                ] : [
                    { label: 'Students Registry', to: '/students' },
                    { label: student.name }
                ]}
                title={student.name}
                description={`${student.rollNumber} • ${student.departmentId}`}
            />

            {/* Identity Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-8 bg-gradient-to-r from-indigo-900 to-purple-900 text-white flex flex-col md:flex-row gap-6 items-center md:items-start">
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center text-3xl font-bold backdrop-blur-sm border border-white/20">
                        {student.name.charAt(0)}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-bold">{student.name}</h1>
                        <p className="text-indigo-200 text-lg">{student.classId}</p>

                        <div className="mt-4 flex flex-wrap gap-4 justify-center md:justify-start text-sm text-indigo-100/80">
                            <span className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {student.email}
                            </span>
                            <span className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                {student.phone}
                            </span>
                            <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Joined {student.joiningDate}
                            </span>
                            <span className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Guardian: {student.guardianName} ({student.guardianPhone})
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Monthly Attendance */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-sm text-gray-500">Overall Attendance</div>
                        <Clock className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{student.attendance}%</div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
                        <div
                            className={`h-1.5 rounded-full ${student.attendance >= 90 ? "bg-emerald-500" : student.attendance >= 75 ? "bg-blue-500" : "bg-red-500"}`}
                            style={{ width: `${student.attendance}%` }}
                        ></div>
                    </div>
                </div>

                {/* CGPA */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-sm text-gray-500">CGPA</div>
                        <Award className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{student.cgpa?.toFixed(2) || 'N/A'}</div>
                    <div className="text-xs text-gray-400 mt-1">Cumulative Grade Point Average</div>
                </div>

                {/* Status */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-sm text-gray-500">Academic Status</div>
                        <BookOpen className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 capitalize">{student.status.toLowerCase()}</div>
                    <div className="text-xs text-gray-400 mt-1">Current Enrollment Status</div>
                </div>

                {/* Risk Factor */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-sm text-gray-500">Risk Assessment</div>
                        <AlertTriangle className={`w-4 h-4 ${student.attendance < 75 || (student.cgpa && student.cgpa < 2.0) ? 'text-red-500' : 'text-gray-300'}`} />
                    </div>
                    {student.attendance < 75 || (student.cgpa && student.cgpa < 2.0) ? (
                        <>
                            <div className="text-3xl font-bold text-red-600">At Risk</div>
                            <div className="text-xs text-red-400 mt-1">
                                {student.attendance < 75 && "Low Attendance. "}
                                {student.cgpa && student.cgpa < 2.0 && "Low CGPA."}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="text-3xl font-bold text-emerald-600">On Track</div>
                            <div className="text-xs text-emerald-400 mt-1">Good academic standing</div>
                        </>
                    )}
                </div>
            </div>

            {/* Timetable Grid */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 overflow-hidden">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Class Timetable</h3>
                <div className="overflow-x-auto">
                    <div className="min-w-[800px] grid grid-cols-6 border-l border-t border-gray-200">
                        {/* Header Row */}
                        <div className="p-4 bg-gray-50 text-xs font-bold text-gray-500 uppercase border-r border-b border-gray-200">Time / Day</div>
                        {days.map(day => (
                            <div key={day} className="p-4 bg-gray-50 text-xs font-bold text-center text-gray-500 uppercase border-r border-b border-gray-200">
                                {day}
                            </div>
                        ))}

                        {/* Rows */}
                        {timeSlots.map(time => (
                            <React.Fragment key={time}>
                                <div className="p-4 text-xs font-medium text-gray-500 border-r border-b border-gray-200">
                                    {time}
                                </div>
                                {days.map(day => {
                                    const session = getScheduleForSlot(day, time.split(":")[0]); // Simple prefix match
                                    return (
                                        <div key={`${day}-${time}`} className="p-2 border-r border-b border-gray-200 min-h-[80px]">
                                            {session ? (
                                                <div className="h-full bg-indigo-50 border border-indigo-100 rounded p-2 text-xs hover:bg-indigo-100 transition-colors cursor-default">
                                                    <div className="font-bold text-indigo-700">{session.subjectId}</div>
                                                    <div className="text-indigo-600 font-medium mt-0.5">{session.teacherName}</div>
                                                    <div className="text-indigo-400 mt-1 text-[10px]">{session.startTime} - {session.endTime}</div>
                                                </div>
                                            ) : (
                                                <div className="h-full bg-gray-50/30"></div>
                                            )}
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
