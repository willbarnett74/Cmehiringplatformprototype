import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ?? '';

let supabaseClient: SupabaseClient | null = null;
let hasValidSupabaseConfig = false;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    hasValidSupabaseConfig = true;
  } catch (error) {
    console.warn('[CMe] Supabase is not configured correctly:', error);
  }
}

export const isSupabaseConfigured = hasValidSupabaseConfig;
export const supabase = supabaseClient;
