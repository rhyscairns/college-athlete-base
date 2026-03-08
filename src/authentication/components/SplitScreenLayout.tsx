'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface SplitScreenLayoutProps {
    children: React.ReactNode;
    showBackButton?: boolean;
    backHref?: string;
    heroImage?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    testimonial?: {
        quote: string;
        author: string;
        role: string;
        avatar?: string;
    };
    sportTags?: string[];
}

export function SplitScreenLayout({
    children,
    showBackButton = false,
    backHref = '/',
    heroImage = 'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?q=80&w=2069',
    heroTitle = 'Your future starts on the field.',
    heroSubtitle = 'Connect with over 2,500 college coaches and showcase your talent on the nation\'s premier recruitment platform.',
    testimonial,
    sportTags = ['Football', 'Basketball', 'Track & Field'],
}: SplitScreenLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 bg-white flex flex-col">
                {/* Header */}
                <div className="p-6 sm:p-8">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-gray-900">COLLEGE ATHLETE BASE</span>
                        </Link>
                    </div>
                </div>

                {/* Form Content */}
                <div className="flex-1 flex items-center justify-center px-6 sm:px-8 py-8">
                    <div className="w-full max-w-md">
                        {children}
                    </div>
                </div>
            </div>

            {/* Right Side - Hero */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <Image
                        src={heroImage}
                        alt="Athlete in action"
                        fill
                        className="object-cover opacity-60"
                        sizes="50vw"
                        priority={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
                    {/* Hero Text */}
                    <div className="space-y-6 mt-20">
                        <h1 className="text-5xl font-bold leading-tight">
                            {heroTitle}
                        </h1>
                        <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                            {heroSubtitle}
                        </p>
                    </div>

                    {/* Testimonial */}
                    {testimonial && (
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                            <div className="flex items-start gap-4">
                                {testimonial.avatar && (
                                    <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                                        <Image
                                            src={testimonial.avatar}
                                            alt={testimonial.author}
                                            fill
                                            className="object-cover"
                                            sizes="48px"
                                        />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <div className="flex gap-1 mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <p className="text-white font-medium mb-2">"{testimonial.quote}"</p>
                                    <p className="text-sm text-gray-300">
                                        {testimonial.author} · {testimonial.role}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
