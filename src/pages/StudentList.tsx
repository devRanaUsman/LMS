import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { localStorageRepository } from "../services/localStorageRepository";
import { type Student } from "../types/hierarchy";
import { useDebounce } from "../hooks/useDebounce";
import { Users, GraduationCap, Clock, BookOpen, Phone, Mail } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { DataTable, type ColumnDef } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { PageHeader } from "@/components/ui/PageHeader";
import { FilterSearch } from "@/components/ui/Filters/FilterSearch";
import { FilterSelect } from "@/components/ui/Filters/FilterSelect";
import { SchoolKPICard } from "@/components/Schools/SchoolKPICard";
import { ErrorState } from "@/components/ui/ErrorState";
import { normalizeError } from "@/utils/errorUtils";
import { Button } from "@/components/ui/button";

export default function StudentList() {
    const { user } = usePermissions();
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchType, setSearchType] = useState<string>("Name");
    const [filterDepartment, setFilterDepartment] = useState<string>("ALL");
    const [filterClass, setFilterClass] = useState<string>("ALL");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const debouncedSearch = useDebounce(searchTerm, 500);



    const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            setAllStudents(localStorageRepository.students.getAll());
        } catch (err) {
            console.error("Failed to fetch students", err);
            setError(normalizeError(err, "We couldn't fetch students from the API. Please try again."));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Apply role-based scope filtering (if any specific student visibility rules exist)
    const scopedStudents = useMemo(() => {
        // For now, assuming principals and admins see all. 
        // If HOD, filter by department.
        if (user.role === 'HOD' && user.departmentId) {
            return allStudents.filter(s => s.departmentId === user.departmentId);
        }
        return allStudents;
    }, [allStudents, user.role, user.departmentId]);

    // Filter logic
    const filteredStudents = useMemo(() => {
        return scopedStudents.filter(s => {
            // Search based on type
            let matchesSearch = true;
            if (debouncedSearch) {
                if (searchType === "Name") {
                    matchesSearch = s.name.toLowerCase().includes(debouncedSearch.toLowerCase());
                } else if (searchType === "Email") {
                    matchesSearch = s.email.toLowerCase().includes(debouncedSearch.toLowerCase());
                } else if (searchType === "Phone") {
                    matchesSearch = s.phone.toLowerCase().includes(debouncedSearch.toLowerCase());
                } else if (searchType === "Roll Number") {
                    matchesSearch = s.rollNumber.toLowerCase().includes(debouncedSearch.toLowerCase());
                }
            }

            // Department Filter
            const matchesDepartment = filterDepartment === "ALL" || s.departmentId === filterDepartment;

            // Class Filter
            const matchesClass = filterClass === "ALL" || s.classId === filterClass;

            return matchesSearch && matchesDepartment && matchesClass;
        });
    }, [scopedStudents, debouncedSearch, searchType, filterDepartment, filterClass]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, filterDepartment, filterClass, itemsPerPage]);

    // Get unique departments for filter
    const departments = useMemo(() => {
        const depts = new Set(scopedStudents.map(s => s.departmentId));
        return Array.from(depts).sort();
    }, [scopedStudents]);

    // Get unique classes for filter
    const classes = useMemo(() => {
        const cls = new Set(scopedStudents.map(s => s.classId));
        return Array.from(cls).sort();
    }, [scopedStudents]);

    // DataTable columns definition
    const columns: ColumnDef<Student>[] = [
        {
            header: "Student",
            cell: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-semibold">
                        {row.name.charAt(0)}
                    </div>
                    <div>
                        <div className="text-sm font-medium text-slate-900 whitespace-nowrap">{row.name}</div>
                        <div className="text-xs text-slate-500 whitespace-nowrap">{row.rollNumber}</div>
                    </div>
                </div>
            ),
        },
        {
            header: "Contact",
            cell: (row) => (
                <div className="flex flex-col text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {row.email}
                    </div>
                    <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {row.phone}
                    </div>
                </div>
            )
        },
        {
            header: "Department",
            accessorKey: "departmentId",
            cell: (row) => (
                <span className="text-sm text-slate-700">{row.departmentId}</span>
            ),
        },
        {
            header: "Class",
            accessorKey: "classId",
            cell: (row) => (
                <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                    {row.classId}
                </span>
            ),
        },
        {
            header: "Attendance",
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[80px]">
                        <div
                            className={`h-full rounded-full ${row.attendance >= 90 ? "bg-emerald-500" : row.attendance >= 75 ? "bg-blue-500" : "bg-red-500"
                                }`}
                            style={{ width: `${row.attendance}%` }}
                        />
                    </div>
                    <span className="text-xs font-medium text-slate-700">{row.attendance}%</span>
                </div>
            ),
            align: "center",
        },
        {
            header: "CGPA",
            accessorKey: "cgpa",
            cell: (row) => (
                <span className={`text-sm font-medium ${row.cgpa && row.cgpa >= 3.5 ? 'text-emerald-600' : 'text-slate-700'}`}>
                    {row.cgpa?.toFixed(2) || 'N/A'}
                </span>
            ),
            align: "center",
        },
        {
            header: "Actions",
            cell: (row) => (
                <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs text-slate-700 hover:text-indigo-600"
                    tooltip={`View profile for ${row.name}`}
                >
                    <Link to={`/students/${row.id}`}>
                        View Profile
                    </Link>
                </Button>
            ),
            align: "right",
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <PageHeader
                    breadcrumb={[
                        { label: 'Students Registry' }
                    ]}
                    title="Students Registry"
                    description="Manage student records and performance"
                />

                {/* Same permission logic as Teacher for simplicity, can adjust if needed */}
                <Button asChild tooltip="Add a new student to the registry" className="h-9 px-4 gap-2">
                    <Link to="/students/new">
                        <Users className="w-4 h-4" />
                        Add Student
                    </Link>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <SchoolKPICard
                    title="Total Students"
                    value={scopedStudents.length}
                    icon={<Users className="w-5 h-5 text-white" />}
                    gradient="from-indigo-500 to-indigo-600"
                />

                <SchoolKPICard
                    title="Avg. Attendance"
                    value={`${scopedStudents.length > 0
                        ? Math.round(
                            scopedStudents.reduce((acc, s) => acc + s.attendance, 0) /
                            scopedStudents.length
                        )
                        : 0
                        }%`}
                    icon={<Clock className="w-5 h-5 text-white" />}
                    gradient="from-emerald-500 to-emerald-600"
                />

                <SchoolKPICard
                    title="Avg. CGPA"
                    value={scopedStudents.length > 0
                        ? (scopedStudents.reduce((acc, s) => acc + (s.cgpa || 0), 0) /
                            scopedStudents.length).toFixed(2)
                        : "0.00"}
                    icon={<GraduationCap className="w-5 h-5 text-white" />}
                    gradient="from-blue-500 to-blue-600"
                />

                <SchoolKPICard
                    title="At Risk"
                    value={scopedStudents.filter(s => s.attendance < 75 || (s.cgpa && s.cgpa < 2.0)).length}
                    icon={<BookOpen className="w-5 h-5 text-white" />}
                    gradient="from-amber-500 to-amber-600"
                />
            </div>

            {/* Filter Section */}
            {/* Filter Section */}
            {/* Filter Section */}
            <div className="flex flex-col sm:flex-row gap-4">
                <FilterSearch
                    value={searchTerm}
                    onChange={setSearchTerm}
                    currentType={searchType}
                    onTypeChange={setSearchType}
                    types={[
                        { value: "Name", label: "Name", description: "Search by student name" },
                        { value: "Roll Number", label: "Roll Number", description: "Search by roll number" },
                        { value: "Email", label: "Email", description: "Search by email address" },
                        { value: "Phone", label: "Phone", description: "Search by phone number" },
                    ]}
                    placeholder="Search students..."
                    className="flex-1"
                />

                <FilterSelect
                    label="Department"
                    value={filterDepartment}
                    onChange={setFilterDepartment}
                    options={[
                        { value: "ALL", label: "Departments" },
                        ...departments.map(dept => ({ value: dept, label: dept }))
                    ]}
                />

                <FilterSelect
                    label="Class"
                    value={filterClass}
                    onChange={setFilterClass}
                    options={[
                        { value: "ALL", label: "All Classes" },
                        ...classes.map(cls => ({ value: cls, label: cls }))
                    ]}
                />
            </div>

            {/* Pagination & DataTable */}
            {isLoading ? (
                <div className="py-12 text-center text-slate-500">Loading students...</div>
            ) : error ? (
                <ErrorState
                    title="Unable to load students"
                    message={error}
                    variant="page"
                    onRetry={loadData}
                    retryLabel="Retry"
                    showRefreshPage={true}
                />
            ) : (
                <>
                    <div className="flex justify-end">
                        {filteredStudents.length > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={filteredStudents.length}
                                onPageChange={setCurrentPage}
                                startIndex={startIndex}
                                endIndex={endIndex}
                            />
                        )}
                    </div>

                    <DataTable
                        columns={columns}
                        data={paginatedStudents}
                        emptyMessage="No students found matching your filters"
                        rowKey="id"
                    />
                </>
            )}

        </div>
    );
}
