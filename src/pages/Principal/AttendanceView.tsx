
import { AttendanceHub } from "@/components/Dashboard/AttendanceHub";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export default function AttendanceView() {
    return (
        <div className="space-y-6">
            <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Attendance' }]} />
            <h1 className="text-2xl font-bold text-slate-900">Attendance Monitoring</h1>
            <AttendanceHub />
        </div>
    );
}
