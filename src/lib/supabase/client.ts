import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

export const initializeSupabaseClient = (url: string, anonKey: string) => {
  supabase = createClient(url, anonKey);
  return supabase;
};

export const getSupabaseClient = () => {
  if (!supabase) {
    throw new Error('Supabase client has not been initialized.');
  }
  return supabase;
};

export const isSupabaseClientInitialized = () => supabase !== null;

export const clearSupabaseClient = () => {
  supabase = null;
};

const envSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const envSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (envSupabaseUrl && envSupabaseAnonKey) {
  initializeSupabaseClient(envSupabaseUrl, envSupabaseAnonKey);
}
