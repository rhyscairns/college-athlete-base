export function ProfileLoadingSkeleton({ showSideNav = false }: { showSideNav?: boolean }) {
    return (
        <div className="min-h-screen" aria-busy="true">
            <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                Loading player profile, please wait...
            </div>

            <main className={showSideNav ? 'lg:ml-48' : undefined}>
                {/* Hero skeleton */}
                <div
                    className="relative h-80 animate-pulse"
                    style={{
                        background: `radial-gradient(ellipse 80% 60% at 50% 0%,
                            oklch(68% 0.22 150 / 0.12) 0%, transparent 70%),
                            var(--ink-1)`,
                    }}
                    aria-hidden="true"
                >
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div
                                className="w-28 h-28 rounded-full mx-auto mb-4"
                                style={{ background: 'var(--ink-3)' }}
                            />
                            <div
                                className="h-7 w-56 rounded-lg mx-auto mb-3"
                                style={{ background: 'var(--ink-3)' }}
                            />
                            <div
                                className="h-5 w-40 rounded mx-auto"
                                style={{ background: 'var(--ink-2)' }}
                            />
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                    {/* Stats card skeleton */}
                    <div
                        className="rounded-2xl p-6 animate-pulse"
                        style={{ background: 'var(--ink-1)' }}
                        aria-hidden="true"
                    >
                        <div className="h-5 w-40 rounded mb-5" style={{ background: 'var(--ink-3)' }} />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="space-y-2">
                                    <div className="h-3 w-16 rounded" style={{ background: 'var(--ink-2)' }} />
                                    <div className="h-7 w-12 rounded" style={{ background: 'var(--ink-3)' }} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section card skeletons */}
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="rounded-2xl p-6 animate-pulse"
                            style={{ background: 'var(--ink-1)' }}
                            aria-hidden="true"
                        >
                            <div className="h-5 w-44 rounded mb-5" style={{ background: 'var(--ink-3)' }} />
                            <div className="space-y-3">
                                <div className="h-3 w-full rounded" style={{ background: 'var(--ink-2)' }} />
                                <div className="h-3 w-5/6 rounded" style={{ background: 'var(--ink-2)' }} />
                                <div className="h-3 w-4/6 rounded" style={{ background: 'var(--ink-2)' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
