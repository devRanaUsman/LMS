
import { useNavigate } from "react-router-dom";
import { StatsWidget } from "@/components/Dashboard/StatsWidget";
import { Users, AlertTriangle, CalendarClock, UserCheck, CheckCircle, Building } from "lucide-react";
import { useRoleAccess } from "@/hooks/usePermissions";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboardService";
import { EmergencyControl } from "@/components/Dashboard/EmergencyControl";
import { EmergencyBanner } from "@/components/Dashboard/EmergencyBanner";
import { AttendanceRequestManager } from "@/components/Attendance/AttendanceRequestManager";
import { NotificationIcon } from "@/components/Notifications/NotificationIcon";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export default function PrincipalDashboard() {
    const { user, isScoped, scopeLabel } = useRoleAccess();
    const navigate = useNavigate();

    const { data: stats, isLoading } = useQuery({
        queryKey: ["principalStats", user.role, user.departmentId],
        queryFn: dashboardService.getPrincipalStats,
        refetchInterval: 30000, // Poll every 30s
    });



    // Dynamic title and description based on role
    const dashboardTitle = user.role === 'HOD' ? 'HOD Dashboard' : 'Principal Dashboard';

    return (
        <div className="space-y-8">
            {/* Emergency Banner - Principal Only */}
            {['PRINCIPAL', 'UNIVERSITY_PRINCIPAL', 'COLLEGE_PRINCIPAL', 'SCHOOL_PRINCIPAL'].includes(user.role) && <EmergencyBanner />}

            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">{dashboardTitle}</h2>
                        {isScoped && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                                <Building className="w-3.5 h-3.5" />
                                {scopeLabel}
                            </span>
                        )}
                    </div>
                </div>

                {/* Principal-Only Controls */}
                {['PRINCIPAL', 'UNIVERSITY_PRINCIPAL', 'COLLEGE_PRINCIPAL', 'SCHOOL_PRINCIPAL'].includes(user.role) && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
                        {/* Emergency Control: Open/Close School */}
                        <div className="w-full sm:w-auto">
                            <EmergencyControl />
                        </div>

                        {/* Notifications */}
                        <div className="ml-2">
                            <NotificationIcon />
                        </div>

                        {/* Broadcast Button and View Selector Removed as per request */}
                    </div>
                )}
            </div>

            {/* 1. KPIs */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900"></h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatsWidget
                        title="Student Presence"
                        value={isLoading ? "..." : `${stats?.studentPresence.present || 0}/${stats?.studentPresence.total || 0}`}
                        icon={Users}
                        trend={isLoading ? "" : `${stats ? Math.round((stats.studentPresence.present / stats.studentPresence.total) * 100) : 0}%`}
                        trendUp={true}
                        description="Present Today"
                    />
                    <StatsWidget
                        title="Teacher Attendance"
                        value={isLoading ? "..." : `${stats?.teacherAttendance.checkedIn || 0}/${stats?.teacherAttendance.total || 0}`}
                        icon={UserCheck}
                        trend={isLoading ? "" : `${stats ? Math.round((stats.teacherAttendance.checkedIn / stats.teacherAttendance.total) * 100) : 0}%`}
                        trendUp={true} // Generally high attendance is good
                        description="Checked-In Today"
                    />
                    <StatsWidget
                        title="Pending Actions"
                        value={isLoading ? "..." : `${(stats?.pendingActions.leaves || 0) + (stats?.pendingActions.registrations || 0)}`}
                        icon={CalendarClock}
                        trend={isLoading ? "" : `${stats?.pendingActions.leaves || 0} Leaves`}
                        trendUp={false} // Pending actions usually mean work to do
                        description="Total Pending Tasks"
                    />
                    {/* Logic for Schedule Health Icon */}
                    {(() => {
                        const covered = stats?.scheduleHealth.coveredSessions || 0;
                        const planned = stats?.scheduleHealth.plannedSessions || 0;
                        const ratio = planned > 0 ? (covered / planned) * 100 : 0;
                        const isCritical = ratio < 70;

                        return (
                            <StatsWidget
                                title="Schedule Health"
                                value={isLoading ? "..." : `${covered}/${planned}`}
                                icon={isCritical ? AlertTriangle : CheckCircle}
                                trend={isLoading ? "" : `${Math.round(ratio)}%`}
                                trendUp={!isCritical}
                                description="Sessions Covered"
                            />
                        );
                    })()}
                </div>
            </section>

            {/* Attendance Requests Section - New */}
            {['PRINCIPAL', 'UNIVERSITY_PRINCIPAL', 'COLLEGE_PRINCIPAL', 'SCHOOL_PRINCIPAL'].includes(user.role) && (
                <section className="space-y-4">
                    <AttendanceRequestManager />
                </section>
            )}

            {/* 2. Principal Navigation Grid */}
            {['PRINCIPAL', 'UNIVERSITY_PRINCIPAL', 'COLLEGE_PRINCIPAL', 'SCHOOL_PRINCIPAL'].includes(user.role) && (
                <section className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">Dashboard Modules</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Structure Management */}
                        {/* <Card
                            onClick={() => navigate('/principal/structure')}
                            className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-slate-200"
                        >
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
                                    {institutionType === "SCHOOL" ? "Grade & Sections" : "Departments"}
                                </CardTitle>
                                <Building className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-500">Manage organizational structure, HODs, and class assignments.</p>
                            </CardContent>
                        </Card> */}

                        {/* Staffing */}
                        <Card
                            onClick={() => navigate('/principal/staffing')}
                            className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-slate-200"
                        >
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-medium text-slate-700 group-hover:text-blue-600 transition-colors">Staffing</CardTitle>
                                <Users className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-500">Overview of staff allocation, vacancies, and hiring.</p>
                            </CardContent>
                        </Card>

                        {/* Academic Matrix */}
                        <Card
                            onClick={() => navigate('/principal/academic')}
                            className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-slate-200"
                        >
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-medium text-slate-700 group-hover:text-blue-600 transition-colors">Academic Matrix</CardTitle>
                                <CalendarClock className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-500">View master schedule, credit hours, and timetable distribution.</p>
                            </CardContent>
                        </Card>

                        {/* Attendance Hub */}
                        <Card
                            onClick={() => navigate('/principal/attendance')}
                            className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-slate-200"
                        >
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-medium text-slate-700 group-hover:text-blue-600 transition-colors">Attendance Hub</CardTitle>
                                <UserCheck className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-500">Monitor student and teacher attendance records and trends.</p>
                            </CardContent>
                        </Card>

                        {/* Leaves & Approvals */}
                        <Card
                            onClick={() => navigate('/principal/leaves')}
                            className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-slate-200"
                        >
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-medium text-slate-700 group-hover:text-blue-600 transition-colors">Leaves & Approvals</CardTitle>
                                <CheckCircle className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-500">Review and approve leave requests and other verifications.</p>
                            </CardContent>
                        </Card>

                        {/* Sub-Roles */}
                        <Card
                            onClick={() => navigate('/principal/sub-roles')}
                            className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-slate-200"
                        >
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-medium text-slate-700 group-hover:text-blue-600 transition-colors">Sub-Roles</CardTitle>
                                <Users className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-500">Manage delegated authorities and granular permissions.</p>
                            </CardContent>
                        </Card>

                        {/* Audit Logs */}
                        <Card
                            onClick={() => navigate('/principal/audit')}
                            className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-slate-200"
                        >
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-medium text-slate-700 group-hover:text-blue-600 transition-colors">Audit Logs</CardTitle>
                                <AlertTriangle className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-500">Track system activities and important changes.</p>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            )}

            {/* 3. HOD Navigation Grid */}
            {user.role === 'HOD' && (
                <section className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">Department Modules</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Department Staffing */}
                        <Card
                            onClick={() => navigate('/teachers')}
                            className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-slate-200"
                        >
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-medium text-slate-700 group-hover:text-blue-600 transition-colors">Department Faculty</CardTitle>
                                <Users className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-500">Manage teachers and faculty within your department.</p>
                            </CardContent>
                        </Card>

                        {/* Department Classes */}
                        {/* <Card
                            onClick={() => navigate('/classes')}
                            className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-slate-200"
                        >
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-medium text-slate-700 group-hover:text-blue-600 transition-colors">Department Classes</CardTitle>
                                <Building className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-500">View and manage classes assigned to your department.</p>
                            </CardContent>
                        </Card> */}

                        {/* Academic Schedule */}
                        <Card
                            onClick={() => navigate('/hod/schedule')}
                            className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-slate-200"
                        >
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-medium text-slate-700 group-hover:text-blue-600 transition-colors">Academic Schedule</CardTitle>
                                <CalendarClock className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-500">Manage subjects, teacher assignments and timetable.</p>
                            </CardContent>
                        </Card>

                        {/* Students */}
                        <Card
                            onClick={() => navigate('/students')}
                            className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-slate-200"
                        >
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-medium text-slate-700 group-hover:text-blue-600 transition-colors">Students</CardTitle>
                                <Users className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-500">View your department's students and their data.</p>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            )}
        </div>
    );
}
