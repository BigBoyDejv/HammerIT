import { supabase } from '../lib/supabase';

export interface SupportTicket {
  full_name: string;
  email: string;
  subject: string;
  message: string;
  user_id?: string;
  status?: 'open' | 'closed' | 'in_progress';
}

export const supportService = {
  createSupportTicket: async (ticket: SupportTicket) => {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert([ticket])
      .select()
      .single();

    if (error) {
      console.error('Error creating support ticket:', error);
      throw error;
    }

    return data;
  },

  getUserSupportTickets: async (userId: string) => {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching support tickets:', error);
      throw error;
    }

    return data;
  }
};
