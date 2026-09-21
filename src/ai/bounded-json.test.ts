// @vitest-environment node
import { expect, it, vi } from 'vitest';
import { z } from 'zod';
vi.mock('server-only', () => ({}));
import { runBoundedJson } from './bounded-json';
const settings = { prompt: 'test', responseSchema: {}, validate: z.object({ value: z.string().max(20) }).strict(), fallback: { value: 'safe demo' } };
it('does not call the provider in forced demo even with a configured key', async () => {
  const provider = vi.fn();
  const reply = await runBoundedJson({ ...settings, options: { apiKeyPresent: true, demoMode: true, provider } });
  expect(reply.mode).toBe('demo'); expect(provider).not.toHaveBeenCalled();
});
it.each(['not json', '{"value":1}', '{"value":"ok","secret":"SYNTHETIC_ERROR_CANARY"}'])('uses safe output for malformed model response %s', async raw => {
  const reply = await runBoundedJson({ ...settings, options: { apiKeyPresent: true, demoMode: false, provider: vi.fn(async () => raw) } });
  expect(reply.data).toEqual(settings.fallback); expect(JSON.stringify(reply)).not.toContain('CANARY');
});
it('bounds stalled provider time and aborts its signal', async () => {
  let signal!: AbortSignal;
  const reply = await runBoundedJson({ ...settings, options: { apiKeyPresent: true, demoMode: false, timeoutMs: 5, provider: vi.fn((_prompt, _schema, passedSignal) => { signal = passedSignal; return new Promise<string>(() => {}); }) } });
  expect(reply.fallbackReason).toBe('timeout'); expect(signal.aborted).toBe(true);
});
