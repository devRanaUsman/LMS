import { Outlet, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Building, User, Bell, Shield } from "lucide-react";
import { PageHeader } from "../ui/PageHeader";

export default function SettingsLayout() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Settings"
                description="Manage institution preferences and configurations."
            />

            <div className="flex flex-col md:flex-row gap-6 items-start">
                <aside className="w-full md:w-64 bg-white rounded-xl border border-slate-200 overflow-hidden flex-shrink-0">
                    <div className="p-4 bg-slate-50 border-b border-slate-200">
                        <h3 className="font-semibold text-slate-800">Preferences</h3>
                    </div>
                    <nav className="p-2 space-y-1">
                        <NavLink
                            to="/settings/institute"
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <Building className="w-4 h-4" />
                            Institute Settings
                        </NavLink>
                        {/* Placeholders for future expansion */}
                        <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 cursor-not-allowed">
                            <User className="w-4 h-4" />
                            Profile (Coming Soon)
                        </div>
                        <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 cursor-not-allowed">
                            <Bell className="w-4 h-4" />
                            Notifications (Coming Soon)
                        </div>
                        <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 cursor-not-allowed">
                            <Shield className="w-4 h-4" />
                            Security (Coming Soon)
                        </div>
                    </nav>
                </aside>

                <main className="flex-1 w-full bg-white rounded-xl border border-slate-200 min-h-[500px] p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
