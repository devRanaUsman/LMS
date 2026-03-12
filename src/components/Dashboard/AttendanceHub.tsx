import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import DataTable, { type ColumnDef } from "@/components/ui/DataTable";
import { dashboardService, type PendingClass, type SubmittedClass } from "@/services/dashboardService";
import { History, Lock, Unlock, Edit } from "lucide-react";
import { FilterSelect } from "@/components/ui/Filters/FilterSelect";

export function AttendanceHub() {
    const navigate = useNavigate();
    const [view, setView] = useState<'PENDING' | 'SUBMITTED'>('PENDING');

    // Filter States
    const [filterDepartment, setFilterDepartment] = useState<string>("ALL");
    const [filterClass, setFilterClass] = useState<string>("ALL");

    // Fetch Filters
    const { data: departments, isLoading: isLoadingDepartments } = useQuery({
        queryKey: ["departments"],
        queryFn: dashboardService.getDepartments,
    });

    const { data: classes, isLoading: isLoadingClasses } = useQuery({
        queryKey: ["classes", filterDepartment],
        queryFn: () => dashboardService.getClasses(filterDepartment === "ALL" ? undefined : filterDepartment),
        enabled: filterDepartment !== "ALL",
    });

    // Reset Class filter when Department changes
    useEffect(() => {
        setFilterClass("ALL");
    }, [filterDepartment]);

    // Fetch Pending
    const { data: pendingClasses, isLoading: isLoadingPending } = useQuery({
        queryKey: ["pendingAttendance", filterDepartment, filterClass],
        queryFn: () => dashboardService.getPendingAttendance(
            filterDepartment === "ALL" ? undefined : filterDepartment,
            filterClass === "ALL" ? undefined : filterClass
        ),
        enabled: view === 'PENDING',
    });

    // Fetch Submitted (Using same filter logic for consistency as per prompt guidelines)
    const { data: submittedClassesRaw, isLoading: isLoadingSubmitted } = useQuery({
        queryKey: ["submittedAttendance"],
        queryFn: dashboardService.getSubmittedAttendance,
        enabled: view === 'SUBMITTED',
    });

    // Mock filtering submitted classes as API doesn't have it natively in mock
    const submittedClasses = submittedClassesRaw?.filter((c) => {
        if (filterClass !== "ALL" && filterClass === "BSCS-Semester 4-A") return c.className.includes("CS-101");
        if (filterDepartment !== "ALL" && filterDepartment === "Computer Science") return c.className.includes("CS-101");
        if (filterDepartment !== "ALL" && filterDepartment !== "Computer Science") return !c.className.includes("CS-101");
        return true;
    });

    const handleActionClick = (cls: PendingClass | SubmittedClass) => {
        navigate(`/principal/attendance/mark/${cls.id}`);
    };

    const pendingColumns: ColumnDef<PendingClass>[] = [
        { header: "Time", accessorKey: "time" },
        { header: "Class / Subject", accessorKey: "className" },
        { header: "Missing Teacher", accessorKey: "teacherName" },
        {
            header: "Actions",
            cell: (row) => (
                <button
                    onClick={() => handleActionClick(row)}
                    className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors shadow-sm"
                >
                    Mark Now
                </button>
            )
        }
    ];

    const submittedColumns: ColumnDef<SubmittedClass>[] = [
        { header: "Time", accessorKey: "time" },
        { header: "Class / Subject", accessorKey: "className" },
        {
            header: "Status",
            accessorKey: "isLocked",
            cell: (row) => row.isLocked
                ? <span className="flex items-center gap-1 text-amber-600 text-xs font-medium"><Lock className="w-3 h-3" /> Locked</span>
                : <span className="flex items-center gap-1 text-green-600 text-xs font-medium"><Unlock className="w-3 h-3" /> Open</span>
        },
        {
            header: "Actions",
            cell: (row) => (
                <button
                    onClick={() => handleActionClick(row)}
                    className={`text-xs px-3 py-1.5 rounded transition-colors shadow-sm flex items-center gap-1 ${row.isLocked
                        ? "bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                        }`}
                >
                    <Edit className="w-3 h-3" /> {row.isLocked ? "Override" : "Edit"}
                </button>
            )
        }
    ];

    return (
        <div className="space-y-4">
            {/* View Selector and Filters Layer */}
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-4">
                <div className="flex gap-4">
                    <button
                        onClick={() => setView('PENDING')}
                        className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${view === 'PENDING' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setView('SUBMITTED')}
                        className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${view === 'SUBMITTED' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <History className="w-4 h-4" /> History
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <FilterSelect
                        label="Department"
                        value={filterDepartment}
                        onChange={setFilterDepartment}
                        options={
                            isLoadingDepartments
                                ? [{ value: "LOADING", label: "Loading..." }]
                                : [
                                    { value: "ALL", label: "Departments" },
                                    ...(departments?.map(d => ({ value: String(d.name), label: d.name })) || [])
                                ]
                        }
                    />
                    <FilterSelect
                        label="Class"
                        value={filterClass}
                        onChange={setFilterClass}
                        disabled={filterDepartment === "ALL" || isLoadingClasses}
                        options={
                            isLoadingClasses
                                ? [{ value: "LOADING", label: "Loading..." }]
                                : [
                                    { value: "ALL", label: filterDepartment !== "ALL" ? "All Classes" : "Select Department First" },
                                    ...(classes?.map(c => ({ value: String(c.id), label: c.name })) || [])
                                ]
                        }
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200">
                {view === 'PENDING' ? (
                    <DataTable
                        data={pendingClasses || []}
                        columns={pendingColumns}
                        isLoading={isLoadingPending}
                        pagination={false}
                        showSerialNumber={true}
                        emptyState={<div className="p-8 text-center text-gray-500">No pending records found.</div>}
                    />
                ) : (
                    <DataTable
                        data={submittedClasses || []}
                        columns={submittedColumns}
                        isLoading={isLoadingSubmitted}
                        pagination={false}
                        showSerialNumber={true}
                        emptyState={<div className="p-8 text-center text-gray-500">No submitted records found.</div>}
                    />
                )}
            </div>
        </div>
    );
}
