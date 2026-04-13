/** Re-export for existing imports; fails at load time if env vars are missing. */
export { supabase } from './supabase';

/** Always true when this module loads (missing env causes `./supabase` to throw first). */
export const isSupabaseConfigured = true;
