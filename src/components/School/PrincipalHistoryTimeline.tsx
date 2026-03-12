import { type PrincipalHistory } from "../../types/principal";
import { User, Calendar } from "lucide-react";
import { cn } from "../../lib/utils";

interface PrincipalHistoryTimelineProps {
    history: PrincipalHistory[];
}

export function PrincipalHistoryTimeline({ history }: PrincipalHistoryTimelineProps) {
    if (!history || history.length === 0) {
        return (
            <div className="text-center py-6 text-slate-400 bg-slate-50 rounded-lg border border-dashed">
                <p className="text-sm">No history available.</p>
            </div>
        );
    }

    return (
        <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 py-2">
            {history.map((record) => {
                const isCurrent = record.status === "ACTIVE";
                return (
                    <div key={record.id} className="relative pl-6">
                        {/* Dot */}
                        <div className={cn(
                            "absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2",
                            isCurrent ? "bg-blue-600 border-blue-100 ring-4 ring-blue-50" : "bg-slate-300 border-white"
                        )} />

                        <div className={cn(
                            "rounded-lg border p-3 transition-colors",
                            isCurrent ? "bg-white border-blue-200 shadow-sm" : "bg-slate-50 border-slate-200"
                        )}>
                            <div className="flex justify-between items-start mb-1">
                                <div>
                                    <h4 className={cn("font-semibold text-sm", isCurrent ? "text-slate-900" : "text-slate-600")}>
                                        {record.principalName}
                                    </h4>
                                    <span className={cn(
                                        "text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold",
                                        isCurrent ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-500"
                                    )}>
                                        {record.status}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                        <Calendar className="w-3 h-3" />
                                        <span>
                                            {new Date(record.startDate).toLocaleDateString()}
                                            {record.endDate ? ` - ${new Date(record.endDate).toLocaleDateString()}` : " - Present"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Retirement Justification Display relative to next item logic or self */}
                            {record.justification && (
                                <div className="mt-2 text-xs bg-red-50 text-red-700 p-2 rounded border border-red-100">
                                    <span className="font-semibold">Retirement Reason:</span> {record.justification}
                                </div>
                            )}

                            <div className="mt-2 text-[10px] text-slate-400 flex gap-2">
                                <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" /> Assigned by: {record.assignedBy}
                                </span>
                                {record.retiredBy && (
                                    <span>• Retired by: {record.retiredBy}</span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
