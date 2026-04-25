import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MessagesTable } from '../MessagesTable';
import type { Conversation } from '../../types';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}));

const coachConversation: Conversation = {
    counterpartId: 'player-1',
    firstName: 'Jane',
    lastName: 'Doe',
    sport: 'Soccer',
    position: 'Forward',
    email: 'jane@example.com',
    lastMessageAt: '2024-01-01T00:00:00Z',
};

const playerConversation: Conversation = {
    counterpartId: 'coach-1',
    firstName: 'Bob',
    lastName: 'Smith',
    university: 'State University',
    sport: 'Soccer',
    position: 'Head Coach',
    email: 'bob@university.edu',
    lastMessageAt: '2024-01-01T00:00:00Z',
};

describe('MessagesTable', () => {
    beforeEach(() => {
        mockPush.mockClear();
    });

    describe('empty state', () => {
        it('renders the empty message when conversations is empty', () => {
            render(
                <MessagesTable
                    conversations={[]}
                    currentUserId="coach-123"
                    userType="coach"
                    emptyMessage="No messages yet. Start a conversation from the dashboard."
                />
            );
            expect(screen.getByText('No messages yet. Start a conversation from the dashboard.')).toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('renders player-specific empty message', () => {
            render(
                <MessagesTable
                    conversations={[]}
                    currentUserId="player-123"
                    userType="player"
                    emptyMessage="No messages yet."
                />
            );
            expect(screen.getByText('No messages yet.')).toBeInTheDocument();
        });
    });

    describe('coach view', () => {
        it('renders correct columns for coach userType', () => {
            render(
                <MessagesTable
                    conversations={[coachConversation]}
                    currentUserId="coach-123"
                    userType="coach"
                    emptyMessage=""
                />
            );
            expect(screen.getByText('Name')).toBeInTheDocument();
            expect(screen.getByText('Sport')).toBeInTheDocument();
            expect(screen.getByText('Position')).toBeInTheDocument();
            expect(screen.getByText('Email')).toBeInTheDocument();
            expect(screen.getByText('Actions')).toBeInTheDocument();
            expect(screen.queryByText('University')).not.toBeInTheDocument();
        });

        it('renders conversation data correctly', () => {
            render(
                <MessagesTable
                    conversations={[coachConversation]}
                    currentUserId="coach-123"
                    userType="coach"
                    emptyMessage=""
                />
            );
            expect(screen.getByText('Jane Doe')).toBeInTheDocument();
            expect(screen.getByText('Soccer')).toBeInTheDocument();
            expect(screen.getByText('Forward')).toBeInTheDocument();
            expect(screen.getByText('jane@example.com')).toBeInTheDocument();
        });

        it('navigates to correct thread URL when View Messages is clicked', () => {
            render(
                <MessagesTable
                    conversations={[coachConversation]}
                    currentUserId="coach-123"
                    userType="coach"
                    emptyMessage=""
                />
            );
            fireEvent.click(screen.getByRole('button', { name: /view messages with jane doe/i }));
            expect(mockPush).toHaveBeenCalledWith('/coach/coach-123/messages/player-1');
        });

        it('shows dash for missing optional fields', () => {
            const sparse: Conversation = {
                ...coachConversation,
                sport: undefined,
                position: undefined,
            };
            render(
                <MessagesTable
                    conversations={[sparse]}
                    currentUserId="coach-123"
                    userType="coach"
                    emptyMessage=""
                />
            );
            expect(screen.getAllByText('—')).toHaveLength(2);
        });
    });

    describe('player view', () => {
        it('renders correct columns for player userType', () => {
            render(
                <MessagesTable
                    conversations={[playerConversation]}
                    currentUserId="player-123"
                    userType="player"
                    emptyMessage=""
                />
            );
            expect(screen.getByText('Name')).toBeInTheDocument();
            expect(screen.getByText('University')).toBeInTheDocument();
            expect(screen.getByText('Position')).toBeInTheDocument();
            expect(screen.getByText('Sport')).toBeInTheDocument();
            expect(screen.getByText('Email')).toBeInTheDocument();
            expect(screen.getByText('Actions')).toBeInTheDocument();
        });

        it('renders conversation data correctly', () => {
            render(
                <MessagesTable
                    conversations={[playerConversation]}
                    currentUserId="player-123"
                    userType="player"
                    emptyMessage=""
                />
            );
            expect(screen.getByText('Bob Smith')).toBeInTheDocument();
            expect(screen.getByText('State University')).toBeInTheDocument();
            expect(screen.getByText('Head Coach')).toBeInTheDocument();
            expect(screen.getByText('Soccer')).toBeInTheDocument();
            expect(screen.getByText('bob@university.edu')).toBeInTheDocument();
        });

        it('navigates to correct thread URL when View Messages is clicked', () => {
            render(
                <MessagesTable
                    conversations={[playerConversation]}
                    currentUserId="player-123"
                    userType="player"
                    emptyMessage=""
                />
            );
            fireEvent.click(screen.getByRole('button', { name: /view messages with bob smith/i }));
            expect(mockPush).toHaveBeenCalledWith('/player/player-123/messages/coach-1');
        });

        it('shows dash for missing university', () => {
            const sparse: Conversation = { ...playerConversation, university: undefined };
            render(
                <MessagesTable
                    conversations={[sparse]}
                    currentUserId="player-123"
                    userType="player"
                    emptyMessage=""
                />
            );
            expect(screen.getByText('—')).toBeInTheDocument();
        });
    });

    describe('multiple conversations', () => {
        it('renders a row for each conversation', () => {
            const second: Conversation = {
                ...coachConversation,
                counterpartId: 'player-2',
                firstName: 'Alice',
                lastName: 'Johnson',
                email: 'alice@example.com',
            };
            render(
                <MessagesTable
                    conversations={[coachConversation, second]}
                    currentUserId="coach-123"
                    userType="coach"
                    emptyMessage=""
                />
            );
            expect(screen.getByText('Jane Doe')).toBeInTheDocument();
            expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
            expect(screen.getAllByRole('button', { name: /view messages/i })).toHaveLength(2);
        });
    });
});
