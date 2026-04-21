const COLUMN_WIDTHS = [120, 70, 80, 50, 110, 140, 90];
const SKELETON_ROW_COUNT = 5;

export default function ProspectsLoading() {
    return (
        <div className="min-h-screen bg-slate-100">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Blue gradient header skeleton */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-8 sm:px-8 sm:py-10">
                        <div className="h-8 w-48 bg-white/30 rounded-lg animate-pulse mb-2" />
                        <div className="h-4 w-64 bg-white/20 rounded animate-pulse" />
                    </div>

                    {/* Table skeleton */}
                    <div className="p-6 sm:p-8">
                        <div
                            role="status"
                            aria-label="Loading prospects"
                            aria-busy="true"
                            className="rounded-xl border border-gray-200 overflow-hidden"
                        >
                            <div className="bg-blue-50 px-4 py-3 flex gap-6">
                                {COLUMN_WIDTHS.map((w, i) => (
                                    <div key={i} className="h-3 bg-blue-200 rounded animate-pulse" style={{ width: w }} />
                                ))}
                            </div>
                            {Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
                                <div key={i} className="border-t border-gray-100 px-4 py-4 flex gap-6 items-center">
                                    {COLUMN_WIDTHS.map((w, j) => (
                                        <div key={j} className="h-3 bg-gray-100 rounded animate-pulse" style={{ width: w }} />
                                    ))}
                                </div>
                            ))}
                            <span className="sr-only">Loading your prospects list...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
