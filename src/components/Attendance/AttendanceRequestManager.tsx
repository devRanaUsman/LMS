import { localStorageRepository, type AttendanceRequest } from "@/services/localStorageRepository";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "../ui/button";

export function AttendanceRequestManager() {
    const [requests, setRequests] = useState<AttendanceRequest[]>([]);
    const [loading, setLoading] = useState(true);

    // Approval Modal State
    const [selectedRequest, setSelectedRequest] = useState<AttendanceRequest | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [justification, setJustification] = useState("");
    const [timeLimit, setTimeLimit] = useState("15"); // Default 15 minutes
    const [processing, setProcessing] = useState(false);

    const loadRequests = () => {
        try {
            // In a real app, filter for Principal/HOD role
            const allAndPending = localStorageRepository.attendanceRequests.getAll();
            // Filter pending only for the main list, or sort by status
            const pending = allAndPending.filter(r => r.status === 'PENDING');
            setRequests(pending);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const handleReject = (id: string) => {
        if (!confirm("Are you sure you want to reject this request?")) return;
        try {
            localStorageRepository.attendanceRequests.updateStatus(id, 'REJECTED', "Rejected by Principal");
            toast.info("Request rejected.");
            loadRequests();
        } catch (e) {
            toast.error("Failed to reject request.");
        }
    };

    const initiateApprove = (req: AttendanceRequest) => {
        setSelectedRequest(req);
        setJustification("");
        setTimeLimit("15");
        setModalOpen(true);
    }

    const confirmApprove = () => {
        if (!selectedRequest) return;
        if (justification.length < 10) {
            toast.error("Please provide a justification (min 10 chars).");
            return;
        }

        setProcessing(true);
        try {
            // Calculate allowedUntil time
            const now = new Date();
            now.setMinutes(now.getMinutes() + parseInt(timeLimit));
            const allowedUntilIso = now.toISOString();

            localStorageRepository.attendanceRequests.updateStatus(
                selectedRequest.id,
                'APPROVED',
                justification,
                allowedUntilIso
            );

            toast.success("Request approved. Teacher has been notified.");
            setModalOpen(false);
            loadRequests();
        } catch (e) {
            console.error(e);
            toast.error("Failed to approve request.");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div>Loading requests...</div>;

    if (requests.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Attendance Change Requests</CardTitle>
                    <CardDescription>No pending requests.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Attendance Change Requests
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full ml-2">
                        {requests.length} Pending
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {requests.map(req => (
                        <div key={req.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg bg-slate-50 gap-4">
                            <div>
                                <h4 className="font-medium text-slate-900">
                                    {req.scheduleId} - {req.date}
                                </h4>
                                <p className="text-sm text-slate-600 mt-1">Reason: <span className="italic">"{req.reason}"</span></p>
                                <p className="text-xs text-slate-500 mt-1">Requested: {new Date(req.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button
                                    variant="destructive"
                                    onClick={() => initiateApprove(req)}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2 bg-green-500 hover:bg-green-700 text-white rounded-md text-sm transition-colors"
                                    tooltip="Approve attendance edit request"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Approve
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleReject(req.id)}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm transition-colors border-0"
                                    tooltip="Reject attendance edit request"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>

            {/* Approval Dialog */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve Request</DialogTitle>
                        <DialogDescription>
                            Grant temporary access to edit attendance. This action is time-limited.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Justification (Required)</label>
                            <textarea
                                value={justification}
                                onChange={(e) => setJustification(e.target.value)}
                                placeholder="Why are you approving this change?"
                                className="w-full min-h-[80px] p-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-slate-500 text-right">{justification.length}/10 chars</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Time Limit (Minutes)</label>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-500" />
                                <select
                                    value={timeLimit}
                                    onChange={(e) => setTimeLimit(e.target.value)}
                                    className="flex-1 p-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="5">5 Minutes</option>
                                    <option value="15">15 Minutes</option>
                                    <option value="30">30 Minutes</option>
                                    <option value="60">1 Hour</option>
                                </select>
                            </div>
                            <p className="text-xs text-slate-500">
                                Access will automatically expire after this duration.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setModalOpen(false)}
                            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
                            tooltip="Cancel approval"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmApprove}
                            disabled={processing}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            tooltip="Confirm and approve request"
                        >
                            {processing ? "Approving..." : "Confirm Approval"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
