import { type Role } from "@/types/roles";
import {
    Shield, Check, MoreVertical, Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RoleCardProps {
    role: Role;
    onDelete: (roleId: string) => void;
}

export function RoleCard({ role, onDelete }: RoleCardProps) {
    // Default color if none provided
    const lightColor = role.color ? role.color.replace('bg-', 'bg-').replace('600', '50') : "bg-blue-50";
    const textColor = role.color ? role.color.replace('bg-', 'text-') : "text-blue-600";
    const borderColor = role.color ? role.color.replace('bg-', 'border-').replace('600', '100') : "border-blue-100";

    return (
        <div className="relative group bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full">
            {/* Decorative Corner Tick */}
            <div className="absolute top-0 left-0 w-12 h-12">
                <div className={cn("absolute top-0 left-0 w-0 h-0 border-t-[48px] border-r-[48px] border-r-transparent z-10", role.color?.replace('bg-', 'border-t-') || "border-t-blue-600")}></div>
                <Check className="absolute top-1.5 left-1.5 w-4 h-4 text-white z-20" strokeWidth={3} />
            </div>

            {/* Top Actions - Dropdown Menu */}
            <div className="absolute top-4 right-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="text-slate-300 hover:text-slate-500 cursor-pointer p-1 rounded-full hover:bg-slate-50 transition-colors">
                            <MoreVertical size={18} />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => onDelete(role.id)}
                            className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer gap-2"
                        >
                            <Trash2 size={14} />
                            Delete Role
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Content Wrapper */}
            <div className="p-5 flex flex-col items-center flex-1 w-full pb-8">
                {/* Avatar */}
                <div className="mt-4 mb-4 relative">
                    <div className="w-20 h-20 rounded-full bg-slate-50 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden ring-1 ring-slate-100">
                        {role.logo ? (
                            <img src={role.logo} alt={role.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className={cn("text-2xl font-bold", textColor)}>
                                {role.name.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100">
                        <Shield className={cn("w-3 h-3 fill-current", textColor)} />
                    </div>
                </div>

                {/* Main Info */}
                <h3 className="text-lg font-bold text-slate-900 text-center line-clamp-1 w-full px-2">
                    {role.name}
                </h3>
                <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-6", textColor)}>
                    Custom Role
                </p>

                {/* Description */}
                <p className="text-sm text-slate-500 text-center mb-6 px-3 line-clamp-2 min-h-[2.5em]">
                    {role.description || "No description provided."}
                </p>

                {/* Access Summary Chips */}
                <div className="w-full space-y-2 px-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1 mb-2 text-center">
                        Top Permissions
                    </div>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                        {Object.values(role.permissions).filter(p => p.canRead).slice(0, 5).map(p => (
                            <span key={p.resource} className={cn("text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-tight", lightColor, textColor, borderColor)}>
                                {p.resource.replace(/_/g, ' ')}
                            </span>
                        ))}
                        {Object.values(role.permissions).filter(p => p.canRead).length > 5 && (
                            <span className="bg-slate-50 text-slate-500 text-[10px] font-bold px-2 py-1 rounded border border-slate-200">
                                +{Object.values(role.permissions).filter(p => p.canRead).length - 5}
                            </span>
                        )}
                        {Object.values(role.permissions).filter(p => p.canRead).length === 0 && (
                            <span className="text-slate-400 text-xs italic">No permissions</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
