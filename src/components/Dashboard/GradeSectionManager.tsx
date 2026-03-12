import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DataTable, { type ColumnDef } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { dashboardService, type Grade } from "@/services/dashboardService";
import { type Teacher } from "@/types/hierarchy";
import { Plus, UserPlus } from "lucide-react";

export function GradeSectionManager() {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newGradeName, setNewGradeName] = useState("");

    // Assignment Modal State
    const [assignmentState, setAssignmentState] = useState<{ isOpen: boolean; gradeId: number | null }>({ isOpen: false, gradeId: null });
    const [teacherSearch, setTeacherSearch] = useState("");
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

    // Fetch Grades
    const { data: grades, isLoading } = useQuery({
        queryKey: ["grades"],
        queryFn: dashboardService.getGrades,
    });

    // Fetch Teachers
    const { data: teachers } = useQuery({
        queryKey: ["teachers", "all"],
        queryFn: () => dashboardService.getTeachersByDepartment("all"),
    });

    // Create Grade Mutation
    const createGradeMutation = useMutation({
        mutationFn: dashboardService.createGrade,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["grades"] });
            setIsCreateOpen(false);
            setNewGradeName("");
        },
    });

    // Assign Head Teacher Mutation
    const assignMutation = useMutation({
        mutationFn: ({ gradeId, teacherId }: { gradeId: number; teacherId: number | string }) =>
            dashboardService.assignHeadTeacher(gradeId, teacherId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["grades"] });
            setAssignmentState({ isOpen: false, gradeId: null });
            setSelectedTeacher(null);
            setTeacherSearch("");
        },
    });

    const columns: ColumnDef<Grade>[] = [
        { header: "Grade Level", accessorKey: "name" },
        {
            header: "Head Teacher",
            accessorKey: "headTeacher",
            cell: (row) => (
                <div className="flex items-center justify-between">
                    <span className="text-gray-600">{row.headTeacher || "Unassigned"}</span>
                    {!row.headTeacher && (
                        <button
                            onClick={() => setAssignmentState({ isOpen: true, gradeId: row.id })}
                            className="ml-2 text-[10px] text-blue-600 border border-blue-200 bg-blue-50 px-2 py-0.5 rounded hover:bg-blue-100"
                        >
                            Assign
                        </button>
                    )}
                </div>
            )
        },
        {
            header: "Total Sections",
            accessorKey: "sectionsCount",
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <span className="font-medium">{row.sectionsCount}</span>
                    <button className="text-xs text-blue-600 hover:underline">Manage Sections</button>
                </div>
            )
        },
        {
            header: "Actions",
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setAssignmentState({ isOpen: true, gradeId: row.id })}
                        className="text-xs text-slate-600 hover:text-blue-600 flex items-center gap-1 border px-2 py-1 rounded bg-slate-50"
                    >
                        <UserPlus className="w-3 h-3" /> {row.headTeacher ? "Reassign" : "Assign Head"}
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500">Manage Grades and Sections for the school year.</p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" /> Add Grade Level
                </button>
            </div>

            <div className="bg-white rounded-lg border border-slate-200">
                <DataTable
                    data={grades || []}
                    columns={columns}
                    isLoading={isLoading}
                    pagination={false}
                    showSerialNumber={true}
                    emptyState={<div className="p-8 text-center text-gray-500">No grades found. Add one to get started.</div>}
                />
            </div>

            {/* Create Modal */}
            <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add Grade Level">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Grade Name</label>
                        <input
                            type="text"
                            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Grade 9"
                            value={newGradeName}
                            onChange={(e) => setNewGradeName(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md">Cancel</button>
                        <button
                            onClick={() => createGradeMutation.mutate(newGradeName)}
                            disabled={!newGradeName || createGradeMutation.isPending}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                        >
                            {createGradeMutation.isPending ? "Adding..." : "Add Grade"}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Assign Head Teacher Modal */}
            <Modal
                isOpen={assignmentState.isOpen}
                onClose={() => setAssignmentState({ isOpen: false, gradeId: null })}
                title="Assign Head Teacher"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Search Teacher</label>
                        <input
                            type="text"
                            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Type to search..."
                            value={teacherSearch}
                            onChange={(e) => setTeacherSearch(e.target.value)}
                        />
                    </div>

                    {/* Results */}
                    {teacherSearch.length > 1 && (
                        <div className="border border-slate-200 rounded-md max-h-40 overflow-y-auto">
                            {teachers?.length === 0 ? (
                                <div className="p-3 text-sm text-gray-500">No teachers found.</div>
                            ) : (
                                teachers
                                    ?.filter(t => t.name.toLowerCase().includes(teacherSearch.toLowerCase()))
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
                    )}

                    {selectedTeacher && (
                        <div className="text-sm text-blue-800 bg-blue-50 p-2 rounded border border-blue-200">
                            Selected: <strong>{selectedTeacher.name}</strong>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={() => setAssignmentState({ isOpen: false, gradeId: null })} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md">Cancel</button>
                        <button
                            onClick={() => assignmentState.gradeId && selectedTeacher && assignMutation.mutate({ gradeId: assignmentState.gradeId, teacherId: selectedTeacher.id })}
                            disabled={!selectedTeacher || assignMutation.isPending}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                        >
                            {assignMutation.isPending ? "Assigning..." : "Confirm Assignment"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
