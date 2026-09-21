import { expect, it } from 'vitest';
import { readSupabaseConfig } from './config';
it('requires a complete public configuration and rejects secret keys', () => {
  expect(readSupabaseConfig('', '')).toBeNull();
  expect(readSupabaseConfig('https://project.supabase.co', '')).toBeNull();
  expect(readSupabaseConfig('https://project.supabase.co', 'sb_secret_private')).toBeNull();
  expect(readSupabaseConfig('https://project.supabase.co', 'sb_publishable_public')).toEqual({ url: 'https://project.supabase.co', key: 'sb_publishable_public' });
});
