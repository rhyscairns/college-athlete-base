import React from 'react';
import { render, screen } from '@testing-library/react';
import CoachLayout from '../layout';

// Mock the CoachNavbar component
jest.mock('@/dashboard/coach/components/CoachNavbar', () => ({
    CoachNavbar: ({ coachId }: { coachId: string }) => (
        <nav data-testid="coach-navbar" data-coach-id={coachId}>
            Coach Navbar - ID: {coachId}
        </nav>
    ),
}));

// Mock usePathname
jest.mock('next/navigation', () => ({
    usePathname: jest.fn(),
}));

const { usePathname } = require('next/navigation');

describe('CoachLayout', () => {
    it('extracts coachId from dashboard path', () => {
        usePathname.mockReturnValue('/coach/coach-123/dashboard');

        render(
            <CoachLayout>
                <div>Test Content</div>
            </CoachLayout>
        );

        const navbar = screen.getByTestId('coach-navbar');
        expect(navbar).toHaveAttribute('data-coach-id', 'coach-123');
    });

    it('extracts coachId from profile path', () => {
        usePathname.mockReturnValue('/coach/coach-456/profile');

        render(
            <CoachLayout>
                <div>Test Content</div>
            </CoachLayout>
        );

        const navbar = screen.getByTestId('coach-navbar');
        expect(navbar).toHaveAttribute('data-coach-id', 'coach-456');
    });

    it('handles empty coachId gracefully', () => {
        usePathname.mockReturnValue('/coach');

        render(
            <CoachLayout>
                <div>Test Content</div>
            </CoachLayout>
        );

        const navbar = screen.getByTestId('coach-navbar');
        expect(navbar).toHaveAttribute('data-coach-id', '');
    });

    it('renders children content', () => {
        usePathname.mockReturnValue('/coach/coach-123/dashboard');

        render(
            <CoachLayout>
                <div>Test Content</div>
            </CoachLayout>
        );

        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
});
