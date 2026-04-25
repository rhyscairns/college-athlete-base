import { query } from '@/authentication/db/client';
import { logger } from '@/lib/logger';
import type { Conversation, Message, NotificationItem } from '@/messages/types';

/**
 * Get all conversations for a coach, one row per unique player,
 * ordered by the most recent message descending.
 */
export async function getConversationsForCoach(coachId: string): Promise<Conversation[]> {
    logger.debug('Getting conversations for coach', { coachId });

    const rows = await query<{
        player_id: string;
        first_name: string;
        last_name: string;
        sport: string | null;
        position: string | null;
        email: string;
        last_message_at: string;
    }>(
        `SELECT DISTINCT ON (m.player_id)
            m.player_id,
            p.first_name,
            p.last_name,
            p.sport,
            p.position,
            p.email,
            m.created_at AS last_message_at
         FROM messages m
         JOIN players p ON p.id = m.player_id
         WHERE m.coach_id = $1
           AND m.deleted_at IS NULL
         ORDER BY m.player_id, m.created_at DESC`,
        [coachId]
    );

    return rows.map((row) => ({
        counterpartId: row.player_id,
        firstName: row.first_name,
        lastName: row.last_name,
        sport: row.sport ?? undefined,
        position: row.position ?? undefined,
        email: row.email,
        lastMessageAt: row.last_message_at,
    }));
}

/**
 * Get all conversations for a player, one row per unique coach,
 * ordered by the most recent message descending.
 */
export async function getConversationsForPlayer(playerId: string): Promise<Conversation[]> {
    logger.debug('Getting conversations for player', { playerId });

    const rows = await query<{
        coach_id: string;
        first_name: string;
        last_name: string;
        university: string | null;
        position: string | null;
        sport: string | null;
        email: string;
        last_message_at: string;
    }>(
        `SELECT DISTINCT ON (m.coach_id)
            m.coach_id,
            c.first_name,
            c.last_name,
            c.current_organization AS university,
            c.position_title       AS position,
            c.sport,
            c.email,
            m.created_at AS last_message_at
         FROM messages m
         JOIN coaches c ON c.id = m.coach_id
         WHERE m.player_id = $1
           AND m.deleted_at IS NULL
         ORDER BY m.coach_id, m.created_at DESC`,
        [playerId]
    );

    return rows.map((row) => ({
        counterpartId: row.coach_id,
        firstName: row.first_name,
        lastName: row.last_name,
        university: row.university ?? undefined,
        position: row.position ?? undefined,
        sport: row.sport ?? undefined,
        email: row.email,
        lastMessageAt: row.last_message_at,
    }));
}

/**
 * Get all non-deleted messages for a coach-player thread, oldest first.
 */
export async function getMessageThread(coachId: string, playerId: string): Promise<Message[]> {
    logger.debug('Getting message thread', { coachId, playerId });

    const rows = await query<{
        id: string;
        coach_id: string;
        player_id: string;
        sender_type: 'coach' | 'player';
        sender_id: string;
        content: string;
        created_at: string;
        read_at: string | null;
        deleted_at: string | null;
    }>(
        `SELECT id, coach_id, player_id, sender_type, sender_id, content, created_at, read_at, deleted_at
         FROM messages
         WHERE coach_id = $1
           AND player_id = $2
           AND deleted_at IS NULL
         ORDER BY created_at ASC`,
        [coachId, playerId]
    );

    return rows.map((row) => ({
        id: row.id,
        coachId: row.coach_id,
        playerId: row.player_id,
        senderType: row.sender_type,
        senderId: row.sender_id,
        content: row.content,
        createdAt: row.created_at,
        readAt: row.read_at,
        deletedAt: row.deleted_at,
    }));
}

/**
 * Insert a new message and return the full row.
 */
export async function insertMessage(
    coachId: string,
    playerId: string,
    senderType: 'coach' | 'player',
    senderId: string,
    content: string
): Promise<Message> {
    logger.debug('Inserting message', { coachId, playerId, senderType });

    const rows = await query<{
        id: string;
        coach_id: string;
        player_id: string;
        sender_type: 'coach' | 'player';
        sender_id: string;
        content: string;
        created_at: string;
        read_at: string | null;
        deleted_at: string | null;
    }>(
        `INSERT INTO messages (coach_id, player_id, sender_type, sender_id, content)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, coach_id, player_id, sender_type, sender_id, content, created_at, read_at, deleted_at`,
        [coachId, playerId, senderType, senderId, content]
    );

    const row = rows[0];
    return {
        id: row.id,
        coachId: row.coach_id,
        playerId: row.player_id,
        senderType: row.sender_type,
        senderId: row.sender_id,
        content: row.content,
        createdAt: row.created_at,
        readAt: row.read_at,
        deletedAt: row.deleted_at,
    };
}

