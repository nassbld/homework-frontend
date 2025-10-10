import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import { fetchConversations, fetchConversationMessages } from '../services/chatApi';
import type { ConversationSnippet, ChatMessage, ChatMessageResponse } from '../types';
import { FiSend, FiMessageCircle, FiArrowLeft } from 'react-icons/fi';

export default function ChatPage() {
    const { user } = useAuth();
    const location = useLocation();

    const [conversations, setConversations] = useState<ConversationSnippet[]>([]);
    const [activeConv, setActiveConv] = useState<ConversationSnippet | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [draft, setDraft] = useState('');
    const [showChat, setShowChat] = useState(false); // ⚠️ Pour mobile

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const activeConvRef = useRef<ConversationSnippet | null>(null);

    useEffect(() => {
        activeConvRef.current = activeConv;
    }, [activeConv]);

    const handleIncomingMessage = useCallback((newMessageDto: ChatMessageResponse) => {
        const newMessage: ChatMessage = {
            id: newMessageDto.id,
            sender: {
                id: newMessageDto.senderId,
                firstName: newMessageDto.senderFirstName,
                lastName: newMessageDto.senderLastName
            },
            content: newMessageDto.content,
            timestamp: newMessageDto.timestamp
        };

        const currentConv = activeConvRef.current;

        if (currentConv) {
            const isPartOfConversation =
                newMessage.sender.id === currentConv.otherUserId ||
                newMessage.sender.id === user?.id;

            if (isPartOfConversation) {
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            }
        }

        setConversations(prevConvs =>
            prevConvs.map(c =>
                c.conversationId === currentConv?.conversationId
                    ? { ...c, lastMessageContent: newMessage.content, lastMessageTimestamp: newMessage.timestamp }
                    : c
            ).sort((a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime())
        );
    }, [user]);

    const { sendMessage, isConnected } = useChat(handleIncomingMessage);

    useEffect(() => {
        const openConversationId = (location.state as { openConversationId?: number })?.openConversationId;

        fetchConversations().then(loadedConversations => {
            setConversations(loadedConversations);

            if (openConversationId) {
                const targetConv = loadedConversations.find(c => c.conversationId === openConversationId);
                if (targetConv) {
                    openConversation(targetConv);
                }
                window.history.replaceState({}, document.title);
            }
        }).catch(console.error);
    }, [location.state]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const openConversation = async (conv: ConversationSnippet) => {
        setActiveConv(conv);
        setMessages([]);
        setShowChat(true); // ⚠️ Afficher le chat sur mobile

        try {
            const history = await fetchConversationMessages(conv.conversationId);
            setMessages(Array.isArray(history) ? history : []);
        } catch (error) {
            console.error('Erreur chargement messages:', error);
            setMessages([]);
        }
    };

    const closeConversation = () => {
        setShowChat(false); // ⚠️ Retour à la liste sur mobile
        setActiveConv(null);
    };

    const onSend = () => {
        const recipientId = activeConv?.otherUserId;
        if (!recipientId || !draft.trim() || !isConnected) return;

        sendMessage(recipientId, draft.trim());
        setDraft('');
    };

    if (!user) {
        return (
            <div className="h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
                <div className="text-center">
                    <FiMessageCircle className="w-16 h-16 mx-auto text-orange-600 mb-4" />
                    <p className="text-lg text-stone-600">Connexion requise</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-orange-50 to-orange-100">
            {/* Header - FIXE EN HAUT */}
            <header className="flex-shrink-0 bg-white shadow-sm border-b border-stone-200 z-10">
                <div className="container mx-auto px-4 sm:px-6 py-4">
                    <h1 className="text-2xl font-bold text-stone-800">Messagerie</h1>
                </div>
            </header>

            {/* Main - RESTE DE L'ESPACE DISPONIBLE */}
            <main className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <aside className={`${
                    showChat ? 'hidden md:flex' : 'flex'
                } w-full md:w-80 lg:w-96 border-r border-stone-200 bg-white flex-col`}>
                    <div className="p-4 border-b border-stone-100 flex-shrink-0">
                        <h2 className="text-lg font-semibold text-stone-800">Conversations</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <div className="p-8 text-center text-stone-500">
                                <FiMessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Aucune conversation</p>
                            </div>
                        ) : (
                            <div className="p-2 space-y-1">
                                {conversations.map((conv) => (
                                    <button
                                        key={conv.conversationId}
                                        onClick={() => openConversation(conv)}
                                        className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                                            activeConv?.conversationId === conv.conversationId
                                                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                                                : 'hover:bg-stone-50 text-stone-800'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                                                activeConv?.conversationId === conv.conversationId
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-orange-100 text-orange-600'
                                            }`}>
                                                {conv.otherUserFirstName[0]}{conv.otherUserLastName[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-semibold truncate ${
                                                    activeConv?.conversationId === conv.conversationId ? 'text-white' : 'text-stone-800'
                                                }`}>
                                                    {conv.otherUserFirstName} {conv.otherUserLastName}
                                                </p>
                                                <p className={`text-sm truncate ${
                                                    activeConv?.conversationId === conv.conversationId
                                                        ? 'text-white/80'
                                                        : 'text-stone-500'
                                                }`}>
                                                    {conv.lastMessageContent}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </aside>

                {/* Chat area */}
                <section className={`${
                    showChat ? 'flex' : 'hidden md:flex'
                } flex-1 flex-col bg-white`}>
                    {activeConv ? (
                        <>
                            {/* Chat header - FIXE */}
                            <div className="flex-shrink-0 px-4 py-4 border-b border-stone-200 bg-white shadow-sm">
                                <div className="flex items-center gap-3">
                                    {/* Bouton retour MOBILE ONLY */}
                                    <button
                                        onClick={closeConversation}
                                        className="md:hidden p-2 hover:bg-stone-100 rounded-full transition-colors"
                                    >
                                        <FiArrowLeft className="w-6 h-6 text-stone-600" />
                                    </button>

                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                                        {activeConv.otherUserFirstName[0]}{activeConv.otherUserLastName[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold text-stone-800 truncate">
                                            {activeConv.otherUserFirstName} {activeConv.otherUserLastName}
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            {/* Messages - SCROLL UNIQUEMENT ICI */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 bg-gradient-to-b from-stone-50 to-white">
                                {messages.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-stone-400">
                                        <div className="text-center">
                                            <FiMessageCircle className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 opacity-30" />
                                            <p className="text-sm md:text-base">Aucun message. Commencez la conversation !</p>
                                        </div>
                                    </div>
                                ) : (
                                    messages.map((m) => {
                                        const isMine = m.sender.id === user.id;
                                        return (
                                            <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[85%] md:max-w-[70%] lg:max-w-md ${
                                                    isMine
                                                        ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white'
                                                        : 'bg-white text-stone-800 border border-stone-200'
                                                } px-4 py-3 rounded-2xl shadow-sm`}>
                                                    <p className="break-words text-sm md:text-base">{m.content}</p>
                                                    <p className={`text-xs mt-1 ${
                                                        isMine ? 'text-white/70' : 'text-stone-400'
                                                    }`}>
                                                        {new Date(m.timestamp).toLocaleTimeString('fr-FR', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input - FIXE EN BAS */}
                            <div className="flex-shrink-0 p-3 md:p-4 bg-white border-t border-stone-200">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <input
                                        type="text"
                                        value={draft}
                                        onChange={(e) => setDraft(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSend()}
                                        placeholder={isConnected ? "Message..." : "Connexion..."}
                                        disabled={!isConnected}
                                        className="flex-1 px-4 py-2.5 md:py-3 text-sm md:text-base border border-stone-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-stone-100 disabled:cursor-not-allowed transition-all"
                                    />
                                    <button
                                        onClick={onSend}
                                        disabled={!draft.trim() || !isConnected}
                                        className="flex-shrink-0 p-2.5 md:p-3 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
                                    >
                                        <FiSend className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-stone-50 to-stone-100">
                            <div className="text-center px-4">
                                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-xl">
                                    <FiMessageCircle className="w-8 h-8 md:w-10 md:h-10 text-white" />
                                </div>
                                <h3 className="text-lg md:text-xl font-semibold text-stone-700 mb-2">Aucune conversation</h3>
                                <p className="text-sm md:text-base text-stone-500">Sélectionnez une conversation</p>
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
