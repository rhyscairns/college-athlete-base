/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { NotificationBell } from '../NotificationBell';
import type { NotificationItem } from '../../types';

// --- Mock next/navigation ---
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}));

// --- Mock lucide-react ---
jest.mock('lucide-react', () => ({
    Bell: ({ size }: { size: number }) => <svg data-testid="bell-icon" width={size} />,
}));

// --- Mock useUnreadCount ---
const mockMarkThreadAsRead = jest.fn();
let mockUnreadCount = 0;
let mockNotifications: NotificationItem[] = [];

jest.mock('../../hooks/useUnreadCount', () => ({
    useUnreadCount: jest.fn(() => ({
        unreadCount: mockUnreadCount,
        notifications: mockNotifications,
        markThreadAsRead: mockMarkThreadAsRead,
    })),
}));

const makeNotification = (overrides: Partial<NotificationItem> = {}): NotificationItem => ({
    messageId: 'msg-1',
    senderName: 'Coach Smith',
    preview: 'Hey, are you interested in our program?',
    sentAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 mins ago
    coachId: 'coach-1',
    playerId: 'player-1',
    ...overrides,
});

describe('NotificationBell', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUnreadCount = 0;
        mockNotifications = [];
    });

    describe('badge display', () => {
        it('renders the bell icon', () => {
            render(<NotificationBell userId="coach-1" userType="coach" />);
            expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
        });

        it('does not show badge when unreadCount is 0', () => {
            mockUnreadCount = 0;
            render(<NotificationBell userId="coach-1" userType="coach" />);
            expect(screen.queryByTestId('unread-badge')).not.toBeInTheDocument();
        });

        it('shows badge with count when unreadCount > 0', () => {
            mockUnreadCount = 5;
            render(<NotificationBell userId="coach-1" userType="coach" />);
            const badge = screen.getByTestId('unread-badge');
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveTextContent('5');
        });

        it('shows "99+" when unreadCount exceeds 99', () => {
            mockUnreadCount = 100;
            render(<NotificationBell userId="coach-1" userType="coach" />);
            expect(screen.getByTestId('unread-badge')).toHaveTextContent('99+');
        });

        it('shows exact count at 99', () => {
            mockUnreadCount = 99;
            render(<NotificationBell userId="coach-1" userType="coach" />);
            expect(screen.getByTestId('unread-badge')).toHaveTextContent('99');
        });

        it('button aria-label reflects unread count', () => {
            mockUnreadCount = 3;
            render(<NotificationBell userId="coach-1" userType="coach" />);
            expect(screen.getByRole('button', { name: '3 unread messages' })).toBeInTheDocument();
        });

        it('button aria-label is "Notifications" when count is 0', () => {
            mockUnreadCount = 0;
            render(<NotificationBell userId="coach-1" userType="coach" />);
            expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument();
        });
    });

    describe('dropdown rendering', () => {
        it('dropdown is not visible initially', () => {
            render(<NotificationBell userId="coach-1" userType="coach" />);
            expect(screen.queryByTestId('notification-dropdown')).not.toBeInTheDocument();
        });

        it('opens dropdown when bell button is clicked', () => {
            render(<NotificationBell userId="coach-1" userType="coach" />);
            fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
            expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument();
        });

        it('closes dropdown when bell button is clicked again', () => {
            render(<NotificationBell userId="coach-1" userType="coach" />);
            const btn = screen.getByRole('button', { name: 'Notifications' });
            fireEvent.click(btn);
            fireEvent.click(btn);
            expect(screen.queryByTestId('notification-dropdown')).not.toBeInTheDocument();
        });

        it('shows empty state when no notifications', () => {
            mockNotifications = [];
            render(<NotificationBell userId="coach-1" userType="coach" />);
            fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
            expect(screen.getByText('No new notifications')).toBeInTheDocument();
        });

        it('renders notification items in dropdown', () => {
            mockNotifications = [makeNotification()];
            render(<NotificationBell userId="coach-1" userType="coach" />);
            fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
            expect(screen.getByText('Coach Smith')).toBeInTheDocument();
            expect(screen.getByText('Hey, are you interested in our program?')).toBeInTheDocument();
        });

        it('renders sender name, preview, and relative time for each notification', () => {
            mockNotifications = [makeNotification({ senderName: 'Jane Doe', preview: 'Hello there!' })];
            render(<NotificationBell userId="player-1" userType="player" />);
            fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
            expect(screen.getByText('Jane Doe')).toBeInTheDocument();
            expect(screen.getByText('Hello there!')).toBeInTheDocument();
            // relative time should be present (e.g. "2 mins ago")
            expect(screen.getByText(/ago/i)).toBeInTheDocument();
        });

        it('renders at most 5 notification items', () => {
            mockNotifications = Array.from({ length: 7 }, (_, i) =>
                makeNotification({ messageId: `msg-${i}`, senderName: `Sender ${i}` })
            );
            render(<NotificationBell userId="coach-1" userType="coach" />);
            fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
            expect(screen.getAllByRole('menuitem')).toHaveLength(5);
        });

        it('sets aria-expanded on button when open', () => {
            render(<NotificationBell userId="coach-1" userType="coach" />);
            const btn = screen.getByRole('button', { name: 'Notifications' });
            expect(btn).toHaveAttribute('aria-expanded', 'false');
            fireEvent.click(btn);
            expect(btn).toHaveAttribute('aria-expanded', 'true');
        });
    });

    describe('outside-click close', () => {
        it('closes dropdown when clicking outside', () => {
            render(
                <div>
                    <NotificationBell userId="coach-1" userType="coach" />
                    <div data-testid="outside">Outside</div>
                </div>
            );
            fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
            expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument();

            act(() => {
                fireEvent.mouseDown(screen.getByTestId('outside'));
            });

            expect(screen.queryByTestId('notification-dropdown')).not.toBeInTheDocument();
        });

        it('does not close dropdown when clicking inside it', () => {
            mockNotifications = [makeNotification()];
            render(<NotificationBell userId="coach-1" userType="coach" />);
            fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));

            act(() => {
                fireEvent.mouseDown(screen.getByTestId('notification-dropdown'));
            });

            expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument();
        });
    });

    describe('navigation on notification click', () => {
        it('navigates to coach thread URL when coach clicks a notification', () => {
            mockNotifications = [makeNotification({ coachId: 'coach-1', playerId: 'player-1' })];
            render(<NotificationBell userId="coach-1" userType="coach" />);
            fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
            fireEvent.click(screen.getByRole('menuitem'));
            expect(mockPush).toHaveBeenCalledWith('/coach/coach-1/messages/player-1');
        });

        it('navigates to player thread URL when player clicks a notification', () => {
            mockNotifications = [makeNotification({ coachId: 'coach-1', playerId: 'player-1' })];
            render(<NotificationBell userId="player-1" userType="player" />);
            fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
            fireEvent.click(screen.getByRole('menuitem'));
            expect(mockPush).toHaveBeenCalledWith('/player/player-1/messages/coach-1');
        });

        it('calls markThreadAsRead when notification is clicked', () => {
            mockNotifications = [makeNotification({ coachId: 'coach-1', playerId: 'player-1' })];
            render(<NotificationBell userId="coach-1" userType="coach" />);
            fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
            fireEvent.click(screen.getByRole('menuitem'));
            expect(mockMarkThreadAsRead).toHaveBeenCalledWith('coach-1', 'player-1');
        });

        it('closes dropdown after clicking a notification', () => {
            mockNotifications = [makeNotification()];
            render(<NotificationBell userId="coach-1" userType="coach" />);
            fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
            fireEvent.click(screen.getByRole('menuitem'));
            expect(screen.queryByTestId('notification-dropdown')).not.toBeInTheDocument();
        });
    });
});
