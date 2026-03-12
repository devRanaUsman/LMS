import { useState, useMemo, useEffect } from "react";
import { localStorageRepository } from "../services/localStorageRepository";
import { type Institution, VerticalType } from "../types/institution";
import { type Department, type Class, type Teacher } from "../types/hierarchy";
import { useNavigate, Link } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type ColumnDef } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Building2 } from "lucide-react";
import { FilterSearch } from "@/components/ui/Filters/FilterSearch";
import { FilterSelect } from "@/components/ui/Filters/FilterSelect";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/ErrorState";
import { normalizeError } from "@/utils/errorUtils";
import Loader from "@/components/ui/Loader";

export default function ClassesRegistry() {
    const navigate = useNavigate();
    const { user } = usePermissions();

    // In a real app, this comes from context/API. Simulating loading the user's institution.
    // Assuming the user belongs to the first institution found for this demo.
    const institution: Institution = localStorageRepository.institutions.getAll()[0];

    const [searchTerm, setSearchTerm] = useState("");
    const [searchType, setSearchType] = useState<string>("Name");
    const [filterDepartment, setFilterDepartment] = useState<string>("ALL");
    const [filterGrade, setFilterGrade] = useState<string>("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch Data
    const [departments, setDepartments] = useState<Department[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [allClasses, setAllClasses] = useState<Class[]>([]);

    const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            setDepartments(localStorageRepository.departments.getAll());
            setTeachers(localStorageRepository.teachers.getAll());
            setAllClasses(localStorageRepository.classes.getAll());
        } catch (err) {
            console.error("Failed to load classes registry data", err);
            setError(normalizeError(err, "We couldn't fetch the classes data. Please try again."));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Derived Logic
    const isUniversity = institution?.verticalType === VerticalType.UNIVERSITY;
    const isK12 = institution?.verticalType === VerticalType.K12;

    // Filter Logic
    const filteredClasses = useMemo(() => {
        return allClasses.filter((cls) => {
            // Search
            let matchesSearch = true;
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                if (searchType === "Name") {
                    matchesSearch = cls.name.toLowerCase().includes(searchLower);
                } else if (searchType === "ID") {
                    matchesSearch = cls.id.toLowerCase().includes(searchLower);
                }
            }

            // Dept Filter (Uni)
            const matchesDept =
                !isUniversity ||
                filterDepartment === "ALL" ||
                cls.departmentId === filterDepartment;

            // Grade Filter (K12) - Assuming grade is part of name or metadata we can derive
            // For now, simple string matching if grade isn't explicit field yet
            const matchesGrade =
                !isK12 ||
                filterGrade === "ALL" ||
                cls.name.includes(filterGrade);

            return matchesSearch && matchesDept && matchesGrade;
        });
    }, [allClasses, searchTerm, searchType, filterDepartment, filterGrade, isUniversity, isK12]);

    // Pagination
    const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedClasses = filteredClasses.slice(startIndex, endIndex);

    // Column Definitions
    const columns: ColumnDef<Class>[] = [
        {
            header: "Sr.",
            cell: (_, index) => <span className="text-slate-500 font-medium">{startIndex + index + 1}</span>
        },
        {
            header: "Class Name",
            accessorKey: "name",
            cell: (row) => <span className="font-medium text-slate-900">{row.name}</span>
        },
        ...(isUniversity ? [{
            header: "Department",
            cell: (row: Class) => {
                const dept = departments.find(d => d.id === row.departmentId);
                return <span className="text-slate-700">{dept?.name || '-'}</span>;
            }
        }, {
            header: "Head of Department",
            cell: (row: Class) => {
                const dept = departments.find(d => d.id === row.departmentId);
                const hod = teachers.find(t => t.id === dept?.hodId);
                return (
                    <div className="flex items-center gap-2">
                        {hod ? (
                            <>
                                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs text-purple-700 font-medium">
                                    {hod.name.charAt(0)}
                                </div>
                                <span className="text-sm text-slate-600">{hod.name}</span>
                            </>
                        ) : <span className="text-slate-400 text-xs">Not Assigned</span>}
                    </div>
                );
            }
        }] : []),
        ...(isK12 ? [{
            header: "Incharge / Class Teacher",
            cell: (row: Class) => {
                const teacher = teachers.find(t => t.id === row.classTeacherId);
                return (
                    <div className="flex items-center gap-2">
                        {teacher ? (
                            <>
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-700 font-medium">
                                    {teacher.name.charAt(0)}
                                </div>
                                <span className="text-sm text-slate-600">{teacher.name}</span>
                            </>
                        ) : <span className="text-slate-400 text-xs">Not Assigned</span>}
                    </div>
                );
            }
        }] : []),
        {
            header: "Students",
            cell: (row) => {
                const uniqueStudents = localStorageRepository.students.getAll().filter(s => s.classId === row.id || s.classId === row.name);
                return <span className="text-slate-700 font-medium">{uniqueStudents.length}</span>
            }
        },
        {
            header: "Actions",
            cell: (row) => (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/classes/detail/${row.id}`)}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    tooltip={`View details for ${row.name}`}
                >
                    View Details
                </Button>
            ),
            align: "right"
        }
    ];



    if (!institution) return <Loader variant="page" text="Loading institution..." />;

    return (
        <div className="space-y-6">
            <PageHeader
                breadcrumb={[{ label: 'Classes Registry' }]}
                title="Classes & Sections"
                description={`Manage academic hierarchy for ${institution.name}`}
                actions={
                    user.role === 'PRINCIPAL' ? (
                        <Button
                            asChild
                            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                            tooltip="Create a new class for this institution"
                        >
                            <Link to="/classes/new">
                                <Building2 className="w-4 h-4" />
                                Create New Class
                            </Link>
                        </Button>
                    ) : undefined
                }
            />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <FilterSearch
                    value={searchTerm}
                    onChange={setSearchTerm}
                    currentType={searchType}
                    onTypeChange={setSearchType}
                    types={[
                        { value: "Name", label: "Class Name", description: "Search by class name" },
                        { value: "ID", label: "Class ID", description: "Search by class ID" },
                    ]}
                    placeholder="Search classes..."
                    className="flex-1"
                />

                {isUniversity && (
                    <FilterSelect
                        label="Department"
                        value={filterDepartment}
                        onChange={setFilterDepartment}
                        options={[
                            { value: "ALL", label: "All Departments" },
                            ...departments.map(d => ({ value: d.id, label: d.name }))
                        ]}
                    />
                )}

                {isK12 && (
                    <FilterSelect
                        label="Grade"
                        value={filterGrade}
                        onChange={setFilterGrade}
                        options={[
                            { value: "ALL", label: "All Grades" },
                            { value: "Primary", label: "Primary" },
                            { value: "Middle", label: "Middle" },
                            { value: "High", label: "High" }
                        ]}
                    />
                )}
            </div>

            {/* Error & Data boundaries */}
            {isLoading ? (
                <Loader variant="section" text="Loading classes..." />
            ) : error ? (
                <ErrorState
                    title="Unable to load classes"
                    message={error}
                    variant="page"
                    onRetry={loadData}
                    retryLabel="Retry"
                    showRefreshPage={true}
                />
            ) : (
                <>
                    {/* Pagination */}
                    {filteredClasses.length > 0 && (
                        <div className="pt-2 pb-1">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={filteredClasses.length}
                                onPageChange={setCurrentPage}
                                startIndex={startIndex}
                                endIndex={endIndex}
                            />
                        </div>
                    )}

                    {/* DataTable */}
                    <DataTable
                        columns={columns}
                        data={paginatedClasses}
                        emptyMessage="No classes found."
                        showSerialNumber={false}
                    />
                </>
            )}
        </div>
    );
}
