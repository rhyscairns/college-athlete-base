export interface Message {
    id: string;
    coachId: string;
    playerId: string;
    senderType: 'coach' | 'player';
    senderId: string;
    content: string;
    createdAt: string; // ISO string
    readAt: string | null;
    deletedAt: string | null;
}

export interface Conversation {
    counterpartId: string; // playerId (for coach) or coachId (for player)
    firstName: string;
    lastName: string;
    university?: string; // coach conversations only
    sport?: string;
    position?: string;
    email: string;
    lastMessageAt: string; // ISO string
}

export interface MessagesTableProps {
    conversations: Conversation[];
    currentUserId: string;
    userType: 'coach' | 'player';
    emptyMessage: string;
}

export interface MessageThreadProps {
    messages: Message[];
    currentUserId: string;
    userType: 'coach' | 'player';
    counterpartName: string;
    coachId: string;
    playerId: string;
}

export interface NotificationBellProps {
    userId: string;
    userType: 'coach' | 'player';
}

export interface NotificationItem {
    messageId: string;
    senderName: string;
    preview: string; // first ~60 chars of content
    sentAt: string; // ISO string
    coachId: string;
    playerId: string;
}
