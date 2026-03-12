import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Lock } from "lucide-react";

interface AttendanceMarkerProps {
    students: any[];
    isLoading: boolean;
    onSubmit: (attendanceData: Record<number, 'Present' | 'Absent'>) => void;
    isSubmitting: boolean;
    onCancel: () => void;
    title?: string;
    locked?: boolean;
    initialData?: Record<number, 'Present' | 'Absent'>;
}

export function AttendanceMarker({
    students,
    isLoading,
    onSubmit,
    isSubmitting,
    onCancel,
    title,
    locked = false,
    initialData = {}
}: AttendanceMarkerProps) {
    const [attendanceData, setAttendanceData] = useState<Record<number, 'Present' | 'Absent'>>({});

    useEffect(() => {
        if (Object.keys(initialData).length > 0) {
            setAttendanceData(initialData);
        }
    }, [initialData]);

    const toggleStatus = (studentId: number) => {
        if (locked) return;
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'Absent' ? 'Present' : 'Absent'
        }));
    };

    const getStatus = (studentId: number) => {
        // If we have explicit data, use it. Otherwise default to Present.
        // If locked and no data (shouldn't happen for locked), default to Present.
        return attendanceData[studentId] || 'Present';
    };

    const handleSubmit = () => {
        onSubmit(attendanceData);
    };

    const presentCount = students?.filter(s => getStatus(s.id) === 'Present').length || 0;
    const absentCount = students?.filter(s => getStatus(s.id) === 'Absent').length || 0;

    return (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-lg">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    {title || "Mark Attendance"}
                    {locked && <Lock className="w-4 h-4 text-slate-400" />}
                </h3>
                <div className="text-sm text-gray-500 flex gap-4">
                    <span>Total: {students?.length || 0}</span>
                    <div className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-600" /> {presentCount} Present</div>
                    <div className="flex items-center gap-1"><XCircle className="w-4 h-4 text-red-600" /> {absentCount} Absent</div>
                </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
                {isLoading ? (
                    <div className="p-12 text-center text-gray-500">Loading students...</div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 bg-slate-50">Roll No</th>
                                <th className="px-4 py-3 bg-slate-50">Name</th>
                                <th className="px-4 py-3 text-right bg-slate-50">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {students?.map(student => {
                                const status = getStatus(student.id);
                                return (
                                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-slate-600 font-mono text-xs">{student.rollNo}</td>
                                        <td className="px-4 py-3 font-medium text-slate-900">{student.name}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => toggleStatus(student.id)}
                                                disabled={locked}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${status === 'Present'
                                                    ? 'bg-green-50 border-green-200 text-green-700' + (!locked ? ' hover:bg-green-100' : ' opacity-75 cursor-not-allowed')
                                                    : 'bg-red-50 border-red-200 text-red-700' + (!locked ? ' hover:bg-red-100' : ' opacity-75 cursor-not-allowed')
                                                    }`}
                                            >
                                                {status === 'Present' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                                <span className="font-semibold w-14 text-center">{status}</span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {(!students || students.length === 0) && (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-gray-400">No students found for this class.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {!locked && (
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 rounded-b-lg">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || isLoading}
                        className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 shadow-sm transition-colors flex items-center gap-2"
                    >
                        {isSubmitting ? "Submitting..." : "Submit Attendance"}
                    </button>
                </div>
            )}
        </div>
    );
}
