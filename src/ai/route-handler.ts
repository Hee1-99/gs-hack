import 'server-only';
import { GoogleGenAI } from '@google/genai';
import { sessionSchema } from '@/domain/types';
import { generateCoaching, generateCustomerReply } from './gemini-client';
import type { AiOptions } from './types';
import { PROVIDER_REQUEST_TIMEOUT_MS } from './timeouts';

export function routeAiOptions(settings: { maxOutputTokens?: number } = {}): AiOptions {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  return { apiKeyPresent: !!apiKey, demoMode: process.env.AI_DEMO_MODE !== 'false', provider: async (prompt, schema, signal) => {
    // Called lazily inside a route request; forced demo never initializes the SDK.
    const client = new GoogleGenAI({ apiKey });
    const response = await client.models.generateContent({ model: process.env.GEMINI_MODEL || 'gemini-3.8-flash', contents: prompt, config: { responseMimeType: 'application/json', responseJsonSchema: schema, abortSignal: signal, httpOptions: { timeout: PROVIDER_REQUEST_TIMEOUT_MS }, maxOutputTokens: Math.min(4096, Math.max(256, settings.maxOutputTokens ?? 1024)) } });
    return response.text ?? '';
  } };
}
export async function readLimitedJson(request: Request, timeoutMs = 5000): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('empty');
  let size = 0;
  const chunks: Uint8Array[] = [];
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => { reject(new Error('request timeout')); void reader.cancel().catch(() => {}); }, timeoutMs);
  });
  try {
    while (true) {
      const { done, value } = await Promise.race([reader.read(), deadline]); if (done) break;
      size += value.length;
      if (size > 64_000) { void reader.cancel().catch(() => {}); throw new Error('too large'); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    return JSON.parse(new TextDecoder().decode(bytes));
  } finally { if (timer) clearTimeout(timer); reader.releaseLock(); }
}
export async function handleSimulationAi(request: Request, kind: 'customer' | 'coach') {
  try {
    const session = sessionSchema.parse(await readLimitedJson(request));
    if (!session.scenario.ruleIds.every(id => session.snapshot.rules.some(rule => rule.id === id)) || !session.snapshot.products.some(product => product.id === session.scenario.productId)) throw new Error('missing grounding');
    const reply = await (kind === 'customer' ? generateCustomerReply : generateCoaching)(session, routeAiOptions());
    return Response.json(reply, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return Response.json({ error: '요청 내용을 확인한 뒤 다시 시도해 주세요.' }, { status: 400 }); }
}
