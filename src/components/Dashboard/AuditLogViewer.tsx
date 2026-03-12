import { useQuery } from "@tanstack/react-query";
import DataTable, { type ColumnDef } from "@/components/ui/DataTable";
import { dashboardService, type AuditLog } from "@/services/dashboardService";
import { ShieldCheck } from "lucide-react";

export function AuditLogViewer() {
    const { data: logs, isLoading } = useQuery({
        queryKey: ["auditLogs"],
        queryFn: dashboardService.getAuditLogs,
    });

    const columns: ColumnDef<AuditLog>[] = [
        {
            header: "Timestamp",
            accessorKey: "timestamp",
            cell: (row) => <span className="text-xs text-gray-500">{new Date(row.timestamp).toLocaleString()}</span>
        },
        { header: "Action", accessorKey: "action" },
        { header: "Description", accessorKey: "description" },
        {
            header: "Reason",
            accessorKey: "reason",
            cell: (row) => <span className="italic text-gray-600">"{row.reason}"</span>
        },
        {
            header: "Signed By (ID)",
            accessorKey: "principalId",
            cell: (row) => <span className="font-mono text-xs">Principal #{row.principalId}</span>
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-slate-500" />
                <h3 className="text-lg font-semibold text-slate-900">Security Audit Logs</h3>
            </div>
            <div className="bg-white rounded-lg border border-slate-200">
                <DataTable
                    data={logs || []}
                    columns={columns}
                    isLoading={isLoading}
                    pagination={true} // Pagination might be good here
                    showSerialNumber={true}
                    emptyState={<div className="p-8 text-center text-gray-500">No audit records found.</div>}
                />
            </div>
        </div>
    );
}
