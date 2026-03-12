import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@/components/ui/DataTable";
import DataTable from "@/components/ui/DataTable";
import { useCan, useCurrentRole } from "@/RBAC/canMethod";
import { FilterSearch } from "@/components/ui/Filters/FilterSearch";
import { FilterSelect } from "@/components/ui/Filters/FilterSelect";
import { StatsWidget } from "@/components/Dashboard/StatsWidget";
import { X, Plus, Eye, Edit2, Lock, Unlock, School as SchoolIcon, Users, GraduationCap, MapPin, ShieldAlert } from "lucide-react";
import { toast } from "react-toastify";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ErrorState } from "@/components/ui/ErrorState";
import { normalizeError } from "@/utils/errorUtils";
import { Button } from "@/components/ui/button";

interface School {
    id: string;
    name: string;
    city: string;
    tehsil: string;
    district: string;
    students: number;
    status: "Active" | "Inactive" | "Pending Assignment";
    vertical: "School" | "College" | "University";
    principal: string;
    created_at: string;
}

import { institutionService } from "@/services/institutionService";

// Fetch from LocalStorage instead of Dummy Data
const fetchSchools = async (
    page: number,
    pageSize: number,
    search: string,
    searchType: string,
    vertical: string,
    status: string
): Promise<{ list: School[], count: number }> => {
    // Simulate Network Delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const allInstitutions = await institutionService.getAllInstitutions();

    // Convert Repository Type to UI Type
    let filtered = allInstitutions.map(inst => ({
        id: inst.emisCode, // Use EMIS as ID for display
        name: inst.name,
        city: "Lahore", // Placeholder
        tehsil: "City",
        district: "Lahore",
        students: 0, // Placeholder
        status: (inst.status === "PENDING_ASSIGNMENT" ? "Pending Assignment" : "Active") as "Active" | "Inactive" | "Pending Assignment",
        vertical: (inst.verticalType === "K12" ? "School" : inst.verticalType === "COLLEGE" ? "College" : "University") as "School" | "College" | "University",
        principal: "-", // Placeholder as Principal architecture is separate
        created_at: new Date(inst.createdAt).toISOString().split('T')[0]
    }));

    // 1. Filter
    if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(school =>
            searchType === "Name" ? school.name.toLowerCase().includes(searchLower) :
                searchType === "ID" ? school.id.toLowerCase().includes(searchLower) :
                    true
        );
    }
    if (vertical !== "All") {
        filtered = filtered.filter(school => school.vertical === vertical);
    }
    if (status !== "All") {
        filtered = filtered.filter(school => school.status === status);
    }

    // 2. Paginate (Slice)
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const sliced = filtered.slice(start, end);

    return {
        list: sliced,
        count: filtered.length
    };
};

