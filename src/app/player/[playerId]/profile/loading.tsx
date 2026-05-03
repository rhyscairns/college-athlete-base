export default function PlayerProfileLoading() {
    return (
        <div className="relative min-h-screen animate-pulse">
            <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
                <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }}>
                    <div className="h-48" style={{ background: 'var(--ink-2)' }} />
                    <div className="p-8 space-y-3">
                        <div className="h-8 w-56 rounded-lg" style={{ background: 'var(--ink-2)' }} />
                        <div className="h-4 w-40 rounded" style={{ background: 'var(--ink-3)' }} />
                        <div className="h-4 w-72 rounded" style={{ background: 'var(--ink-3)' }} />
                    </div>
                </div>
                <div className="h-40 rounded-2xl" style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }} />
                <div className="h-40 rounded-2xl" style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }} />
            </div>
        </div>
    );
}
