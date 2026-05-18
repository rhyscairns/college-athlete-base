import { render, screen } from '@testing-library/react';
import PlayerLayout from '../layout';
import { usePathname } from 'next/navigation';

// Mock dependencies
jest.mock('next/navigation', () => ({
    usePathname: jest.fn(),
    useRouter: jest.fn(() => ({ replace: jest.fn() })),
}));

jest.mock('@/dashboard/player/components/PlayerNavbar', () => ({
    PlayerNavbar: ({ playerId }: { playerId: string }) => (
        <nav data-testid="player-navbar" data-player-id={playerId}>
            Player Navbar
        </nav>
    ),
}));

describe('PlayerLayout', () => {
    const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render children within the layout', () => {
            mockUsePathname.mockReturnValue('/player/player-123/dashboard');

            render(
                <PlayerLayout>
                    <div data-testid="child-content">Test Content</div>
                </PlayerLayout>
            );

            expect(screen.getByTestId('child-content')).toBeInTheDocument();
            expect(screen.getByText('Test Content')).toBeInTheDocument();
        });

        it('should render PlayerNavbar component', () => {
            mockUsePathname.mockReturnValue('/player/player-123/dashboard');

            render(
                <PlayerLayout>
                    <div>Content</div>
                </PlayerLayout>
            );

            expect(screen.getByTestId('player-navbar')).toBeInTheDocument();
        });

        it('should render main element with proper ARIA attributes', () => {
            mockUsePathname.mockReturnValue('/player/player-123/dashboard');

            render(
                <PlayerLayout>
                    <div>Content</div>
                </PlayerLayout>
            );

            const mainElement = screen.getByRole('main');
            expect(mainElement).toBeInTheDocument();
            expect(mainElement).toHaveAttribute('aria-label', 'Player content');
        });

        it('should apply background classes', () => {
            mockUsePathname.mockReturnValue('/player/player-123/dashboard');

            const { container } = render(
                <PlayerLayout>
                    <div>Content</div>
                </PlayerLayout>
            );

            const wrapper = container.firstChild as HTMLElement;
            expect(wrapper).toHaveClass('min-h-screen');
        });
    });

    describe('Player ID Extraction', () => {
        it('should extract playerId from /player/[playerId]/dashboard pattern', () => {
            mockUsePathname.mockReturnValue('/player/player-123/dashboard');

            render(
                <PlayerLayout>
                    <div>Content</div>
                </PlayerLayout>
            );

            const navbar = screen.getByTestId('player-navbar');
            expect(navbar).toHaveAttribute('data-player-id', 'player-123');
        });

        it('should extract playerId from /player/[playerId]/profile pattern', () => {
            mockUsePathname.mockReturnValue('/player/player-456/profile');

            render(
                <PlayerLayout>
                    <div>Content</div>
                </PlayerLayout>
            );

            const navbar = screen.getByTestId('player-navbar');
            expect(navbar).toHaveAttribute('data-player-id', 'player-456');
        });

        it('should return empty string for invalid paths', () => {
            mockUsePathname.mockReturnValue('/other/path');

            render(
                <PlayerLayout>
                    <div>Content</div>
                </PlayerLayout>
            );

            const navbar = screen.getByTestId('player-navbar');
            expect(navbar).toHaveAttribute('data-player-id', '');
        });

        it('should handle paths with trailing slashes', () => {
            mockUsePathname.mockReturnValue('/player/player-123/dashboard/');

            render(
                <PlayerLayout>
                    <div>Content</div>
                </PlayerLayout>
            );

            const navbar = screen.getByTestId('player-navbar');
            expect(navbar).toHaveAttribute('data-player-id', 'player-123');
        });
    });

    describe('Accessibility', () => {
        it('should have proper semantic structure', () => {
            mockUsePathname.mockReturnValue('/player/player-123/dashboard');

            render(
                <PlayerLayout>
                    <div>Content</div>
                </PlayerLayout>
            );

            // Check for nav element (from PlayerNavbar mock)
            expect(screen.getByRole('navigation')).toBeInTheDocument();

            // Check for main element
            expect(screen.getByRole('main')).toBeInTheDocument();
        });

        it('should maintain proper heading hierarchy', () => {
            mockUsePathname.mockReturnValue('/player/player-123/dashboard');

            render(
                <PlayerLayout>
                    <h1>Page Title</h1>
                    <h2>Section Title</h2>
                </PlayerLayout>
            );

            expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
            expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty pathname', () => {
            mockUsePathname.mockReturnValue('');

            render(
                <PlayerLayout>
                    <div>Content</div>
                </PlayerLayout>
            );

            const navbar = screen.getByTestId('player-navbar');
            expect(navbar).toHaveAttribute('data-player-id', '');
        });

        it('should handle pathname with only slashes', () => {
            mockUsePathname.mockReturnValue('///');

            render(
                <PlayerLayout>
                    <div>Content</div>
                </PlayerLayout>
            );

            const navbar = screen.getByTestId('player-navbar');
            expect(navbar).toHaveAttribute('data-player-id', '');
        });

        it('should handle complex player IDs with special characters', () => {
            mockUsePathname.mockReturnValue('/player/player-123-abc_def/dashboard');

            render(
                <PlayerLayout>
                    <div>Content</div>
                </PlayerLayout>
            );

            const navbar = screen.getByTestId('player-navbar');
            expect(navbar).toHaveAttribute('data-player-id', 'player-123-abc_def');
        });
    });
});
