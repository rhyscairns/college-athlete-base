import { render, screen, cleanup } from '@testing-library/react';
import CoachDashboard from '../CoachDashboard';

describe('CoachDashboard', () => {
    const mockCoachId = 'coach-123';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    describe('Placeholder Content', () => {
        it('renders placeholder content', () => {
            render(<CoachDashboard coachId={mockCoachId} />);

            const placeholderText = screen.getByText('Dashboard content coming soon');
            expect(placeholderText).toBeInTheDocument();
        });

        it('displays placeholder text with correct styling', () => {
            render(<CoachDashboard coachId={mockCoachId} />);

            const placeholderText = screen.getByText('Dashboard content coming soon');
            expect(placeholderText).toHaveClass('text-gray-500');
            expect(placeholderText).toHaveClass('text-lg');
            expect(placeholderText).toHaveClass('text-center');
        });

        it('centers placeholder content vertically and horizontally', () => {
            const { container } = render(<CoachDashboard coachId={mockCoachId} />);

            const contentContainer = container.querySelector('.flex.items-center.justify-center');
            expect(contentContainer).toBeInTheDocument();
            expect(contentContainer).toHaveClass('flex');
            expect(contentContainer).toHaveClass('items-center');
            expect(contentContainer).toHaveClass('justify-center');
        });

        it('applies minimum height to content area', () => {
            const { container } = render(<CoachDashboard coachId={mockCoachId} />);

            const contentContainer = container.querySelector('.flex.items-center.justify-center');
            expect(contentContainer).toHaveClass('min-h-[400px]');
        });
    });

    describe('CoachId Prop', () => {
        it('accepts coachId prop without errors', () => {
            expect(() => render(<CoachDashboard coachId={mockCoachId} />)).not.toThrow();
        });

        it('handles different coachId formats', () => {
            const coachIds = ['coach-123', 'abc-def-ghi', '12345', 'coach_test_001'];

            coachIds.forEach(coachId => {
                const { unmount } = render(<CoachDashboard coachId={coachId} />);

                // Component should render successfully with any coachId format
                const placeholderText = screen.getByText('Dashboard content coming soon');
                expect(placeholderText).toBeInTheDocument();

                unmount();
            });
        });

        it('renders with empty coachId', () => {
            expect(() => render(<CoachDashboard coachId="" />)).not.toThrow();

            const placeholderText = screen.getByText('Dashboard content coming soon');
            expect(placeholderText).toBeInTheDocument();
        });
    });

    describe('Glassmorphism Styling', () => {
        it('applies semi-transparent white background', () => {
            const { container } = render(<CoachDashboard coachId={mockCoachId} />);

            const card = container.querySelector('.bg-white\\/90');
            expect(card).toBeInTheDocument();
        });

        it('applies backdrop blur effect', () => {
            const { container } = render(<CoachDashboard coachId={mockCoachId} />);

            const card = container.querySelector('.backdrop-blur-sm');
            expect(card).toBeInTheDocument();
        });

        it('applies rounded corners', () => {
            const { container } = render(<CoachDashboard coachId={mockCoachId} />);

            const card = container.querySelector('.rounded-3xl');
            expect(card).toBeInTheDocument();
            expect(card).toHaveClass('rounded-3xl');
        });

        it('applies shadow effect', () => {
            const { container } = render(<CoachDashboard coachId={mockCoachId} />);

            const card = container.querySelector('.shadow-2xl');
            expect(card).toBeInTheDocument();
        });

        it('applies border with transparency', () => {
            const { container } = render(<CoachDashboard coachId={mockCoachId} />);

            const card = container.querySelector('.border-white\\/50');
            expect(card).toBeInTheDocument();
        });

        it('applies all glassmorphism styles together', () => {
            const { container } = render(<CoachDashboard coachId={mockCoachId} />);

            const card = container.querySelector('.bg-white\\/90.rounded-3xl.shadow-2xl.border.border-white\\/50.backdrop-blur-sm');
            expect(card).toBeInTheDocument();
        });
    });

    describe('Responsive Layout', () => {
        it('applies full width to outer container', () => {
            const { container } = render(<CoachDashboard coachId={mockCoachId} />);

            const outerContainer = container.firstChild;
            expect(outerContainer).toHaveClass('w-full');
        });

        it('applies max-width constraint', () => {
            const { container } = render(<CoachDashboard coachId={mockCoachId} />);

            const outerContainer = container.firstChild;
            expect(outerContainer).toHaveClass('max-w-7xl');
        });

        it('centers container horizontally', () => {
            const { container } = render(<CoachDashboard coachId={mockCoachId} />);

            const outerContainer = container.firstChild;
            expect(outerContainer).toHaveClass('mx-auto');
        });

        it('applies responsive horizontal padding', () => {
            const { container } = render(<CoachDashboard coachId={mockCoachId} />);

            const outerContainer = container.firstChild;
            expect(outerContainer).toHaveClass('px-4');
            expect(outerContainer).toHaveClass('sm:px-6');
            expect(outerContainer).toHaveClass('lg:px-8');
        });

        it('applies vertical padding', () => {
            const { container } = render(<CoachDashboard coachId={mockCoachId} />);

            const outerContainer = container.firstChild;
            expect(outerContainer).toHaveClass('py-8');
        });

        it('applies responsive padding to card', () => {
            const { container } = render(<CoachDashboard coachId={mockCoachId} />);

            const card = container.querySelector('.bg-white\\/90');
            expect(card).toHaveClass('p-8');
            expect(card).toHaveClass('sm:p-10');
            expect(card).toHaveClass('lg:p-12');
        });

        it('maintains full width for card', () => {
            const { container } = render(<CoachDashboard coachId={mockCoachId} />);

            const card = container.querySelector('.bg-white\\/90');
            expect(card).toHaveClass('w-full');
        });
    });

    describe('Layout Structure', () => {
        it('renders with correct container hierarchy', () => {
            const { container } = render(<CoachDashboard coachId={mockCoachId} />);

            // Outer container
            const outerContainer = container.firstChild;
            expect(outerContainer).toBeInTheDocument();

            // Card container
            const card = container.querySelector('.bg-white\\/90');
            expect(card).toBeInTheDocument();

            // Content container
            const contentContainer = container.querySelector('.flex.items-center.justify-center');
            expect(contentContainer).toBeInTheDocument();

            // Placeholder text
            const placeholderText = screen.getByText('Dashboard content coming soon');
            expect(placeholderText).toBeInTheDocument();
        });

        it('applies consistent spacing throughout', () => {
            const { container } = render(<CoachDashboard coachId={mockCoachId} />);

            const outerContainer = container.firstChild as HTMLElement;
            const card = container.querySelector('.bg-white\\/90') as HTMLElement;

            // Verify spacing classes are applied
            expect(outerContainer).toHaveClass('py-8');
            expect(card).toHaveClass('p-8');
        });
    });

    describe('Component Rendering', () => {
        it('renders without crashing', () => {
            expect(() => render(<CoachDashboard coachId={mockCoachId} />)).not.toThrow();
        });

        it('renders as a client component', () => {
            const { container } = render(<CoachDashboard coachId={mockCoachId} />);

            // Component should render successfully (client components render in tests)
            expect(container.firstChild).toBeInTheDocument();
        });

        it('maintains consistent structure on re-render', () => {
            const { rerender } = render(<CoachDashboard coachId={mockCoachId} />);

            const initialText = screen.getByText('Dashboard content coming soon');
            expect(initialText).toBeInTheDocument();

            rerender(<CoachDashboard coachId="coach-456" />);

            const rerenderedText = screen.getByText('Dashboard content coming soon');
            expect(rerenderedText).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('renders semantic HTML structure', () => {
            const { container } = render(<CoachDashboard coachId={mockCoachId} />);

            // Should use div elements for layout
            const divs = container.querySelectorAll('div');
            expect(divs.length).toBeGreaterThan(0);
        });

        it('placeholder text is readable', () => {
            render(<CoachDashboard coachId={mockCoachId} />);

            const placeholderText = screen.getByText('Dashboard content coming soon');

            // Text should be visible and have appropriate styling
            expect(placeholderText).toBeVisible();
            expect(placeholderText).toHaveClass('text-center');
        });

        it('maintains sufficient contrast for placeholder text', () => {
            render(<CoachDashboard coachId={mockCoachId} />);

            const placeholderText = screen.getByText('Dashboard content coming soon');

            // text-gray-500 on white/90 background should have sufficient contrast
            expect(placeholderText).toHaveClass('text-gray-500');
        });
    });
});
