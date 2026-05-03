const COLUMN_WIDTHS = [120, 100, 90, 80, 140, 110];
const SKELETON_ROW_COUNT = 5;

export default function PlayerMessagesLoading() {
    return (
        <div className="min-h-screen">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header skeleton — mirrors DashboardHeader */}
                <div
                    className="relative overflow-hidden text-center px-6 pt-12 pb-10 mb-8 rounded-2xl animate-pulse"
                    style={{ background: 'var(--ink-1)' }}
                    aria-hidden="true"
                >
                    <div className="mx-auto mb-5 h-6 w-24 rounded-full" style={{ background: 'var(--ink-3)' }} />
                    <div className="mx-auto mb-3 h-10 w-44 rounded-lg" style={{ background: 'var(--ink-3)' }} />
                    <div className="mx-auto h-4 w-56 rounded" style={{ background: 'var(--ink-2)' }} />
                </div>

                {/* Table skeleton */}
                <div
                    role="status"
                    aria-label="Loading messages"
                    aria-busy="true"
                    className="rounded-xl overflow-hidden"
                    style={{ border: '1px solid var(--ink-3)' }}
                >
                    <div className="px-4 py-3 flex gap-6" style={{ background: 'var(--ink-2)' }}>
                        {COLUMN_WIDTHS.map((w, i) => (
                            <div
                                key={i}
                                className="h-3 rounded animate-pulse"
                                style={{ width: w, background: 'var(--ink-3)' }}
                            />
                        ))}
                    </div>
                    {Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
                        <div
                            key={i}
                            className="px-4 py-4 flex gap-6 items-center"
                            style={{
                                borderTop: '1px solid var(--ink-2)',
                                background: i % 2 === 0 ? 'var(--ink-1)' : 'transparent',
                            }}
                        >
                            {COLUMN_WIDTHS.map((w, j) => (
                                <div
                                    key={j}
                                    className="h-3 rounded animate-pulse"
                                    style={{ width: w, background: 'var(--ink-2)' }}
                                />
                            ))}
                        </div>
                    ))}
                    <span className="sr-only">Loading your messages...</span>
                </div>
            </div>
        </div>
    );
}
