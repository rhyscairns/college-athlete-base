/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MessageThread } from '../MessageThread';
import type { Message } from '../../types';

// --- Mock scrollIntoView (not available in jsdom) ---
window.HTMLElement.prototype.scrollIntoView = jest.fn();

// --- Mock useSocket ---
const mockSocket = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
};
jest.mock('../../hooks/useSocket', () => ({
    useSocket: jest.fn(() => ({ socket: mockSocket, isConnected: true })),
}));

// --- Mock fetch ---
global.fetch = jest.fn();

// --- Mock lucide-react ---
jest.mock('lucide-react', () => ({
    Trash2: ({ size }: { size: number }) => <svg data-testid="trash-icon" width={size} />,
}));

const baseProps = {
    currentUserId: 'coach-1',
    userType: 'coach' as const,
    counterpartName: 'Jane Doe',
    coachId: 'coach-1',
    playerId: 'player-1',
};

const makeMessage = (overrides: Partial<Message> = {}): Message => ({
    id: 'msg-1',
    coachId: 'coach-1',
    playerId: 'player-1',
    senderType: 'coach',
    senderId: 'coach-1',
    content: 'Hello there',
    createdAt: '2024-01-01T10:00:00Z',
    readAt: null,
    deletedAt: null,
    ...overrides,
});

