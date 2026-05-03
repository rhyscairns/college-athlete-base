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

        it('should render with data-testid attributes', () => {
            render(<DashboardHeader {...mockProps} />);
            expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
            expect(screen.getByTestId('dashboard-title')).toBeInTheDocument();
            expect(screen.getByTestId('dashboard-subtitle')).toBeInTheDocument();
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

        it('should have readable text content', () => {
            render(<DashboardHeader {...mockProps} />);

            const title = screen.getByRole('heading', { level: 1 });
            const subtitle = screen.getByText('Discover and connect with talented athletes');

            expect(title).toBeInTheDocument();
            expect(subtitle).toBeInTheDocument();
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
