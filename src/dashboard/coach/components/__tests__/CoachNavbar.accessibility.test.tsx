/**
 * Accessibility tests for CoachNavbar
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CoachNavbar } from '../CoachNavbar';

jest.mock('../AthleteSearchModal', () => ({
    AthleteSearchModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
        isOpen ? (
            <div data-testid="athlete-search-modal">
                <button onClick={onClose}>Close Modal</button>
            </div>
        ) : null,
}));

jest.mock('../../../../messages/components/NotificationBell', () => ({
    NotificationBell: ({ userId, userType }: { userId: string; userType: string }) => (
        <div data-testid="notification-bell" data-user-id={userId} data-user-type={userType} />
    ),
}));

jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn() }),
    usePathname: () => '/coach/coach-123/dashboard',
}));

describe('CoachNavbar Accessibility', () => {
    const coachId = 'coach-123';

    describe('Semantic HTML', () => {
        it('renders a <nav> element with aria-label', () => {
            render(<CoachNavbar coachId={coachId} />);
            const navs = screen.getAllByRole('navigation', { name: /main navigation/i });
            expect(navs[0]).toBeInTheDocument();
        });

        it('branding link has descriptive aria-label', () => {
            render(<CoachNavbar coachId={coachId} />);
            expect(screen.getAllByRole('link', { name: /college athlete base/i })[0]).toBeInTheDocument();
        });
    });

    describe('Hamburger button', () => {
        it('has aria-expanded=false when closed', () => {
            render(<CoachNavbar coachId={coachId} />);
            expect(screen.getByLabelText('Toggle menu')).toHaveAttribute('aria-expanded', 'false');
        });

        it('has aria-expanded=true when open', () => {
            render(<CoachNavbar coachId={coachId} />);
            fireEvent.click(screen.getByLabelText('Toggle menu'));
            expect(screen.getByLabelText('Toggle menu')).toHaveAttribute('aria-expanded', 'true');
        });

        it('has aria-controls pointing to mobile menu id', () => {
            render(<CoachNavbar coachId={coachId} />);
            expect(screen.getByLabelText('Toggle menu')).toHaveAttribute('aria-controls', 'mobile-nav-menu');
        });

        it('meets 44x44px minimum touch target', () => {
            render(<CoachNavbar coachId={coachId} />);
            const btn = screen.getByLabelText('Toggle menu');
            expect(btn).toHaveClass('w-11', 'h-11');
        });
    });

    describe('Mobile menu', () => {
        it('mobile dropdown has role=menu and aria-label', () => {
            render(<CoachNavbar coachId={coachId} />);
            fireEvent.click(screen.getByLabelText('Toggle menu'));
            expect(screen.getByRole('menu', { name: /mobile navigation menu/i })).toBeInTheDocument();
        });

        it('mobile menu items have role=menuitem', () => {
            render(<CoachNavbar coachId={coachId} />);
            fireEvent.click(screen.getByLabelText('Toggle menu'));
            const menuItems = screen.getAllByRole('menuitem');
            expect(menuItems.length).toBeGreaterThanOrEqual(6); // Home, Search, Prospects, Messages, Profile, Log Out
        });
    });

    describe('Keyboard navigation', () => {
        it('all interactive elements are focusable', () => {
            render(<CoachNavbar coachId={coachId} />);
            const buttons = screen.getAllByRole('button');
            buttons.forEach((btn) => {
                expect(btn).not.toHaveAttribute('tabindex', '-1');
            });
        });

        it('search button opens modal on click (keyboard activation)', () => {
            render(<CoachNavbar coachId={coachId} />);
            const searchBtn = screen.getAllByRole('button', { name: 'Search' })[0];
            searchBtn.focus();
            fireEvent.click(searchBtn);
            expect(screen.getByTestId('athlete-search-modal')).toBeInTheDocument();
        });

        it('Messages button is focusable and clickable', () => {
            render(<CoachNavbar coachId={coachId} />);
            // Messages is a Link in the redesign
            const messagesLinks = screen.getAllByText('Messages');
            expect(messagesLinks[0]).toBeInTheDocument();
            expect(() => fireEvent.click(messagesLinks[0])).not.toThrow();
        });
    });
});
