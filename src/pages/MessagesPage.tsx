import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { messageService } from '../services';
import { supabase } from '../lib/supabase';
import { Search, Send, ArrowLeft, MoreVertical, Check, CheckCheck } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';

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
    const [typingUser, setTypingUser] = useState<string | null>(null);
    const [showMobileChat, setShowMobileChat] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const subscriptionRef = useRef<any>(null);
    const typingSubRef = useRef<any>(null);
    const readReceiptSubRef = useRef<any>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastTypingSentRef = useRef<number>(0);

    // Smart scroll - only scroll if user is near bottom
    const scrollToBottom = useCallback((force = false) => {
        setTimeout(() => {
            const container = messagesContainerRef.current;
            if (!container) return;
            
            const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
            if (force || isNearBottom) {
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }, 100);
    }, []);

    const loadConversations = async () => {
        try {
            const data = await messageService.getUserConversations(user!.id);
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

    const loadMessages = async (conversationId: string) => {
        try {
            const data = await messageService.getMessages(conversationId);
            setMessages((data as Message[]) || []);
            await messageService.markAsRead(conversationId, user!.id);
            setConversations(prev => prev.map(c =>
                c.id === conversationId ? { ...c, unread_count: 0 } : c
            ));
            scrollToBottom(true);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const subscribeToMessages = (conversationId: string) => {
        // Cleanup previous subscriptions
        if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
        if (typingSubRef.current) typingSubRef.current.unsubscribe();
        if (readReceiptSubRef.current) readReceiptSubRef.current.unsubscribe();

        // Message subscription
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
                    const { data: fullMessage } = await supabase
                        .from('messages')
                        .select(`*, sender:profiles!sender_id (full_name, avatar_url)`)
                        .eq('id', payload.new.id)
                        .single();

                    if (fullMessage) {
                        setMessages(prev => {
                            // Deduplicate
                            if (prev.some(m => m.id === fullMessage.id)) return prev;
                            return [...prev, fullMessage];
                        });
                        scrollToBottom();

                        if (fullMessage.sender_id !== user!.id) {
                            await messageService.markAsRead(conversationId, user!.id);
                            setConversations(prev => prev.map(c =>
                                c.id === conversationId ? { ...c, unread_count: 0 } : c
                            ));
                        }
                        // Clear typing indicator when message arrives
                        setTypingUser(null);
                        loadConversations();
                    }
                }
            )
            .subscribe();

        // Typing indicator subscription
        typingSubRef.current = messageService.subscribeToTyping(conversationId, (data) => {
            if (data.userId !== user!.id) {
                setTypingUser(data.userName);
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
            }
        });

        // Read receipt subscription
        readReceiptSubRef.current = messageService.subscribeToReadReceipts(conversationId, () => {
            // Reload messages to get updated read_at
            loadMessages(conversationId);
        });
    };

    useEffect(() => {
        loadConversations();
        const userId = searchParams.get('user');
        if (userId && userId !== user?.id) {
            startConversationWithUser(userId);
        }
        return () => {
            if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
            if (typingSubRef.current) typingSubRef.current.unsubscribe();
            if (readReceiptSubRef.current) readReceiptSubRef.current.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            loadMessages(selectedConversation.id);
            subscribeToMessages(selectedConversation.id);
        }
        return () => {
            if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
            if (typingSubRef.current) typingSubRef.current.unsubscribe();
            if (readReceiptSubRef.current) readReceiptSubRef.current.unsubscribe();
        };
    }, [selectedConversation]);

    // Handle typing indicator broadcast with throttle
    const handleTyping = () => {
        if (!selectedConversation || !profile) return;
        const now = Date.now();
        if (now - lastTypingSentRef.current > 2000) {
            lastTypingSentRef.current = now;
            messageService.broadcastTyping(selectedConversation.id, user!.id, profile.full_name);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const content = newMessage.trim();
        if (!content || !selectedConversation) return;
        
        setNewMessage('');
        setSending(true);
        
        // Optimistic UI update
        const tempId = `temp-${Date.now()}`;
        const optimisticMessage: Message = {
            id: tempId,
            content,
            sender_id: user!.id,
            created_at: new Date().toISOString(),
            read_at: null,
            sender: {
                full_name: profile?.full_name || '',
                avatar_url: profile?.avatar_url || null
            }
        };
        
        setMessages(prev => [...prev, optimisticMessage]);
        scrollToBottom(true);
        
        try {
            const newMsg = await messageService.sendMessage(selectedConversation.id, user!.id, content);
            // Zameň temp správu za reálnu z DB
            setMessages(prev => prev.map(m => m.id === tempId ? { ...newMsg, created_at: newMsg.created_at || new Date().toISOString(), sender: optimisticMessage.sender } : m));
            loadConversations();
        } catch (error) {
            console.error('Error sending message:', error);
            // Revert na chybu
            setMessages(prev => prev.filter(m => m.id !== tempId));
        } finally {
            setSending(false);
        }
    };

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
            setShowMobileChat(true);
            loadConversations();
        } catch (error) {
            console.error('Error starting conversation:', error);
        }
    };

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

    const getOtherParticipant = (conversation: Conversation) => {
        const isFirst = conversation.participant_1 === user!.id;
        return isFirst ? conversation.participant2 : conversation.participant1;
    };

    const getOtherId = (conversation: Conversation) => {
        return conversation.participant_1 === user!.id
            ? conversation.participant_2
            : conversation.participant_1;
    };

    const filteredConversations = conversations.filter(conv => {
        if (!searchTerm || showNewChat) return true;
        const other = getOtherParticipant(conv);
        return other?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Group messages by date
    const groupMessagesByDate = (msgs: Message[]) => {
        const groups: { date: string; messages: Message[] }[] = [];
        let currentDate = '';

        msgs.forEach(msg => {
            const msgDate = new Date(msg.created_at).toLocaleDateString('sk-SK');
            if (msgDate !== currentDate) {
                currentDate = msgDate;
                groups.push({ date: msgDate, messages: [msg] });
            } else {
                groups[groups.length - 1].messages.push(msg);
            }
        });

        return groups;
    };

    const getDateLabel = (dateStr: string) => {
        const today = new Date().toLocaleDateString('sk-SK');
        const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('sk-SK');
        if (dateStr === today) return 'Dnes';
        if (dateStr === yesterday) return 'Včera';
        return dateStr;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Správy</h1>
                <button
                    onClick={() => { setShowNewChat(!showNewChat); setAvailableUsers([]); }}
                    className="btn-gradient text-sm py-2 px-4 rounded-full"
                >
                    {showNewChat ? 'Zavrieť' : '+ Nová správa'}
                </button>
            </div>

            {/* New chat search */}
            {showNewChat && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 mb-4 animate-fade-in">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Hľadať používateľa podľa mena..."
                            className="form-input flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
                        />
                        <button onClick={searchUsers} className="btn-gradient px-4 rounded-xl">
                            <Search className="w-4 h-4" />
                        </button>
                    </div>
                    {availableUsers.length > 0 && (
                        <div className="mt-3 space-y-1 max-h-60 overflow-y-auto">
                            {availableUsers.map(userItem => (
                                <button
                                    key={userItem.id}
                                    onClick={() => {
                                        startConversationWithUser(userItem.id);
                                        setShowNewChat(false);
                                        setSearchTerm('');
                                        setAvailableUsers([]);
                                    }}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
                                >
                                    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shadow-md bg-gradient-to-br from-coral-400 to-coral-600">
                                        {userItem.avatar_url ? (
                                            <img src={userItem.avatar_url} alt={userItem.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-white font-semibold text-sm">{userItem.full_name?.charAt(0)?.toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-medium text-gray-900 dark:text-white">{userItem.full_name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {userItem.role === 'craftsman' ? '🔧 Remeselník' : '👤 Zákazník'}
                                        </p>
                                    </div>
                                    <Send className="w-4 h-4 text-gray-400" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Main chat container */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="flex h-[calc(100vh-220px)] min-h-[500px] max-h-[700px]">
                    {/* Conversation List */}
                    <div className={`w-full md:w-96 border-r border-gray-100 dark:border-gray-700 flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
                        {/* Search bar */}
                        <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Hľadať v konverzáciách..."
                                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-coral-500/30 transition-all"
                                    value={showNewChat ? '' : searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setShowNewChat(false); }}
                                />
                            </div>
                        </div>

                        {/* Conversation items */}
                        <div className="flex-1 overflow-y-auto">
                            {filteredConversations.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <MessageIcon className="w-8 h-8 text-gray-300 dark:text-gray-500" />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                                        {searchTerm ? 'Žiadne výsledky' : 'Žiadne konverzácie'}
                                    </p>
                                </div>
                            ) : (
                                filteredConversations.map((conv) => {
                                    const other = getOtherParticipant(conv);
                                    const hasUnread = (conv.unread_count || 0) > 0;
                                    const isSelected = selectedConversation?.id === conv.id;
                                    return (
                                        <button
                                            key={conv.id}
                                            onClick={() => { setSelectedConversation(conv); setShowMobileChat(true); }}
                                            className={`w-full p-3.5 text-left transition-all duration-200 border-b border-gray-50 dark:border-gray-700/50 ${isSelected
                                                ? 'bg-coral-50 dark:bg-coral-900/20 border-l-4 border-l-coral-500'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-4 border-l-transparent'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-white font-semibold shadow-md ${isSelected ? 'bg-gradient-to-br from-coral-400 to-coral-600' : 'bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-500 dark:to-gray-600'}`}>
                                                        {other?.avatar_url ? (
                                                            <img src={other.avatar_url} alt={other.full_name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span>{other?.full_name?.charAt(0)?.toUpperCase() || 'U'}</span>
                                                        )}
                                                    </div>
                                                    {hasUnread && (
                                                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-coral-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                                            <span className="text-[10px] text-white font-bold">{conv.unread_count}</span>
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p className={`text-sm truncate ${hasUnread ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                                                            {other?.full_name || 'Neznámy'}
                                                        </p>
                                                        {conv.last_message && (
                                                            <span className="text-[11px] text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2">
                                                                {formatTime(conv.last_message.created_at)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {conv.last_message && (
                                                        <p className={`text-xs truncate mt-0.5 ${hasUnread ? 'text-gray-800 dark:text-gray-200 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
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
                    </div>

                    {/* Chat Panel */}
                    <div className={`flex-1 flex flex-col ${showMobileChat ? 'flex' : 'hidden md:flex'}`}>
                        {selectedConversation ? (
                            <>
                                {/* Chat Header */}
                                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => { setShowMobileChat(false); setSelectedConversation(null); }}
                                            className="md:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                                        >
                                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                        </button>
                                        <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white font-semibold shadow-md bg-gradient-to-br from-coral-400 to-coral-600">
                                            {getOtherParticipant(selectedConversation)?.avatar_url ? (
                                                <img 
                                                    src={getOtherParticipant(selectedConversation)?.avatar_url!} 
                                                    alt={getOtherParticipant(selectedConversation)?.full_name} 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span>{getOtherParticipant(selectedConversation)?.full_name?.charAt(0)?.toUpperCase() || 'U'}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                                                {getOtherParticipant(selectedConversation)?.full_name}
                                            </h3>
                                            {typingUser ? (
                                                <p className="text-xs text-coral-500 animate-pulse font-medium">
                                                    píše správu...
                                                </p>
                                            ) : (
                                                <p className="text-xs text-emerald-500">
                                                    Online
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => navigate(`/craftsmen/${getOtherId(selectedConversation)}`)}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                                            title="Zobraziť profil"
                                        >
                                            <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                        </button>
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div
                                    ref={messagesContainerRef}
                                    className="flex-1 overflow-y-auto px-4 py-3 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-800 chat-messages-area"
                                >
                                    {messages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-center">
                                            <div className="w-20 h-20 bg-gradient-to-br from-coral-100 to-coral-200 dark:from-coral-900/30 dark:to-coral-800/30 rounded-full flex items-center justify-center mb-4">
                                                <Send className="w-8 h-8 text-coral-500" />
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300 font-medium">Začnite konverzáciu</p>
                                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Napíšte prvú správu</p>
                                        </div>
                                    ) : (
                                        <>
                                            {groupMessagesByDate(messages).map((group) => (
                                                <div key={group.date}>
                                                    {/* Date separator */}
                                                    <div className="flex justify-center my-4">
                                                        <span className="px-3 py-1 bg-gray-200/80 dark:bg-gray-700/80 text-gray-500 dark:text-gray-400 text-xs font-medium rounded-full backdrop-blur-sm">
                                                            {getDateLabel(group.date)}
                                                        </span>
                                                    </div>
                                                    {/* Messages */}
                                                    {group.messages.map((msg, idx) => {
                                                        const isOwn = msg.sender_id === user!.id;
                                                        const showAvatar = !isOwn && (idx === 0 || group.messages[idx - 1]?.sender_id !== msg.sender_id);
                                                        return (
                                                            <div
                                                                key={msg.id}
                                                                className={`flex mb-1 ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}
                                                            >
                                                                {/* Avatar for other user */}
                                                                {!isOwn && (
                                                                    <div className="w-7 mr-2 flex-shrink-0 self-end">
                                                                        {showAvatar ? (
                                                                            <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-white text-[10px] font-semibold bg-gradient-to-br from-gray-400 to-gray-500">
                                                                                {msg.sender?.avatar_url ? (
                                                                                    <img src={msg.sender.avatar_url} alt={msg.sender.full_name} className="w-full h-full object-cover" />
                                                                                ) : (
                                                                                    <span>{msg.sender?.full_name?.charAt(0)?.toUpperCase() || 'U'}</span>
                                                                                )}
                                                                            </div>
                                                                        ) : null}
                                                                    </div>
                                                                )}
                                                                <div
                                                                    className={`max-w-[75%] md:max-w-[65%] px-3.5 py-2 ${isOwn
                                                                        ? 'bg-gradient-to-br from-coral-500 to-coral-600 text-white rounded-2xl rounded-br-md shadow-md shadow-coral-500/20'
                                                                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl rounded-bl-md shadow-sm border border-gray-100 dark:border-gray-600'
                                                                        }`}
                                                                >
                                                                    <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
                                                                    <div className={`flex items-center justify-end gap-1 mt-0.5 ${isOwn ? 'text-white/60' : 'text-gray-400 dark:text-gray-500'}`}>
                                                                        <span className="text-[10px]">
                                                                            {new Date(msg.created_at).toLocaleTimeString('sk-SK', {
                                                                                hour: '2-digit',
                                                                                minute: '2-digit'
                                                                            })}
                                                                        </span>
                                                                        {isOwn && (
                                                                            msg.read_at ? (
                                                                                <CheckCheck className="w-3.5 h-3.5 text-blue-300" />
                                                                            ) : (
                                                                                <Check className="w-3.5 h-3.5" />
                                                                            )
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ))}

                                            {/* Typing indicator */}
                                            {typingUser && (
                                                <div className="flex justify-start mb-2 animate-fade-in">
                                                    <div className="w-7 mr-2 flex-shrink-0 self-end">
                                                        <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-white text-[10px] font-semibold bg-gradient-to-br from-gray-400 to-gray-500">
                                                            {getOtherParticipant(selectedConversation)?.avatar_url ? (
                                                                <img src={getOtherParticipant(selectedConversation)?.avatar_url!} alt="Typing" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span>{typingUser.charAt(0).toUpperCase()}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-600">
                                                        <div className="flex gap-1.5 items-center">
                                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message Input */}
                                <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                                                placeholder="Napíšte správu..."
                                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-coral-500/30 focus:border-coral-400 transition-all"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={sending || !newMessage.trim()}
                                            className="w-10 h-10 bg-gradient-to-br from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 disabled:from-gray-300 disabled:to-gray-400 rounded-full flex items-center justify-center text-white shadow-md shadow-coral-500/20 disabled:shadow-none transition-all duration-200 hover:scale-105 active:scale-95"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                <div className="w-24 h-24 bg-gradient-to-br from-coral-100 to-coral-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mb-5 shadow-inner">
                                    <MessageIcon className="w-10 h-10 text-coral-400 dark:text-gray-400" />
                                </div>
                                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Vyberte konverzáciu</p>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 mb-5">alebo začnite nový chat</p>
                                <button
                                    onClick={() => setShowNewChat(true)}
                                    className="btn-gradient text-sm py-2.5 px-6 rounded-full"
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

// Helper functions
function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

    if (diffDays === 0) {
        return date.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' });
    }
    if (diffDays === 1) return 'Včera';
    if (diffDays < 7) {
        return date.toLocaleDateString('sk-SK', { weekday: 'short' });
    }
    return date.toLocaleDateString('sk-SK', { day: 'numeric', month: 'numeric' });
}

const MessageIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);