import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { AttendanceMarker } from "@/components/Attendance/AttendanceMarker";
import { localStorageRepository, type AttendanceRecord } from "@/services/localStorageRepository";
import { dashboardService } from "@/services/dashboardService";
import { toast } from "react-toastify";
import { type Student } from "@/types/hierarchy";
import { Modal } from "@/components/ui/Modal";
import { ErrorState } from "@/components/ui/ErrorState";
import { normalizeError } from "@/utils/errorUtils";
import { Button } from "@/components/ui/button";

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 border border-red-500 bg-red-50 text-red-900 rounded-md">
                    <h3 className="font-bold">Something went wrong.</h3>
                    <p className="font-mono text-sm mt-2">{this.state.error?.message}</p>
                    <pre className="text-xs mt-2 overflow-auto max-h-40 bg-white p-2 border rounded">
                        {this.state.error?.stack}
                    </pre>
                </div>
            );
        }

        return this.props.children;
    }
}

export default function MarkAttendancePrincipal() {
    return (
        <ErrorBoundary>
            <MarkAttendancePrincipalContent />
        </ErrorBoundary>
    );
}

function MarkAttendancePrincipalContent() {
    const { slotId } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [slotDetails, setSlotDetails] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);

    // State for existing record and marking
    const [existingRecord, setExistingRecord] = useState<AttendanceRecord | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Edit Reason Modal State
    const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
    const [editReason, setEditReason] = useState("");
    const [pendingAttendanceData, setPendingAttendanceData] = useState<Record<number, 'Present' | 'Absent'> | null>(null);

    const loadData = async () => {
        if (!slotId) return;
        setIsLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 300));

            const strSlotId = String(slotId); // slots from AttendanceHub can be numeric ID strings

            // In the mock dashboardService, getSubmittedAttendance and pendingAttendance hold our context
            // Principal's AttendanceHub uses numeric classIds or mock IDs. We need to find the details.

            // Let's check both pending and submitted classes for details (mock logic)
            const pc = (await dashboardService.getPendingAttendance()).find(c => String(c.id) === strSlotId);
            const sc = (await dashboardService.getSubmittedAttendance()).find(c => String(c.id) === strSlotId);

            const targetClass = pc || sc;

            const today = new Date().toISOString().split('T')[0];
            const record = localStorageRepository.attendance.getByScheduleAndDate(strSlotId, sc?.submittedAt ? sc.submittedAt.split('T')[0] : today);

            setExistingRecord(record);

            if (targetClass) {
                setSlotDetails({
                    id: targetClass.id,
                    subject: targetClass.className,
                    className: targetClass.className,
                    time: targetClass.time,
                    date: record?.date || today
                });

                // Fetch real students if available, or fallback
                let classStudents: any[] = [];
                try {
                    // Try to extract classId from the targetClass (in our mock className="BSCS-Semester 4-A")
                    // Real API would just use classId.
                    // For demo, we just get "some" students
                    classStudents = await dashboardService.getStudentsForClass(typeof targetClass.id === 'string' ? parseInt(targetClass.id) : targetClass.id);
                } catch (e) {
                    // Fallback done below
                }

                if (classStudents && classStudents.length > 0) {
                    setStudents(classStudents.map((s: Student) => ({
                        id: s.id,
                        name: s.name,
                        rollNo: (s as any).rollNo || s.rollNumber
                    })));
                } else {
                    setStudents([
                        { id: 101, name: "Ali Khan", rollNo: "BSCS-2023-001" },
                        { id: 102, name: "Sara Ahmed", rollNo: "BSCS-2023-002" },
                        { id: 103, name: "Omar Farooq", rollNo: "BSCS-2023-003" },
                        { id: 104, name: "Zainab Bibi", rollNo: "BSCS-2023-004" },
                        { id: 105, name: "Bilal Raza", rollNo: "BSCS-2023-005" }
                    ]);
                }

            } else {
                setError("Class not found.");
            }
        } catch (err) {
            console.error("Failed to load attendance details", err);
            setError(normalizeError(err, "We couldn't fetch the attendance details. Please try again."));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [slotId]);

    const handleActionSubmit = (attendanceData: Record<number, 'Present' | 'Absent'>) => {
        if (existingRecord) {
            // It's an update, we need a reason
            setPendingAttendanceData(attendanceData);
            setEditReason("");
            setIsReasonModalOpen(true);
        } else {
            // New submission
            processSubmission(attendanceData);
        }
    };

    const processSubmission = async (attendanceData: Record<number, 'Present' | 'Absent'>, reason?: string) => {
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        const studentsList = students.map(s => ({
            studentId: s.id.toString(),
            status: attendanceData[s.id] || 'Present'
        }));

        const newRecord: AttendanceRecord = {
            id: existingRecord?.id || `att_${Date.now()}`,
            scheduleId: String(slotId!),
            date: slotDetails.date,
            teacherId: existingRecord?.teacherId || "principal",
            students: studentsList,
            isLocked: true,
            // In real world, we'd log the reason to Audit
            submittedAt: new Date().toISOString()
        };

        if (reason && existingRecord) {
            // Mocking the update API call which accepts a reason for audit logs
            try {
                // Using updateAttendance mock which creates an Audit entry
                // Ensure slotId is number for the mock service
                await dashboardService.updateAttendance(slotId ? parseInt(slotId) : 0, studentsList, 1, reason);
            } catch (e) {
                console.warn(e);
            }
        } else if (!existingRecord) {
            try {
                // Ensure slotId is number for the mock service
                await dashboardService.markAttendance(slotId ? parseInt(slotId) : 0, studentsList as any);
            } catch (e) { /* ignore */ }
        }

        localStorageRepository.attendance.save(newRecord);

        toast.success(existingRecord ? "Attendance updated successfully." : "Attendance submitted successfully.");
        setIsSubmitting(false);
        setIsReasonModalOpen(false);
        navigate(-1);
    };

    const handleConfirmEdit = () => {
        if (editReason.trim().length < 10) {
            toast.error("Please provide a meaningful reason (at least 10 characters).");
            return;
        }
        if (pendingAttendanceData) {
            processSubmission(pendingAttendanceData, editReason);
        }
    };

    if (isLoading) return <div className="p-8">Loading class details...</div>;
    if (error) return <ErrorState title="Unable to load class details" message={error} variant="page" onRetry={loadData} showRefreshPage={true} />;
    if (!slotDetails) return <div className="p-8 text-red-600">Class not found.</div>;

    const initialData = existingRecord?.students.reduce((acc, curr) => ({ ...acc, [curr.studentId]: curr.status }), {}) || {};

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <PageHeader
                breadcrumb={[
                    { label: 'Back', to: -1 as any },
                    { label: 'Mark Attendance' }
                ]}
                title={`${existingRecord ? 'Edit' : 'Mark'} Attendance`}
                description={`${slotDetails.className} • ${slotDetails.time} • ${slotDetails.date}`}
            />

            {existingRecord && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                            Editing Submitted Attendance
                        </h4>
                        <p className="text-sm text-blue-700 mt-1">
                            You are modifying a historically submitted record. A mandatory reason for edits is required to update this record in the audit log.
                        </p>
                    </div>
                </div>
            )}

            <AttendanceMarker
                students={students}
                isLoading={false}
                onSubmit={handleActionSubmit}
                isSubmitting={isSubmitting}
                onCancel={() => navigate(-1)}
                title="Student List"
                locked={false}
                initialData={initialData}
            />

            <Modal
                isOpen={isReasonModalOpen}
                onClose={() => setIsReasonModalOpen(false)}
                title="Reason for Edit"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                        Please provide a reason for editing this attendance record. This will be recorded in the official audit logs.
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Reason *</label>
                        <textarea
                            value={editReason}
                            onChange={(e) => setEditReason(e.target.value)}
                            placeholder="e.g. Correcting clerical error..."
                            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                        />
                        <p className="text-xs text-slate-500 mt-1">Minimum 10 characters.</p>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            variant="ghost"
                            onClick={() => setIsReasonModalOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmEdit}
                            disabled={editReason.trim().length < 10 || isSubmitting}
                            isLoading={isSubmitting}
                        >
                            Update Attendance
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
} 
