import type { Config } from "tailwindcss";

export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/authentication/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/profile/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/dashboard/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Legacy
                background: "var(--background)",
                foreground: "var(--foreground)",
                // Brand
                brand: {
                    50: "var(--brand-50)",
                    200: "var(--brand-200)",
                    500: "var(--brand-500)",
                    600: "var(--brand-600)",
                    700: "var(--brand-700)",
                },
                accent: {
                    500: "var(--accent-500)",
                },
                // Light surfaces
                surface: {
                    0: "var(--surface-0)",
                    1: "var(--surface-1)",
                    2: "var(--surface-2)",
                },
                // Dark surfaces
                ink: {
                    0: "var(--ink-0)",
                    1: "var(--ink-1)",
                    2: "var(--ink-2)",
                    3: "var(--ink-3)",
                },
                // Text
                "text-hi": "var(--text-hi)",
                "text-mid": "var(--text-mid)",
                "text-lo": "var(--text-lo)",
                // Status
                "status-success": "var(--status-success)",
                "status-warning": "var(--status-warning)",
                "status-danger": "var(--status-danger)",
            },
            transitionTimingFunction: {
                out: "var(--e-out)",
                in: "var(--e-in)",
                spring: "var(--e-spring)",
                glide: "var(--e-glide)",
            },
            transitionDuration: {
                instant: "var(--d-instant)",
                fast: "var(--d-fast)",
                base: "var(--d-base)",
                slow: "var(--d-slow)",
                deliberate: "var(--d-deliberate)",
            },
            fontFamily: {
                display: ["Geist", "Inter Tight", "sans-serif"],
                body: ["Inter", "sans-serif"],
                mono: ["Geist Mono", "monospace"],
            },
            keyframes: {
                "fade-in": {
                    "0%": { opacity: "0", transform: "translateY(-10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
                "spring-pop": {
                    "0%": { transform: "scale(1)" },
                    "40%": { transform: "scale(1.35)" },
                    "70%": { transform: "scale(0.9)" },
                    "100%": { transform: "scale(1)" },
                },
                "breath": {
                    "0%, 100%": { opacity: "0.3", transform: "scale(0.85)" },
                    "50%": { opacity: "1", transform: "scale(1)" },
                },
                "progress-bar": {
                    "0%": { width: "0%", opacity: "1" },
                    "80%": { width: "90%", opacity: "1" },
                    "100%": { width: "100%", opacity: "0" },
                },
            },
            animation: {
                "fade-in": "fade-in 0.3s ease-out",
                shimmer: "shimmer 1.6s linear infinite",
                "spring-pop": "spring-pop var(--d-base) var(--e-spring) forwards",
                breath: "breath 1.2s var(--e-glide) infinite",
                "progress-bar": "progress-bar var(--d-slow) var(--e-out) forwards",
            },
        },
    },
    plugins: [],
} satisfies Config;
