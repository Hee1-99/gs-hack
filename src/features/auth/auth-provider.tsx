'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { getSupabaseClient, supabaseConfigured } from '@/lib/supabase/client';
import { cloudError, getMembership, type Membership } from '@/lib/supabase/cloud';

type AuthValue = { configured: boolean; ready: boolean; client: SupabaseClient | null; user: User | null; membership: Membership | null; error: string; refreshMembership: () => Promise<void>; signOut: () => Promise<void> };
const fallback: AuthValue = { configured: false, ready: true, client: null, user: null, membership: null, error: '', refreshMembership: async () => {}, signOut: async () => {} };
const AuthContext = createContext<AuthValue>(fallback);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(getSupabaseClient);
  const [ready, setReady] = useState(!supabaseConfigured);
  const [user, setUser] = useState<User | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [error, setError] = useState('');
  const generation = useRef(0);
  const refreshMembership = useCallback(async () => {
    if (!client) return;
    const current = ++generation.current;
    setReady(false); setError(''); setMembership(null);
    try {
      const { data, error: authError } = await client.auth.getUser();
      if (authError && authError.name !== 'AuthSessionMissingError') throw authError;
      if (current !== generation.current) return;
      setUser(data.user);
      const member = data.user ? await getMembership(client) : null;
      if (current === generation.current) setMembership(member);
    } catch (cause) { if (current === generation.current) setError(cloudError(cause)); }
    finally { if (current === generation.current) setReady(true); }
  }, [client]);
  useEffect(() => {
    if (!client) return;
    void refreshMembership();
    // Keep Supabase auth callbacks synchronous; make new requests after its lock releases.
    const { data: { subscription } } = client.auth.onAuthStateChange(() => { setTimeout(() => { void refreshMembership(); }, 0); });
    return () => { generation.current++; subscription.unsubscribe(); };
  }, [client, refreshMembership]);
  async function signOut() { if (!client) return; const { error: signOutError } = await client.auth.signOut(); if (signOutError) throw signOutError; generation.current++; setUser(null); setMembership(null); setReady(true); setError(''); }
  return <AuthContext.Provider value={{ configured: supabaseConfigured, ready, client, user, membership, error, refreshMembership, signOut }}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }
