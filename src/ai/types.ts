import type { VerifiedResults } from '@/domain/types';
export type FallbackReason = 'forced_demo' | 'missing_key' | 'timeout' | 'invalid_output' | 'provider_error';
export type AiReply = { content: string; mode: 'gemini' | 'demo'; groundingRuleIds: string[]; results?: VerifiedResults; fallbackReason?: FallbackReason };
export type MessagePlan = { role: 'customer' | 'coach' | 'qa'; intros: string[]; clauses: Record<string, string>; groundingRuleIds: string[]; results?: VerifiedResults };
export type Provider = (prompt: string, schema: Record<string, unknown>, signal: AbortSignal) => Promise<string>;
export type AiOptions = { apiKeyPresent: boolean; demoMode: boolean; provider: Provider; timeoutMs?: number };
