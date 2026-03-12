import { type Department, type Teacher } from "@/types/hierarchy";
import { Button } from "@/components/ui/button";
import {
    Mail, Briefcase, MapPin, Check, MoreVertical, Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DepartmentCardProps {
    dept: Department;
    hod?: Teacher;
    onAssign: (deptId: string) => void;
    onDelete?: (deptId: string) => void;
    onNavigate?: (deptId: string) => void;
}

export function DepartmentCard({ dept, hod, onAssign, onDelete, onNavigate }: DepartmentCardProps) {
    // Generate pseudo-data
    const hodEmail = hod ? `${hod.name.toLowerCase().replace(/\s+/g, '.')}@eduflow.edu` : "unassigned@eduflow.edu";

    const handleCardClick = () => {
        if (onNavigate) {
            onNavigate(dept.id);
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        if (onDelete && confirm(`Are you sure you want to delete ${dept.name}?`)) {
            onDelete(dept.id);
        }
    };

    return (
        <div
            className={cn(
                "relative group bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full",
                onNavigate && "cursor-pointer"
            )}
            onClick={handleCardClick}
        >
            {/* Decorative Corner Tick */}
            <div className="absolute top-0 left-0 w-12 h-12">
                <div className="absolute top-0 left-0 w-0 h-0 border-t-[48px] border-r-[48px] border-t-blue-500 border-r-transparent z-10"></div>
                <Check className="absolute top-1.5 left-1.5 w-4 h-4 text-white z-20" strokeWidth={3} />
            </div>

            {/* Top Actions - Dropdown Menu */}
            <div className="absolute top-4 right-4 z-30" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="text-slate-300 hover:text-slate-500 cursor-pointer p-1 rounded hover:bg-slate-100 transition-colors">
                            <MoreVertical size={18} />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                        {onDelete && (
                            <DropdownMenuItem
                                onClick={handleDelete}
                                className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Content Wrapper */}
            <div className="p-3 flex flex-col items-center flex-1">
                {/* Avatar */}
                <div className="mt-2 mb-2 relative">
                    <div className="w-14 h-14 rounded-full bg-slate-50 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden ring-1 ring-slate-100">
                        {hod ? (
                            <span className="text-xl font-bold text-blue-600">
                                {hod.name.charAt(0)}
                            </span>
                        ) : (
                            <span className="text-xl font-bold text-slate-300">?</span>
                        )}
                    </div>
                    <div className={cn("absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white", hod ? "bg-green-500" : "bg-slate-300")}></div>
                </div>

                {/* Main Info */}
                <h3 className="text-sm font-bold text-slate-900 text-center line-clamp-1">
                    {hod ? hod.name : "Position Vacant"}
                </h3>
                <p className={cn("text-[9px] font-bold uppercase tracking-widest mb-3", hod ? "text-blue-500" : "text-amber-500")}>
                    {dept.name} HOD
                </p>

                {/* Details List */}
                <div className="w-full space-y-2 px-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Mail size={13} className="text-slate-300 shrink-0" />
                        <span className="truncate">{hodEmail}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Briefcase size={13} className="text-slate-300 shrink-0" />
                        <span className="truncate">{hod ? hod.specialization : "Required: " + dept.name + " Expert"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <MapPin size={13} className="text-slate-300 shrink-0" />
                        <span className="truncate">{dept.building}</span>
                    </div>
                </div>
            </div>

            {/* Action Footer */}
            <div className="bg-slate-50/50 p-3 border-t border-slate-100 mt-auto" onClick={(e) => e.stopPropagation()}>
                <Button
                    variant={hod ? "ghost" : "default"}
                    className={cn("w-full transition-all h-10", hod ? "text-slate-500 hover:text-blue-600 hover:bg-blue-50" : "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200")}
                    onClick={() => onAssign(dept.id)}
                >
                    {hod ? "Change HOD" : "Assign Head"}
                </Button>
            </div>
        </div>
    );
}
