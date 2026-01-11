import { render, screen } from '@testing-library/react';
import CoachLayout from '@/app/coach/layout';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    usePathname: jest.fn(() => '/coach/dashboard/coach-123'),
}));

/**
 * Visual Regression Tests for Coach Layout
 * Tests background image rendering, overlay, and responsive behavior
 */
describe('CoachLayout - Visual Regression Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Background Image Rendering', () => {
        it('applies background image with correct URL', () => {
            const { container } = render(
                <CoachLayout>
                    <div>Test Content</div>
                </CoachLayout>
            );

            const backgroundDiv = container.firstChild as HTMLElement;
            const style = backgroundDiv.style;

            expect(style.backgroundImage).toContain('https://images.unsplash.com/photo-1459865264687-595d652de67e');
        });

        it('applies correct background-size property', () => {
            const { container } = render(
                <CoachLayout>
                    <div>Test Content</div>
                </CoachLayout>
            );

            const backgroundDiv = container.firstChild as HTMLElement;
            expect(backgroundDiv.style.backgroundSize).toBe('cover');
        });

        it('applies correct background-position property', () => {
            const { container } = render(
                <CoachLayout>
                    <div>Test Content</div>
                </CoachLayout>
            );

            const backgroundDiv = container.firstChild as HTMLElement;
            expect(backgroundDiv.style.backgroundPosition).toBe('center');
        });

        it('applies fixed background attachment for parallax effect', () => {
            const { container } = render(
                <CoachLayout>
                    <div>Test Content</div>
                </CoachLayout>
            );

            const backgroundDiv = container.firstChild as HTMLElement;
            expect(backgroundDiv.style.backgroundAttachment).toBe('fixed');
        });

        it('has fallback background color', () => {
            const { container } = render(
                <CoachLayout>
                    <div>Test Content</div>
                </CoachLayout>
            );

            const backgroundDiv = container.firstChild as HTMLElement;
            const computedStyle = window.getComputedStyle(backgroundDiv);

            // Should have bg-gray-900 class as fallback
            expect(backgroundDiv.className).toContain('bg-gray-900');
        });

        it('ensures full viewport height', () => {
            const { container } = render(
                <CoachLayout>
                    <div>Test Content</div>
                </CoachLayout>
            );

            const backgroundDiv = container.firstChild as HTMLElement;
            expect(backgroundDiv.className).toContain('min-h-screen');
        });
    });

    describe('Overlay for Content Readability', () => {
        it('applies semi-transparent overlay', () => {
            const { container } = render(
                <CoachLayout>
                    <div>Test Content</div>
                </CoachLayout>
            );

            const overlayDiv = container.querySelector('.bg-black\\/20');
            expect(overlayDiv).toBeInTheDocument();
        });

        it('overlay covers full viewport height', () => {
            const { container } = render(
                <CoachLayout>
                    <div>Test Content</div>
                </CoachLayout>
            );

            const overlayDiv = container.querySelector('.bg-black\\/20');
            expect(overlayDiv?.className).toContain('min-h-screen');
        });

        it('overlay contains navbar and content', () => {
            const { container } = render(
                <CoachLayout>
                    <div data-testid="test-content">Test Content</div>
                </CoachLayout>
            );

            const overlayDiv = container.querySelector('.bg-black\\/20');
            const navbar = overlayDiv?.querySelector('nav');
            const content = screen.getByTestId('test-content');

            expect(navbar).toBeInTheDocument();
            expect(content).toBeInTheDocument();
        });
    });

    describe('Responsive Background Behavior', () => {
        it('maintains background image on mobile viewport', () => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 375,
            });

            const { container } = render(
                <CoachLayout>
                    <div>Test Content</div>
                </CoachLayout>
            );

            const backgroundDiv = container.firstChild as HTMLElement;
            expect(backgroundDiv.style.backgroundImage).toContain('unsplash.com');
            expect(backgroundDiv.style.backgroundSize).toBe('cover');
        });

        it('maintains background image on tablet viewport', () => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 768,
            });

            const { container } = render(
                <CoachLayout>
                    <div>Test Content</div>
                </CoachLayout>
            );

            const backgroundDiv = container.firstChild as HTMLElement;
            expect(backgroundDiv.style.backgroundImage).toContain('unsplash.com');
            expect(backgroundDiv.style.backgroundSize).toBe('cover');
        });

        it('maintains background image on desktop viewport', () => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 1920,
            });

            const { container } = render(
                <CoachLayout>
                    <div>Test Content</div>
                </CoachLayout>
            );

            const backgroundDiv = container.firstChild as HTMLElement;
            expect(backgroundDiv.style.backgroundImage).toContain('unsplash.com');
            expect(backgroundDiv.style.backgroundSize).toBe('cover');
        });

        it('parallax effect (fixed attachment) works on desktop', () => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 1920,
            });

            const { container } = render(
                <CoachLayout>
                    <div>Test Content</div>
                </CoachLayout>
            );

            const backgroundDiv = container.firstChild as HTMLElement;
            expect(backgroundDiv.style.backgroundAttachment).toBe('fixed');
        });
    });

    describe('Layout Structure and Content Area', () => {
        it('renders children in main content area', () => {
            render(
                <CoachLayout>
                    <div data-testid="child-content">Child Content</div>
                </CoachLayout>
            );

            const childContent = screen.getByTestId('child-content');
            expect(childContent).toBeInTheDocument();
            expect(childContent).toHaveTextContent('Child Content');
        });

        it('wraps children in main element', () => {
            const { container } = render(
                <CoachLayout>
                    <div data-testid="child-content">Child Content</div>
                </CoachLayout>
            );

            const main = container.querySelector('main');
            expect(main).toBeInTheDocument();

            const childContent = screen.getByTestId('child-content');
            expect(main).toContainElement(childContent);
        });

        it('navbar is positioned above content', () => {
            const { container } = render(
                <CoachLayout>
                    <div data-testid="child-content">Child Content</div>
                </CoachLayout>
            );

            const nav = container.querySelector('nav');
            const main = container.querySelector('main');

            expect(nav).toBeInTheDocument();
            expect(main).toBeInTheDocument();

            // Nav should come before main in DOM order
            const overlayDiv = container.querySelector('.bg-black\\/20');
            const children = Array.from(overlayDiv?.children || []);
            const navIndex = children.findIndex(child => child.tagName === 'NAV');
            const mainIndex = children.findIndex(child => child.tagName === 'MAIN');

            expect(navIndex).toBeLessThan(mainIndex);
        });
    });

    describe('Visual Consistency', () => {
        it('maintains consistent styling across multiple renders', () => {
            const { container: container1, unmount: unmount1 } = render(
                <CoachLayout>
                    <div>Content 1</div>
                </CoachLayout>
            );

            const backgroundDiv1 = container1.firstChild as HTMLElement;
            const style1 = {
                backgroundImage: backgroundDiv1.style.backgroundImage,
                backgroundSize: backgroundDiv1.style.backgroundSize,
                backgroundPosition: backgroundDiv1.style.backgroundPosition,
            };

            unmount1();

            const { container: container2 } = render(
                <CoachLayout>
                    <div>Content 2</div>
                </CoachLayout>
            );

            const backgroundDiv2 = container2.firstChild as HTMLElement;
            const style2 = {
                backgroundImage: backgroundDiv2.style.backgroundImage,
                backgroundSize: backgroundDiv2.style.backgroundSize,
                backgroundPosition: backgroundDiv2.style.backgroundPosition,
            };

            expect(style1).toEqual(style2);
        });

        it('applies consistent overlay opacity', () => {
            const { container } = render(
                <CoachLayout>
                    <div>Test Content</div>
                </CoachLayout>
            );

            const overlayDiv = container.querySelector('.bg-black\\/20');
            expect(overlayDiv?.className).toContain('bg-black/20');
        });
    });

    describe('Image Optimization Parameters', () => {
        it('includes image optimization parameters in URL', () => {
            const { container } = render(
                <CoachLayout>
                    <div>Test Content</div>
                </CoachLayout>
            );

            const backgroundDiv = container.firstChild as HTMLElement;
            const backgroundImage = backgroundDiv.style.backgroundImage;

            // Check for optimization parameters
            expect(backgroundImage).toContain('q=80'); // Quality
            expect(backgroundImage).toContain('w=2070'); // Width
            expect(backgroundImage).toContain('auto=format'); // Auto format
            expect(backgroundImage).toContain('fit=crop'); // Crop fit
        });
    });
});
