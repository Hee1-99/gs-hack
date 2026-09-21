export function readSupabaseConfig(url?: string, key?: string): { url: string; key: string } | null {
  if (!url || !key || key.startsWith('sb_secret_')) return null;
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    if (key.startsWith('eyJ')) {
      const claims = JSON.parse(atob(key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (claims.role !== 'anon') return null;
    } else if (!key.startsWith('sb_publishable_')) return null;
    return { url, key };
  } catch { return null; }
}
