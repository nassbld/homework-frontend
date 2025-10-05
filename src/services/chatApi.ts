import apiClient from './api';
import type { ConversationSnippet, ChatMessage } from '../types';

export async function startOrGetConversation(otherUserId: number) {
    const res = await apiClient.post<{ conversationId: number }>('/conversations/start', { otherUserId });
    return res.data;
}

export async function fetchConversations() {
    const res = await apiClient.get<ConversationSnippet[]>('/conversations');
    return res.data;
}

export async function fetchConversationMessages(conversationId: number) {
    const res = await apiClient.get<ChatMessage[]>(`/conversations/${conversationId}/messages`);
    return res.data;
}