describe('MessageThread', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ success: true, data: makeMessage() }),
        });
    });

    describe('rendering', () => {
        it('renders the counterpart name in the header', () => {
            render(<MessageThread {...baseProps} messages={[]} />);
            expect(screen.getByText('Jane Doe')).toBeInTheDocument();
        });

        it('renders empty state when no messages', () => {
            render(<MessageThread {...baseProps} messages={[]} />);
            expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
        });

        it('renders own messages right-aligned with blue background', () => {
            const msg = makeMessage({ senderId: 'coach-1' });
            render(<MessageThread {...baseProps} messages={[msg]} />);
            const bubble = screen.getByTestId('message-bubble-own');
            expect(bubble).toBeInTheDocument();
        });

        it('renders counterpart messages left-aligned with gray background', () => {
            const msg = makeMessage({ senderId: 'player-1', senderType: 'player' });
            render(<MessageThread {...baseProps} messages={[msg]} />);
            const bubble = screen.getByTestId('message-bubble-other');
            expect(bubble).toBeInTheDocument();
        });

        it('renders multiple messages', () => {
            const msgs = [
                makeMessage({ id: 'msg-1', content: 'First message' }),
                makeMessage({ id: 'msg-2', content: 'Second message', senderId: 'player-1', senderType: 'player' }),
            ];
            render(<MessageThread {...baseProps} messages={msgs} />);
            expect(screen.getByText('First message')).toBeInTheDocument();
            expect(screen.getByText('Second message')).toBeInTheDocument();
        });

        it('renders the message input and send button', () => {
            render(<MessageThread {...baseProps} messages={[]} />);
            expect(screen.getByRole('textbox', { name: /message input/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
        });

        it('send button is disabled when input is empty', () => {
            render(<MessageThread {...baseProps} messages={[]} />);
            expect(screen.getByRole('button', { name: /send message/i })).toBeDisabled();
        });

        it('send button is enabled when input has content', () => {
            render(<MessageThread {...baseProps} messages={[]} />);
            fireEvent.change(screen.getByRole('textbox', { name: /message input/i }), {
                target: { value: 'Hello' },
            });
            expect(screen.getByRole('button', { name: /send message/i })).not.toBeDisabled();
        });
    });

    describe('delete button', () => {
        it('shows delete button on hover for own messages', () => {
            const msg = makeMessage({ senderId: 'coach-1' });
            render(<MessageThread {...baseProps} messages={[msg]} />);

            expect(screen.queryByRole('button', { name: /delete message/i })).not.toBeInTheDocument();

            fireEvent.mouseEnter(screen.getByText('Hello there').closest('[class*="flex"]')!.parentElement!);
            expect(screen.getByRole('button', { name: /delete message/i })).toBeInTheDocument();
        });

        it('does not show delete button for counterpart messages', () => {
            const msg = makeMessage({ senderId: 'player-1', senderType: 'player' });
            render(<MessageThread {...baseProps} messages={[msg]} />);

            fireEvent.mouseEnter(screen.getByText('Hello there').closest('[class*="flex"]')!.parentElement!);
            expect(screen.queryByRole('button', { name: /delete message/i })).not.toBeInTheDocument();
        });

        it('calls DELETE API when delete button is clicked', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });

            const msg = makeMessage({ id: 'msg-abc', senderId: 'coach-1' });
            render(<MessageThread {...baseProps} messages={[msg]} />);

            fireEvent.mouseEnter(screen.getByText('Hello there').closest('[class*="flex"]')!.parentElement!);
            fireEvent.click(screen.getByRole('button', { name: /delete message/i }));

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    '/api/coach/coach-1/messages/player-1/msg-abc',
                    { method: 'DELETE' }
                );
            });
        });

        it('calls player DELETE API when userType is player', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });

            const msg = makeMessage({ id: 'msg-xyz', senderId: 'player-1', senderType: 'player' });
            render(
                <MessageThread
                    {...baseProps}
                    currentUserId="player-1"
                    userType="player"
                    messages={[msg]}
                />
            );

            fireEvent.mouseEnter(screen.getByText('Hello there').closest('[class*="flex"]')!.parentElement!);
            fireEvent.click(screen.getByRole('button', { name: /delete message/i }));

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    '/api/player/player-1/messages/coach-1/msg-xyz',
                    { method: 'DELETE' }
                );
            });
        });
    });

    describe('send message', () => {
        it('POSTs to coach API and clears input on success', async () => {
            render(<MessageThread {...baseProps} messages={[]} />);

            fireEvent.change(screen.getByRole('textbox', { name: /message input/i }), {
                target: { value: 'Test message' },
            });
            fireEvent.click(screen.getByRole('button', { name: /send message/i }));

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    '/api/coach/coach-1/messages/player-1',
                    expect.objectContaining({
                        method: 'POST',
                        body: JSON.stringify({ content: 'Test message' }),
                    })
                );
            });

            await waitFor(() => {
                expect(screen.getByRole('textbox', { name: /message input/i })).toHaveValue('');
            });
        });

        it('POSTs to player API when userType is player', async () => {
            render(
                <MessageThread
                    {...baseProps}
                    currentUserId="player-1"
                    userType="player"
                    messages={[]}
                />
            );

            fireEvent.change(screen.getByRole('textbox', { name: /message input/i }), {
                target: { value: 'Player reply' },
            });
            fireEvent.click(screen.getByRole('button', { name: /send message/i }));

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    '/api/player/player-1/messages/coach-1',
                    expect.objectContaining({ method: 'POST' })
                );
            });
        });

        it('shows error message when send fails', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Failed to send message' }),
            });

            render(<MessageThread {...baseProps} messages={[]} />);

            fireEvent.change(screen.getByRole('textbox', { name: /message input/i }), {
                target: { value: 'Test' },
            });
            fireEvent.click(screen.getByRole('button', { name: /send message/i }));

            await waitFor(() => {
                expect(screen.getByRole('alert')).toHaveTextContent('Failed to send message');
            });
        });

        it('does not clear input when send fails', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Server error' }),
            });

            render(<MessageThread {...baseProps} messages={[]} />);
            const input = screen.getByRole('textbox', { name: /message input/i });

            fireEvent.change(input, { target: { value: 'My draft' } });
            fireEvent.click(screen.getByRole('button', { name: /send message/i }));

            await waitFor(() => {
                expect(input).toHaveValue('My draft');
            });
        });

        it('sends on Enter key press', async () => {
            render(<MessageThread {...baseProps} messages={[]} />);
            const input = screen.getByRole('textbox', { name: /message input/i });

            fireEvent.change(input, { target: { value: 'Enter send' } });
            fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    '/api/coach/coach-1/messages/player-1',
                    expect.objectContaining({ method: 'POST' })
                );
            });
        });

        it('does not send on Shift+Enter', () => {
            render(<MessageThread {...baseProps} messages={[]} />);
            const input = screen.getByRole('textbox', { name: /message input/i });

            fireEvent.change(input, { target: { value: 'Newline' } });
            fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });

            expect(global.fetch).not.toHaveBeenCalled();
        });
    });

    describe('socket event handling', () => {
        it('registers new_message and message_deleted listeners', () => {
            render(<MessageThread {...baseProps} messages={[]} />);
            expect(mockSocket.on).toHaveBeenCalledWith('new_message', expect.any(Function));
            expect(mockSocket.on).toHaveBeenCalledWith('message_deleted', expect.any(Function));
        });

        it('appends new message received via socket', () => {
            render(<MessageThread {...baseProps} messages={[]} />);

            const newMsgHandler = (mockSocket.on as jest.Mock).mock.calls.find(
                ([event]) => event === 'new_message'
            )![1];

            act(() => {
                newMsgHandler(makeMessage({ id: 'msg-new', content: 'Socket message' }));
            });

            expect(screen.getByText('Socket message')).toBeInTheDocument();
        });

        it('removes message when message_deleted event fires', () => {
            const msg = makeMessage({ id: 'msg-del', content: 'To be deleted' });
            render(<MessageThread {...baseProps} messages={[msg]} />);

            expect(screen.getByText('To be deleted')).toBeInTheDocument();

            const deletedHandler = (mockSocket.on as jest.Mock).mock.calls.find(
                ([event]) => event === 'message_deleted'
            )![1];

            act(() => {
                deletedHandler({ messageId: 'msg-del' });
            });

            expect(screen.queryByText('To be deleted')).not.toBeInTheDocument();
        });

        it('removes socket listeners on unmount', () => {
            const { unmount } = render(<MessageThread {...baseProps} messages={[]} />);
            unmount();
            expect(mockSocket.off).toHaveBeenCalledWith('new_message', expect.any(Function));
            expect(mockSocket.off).toHaveBeenCalledWith('message_deleted', expect.any(Function));
        });
    });
});
