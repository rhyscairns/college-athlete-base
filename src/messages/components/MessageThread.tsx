'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import { TypingIndicator } from './TypingIndicator';
import type { Message, MessageThreadProps } from '../types';

const NEAR_BOTTOM_THRESHOLD = 100;

export function MessageThread({
    messages: initialMessages,
    currentUserId,
    userType,
    counterpartName,
    coachId,
    playerId,
}: MessageThreadProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [inputValue, setInputValue] = useState('');
    const [sendError, setSendError] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
    const [isCounterpartTyping, setIsCounterpartTyping] = useState(false);
    // Track which message ids are newly sent (for entrance animation)
    const [newMessageIds, setNewMessageIds] = useState<Set<string>>(new Set());

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const room = `conversation:${coachId}:${playerId}`;
    const { socket } = useSocket(room);

    const isNearBottom = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container) return true;
        return container.scrollHeight - container.scrollTop - container.clientHeight < NEAR_BOTTOM_THRESHOLD;
    }, []);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // Scroll to bottom on initial load
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
    }, []);

    // Listen for real-time events
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message: Message) => {
            const wasNearBottom = isNearBottom();
            setMessages((prev) => {
                if (prev.some((m) => m.id === message.id)) return prev;
                return [...prev, message];
            });
            // Animate incoming counterpart messages
            if (message.senderId !== currentUserId) {
                setNewMessageIds(prev => new Set(prev).add(message.id));
                setTimeout(() => setNewMessageIds(prev => {
                    const next = new Set(prev);
                    next.delete(message.id);
                    return next;
                }), 600);
            }
            if (wasNearBottom) {
                setTimeout(scrollToBottom, 50);
            }
        };

        const handleTyping = () => {
            setIsCounterpartTyping(true);
            // Auto-clear after 3s in case the stop event is missed
            setTimeout(() => setIsCounterpartTyping(false), 3000);
        };

        const handleStopTyping = () => setIsCounterpartTyping(false);

        const handleMessageDeleted = ({ messageId }: { messageId: string }) => {
            setMessages((prev) => prev.filter((m) => m.id !== messageId));
        };

        socket.on('new_message', handleNewMessage);
        socket.on('message_deleted', handleMessageDeleted);
        socket.on('typing', handleTyping);
        socket.on('stop_typing', handleStopTyping);

        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('message_deleted', handleMessageDeleted);
            socket.off('typing', handleTyping);
            socket.off('stop_typing', handleStopTyping);
        };
    }, [socket, isNearBottom, scrollToBottom]);

    const handleSend = async () => {
        const content = inputValue.trim();
        if (!content) return;

        setSendError(null);
        setIsSending(true);

        try {
            const url =
                userType === 'coach'
                    ? `/api/coach/${coachId}/messages/${playerId}`
                    : `/api/player/${playerId}/messages/${coachId}`;

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            });

            if (!res.ok) {
                const data = await res.json();
                setSendError(data.error ?? 'Failed to send message');
                return;
            }

            const { data: newMessage } = await res.json();
            // Append the sent message directly from the API response so it appears
            // immediately regardless of socket connection state. The socket handler
            // deduplicates by id to avoid doubles if the echo also arrives.
            setMessages((prev) =>
                prev.some((m) => m.id === newMessage.id) ? prev : [...prev, newMessage]
            );
            // Animate the new bubble
            setNewMessageIds(prev => new Set(prev).add(newMessage.id));
            setTimeout(() => setNewMessageIds(prev => {
                const next = new Set(prev);
                next.delete(newMessage.id);
                return next;
            }), 600);
            setInputValue('');
            setTimeout(scrollToBottom, 50);
        } catch {
            setSendError('Failed to send message. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    const handleDelete = async (messageId: string) => {
        // Optimistically remove from state immediately
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
        setHoveredMessageId(null);

        const url =
            userType === 'coach'
                ? `/api/coach/${coachId}/messages/${playerId}/${messageId}`
                : `/api/player/${playerId}/messages/${coachId}/${messageId}`;

        try {
            const res = await fetch(url, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                console.error('Delete failed:', data.error);
                // Revert — re-fetch the thread to restore accurate state
                const threadUrl =
                    userType === 'coach'
                        ? `/api/coach/${coachId}/messages/${playerId}`
                        : `/api/player/${playerId}/messages/${coachId}`;
                const threadRes = await fetch(threadUrl);
                if (threadRes.ok) {
                    const { data: restored } = await threadRes.json();
                    setMessages(restored);
                }
            }
        } catch {
            console.error('Failed to delete message');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full" style={{ background: 'var(--ink-0)' }}>
            {/* Header */}
            <div
                className="px-4 py-3 border-b"
                style={{ borderColor: 'var(--ink-3)', background: 'var(--ink-1)' }}
            >
                <h2 className="text-base font-semibold" style={{ color: 'var(--text-hi)' }}>
                    {counterpartName}
                </h2>
            </div>

            {/* Messages */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
                data-testid="messages-container"
            >
                {messages.length === 0 && (
                    <p className="text-center text-sm py-8" style={{ color: 'var(--text-lo)' }}>
                        No messages yet. Say hello!
                    </p>
                )}
                {messages.map((message) => {
                    const isOwn = message.senderId === currentUserId;
                    const isNew = newMessageIds.has(message.id);
                    return (
                        <div
                            key={message.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            onMouseEnter={() => isOwn && setHoveredMessageId(message.id)}
                            onMouseLeave={() => setHoveredMessageId(null)}
                        >
                            <div className={`relative group max-w-[70%] flex items-end gap-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div
                                    className={`px-4 py-2 rounded-2xl text-sm break-words${isNew ? ' bubble-enter' : ''} ${isOwn
                                        ? 'rounded-br-sm'
                                        : 'rounded-bl-sm'
                                        }`}
                                    style={{
                                        background: isOwn ? 'var(--brand-500)' : 'var(--ink-2)',
                                        color: isOwn ? 'var(--ink-0)' : 'var(--text-hi)',
                                    }}
                                    data-testid={isOwn ? 'message-bubble-own' : 'message-bubble-other'}
                                >
                                    {message.content}
                                </div>
                                {isOwn && hoveredMessageId === message.id && (
                                    <button
                                        onClick={() => handleDelete(message.id)}
                                        aria-label="Delete message"
                                        className="p-1 transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-1"
                                        style={{ color: 'var(--status-danger)' }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Typing indicator (task 4.2) */}
                {isCounterpartTyping && (
                    <TypingIndicator name={counterpartName} />
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div
                className="border-t px-4 py-3"
                style={{ borderColor: 'var(--ink-3)', background: 'var(--ink-1)' }}
            >
                {sendError && (
                    <p className="text-xs mb-2" role="alert" style={{ color: 'var(--status-danger)' }}>
                        {sendError}
                    </p>
                )}
                <div className="flex gap-2 items-end">
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        rows={1}
                        aria-label="Message input"
                        className="flex-1 resize-none rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2"
                        style={{
                            background: 'var(--ink-2)',
                            color: 'var(--text-hi)',
                            border: '1px solid var(--ink-3)',
                        }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isSending || !inputValue.trim()}
                        aria-label="Send message"
                        className="px-4 py-2 text-sm font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
                        style={{
                            background: 'var(--brand-500)',
                            color: 'var(--ink-0)',
                        }}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
