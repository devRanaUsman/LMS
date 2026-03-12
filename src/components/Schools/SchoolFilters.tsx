import { FilterSearch } from '@/components/ui/Filters/FilterSearch';
import { FilterSelect } from '@/components/ui/Filters/FilterSelect';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilterOption {
    label: string;
    value: string;
    description?: string;
}

interface SchoolFiltersProps {
    searchTerm: string;
    searchType: string;
    filterStatus: string;
    filterLevel?: string;
    filterCity?: string;
    cities?: string[];
    onSearchChange: (value: string) => void;
    onSearchTypeChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onLevelChange?: (value: string) => void;
    onCityChange?: (value: string) => void;
    onReset: () => void;
    hasActiveFilters: boolean;
    // New optional props for customization
    searchOptions?: FilterOption[];
    statusOptions?: FilterOption[];
}

export function SchoolFilters({
    searchTerm,
    searchType,
    filterStatus,
    filterLevel = "All",
    filterCity: _filterCity,
    cities: _cities,
    onSearchChange,
    onSearchTypeChange,
    onStatusChange,
    onLevelChange,
    onCityChange: _onCityChange,
    onReset,
    hasActiveFilters,
    searchOptions,
    statusOptions,
}: SchoolFiltersProps) {
    const defaultSearchOptions = [
        { label: "Name", value: "Name", description: "Search by name" },
        { label: "ID", value: "ID", description: "Search by code/ID" },
        { label: "City", value: "City", description: "Search by city" }
    ];

    const defaultStatusOptions = [
        { label: "All Status", value: "All" },
        { label: "Active", value: "Active" },
        { label: "Pending", value: "Pending" },
        { label: "Inactive", value: "Inactive" }
    ];

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* FilterSearch with Type Selection */}
                <div className="flex-1 w-full">
                    <FilterSearch
                        value={searchTerm}
                        onChange={onSearchChange}
                        placeholder="Search..."
                        currentType={searchType}
                        onTypeChange={onSearchTypeChange}
                        types={searchOptions || defaultSearchOptions}
                    />
                </div>

                {/* Filter Selects */}
                <FilterSelect
                    label="Status"
                    value={filterStatus}
                    onChange={onStatusChange}
                    options={statusOptions || defaultStatusOptions}
                />

                <FilterSelect
                    label="Level"
                    value={filterLevel}
                    onChange={onLevelChange || (() => { })}
                    options={[
                        { label: "All Levels", value: "All" },
                        { label: "School", value: "School" },
                        { label: "College", value: "College" },
                        { label: "University", value: "University" }
                    ]}
                />

                {/* <FilterSelect
                    label="City"
                    value={filterCity}
                    onChange={onCityChange}
                    options={[
                        { label: "All Cities", value: "All" },
                        ...cities.map(city => ({ label: city, value: city }))
                    ]}
                /> */}
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
                <div className="flex justify-end">
                    <Button
                        variant="ghost"
                        onClick={onReset}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        leftIcon={<X className="h-4 w-4" />}
                        tooltip="Clear all active filters"
                    >
                        Reset Filters
                    </Button>
                </div>
            )}
        </div>
    );
}
