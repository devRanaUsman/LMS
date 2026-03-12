import { StatsWidget } from "@/components/Dashboard/StatsWidget";
import { Users, School, GraduationCap, DollarSign } from "lucide-react";

export default function Home() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h2>
                <p className="text-muted-foreground">Overview of the system.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsWidget
                    title="Total Schools"
                    value="124"
                    icon={School}
                    trend="+12%"
                    trendUp={true}
                    description="from last month"
                />
                <StatsWidget
                    title="Total Students"
                    value="45,231"
                    icon={Users}
                    trend="+2.5%"
                    trendUp={true}
                    description="active enrollments"
                />
                <StatsWidget
                    title="Graduations"
                    value="3,400"
                    icon={GraduationCap}
                    trend="+5%"
                    trendUp={true}
                    description="this year"
                />
                <StatsWidget
                    title="Revenue"
                    value="$1.2M"
                    icon={DollarSign}
                    trend="+18%"
                    trendUp={true}
                    description="total collected"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-semibold text-slate-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 text-sm">
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                <span className="text-slate-600">New school registered: <strong>Green Valley High</strong></span>
                                <span className="text-slate-400 ml-auto">2h ago</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-semibold text-slate-900 mb-4">System Status</h3>
                    <div className="flex items-center gap-2 text-green-600 font-medium">
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                        All Systems Operational
                    </div>
                    <p className="text-sm text-slate-500 mt-2">
                        Last check: Just now
                    </p>
                </div>
            </div>
        </div>
    );
}
