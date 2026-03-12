import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { schools, getUniqueCities, type School } from '@/data/schools';
import { DataTable, type ColumnDef } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SchoolFilters } from '@/components/Schools/SchoolFilters';
import { Building2, Users, GraduationCap } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';

export default function SchoolList() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('Name');
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [filterLevel, setFilterLevel] = useState<string>('All');
    const [filterCity, setFilterCity] = useState<string>('All');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const debouncedSearch = useDebounce(searchTerm, 300);

    // Get unique cities from data
    const cities = useMemo(() => getUniqueCities(), []);

    // Filtering logic
    const filteredSchools = useMemo(() => {
        return schools.filter(school => {
            // Search filter based on search type
            let matchesSearch = true;
            if (debouncedSearch) {
                const searchLower = debouncedSearch.toLowerCase();
                if (searchType === 'Name') {
                    matchesSearch = school.name.toLowerCase().includes(searchLower);
                } else if (searchType === 'ID') {
                    matchesSearch = school.code.toLowerCase().includes(searchLower);
                } else if (searchType === 'City') {
                    matchesSearch = school.city.toLowerCase().includes(searchLower);
                }
            }

            // Status filter
            const matchesStatus = filterStatus === 'All' || school.status === filterStatus;

            // Level filter
            const matchesLevel = filterLevel === 'All' || school.level === filterLevel;

            // City filter
            const matchesCity = filterCity === 'All' || school.city === filterCity;

            return matchesSearch && matchesStatus && matchesLevel && matchesCity;
        });
    }, [debouncedSearch, searchType, filterStatus, filterLevel, filterCity]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredSchools.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSchools = filteredSchools.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useMemo(() => {
        setCurrentPage(1);
    }, [debouncedSearch, searchType, filterStatus, filterLevel, filterCity]);

    // Reset filters
    const handleReset = () => {
        setSearchTerm('');
        setSearchType('Name');
        setFilterStatus('All');
        setFilterLevel('All');
        setFilterCity('All');
    };

    const hasActiveFilters =
        !!searchTerm || filterStatus !== 'All' || filterLevel !== 'All' || filterCity !== 'All';

    // Row click handler
    const handleRowClick = (school: School) => {
        navigate(`/schools/${school.id}`);
    };

    // Calculate stats
    const stats = useMemo(() => {
        return {
            total: schools.length,
            active: schools.filter(s => s.status === 'Active').length,
            pending: schools.filter(s => s.status === 'Pending').length,
            totalStudents: schools.reduce((sum, s) => sum + (s.studentsCount || 0), 0),
        };
    }, []);

    // DataTable columns
    const columns: ColumnDef<School>[] = [
        {
            header: 'School Name',
            cell: (row) => (
                <div>
                    <div className="text-sm font-medium text-slate-900">{row.name}</div>
                    <div className="text-xs text-slate-500">{row.code}</div>
                </div>
            ),
        },
        {
            header: 'Level',
            cell: (row) => {
                const levelColors = {
                    School: 'bg-blue-100 text-blue-800',
                    College: 'bg-purple-100 text-purple-800',
                    University: 'bg-green-100 text-green-800',
                };
                return (
                    <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${levelColors[row.level]}`}
                    >
                        {row.level}
                    </span>
                );
            },
        },
        {
            header: 'City',
            accessorKey: 'city',
            cell: (row) => <span className="text-sm text-slate-700">{row.city}</span>,
        },
        {
            header: 'Principal',
            cell: (row) => (
                <span className={`text-sm ${row.principalName ? 'text-slate-900' : 'text-slate-400'}`}>
                    {row.principalName || 'Not Assigned'}
                </span>
            ),
        },
        {
            header: 'Status',
            cell: (row) => <StatusBadge status={row.status} />,
        },
        {
            header: 'Students',
            cell: (row) => (
                <span className="text-sm text-slate-700">
                    {row.studentsCount ? row.studentsCount.toLocaleString() : '—'}
                </span>
            ),
            align: 'center',
        },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900">School Registry</h1>
                    <p className="text-sm text-slate-600 mt-1">
                        Manage school onboarding and principal assignments
                    </p>
                </div>
                <Button
                    onClick={() => navigate('/schools/new')}
                    leftIcon={<Building2 className="w-4 h-4" />}
                    tooltip="Add a new school to the registry"
                >
                    Onboard New Institution
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-blue-100 text-sm font-medium mb-1">Total Schools</p>
                            <h3 className="text-3xl font-bold">{stats.total}</h3>
                        </div>
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-4 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-emerald-100 text-sm font-medium mb-1">Active</p>
                            <h3 className="text-3xl font-bold">{stats.active}</h3>
                        </div>
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-4 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-amber-100 text-sm font-medium mb-1">Pending</p>
                            <h3 className="text-3xl font-bold">{stats.pending}</h3>
                        </div>
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-purple-100 text-sm font-medium mb-1">Total Students</p>
                            <h3 className="text-3xl font-bold">{stats.totalStudents.toLocaleString()}</h3>
                        </div>
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* School Filters */}
            <SchoolFilters
                searchTerm={searchTerm}
                searchType={searchType}
                filterStatus={filterStatus}
                filterLevel={filterLevel}
                filterCity={filterCity}
                cities={cities}
                onSearchChange={setSearchTerm}
                onSearchTypeChange={setSearchType}
                onStatusChange={setFilterStatus}
                onLevelChange={setFilterLevel}
                onCityChange={setFilterCity}
                onReset={handleReset}
                hasActiveFilters={hasActiveFilters}
            />


            {/* Pagination */}
            {
                filteredSchools.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredSchools.length}
                        onPageChange={setCurrentPage}
                        startIndex={startIndex}
                        endIndex={endIndex}
                    />
                )
            }

            {/* DataTable */}
            <DataTable
                columns={columns}
                data={paginatedSchools}
                onRowClick={handleRowClick}
                emptyMessage="No schools found matching your filters"
                rowKey="id"
            />
        </div >
    );
}
