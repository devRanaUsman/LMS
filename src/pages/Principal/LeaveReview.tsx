
import { LeaveVerificationCenter } from "@/components/Dashboard/LeaveVerificationCenter";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export default function LeaveReview() {
    return (
        <div className="space-y-6">
            <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Leaves & Approvals' }]} />
            <h1 className="text-2xl font-bold text-slate-900">Leave & Approval Center</h1>
            <LeaveVerificationCenter />
        </div>
    );
}
