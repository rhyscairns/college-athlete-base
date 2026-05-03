import { useState, useEffect, useRef } from 'react';

interface UseCountUpOptions {
    /** Target number to count up to */
    target: number;
    /** Duration of the animation in ms (default: var(--d-slow) = 400ms) */
    duration?: number;
    /** Start value (default: 0) */
    from?: number;
    /** Number of decimal places (default: 0) */
    decimals?: number;
    /** Only start when element enters viewport (default: true) */
    triggerOnView?: boolean;
}

/**
 * useCountUp — animates a number from `from` to `target` when the ref
 * element enters the viewport. Respects prefers-reduced-motion.
 *
 * @example
 * ```tsx
 * const { ref, value } = useCountUp({ target: 3.8, decimals: 1 });
 * return <span ref={ref}>{value}</span>;
 * ```
 */
export function useCountUp({
    target,
    duration = 400,
    from = 0,
    decimals = 0,
    triggerOnView = true,
}: UseCountUpOptions) {
    const [value, setValue] = useState(from);
    const ref = useRef<HTMLElement>(null);
    const rafRef = useRef<number>(0);
    const startedRef = useRef(false);

    useEffect(() => {
        // Respect reduced motion — snap to final value immediately
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) {
            setValue(target);
            return;
        }

        const run = () => {
            if (startedRef.current) return;
            startedRef.current = true;

            const startTime = performance.now();
            const range = target - from;

            const tick = (now: number) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // ease-out quad
                const eased = 1 - Math.pow(1 - progress, 2);
                const current = from + range * eased;
                setValue(parseFloat(current.toFixed(decimals)));

                if (progress < 1) {
                    rafRef.current = requestAnimationFrame(tick);
                } else {
                    setValue(target);
                }
            };

            rafRef.current = requestAnimationFrame(tick);
        };

        if (!triggerOnView) {
            run();
            return () => cancelAnimationFrame(rafRef.current);
        }

        // Intersection Observer — trigger when element enters viewport
        const el = ref.current;
        if (!el) {
            run();
            return () => cancelAnimationFrame(rafRef.current);
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    run();
                    observer.disconnect();
                }
            },
            { threshold: 0.2 }
        );

        observer.observe(el);

        return () => {
            observer.disconnect();
            cancelAnimationFrame(rafRef.current);
        };
    }, [target, from, duration, decimals, triggerOnView]);

    return { ref, value };
}
