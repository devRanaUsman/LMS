import { useQuery } from "@tanstack/react-query";
import DataTable, { type ColumnDef } from "@/components/ui/DataTable";
import { dashboardService, type CreditStat } from "@/services/dashboardService";

export function CreditHourTracker() {
    const { data: creditStats, isLoading } = useQuery({
        queryKey: ["creditStats"],
        queryFn: dashboardService.getCreditStats,
    });

    const columns: ColumnDef<CreditStat>[] = [
        { header: "Course / Department", accessorKey: "courseName" },
        {
            header: "Planned Hours",
            accessorKey: "plannedHours",
            cell: (row) => <span className="font-medium">{row.plannedHours}</span>
        },
        {
            header: "Delivered Hours",
            accessorKey: "deliveredHours",
            cell: (row) => <span className="text-blue-600 font-medium">{row.deliveredHours}</span>
        },
        {
            header: "Remaining",
            cell: (row) => Math.max(0, row.plannedHours - row.deliveredHours)
        },
        {
            header: "Coverage",
            cell: (row) => {
                const percentage = Math.round((row.deliveredHours / row.plannedHours) * 100) || 0;
                let colorClass = "bg-green-100 text-green-700";
                if (percentage < 50) colorClass = "bg-red-100 text-red-700";
                else if (percentage < 80) colorClass = "bg-yellow-100 text-yellow-700";

                return (
                    <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${percentage < 50 ? 'bg-red-500' : percentage < 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                style={{ width: `${Math.min(100, percentage)}%` }}
                            />
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
                            {percentage}%
                        </span>
                    </div>
                );
            }
        }
    ];

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-lg border border-slate-200">
                <DataTable
                    data={creditStats || []}
                    columns={columns}
                    isLoading={isLoading}
                    pagination={false}
                    showSerialNumber={true}
                    emptyState={<div className="p-8 text-center text-gray-500">No credit hours data available.</div>}
                />
            </div>
        </div>
    );
}
