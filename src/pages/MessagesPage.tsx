import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { messageService } from '../services';
import { supabase } from '../lib/supabase';
import { Search, Send, ArrowLeft, MoreVertical, Check, CheckCheck, MessageSquarePlus, X, User } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

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
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const subscriptionRef = useRef<any>(null);
    const typingSubRef = useRef<any>(null);
    const readReceiptSubRef = useRef<any>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastTypingSentRef = useRef<number>(0);

    const scrollToBottom = useCallback((force = false) => {
        setTimeout(() => {
            const container = messagesContainerRef.current;
            if (!container) return;
            const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
            if (force || isNearBottom) {
                container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
            }
        }, 100);
    }, []);

    const loadConversations = async () => {
        if (!user) return;
        try {
            const data = await messageService.getUserConversations(user.id);
            const conversationsWithUnread = await Promise.all(
                (data || []).map(async (conv: Conversation) => {
                    const { count } = await supabase
                        .from('messages')
                        .select('*', { count: 'exact', head: true })
                        .eq('conversation_id', conv.id)
                        .neq('sender_id', user.id)
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
        if (!user) return;
        try {
            const data = await messageService.getMessages(conversationId);
            setMessages((data as Message[]) || []);
            await messageService.markAsRead(conversationId, user.id);
            setConversations(prev => prev.map(c =>
                c.id === conversationId ? { ...c, unread_count: 0 } : c
            ));
            scrollToBottom(true);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const subscribeToMessages = (conversationId: string) => {
        if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
        if (typingSubRef.current) typingSubRef.current.unsubscribe();
        if (readReceiptSubRef.current) readReceiptSubRef.current.unsubscribe();

        subscriptionRef.current = supabase
            .channel(`chat:${conversationId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
                async (payload) => {
                    const { data: fullMessage } = await supabase
                        .from('messages')
                        .select(`*, sender:profiles!sender_id (full_name, avatar_url)`)
                        .eq('id', payload.new.id)
                        .single();

                    if (fullMessage) {
                        setMessages(prev => prev.some(m => m.id === fullMessage.id) ? prev : [...prev, fullMessage]);
                        scrollToBottom();
                        if (fullMessage.sender_id !== user!.id) {
                            await messageService.markAsRead(conversationId, user!.id);
                            setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, unread_count: 0 } : c));
                        }
                        setTypingUser(null);
                        loadConversations();
                    }
                }
            ).subscribe();

        typingSubRef.current = messageService.subscribeToTyping(conversationId, (data) => {
            if (data.userId !== user!.id) {
                setTypingUser(data.userName);
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
            }
        });

        readReceiptSubRef.current = messageService.subscribeToReadReceipts(conversationId, () => loadMessages(conversationId));
    };

    useEffect(() => {
        loadConversations();
        const userId = searchParams.get('user');
        if (userId && userId !== user?.id) startConversationWithUser(userId);
        return () => {
            [subscriptionRef, typingSubRef, readReceiptSubRef].forEach(ref => ref.current?.unsubscribe());
        };
    }, [user?.id]);

    useEffect(() => {
        if (selectedConversation) {
            loadMessages(selectedConversation.id);
            subscribeToMessages(selectedConversation.id);
        }
    }, [selectedConversation?.id]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const content = newMessage.trim();
        if (!content || !selectedConversation || !user) return;
        setNewMessage('');
        setSending(true);
        const tempId = `temp-${Date.now()}`;
        const optimisticMessage: Message = {
            id: tempId, content, sender_id: user.id, created_at: new Date().toISOString(), read_at: null,
            sender: { full_name: profile?.full_name || '', avatar_url: profile?.avatar_url || null }
        };
        setMessages(prev => [...prev, optimisticMessage]);
        scrollToBottom(true);
        try {
            const newMsg = await messageService.sendMessage(selectedConversation.id, user.id, content);
            setMessages(prev => prev.map(m => m.id === tempId ? { ...newMsg, sender: optimisticMessage.sender } : m));
            loadConversations();
        } catch (error) {
            setMessages(prev => prev.filter(m => m.id !== tempId));
        } finally {
            setSending(false);
        }
    };

    const startConversationWithUser = async (otherUserId: string) => {
        if (!user) return;
        try {
            const conversation = await messageService.getOrCreateConversation(user.id, otherUserId);
            const { data: otherUser } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', otherUserId).single();
            const newConv: Conversation = {
                id: conversation.id, participant_1: conversation.participant_1, participant_2: conversation.participant_2, last_message_at: conversation.last_message_at,
                participant1: conversation.participant_1 === user.id ? { full_name: profile?.full_name || '', avatar_url: null } : otherUser,
                participant2: conversation.participant_2 === user.id ? { full_name: profile?.full_name || '', avatar_url: null } : otherUser
            };
            setSelectedConversation(newConv);
            setShowMobileChat(true);
            loadConversations();
        } catch (error) { console.error(error); }
    };

    const searchUsers = async () => {
        if (!searchTerm.trim()) return;
        const { data } = await supabase.from('profiles').select('id, full_name, avatar_url, role').ilike('full_name', `%${searchTerm}%`).neq('id', user!.id).limit(10);
        setAvailableUsers(data || []);
    };

    const getOtherParticipant = (conversation: Conversation) => conversation.participant_1 === user!.id ? conversation.participant2 : conversation.participant1;
    const getOtherId = (conversation: Conversation) => conversation.participant_1 === user!.id ? conversation.participant_2 : conversation.participant_1;

    const filteredConversations = conversations.filter(conv => {
        if (!searchTerm || showNewChat) return true;
        return getOtherParticipant(conv)?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (loading) return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
        if (diffDays === 0) return date.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' });
        return date.toLocaleDateString('sk-SK', { day: 'numeric', month: 'numeric' });
    };

    return (
        <div className="min-h-[calc(100vh-theme(spacing.40))] md:h-[calc(100vh-theme(spacing.24))] max-w-7xl mx-auto flex flex-col md:px-4 lg:px-8 pb-4">
            <div className="flex-1 flex overflow-hidden bg-white dark:bg-slate-900 md:rounded-[2.5rem] md:shadow-2xl md:border md:border-gray-100 dark:md:border-white/5 relative">
                
                {/* Conversation List Sidebar */}
                <div className={`${showMobileChat ? 'hidden' : 'flex'} w-full md:w-[350px] lg:w-[400px] flex-col border-r border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-slate-900/50 md:flex`}>
                    <div className="p-6 pb-4 flex items-center justify-between">
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">Správy</h1>
                        <button 
                            onClick={() => setShowNewChat(true)}
                            className="w-10 h-10 bg-coral-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-coral-500/20 active:scale-90 transition-transform"
                        >
                            <MessageSquarePlus className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="px-6 mb-6">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-coral-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Hľadať..."
                                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-none rounded-xl shadow-sm text-sm focus:ring-2 focus:ring-coral-500/20 transition-all font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 space-y-1">
                        {filteredConversations.map((conv) => {
                            const other = getOtherParticipant(conv);
                            const hasUnread = (conv.unread_count || 0) > 0;
                            const isSelected = selectedConversation?.id === conv.id;
                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => { setSelectedConversation(conv); setShowMobileChat(true); }}
                                    className={`w-full flex items-center gap-4 p-4 rounded-[2rem] transition-all duration-300 ${isSelected ? 'bg-white dark:bg-slate-800 shadow-xl shadow-navy-900/5' : 'hover:bg-white/50 dark:hover:bg-slate-800/50'}`}
                                >
                                    <div className="relative shrink-0">
                                        <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center text-white font-black shadow-lg ${isSelected ? 'bg-coral-500 shadow-coral-500/20' : 'bg-gray-200 dark:bg-slate-700'}`}>
                                            {other?.avatar_url ? <img src={other.avatar_url} className="w-full h-full object-cover rounded-[1.2rem]" /> : <span>{other?.full_name?.charAt(0)}</span>}
                                        </div>
                                        {hasUnread && <span className="absolute -top-1 -right-1 w-4 h-4 bg-coral-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-black">{conv.unread_count}</span>}
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <p className={`truncate text-sm ${hasUnread ? 'font-black text-gray-900 dark:text-white' : 'font-bold text-gray-600 dark:text-gray-400'}`}>{other?.full_name}</p>
                                            <span className="text-[9px] font-black uppercase text-gray-400 shrink-0">{conv.last_message && formatTime(conv.last_message.created_at)}</span>
                                        </div>
                                        <p className={`text-xs truncate ${hasUnread ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-400 font-medium'}`}>{conv.last_message?.content || "Žiadne správy"}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`${showMobileChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white dark:bg-slate-900`}>
                    {selectedConversation ? (
                        <>
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setShowMobileChat(false)} className="md:hidden w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-slate-800 rounded-xl"><ArrowLeft className="w-5 h-5" /></button>
                                    <div className="w-10 h-10 rounded-xl bg-coral-500 flex items-center justify-center text-white font-black shadow-lg">
                                        {getOtherParticipant(selectedConversation)?.avatar_url ? <img src={getOtherParticipant(selectedConversation)?.avatar_url!} className="w-full h-full object-cover rounded-xl" /> : <span>{getOtherParticipant(selectedConversation)?.full_name?.charAt(0)}</span>}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-900 dark:text-white text-sm tracking-tight leading-none mb-1">{getOtherParticipant(selectedConversation)?.full_name}</h3>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500 leading-none">{typingUser ? "píše..." : "Online"}</p>
                                    </div>
                                </div>
                                <button onClick={() => navigate(`/craftsmen/${getOtherId(selectedConversation)}`)} className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-coral-500"><User className="w-5 h-5" /></button>
                            </div>

                            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-4 rounded-[1.8rem] ${msg.sender_id === user?.id ? 'bg-coral-500 text-white rounded-tr-none shadow-xl shadow-coral-500/10' : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white rounded-tl-none shadow-sm'}`}>
                                            <p className="text-sm font-semibold leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                            <div className="flex items-center justify-end gap-1 mt-2 opacity-50">
                                                <span className="text-[9px] font-black">{new Date(msg.created_at).toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })}</span>
                                                {msg.sender_id === user?.id && (msg.read_at ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 md:p-6 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-white/5">
                                <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800 p-2 pl-5 rounded-[1.5rem]">
                                    <input
                                        type="text" value={newMessage} onChange={(e) => { setNewMessage(e.target.value); if (selectedConversation && profile) messageService.broadcastTyping(selectedConversation.id, user!.id, profile.full_name); }}
                                        placeholder="Správa..." className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold placeholder:text-gray-400 dark:text-white"
                                    />
                                    <button disabled={!newMessage.trim() || sending} className="w-12 h-12 bg-coral-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-coral-500/20 active:scale-90 transition-transform disabled:opacity-50"><Send className="w-5 h-5" /></button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gray-50/10 dark:bg-slate-900/10">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Vaše správy</h2>
                            <p className="text-gray-400 mt-2 font-medium">Vyberte si konverzáciu a začnite písať.</p>
                        </div>
                    )}
                </div>

                <AnimatePresence>
                    {showNewChat && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-navy-950/60 backdrop-blur-md flex items-center justify-center p-4">
                            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] p-8 shadow-2xl relative">
                                <button onClick={() => { setShowNewChat(false); }} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-slate-800 rounded-xl"><X className="w-5 h-5" /></button>
                                <h2 className="text-2xl font-black mb-6 tracking-tight">Nová správa</h2>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input type="text" placeholder="Meno..." className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchUsers()} />
                                    </div>
                                    <div className="max-h-60 overflow-y-auto space-y-2">
                                        {availableUsers.map(u => (
                                            <button key={u.id} onClick={() => { startConversationWithUser(u.id); setShowNewChat(false); }} className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-3xl transition-all">
                                                <div className="w-12 h-12 rounded-xl bg-coral-500 flex items-center justify-center text-white font-black">{u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover rounded-xl" /> : <span>{u.full_name?.charAt(0)}</span>}</div>
                                                <div className="text-left"><p className="font-black text-sm">{u.full_name}</p></div>
                                            </button>
                                        ))}
                                    </div>
                                    <button onClick={searchUsers} className="w-full py-4 bg-coral-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs">Hľadať</button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}