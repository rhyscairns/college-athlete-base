import React from 'react';
import { render, screen } from '@testing-library/react';
import { DashboardHeader } from '../DashboardHeader';
import type { DashboardHeaderProps } from '../DashboardHeader';

describe('DashboardHeader', () => {
    const mockProps: DashboardHeaderProps = {
        title: 'Player Recruitment Dashboard',
        subtitle: 'Discover and connect with talented athletes',
    };

    describe('Rendering', () => {
        it('should render the title', () => {
            render(<DashboardHeader {...mockProps} />);

            expect(screen.getByText('Player Recruitment Dashboard')).toBeInTheDocument();
        });

        it('should render the subtitle', () => {
            render(<DashboardHeader {...mockProps} />);

            expect(screen.getByText('Discover and connect with talented athletes')).toBeInTheDocument();
        });

        it('should render title as h1 element', () => {
            render(<DashboardHeader {...mockProps} />);

            const title = screen.getByRole('heading', { level: 1 });
            expect(title).toBeInTheDocument();
            expect(title).toHaveTextContent('Player Recruitment Dashboard');
        });

        it('should render subtitle as paragraph', () => {
            render(<DashboardHeader {...mockProps} />);

            const subtitle = screen.getByText('Discover and connect with talented athletes');
            expect(subtitle.tagName).toBe('P');
        });
    });

    describe('Content Variations', () => {
        it('should render coach dashboard title and subtitle', () => {
            const coachProps = {
                title: 'Player Recruitment Dashboard',
                subtitle: 'Discover and connect with talented athletes',
            };

            render(<DashboardHeader {...coachProps} />);

            expect(screen.getByText('Player Recruitment Dashboard')).toBeInTheDocument();
            expect(screen.getByText('Discover and connect with talented athletes')).toBeInTheDocument();
        });

        it('should render player dashboard title and subtitle', () => {
            const playerProps = {
                title: 'Player Discovery Dashboard',
                subtitle: 'Connect with other athletes and explore opportunities',
            };

            render(<DashboardHeader {...playerProps} />);

            expect(screen.getByText('Player Discovery Dashboard')).toBeInTheDocument();
            expect(screen.getByText('Connect with other athletes and explore opportunities')).toBeInTheDocument();
        });

        it('should handle long titles', () => {
            const longTitleProps = {
                title: 'This is a very long dashboard title that should still render correctly',
                subtitle: 'Short subtitle',
            };

            render(<DashboardHeader {...longTitleProps} />);

            expect(screen.getByText('This is a very long dashboard title that should still render correctly')).toBeInTheDocument();
        });

        it('should handle long subtitles', () => {
            const longSubtitleProps = {
                title: 'Dashboard',
                subtitle: 'This is a very long subtitle that provides detailed information about what the user can do on this dashboard and should still render correctly',
            };

            render(<DashboardHeader {...longSubtitleProps} />);

            expect(screen.getByText('This is a very long subtitle that provides detailed information about what the user can do on this dashboard and should still render correctly')).toBeInTheDocument();
        });
    });

    describe('Styling', () => {
        it('should have light theme background', () => {
            const { container } = render(<DashboardHeader {...mockProps} />);

            const header = container.firstChild;
            expect(header).toHaveClass('bg-white');
        });

        it('should have responsive padding', () => {
            const { container } = render(<DashboardHeader {...mockProps} />);

            const header = container.firstChild;
            expect(header).toHaveClass('px-6', 'py-8', 'sm:px-8', 'sm:py-12');
        });

        it('should have responsive text sizes for title', () => {
            render(<DashboardHeader {...mockProps} />);

            const title = screen.getByRole('heading', { level: 1 });
            expect(title).toHaveClass('text-3xl', 'sm:text-4xl');
        });

        it('should have responsive text sizes for subtitle', () => {
            render(<DashboardHeader {...mockProps} />);

            const subtitle = screen.getByText('Discover and connect with talented athletes');
            expect(subtitle).toHaveClass('text-base', 'sm:text-lg');
        });

        it('should have dark text for title', () => {
            render(<DashboardHeader {...mockProps} />);

            const title = screen.getByRole('heading', { level: 1 });
            expect(title).toHaveClass('text-gray-900');
        });

        it('should have gray text for subtitle', () => {
            render(<DashboardHeader {...mockProps} />);

            const subtitle = screen.getByText('Discover and connect with talented athletes');
            expect(subtitle).toHaveClass('text-gray-600');
        });

        it('should have max-width container', () => {
            const { container } = render(<DashboardHeader {...mockProps} />);

            const innerContainer = container.querySelector('.max-w-7xl');
            expect(innerContainer).toBeInTheDocument();
            expect(innerContainer).toHaveClass('mx-auto');
        });

        it('should have spacing between title and subtitle', () => {
            render(<DashboardHeader {...mockProps} />);

            const title = screen.getByRole('heading', { level: 1 });
            expect(title).toHaveClass('mb-2');
        });
    });

    describe('Component Memoization', () => {
        it('should be memoized with React.memo', () => {
            expect(typeof DashboardHeader).toBe('object');
        });
    });

    describe('Accessibility', () => {
        it('should have proper heading hierarchy', () => {
            render(<DashboardHeader {...mockProps} />);

            const h1 = screen.getByRole('heading', { level: 1 });
            expect(h1).toBeInTheDocument();
        });

        it('should have readable text contrast', () => {
            render(<DashboardHeader {...mockProps} />);

            const title = screen.getByRole('heading', { level: 1 });
            const subtitle = screen.getByText('Discover and connect with talented athletes');

            // Dark text on light background
            expect(title).toHaveClass('text-gray-900');
            // Gray text on light background
            expect(subtitle).toHaveClass('text-gray-600');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty title', () => {
            const emptyTitleProps = {
                title: '',
                subtitle: 'Subtitle text',
            };

            render(<DashboardHeader {...emptyTitleProps} />);

            expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
            expect(screen.getByText('Subtitle text')).toBeInTheDocument();
        });

        it('should handle empty subtitle', () => {
            const emptySubtitleProps = {
                title: 'Title text',
                subtitle: '',
            };

            render(<DashboardHeader {...emptySubtitleProps} />);

            expect(screen.getByText('Title text')).toBeInTheDocument();
            expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
        });

        it('should handle special characters in title', () => {
            const specialCharsProps = {
                title: 'Dashboard & Recruitment <> "Test"',
                subtitle: 'Subtitle',
            };

            render(<DashboardHeader {...specialCharsProps} />);

            expect(screen.getByText('Dashboard & Recruitment <> "Test"')).toBeInTheDocument();
        });

        it('should handle special characters in subtitle', () => {
            const specialCharsProps = {
                title: 'Title',
                subtitle: 'Connect & explore <opportunities> "now"',
            };

            render(<DashboardHeader {...specialCharsProps} />);

            expect(screen.getByText('Connect & explore <opportunities> "now"')).toBeInTheDocument();
        });
    });
});
