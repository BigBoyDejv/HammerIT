// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log("URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("KEY existuje:", !!import.meta.env.VITE_SUPABASE_ANON_KEY);

// Typy pre databázu
export type Profile = {
  id: string;
  full_name: string;
  role: 'client' | 'craftsman';
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  specializations: string[] | null;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
};