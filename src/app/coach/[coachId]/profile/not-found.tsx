import Link from 'next/link';

export default function CoachProfileNotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-8">
                    <h1 className="text-6xl font-black text-white mb-4">404</h1>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Coach Profile Not Found
                    </h2>
                    <p className="text-slate-300">
                        The coach profile you&apos;re looking for doesn&apos;t exist or has been removed.
                    </p>
                </div>

                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                    </svg>
                    Go Home
                </Link>
            </div>
        </div>
    );
}
