import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DataTable, { type ColumnDef } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { dashboardService, type Department } from "@/services/dashboardService";
import { type Teacher } from "@/types/hierarchy";
import { Plus, UserPlus } from "lucide-react";

export function DepartmentManager() {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [assignHODState, setAssignHODState] = useState<{ isOpen: boolean; deptId: number | string | null }>({ isOpen: false, deptId: null });

    // Forms State
    const [newDeptName, setNewDeptName] = useState("");
    const [teacherSearch, setTeacherSearch] = useState("");
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

    // Fetch Departments
    const { data: departments, isLoading } = useQuery({
        queryKey: ["departments"],
        queryFn: dashboardService.getDepartments,
    });

    // Fetch Teachers for selected department
    const { data: teachers } = useQuery({
        queryKey: ["teachers", assignHODState.deptId],
        queryFn: () => assignHODState.deptId ? dashboardService.getTeachersByDepartment(assignHODState.deptId) : Promise.resolve([]),
        enabled: !!assignHODState.deptId,
    });

    // Mutations
    const createDeptMutation = useMutation({
        mutationFn: dashboardService.createDepartment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            setIsCreateOpen(false);
            setNewDeptName("");
        },
    });

    const assignHODMutation = useMutation({
        mutationFn: ({ deptId, teacherId }: { deptId: number | string; teacherId: string | number }) =>
            dashboardService.assignHOD(deptId, teacherId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            setAssignHODState({ isOpen: false, deptId: null });
            setSelectedTeacher(null);
            setTeacherSearch("");
        },
    });

    const columns: ColumnDef<Department>[] = [
        { header: "Department Name", accessorKey: "name" },
        { header: "HOD Name", accessorKey: "hodName" },
        { header: "Classes", accessorKey: "totalClasses" },
        {
            header: "Status",
            accessorKey: "status",
            cell: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.hodId ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {row.hodId ? 'HOD Assigned' : 'Pending Assignment'}
                </span>
            )
        },
        {
            header: "Actions",
            cell: (row) => (
                <button
                    onClick={() => setAssignHODState({ isOpen: true, deptId: row.id })}
                    className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                >
                    <UserPlus className="w-3 h-3" /> Assign HOD
                </button>
            )
        }
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    {/* Header handled by parent mainly, but we can put controls here */}
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" /> Create Department
                </button>
            </div>

            <div className="bg-white rounded-lg border border-slate-200">
                <DataTable
                    data={departments || []}
                    columns={columns}
                    isLoading={isLoading}
                    pagination={false}
                    showSerialNumber={true}
                    emptyState={<div className="p-8 text-center text-gray-500">No departments found. Create one to get started.</div>}
                />
            </div>

            {/* Create Modal */}
            <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Department">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Department Name</label>
                        <input
                            type="text"
                            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Computer Science"
                            value={newDeptName}
                            onChange={(e) => setNewDeptName(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md">Cancel</button>
                        <button
                            onClick={() => createDeptMutation.mutate({ name: newDeptName })}
                            disabled={!newDeptName || createDeptMutation.isPending}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                        >
                            {createDeptMutation.isPending ? "Creating..." : "Create"}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Assign HOD Modal */}
            <Modal isOpen={assignHODState.isOpen} onClose={() => setAssignHODState({ isOpen: false, deptId: null })} title="Assign Head of Department">
                <div className="space-y-4">
                    {/* Results */}
                    <div className="border border-slate-200 rounded-md max-h-40 overflow-y-auto">
                        {!teachers || teachers.length === 0 ? (
                            <div className="p-4 text-center text-sm text-slate-500">
                                No teachers in this department yet. Add teachers first.
                            </div>
                        ) : (
                            teachers
                                .filter(t => String(t.departmentId) === String(assignHODState.deptId))
                                .filter(t => t.name.toLowerCase().includes(teacherSearch.toLowerCase()))
                                .map((teacher: Teacher) => (
                                    <button
                                        key={teacher.id}
                                        onClick={() => setSelectedTeacher(teacher)}
                                        className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex justify-between items-center ${selectedTeacher?.id === teacher.id ? 'bg-blue-50 text-blue-700' : ''}`}
                                    >
                                        <span>{teacher.name}</span>
                                        <span className="text-xs text-gray-400">{teacher.email}</span>
                                    </button>
                                ))
                        )}
                    </div>

                    {selectedTeacher && (
                        <div className="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">
                            Selected: <strong>{selectedTeacher.name}</strong>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={() => setAssignHODState({ isOpen: false, deptId: null })} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md">Cancel</button>
                        <button
                            onClick={() => assignHODState.deptId && selectedTeacher && assignHODMutation.mutate({ deptId: assignHODState.deptId, teacherId: selectedTeacher.id })}
                            disabled={!selectedTeacher || assignHODMutation.isPending}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                        >
                            {assignHODMutation.isPending ? "Assigning..." : "Assign HOD"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
