'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
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
                // Deduplicate — sender already appended this optimistically
                if (prev.some((m) => m.id === message.id)) return prev;
                return [...prev, message];
            });
            if (wasNearBottom) {
                setTimeout(scrollToBottom, 50);
            }
        };

        const handleMessageDeleted = ({ messageId }: { messageId: string }) => {
            setMessages((prev) => prev.filter((m) => m.id !== messageId));
        };

        socket.on('new_message', handleNewMessage);
        socket.on('message_deleted', handleMessageDeleted);

        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('message_deleted', handleMessageDeleted);
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
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-white">
                <h2 className="text-base font-semibold text-gray-900">{counterpartName}</h2>
            </div>

            {/* Messages */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
                data-testid="messages-container"
            >
                {messages.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-8">
                        No messages yet. Say hello!
                    </p>
                )}
                {messages.map((message) => {
                    const isOwn = message.senderId === currentUserId;
                    return (
                        <div
                            key={message.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            onMouseEnter={() => isOwn && setHoveredMessageId(message.id)}
                            onMouseLeave={() => setHoveredMessageId(null)}
                        >
                            <div className={`relative group max-w-[70%] flex items-end gap-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div
                                    className={`px-4 py-2 rounded-2xl text-sm break-words ${isOwn
                                        ? 'bg-blue-600 text-white rounded-br-sm'
                                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                                        }`}
                                >
                                    {message.content}
                                </div>
                                {isOwn && hoveredMessageId === message.id && (
                                    <button
                                        onClick={() => handleDelete(message.id)}
                                        aria-label="Delete message"
                                        className="p-1 text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-gray-200 bg-white px-4 py-3">
                {sendError && (
                    <p className="text-red-500 text-xs mb-2" role="alert">
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
                        className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isSending || !inputValue.trim()}
                        aria-label="Send message"
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
