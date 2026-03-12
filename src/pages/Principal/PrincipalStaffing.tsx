import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { hierarchyService } from "@/services/hierarchyService";
import { localStorageRepository } from "@/services/localStorageRepository";
import { type Department, type Teacher } from "@/types/hierarchy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Plus, Search, ShieldCheck, Building2, UserPlus
} from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { DataTable } from "@/components/ui/DataTable";
import { FilterSearch } from "@/components/ui/Filters/FilterSearch";
import { FilterSelect } from "@/components/ui/Filters/FilterSelect";
import { PageLoader } from "@/components/ui/loaders/PageLoader";

export default function PrincipalStaffing() {
    const navigate = useNavigate();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form State
    const [showAddDept, setShowAddDept] = useState(false);
    const [newDeptName, setNewDeptName] = useState("");
    const [newDeptBuilding, setNewDeptBuilding] = useState("");
    const [newDeptHodId, setNewDeptHodId] = useState<string>("");
    const [isCreating, setIsCreating] = useState(false);

    // HOD Assignment state
    const [assigningToDept, setAssigningToDept] = useState<string | null>(null);
    const [assigningHodId, setAssigningHodId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Filter states
    const [searchType, setSearchType] = useState<string>("Name");
    const [filterStatus, setFilterStatus] = useState<string>("All");

    // Classes for counting
    const [classes, setClasses] = useState<any[]>([]);

    useEffect(() => {
        loadData(true);
    }, []);

    const loadData = async (showMainLoader = false) => {
        if (showMainLoader) setIsLoading(true);
        try {
            const depts = await hierarchyService.getDepartments(1); // Mock school ID 1
            const tchs = await hierarchyService.getTeachers();
            const cls = localStorageRepository.classes.getAll();
            setDepartments(depts);
            setTeachers(tchs);
            setClasses(cls);
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            if (showMainLoader) setIsLoading(false);
        }
    };

    const handleCreateDept = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDeptName || !newDeptBuilding) return;

        setIsCreating(true);
        try {
            // 1. Create Department
            const newDept = await hierarchyService.createDepartment(1, newDeptName, newDeptBuilding);

            // 2. Assign HOD if selected
            if (newDeptHodId && newDept) {
                await hierarchyService.assignHOD(newDept.id, newDeptHodId);
            }

            toast.success("Department created successfully");
            setNewDeptName("");
            setNewDeptBuilding("");
            setNewDeptHodId("");
            setShowAddDept(false);
            loadData(false); // Silently refetch
        } catch (error) {
            toast.error("Failed to create department");
        } finally {
            setIsCreating(false);
        }
    };

    const handleAssignHOD = async (teacherId: string) => {
        if (!assigningToDept) return;

        setAssigningHodId(teacherId);
        try {
            await hierarchyService.assignHOD(assigningToDept, teacherId);

            // Immediate local state update for snappy UI
            setDepartments(prev => prev.map(d =>
                d.id === assigningToDept ? { ...d, hodId: teacherId } : d
            ));

            toast.success("HOD assigned successfully", { autoClose: 2000 });
            setAssigningToDept(null);

            // Background silent refetch to ensure consistency
            loadData(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to assign HOD");
        } finally {
            setAssigningHodId(null);
        }
    };


    const handleNavigateToDept = (deptId: string) => {
        navigate(`/departments/${deptId}`);
    };

    // Filter departments based on search type, search term and status
    const filteredDepartments = departments.filter(dept => {
        // Search filter based on type
        let matchesSearch = true;
        if (searchTerm) {
            if (searchType === "Name") {
                matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase());
            } else if (searchType === "Department") {
                matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase());
            }
        }

        // Status filter
        const hod = teachers.find(t => t.id === dept.hodId);
        const deptStatus = hod ? "Active" : "Inactive";
        const matchesStatus = filterStatus === "All" || deptStatus === filterStatus;

        return matchesSearch && matchesStatus;
    });

    if (isLoading) {
        return <PageLoader text="Loading department staffing..." />;
    }

    const filteredTeachers = teachers.filter(t =>
        (assigningToDept ? String(t.departmentId) === String(assigningToDept) : true) &&
        (t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="max-w-[1400px] mx-auto space-y-6">
            <PageHeader
                breadcrumb={[
                    { label: 'Dashboard', to: '/' },
                    { label: 'Staffing' }
                ]}
                title="Department Staffing"
                description="Manage departmental hierarchy and HOD assignments"
                actions={
                    <Button onClick={() => setShowAddDept(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 text-xs" tooltip="Create a new department">
                        <Plus className="w-3.5 h-3.5 mr-2" />
                        New Department
                    </Button>
                }
            />

            {/* Create Department Modal - Keep as is mostly */}
            <Modal isOpen={showAddDept} onClose={() => setShowAddDept(false)} title="New Department">
                <form className="space-y-6 pt-2">
                    {/* ... (Kept existing form structure implicitly as I am only replacing the changed parts if possible, but here I am replacing a large chunk to capture the header changes too) */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Department Details</label>
                            <Input
                                placeholder="Department Name (e.g. Computer Science)"
                                value={newDeptName}
                                onChange={(e) => setNewDeptName(e.target.value)}
                                className="bg-slate-50 border-slate-200 h-11 focus:bg-white transition-all"
                            />
                            <Input
                                placeholder="Building / Location (e.g. Block A)"
                                value={newDeptBuilding}
                                onChange={(e) => setNewDeptBuilding(e.target.value)}
                                className="bg-slate-50 border-slate-200 h-11 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    <div className="pt-0 pb-2">
                        <Button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                handleCreateDept(e);
                            }}
                            disabled={isCreating}
                            isLoading={isCreating}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 text-base font-semibold shadow-lg shadow-blue-200 rounded-xl"
                        >
                            Save & Continue
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <FilterSearch
                    value={searchTerm}
                    onChange={setSearchTerm}
                    currentType={searchType}
                    onTypeChange={setSearchType}
                    types={[
                        { value: "Name", label: "Name", description: "Search by department name" },
                        { value: "Department", label: "Department", description: "Search by department" }
                    ]}
                    placeholder="Search departments..."
                    className="flex-1"
                />
                <FilterSelect
                    label="Status"
                    value={filterStatus}
                    onChange={setFilterStatus}
                    options={[
                        { value: "All", label: "All Status" },
                        { value: "Active", label: "Active" },
                        { value: "Inactive", label: "Inactive" }
                    ]}
                />
            </div>

            {/* Departments Table */}
            {filteredDepartments.length === 0 ? (
                <EmptyState
                    icon={<Building2 className="w-16 h-16" />}
                    title="No Departments Yet"
                    description="Get started by creating your first department. Departments help organize your institution's academic structure."
                    action={
                        <Button onClick={() => setShowAddDept(true)} className="bg-blue-600 hover:bg-blue-700" tooltip="Create a new department">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Department
                        </Button>
                    }
                />
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <DataTable
                        columns={[
                            {
                                header: "Sr.",
                                cell: (_row, index) => <span className="text-slate-600">{index !== undefined ? index + 1 : '-'}</span>
                            },
                            {
                                header: "Department Name",
                                accessorKey: "name",
                                cell: (row) => (
                                    <Button
                                        variant="link"
                                        onClick={() => handleNavigateToDept(row.id)}
                                        className="text-slate-900 font-medium hover:text-blue-600 p-0 h-auto"
                                    >
                                        {row.name}
                                    </Button>
                                )
                            },
                            {
                                header: "HOD Name",
                                cell: (row) => {
                                    const hod = teachers.find(t => t.id === row.hodId);
                                    return hod ? (
                                        <span className="text-slate-700">{hod.name}</span>
                                    ) : (
                                        <span className="text-yellow-600 font-medium">Pending</span>
                                    );
                                }
                            },
                            {
                                header: "Classes",
                                cell: (row) => {
                                    const classCount = classes.filter(c => c.departmentId === row.id).length;
                                    return <span className="text-slate-600">{classCount}</span>;
                                }
                            },
                            {
                                header: "Status",
                                cell: (row) => {
                                    const hod = teachers.find(t => t.id === row.hodId);
                                    const isActive = !!hod;
                                    return (
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'} `}>
                                            {isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    );
                                }
                            },
                            {
                                header: "Actions",
                                cell: (row) => {
                                    const hod = teachers.find(t => t.id === row.hodId);
                                    return (
                                        <Button
                                            size="sm"
                                            onClick={() => setAssigningToDept(row.id)}
                                            className={`text-xs h-8 shadow-none ${hod
                                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                                }`}
                                            leftIcon={<UserPlus className="w-3 h-3" />}
                                            tooltip={hod ? "Replace current HOD" : "Assign an HOD"}
                                        >
                                            {hod ? 'Replace HOD' : 'Assign HOD'}
                                        </Button>
                                    );
                                }
                            }
                        ]}
                        data={filteredDepartments}
                        showSerialNumber={false}
                        pagination={false}
                    />
                </div>
            )}

            {/* HOD Assignment Modal - Preserved Original Functionality */}
            {assigningToDept && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <Card className="w-full max-w-lg shadow-2xl border-none ring-1 ring-white/20 bg-white animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <CardHeader className="border-b border-slate-100 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2.5 text-xl font-bold font-outfit text-slate-900">
                                    <ShieldCheck className="w-6 h-6 text-blue-600" />
                                    Assign Department Head
                                </CardTitle>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100 text-slate-400" onClick={() => setAssigningToDept(null)} disabled={assigningHodId !== null}>
                                    <span className="sr-only">Close</span>
                                    <Plus className="w-5 h-5 rotate-45" />
                                </Button>
                            </div>
                            <p className="text-sm text-slate-500 font-medium ml-1">
                                Select a leader for <span className="text-blue-600 font-bold">{departments.find(d => d.id === assigningToDept)?.name}</span>
                            </p>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                                <div className="relative group">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    <Input
                                        placeholder="Search teachers..."
                                        className="pl-9 h-10 bg-white border-slate-200 focus:border-blue-500 transition-all shadow-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="max-h-[350px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                {filteredTeachers.length === 0 ? (
                                    <div className="p-8 text-center space-y-2">
                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                                            <Search className="w-6 h-6" />
                                        </div>
                                        <p className="text-sm text-slate-500">No teachers found matching "{searchTerm}"</p>
                                    </div>
                                ) : (
                                    filteredTeachers.map(teacher => {
                                        const isHODElsewhere = departments.find(d => d.hodId === teacher.id && d.id !== assigningToDept);
                                        return (
                                            <div
                                                key={teacher.id}
                                                className={cn(
                                                    "flex items-center justify-between p-3 rounded-xl border transition-all duration-200",
                                                    isHODElsewhere
                                                        ? "opacity-60 bg-slate-50 border-transparent grayscale-[0.5]"
                                                        : "hover:bg-blue-50 hover:border-blue-200 hover:shadow-sm cursor-pointer border-transparent bg-white"
                                                )}
                                                onClick={() => !isHODElsewhere && handleAssignHOD(teacher.id)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-sm",
                                                        isHODElsewhere ? "bg-slate-200 text-slate-500" : "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700"
                                                    )}>
                                                        {teacher.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 leading-none mb-1">{teacher.name}</p>
                                                        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">{teacher.specialization}</p>
                                                    </div>
                                                </div>
                                                {isHODElsewhere ? (
                                                    <span className="text-[10px] font-bold uppercase text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                                                        Already HOD
                                                    </span>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        className="bg-white text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white shadow-sm transition-all"
                                                        tooltip={`Assign ${teacher.name} as HOD`}
                                                        isLoading={assigningHodId === teacher.id}
                                                        disabled={assigningHodId !== null}
                                                    >
                                                        Assign
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
