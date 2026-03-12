import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DataTable, { type ColumnDef } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { dashboardService, type ScheduleSlot } from "@/services/dashboardService";
import { type Teacher } from "@/types/hierarchy";
import { UserCog } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

interface ScheduleMatrixProps {
    institutionType: string;
}

export function ScheduleMatrix({ institutionType }: ScheduleMatrixProps) {
    const queryClient = useQueryClient();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    // formatted date for API
    const formattedDate = selectedDate ? selectedDate.toISOString().split('T')[0] : "";
    const [contextId, setContextId] = useState<number>(1);

    // Dynamic Context Query (Grades vs Departments)
    const { data: contexts } = useQuery({
        queryKey: ["scheduleContexts", institutionType],
        queryFn: async () => {
            if (institutionType === "SCHOOL") {
                const grades = await dashboardService.getGrades();
                return grades.map(g => ({ id: g.id, name: g.name }));
            } else {
                const depts = await dashboardService.getDepartments();
                return depts.map(d => ({ id: d.id, name: d.name }));
            }
        }
    });

    const [proxyState, setProxyState] = useState<{ isOpen: boolean; slotId: number | null }>({ isOpen: false, slotId: null });
    const [teacherSearch, setTeacherSearch] = useState("");
    const [selectedProxy, setSelectedProxy] = useState<Teacher | null>(null);

    // Fetch Schedule
    const { data: schedule, isLoading } = useQuery({
        queryKey: ["schedule", contextId, formattedDate, institutionType],
        queryFn: () => dashboardService.getSchedule(contextId, formattedDate, institutionType),
        enabled: !!formattedDate,
    });

    // Fetch Teachers for assignment
    const { data: teachers } = useQuery({
        queryKey: ["teachers", "proxy"],
        queryFn: () => dashboardService.getTeachersByDepartment("all"),
    });

    // Proxy Mutation
    const proxyMutation = useMutation({
        mutationFn: ({ slotId, teacherId, date }: { slotId: number; teacherId: number | string; date: string }) =>
            dashboardService.assignScheduleProxy(slotId, teacherId, date),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["schedule"] });
            queryClient.invalidateQueries({ queryKey: ["auditLogs"] });
            setProxyState({ isOpen: false, slotId: null });
            setSelectedProxy(null);
            setTeacherSearch("");
        },
    });

    const columns: ColumnDef<ScheduleSlot>[] = [
        { header: "Time", accessorKey: "time" },
        { header: "Subject", accessorKey: "subject" },
        { header: "Default Teacher", accessorKey: "teacherName" },
        {
            header: "Assigned For Today",
            accessorKey: "proxyTeacherName",
            cell: (row) => (
                <div className="flex items-center gap-2">
                    {row.isProxyToday ? (
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded font-medium flex items-center gap-1">
                            <UserCog className="w-3 h-3" /> {row.proxyTeacherName} (Proxy)
                        </span>
                    ) : (
                        <span className="text-gray-500 text-xs">-</span>
                    )}
                </div>
            )
        },
        {
            header: "Actions",
            cell: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => setProxyState({ isOpen: true, slotId: row.id })}
                        className="text-xs border border-orange-200 text-orange-700 bg-orange-50 px-2 py-1 rounded hover:bg-orange-100 transition-colors"
                    >
                        Assign Proxy
                    </button>
                    {/* Mark Attendance Action - typically for Teachers */}

                </div>
            )
        }
    ];

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                    <div className="flex flex-col gap-1 w-full sm:w-auto">
                        <label className="text-xs font-semibold uppercase text-slate-500">Date</label>
                        <DatePicker
                            date={selectedDate}
                            setDate={setSelectedDate}
                            className="w-full sm:w-[200px]"
                        />
                    </div>

                    <div className="flex flex-col gap-1 w-full sm:w-auto">
                        <label className="text-xs font-semibold uppercase text-slate-500">
                            {institutionType === "UNIVERSITY" ? "Department" : "Grade"}
                        </label>
                        <Select
                            value={contextId.toString()}
                            onValueChange={(val) => setContextId(Number(val))}
                        >
                            <SelectTrigger className="w-[180px] bg-white border-slate-300">
                                <SelectValue placeholder="Select Context" />
                            </SelectTrigger>
                            <SelectContent>
                                {contexts?.map(c => (
                                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <DataTable
                        data={schedule || []}
                        columns={columns}
                        isLoading={isLoading}
                        pagination={false}
                        showSerialNumber={false}
                        emptyState={<div className="p-8 text-center text-gray-500">No schedule found for this date.</div>}
                    />
                </div>
            </div>

            {/* Proxy Modal */}
            <Modal isOpen={proxyState.isOpen} onClose={() => setProxyState({ isOpen: false, slotId: null })} title={`Assign Proxy for ${formattedDate}`}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Search Available Teacher</label>
                        <input
                            type="text"
                            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Type name to search..."
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
                                teachers?.map((teacher: any) => (
                                    <button
                                        key={teacher.id}
                                        onClick={() => setSelectedProxy(teacher)}
                                        className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex justify-between items-center ${selectedProxy?.id === teacher.id ? 'bg-orange-50 text-orange-700' : ''}`}
                                    >
                                        <span>{teacher.name}</span>
                                        <span className="text-xs text-gray-400">{teacher.email}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    )}

                    {/* {selectedProxy && (
                        <div className="text-sm text-orange-800 bg-orange-50 p-2 rounded border border-orange-200">
                            Selected Proxy: <strong>{selectedProxy.name}</strong>
                        </div>
                    )} */}

                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={() => setProxyState({ isOpen: false, slotId: null })} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md">Cancel</button>
                        <button
                            onClick={() => proxyState.slotId && selectedProxy && formattedDate && proxyMutation.mutate({ slotId: proxyState.slotId, teacherId: selectedProxy.id, date: formattedDate })}
                            disabled={!selectedProxy || proxyMutation.isPending}
                            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-md disabled:opacity-50"
                        >
                            {proxyMutation.isPending ? "Assigning..." : "Confirm Proxy"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
