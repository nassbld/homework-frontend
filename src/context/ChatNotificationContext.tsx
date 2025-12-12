import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchConversations } from '../services/chatApi';
import type { ConversationSnippet } from '../types';

interface ChatNotificationContextValue {
    unreadCount: number;
    refreshUnread: () => void;
    markConversationRead: (conversationId: number, latestTimestamp?: string | null) => void;
    isConversationUnread: (conversationId: number) => boolean;
}

const ChatNotificationContext = createContext<ChatNotificationContextValue | undefined>(undefined);

type LastSeenMap = Record<string, string>;
const STORAGE_KEY = 'chat:lastSeenMap';

function loadStoredMap(): LastSeenMap {
    if (typeof window === 'undefined') {
        return {};
    }

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveMap(map: LastSeenMap) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch {
        // ignore storage errors
    }
}

export function ChatNotificationProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [lastSeenMap, setLastSeenMap] = useState<LastSeenMap>(() => loadStoredMap());
    const [unreadConversations, setUnreadConversations] = useState<Set<number>>(new Set());

    useEffect(() => {
        saveMap(lastSeenMap);
    }, [lastSeenMap]);

    const evaluateUnread = useCallback(
        (conversations: ConversationSnippet[], previousMap: LastSeenMap) => {
            const updatedMap: LastSeenMap = { ...previousMap };
            const nextUnread = new Set<number>();

            conversations.forEach((conv) => {
                const { conversationId, lastMessageTimestamp, lastMessageSenderId } = conv;
                if (!lastMessageTimestamp) {
                    return;
                }

                const key = String(conversationId);
                const senderIsCurrentUser = lastMessageSenderId !== undefined && user && lastMessageSenderId === user.id;

                if (senderIsCurrentUser) {
                    updatedMap[key] = lastMessageTimestamp;
                    return;
                }

                const storedLastSeen = updatedMap[key];
                // String equality check to avoid Date parsing issues
                if (storedLastSeen === lastMessageTimestamp) {
                    return;
                }

                const lastSeen = storedLastSeen ? new Date(storedLastSeen) : null;
                const lastMessageDate = new Date(lastMessageTimestamp);

                if (lastSeen && lastMessageDate <= lastSeen) {
                    return;
                }

                nextUnread.add(conversationId);
            });

            setUnreadConversations(nextUnread);
            return updatedMap;
        },
        [user]
    );

    const refreshUnread = useCallback(async () => {
        if (!user) {
            setUnreadConversations(new Set());
            setLastSeenMap({});
            return;
        }

        try {
            const conversations = await fetchConversations();
            setLastSeenMap((prev) => evaluateUnread(conversations, prev));
        } catch (error) {
            console.error('Impossible de récupérer les conversations pour le badge de messagerie.', error);
        }
    }, [user, evaluateUnread]);

    useEffect(() => {
        if (!user) {
            setUnreadConversations(new Set());
            setLastSeenMap({});
            return;
        }

        refreshUnread();
        const interval = setInterval(refreshUnread, 60000);
        return () => clearInterval(interval);
    }, [user, refreshUnread]);

    const markConversationRead = useCallback((conversationId: number, latestTimestamp?: string | null) => {
        const timestampToStore = latestTimestamp ?? new Date().toISOString();
        const key = String(conversationId);

        setLastSeenMap((prev) => {
            const next = {
                ...prev,
                [key]: timestampToStore,
            };
            saveMap(next);
            return next;
        });

        setUnreadConversations((prev) => {
            if (!prev.has(conversationId)) {
                return prev;
            }
            const updated = new Set(prev);
            updated.delete(conversationId);
            return updated;
        });
    }, []);

    const isConversationUnread = useCallback(
        (conversationId: number) => unreadConversations.has(conversationId),
        [unreadConversations]
    );

    return (
        <ChatNotificationContext.Provider
            value={{
                unreadCount: unreadConversations.size,
                refreshUnread,
                markConversationRead,
                isConversationUnread,
            }}
        >
            {children}
        </ChatNotificationContext.Provider>
    );
}

export function useChatNotifications() {
    const context = useContext(ChatNotificationContext);
    if (!context) {
        throw new Error('useChatNotifications must be used within a ChatNotificationProvider');
    }
    return context;
}

