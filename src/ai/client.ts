import { aiReplySchema, type SimulationSession } from '@/domain/types';
import type { AiReply } from './types';
import { CLIENT_REQUEST_TIMEOUT_MS } from './timeouts';
export async function requestSimulationAi(role: 'customer' | 'coach', session: SimulationSession): Promise<AiReply> {
  const response = await fetch(`/api/ai/${role}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(session), signal: AbortSignal.timeout(CLIENT_REQUEST_TIMEOUT_MS) });
  if (!response.ok) throw new Error('요청을 완료하지 못했어요. 다시 시도해 주세요.');
  return aiReplySchema.parse(await response.json());
}
