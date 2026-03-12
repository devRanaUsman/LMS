
import { AuditLogViewer } from "@/components/Dashboard/AuditLogViewer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export default function AuditLogsView() {
    return (
        <div className="space-y-6">
            <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Audit Logs' }]} />
            <h1 className="text-2xl font-bold text-slate-900">Audit Logs & Activity</h1>
            <AuditLogViewer />
        </div>
    );
}
