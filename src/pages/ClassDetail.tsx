import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { localStorageRepository } from "../services/localStorageRepository";
import { type Class, type Student } from "../types/hierarchy";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type ColumnDef } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { FilterSearch } from "@/components/ui/Filters/FilterSearch";
import { Users, GraduationCap, Clock, BookOpen, Mail, Phone } from "lucide-react";
import { SchoolKPICard } from "@/components/Schools/SchoolKPICard";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";

export default function ClassDetail() {
    const { id } = useParams();
    const [classData, setClassData] = useState<Class | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchType, setSearchType] = useState<string>("Name");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const debouncedSearch = useDebounce(searchTerm, 300);

    useEffect(() => {
        if (!id) return;
        const cls = localStorageRepository.classes.getAll().find(c => c.id === id);
        if (cls) {
            setClassData(cls);
            // Load students for this class
            const classStudents = localStorageRepository.students.getAll().filter(s => s.classId === cls.name || s.classId === id);
            // Note: Checking both name and id because seed data uses names like "BSCS-Semester 4-A" as classId
            setStudents(classStudents);
        }
    }, [id]);

    // Filter logic
    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            if (!debouncedSearch) return true;
            const searchLower = debouncedSearch.toLowerCase();

            if (searchType === "Name") {
                return s.name.toLowerCase().includes(searchLower);
            } else if (searchType === "Roll Number") {
                return s.rollNumber.toLowerCase().includes(searchLower);
            } else if (searchType === "Email") {
                return s.email.toLowerCase().includes(searchLower);
            } else if (searchType === "Phone") {
                return s.phone.toLowerCase().includes(searchLower);
            }
            return true;
        });
    }, [students, debouncedSearch, searchType]);

    // Pagination
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

    // Reset page on search
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch]);

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
                    <Link to={`/classes/detail/${classData?.id || id}/students/${row.id}`}>
                        View Profile
                    </Link>
                </Button>
            ),
            align: "right",
        },
    ];

    if (!classData) return <div className="p-6">Loading Class Data...</div>;

    return (
        <div className="space-y-6">
            <PageHeader
                breadcrumb={[
                    { label: 'Classes Registry', to: '/classes' },
                    { label: classData.name }
                ]}
                title={classData.name}
                description={`Department ID: ${classData.departmentId}`}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <SchoolKPICard
                    title="Total Students"
                    value={students.length}
                    icon={<Users className="w-5 h-5 text-white" />}
                    gradient="from-indigo-500 to-indigo-600"
                />

                <SchoolKPICard
                    title="Avg. Attendance"
                    value={`${students.length > 0
                        ? Math.round(
                            students.reduce((acc, s) => acc + s.attendance, 0) /
                            students.length
                        )
                        : 0
                        }%`}
                    icon={<Clock className="w-5 h-5 text-white" />}
                    gradient="from-emerald-500 to-emerald-600"
                />

                <SchoolKPICard
                    title="Avg. CGPA"
                    value={students.length > 0
                        ? (students.reduce((acc, s) => acc + (s.cgpa || 0), 0) /
                            students.length).toFixed(2)
                        : "0.00"}
                    icon={<GraduationCap className="w-5 h-5 text-white" />}
                    gradient="from-blue-500 to-blue-600"
                />

                <SchoolKPICard
                    title="At Risk"
                    value={students.filter(s => s.attendance < 75 || (s.cgpa && s.cgpa < 2.0)).length}
                    icon={<BookOpen className="w-5 h-5 text-white" />}
                    gradient="from-amber-500 to-amber-600"
                />
            </div>

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
            </div>

            {/* Pagination & DataTable */}
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
                    emptyMessage="No students found in this class."
                    rowKey="id"
                    showSerialNumber={false}
                />
            </>
        </div >
    );
}
