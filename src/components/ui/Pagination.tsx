import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    startIndex: number;
    endIndex: number;
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
    // ... existing implementation
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const delta = 2;
    const range: (number | 'ellipsis')[] = [];
    let prev = 0;

    for (let i = 1; i <= total; i++) {
        if (
            i === 1 || // First page
            i === total || // Last page
            (i >= current - delta && i <= current + delta) // Current ± delta
        ) {
            if (prev && i - prev > 1) {
                range.push('ellipsis');
            }
            range.push(i);
            prev = i;
        }
    }
    return range;
}

export function Pagination({
    currentPage,
    totalPages,
    totalItems,
    onPageChange,
    startIndex,
    endIndex,
}: PaginationProps) {
    const pageNumbers = getPageNumbers(currentPage, totalPages);

    return (
        <div className="flex items-center w-full justify-between px-4 py-3 bg-white border-t border-slate-200">
            {/* Left: Item count */}
            <div className="flex items-center  gap-2 text-sm text-slate-600">
                <span>
                    Showing {startIndex + 1}–{Math.min(endIndex, totalItems)} of {totalItems}
                </span>
            </div>

            {/* Right: Page navigation */}
            <div className="flex items-center gap-1">
                {/* Previous button */}
                <Button
                    variant="outline"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 px-3 flex items-center gap-1 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                    tooltip="Previous page"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                </Button>

                {/* Page numbers */}
                <div className="flex items-center gap-1 mx-2">
                    {pageNumbers.map((page, idx) => {
                        if (page === 'ellipsis') {
                            return (
                                <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">
                                    ...
                                </span>
                            );
                        }

                        return (
                            <Button
                                key={page}
                                variant="outline"
                                onClick={() => onPageChange(page)}
                                className={`h-8 min-w-8 p-0 px-2 text-sm font-medium rounded-lg transition-colors ${currentPage === page
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-blue-600'
                                    : 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-50'
                                    }`}
                                tooltip={`Go to page ${page}`}
                            >
                                {page}
                            </Button>
                        );
                    })}
                </div>

                {/* Next button */}
                <Button
                    variant="outline"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 px-3 flex items-center gap-1 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                    tooltip="Next page"
                >
                    Next
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
