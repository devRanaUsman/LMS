import { RegistrationVerificationCenter } from "@/components/Dashboard/RegistrationVerificationCenter";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export default function PendingRegistrations() {
    return (
        <div className="space-y-6">
            <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Pending Registrations' }]} />
            <h1 className="text-2xl font-bold text-slate-900">Registration Approvals</h1>
            <RegistrationVerificationCenter />
        </div>
    );
}
