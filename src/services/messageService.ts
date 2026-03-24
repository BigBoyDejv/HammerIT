// src/services/messageService.ts
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Message = Database['public']['Tables']['messages']['Row'];
type Conversation = Database['public']['Tables']['conversations']['Row'];

// Rozšírený typ pre správu so senderom
export type MessageWithSender = Message & {
    sender?: {
        full_name: string;
        avatar_url: string | null;
    };
};

export const messageService = {
    // Získať alebo vytvoriť konverzáciu
    async getOrCreateConversation(user1Id: string, user2Id: string) {
        const [participant_1, participant_2] = [user1Id, user2Id].sort();

        let { data: conversation, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('participant_1', participant_1)
            .eq('participant_2', participant_2)
            .maybeSingle();

        if (error) throw error;

        if (!conversation) {
            const { data: newConversation, error: createError } = await supabase
                .from('conversations')
                .insert({ participant_1, participant_2, last_message_at: new Date().toISOString() })
                .select()
                .single();

            if (createError) throw createError;
            conversation = newConversation;
        }

        return conversation;
    },

    // Poslať správu
    async sendMessage(conversationId: string, senderId: string, content: string) {
        const { data, error } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: senderId,
                content
            })
            .select()
            .single();

        if (error) throw error;

        await supabase
            .from('conversations')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', conversationId);

        return data as Message;
    },

    // Získať správy v konverzácii
    async getMessages(conversationId: string): Promise<MessageWithSender[]> {
        const { data, error } = await supabase
            .from('messages')
            .select(`
                *,
                sender:profiles!sender_id (
                    full_name,
                    avatar_url
                )
            `)
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data as unknown as MessageWithSender[];
    },

    // Získať všetky konverzácie pre používateľa
    async getUserConversations(userId: string) {
        const { data, error } = await supabase
            .from('conversations')
            .select(`
                *,
                participant1:profiles!participant_1 (
                    id,
                    full_name,
                    avatar_url
                ),
                participant2:profiles!participant_2 (
                    id,
                    full_name,
                    avatar_url
                )
            `)
            .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
            .order('last_message_at', { ascending: false });

        if (error) throw error;

        const conversationsWithLastMessage = await Promise.all(
            (data || []).map(async (conversation) => {
                const { data: lastMessage } = await supabase
                    .from('messages')
                    .select('content, created_at')
                    .eq('conversation_id', conversation.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                return {
                    ...conversation,
                    last_message: lastMessage
                };
            })
        );

        return conversationsWithLastMessage;
    },

    // Označiť správy ako prečítané
    async markAsRead(conversationId: string, userId: string) {
        const { error } = await supabase
            .from('messages')
            .update({ read_at: new Date().toISOString() })
            .eq('conversation_id', conversationId)
            .neq('sender_id', userId)
            .is('read_at', null);

        if (error) throw error;
    },

    // Získať počet neprečítaných správ
    async getUnreadCount(userId: string) {
        const { data: conversations, error: convError } = await supabase
            .from('conversations')
            .select('id')
            .or(`participant_1.eq.${userId},participant_2.eq.${userId}`);

        if (convError) throw convError;
        if (!conversations?.length) return 0;

        const conversationIds = conversations.map(c => c.id);

        const { count, error } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .in('conversation_id', conversationIds)
            .neq('sender_id', userId)
            .is('read_at', null);

        if (error) throw error;
        return count || 0;
    },

    // Real-time subscription na nové správy
    subscribeToMessages(conversationId: string, onNewMessage: (message: MessageWithSender) => void) {
        const subscription = supabase
            .channel(`messages:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                async (payload) => {
                    // Načítať správy aj s informáciami o odosielateľovi
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

                    onNewMessage(fullMessage as unknown as MessageWithSender);
                }
            )
            .subscribe();

        return subscription;
    }
};