export default function SchoolList() {
    const navigate = useNavigate();
    const currentRole = useCurrentRole();
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 30; // UPDATED: 30 records per page as requested
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState(""); // For debouncing
    const [searchType, setSearchType] = useState("Name");
    const [verticalFilter, setVerticalFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<School[]>([]);
    const [totalItems, setTotalItems] = useState(0);

    // CRITICAL: Principal users should NOT access school listing
    // They should only see their own school's dashboard
    useEffect(() => {
        if (currentRole === "PRINCIPAL") {
            toast.error("Access Denied: Principals cannot view school listing", {
                position: "top-center",
                autoClose: 3000
            });
            navigate("/principal");
        }
    }, [currentRole, navigate]);

    // Debounce Search Logic
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setCurrentPage(1); // Reset to page 1 on search change
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Data Fetching Effect
    const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Using debouncedSearch here ensures API is called only after debounce
            const response = await fetchSchools(currentPage, PAGE_SIZE, debouncedSearch, searchType, verticalFilter, statusFilter);
            setData(response.list);
            setTotalItems(response.count);
        } catch (err) {
            console.error("Failed to fetch schools", err);
            setError(normalizeError(err, "We couldn’t fetch schools from the API. Please try again."));
            toast.error("Failed to fetch schools");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [currentPage, debouncedSearch, searchType, verticalFilter, statusFilter]);


    // Handlers for Filters (Reset Page to 1)
    const handleVerticalChange = (val: string) => {
        setVerticalFilter(val);
        setCurrentPage(1);
    };

    const handleStatusChange = (val: string) => {
        setStatusFilter(val);
        setCurrentPage(1);
    };

    // Permissions
    const canManageSchools = useCan("schools.manage");
    const canEdit = useCan("school.edit");
    const canViewDetails = useCan("school.view_details") || canEdit;

    // If Principal somehow bypassed the redirect, show access denied
    if (currentRole === "PRINCIPAL") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <ShieldAlert className="w-16 h-16 text-red-500" />
                <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
                <p className="text-slate-600 text-center max-w-md">
                    Principals do not have access to the school listing page.
                    <br />
                    You can only view your own school's dashboard.
                </p>
                <Button
                    onClick={() => navigate("/dashboard")}
                    className="mt-4"
                >
                    Go to Dashboard
                </Button>
            </div>
        );
    }

    // Columns
    const columns: ColumnDef<School>[] = useMemo(() => [
        {
            header: "ID",
            accessorKey: "id",
            sortable: true,
            className: "text-slate-500 font-mono text-[10px] w-[80px] py-2"
        },
        {
            header: "School Name",
            accessorKey: "name",
            sortable: true,
            className: "font-bold text-slate-800 text-xs min-w-[150px] max-w-[200px] truncate py-2"
        },
        {
            header: "Vertical",
            accessorKey: "vertical",
            sortable: true,
            className: "py-2",
            cell: (row) => (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wide border whitespace-nowrap ${row.vertical === "School" ? "bg-blue-50 text-blue-700 border-blue-200" :
                    row.vertical === "University" ? "bg-purple-50 text-purple-700 border-purple-200" :
                        "bg-orange-50 text-orange-700 border-orange-200"
                    }`}>
                    {row.vertical}
                </span>
            )
        },
        {
            header: "Principal",
            accessorKey: "principal",
            className: "text-xs text-slate-600 max-w-[150px] truncate py-2 whitespace-nowrap"
        },
        {
            header: "Location",
            className: "py-2",
            cell: (row) => (
                <div className="flex col flex-col text-[10px] leading-tight">
                    <span className="font-semibold text-slate-700 truncate max-w-[100px]">{row.city}</span>
                    <span className="text-slate-500 truncate max-w-[100px]">{row.tehsil}</span>
                </div>
            )
        },
        {
            header: "Students",
            accessorKey: "students",
            sortable: true,
            className: "text-right font-medium text-slate-700 text-xs py-2"
        },
        {
            header: "Status",
            accessorKey: "status",
            className: "py-2",
            cell: (row) => (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${row.status === "Active" ? "bg-green-100 text-green-700" :
                    row.status === "Pending Assignment" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                    }`}>
                    {row.status}
                </span>
            )
        },
        {
            header: "Joined at",
            accessorKey: "created_at",
            sortable: true,
            className: "text-slate-600 text-[10px] whitespace-nowrap py-2"
        },
        ...(canViewDetails ? [{
            header: "Actions",
            className: "py-2",
            cell: (row: School) => (
                <div className="flex items-center gap-1 justify-end">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/schools/${row.id}`)}
                        className="h-7 w-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        tooltip="View Details"
                    >
                        <Eye className="w-3.5 h-3.5" />
                    </Button>
                    {canEdit && (
                        <>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-amber-600 hover:bg-amber-50" tooltip="Edit">
                                <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`h-7 w-7 ${row.status === 'Active' ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-400 hover:text-green-600 hover:bg-green-50'}`}
                                tooltip="Toggle Status"
                            >
                                {row.status === 'Active' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                            </Button>
                        </>
                    )}
                </div>
            )
        } as ColumnDef<School>] : [])
    ], [canEdit, canViewDetails]);

    // Reset Logic
    const handleReset = () => {
        setSearch("");
        setDebouncedSearch("");
        setSearchType("Name");
        setVerticalFilter("All");
        setStatusFilter("All");
        setCurrentPage(1);
    };

    const isFiltered = debouncedSearch !== "" || verticalFilter !== "All" || statusFilter !== "All";

    // Row Styling
    const getRowClassName = (row: School) => {
        if (row.status === "Pending Assignment") return "bg-yellow-50/30 hover:bg-yellow-50/50";
        return row.status === "Active" ? "bg-green-50/30 hover:bg-green-50/50" : "bg-red-50/30 hover:bg-red-50/50";
    };

    return (
        <div className="space-y-6">
            <Breadcrumb items={[{ label: 'Schools Registry' }]} />
            {/* KPI Stats - Added as requested */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsWidget title="Total Schools" value={totalItems.toString()} icon={SchoolIcon} trend="+3 this week" trendUp={true} description="registered" />
                <StatsWidget title="Active Students" value="12,500" icon={Users} trend="+5%" trendUp={true} description="enrolled" />
                <StatsWidget title="K-12 Vertical" value="15" icon={GraduationCap} trend="Stable" trendUp={true} description="schools" />
                <StatsWidget title="Districts" value="5" icon={MapPin} trend="+1" trendUp={true} description="covered" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Schools Registry</h2>
                    <p className="text-muted-foreground">Manage registered schools and view their details.</p>
                </div>
                {canManageSchools && (
                    <Button
                        onClick={() => navigate("/schools/new")}
                        leftIcon={<Plus className="w-4 h-4" />}
                    >
                        Add New School
                    </Button>
                )}
            </div>

            {/* Filters Section */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex-1 min-w-[300px]">
                        <FilterSearch
                            value={search}
                            onChange={setSearch}
                            placeholder="Search schools..."
                            currentType={searchType}
                            onTypeChange={setSearchType}
                            types={[
                                { label: "Name", value: "Name", description: "Search by School Name" },
                                { label: "ID", value: "ID", description: "Search by School ID" }
                            ]}
                        />
                    </div>
                    <FilterSelect
                        label="Vertical Type"
                        value={verticalFilter}
                        onChange={handleVerticalChange}
                        options={["All", "School", "College", "University"].map(v => ({ label: v, value: v }))}
                    />
                    <FilterSelect
                        label="Status"
                        value={statusFilter}
                        onChange={handleStatusChange}
                        options={["All", "Active", "Inactive", "Pending Assignment"].map(v => ({ label: v, value: v }))}
                    />
                </div>

                {isFiltered && (
                    <div className="flex justify-end">
                        <Button
                            variant="ghost"
                            onClick={handleReset}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            leftIcon={<X className="h-4 w-4" />}
                        >
                            Reset Filters
                        </Button>
                    </div>
                )}
            </div>

            {/* External Pagination Header (Text + Buttons) */}
            {!error && (
                <div className="flex items-center justify-between px-1 mb-2">

                    <div className="text-sm text-slate-500">
                        Showing <span className="font-medium text-slate-900">{totalItems > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0}</span> to <span className="font-medium text-slate-900">{Math.min(totalItems, currentPage * PAGE_SIZE)}</span> of <span className="font-medium text-slate-900">{totalItems}</span> entries
                    </div>

                    <div className="flex items-center gap-1 bg-transparent p-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="h-8 w-8 text-slate-500 hover:bg-slate-100"
                        >
                            &lt;
                        </Button>

                        {Array.from({ length: Math.ceil(totalItems / PAGE_SIZE) || 1 }, (_, i) => i + 1).map(page => (
                            <Button
                                key={page}
                                variant={currentPage === page ? "default" : "ghost"}
                                size="icon"
                                onClick={() => setCurrentPage(page)}
                                className={`h-8 w-8 ${currentPage === page ? "" : "text-slate-600 hover:bg-slate-100"}`}
                            >
                                {page}
                            </Button>
                        ))}

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalItems / PAGE_SIZE), prev + 1))}
                            disabled={currentPage === Math.ceil(totalItems / PAGE_SIZE)}
                            className="h-8 w-8 text-slate-500 hover:bg-slate-100"
                        >
                            &gt;
                        </Button>
                    </div>
                </div>
            )}

            <div className="rounded-xl border border-slate-200 shadow-sm overflow-hidden bg-white mb-4">
                {!isLoading && error ? (
                    <ErrorState
                        title="Unable to load schools"
                        message={error}
                        variant="page"
                        onRetry={loadData}
                        retryLabel="Retry"
                        showRefreshPage={true}
                    />
                ) : (
                    <DataTable<School>
                        data={data}
                        columns={columns}
                        pagination={true}
                        showPageSize={false}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        defaultPageSize={PAGE_SIZE}
                        isLoading={isLoading}
                        totalItems={totalItems}
                        totalPages={Math.ceil(totalItems / PAGE_SIZE)}
                        getRowClassName={getRowClassName}
                    />
                )}
            </div>
        </div>
    );
}
