import {useEffect, useRef, useState} from 'react';
import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './useAuth';
import type { ChatMessageResponse } from '../types';

type OnMessage = (msg: ChatMessageResponse) => void;

export function useChat(onMessage: OnMessage) {
    const { user } = useAuth();
    const clientRef = useRef<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // ✅ Ne pas se connecter si pas d'utilisateur
        if (!user) {
            console.log('WebSocket: User not authenticated, skipping connection');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            console.log('WebSocket: No token found, skipping connection');
            return;
        }

        const sockJsUrl = `http://localhost:8080/ws?token=${token}`;
        const brokerURL = `ws://localhost:8080/ws`;

        const client = new Client({
            brokerURL: brokerURL,
            webSocketFactory: () => new SockJS(sockJsUrl),
            connectHeaders: { Authorization: `Bearer ${token}` },
            reconnectDelay: 0,
            onConnect: () => {
                console.log('✅ STOMP connecté.');
                setIsConnected(true);
                if (user?.id) {
                    client.subscribe(`/user/queue/messages`, (frame: IMessage) => {
                        if (!frame.body) return;
                        const parsed = JSON.parse(frame.body) as ChatMessageResponse;
                        onMessage(parsed);
                    });
                }
            },
            onDisconnect: () => {
                console.log('❌ STOMP déconnecté.');
                setIsConnected(false);
            },
            onStompError: (frame) => {
                // ⚠️ NOUVEAU : Gérer les erreurs STOMP (JWT expiré, etc.)
                console.error('❌ Erreur STOMP:', frame.headers['message']);

                // Si JWT expiré, déconnecter proprement
                if (frame.headers['message']?.includes('JWT') || frame.headers['message']?.includes('expired')) {
                    console.warn('JWT expiré dans WebSocket, déconnexion...');
                    client.deactivate();
                    localStorage.removeItem('token');
                    window.location.href = '/login?expired=true';
                }
            },
            debug: (str) => {
                console.log(new Date(), str);
            }
        });

        client.activate();
        clientRef.current = client;

        return () => {
            console.log('🔌 Nettoyage connexion WebSocket');
            client.deactivate();
            clientRef.current = null;
            setIsConnected(false);
        };
    }, [user, onMessage]);

    const sendMessage = (recipientId: number, content: string) => {
        if (!clientRef.current || !clientRef.current.active || !user) {
            console.warn('Cannot send message: WebSocket not connected');
            return;
        }
        const payload = { recipientId, content };
        clientRef.current.publish({
            destination: '/app/chat',
            body: JSON.stringify(payload),
        });
    };

    return { sendMessage, isConnected };
}
