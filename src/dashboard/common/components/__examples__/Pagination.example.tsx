'use client';

import React, { useState } from 'react';
import { Pagination } from '../Pagination';

/**
 * Example usage of the Pagination component
 * This file demonstrates different pagination scenarios
 */

export default function PaginationExample() {
    const [currentPage1, setCurrentPage1] = useState(1);
    const [currentPage2, setCurrentPage2] = useState(5);
    const [currentPage3, setCurrentPage3] = useState(1);

    return (
        <div className="min-h-screen bg-slate-900 p-8 space-y-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">
                    Pagination Component Examples
                </h1>

                {/* Example 1: Small pagination (5 pages) */}
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            Small Pagination (5 pages)
                        </h2>
                        <p className="text-slate-400 mb-4">
                            Current page: {currentPage1}
                        </p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-6">
                        <Pagination
                            currentPage={currentPage1}
                            totalPages={5}
                            onPageChange={setCurrentPage1}
                        />
                    </div>
                </div>

                {/* Example 2: Large pagination (20 pages) */}
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            Large Pagination (20 pages)
                        </h2>
                        <p className="text-slate-400 mb-4">
                            Current page: {currentPage2}
                        </p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-6">
                        <Pagination
                            currentPage={currentPage2}
                            totalPages={20}
                            onPageChange={setCurrentPage2}
                            maxVisiblePages={5}
                        />
                    </div>
                </div>

                {/* Example 3: Mobile-friendly (3 visible pages) */}
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            Mobile-Friendly (3 visible pages max)
                        </h2>
                        <p className="text-slate-400 mb-4">
                            Current page: {currentPage3}
                        </p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-6">
                        <Pagination
                            currentPage={currentPage3}
                            totalPages={15}
                            onPageChange={setCurrentPage3}
                            maxVisiblePages={3}
                        />
                    </div>
                </div>

                {/* Example 4: Edge cases */}
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            Edge Cases
                        </h2>
                    </div>

                    <div className="bg-slate-800/50 rounded-lg p-6">
                        <p className="text-slate-300 mb-4">2 pages total:</p>
                        <Pagination
                            currentPage={1}
                            totalPages={2}
                            onPageChange={() => { }}
                        />
                    </div>

                    <div className="bg-slate-800/50 rounded-lg p-6">
                        <p className="text-slate-300 mb-4">1 page total (should not render):</p>
                        <Pagination
                            currentPage={1}
                            totalPages={1}
                            onPageChange={() => { }}
                        />
                        <p className="text-slate-400 text-sm mt-2">
                            (No pagination shown - only 1 page)
                        </p>
                    </div>

                    <div className="bg-slate-800/50 rounded-lg p-6">
                        <p className="text-slate-300 mb-4">Very large dataset (100 pages):</p>
                        <Pagination
                            currentPage={50}
                            totalPages={100}
                            onPageChange={() => { }}
                            maxVisiblePages={5}
                        />
                    </div>
                </div>

                {/* Features list */}
                <div className="bg-slate-800/50 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        Features
                    </h2>
                    <ul className="space-y-2 text-slate-300">
                        <li>✓ Previous/Next arrow buttons</li>
                        <li>✓ Numbered page buttons</li>
                        <li>✓ Disabled state on first/last page</li>
                        <li>✓ Current page highlighted in blue</li>
                        <li>✓ Ellipsis for skipped pages</li>
                        <li>✓ Configurable max visible pages</li>
                        <li>✓ Responsive design (mobile/desktop)</li>
                        <li>✓ Accessibility features (ARIA labels)</li>
                        <li>✓ Dark theme styling</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
