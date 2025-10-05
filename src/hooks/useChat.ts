import {useEffect, useRef, useState} from 'react';
import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './useAuth';
import type { ChatMessage } from '../types';

type OnMessage = (msg: ChatMessage) => void;

export function useChat(onMessage: OnMessage) {
    const { user } = useAuth();
    const clientRef = useRef<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!user) return;

        const token = localStorage.getItem('token') ?? '';
        const url = `http://localhost:8080/ws`;

        const socketFactory = () => new SockJS(url);
        const client = new Client({
            webSocketFactory: socketFactory,
            connectHeaders: { Authorization: `Bearer ${token}` },
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('STOMP connecté.');
                setIsConnected(true);
                client.subscribe(`/user/${user.id}/queue/messages`, (frame: IMessage) => {
                    if (!frame.body) return;
                    const parsed = JSON.parse(frame.body) as ChatMessage;
                    onMessage(parsed);
                });
            },
            onDisconnect: () => {
                console.log('STOMP déconnecté.');
                setIsConnected(false);
            },
            onStompError: () => {},
            onWebSocketError: () => {},
        });

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
            clientRef.current = null;
        };
    }, [user, onMessage]);

    const sendMessage = (recipientId: number, content: string) => {
        if (!clientRef.current || !clientRef.current.active || !user) return;
        const payload = { recipientId, content };
        clientRef.current.publish({
            destination: '/app/chat',
            body: JSON.stringify(payload),
        });
    };

    return { sendMessage, isConnected };
}
