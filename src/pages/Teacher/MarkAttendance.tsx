
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { AttendanceMarker } from "@/components/Attendance/AttendanceMarker";
import { localStorageRepository, type AttendanceRecord, type AttendanceRequest } from "@/services/localStorageRepository";
import { toast } from "react-toastify";
import { type Student } from "@/types/hierarchy";
import { Lock, Unlock, Clock } from "lucide-react";
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

export default function MarkAttendance() {
    return (
        <ErrorBoundary>
            <MarkAttendanceContent />
        </ErrorBoundary>
    );
}

function MarkAttendanceContent() {
    const { slotId } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [slotDetails, setSlotDetails] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);

    // Locking & Request State
    const [isLocked, setIsLocked] = useState(false);
    const [existingRecord, setExistingRecord] = useState<AttendanceRecord | undefined>(undefined);
    const [hasPendingRequest, setHasPendingRequest] = useState(false);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [requestReason, setRequestReason] = useState("");
    const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

    const loadData = async () => {
        if (!slotId) return;
        setIsLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 300));

            // 1. Try to find the schedule in local storage
            const allSchedules = localStorageRepository.schedules.getAll();
            const schedule = allSchedules.find(s => s.id === slotId);

            // 2. Check for existing attendance record
            // We need the date. For this demo, we assume "today" or the date from the schedule if it was specific (not implemented in schedule model yet)
            const today = new Date().toISOString().split('T')[0];
            const record = localStorageRepository.attendance.getByScheduleAndDate(slotId, today);

            setExistingRecord(record);
            setIsLocked(record?.isLocked || false);

            // 3. Check for pending requests
            const requests = localStorageRepository.attendanceRequests.getAll();
            const pending = requests.find(r => r.scheduleId === slotId && r.date === today && r.status === 'PENDING');
            setHasPendingRequest(!!pending);

            // 4. Check for Grant (Time-based unlock)
            if (record?.isLocked) {
                const now = new Date();
                if (record.allowedUntil) {
                    const allowedUntil = new Date(record.allowedUntil);
                    if (now < allowedUntil) {
                        // ACTIVE GRANT
                        setIsLocked(false);
                        // Set a timeout to auto-lock when time expires (optional but good UX)
                        const msRemaining = allowedUntil.getTime() - now.getTime();
                        if (msRemaining > 0) {
                            setTimeout(() => {
                                setIsLocked(true);
                                toast.warning("Edit permission has expired. Page is now locked.");
                            }, msRemaining);
                        }
                    } else {
                        // GRANT EXPIRED
                        setIsLocked(true);
                    }
                } else {
                    // NO GRANT
                    setIsLocked(true);
                }
            } else {
                // Not locked (Draft state)
                setIsLocked(false);
            }

            // 4. Check for APPROVED requests to temporarily unlock
            const approved = requests.find(r => r.scheduleId === slotId && r.date === today && r.status === 'APPROVED');
            if (approved) {
                // Check if grant is still valid
                if (approved.allowedUntil && new Date(approved.allowedUntil) > new Date()) {
                    // Grant Active
                    setIsLocked(false);
                    // We specifically DO NOT set existingRecord.isLocked = false in memory/DB unless we want to persist it.
                    // But the UI relies on isLocked state.
                } else if (approved.allowedUntil && new Date(approved.allowedUntil) <= new Date()) {
                    // Grant Expired
                    setIsLocked(true);
                }
            }

            if (schedule) {
                // Real Data Found
                setSlotDetails({
                    id: schedule.id,
                    subject: schedule.subjectId, // Ideally fetch subject name
                    className: schedule.classId, // Ideally fetch class name
                    time: `${schedule.startTime || '09:00'} - ${schedule.endTime || '10:00'} `,
                    date: today
                });

                const classStudents = localStorageRepository.students.getByClass(schedule.classId);
                setStudents(classStudents.map((s: Student) => ({
                    id: s.id,
                    name: s.name,
                    rollNo: s.rollNumber
                })));
            } else {
                // Dummy / Fallback Data for Demo
                let dummyClassId = "BSCS-Semester 4-A";
                let dummySubject = "Dummy Subject";

                // Try to match dummy IDs from TeacherLectures for better consistency
                if (slotId === "dummy_1") {
                    dummyClassId = "BSCS-Semester 4-A";
                    dummySubject = "Software Engineering 1";
                } else if (slotId === "dummy_2") {
                    dummyClassId = "SE-Semester 2-B";
                    dummySubject = "Web Engineering";
                } else if (slotId === "dummy_3") {
                    dummyClassId = "BSCS 3rd sem";
                    dummySubject = "Data Structures";
                }

                setSlotDetails({
                    id: slotId,
                    subject: dummySubject,
                    className: dummyClassId,
                    time: "09:00 AM - 10:30 AM",
                    date: today
                });

                // Try to get real students for the dummy class if they exist in seed
                const potentialStudents = localStorageRepository.students.getByClass(dummyClassId);

                if (potentialStudents.length > 0) {
                    setStudents(potentialStudents.map((s: Student) => ({
                        id: s.id,
                        name: s.name,
                        rollNo: s.rollNumber
                    })));
                } else {
                    // Total fallback if no students found for class
                    setStudents([
                        { id: 101, name: "Ali Khan", rollNo: "BSCS-2023-001" },
                        { id: 102, name: "Sara Ahmed", rollNo: "BSCS-2023-002" },
                        { id: 103, name: "Omar Farooq", rollNo: "BSCS-2023-003" },
                        { id: 104, name: "Zainab Bibi", rollNo: "BSCS-2023-004" },
                        { id: 105, name: "Bilal Raza", rollNo: "BSCS-2023-005" }
                    ]);
                }
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

    const handleSubmit = async (attendanceData: Record<number, 'Present' | 'Absent'>) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        // Prepare Record
        const studentsList = students.map(s => ({
            studentId: s.id.toString(),
            status: attendanceData[s.id] || 'Present'
        }));

        const newRecord: AttendanceRecord = {
            id: existingRecord?.id || `att_${Date.now()} `,
            scheduleId: slotId!,
            date: slotDetails.date,
            teacherId: "current_teacher_id", // In real app get from context
            students: studentsList,
            isLocked: true, // Lock immediately
            submittedAt: new Date().toISOString()
        };

        localStorageRepository.attendance.save(newRecord);

        setIsLocked(true);
        setExistingRecord(newRecord);

        // If there was an approved request, we should probably mark it as "USED" or similar, 
        // but for now re-locking is handled by the save() method which sets isLocked=true.

        toast.success("Attendance submitted and locked.");
        setIsLoading(false);
    };

    const handleRequestEdit = async () => {
        if (!requestReason.trim()) {
            toast.error("Please provide a reason.");
            return;
        }

        setIsSubmittingRequest(true);
        await new Promise(resolve => setTimeout(resolve, 600));

        // Determine Approver Context (University -> HOD, else Principal)
        // For this demo, assuming University context as default per dashboard
        const approverRole: 'HOD' | 'PRINCIPAL' = 'HOD';

        const newRequest: AttendanceRequest = {
            id: `req_${Date.now()} `,
            requesterId: "current_teacher_id",
            scheduleId: slotId!,
            date: slotDetails.date,
            reason: requestReason,
            status: 'PENDING',
            approverRole,
            createdAt: new Date().toISOString()
        };

        localStorageRepository.attendanceRequests.add(newRequest);
        setHasPendingRequest(true);
        setIsRequestModalOpen(false);
        setRequestReason("");

        toast.success(`Request sent to ${approverRole}.`);
        setIsSubmittingRequest(false);
    };

    if (isLoading) return <div className="p-8">Loading class details...</div>;
    if (error) return <ErrorState title="Unable to load attendance" message={error} variant="page" onRetry={loadData} showRefreshPage={true} />;
    if (!slotDetails) return <div className="p-8 text-red-600">Class not found.</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <PageHeader
                breadcrumb={[
                    { label: 'Back', to: -1 as any },
                    { label: 'Mark Attendance' }
                ]}
                title={`Mark Attendance: ${slotDetails.subject} `}
                description={`${slotDetails.className} • ${slotDetails.time} • ${slotDetails.date} `}
            />

            {/* 1. LOCKED STATE */}
            {isLocked && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-4">
                    <div className="p-2 bg-amber-100 rounded-full">
                        <Lock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-amber-900">Attendance Locked</h4>
                        <p className="text-sm text-amber-700 mt-1">
                            This attendance record has been submitted and locked.
                            <br />
                            To make changes, you must request permission from your {slotDetails.className.includes("University") ? "HOD" : "Principal"}.
                        </p>

                        <div className="mt-3">
                            {hasPendingRequest ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                                    <Clock className="w-3.5 h-3.5" />
                                    Request Pending Approval
                                </span>
                            ) : (
                                <Button
                                    onClick={() => setIsRequestModalOpen(true)}
                                    className="bg-amber-600 hover:bg-amber-700 text-white"
                                    tooltip="Submit a request to unlock this attendance record for editing"
                                >
                                    Request to Edit
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 2. TEMPORARY UNLOCK STATE */}
            {!isLocked && existingRecord && existingRecord.isLocked && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 bg-blue-100 rounded-full">
                        <Unlock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                            Edit Mode Enabled
                            <span className="text-xs font-normal px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                                Time Limited
                            </span>
                        </h4>
                        <p className="text-sm text-blue-700 mt-1">
                            You have been granted temporary access to edit this record.
                            <br />
                            <strong>Warning:</strong> Locking will resume immediately after you submit changes or when the time expires.
                        </p>
                        {existingRecord.allowedUntil && (
                            <p className="text-xs font-mono text-blue-800 mt-2 bg-blue-100/50 inline-block px-2 py-1 rounded">
                                Expires at: {new Date(existingRecord.allowedUntil).toLocaleTimeString()}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* 3. NORMAL / DRAFT STATE - No Banner needed or simple info */}

            <AttendanceMarker
                students={students}
                isLoading={false}
                onSubmit={handleSubmit}
                isSubmitting={isLoading}
                onCancel={() => navigate(-1)}
                title="Student List"
                locked={isLocked} // Pass locked state to component (need to update component props)
                initialData={existingRecord?.students.reduce((acc, curr) => ({ ...acc, [curr.studentId]: curr.status }), {})}
            />

            <Modal
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
                title="Request to Edit Attendance"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                        Please provide a reason for editing this locked attendance record. This request will be sent to your {slotDetails.className.includes("University") ? "HOD" : "Principal"} for approval.
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Reason *</label>
                        <textarea
                            value={requestReason}
                            onChange={(e) => setRequestReason(e.target.value)}
                            placeholder="e.g. Mistakenly marked absent..."
                            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            variant="ghost"
                            onClick={() => setIsRequestModalOpen(false)}
                            tooltip="Cancel request"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRequestEdit}
                            disabled={!requestReason.trim()}
                            isLoading={isSubmittingRequest}
                            tooltip="Submit your edit request"
                        >
                            {!isSubmittingRequest && "Send Request"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

