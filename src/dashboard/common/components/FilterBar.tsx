'use client';

import React from 'react';

export interface FilterBarProps {
    sports: string[];
    positions: string[];
    selectedSport: string;
    selectedPosition: string;
    onSportChange: (sport: string) => void;
    onPositionChange: (position: string) => void;
    onSearch: () => void;
    isLoading?: boolean;
    selectedStatus: string;
    onStatusChange: (status: string) => void;
}

const selectStyle: React.CSSProperties = {
    background: 'var(--ink-2)',
    color: 'var(--text-hi)',
    border: '1px solid var(--ink-3)',
    borderRadius: '0.5rem',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    width: '100%',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23718096' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.75rem center',
    paddingRight: '2.25rem',
    cursor: 'pointer',
    transition: `border-color var(--d-fast) var(--e-glide)`,
    minHeight: '44px',
};

export const FilterBar: React.FC<FilterBarProps> = ({
    sports,
    positions,
    selectedSport,
    selectedPosition,
    onSportChange,
    onPositionChange,
    onSearch,
    isLoading = false,
    selectedStatus,
    onStatusChange,
}) => {
    return (
        <div
            className="rounded-xl mb-6 px-4 py-3"
            role="search"
            aria-label="Player filter controls"
            data-testid="filter-bar"
            style={{
                background: 'var(--ink-1)',
                border: '1px solid var(--ink-3)',
            }}
        >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Label */}
                <span
                    className="text-sm font-medium whitespace-nowrap hidden sm:inline"
                    id="filter-label"
                    aria-hidden="true"
                    style={{ color: 'var(--text-lo)' }}
                >
                    Filter by:
                </span>

                {/* Dropdowns + button */}
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    {/* Sport */}
                    <div className="flex-1">
                        <label htmlFor="sport-filter" className="sr-only">Filter by sport</label>
                        <select
                            id="sport-filter"
                            value={selectedSport}
                            onChange={e => onSportChange(e.target.value)}
                            disabled={isLoading}
                            aria-label="Filter by sport"
                            style={{
                                ...selectStyle,
                                opacity: isLoading ? 0.5 : 1,
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {sports.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    {/* Position */}
                    <div className="flex-1">
                        <label htmlFor="position-filter" className="sr-only">Filter by position</label>
                        <select
                            id="position-filter"
                            value={selectedPosition}
                            onChange={e => onPositionChange(e.target.value)}
                            disabled={isLoading}
                            aria-label="Filter by position"
                            style={{
                                ...selectStyle,
                                opacity: isLoading ? 0.5 : 1,
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {positions.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    {/* Status */}
                    <div className="flex-1">
                        <label htmlFor="status-filter" className="sr-only">Filter by status</label>
                        <select
                            id="status-filter"
                            value={selectedStatus}
                            onChange={e => onStatusChange(e.target.value)}
                            disabled={isLoading}
                            aria-label="Filter by status"
                            style={{
                                ...selectStyle,
                                opacity: isLoading ? 0.5 : 1,
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                            }}
                        >
                            <option value="All Statuses">All Statuses</option>
                            <option value="Available">Available</option>
                            <option value="Committed">Committed</option>
                        </select>
                    </div>

                    {/* Search button */}
                    <button
                        onClick={onSearch}
                        disabled={isLoading}
                        aria-label="Apply filters and search"
                        className="flex items-center justify-center gap-2 px-5 rounded-lg font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            background: 'var(--brand-500)',
                            color: 'var(--ink-0)',
                            minHeight: '44px',
                            transition: `background var(--d-fast) var(--e-glide)`,
                        }}
                        onMouseEnter={e => !isLoading && (e.currentTarget.style.background = 'var(--brand-600)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'var(--brand-500)')}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span>Search</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
