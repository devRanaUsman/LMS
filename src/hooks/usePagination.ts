import { useState, useCallback } from "react";

interface UsePaginationProps {
    totalItems: number;
    itemsPerPage: number;
    initialPage?: number;
}

export function usePagination({ totalItems, itemsPerPage, initialPage = 1 }: UsePaginationProps) {
    const [currentPage, setCurrentPage] = useState(initialPage);

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const nextPage = useCallback(() => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    }, [totalPages]);

    const prevPage = useCallback(() => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    }, []);

    const goToPage = useCallback((page: number) => {
        const p = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(p);
    }, [totalPages]);

    const reset = useCallback(() => {
        setCurrentPage(1);
    }, []);

    const currentData = <T>(data: T[]): T[] => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return data.slice(start, end);
    };

    return {
        currentPage,
        totalPages,
        nextPage,
        prevPage,
        goToPage,
        reset,
        currentData
    };
}
