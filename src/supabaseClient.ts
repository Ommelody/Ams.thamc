import { createClient } from '@supabase/supabase-js';

const SUPABASE_PROJECT_ID = 'rduvaovnnrifdgrfeumr';
const DEFAULT_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkdXZhb3ZubnJpZmRncmZldW1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMDc4NDEsImV4cCI6MjA5NjU4Mzg0MX0.rJSn9XZC-_QCsUUI0wtoXwA-qLSzbPRoICUkS8Ar39o';

export const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || DEFAULT_URL;
export const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('assets').select('code').limit(1);
    if (error && error.code === 'PGRST116') {
      // The table exists but might be empty or similar, which is fine
      return true;
    }
    if (error) {
      console.warn('Supabase connection warning:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase connection check err:', err);
    return false;
  }
}
