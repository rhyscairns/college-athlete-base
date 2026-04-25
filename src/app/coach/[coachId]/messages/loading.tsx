const COLUMN_WIDTHS = [120, 80, 90, 140, 110];
const SKELETON_ROW_COUNT = 5;

export default function CoachMessagesLoading() {
    return (
        <div className="min-h-screen bg-slate-100">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-8 sm:px-8 sm:py-10">
                        <div className="h-8 w-36 bg-white/30 rounded-lg animate-pulse mb-2" />
                        <div className="h-4 w-56 bg-white/20 rounded animate-pulse" />
                    </div>

                    <div className="p-6 sm:p-8">
                        <div
                            role="status"
                            aria-label="Loading messages"
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
                            <span className="sr-only">Loading your messages...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
