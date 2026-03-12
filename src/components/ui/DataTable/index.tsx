"use client";

import React, { memo, useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Loader from "../Loader";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../tooltip";

export interface ColumnDef<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (row: T, index: number) => React.ReactNode;
    className?: string;
    sortable?: boolean;
    sortingFn?: (a: T, b: T) => number;
    align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    emptyState?: React.ReactNode;
    emptyMessage?: string;
    pagination?: boolean;
    showPageSize?: boolean;
    defaultPageSize?: number;
    currentPage?: number;
    setCurrentPage?: React.Dispatch<React.SetStateAction<number>>;
    totalPages?: number;
    totalItems?: number;
    isLoading?: boolean;
    showSerialNumber?: boolean;
    unfilteredPageCount?: number;
    getRowClassName?: (row: T) => string;
    onRowClick?: (row: T) => void;
    zebra?: boolean;
    rowKey?: keyof T | ((row: T) => string | number);
}

function getRowKeyFunc<T>(row: T, index: number, keyProp?: keyof T | ((row: T) => string | number)): string {
    if (!keyProp) return index.toString();
    if (typeof keyProp === 'function') return keyProp(row).toString();
    return String(row[keyProp]);
}

const DataTable = <T,>({
    data,
    columns,
    emptyState,
    emptyMessage,
    pagination = false,

    defaultPageSize = 30,
    currentPage = 1,

    isLoading,
    totalPages: externalTotalPages,
    totalItems = 0,
    showSerialNumber = true,

    getRowClassName,
    onRowClick,
    zebra = false,
    rowKey,
}: DataTableProps<T>) => {
    const [pageSize] = useState(defaultPageSize);
    const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(null);

    // Sorting Logic
    const sortedData = React.useMemo(() => {
        let sortableData = [...data];
        if (sortConfig !== null) {
            const { key, direction } = sortConfig;
            const column = columns.find(col => col.accessorKey === key);

            if (column?.sortingFn) {
                sortableData.sort((a, b) => {
                    const result = column.sortingFn!(a, b);
                    return direction === 'asc' ? result : -result;
                });
            } else {
                sortableData.sort((a, b) => {
                    const aValue = a[key as keyof T];
                    const bValue = b[key as keyof T];

                    if (aValue < bValue) {
                        return direction === 'asc' ? -1 : 1;
                    }
                    if (aValue > bValue) {
                        return direction === 'asc' ? 1 : -1;
                    }
                    return 0;
                });
            }
        }
        return sortableData;
    }, [data, sortConfig]);

    // Pagination Logic

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems || data.length);

    const displayData = pagination && !externalTotalPages ? sortedData.slice(startIndex, endIndex) : sortedData;

    // Effective Columns (Handling Serial Number)
    const effectiveColumns: ColumnDef<T>[] = React.useMemo(() => {
        if (!showSerialNumber) return columns;

        const srColumn: ColumnDef<T> = {
            header: "Sr.",
            cell: (_, index) => {
                // return <span className="text-black font-medium text-sm">{startIndex + index + 1}</span>;
                return <span className="text-black font-medium text-sm">{index + 1}</span>;
            },
            className: "w-16 text-center whitespace-nowrap px-2",
            align: 'center'
        };
        return [srColumn, ...columns];
    }, [columns, showSerialNumber]);


    const requestSort = (key: keyof T) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="max-w-full overflow-x-auto border border-[#eee] rounded-md">
            <table className="w-full">
                <thead className="bg-zinc-300 text-left">
                    <tr className="text-sm text-zinc-800">
                        {effectiveColumns?.map((col, index) => (
                            <th
                                key={index}
                                className={cn(
                                    "px-4 py-2 font-medium",
                                    col.sortable && "cursor-pointer hover:bg-primaryx-200 transition-colors select-none whitespace-nowrap",
                                    col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left',
                                    col.className
                                )}
                                onClick={() => col.sortable && col.accessorKey && requestSort(col.accessorKey)}
                            >
                                {col.sortable ? (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className={cn(
                                                    "flex items-center gap-1.5 focus:outline-none whitespace-nowrap",
                                                    (col.align === 'center' || col.className?.includes("center")) && "justify-center",
                                                    (col.align === 'right' || col.className?.includes("right")) && "justify-center"
                                                )} tabIndex={0}>
                                                    {col.header}
                                                    <span className="text-gray-400">
                                                        {sortConfig?.key === col.accessorKey ? (
                                                            sortConfig?.direction === 'asc' ? (
                                                                <ArrowUp className="h-3.5 w-3.5 text-blue-600" />
                                                            ) : (
                                                                <ArrowDown className="h-3.5 w-3.5 text-blue-600" />
                                                            )
                                                        ) : (
                                                            <ArrowUpDown className="h-3.5 w-3.5" />
                                                        )}
                                                    </span>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Sort by {col.header}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ) : (
                                    <div className={cn(
                                        "flex items-center gap-1.5 focus:outline-none whitespace-nowrap",
                                        (col.align === 'center' || col.className?.includes("center")) && "justify-center",
                                        (col.align === 'right' || col.className?.includes("right")) && "justify-center"
                                    )}>
                                        {col.header}
                                    </div>
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan={effectiveColumns.length} className="py-8">
                                <Loader />
                            </td>
                        </tr>
                    ) : (<>
                        {
                            displayData.length > 0 ? (
                                displayData.map((row, rowIndex) => {
                                    const key = getRowKeyFunc(row, rowIndex, rowKey);
                                    const isEven = rowIndex % 2 === 0;

                                    return (
                                        <tr
                                            key={key}
                                            onClick={() => onRowClick?.(row)}
                                            className={cn(
                                                "border-b border-[#eee] transition-colors",
                                                onRowClick && "cursor-pointer hover:bg-slate-50",
                                                zebra && !isEven && "bg-slate-50/50",
                                                getRowClassName?.(row)
                                            )}
                                        >
                                            {effectiveColumns.map((col, colIdx) => (
                                                <td
                                                    key={colIdx}
                                                    className={cn(
                                                        "py-3 px-4",
                                                        col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left',
                                                        col.className
                                                    )}
                                                >
                                                    {col.cell ? (
                                                        col.cell(row, rowIndex)
                                                    ) : (
                                                        <p className="text-black">
                                                            {col.accessorKey ? String(row[col.accessorKey] ?? '') : null}
                                                        </p>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={effectiveColumns.length} className="py-8 text-center text-gray-500">
                                        {emptyState || emptyMessage || "No data found"}
                                    </td>
                                </tr>
                            )
                        }
                    </>)}
                </tbody>
            </table>
        </div>
    );
};

export const MemoizedDataTable = memo(DataTable) as typeof DataTable;
export { MemoizedDataTable as DataTable };
export default MemoizedDataTable;
