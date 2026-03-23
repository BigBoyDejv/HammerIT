import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { messageService } from '../services';

interface Conversation {
    id: string;
    participant_1: string;
    participant_2: string;
    last_message_at: string;
    participant1?: { full_name: string; avatar_url: string | null };
    participant2?: { full_name: string; avatar_url: string | null };
    last_message?: { content: string; created_at: string };
}

interface Message {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    read_at: string | null;
    sender?: { full_name: string; avatar_url: string | null };
}

export function MessagesPage() {
    const { user, profile } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const subscriptionRef = useRef<any>(null);

    useEffect(() => {
        loadConversations();
        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
            }
        };
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            loadMessages(selectedConversation.id);
            subscribeToMessages(selectedConversation.id);
        }
    }, [selectedConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadConversations = async () => {
        try {
            const data = await messageService.getUserConversations(user!.id);
            setConversations(data || []);
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (conversationId: string) => {
        try {
            const data = await messageService.getMessages(conversationId);
            setMessages(data || []);
            // Označiť ako prečítané
            await messageService.markAsRead(conversationId, user!.id);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const subscribeToMessages = (conversationId: string) => {
        if (subscriptionRef.current) {
            subscriptionRef.current.unsubscribe();
        }

        subscriptionRef.current = messageService.subscribeToMessages(
            conversationId,
            (newMessage) => {
                setMessages(prev => [...prev, newMessage]);
                if (newMessage.sender_id !== user!.id) {
                    messageService.markAsRead(conversationId, user!.id);
                }
            }
        );
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        setSending(true);
        try {
            await messageService.sendMessage(
                selectedConversation.id,
                user!.id,
                newMessage.trim()
            );
            setNewMessage('');
            // Aktualizovať konverzácie (posledná správa)
            loadConversations();
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Nepodarilo sa odoslať správu');
        } finally {
            setSending(false);
        }
    };

    const getOtherParticipant = (conversation: Conversation) => {
        const isFirst = conversation.participant_1 === user!.id;
        const participant = isFirst ? conversation.participant2 : conversation.participant1;
        return participant;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#191970]"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Správy</h1>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="flex h-[600px]">
                    {/* Zoznam konverzácií */}
                    <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                Žiadne konverzácie
                            </div>
                        ) : (
                            conversations.map((conv) => {
                                const other = getOtherParticipant(conv);
                                return (
                                    <button
                                        key={conv.id}
                                        onClick={() => setSelectedConversation(conv)}
                                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${selectedConversation?.id === conv.id ? 'bg-gray-50' : ''
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                {other?.full_name?.charAt(0) || 'U'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-900">{other?.full_name}</div>
                                                {conv.last_message && (
                                                    <p className="text-sm text-gray-500 truncate">
                                                        {conv.last_message.content}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Chat okno */}
                    <div className="flex-1 flex flex-col">
                        {selectedConversation ? (
                            <>
                                {/* Hlavička chatu */}
                                <div className="p-4 border-b border-gray-200 bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                            {getOtherParticipant(selectedConversation)?.full_name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {getOtherParticipant(selectedConversation)?.full_name}
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                {/* Správy */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {messages.map((msg) => {
                                        const isOwn = msg.sender_id === user!.id;
                                        return (
                                            <div
                                                key={msg.id}
                                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[70%] rounded-lg px-4 py-2 ${isOwn
                                                        ? 'bg-[#191970] text-white'
                                                        : 'bg-gray-100 text-gray-900'
                                                        }`}
                                                >
                                                    <p>{msg.content}</p>
                                                    <div className={`text-xs mt-1 ${isOwn ? 'text-gray-300' : 'text-gray-500'}`}>
                                                        {new Date(msg.created_at).toLocaleTimeString('sk-SK', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Vstup pre správu */}
                                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Napíšte správu..."
                                            className="form-input flex-1"
                                        />
                                        <button
                                            type="submit"
                                            disabled={sending || !newMessage.trim()}
                                            className="btn-primary"
                                        >
                                            {sending ? '...' : 'Odoslať'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-500">
                                Vyberte konverzáciu pre zobrazenie správ
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}