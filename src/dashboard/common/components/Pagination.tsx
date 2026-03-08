'use client';

import React from 'react';

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    maxVisiblePages?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    maxVisiblePages = 5,
}) => {
    // Don't render if there's only one page or no pages
    if (totalPages <= 1) {
        return null;
    }

    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;

    // Calculate which page numbers to show
    const getPageNumbers = (): (number | 'ellipsis')[] => {
        const pages: (number | 'ellipsis')[] = [];

        // Always show first page
        pages.push(1);

        // Calculate range around current page
        const halfVisible = Math.floor(maxVisiblePages / 2);
        let startPage = Math.max(2, currentPage - halfVisible);
        let endPage = Math.min(totalPages - 1, currentPage + halfVisible);

        // Adjust if we're near the start or end
        if (currentPage <= halfVisible + 1) {
            endPage = Math.min(totalPages - 1, maxVisiblePages - 1);
        }
        if (currentPage >= totalPages - halfVisible) {
            startPage = Math.max(2, totalPages - maxVisiblePages + 2);
        }

        // Add ellipsis after first page if needed
        if (startPage > 2) {
            pages.push('ellipsis');
        }

        // Add middle pages
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        // Add ellipsis before last page if needed
        if (endPage < totalPages - 1) {
            pages.push('ellipsis');
        }

        // Always show last page if there's more than one page
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    const handlePrevious = () => {
        if (!isFirstPage) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (!isLastPage) {
            onPageChange(currentPage + 1);
        }
    };

    const handlePageClick = (page: number) => {
        if (page !== currentPage) {
            onPageChange(page);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            action();
        }
    };

    return (
        <nav
            className="flex items-center justify-center gap-2 py-8"
            role="navigation"
            aria-label="Pagination navigation"
        >
            {/* Previous Button */}
            <button
                onClick={handlePrevious}
                onKeyDown={(e) => handleKeyDown(e, handlePrevious)}
                disabled={isFirstPage}
                aria-label="Go to previous page"
                aria-disabled={isFirstPage}
                className={`
                    flex items-center justify-center
                    w-10 h-10 rounded-lg
                    transition-colors
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900
                    ${isFirstPage
                        ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed'
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }
                `}
            >
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
            </button>

            {/* Page Numbers */}
            <div
                className="flex items-center gap-1 sm:gap-2"
                role="list"
                aria-label="Page numbers"
            >
                {pageNumbers.map((page, index) => {
                    if (page === 'ellipsis') {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                className="px-2 text-slate-400"
                                aria-hidden="true"
                            >
                                ...
                            </span>
                        );
                    }

                    const isCurrentPage = page === currentPage;

                    return (
                        <button
                            key={page}
                            onClick={() => handlePageClick(page)}
                            onKeyDown={(e) => handleKeyDown(e, () => handlePageClick(page))}
                            aria-label={`${isCurrentPage ? 'Current page, ' : ''}Page ${page}`}
                            aria-current={isCurrentPage ? 'page' : undefined}
                            className={`
                                flex items-center justify-center
                                w-10 h-10 rounded-lg
                                transition-colors
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900
                                ${isCurrentPage
                                    ? 'bg-blue-500 text-white font-semibold'
                                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white'
                                }
                            `}
                        >
                            {page}
                        </button>
                    );
                })}
            </div>

            {/* Next Button */}
            <button
                onClick={handleNext}
                onKeyDown={(e) => handleKeyDown(e, handleNext)}
                disabled={isLastPage}
                aria-label="Go to next page"
                aria-disabled={isLastPage}
                className={`
                    flex items-center justify-center
                    w-10 h-10 rounded-lg
                    transition-colors
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900
                    ${isLastPage
                        ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed'
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }
                `}
            >
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                    />
                </svg>
            </button>
        </nav>
    );
};
