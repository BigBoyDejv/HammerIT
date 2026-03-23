export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: 'client' | 'craftsman';
          full_name: string;
          avatar_url: string | null;
          phone: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: 'client' | 'craftsman';
          full_name: string;
          avatar_url?: string | null;
          phone?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: 'client' | 'craftsman';
          full_name?: string;
          avatar_url?: string | null;
          phone?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      craftsman_profiles: {
        Row: {
          id: string;
          user_id: string;
          specialization: string[];
          hourly_rate: number | null;
          years_experience: number;
          verified: boolean;
          rating_avg: number;
          total_jobs: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          specialization?: string[];
          hourly_rate?: number | null;
          years_experience?: number;
          verified?: boolean;
          rating_avg?: number;
          total_jobs?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          specialization?: string[];
          hourly_rate?: number | null;
          years_experience?: number;
          verified?: boolean;
          rating_avg?: number;
          total_jobs?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      job_requests: {
        Row: {
          id: string;
          client_id: string;
          title: string;
          description: string;
          category: string;
          location: string;
          budget_min: number | null;
          budget_max: number | null;
          status: 'open' | 'in_progress' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          title: string;
          description: string;
          category: string;
          location: string;
          budget_min?: number | null;
          budget_max?: number | null;
          status?: 'open' | 'in_progress' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          title?: string;
          description?: string;
          category?: string;
          location?: string;
          budget_min?: number | null;
          budget_max?: number | null;
          status?: 'open' | 'in_progress' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
      job_offers: {
        Row: {
          id: string;
          job_request_id: string;
          craftsman_id: string;
          price: number;
          estimated_duration: string | null;
          message: string;
          status: 'pending' | 'accepted' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_request_id: string;
          craftsman_id: string;
          price: number;
          estimated_duration?: string | null;
          message: string;
          status?: 'pending' | 'accepted' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_request_id?: string;
          craftsman_id?: string;
          price?: number;
          estimated_duration?: string | null;
          message?: string;
          status?: 'pending' | 'accepted' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
      };
      contracts: {
        Row: {
          id: string;
          job_request_id: string;
          craftsman_id: string;
          client_id: string;
          final_price: number;
          status: 'active' | 'completed' | 'cancelled' | 'disputed';
          payment_status: 'pending' | 'paid' | 'refunded';
          started_at: string;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_request_id: string;
          craftsman_id: string;
          client_id: string;
          final_price: number;
          status?: 'active' | 'completed' | 'cancelled' | 'disputed';
          payment_status?: 'pending' | 'paid' | 'refunded';
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_request_id?: string;
          craftsman_id?: string;
          client_id?: string;
          final_price?: number;
          status?: 'active' | 'completed' | 'cancelled' | 'disputed';
          payment_status?: 'pending' | 'paid' | 'refunded';
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          contract_id: string;
          reviewer_id: string;
          reviewed_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          contract_id: string;
          reviewer_id: string;
          reviewed_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          contract_id?: string;
          reviewer_id?: string;
          reviewed_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          participant_1: string;
          participant_2: string;
          last_message_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          participant_1: string;
          participant_2: string;
          last_message_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          participant_1?: string;
          participant_2?: string;
          last_message_at?: string;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          content?: string;
          read_at?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          read: boolean;
          link: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          read?: boolean;
          link?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          read?: boolean;
          link?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
