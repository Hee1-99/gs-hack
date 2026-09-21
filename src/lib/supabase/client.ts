'use client';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { readSupabaseConfig } from './config';

const config = readSupabaseConfig(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
let client: SupabaseClient | null = null;
export const supabaseConfigured = Boolean(config);
export function getSupabaseClient(): SupabaseClient | null {
  if (!config) return null;
  client ??= createClient(config.url, config.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  return client;
}
