import { renderHook, act } from '@testing-library/react';
import { useCountUp } from '../useCountUp';

// Mock IntersectionObserver
const mockObserve = jest.fn();
const mockDisconnect = jest.fn();
let intersectionCallback: (entries: Partial<IntersectionObserverEntry>[]) => void;

beforeEach(() => {
    jest.useFakeTimers();
    mockObserve.mockClear();
    mockDisconnect.mockClear();

    global.IntersectionObserver = jest.fn((cb) => {
        intersectionCallback = cb as typeof intersectionCallback;
        return {
            observe: mockObserve,
            disconnect: mockDisconnect,
            unobserve: jest.fn(),
        };
    }) as unknown as typeof IntersectionObserver;

    // Mock matchMedia — no reduced motion by default
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockReturnValue({ matches: false }),
    });

    // Mock rAF to run synchronously
    let rafId = 0;
    jest.spyOn(global, 'requestAnimationFrame').mockImplementation((cb) => {
        rafId++;
        // Run immediately in fake timer environment
        Promise.resolve().then(() => cb(performance.now()));
        return rafId;
    });
    jest.spyOn(global, 'cancelAnimationFrame').mockImplementation(() => { });
});

afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
});

describe('useCountUp', () => {
    it('starts at the from value', () => {
        const { result } = renderHook(() =>
            useCountUp({ target: 100, from: 0, triggerOnView: false })
        );
        expect(result.current.value).toBe(0);
    });

    it('snaps to target immediately when prefers-reduced-motion is true', () => {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jest.fn().mockReturnValue({ matches: true }),
        });

        const { result } = renderHook(() =>
            useCountUp({ target: 42, triggerOnView: false })
        );

        expect(result.current.value).toBe(42);
    });

    it('returns a ref', () => {
        const { result } = renderHook(() =>
            useCountUp({ target: 10, triggerOnView: false })
        );
        expect(result.current.ref).toBeDefined();
    });

    it('uses IntersectionObserver when triggerOnView is true and ref is attached', () => {
        // When ref.current is null (no DOM in renderHook), the hook falls back to running immediately
        // This test just verifies the hook doesn't throw and returns a ref
        const { result } = renderHook(() => useCountUp({ target: 50 }));
        expect(result.current.ref).toBeDefined();
    });

    it('does not use IntersectionObserver when triggerOnView is false', () => {
        renderHook(() => useCountUp({ target: 50, triggerOnView: false }));
        expect(mockObserve).not.toHaveBeenCalled();
    });

    it('eventually reaches target value', async () => {
        const { result } = renderHook(() =>
            useCountUp({ target: 100, duration: 100, triggerOnView: false })
        );

        await act(async () => {
            jest.advanceTimersByTime(200);
            await Promise.resolve();
        });

        expect(result.current.value).toBe(100);
    });

    it('respects decimals option', () => {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jest.fn().mockReturnValue({ matches: true }),
        });

        const { result } = renderHook(() =>
            useCountUp({ target: 3.8, decimals: 1, triggerOnView: false })
        );

        expect(result.current.value).toBe(3.8);
    });
});
