import { useState, useEffect } from "react";
import { localStorageRepository } from "../services/localStorageRepository";
import { type Role, type Resource, RESOURCES } from "../types/roles";
import { Modal } from "../ui/Modal";
import { Check, ShieldAlert, ShieldCheck, Layers, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { RoleCard } from "../components/Dashboard/RoleCard";

export default function RoleManagement() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newRoleName, setNewRoleName] = useState("");
    const [newRoleDesc, setNewRoleDesc] = useState("");
    const [newRoleColor, setNewRoleColor] = useState("bg-blue-600");
    const [newRoleLogo, setNewRoleLogo] = useState<string | undefined>(undefined);



    // Editing state
    const [permissions, setPermissions] = useState<Record<Resource, { read: boolean; write: boolean; delete: boolean }>>(() => {
        const initial: any = {};
        RESOURCES.forEach(r => {
            initial[r] = { read: false, write: false, delete: false };
        });
        return initial;
    });

    useEffect(() => {
        refreshRoles();
    }, []);

    const refreshRoles = () => {
        setRoles([...localStorageRepository.roles.getAll()]);
    };

    const handlePermissionChange = (resource: Resource, type: "read" | "write" | "delete", value: boolean) => {
        setPermissions(prev => ({
            ...prev,
            [resource]: { ...prev[resource], [type]: value }
        }));
    };

    const toggleAllColumn = (type: "read" | "write" | "delete") => {
        const allSelected = RESOURCES.every(r => permissions[r][type]);
        const newState = !allSelected;

        setPermissions(prev => {
            const next = { ...prev };
            RESOURCES.forEach(r => {
                next[r] = { ...next[r], [type]: newState };
            });
            return next;
        });
    };

    const toggleAllRow = (resource: Resource) => {
        const p = permissions[resource];
        const allSelected = p.read && p.write && p.delete;
        const newState = !allSelected;

        setPermissions(prev => ({
            ...prev,
            [resource]: { read: newState, write: newState, delete: newState }
        }));
    };

    const handleCreateRole = () => {
        if (!newRoleName.trim()) return;

        const rolePermissions: Record<Resource, any> = {} as any;
        RESOURCES.forEach(resource => {
            rolePermissions[resource] = {
                resource,
                canRead: permissions[resource].read,
                canWrite: permissions[resource].write,
                canDelete: permissions[resource].delete
            };
        });

        const newRole: Role = {
            id: `role_${Date.now()}`,
            name: newRoleName,
            description: newRoleDesc,
            permissions: rolePermissions,
            // permissions: rolePermissions, // Duplicate removed
            color: newRoleColor,
            logo: newRoleLogo
        };

        localStorageRepository.roles.add(newRole);
        refreshRoles();
        resetForm();
    };

    const handleDeleteRole = (id: string) => {
        if (confirm("Are you sure you want to delete this role?")) {
            localStorageRepository.roles.delete(id);
            refreshRoles();
        }
    };

    const resetForm = () => {
        setIsCreating(false);
        setNewRoleName("");
        setNewRoleDesc("");
        setNewRoleName("");
        setNewRoleDesc("");
        setNewRoleColor("bg-blue-600");
        setNewRoleLogo(undefined);
        const initial: any = {};
        RESOURCES.forEach(r => {
            initial[r] = { read: false, write: false, delete: false };
        });
        setPermissions(initial);
    };

    return (
        <div className="p-6 space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-outfit">Role Management</h1>
                    <p className="text-gray-500">Create and manage custom roles and their permissions.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm shadow-indigo-200"
                >
                    + Create New Role
                </button>
            </header>

            {/* List of Roles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {roles.map(role => (
                    <RoleCard key={role.id} role={role} onDelete={handleDeleteRole} />
                ))}

                {roles.length === 0 && !isCreating && (
                    <div className="col-span-full py-16 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-900">No Roles Defined</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mt-2">Create custom roles to granularly control access to features like Teachers, Classes, and Reports.</p>
                    </div>
                )}
            </div>

            {/* Create Role Modal */}
            <Modal
                isOpen={isCreating}
                onClose={resetForm}
                // maxWidth="max-w-4xl" // Removed invalid prop
                title={
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-100 rounded-md">
                                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                            </div>
                            <span className="text-xl font-bold text-slate-900">Create Permission Matrix</span>
                        </div>
                        <span className="text-sm text-slate-500 font-normal mt-1 ml-1">Define a role and choose permissions per module.</span>
                    </div>
                }
            >
                <div className="space-y-8 pb-16"> {/* Bottom padding for sticky footer */}

                    {/* Logo Upload */}
                    <div className="flex flex-col items-center justify-center -mt-2 mb-6">
                        <label htmlFor="role-logo-upload" className="cursor-pointer group relative">
                            <div className={cn(
                                "w-24 h-24 rounded-full bg-blue-50 border-2 border-dashed border-blue-200 flex flex-col items-center justify-center text-blue-400 hover:bg-blue-100 transition-colors overflow-hidden relative",
                                newRoleLogo && "border-solid border-blue-600 bg-white"
                            )}>
                                {newRoleLogo ? (
                                    <img src={newRoleLogo} alt="Role Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <Camera className="w-8 h-8 mb-1" />
                                        <span className="text-[10px] font-bold uppercase tracking-wide">Add Photo</span>
                                    </>
                                )}
                            </div>
                            <input
                                id="role-logo-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setNewRoleLogo(reader.result as string);
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </label>
                    </div>

                    {/* Form Section */}
                    <div className="bg-slate-50/80 p-6 rounded-xl border border-slate-200/60">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">


                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-900">
                                    Role Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-4 focus:ring-violet-100 focus:border-violet-500 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="e.g. Attendance Clerk"
                                    value={newRoleName}
                                    autoFocus
                                    onChange={e => setNewRoleName(e.target.value)}
                                />

                            </div>
                            <div className="flex justify-between">

                                <label className="block text-sm font-semibold text-slate-900">Description</label>
                                <span className="text-xs text-slate-400">{newRoleDesc.length}/100</span>
                            </div>
                            <textarea
                                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-4 focus:ring-violet-100 focus:border-violet-500 outline-none transition-all placeholder:text-slate-400 min-h-[105px] resize-none"
                                placeholder="Brief description of responsibilities..."
                                maxLength={100}
                                value={newRoleDesc}
                                onChange={e => setNewRoleDesc(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Permission Grid */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200">
                                <th className="p-4 py-3 w-1/4">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Resource</span>
                                </th>
                                {["read", "write", "delete"].map((type) => (
                                    <th key={type} className="p-4 py-3 text-center w-1/4">
                                        <div
                                            className="inline-flex items-center gap-2 cursor-pointer group"
                                            onClick={() => toggleAllColumn(type as any)}
                                        >
                                            <span className={cn(
                                                "text-xs font-bold uppercase tracking-widest transition-colors",
                                                type === 'delete' ? "group-hover:text-red-600 text-slate-500" : "group-hover:text-blue-600 text-slate-500"
                                            )}>
                                                {type}
                                            </span>
                                            <div className={cn(
                                                "w-4 h-4 rounded border flex items-center justify-center transition-all",
                                                RESOURCES.every(r => permissions[r][type as keyof typeof permissions[typeof r]])
                                                    ? (type === 'delete' ? "bg-red-500 border-red-500 text-white" : "bg-blue-600 border-violet-600 text-white")
                                                    : "border-slate-300 bg-white group-hover:border-slate-400"
                                            )}>
                                                <Check className="w-3 h-3" strokeWidth={3} />
                                            </div>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {RESOURCES.map((resource) => (
                                <tr key={resource} className="hover:bg-slate-50/50 transition duration-150 group">
                                    <td className="p-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div
                                                onClick={() => toggleAllRow(resource)}
                                                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm group-hover:text-violet-600 transition-all cursor-pointer border border-transparent group-hover:border-slate-200"
                                            >
                                                <Layers className="w-4 h-4" />
                                            </div>
                                            <span className="font-semibold text-slate-700 text-sm group-hover:text-slate-900 capitalize">
                                                {resource.toLowerCase().replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </td>
                                    {["read", "write", "delete"].map((type) => {
                                        const isActive = permissions[resource][type as "read" | "write" | "delete"];
                                        const isDelete = type === 'delete';

                                        return (
                                            <td key={type} className="p-4 py-3 text-center">
                                                <div className="flex justify-center">
                                                    <button
                                                        onClick={() => handlePermissionChange(resource, type as any, !isActive)}
                                                        className={cn(
                                                            "relative flex items-center justify-center w-16 h-8 rounded-full border transition-all duration-200",
                                                            isActive
                                                                ? (isDelete
                                                                    ? "bg-red-50 border-red-200 text-red-700 font-bold shadow-sm"
                                                                    : "bg-blue-50 border-blue-200 text-blue-700 font-bold shadow-sm")
                                                                : "bg-white border-slate-200 text-slate-300 hover:border-slate-300"
                                                        )}
                                                    >
                                                        <span className="text-[10px] uppercase tracking-wider mr-1">
                                                            {isActive ? "On" : "Off"}
                                                        </span>
                                                        <div className={cn(
                                                            "w-2 h-2 rounded-full",
                                                            isActive
                                                                ? (isDelete ? "bg-red-500" : "bg-blue-600")
                                                                : "bg-slate-200"
                                                        )}></div>
                                                    </button>
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>


                {/* Sticky Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-100 flex justify-end gap-3 z-10 rounded-b-xl">
                    <button
                        onClick={resetForm}
                        className="px-6 py-2.5 text-slate-500 font-medium hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreateRole}
                        disabled={!newRoleName.trim()}
                        className="px-8 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-lg shadow-violet-200 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none text-sm"
                    >
                        Save Role
                    </button>
                </div>
            </Modal>
        </div>
    );
}
