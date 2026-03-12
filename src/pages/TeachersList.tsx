import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { localStorageRepository } from "../services/localStorageRepository";
import { type Teacher } from "../types/hierarchy";
import { useDebounce } from "../hooks/useDebounce";
import { Users, GraduationCap, Clock, BookOpen, UserPlus } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { DataTable, type ColumnDef } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
// import { AddTeacherModal } from "@/components/Teachers/AddTeacherModal"; // Removed
import { PageHeader } from "@/components/ui/PageHeader";
import { FilterSearch } from "@/components/ui/Filters/FilterSearch";
import { FilterSelect } from "@/components/ui/Filters/FilterSelect";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/ErrorState";
import { normalizeError } from "@/utils/errorUtils";

export default function TeachersList() {
    const { user } = usePermissions();
    const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchType, setSearchType] = useState<string>("Name");
    const [filterDepartment, setFilterDepartment] = useState<string>("ALL");
    const [filterType, setFilterType] = useState<"ALL" | "HOD" | "NORMAL">("ALL");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // const [isAddModalOpen, setIsAddModalOpen] = useState(false); // Removed

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const debouncedSearch = useDebounce(searchTerm, 300);

    // Institution type - could come from user context or app settings
    const institutionType = "UNIVERSITY" as "UNIVERSITY" | "SCHOOL" | "COLLEGE";

    // Permission check for creating teachers
    const canCreateTeacher = useMemo(() => {
        if (user.role === 'PRINCIPAL') return true;
        if (user.role === 'HOD' && institutionType === 'UNIVERSITY') return true;
        return false;
    }, [user.role, institutionType]);

    const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Simulate network delay to show loading state
            await new Promise(resolve => setTimeout(resolve, 300));
            setAllTeachers(localStorageRepository.teachers.getAll());
        } catch (err) {
            console.error("Failed to fetch teachers", err);
            setError(normalizeError(err, "We couldn't fetch teachers from the API. Please try again."));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Apply role-based scope filtering
    const scopedTeachers = useMemo(() => {
        if (user.role === 'HOD' && user.departmentId && institutionType === 'UNIVERSITY') {
            // HOD sees only their department teachers
            return allTeachers.filter(t => t.departmentId === user.departmentId);
        }
        // Principal sees all
        return allTeachers;
    }, [allTeachers, user.role, user.departmentId, institutionType]);

    // Filter logic
    const filteredTeachers = useMemo(() => {
        return scopedTeachers.filter(t => {
            // Search based on type
            let matchesSearch = true;
            if (debouncedSearch) {
                if (searchType === "Name") {
                    matchesSearch = t.name.toLowerCase().includes(debouncedSearch.toLowerCase());
                } else if (searchType === "Email") {
                    matchesSearch = t.email.toLowerCase().includes(debouncedSearch.toLowerCase());
                } else if (searchType === "Phone") {
                    matchesSearch = t.phone ? t.phone.toLowerCase().includes(debouncedSearch.toLowerCase()) : false;
                } else if (searchType === "Department") {
                    matchesSearch = t.departmentId.toLowerCase().includes(debouncedSearch.toLowerCase());
                }
            }

            // Department Filter
            const matchesDepartment = filterDepartment === "ALL" || t.departmentId === filterDepartment;

            // Type Filter
            const matchesType = filterType === "ALL" || t.type === filterType;

            return matchesSearch && matchesDepartment && matchesType;
        });
    }, [scopedTeachers, debouncedSearch, searchType, filterDepartment, filterType]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTeachers = filteredTeachers.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, filterDepartment, filterType, itemsPerPage]);

    // Get unique departments for filter
    const departments = useMemo(() => {
        const depts = new Set(scopedTeachers.map(t => t.departmentId));
        return Array.from(depts).sort();
    }, [scopedTeachers]);

    // DataTable columns definition
    const columns: ColumnDef<Teacher>[] = [
        {
            header: "Teacher",
            cell: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
                        {row.name.charAt(0)}
                    </div>
                    <div>
                        <div className="text-sm font-medium text-slate-900">{row.name}</div>
                        <div className="text-xs text-slate-500">{row.email}</div>
                    </div>
                </div>
            ),
        },
        // {
        //     header: "Department",
        //     accessorKey: "department",
        //     cell: (row) => (
        //         <span className="text-sm text-slate-700">{row.departmentId}</span>
        //     ),
        // },
        {
            header: "Role",
            cell: (row) => (
                <span
                    className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${row.type === "HOD"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-slate-100 text-slate-600"
                        }`}
                >
                    {row.type === "HOD" ? "Head of Dept." : "Faculty"}
                </span>
            ),
        },
        {
            header: "Specialization",
            accessorKey: "specialization",
            cell: (row) => (
                <span className="text-sm text-slate-700">{row.specialization}</span>
            ),
        },
        {
            header: "Punctuality",
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[80px]">
                        <div
                            className={`h-full rounded-full ${row.punctuality >= 90 ? "bg-emerald-500" : "bg-amber-500"
                                }`}
                            style={{ width: `${row.punctuality}%` }}
                        />
                    </div>
                    <span className="text-xs font-medium text-slate-700">{row.punctuality}%</span>
                </div>
            ),
            align: "center",
        },
        {
            header: "Actions",
            cell: (row) => (
                <Button asChild variant="outline" size="sm" className="h-8 text-xs bg-white border-slate-200 hover:text-blue-600" tooltip={`View details for ${row.name}`}>
                    <Link to={`/teachers/${row.id}`}>
                        View Profile
                    </Link>
                </Button>
            ),
            align: "right",
        },
    ];

    return (
        <div className="space-y-6">


            {/* Actions */}
            <div className="flex justify-between items-center">
                {/* <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Teachers Registry</h1>
                    <p className="text-slate-500">Manage faculty performance and succession planning</p>
                </div> */}
                <PageHeader
                    breadcrumb={[
                        { label: 'Teacher Registry' }
                    ]}
                    title="Teachers Registry"
                    description="Manage faculty performance and succession planning"
                // No add button for now as per requirements/scope
                />
                {canCreateTeacher && (
                    <Button asChild tooltip="Add a new teacher to the registry" className="h-9 px-4 gap-2">
                        <Link to="/teachers/new">
                            <UserPlus className="w-4 h-4" />
                            Add Teacher
                        </Link>
                    </Button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-blue-100 text-sm font-medium mb-1">Total Faculty</p>
                            <h3 className="text-3xl font-bold">{scopedTeachers.length}</h3>
                        </div>
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-purple-100 text-sm font-medium mb-1">Department Heads</p>
                            <h3 className="text-3xl font-bold">
                                {scopedTeachers.filter((t) => t.type === "HOD").length}
                            </h3>
                        </div>
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-4 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-emerald-100 text-sm font-medium mb-1">Avg. Punctuality</p>
                            <h3 className="text-3xl font-bold">
                                {scopedTeachers.length > 0
                                    ? Math.round(
                                        scopedTeachers.reduce((acc, t) => acc + t.punctuality, 0) /
                                        scopedTeachers.length
                                    )
                                    : 0}
                                %
                            </h3>
                        </div>
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-4 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-amber-100 text-sm font-medium mb-1">Avg. Workload</p>
                            <h3 className="text-3xl font-bold">
                                {scopedTeachers.length > 0
                                    ? Math.round(
                                        scopedTeachers.reduce((acc, t) => acc + t.totalWorkload, 0) /
                                        scopedTeachers.length
                                    )
                                    : 0}{" "}
                                <span className="text-base font-normal">hrs</span>
                            </h3>
                        </div>
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="flex flex-col sm:flex-row gap-4">
                <FilterSearch
                    value={searchTerm}
                    onChange={setSearchTerm}
                    currentType={searchType}
                    onTypeChange={setSearchType}
                    types={[
                        { value: "Name", label: "Name", description: "Search by teacher name" },
                        { value: "Email", label: "Email", description: "Search by email address" },
                        { value: "Phone", label: "Phone", description: "Search by phone number" },
                        { value: "Department", label: "Department", description: "Search by department" }
                    ]}
                    placeholder="Search teachers..."
                    className="flex-1"
                />

                {/* Department Filter - Only for University mode */}
                {institutionType === "UNIVERSITY" && user.role === 'PRINCIPAL' && (
                    <FilterSelect
                        label="Department"
                        value={filterDepartment}
                        onChange={setFilterDepartment}
                        options={[
                            { value: "ALL", label: "All Departments" },
                            ...departments.map((dept: any) => ({ value: dept, label: dept }))
                        ]}
                    />
                )}

                {/* Role Filter */}
                <FilterSelect
                    label="Role"
                    value={filterType}
                    onChange={(value) => setFilterType(value as "ALL" | "HOD" | "NORMAL")}
                    options={[
                        { value: "ALL", label: "All Roles" },
                        { value: "HOD", label: "Head of Dept." },
                        { value: "NORMAL", label: "Faculty" }
                    ]}
                />
            </div>

            {/* Pagination & DataTable */}
            {isLoading ? (
                <div className="py-12 text-center text-slate-500">Loading teachers...</div>
            ) : error ? (
                <ErrorState
                    title="Unable to load teachers"
                    message={error}
                    variant="page"
                    onRetry={loadData}
                    retryLabel="Retry"
                    showRefreshPage={true}
                />
            ) : (
                <>
                    {/* Pagination */}
                    {filteredTeachers.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={filteredTeachers.length}
                            onPageChange={setCurrentPage}
                            startIndex={startIndex}
                            endIndex={endIndex}
                        />
                    )}

                    {/* DataTable */}
                    <DataTable
                        columns={columns}
                        data={paginatedTeachers}
                        emptyMessage="No teachers found matching your filters"
                        rowKey="id"
                    />
                </>
            )}

        </div>
    );
}
