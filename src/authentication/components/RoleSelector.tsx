'use client';

import type { UserRole } from '../types';

export interface RoleSelectorProps {
    onSelectRole: (role: UserRole) => void;
}

export function RoleSelector({ onSelectRole }: RoleSelectorProps) {
    return (
        <div className="w-full max-w-2xl mx-auto p-8 sm:p-12 bg-white/90 rounded-3xl shadow-2xl border border-white/50">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">
                Choose Your Role
            </h2>
            <p className="text-gray-600 text-center mb-8">
                Select how you want to register
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <button
                    onClick={() => onSelectRole('player')}
                    className="group relative p-12 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-2xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-blue-300 overflow-hidden"
                    aria-label="Register as Player"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-blue-600/0 group-hover:from-blue-400/10 group-hover:to-blue-600/10 transition-all duration-300" />
                    <div className="relative flex flex-col items-center">
                        <div className="w-20 h-20 mb-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 shadow-lg group-hover:shadow-2xl">
                            P
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
                            Player
                        </h3>
                    </div>
                </button>

                <button
                    onClick={() => onSelectRole('coach')}
                    className="group relative p-12 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 rounded-2xl border-2 border-red-200 hover:border-red-400 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-red-300 overflow-hidden"
                    aria-label="Register as Coach"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-red-400/0 to-red-600/0 group-hover:from-red-400/10 group-hover:to-red-600/10 transition-all duration-300" />
                    <div className="relative flex flex-col items-center">
                        <div className="w-20 h-20 mb-6 bg-red-500 rounded-full flex items-center justify-center text-white text-3xl font-bold group-hover:scale-125 group-hover:-rotate-12 transition-all duration-300 shadow-lg group-hover:shadow-2xl">
                            C
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
                            Coach
                        </h3>
                    </div>
                </button>
            </div>
        </div>
    );
}