/**
 * Soft-delete a message by setting deleted_at.
 * Returns false if the message doesn't exist, is already deleted, or doesn't belong to requesterId.
 */
export async function softDeleteMessage(messageId: string, requesterId: string): Promise<boolean> {
    logger.debug('Soft-deleting message', { messageId, requesterId });

    const rows = await query<{ id: string }>(
        `UPDATE messages
         SET deleted_at = NOW()
         WHERE id = $1
           AND sender_id = $2
           AND deleted_at IS NULL
         RETURNING id`,
        [messageId, requesterId]
    );

    return rows.length > 0;
}

/**
 * Mark all unread messages in a thread as read for the given recipient.
 */
export async function markThreadAsRead(
    coachId: string,
    playerId: string,
    readerType: 'coach' | 'player'
): Promise<void> {
    logger.debug('Marking thread as read', { coachId, playerId, readerType });

    // The recipient is the opposite of the sender_type
    const recipientType = readerType === 'coach' ? 'player' : 'coach';

    await query(
        `UPDATE messages
         SET read_at = NOW()
         WHERE coach_id = $1
           AND player_id = $2
           AND sender_type = $3
           AND read_at IS NULL
           AND deleted_at IS NULL`,
        [coachId, playerId, recipientType]
    );
}

/**
 * Get the count of unread messages for a user (messages sent TO them that are unread).
 */
export async function getUnreadCount(userId: string, userType: 'coach' | 'player'): Promise<number> {
    logger.debug('Getting unread count', { userId, userType });

    // Messages sent TO this user = sender_type is the opposite role
    const senderType = userType === 'coach' ? 'player' : 'coach';
    const idColumn = userType === 'coach' ? 'coach_id' : 'player_id';

    const rows = await query<{ count: string }>(
        `SELECT COUNT(*) AS count
         FROM messages
         WHERE ${idColumn} = $1
           AND sender_type = $2
           AND read_at IS NULL
           AND deleted_at IS NULL`,
        [userId, senderType]
    );

    return parseInt(rows[0]?.count ?? '0', 10);
}

/**
 * Get up to 5 most recent unread notifications for a user.
 */
export async function getUnreadNotifications(
    userId: string,
    userType: 'coach' | 'player'
): Promise<NotificationItem[]> {
    logger.debug('Getting unread notifications', { userId, userType });

    const senderType = userType === 'coach' ? 'player' : 'coach';
    const idColumn = userType === 'coach' ? 'coach_id' : 'player_id';
    const nameTable = senderType === 'coach' ? 'coaches' : 'players';
    const nameJoinColumn = senderType === 'coach' ? 's.id = m.coach_id' : 's.id = m.player_id';

    const rows = await query<{
        message_id: string;
        first_name: string;
        last_name: string;
        content: string;
        created_at: string;
        coach_id: string;
        player_id: string;
    }>(
        `SELECT
            m.id AS message_id,
            s.first_name,
            s.last_name,
            m.content,
            m.created_at,
            m.coach_id,
            m.player_id
         FROM messages m
         JOIN ${nameTable} s ON ${nameJoinColumn}
         WHERE m.${idColumn} = $1
           AND m.sender_type = $2
           AND m.read_at IS NULL
           AND m.deleted_at IS NULL
         ORDER BY m.created_at DESC
         LIMIT 5`,
        [userId, senderType]
    );

    return rows.map((row) => ({
        messageId: row.message_id,
        senderName: `${row.first_name} ${row.last_name}`,
        preview: row.content.slice(0, 60),
        sentAt: row.created_at,
        coachId: row.coach_id,
        playerId: row.player_id,
    }));
}

/**
 * Get the display name for a sender (coach or player) by their ID.
 * Returns 'Unknown' if not found.
 */
export async function getSenderName(senderId: string, senderType: 'coach' | 'player'): Promise<string> {
    const table = senderType === 'coach' ? 'coaches' : 'players';
    const rows = await query<{ first_name: string; last_name: string }>(
        `SELECT first_name, last_name FROM ${table} WHERE id = $1`,
        [senderId]
    );
    if (rows.length === 0) return 'Unknown';
    return `${rows[0].first_name} ${rows[0].last_name}`;
}
