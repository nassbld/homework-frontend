import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import { fetchConversations, fetchConversationMessages } from '../services/chatApi';
import type { ConversationSnippet, ChatMessage } from '../types';
import { FiSend } from 'react-icons/fi';

export default function ChatPage() {
    const { user } = useAuth();
    const location = useLocation();

    const [conversations, setConversations] = useState<ConversationSnippet[]>([]);
    const [activeConv, setActiveConv] = useState<ConversationSnippet | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [draft, setDraft] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null); // Réf pour l'auto-scroll

    // --- Logique de réception des messages en temps réel ---
    const handleIncomingMessage = useCallback((newMessage: ChatMessage) => {
        // On met à jour la liste des messages seulement si le message
        // appartient à la conversation actuellement ouverte.
        if (activeConv && newMessage.sender.id === activeConv.otherUserId) {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        }

        // On met aussi à jour le snippet dans la liste de gauche et on trie
        setConversations(prevConvs =>
            prevConvs.map(c =>
                c.conversationId.toString() === activeConv?.conversationId.toString() // Comparaison sûre
                    ? { ...c, lastMessageContent: newMessage.content, lastMessageTimestamp: newMessage.timestamp }
                    : c
            ).sort((a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime())
        );

    }, [activeConv]); // La fonction est recréée si la conversation active change

    const { sendMessage, isConnected } = useChat(handleIncomingMessage);

    // --- Logique de chargement initial et d'ouverture de conversation ---
    useEffect(() => {
        const openConversationId = (location.state as { openConversationId?: number })?.openConversationId;

        fetchConversations().then(loadedConversations => {
            setConversations(loadedConversations);

            if (openConversationId) {
                const targetConv = loadedConversations.find(c => c.conversationId === openConversationId);
                if (targetConv) {
                    openConversation(targetConv);
                }
                // Nettoie l'état de la navigation pour éviter la réouverture au rafraîchissement
                window.history.replaceState({}, document.title);
            }
        }).catch(console.error);
    }, [location.state]);

    // --- Logique d'auto-scroll ---
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const openConversation = async (conv: ConversationSnippet) => {
        setActiveConv(conv);
        setMessages([]); // Vide les messages précédents pour un effet de chargement
        const history = await fetchConversationMessages(conv.conversationId);
        setMessages(history);
    };

    const onSend = () => {
        const recipientId = activeConv?.otherUserId;
        if (!recipientId || !draft.trim() || !isConnected) return;

        sendMessage(recipientId, draft.trim());

        const optimisticMessage: ChatMessage = {
            id: Date.now(),
            sender: { id: user!.id, firstName: user!.firstName, lastName: user!.lastName },
            content: draft.trim(),
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, optimisticMessage]);

        setDraft('');
    };

    if (!user) {
        return <div className="h-screen flex items-center justify-center text-stone-600">Connexion requise</div>;
    }

    return (
        <div className="h-screen bg-orange-50 flex flex-col">
            <header className="bg-white shadow-sm z-10">
                <div className="container mx-auto px-6 py-4">
                    <h1 className="text-2xl font-bold text-stone-800">Messagerie</h1>
                </div>
            </header>

            <main className="flex-grow flex overflow-hidden">
                {/* --- Colonne de gauche : Liste des conversations --- */}
                <aside className="w-full md:w-1/3 lg:w-1/4 border-r border-stone-200 bg-white overflow-y-auto">
                    <div className="p-4">
                        <h2 className="text-lg font-semibold text-stone-700">Conversations</h2>
                        <div className="mt-4 space-y-1">
                            {conversations.map((conv) => (
                                <button
                                    key={conv.conversationId}
                                    onClick={() => openConversation(conv)}
                                    className={`w-full text-left p-3 rounded-lg transition-colors ${activeConv?.conversationId === conv.conversationId ? 'bg-orange-100' : 'hover:bg-stone-50'}`}
                                >
                                    <p className="font-bold text-stone-800">
                                        {conv.otherUserFirstName} {conv.otherUserLastName}
                                    </p>
                                    <p className="text-sm text-stone-600 truncate">{conv.lastMessageContent}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* --- Colonne de droite : Conversation active --- */}
                <section className="hidden md:flex w-2/3 lg:w-3/4 flex-col">
                    {activeConv ? (
                        <>
                            {/* Header de la conversation active */}
                            <div className="p-4 border-b border-stone-200 bg-white">
                                <h3 className="text-xl font-semibold text-stone-800">
                                    {activeConv.otherUserFirstName} {activeConv.otherUserLastName}
                                </h3>
                            </div>

                            {/* Zone des messages */}
                            <div className="flex-grow p-6 overflow-y-auto space-y-4">
                                {messages.map((m) => {
                                    const isMine = m.sender.id === user.id;
                                    return (
                                        <div key={m.id} className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`${isMine ? 'bg-orange-600 text-white' : 'bg-stone-200 text-stone-800'} p-3 rounded-xl max-w-[70%] shadow-sm`}>
                                                {m.content}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} /> {/* Élément vide pour le scroll */}
                            </div>

                            {/* Zone de saisie */}
                            <div className="p-4 bg-white border-t border-stone-200">
                                <div className="relative flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={draft}
                                        onChange={(e) => setDraft(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && onSend()}
                                        placeholder={isConnected ? "Écrivez votre message..." : "Connexion au chat en cours..."}
                                        disabled={!isConnected}
                                        className="w-full pl-4 pr-12 py-3 border border-stone-300 rounded-full focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-stone-100 disabled:cursor-not-allowed"
                                    />
                                    <button
                                        onClick={onSend}
                                        disabled={!draft.trim() || !isConnected}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-transform transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FiSend className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-stone-500">
                            Sélectionnez une conversation pour commencer à discuter.
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
