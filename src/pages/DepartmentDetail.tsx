import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { localStorageRepository } from "@/services/localStorageRepository";
import { type Class, type Teacher, type Department } from "@/types/hierarchy";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Users, BookOpen, GraduationCap, ChevronRight, UserPlus, Calendar } from "lucide-react";
import { DataTable, type ColumnDef } from "@/components/ui/DataTable";

export default function DepartmentDetail() {
    const { deptId } = useParams();
    const navigate = useNavigate();
    const [department, setDepartment] = useState<Department | null>(null);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [activeTab, setActiveTab] = useState<"teachers" | "classes">("teachers");

    useEffect(() => {
        if (!deptId) return;

        // Fetch Department
        let dept = localStorageRepository.departments.getById(deptId);

        // If not found, to avoid breaking the UI for demo purposes (e.g. HOD default dept_cs),
        // try to get the first available department
        if (!dept) {
            const allDepts = localStorageRepository.departments.getAll();
            if (allDepts.length > 0) {
                dept = allDepts[0];
            } else {
                setDepartment({
                    id: deptId,
                    schoolId: 1,
                    name: 'Computer Science',
                    building: 'Block A',
                    hodId: 'T1'
                });
            }
        }

        if (dept) {
            setDepartment(dept);
        }

        const effectiveDeptId = dept ? dept.id : deptId;

        // Fetch Teachers
        const allTeachers = localStorageRepository.teachers.getAll();
        const deptTeachers = allTeachers.filter(t => t.departmentId === effectiveDeptId || t.departmentId === department?.name || (effectiveDeptId === 'mock-dept-id' && t.departmentId === 'Computer Science') || (deptId === 'dept_cs' && t.departmentId === 'Computer Science'));
        setTeachers(deptTeachers);

        // Fetch Classes
        const deptClasses = localStorageRepository.classes.getByDepartment(effectiveDeptId);

        // Fallback for demo: if no classes found by ID, try finding by name (since seed data mixes them sometimes)
        if (deptClasses.length === 0 && dept) {
            const fallbackClasses = localStorageRepository.classes.getAll().filter(c => c.departmentId === dept?.name);
            setClasses(fallbackClasses);
        } else {
            setClasses(deptClasses);
        }

    }, [deptId]);

    const hod = useMemo(() => teachers.find(t => t.type === "HOD"), [teachers]);

    if (!department) return <div className="p-8 text-center text-slate-500">Loading department...</div>;

    const stats = [
        { label: "Total Faculty", value: teachers.length, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
        { label: "Active Classes", value: classes.length, icon: BookOpen, color: "text-purple-600", bg: "bg-purple-100" },
        { label: "Students (Est)", value: classes.length * 30, icon: GraduationCap, color: "text-emerald-600", bg: "bg-emerald-100" }, // Mock calculation
    ];

    const teacherColumns: ColumnDef<Teacher>[] = [
        {
            header: "Name",
            accessorKey: "name" as keyof Teacher,
            cell: (row: Teacher) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                        {row.name.charAt(0)}
                    </div>
                    <div>
                        <div className="font-medium text-slate-900">{row.name}</div>
                        <div className="text-xs text-slate-500">{row.email}</div>
                    </div>
                </div>
            )
        },
        {
            header: "Role",
            accessorKey: "type" as keyof Teacher,
            cell: (row: Teacher) => (
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${row.type === 'HOD' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                    {row.type === 'HOD' ? 'Head of Dept' : 'Faculty'}
                </span>
            )
        },
        {
            header: "Specialization",
            accessorKey: "specialization" as keyof Teacher,
            cell: (row: Teacher) => <span className="text-sm text-slate-600">{row.specialization}</span>
        },
        {
            header: "Action",
            cell: (row: Teacher) => (
                <button onClick={() => navigate(`/teachers/${row.id}`)} className="text-xs text-blue-600 hover:underline">View Profile</button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                breadcrumb={[
                    { label: "Dashboard", to: "/" },
                    { label: "Staffing", to: "/staffing" },
                    { label: department.name }
                ]}
                title={department.name}
                description={
                    <div className="flex items-center gap-2 text-sm">
                        <span>Building: {department.building}</span>
                        <span>•</span>
                        <span>HOD: <span className="font-medium text-slate-700">{hod?.name || "Not Assigned"}</span></span>
                    </div>
                }
                actions={
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                            <Calendar className="w-4 h-4" /> Schedule
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm">
                            <UserPlus className="w-4 h-4" /> Add Staff
                        </button>
                    </div>
                }
            />

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat, i) => (
                    <Card key={i}>
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                            </div>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Content Tabs */}
            <div className="space-y-4">
                <div className="flex border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab("teachers")}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "teachers" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                    >
                        Teachers
                    </button>
                    <button
                        onClick={() => setActiveTab("classes")}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "classes" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                    >
                        Classes
                    </button>
                </div>

                {activeTab === "teachers" ? (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <DataTable
                            columns={teacherColumns}
                            data={teachers}
                            emptyMessage="No teachers assigned to this department."
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {classes.map((c) => (
                            <div
                                key={c.id}
                                onClick={() => navigate(`/classes/detail/${c.id}`)}
                                className="group bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:bg-blue-600 transition-colors" />
                                <div className="ml-2">
                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{c.name}</h3>
                                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Class ID: {c.id}</p>
                                </div>
                                <div className="mt-4 flex justify-end items-center gap-1 text-sm text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                    View Details <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        ))}
                        {classes.length === 0 && (
                            <div className="col-span-full py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                <p className="text-slate-500">No classes found in this department.</p>
                                <button className="mt-2 text-sm text-blue-600 hover:underline">Add First Class</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
