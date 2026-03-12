import { useNavigate } from "react-router-dom";
import { GraduationCap, Plus, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useCurrentRole } from "@/RBAC/canMethod";

interface HigherEdSectionProps {
    vertical: "College" | "University" | "School";
    subType?: "Post-Graduate" | "Undergraduate" | "Technical" | "K-12";
    departments?: { id?: string; name: string; hod: string; hodEmail?: string }[];
}

export function HigherEdSection({ vertical, subType, departments }: HigherEdSectionProps) {
    // STRICT RULE: Only Principal can manage HODs/Departments. Authority cannot.
    const role = useCurrentRole();
    const navigate = useNavigate();
    const canManage = role === "PRINCIPAL";

    // VD-05: Use subType for display title
    const displayTitle = subType || (vertical === "University" ? "Post-Graduation" : "Undergraduate");

    return (
        <div className="space-y-6">
            <Card className="border-purple-200 shadow-sm">
                <CardHeader className="bg-purple-50/50 pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-purple-900">
                        <GraduationCap className="w-5 h-5 text-purple-600" />
                        {displayTitle}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                    {/* Departments Entry Point - Replaces Global Calendar */}
                    <div className="pb-3 border-b">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-purple-700 uppercase">Departments</span>
                            <button className="text-xs text-purple-600 hover:underline">View All</button>
                        </div>
                        <p className="text-xs text-slate-500">
                            Manage academic departments and their specific schedules.
                        </p>
                    </div>

                    {/* Academic Grid */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-purple-700 uppercase">Departments</p>
                            {/* Action Button: Visible to PRINCIPAL (simulated by canManage for now) */}
                            {canManage && <button className="text-xs text-purple-600 hover:underline">Manage Departments</button>}
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            {departments?.map((dept, i) => (
                                <div
                                    key={i}
                                    onClick={() => navigate(`/departments/${dept.id || 'mock-dept-id'}`)}
                                    className="flex items-center justify-between p-2 rounded-lg border border-purple-100 bg-white hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer group"
                                >
                                    <div>
                                        <h4 className="font-semibold text-slate-800 text-sm group-hover:text-purple-700 transition-colors">{dept.name}</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">HOD: <span className="font-medium text-slate-700">{dept.hod}</span></p>
                                    </div>
                                    <div className="text-purple-400 group-hover:text-purple-600">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                            ))}

                            {canManage && (
                                <button
                                    className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-dashed border-purple-300 bg-purple-50/30 text-purple-700 hover:bg-purple-50 hover:border-purple-400 transition-all group"
                                    onClick={() => console.log("Create department")}
                                >
                                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                        <Plus className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <span className="text-sm font-medium">Create New Department</span>
                                </button>
                            )}

                            {(!departments || departments.length === 0) && !canManage && (
                                <div className="text-center py-6 text-slate-400 text-sm italic">
                                    No departments initialized.
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
