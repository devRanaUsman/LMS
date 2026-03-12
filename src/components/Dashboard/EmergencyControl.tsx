import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { dashboardService } from "@/services/dashboardService";
import { ShieldAlert, Megaphone, Lock, Unlock } from "lucide-react";

export function EmergencyControl() {
    const queryClient = useQueryClient();
    const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
    const [closeModalOpen, setCloseModalOpen] = useState(false);

    // Status
    const { data: schoolStatus } = useQuery({
        queryKey: ["schoolStatus"],
        queryFn: dashboardService.getSchoolStatus,
    });

    const isClosed = schoolStatus?.status === 'Closed';

    // Toggle Status Mutation
    const statusMutation = useMutation({
        mutationFn: ({ status, reason }: { status: 'Open' | 'Closed'; reason?: string }) =>
            dashboardService.toggleSchoolStatus(status, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["schoolStatus"] });
            queryClient.invalidateQueries({ queryKey: ["auditLogs"] });
            setCloseModalOpen(false);
        },
    });

    // Broadcast Mutation
    const broadcastMutation = useMutation({
        mutationFn: (message: string) =>
            dashboardService.broadcastMessage(message, ['Teachers', 'HODs']),
        onSuccess: () => {
            setBroadcastModalOpen(false);
            alert("Broadcast Sent Successfully");
        },
    });

    const [closeReason, setCloseReason] = useState("");
    const [broadcastMsg, setBroadcastMsg] = useState("");

    return (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="p-3 flex items-center gap-3">
                {/* Status Badge */}
                <div className="flex items-center gap-2">
                    <ShieldAlert className={`h-4 w-4 ${isClosed ? 'text-red-600' : 'text-green-600'}`} />
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase transition-all duration-300 ${isClosed ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {schoolStatus?.status || 'Open'}
                    </span>
                </div>

                {/* Divider */}
                <div className="h-8 w-px bg-slate-200"></div>

                {/* Close/Open School Button */}
                <button
                    onClick={() => {
                        setCloseReason("");
                        setCloseModalOpen(true);
                    }}
                    className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-semibold transition-all duration-300 hover:scale-105 ${isClosed
                        ? "bg-green-600 hover:bg-green-700 text-white shadow-sm"
                        : "bg-red-600 hover:bg-red-700 text-white shadow-sm"
                        }`}
                >
                    {isClosed ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    {isClosed ? "Re-Open" : "Close School"}
                </button>

                {/* Broadcast Button */}

                <button
                    onClick={() => {
                        setBroadcastMsg("");
                        setBroadcastModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-semibold transition-all duration-300 bg-orange-500 hover:bg-orange-600 text-white cursor-pointer hover:scale-105 shadow-sm"
                    title="Send broadcast message"
                >
                    <Megaphone className="w-3.5 h-3.5" />
                    Broadcast
                </button>
            </div>

            {/* Close/Reopen Modal */}
            <Modal
                isOpen={closeModalOpen}
                onClose={() => setCloseModalOpen(false)}
                title={isClosed ? "Confirm Re-Opening" : "Confirm School Closure"}
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        {isClosed
                            ? "Are you sure you want to re-open the school? Normal operations will resume."
                            : "This will mark today as a 'Closure'. Please provide a reason for the audit log."}
                    </p>
                    {!isClosed && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Reason (Required)</label>
                            <input
                                type="text"
                                className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                                placeholder="e.g., Heavy Rain, Security Threat"
                                value={closeReason}
                                onChange={(e) => setCloseReason(e.target.value)}
                            />
                        </div>
                    )}
                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={() => setCloseModalOpen(false)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
                        <button
                            onClick={() => statusMutation.mutate({ status: isClosed ? 'Open' : 'Closed', reason: closeReason })}
                            disabled={!isClosed && !closeReason}
                            className={`px-4 py-2 text-sm text-white rounded ${isClosed ? 'bg-green-600' : 'bg-red-600 disabled:opacity-50'}`}
                        >
                            Confirm {isClosed ? "Re-Open" : "Closure"}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Broadcast Modal */}
            <Modal
                isOpen={broadcastModalOpen}
                onClose={() => setBroadcastModalOpen(false)}
                title="Send Broadcast Message"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Audience</label>
                        <div className="flex gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded">
                            <span className="bg-slate-200 px-2 py-1 rounded">Teachers</span>
                            <span className="bg-slate-200 px-2 py-1 rounded">HODs</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                        <textarea
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm min-h-[100px]"
                            placeholder="Type urgent message here..."
                            value={broadcastMsg}
                            onChange={(e) => setBroadcastMsg(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={() => setBroadcastModalOpen(false)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
                        <button
                            onClick={() => broadcastMutation.mutate(broadcastMsg)}
                            disabled={!broadcastMsg}
                            className="px-4 py-2 text-sm text-white bg-orange-600 hover:bg-orange-700 rounded disabled:opacity-50"
                        >
                            Send Broadcast
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
