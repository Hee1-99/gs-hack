import { eventSchema, sessionSchema, snapshotSchema, type RuleSnapshot, type Scenario, type SimulationEvent, type SimulationSession } from '@/domain/types';
import { validateSession } from './rule-validator';
type EventInput = SimulationEvent extends infer E ? E extends SimulationEvent ? Omit<E, 'id' | 'at'> & { id?: string; at?: string } : never : never;

export function startSession(scenario: Scenario, snapshot: RuleSnapshot, previousAttemptId: string | null = null): SimulationSession {
  const at = new Date().toISOString();
  return sessionSchema.parse({ id: crypto.randomUUID(), previousAttemptId, scenario: structuredClone(scenario), snapshot: snapshotSchema.parse(snapshot), events: [{ id: crypto.randomUUID(), at, type: 'customer', text: scenario.customerQuestion }], createdAt: at, status: 'active', results: null });
}
export function recordEvent(session: SimulationSession, input: EventInput): SimulationSession {
  if (session.status === 'completed' || (input.id && session.events.some(event => event.id === input.id))) return session;
  const event = eventSchema.parse({ ...input, id: input.id ?? crypto.randomUUID(), at: input.at ?? new Date().toISOString() });
  if (event.type === 'pos_lookup' && !session.snapshot.products.some(product => product.id === event.productId)) throw new Error('등록되지 않은 상품이에요.');
  return { ...structuredClone(session), events: [...structuredClone(session.events), event] };
}
export function completeSession(session: SimulationSession): SimulationSession {
  if (session.status === 'completed') return session;
  if (!session.events.some(event => event.type === 'answer')) throw new Error('안내할 답변을 먼저 입력해 주세요.');
  return { ...structuredClone(session), status: 'completed', results: validateSession(session) };
}
