import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DataTable, { type ColumnDef } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { dashboardService, type SubUser } from "@/services/dashboardService";
import { UserPlus, Shield, User, ShieldCheck, Camera, Check, Layers } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";


// Helper for context label
const getRoleContextLabel = (role: 'HOD' | 'Clerk', vertical: string) => {
    if (role === 'Clerk') return '-';
    if (vertical === 'SCHOOL') return 'Grade Assigned';
    return 'Department';
};

import { SchoolFilters } from "@/components/Schools/SchoolFilters";

interface SubRoleManagerProps {
    institutionType: string;
}

export function SubRoleManager({ institutionType }: SubRoleManagerProps) {
    const { user } = usePermissions();
    const [isCreating, setCreating] = useState(false);

    // Filter State
    const [searchTerm, setSearchTerm] = useState("");
    const [searchType, setSearchType] = useState("Name");
    const [filterStatus, setFilterStatus] = useState("All");

    // Role Form State
    const [newRoleName, setNewRoleName] = useState("");
    const [newRoleDesc, setNewRoleDesc] = useState("");
    const [newRoleLogo, setNewRoleLogo] = useState<string>("");

    // Resources constant
    const RESOURCES = ["DASHBOARD", "SCHOOLS", "TEACHERS", "STUDENTS", "CLASSES"];

    // Permissions State
    const [permissions, setPermissions] = useState<Record<string, { read: boolean; write: boolean; delete: boolean }>>(
        RESOURCES.reduce((acc, resource) => ({
            ...acc,
            [resource]: { read: false, write: false, delete: false }
        }), {})
    );

    const { data: users, isLoading } = useQuery({
        queryKey: ["subUsers"],
        queryFn: dashboardService.getSubUsers,
    });

    // Filter users
    const filteredUsers = users?.filter(u => {
        // Search Filter
        let matchesSearch = true;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            if (searchType === "Name") matchesSearch = u.name.toLowerCase().includes(term);
            else if (searchType === "Email") matchesSearch = u.email.toLowerCase().includes(term);
        }

        // Status Filter (Assuming users have 'status' field, otherwise default to true/active)
        const matchesStatus = filterStatus === "All" || (u.status || "Active") === filterStatus;

        return matchesSearch && matchesStatus;
    }) || [];

    // Filter Handlers
    const handleReset = () => {
        setSearchTerm("");
        setSearchType("Name");
        setFilterStatus("All");
    };

    // Permission Handlers
    const handlePermissionChange = (resource: string, type: 'read' | 'write' | 'delete', value: boolean) => {
        setPermissions(prev => ({
            ...prev,
            [resource]: { ...prev[resource], [type]: value }
        }));
    };

    const toggleAllRow = (resource: string) => {
        const allActive = ["read", "write", "delete"].every(type => permissions[resource][type as 'read']);
        const newState = !allActive;
        setPermissions(prev => ({
            ...prev,
            [resource]: { read: newState, write: newState, delete: newState }
        }));
    };

    const toggleAllColumn = (type: 'read' | 'write' | 'delete') => {
        const allActive = RESOURCES.every(r => permissions[r][type]);
        const newState = !allActive;
        setPermissions(prev => {
            const next = { ...prev };
            RESOURCES.forEach(r => {
                next[r] = { ...next[r], [type]: newState };
            });
            return next;
        });
    };

    const resetForm = () => {
        setCreating(false);
        setNewRoleName("");
        setNewRoleDesc("");
        setNewRoleLogo("");
        setPermissions(
            RESOURCES.reduce((acc, resource) => ({
                ...acc,
                [resource]: { read: false, write: false, delete: false }
            }), {})
        );
    };

    const handleCreateRole = () => {
        console.log("Creating Role:", { name: newRoleName, description: newRoleDesc, permissions });
        // TODO: Integrate actual API call
        resetForm();
    };

    const columns: ColumnDef<SubUser>[] = [
        { header: "Name", accessorKey: "name" },
        { header: "Email", accessorKey: "email" },
        {
            header: "Role",
            accessorKey: "role",
            cell: (row) => (
                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${row.role === 'HOD' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                    {row.role === 'HOD' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    {row.role}
                </span>
            )
        },
        {
            header: "Context",
            accessorKey: "context",
            cell: (row) => (
                <div>
                    <span className="text-xs text-slate-400 block mb-0.5">{getRoleContextLabel(row.role, institutionType)}</span>
                    <span className="text-gray-700 font-medium">{row.context || "-"}</span>
                </div>
            )
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (_row) => <span className="text-xs text-green-600 font-medium">Active</span>
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-row justify-between items-start">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold text-slate-900">Sub-Role Management</h1>
                    <div className="text-sm text-slate-500">
                        {user.role === 'HOD'
                            ? "Manage access for Teachers and Data Entry Clerks."
                            : "Manage access for Heads of Department and Data Entry Clerks."
                        }
                    </div>
                </div>
                <button
                    onClick={() => setCreating(true)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm shadow-slate-200"
                >
                    <UserPlus className="w-4 h-4" />
                    Create User
                </button>
            </div>

            <div className="flex justify-between items-center gap-4">
                <div className="w-full">
                    <SchoolFilters
                        searchTerm={searchTerm}
                        searchType={searchType}
                        filterStatus={filterStatus}
                        onSearchChange={setSearchTerm}
                        onSearchTypeChange={setSearchType}
                        onStatusChange={setFilterStatus}
                        onReset={handleReset}
                        hasActiveFilters={!!searchTerm || filterStatus !== "All"}
                        // Custom Options for Users
                        searchOptions={[
                            { label: "Name", value: "Name", description: "Search by name" },
                            { label: "Email", value: "Email", description: "Search by email" }
                        ]}
                        statusOptions={[
                            { label: "All Users", value: "All" },
                            { label: "Active", value: "Active" },
                            { label: "Inactive", value: "Inactive" }
                        ]}
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                <DataTable
                    data={filteredUsers}
                    columns={columns}
                    isLoading={isLoading}
                    pagination={false}
                    showSerialNumber={true}
                    emptyState={<div className="p-12 text-center text-gray-500">No sub-users found.</div>}
                />
            </div>

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


                {/* Footer - Aligned with form */}
                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
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
