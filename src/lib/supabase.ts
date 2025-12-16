import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'supabase.auth.token',
  },
  global: {
    headers: {
      'x-client-info': 'supabase-js-web',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper function to safely get user with error handling
export async function getSafeUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.warn('Auth error:', error.message);
      return null;
    }
    return user;
  } catch (error) {
    console.warn('Failed to get user:', error);
    return null;
  }
}

// Helper function to safely get session with error handling
export async function getSafeSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('Session error:', error.message);
      return null;
    }
    return session;
  } catch (error) {
    console.warn('Failed to get session:', error);
    return null;
  }
}