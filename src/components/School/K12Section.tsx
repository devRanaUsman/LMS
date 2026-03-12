import { Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useCurrentRole } from "@/RBAC/canMethod";

interface K12SectionProps {
    grades?: { name: string; sections: string[] }[];
}

export function K12Section({ grades }: K12SectionProps) {
    // STRICT RULE: Only Principal can manage Grades/Sections. Authority cannot.
    const role = useCurrentRole();
    const canManage = role === "PRINCIPAL";

    return (
        <Card className="border-blue-200 shadow-sm">
            <CardHeader className="bg-blue-50/50 pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
                    <Users className="w-5 h-5 text-blue-600" />
                    Grade Registry
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-blue-700 uppercase">Active Grades</p>
                    {canManage && <button className="text-xs text-blue-600 hover:underline">Add Grade</button>}
                </div>
                {grades && grades.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                        {grades.map((grade, i) => (
                            <div key={i} className="bg-white border rounded p-2 flex flex-col justify-between h-full">
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-semibold text-sm text-slate-800">{grade.name}</span>
                                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 rounded-full">
                                            {grade.sections.length} Sections
                                        </span>
                                    </div>
                                    <div className="flex gap-1 flex-wrap">
                                        {grade.sections.slice(0, 3).map(sec => (
                                            <span key={sec} className="text-[10px] border border-slate-100 px-1.5 rounded text-slate-500">{sec}</span>
                                        ))}
                                        {grade.sections.length > 3 && (
                                            <span className="text-[10px] text-slate-400">+{grade.sections.length - 3}</span>
                                        )}
                                    </div>
                                </div>
                                {canManage && (
                                    <button className="text-[10px] text-blue-500 hover:text-blue-700 hover:underline mt-2 text-left w-fit">
                                        Manage Sections
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4 text-slate-400 text-sm">
                        No grades configured.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
