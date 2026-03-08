'use client';

import React from 'react';

export interface DashboardHeaderProps {
    title: string;
    subtitle: string;
}

export const DashboardHeader = React.memo(function DashboardHeader({
    title,
    subtitle,
}: DashboardHeaderProps) {
    return (
        <header
            className="bg-white border-b border-gray-200 px-6 py-8 sm:px-8 sm:py-12"
            role="banner"
        >
            <div className="max-w-7xl mx-auto">
                <h1
                    className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2"
                    id="dashboard-title"
                >
                    {title}
                </h1>
                <p
                    className="text-base sm:text-lg text-gray-600"
                    id="dashboard-subtitle"
                >
                    {subtitle}
                </p>
            </div>
        </header>
    );
});
