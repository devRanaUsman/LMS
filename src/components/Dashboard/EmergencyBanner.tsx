import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboardService";
import { AlertTriangle } from "lucide-react";

export function EmergencyBanner() {
    const { data: schoolStatus } = useQuery({
        queryKey: ["schoolStatus"],
        queryFn: dashboardService.getSchoolStatus,
    });

    if (schoolStatus?.status !== 'Closed') return null;

    return (
        <div className="bg-red-600 text-white px-6 py-3 flex items-center justify-center gap-3 shadow-md animate-in slide-in-from-top duration-300">
            <AlertTriangle className="w-5 h-5 stroke-current" />
            <span className="font-bold">URGENT: SCHOOL IS CURRENTLY CLOSED</span>
            <span className="text-red-100 text-sm border-l border-red-500 pl-3">
                Reason: {schoolStatus.reason}
            </span>
        </div>
    );
}
