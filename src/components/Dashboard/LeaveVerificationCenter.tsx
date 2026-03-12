import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DataTable, { type ColumnDef } from "@/components/ui/DataTable";
import { dashboardService, type LeaveRequest } from "@/services/dashboardService";
import { Check, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { FilterSearch } from "@/components/ui/Filters/FilterSearch";
import { FilterSelect } from "@/components/ui/Filters/FilterSelect";

export function LeaveVerificationCenter() {
    const queryClient = useQueryClient();

    // Confirmation dialog state
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        itemId: number | null;
        action: 'Approved' | 'Rejected' | null;
    }>({ isOpen: false, itemId: null, action: null });

    const [reason, setReason] = useState("");

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [searchType, setSearchType] = useState<string>("Name");
    const [filterStatus, setFilterStatus] = useState<string>("ALL");

    // Data - Leaves
    const { data: leavesRaw, isLoading: isLoadingLeaves } = useQuery({
        queryKey: ["leaves"],
        queryFn: dashboardService.getLeaves
    });

    const leaves = useMemo(() => {
        if (!leavesRaw) return [];
        return leavesRaw.filter((leave) => {
            let matchesSearch = true;
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                matchesSearch = leave.name.toLowerCase().includes(searchLower);
            }
            const matchesStatus = filterStatus === "ALL" || leave.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [leavesRaw, searchTerm, filterStatus]);

    // Leave Mutation
    const leaveMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: 'Approved' | 'Rejected'; reason?: string }) =>
            dashboardService.processLeave(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leaves"] });
            queryClient.invalidateQueries({ queryKey: ["principalStats"] }); // Update KPIs
            setConfirmDialog({ isOpen: false, itemId: null, action: null });
            setReason("");
        },
    });

    const openConfirmDialog = (id: number, action: 'Approved' | 'Rejected') => {
        setConfirmDialog({ isOpen: true, itemId: id, action });
        setReason("");
    };

    const handleConfirmAction = () => {
        if (!confirmDialog.itemId || !confirmDialog.action) return;

        // Validate required reason for rejection
        if (confirmDialog.action === 'Rejected' && !reason.trim()) {
            return; // Don't proceed without reason
        }

        leaveMutation.mutate({
            id: confirmDialog.itemId,
            status: confirmDialog.action,
            reason: reason.trim() || undefined
        });
    };

    const leaveColumns: ColumnDef<LeaveRequest>[] = [
        { header: "Type", accessorKey: "type", cell: (row) => <span className={`text-xs px-2 py-1 rounded font-medium ${row.type === 'Teacher' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{row.type}</span> },
        { header: "Name", accessorKey: "name" },
        { header: "Details", accessorKey: "details" },
        {
            header: "Status",
            accessorKey: "status",
            cell: (row) => (
                <span className={`text-xs px-2 py-1 rounded font-medium ${row.status === 'Approved' ? 'bg-green-100 text-green-700' :
                    row.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                    }`}>
                    {row.status}
                </span>
            )
        },
        {
            header: "Actions",
            cell: (row) => row.status === 'Pending' ? (
                <div className="flex gap-2">
                    <button
                        onClick={() => openConfirmDialog(row.id, 'Approved')}
                        disabled={leaveMutation.isPending}
                        className="p-1 rounded bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
                        title="Approve"
                    >
                        <Check className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => openConfirmDialog(row.id, 'Rejected')}
                        disabled={leaveMutation.isPending}
                        className="p-1 rounded bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                        title="Reject"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : <span className="text-gray-400 text-xs">-</span>
        }
    ];

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <FilterSearch
                    value={searchTerm}
                    onChange={setSearchTerm}
                    currentType={searchType}
                    onTypeChange={setSearchType}
                    types={[{ value: "Name", label: "Name", description: "Search by applicant name" }]}
                    placeholder="Search leave requests..."
                    className="flex-1"
                />
                <FilterSelect
                    label="Status"
                    value={filterStatus}
                    onChange={setFilterStatus}
                    options={[
                        { value: "ALL", label: "All Status" },
                        { value: "Pending", label: "Pending" },
                        { value: "Approved", label: "Approved" },
                        { value: "Rejected", label: "Rejected" }
                    ]}
                />
            </div>

            <div className="bg-white rounded-lg border border-slate-200">
                <DataTable
                    data={leaves || []}
                    columns={leaveColumns}
                    isLoading={isLoadingLeaves}
                    pagination={false}
                    showSerialNumber={true}
                    emptyState={<div className="p-8 text-center text-gray-500">No leave requests found matching filters.</div>}
                />
            </div>

            {/* Confirmation Modal */}
            <Modal
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ isOpen: false, itemId: null, action: null })}
                title={confirmDialog.action === 'Approved' ? 'Confirm Approval' : 'Confirm Rejection'}
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                        {confirmDialog.action === 'Approved'
                            ? 'Are you sure you want to approve this request?'
                            : 'Are you sure you want to reject this request?'}
                    </p>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            {confirmDialog.action === 'Approved' ? 'Notes (Optional)' : 'Reason for Rejection *'}
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={confirmDialog.action === 'Approved'
                                ? 'Add any notes or comments...'
                                : 'Please provide a reason for rejection...'}
                            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                            required={confirmDialog.action === 'Rejected'}
                        />
                        {confirmDialog.action === 'Rejected' && !reason.trim() && (
                            <p className="text-xs text-red-600 mt-1">Reason is required for rejection</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={() => setConfirmDialog({ isOpen: false, itemId: null, action: null })}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmAction}
                            disabled={
                                leaveMutation.isPending ||
                                (confirmDialog.action === 'Rejected' && !reason.trim())
                            }
                            className={`px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 ${confirmDialog.action === 'Approved'
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-red-600 hover:bg-red-700'
                                }`}
                        >
                            {leaveMutation.isPending
                                ? 'Processing...'
                                : `Confirm ${confirmDialog.action === 'Approved' ? 'Approval' : 'Rejection'}`}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
