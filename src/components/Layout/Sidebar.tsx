import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard, LogOut, School, Inbox, Users,
    BookOpen, Shield, UserCheck, Settings, UserPlus,
    ChevronLeft, ChevronRight, ChevronDown, ClipboardList, Calendar, CalendarClock
} from "lucide-react";
import { useCan } from "@/RBAC/canMethod";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePermissions } from "@/hooks/usePermissions";

export function Sidebar() {
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [isPrincipalOpen, setIsPrincipalOpen] = useState(true);
    const isActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };
    const { user, canAccess } = usePermissions();

    const canViewSchools = useCan("school.view");

    // Safety check: Ensure user object exists
    let localUser;
    try {
        localUser = JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
        localUser = {};
    }
    localUser = localUser || {};

    const handleRoleChange = (newRole: string) => {
        const updatedUser = { ...localUser, role: newRole };

        // For demo: if switching to HOD, add a department ID
        if (newRole === "HOD") {
            updatedUser.departmentId = "dept_cs";  // Demo: Computer Science dept
        } else {
            delete updatedUser.departmentId;
        }

        // For demo: if switching to TEACHER, add a teacher ID
        if (newRole === "TEACHER") {
            updatedUser.teacherId = "t_2"; // Demo: Prof. Maria Khan (matches seed data)
            updatedUser.name = "Prof. Maria Khan";
        } else {
            delete updatedUser.teacherId;
            if (newRole !== "HOD") updatedUser.name = "Admin User"; // Reset name if not specialized
        }

        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.location.reload();
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        window.location.href = "/signin";
    };

    return (
        <TooltipProvider delayDuration={300}>
            <motion.div

                animate={{ width: collapsed ? 80 : 260 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="h-screen  bg-[#0f1016] text-white flex flex-col shadow-xl overflow-hidden relative border-r border-slate-800/50"
            >
                {/* Toggle Button */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="absolute -right-3 top-7 z-50 bg-[#0f1016] text-white p-1.5 rounded-full shadow-lg border border-slate-700 hover:bg-slate-800 transition-transform hover:scale-110 hidden md:block"
                        >
                            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>{collapsed ? "Expand sidebar" : "Collapse sidebar"}</p>
                    </TooltipContent>
                </Tooltip>

                {/* Header - Fixed height container */}
                <div className={cn("h-20 p-8 flex items-center transition-all duration-300 px-6", collapsed ? "justify-start" : "justify-start")}>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M12 3L2 8l10 5 10-5-10-5z" fill="white" opacity="0.95" />
                                <path d="M6 10.5v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                                <path d="M20 8v5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                        </div>
                        <AnimatePresence mode="wait">
                            {!collapsed && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: "auto" }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 text-transparent bg-clip-text whitespace-nowrap overflow-hidden"
                                >
                                    EduFlow
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* User Profile Mini */}
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mx-6 mb-4 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold ring-2 ring-slate-600">
                                {localUser.name?.[0] || "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-slate-200 truncate">{localUser.name || "Guest"}</p>
                                <p className="text-[10px] text-slate-400 truncate">{localUser.role || "N/A"}</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Navigation */}
                <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-700/50 [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-slate-600/50">
                    {/* Dashboard - Role-specific routes */}
                    {/* Principal Dashboard Collapsible */}
                    {['PRINCIPAL', 'UNIVERSITY_PRINCIPAL', 'COLLEGE_PRINCIPAL', 'SCHOOL_PRINCIPAL'].includes(user.role) ? (
                        (() => {
                            // Get principal's assigned school ID
                            const principalSchoolId = localUser.schoolId || "SCH001"; // Default to demo school
                            const schoolDetailPath = `/principal/schools/${principalSchoolId}`;

                            return (
                                <>
                                    {!collapsed && (
                                        <div
                                            className={cn(
                                                "flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 group text-slate-400 hover:bg-slate-800/50",
                                                isActive(schoolDetailPath) ? "text-white bg-slate-800/50" : "hover:text-white"
                                            )}
                                        >
                                            <Link
                                                to={schoolDetailPath}
                                                className="flex items-center gap-3 flex-1 cursor-pointer py-1"
                                            >
                                                <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                                                <span className="font-medium text-sm">Dashboard</span>
                                            </Link>
                                            <div
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setIsPrincipalOpen(!isPrincipalOpen);
                                                }}
                                                className="cursor-pointer p-1.5 hover:bg-slate-700/50 rounded-md flex-shrink-0 text-slate-400 hover:text-white transition-colors"
                                            >
                                                <ChevronDown
                                                    className={cn(
                                                        "w-4 h-4 transition-transform duration-200",
                                                        isPrincipalOpen ? "rotate-180" : ""
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <AnimatePresence>
                                        {!collapsed && isPrincipalOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden pl-4 space-y-1"
                                            >
                                                <NavItem to="/" icon={LayoutDashboard} label="Overview" active={isActive("/")} collapsed={collapsed} compact />
                                                <NavItem to="/principal/staffing" icon={Users} label="Staffing" active={isActive("/principal/staffing")} collapsed={collapsed} compact />
                                                <NavItem to="/principal/academic" icon={Calendar} label="Academic Matrix" active={isActive("/principal/academic")} collapsed={collapsed} compact />
                                                <NavItem to="/principal/attendance" icon={ClipboardList} label="Attendance" active={isActive("/principal/attendance")} collapsed={collapsed} compact />
                                                <NavItem to="/principal/leaves" icon={UserCheck} label="Leaves" active={isActive("/principal/leaves")} collapsed={collapsed} compact />
                                                <NavItem to="/principal/registrations" icon={UserPlus} label="Registrations" active={isActive("/principal/registrations")} collapsed={collapsed} compact />
                                                <NavItem to="/principal/audit" icon={Shield} label="Audit Logs" active={isActive("/principal/audit")} collapsed={collapsed} compact />
                                                <NavItem to="/principal/sub-roles" icon={Settings} label="Sub-Roles" active={isActive("/principal/sub-roles")} collapsed={collapsed} compact />
                                                <NavItem to="/principal/teacher-schedule" icon={Calendar} label="Teacher Schedule" active={isActive("/principal/teacher-schedule")} collapsed={collapsed} compact />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Show icon only when collapsed for quick access to school detail */}
                                    {collapsed && (
                                        <NavItem
                                            to={schoolDetailPath}
                                            icon={LayoutDashboard}
                                            label="Dashboard"
                                            active={isActive(schoolDetailPath)}
                                            collapsed={collapsed}
                                        />
                                    )}
                                </>
                            );
                        })()
                    )
                        :
                        (
                            /* Default Dashboard Link for others */
                            user.role !== "TEACHER" && (
                                <NavItem
                                    to="/"
                                    icon={LayoutDashboard}
                                    label="Dashboard"
                                    active={isActive("/")}
                                    collapsed={collapsed}
                                />
                            )
                        )
                    }

                    {user.role === "TEACHER" && (
                        <>
                            <NavItem
                                to="/"
                                icon={LayoutDashboard}
                                label="Dashboard"
                                active={isActive("/")}
                                collapsed={collapsed}
                            />
                            <NavItem
                                to="/teacher/lectures"
                                icon={BookOpen}
                                label="Lectures"
                                active={isActive("/teacher/lectures")}
                                collapsed={collapsed}
                            />
                        </>
                    )}

                    {/* HOD Specific: Academic Schedule */}
                    {user.role === "HOD" && (
                        <>
                            <NavItem
                                to="/hod/schedule"
                                icon={CalendarClock}
                                label="Academic Schedule"
                                active={isActive("/hod/schedule")}
                                collapsed={collapsed}
                            />
                            <NavItem
                                to="/hod/teacher-schedule"
                                icon={Users}
                                label="Teacher Schedule"
                                active={isActive("/hod/teacher-schedule")}
                                collapsed={collapsed}
                            />
                        </>
                    )}

                    {/* Schools - Only for MAIN_AUTHORITY */}
                    {canViewSchools && (
                        <NavItem to="/schools" icon={School} label="Schools" active={isActive("/schools")} collapsed={collapsed} />
                    )}

                    {/* People Section */}
                    {(canAccess('students.view') || canAccess('teachers.view')) && (
                        <>
                            {!collapsed && (
                                <div className="pt-4 pb-2 px-3">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">People</p>
                                </div>
                            )}

                            {canAccess('teachers.view') && (
                                <NavItem
                                    to="/teachers"
                                    icon={UserCheck}
                                    label={user.role === 'HOD' ? "Dept Teachers" : "Teachers"}
                                    active={isActive("/teachers")}
                                    collapsed={collapsed}
                                />
                            )}
                            {/* Students - Only for PRINCIPAL and HOD */}
                            {(['PRINCIPAL', 'UNIVERSITY_PRINCIPAL', 'COLLEGE_PRINCIPAL', 'SCHOOL_PRINCIPAL'].includes(user.role) || user.role === 'HOD') && (
                                <NavItem
                                    to="/students"
                                    icon={Users}
                                    label="Students"
                                    active={isActive("/students")}
                                    collapsed={collapsed}
                                />
                            )}
                        </>
                    )}

                    {/* Academics Section */}
                    {(canAccess('classes.view') || canAccess('timetable.view')) && (
                        <>
                            {!collapsed && (
                                <div className="pt-4 pb-2 px-3">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Academics</p>
                                </div>
                            )}

                            {canAccess('classes.view') && (
                                <NavItem
                                    to="/classes"
                                    icon={BookOpen}
                                    label={user.role === 'HOD' ? "Dept Classes" : "Classes"}
                                    active={isActive("/classes")}
                                    collapsed={collapsed}
                                />
                            )}

                            {canAccess('attendance.view') && !['HOD', 'PRINCIPAL', 'UNIVERSITY_PRINCIPAL', 'COLLEGE_PRINCIPAL', 'SCHOOL_PRINCIPAL'].includes(user.role) && (
                                <NavItem
                                    to="/attendance"
                                    icon={ClipboardList}
                                    label="Attendance"
                                    active={isActive("/attendance")}
                                    collapsed={collapsed}
                                />
                            )}
                        </>
                    )}

                    {/* Administration Section - Main Authority only */}
                    {user.role === "MAIN_AUTHORITY" && (
                        <>
                            {!collapsed && canAccess('departments.view') && (
                                <div className="pt-4 pb-2 px-3">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Administration</p>
                                </div>
                            )}

                            {/* {(user.role === "MAIN_AUTHORITY" || user.role === "PRINCIPAL") && canAccess('settings.view') && (
                                <NavItem to="/roles" icon={Shield} label="Roless" active={isActive("/roles")} collapsed={collapsed} />
                            )} */}
                        </>
                    )}

                    {/* Settings - Visible to Principal only */}
                    {['PRINCIPAL', 'UNIVERSITY_PRINCIPAL', 'COLLEGE_PRINCIPAL', 'SCHOOL_PRINCIPAL'].includes(user.role) && (
                        <>
                            {!collapsed && (
                                <div className="pt-4 pb-2 px-3">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System</p>
                                </div>
                            )}
                            <NavItem
                                to="/settings"
                                icon={Settings}
                                label="Settings"
                                active={isActive("/settings")}
                                collapsed={collapsed}
                            />
                        </>
                    )}

                    {/* Authority-specific items */}
                    {user.role === "MAIN_AUTHORITY" && (
                        <NavItem to="/authority/inbox" icon={Inbox} label="Retirement Inbox" active={isActive("/authority/inbox")} collapsed={collapsed} />
                    )}
                </nav>

                {/* Footer / Role / Theme */}
                <div className="p-3 mt-auto space-y-2">
                    {/* Role Switcher - Collapsed view shows nothing or icon */}
                    {!collapsed && (
                        <div className="p-1">
                            <Select
                                value={localUser.role || "GUEST"}
                                onValueChange={(value: string) => handleRoleChange(value)}
                            >
                                <SelectTrigger className="w-full bg-slate-800/50 border-slate-700/50 text-xs text-slate-300 h-9 rounded-lg hover:bg-slate-800 transition-colors">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-700 text-slate-300">
                                    <SelectItem value="MAIN_AUTHORITY">MAIN AUTHORITY</SelectItem>
                                    <SelectItem value="PRINCIPAL">PRINCIPAL</SelectItem>
                                    <SelectItem value="UNIVERSITY_PRINCIPAL">UNIVERSITY PRINCIPAL</SelectItem>
                                    <SelectItem value="COLLEGE_PRINCIPAL">COLLEGE PRINCIPAL</SelectItem>
                                    <SelectItem value="SCHOOL_PRINCIPAL">SCHOOL PRINCIPAL</SelectItem>
                                    <SelectItem value="HOD">HOD</SelectItem>
                                    <SelectItem value="TEACHER">TEACHER</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Logout Button */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={handleLogout}
                                className={cn(
                                    "flex items-center gap-3 w-full rounded-xl transition-all duration-200 group text-slate-400 hover:text-red-400 hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400",
                                    collapsed ? "justify-center p-3" : "px-3 py-3"
                                )}
                            >
                                <LogOut className="w-5 h-5" />
                                {!collapsed && <span className="font-medium text-sm">Sign Out</span>}
                            </button>
                        </TooltipTrigger>
                        {collapsed && (
                            <TooltipContent side="right">
                                <p>Sign Out</p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                </div>
            </motion.div>
        </TooltipProvider>
    );
}

// Reusable NavItem component with consistent hover/active styling and tooltip support
const NavItem = ({
    to,
    icon: Icon,
    label,
    active,
    collapsed,
    compact
}: {
    to: string;
    icon: any;
    label: string;
    active: boolean;
    collapsed: boolean;
    compact?: boolean;
}) => {
    const content = (
        <Link to={to} className="block">
            <div
                className={cn(
                    "relative flex items-center gap-3 rounded-xl transition-all duration-200 group cursor-pointer",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1016]",
                    collapsed ? "px-3.5 py-3 justify-start" : compact ? "px-3 py-2" : "px-3.5 py-3",
                    active
                        ? "text-white bg-blue-600 shadow-lg shadow-blue-500/20"
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                )}
            >
                <Icon
                    className={cn(
                        "flex-shrink-0 transition-colors",
                        active ? "text-white" : "text-slate-400 group-hover:text-white",
                        compact ? "w-4 h-4" : "w-5 h-5"
                    )}
                />

                <AnimatePresence mode="wait">
                    {!collapsed && (
                        <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className={cn(
                                "font-medium text-sm whitespace-nowrap overflow-hidden",
                                active ? "text-white font-semibold" : ""
                            )}
                        >
                            {label}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
        </Link >
    );

    // Wrap with tooltip when collapsed
    if (collapsed) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    {content}
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-slate-800 border-slate-700">
                    <p>{label}</p>
                </TooltipContent>
            </Tooltip>
        );
    }

    return content;
};
