import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { messageService } from '../services';
import { supabase } from '../lib/supabase';
import { Search, Send, ArrowLeft } from 'lucide-react';

interface Conversation {
    id: string;
    participant_1: string;
    participant_2: string;
    last_message_at: string;
    participant1?: { full_name: string; avatar_url: string | null } | null;
    participant2?: { full_name: string; avatar_url: string | null } | null;
    last_message?: { content: string; created_at: string } | null;
    unread_count?: number;
}

interface Message {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    read_at: string | null;
    sender?: { full_name: string; avatar_url: string | null } | null;
}

export function MessagesPage() {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewChat, setShowNewChat] = useState(false);
    const [availableUsers, setAvailableUsers] = useState<any[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const subscriptionRef = useRef<any>(null);

    // Scroll na spodok
    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    // Načítať všetky konverzácie používateľa
    const loadConversations = async () => {
        try {
            const data = await messageService.getUserConversations(user!.id);

            // Získať počet neprečítaných správ pre každú konverzáciu
            const conversationsWithUnread = await Promise.all(
                (data || []).map(async (conv: Conversation) => {
                    const { count } = await supabase
                        .from('messages')
                        .select('*', { count: 'exact', head: true })
                        .eq('conversation_id', conv.id)
                        .neq('sender_id', user!.id)
                        .is('read_at', null);

                    return { ...conv, unread_count: count || 0 };
                })
            );

            setConversations(conversationsWithUnread);
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    // Načítať správy v konverzácii
    const loadMessages = async (conversationId: string) => {
        try {
            const data = await messageService.getMessages(conversationId);
            setMessages((data as Message[]) || []);

            await messageService.markAsRead(conversationId, user!.id);
            setConversations(prev => prev.map(c =>
                c.id === conversationId ? { ...c, unread_count: 0 } : c
            ));

            scrollToBottom();
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    // Real-time subskripcia na nové správy v aktuálnej konverzácii
    const subscribeToMessages = (conversationId: string) => {
        if (subscriptionRef.current) {
            subscriptionRef.current.unsubscribe();
        }

        subscriptionRef.current = supabase
            .channel(`chat:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                async (payload) => {
                    // Načítať kompletnú správu so senderom
                    const { data: fullMessage } = await supabase
                        .from('messages')
                        .select(`
                            *,
                            sender:profiles!sender_id (
                                full_name,
                                avatar_url
                            )
                        `)
                        .eq('id', payload.new.id)
                        .single();

                    if (fullMessage) {
                        // Pridať správu do zoznamu
                        setMessages(prev => [...prev, fullMessage]);

                        // Scroll na spodok
                        scrollToBottom();

                        // Označiť ako prečítané, ak správu poslal niekto iný
                        if (fullMessage.sender_id !== user!.id) {
                            await messageService.markAsRead(conversationId, user!.id);
                            // Aktualizovať unread count
                            setConversations(prev => prev.map(c =>
                                c.id === conversationId ? { ...c, unread_count: 0 } : c
                            ));
                        }

                        // Aktualizovať zoznam konverzácií (posledná správa)
                        loadConversations();
                    }
                }
            )
            .subscribe();
    };

    // Globálne real-time subskripcie pre aktualizáciu badgeov
    useEffect(() => {
        if (!user) return;

        // Subskripcia na nové správy (pre aktualizáciu zoznamu konverzácií)
        const messageSubscription = supabase
            .channel('messages-global')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages'
                },
                () => {
                    loadConversations();
                    if (selectedConversation) {
                        loadMessages(selectedConversation.id);
                    }
                }
            )
            .subscribe();

        // Subskripcia na zmeny stavu prečítania
        const readSubscription = supabase
            .channel('read-status')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages',
                    filter: `read_at=not.is.null`
                },
                () => {
                    loadConversations();
                    if (selectedConversation) {
                        loadMessages(selectedConversation.id);
                    }
                }
            )
            .subscribe();

        return () => {
            messageSubscription.unsubscribe();
            readSubscription.unsubscribe();
        };
    }, [user, selectedConversation]);

    // Počiatočné načítanie konverzácií
    useEffect(() => {
        loadConversations();

        // Skontrolovať či je v URL parameter user (pre rýchly chat)
        const userId = searchParams.get('user');
        if (userId && userId !== user?.id) {
            startConversationWithUser(userId);
        }

        return () => {
            if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
        };
    }, []);

    // Pri výbere konverzácie
    useEffect(() => {
        if (selectedConversation) {
            loadMessages(selectedConversation.id);
            subscribeToMessages(selectedConversation.id);
        }

        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
            }
        };
    }, [selectedConversation]);

    // Odoslať správu
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

    // Spustiť konverzáciu s používateľom
    const startConversationWithUser = async (otherUserId: string) => {
        try {
            const conversation = await messageService.getOrCreateConversation(user!.id, otherUserId);

            const { data: otherUser } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', otherUserId)
                .single();

            const newConv: Conversation = {
                id: conversation.id,
                participant_1: conversation.participant_1,
                participant_2: conversation.participant_2,
                last_message_at: conversation.last_message_at,
                participant1: conversation.participant_1 === user!.id
                    ? { full_name: profile?.full_name || '', avatar_url: null }
                    : otherUser || null,
                participant2: conversation.participant_2 === user!.id
                    ? { full_name: profile?.full_name || '', avatar_url: null }
                    : otherUser || null
            };

            setSelectedConversation(newConv);
            loadConversations();
        } catch (error) {
            console.error('Error starting conversation:', error);
        }
    };

    // Vyhľadať používateľov pre nový chat
    const searchUsers = async () => {
        if (!searchTerm.trim()) return;

        const { data } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, role')
            .ilike('full_name', `%${searchTerm}%`)
            .neq('id', user!.id)
            .limit(10);

        setAvailableUsers(data || []);
    };

    const getOtherParticipant = (conversation: Conversation): { full_name: string; avatar_url: string | null } | null => {
        const isFirst = conversation.participant_1 === user!.id;
        const participant = isFirst ? conversation.participant2 : conversation.participant1;
        return participant || null;
    };

    // Filtrovať konverzácie podľa vyhľadávania
    const filteredConversations = conversations.filter(conv => {
        const other = getOtherParticipant(conv);
        return other?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#191970]"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Správy</h1>
                <button
                    onClick={() => setShowNewChat(!showNewChat)}
                    className="btn-gradient text-sm py-2 px-4"
                >
                    {showNewChat ? 'Zavrieť' : '+ Nová správa'}
                </button>
            </div>

            {/* Nový chat formulár */}
            {showNewChat && (
                <div className="bg-white rounded-xl shadow-md p-4 mb-6 animate-fade-in">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Hľadať používateľa podľa mena..."
                            className="form-input flex-1"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
                        />
                        <button onClick={searchUsers} className="btn-primary">
                            <Search className="w-4 h-4" />
                        </button>
                    </div>

                    {availableUsers.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {availableUsers.map(userItem => (
                                <button
                                    key={userItem.id}
                                    onClick={() => {
                                        startConversationWithUser(userItem.id);
                                        setShowNewChat(false);
                                        setSearchTerm('');
                                        setAvailableUsers([]);
                                    }}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                        {userItem.full_name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-medium text-gray-900">{userItem.full_name}</p>
                                        <p className="text-xs text-gray-500">
                                            {userItem.role === 'craftsman' ? 'Remeselník' : 'Zákazník'}
                                        </p>
                                    </div>
                                    <Send className="w-4 h-4 text-gray-400" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="flex h-[600px]">
                    {/* Zoznam konverzácií */}
                    <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
                        <div className="p-3 border-b border-gray-100">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Hľadať v konverzáciách..."
                                    className="form-input pl-9 py-2 text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {filteredConversations.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                {searchTerm ? 'Žiadne konverzácie nevyhovujú' : 'Žiadne konverzácie'}
                            </div>
                        ) : (
                            filteredConversations.map((conv) => {
                                const other = getOtherParticipant(conv);
                                const hasUnread = (conv.unread_count || 0) > 0;
                                return (
                                    <button
                                        key={conv.id}
                                        onClick={() => setSelectedConversation(conv)}
                                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-l-4 ${selectedConversation?.id === conv.id
                                            ? 'border-l-coral-500 bg-gray-50'
                                            : 'border-l-transparent'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-coral-500 to-coral-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                {other?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className={`font-medium ${hasUnread ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                                                        {other?.full_name}
                                                    </p>
                                                    {conv.last_message && (
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(conv.last_message.created_at).toLocaleTimeString('sk-SK', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    )}
                                                </div>
                                                {conv.last_message && (
                                                    <p className={`text-sm truncate ${hasUnread ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                                        {conv.last_message.content}
                                                    </p>
                                                )}
                                                {hasUnread && (
                                                    <span className="inline-block mt-1 w-2 h-2 bg-coral-500 rounded-full" />
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
                                <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setSelectedConversation(null)}
                                            className="md:hidden p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                        >
                                            <ArrowLeft className="w-5 h-5" />
                                        </button>
                                        <div className="w-10 h-10 bg-gradient-to-r from-coral-500 to-coral-600 rounded-full flex items-center justify-center text-white font-semibold">
                                            {getOtherParticipant(selectedConversation)?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {getOtherParticipant(selectedConversation)?.full_name}
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                {getOtherParticipant(selectedConversation)?.full_name?.split(' ')[0]}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const other = getOtherParticipant(selectedConversation);
                                            if (other?.full_name) {
                                                navigate(`/craftsmen/${selectedConversation.participant_1 === user!.id ? selectedConversation.participant_2 : selectedConversation.participant_1}`);
                                            }
                                        }}
                                        className="text-sm text-coral-500 hover:underline"
                                    >
                                        Zobraziť profil
                                    </button>
                                </div>

                                {/* Správy */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {messages.length === 0 ? (
                                        <div className="text-center text-gray-500 py-12">
                                            <p>Zatiaľ žiadne správy</p>
                                            <p className="text-sm mt-1">Napíšte prvú správu</p>
                                        </div>
                                    ) : (
                                        messages.map((msg) => {
                                            const isOwn = msg.sender_id === user!.id;
                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${isOwn
                                                            ? 'bg-gradient-to-r from-coral-500 to-coral-600 text-white'
                                                            : 'bg-gray-100 text-gray-900'
                                                            }`}
                                                    >
                                                        <p className="text-sm break-words">{msg.content}</p>
                                                        <div className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>
                                                            {new Date(msg.created_at).toLocaleTimeString('sk-SK', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                            {isOwn && msg.read_at && (
                                                                <span className="ml-1">✓✓</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
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
                                            className="form-input flex-1 rounded-full"
                                        />
                                        <button
                                            type="submit"
                                            disabled={sending || !newMessage.trim()}
                                            className="btn-gradient rounded-full w-10 h-10 p-0 flex items-center justify-center"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <MessageIcon className="w-10 h-10 text-gray-400" />
                                </div>
                                <p className="text-lg font-medium text-gray-600">Vyberte konverzáciu</p>
                                <p className="text-sm mt-1">alebo začnite nový chat</p>
                                <button
                                    onClick={() => setShowNewChat(true)}
                                    className="mt-4 btn-outline text-sm"
                                >
                                    + Nová správa
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Message icon komponent
const MessageIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);