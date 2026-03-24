import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type Profile = {
  id: string;
  role: 'client' | 'craftsman';
  full_name: string;
  phone: string | null;
  bio: string | null;
  created_at: string;
};

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: 'client' | 'craftsman') => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: START');

    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          await loadProfile(user.id); // ← reálny profil namiesto hardcoded 'client'
        }
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: 'client' | 'craftsman') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role
        }
      }
    });

    if (error) throw error;

    if (data.user) {
      // Vytvoriť profil v databáze
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: fullName,
          phone: null,
          bio: null,
          role: role,
          created_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw profileError;
      }

      if (role === 'craftsman') {
        await supabase
          .from('craftsman_profiles')
          .insert({
            user_id: data.user.id,
            specialization: [],
            hourly_rate: null,
            years_experience: 0,
            verified: false,
            rating_avg: 0,
            total_jobs: 0
          });
      }

      setUser(data.user);
      setProfile({
        id: data.user.id,
        full_name: fullName,
        role: role,
        phone: null,
        bio: null,
        created_at: new Date().toISOString()
      });
    }
  };

  // FUNKCIA NA NAČÍTANIE PROFILU - PRIDAJ TÚTO
  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setProfile(data as Profile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };


  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      setUser(data.user);
      await loadProfile(data.user.id); // ← načítaj reálny profil z DB
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    console.log('Updating profile:', updates); // Debug log

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      console.error('Update error:', error);
      throw error;
    }

    console.log('Profile updated successfully');

    // Znovu načítať profil
    await loadProfile(user.id);
  };

  console.log('AuthProvider: loading =', loading);
  console.log('AuthProvider: user =', user);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}