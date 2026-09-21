import 'server-only';
import type { z } from 'zod';
import type { AiOptions, FallbackReason } from './types';
import { AI_TIMEOUT_MS } from './timeouts';

export async function runBoundedJson<T>({ prompt, responseSchema, validate, options, fallback, maxOutputLength = 12_000 }: {
  prompt: string; responseSchema: Record<string, unknown>; validate: z.ZodType<T>; options: AiOptions; fallback: T; maxOutputLength?: number;
}): Promise<{ data: T; mode: 'gemini' | 'demo'; fallbackReason?: FallbackReason }> {
  const safe = (fallbackReason: FallbackReason) => ({ data: fallback, mode: 'demo' as const, fallbackReason });
  if (options.demoMode) return safe('forced_demo');
  if (!options.apiKeyPresent) return safe('missing_key');
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const raw = await Promise.race([
      options.provider(prompt, responseSchema, controller.signal),
      new Promise<never>((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(new Error('timeout')); }, options.timeoutMs ?? AI_TIMEOUT_MS); }),
    ]);
    if (raw.length > maxOutputLength) return safe('invalid_output');
    const parsed = validate.safeParse(JSON.parse(raw));
    if (!parsed.success) return safe('invalid_output');
    return { data: parsed.data, mode: 'gemini' };
  } catch { return safe(controller.signal.aborted ? 'timeout' : 'provider_error'); }
  finally { if (timer) clearTimeout(timer); }
}
