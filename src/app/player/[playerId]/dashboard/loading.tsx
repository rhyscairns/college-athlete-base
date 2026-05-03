export default function PlayerDashboardLoading() {
    return (
        <div className="min-h-screen animate-pulse">
            {/* Header skeleton */}
            <div className="px-6 pt-14 pb-12 text-center" style={{ background: 'var(--ink-0)' }}>
                <div className="mx-auto mb-4 h-6 w-24 rounded-full" style={{ background: 'var(--ink-2)' }} />
                <div className="mx-auto mb-3 h-12 w-72 rounded-lg" style={{ background: 'var(--ink-2)' }} />
                <div className="mx-auto h-4 w-56 rounded" style={{ background: 'var(--ink-2)' }} />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filter bar skeleton */}
                <div className="h-14 rounded-xl mb-8" style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }} />

                {/* Player card grid skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-56 rounded-2xl" style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }} />
                    ))}
                </div>
            </div>
        </div>
    );
}
