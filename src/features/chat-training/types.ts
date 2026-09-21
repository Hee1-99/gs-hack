import { z } from 'zod';
import { manualSourceSchema } from '@/domain/types';

export const CHAT_STORAGE_KEY = 'gstep-chat-training-v1';
export const CHAT_UPDATED_EVENT = 'gstep-chat-training-updated';
export const MAX_CHAT_TURNS = 8;
export const AUTO_FINISH_CHAT_TURNS = 3;
export const MIN_NATURAL_CLOSE_TURNS = 2;
export const scenarioIdSchema = z.enum(['promotion', 'complaint', 'refund']);
export const chatMessageSchema = z.object({ id: z.string().max(100), role: z.enum(['customer', 'manager']), text: z.string().trim().min(1).max(1200), at: z.iso.datetime() });
export const criterionIds = ['empathy', 'facts', 'clarity', 'ownership'] as const;
export const criterionLabels: Record<typeof criterionIds[number], string> = { empathy: '경청·공감', facts: '사실 확인', clarity: '명확한 설명', ownership: '후속 대응' };
export const feedbackSchema = z.object({ score: z.number().int().min(0).max(100), summary: z.string().min(1).max(700), criteria: z.array(z.object({ id: z.enum(criterionIds), score: z.number().int().min(0).max(25), maxScore: z.literal(25), comment: z.string().min(1).max(400) })).length(4), strengths: z.array(z.string().min(1).max(300)).min(1).max(3), improvements: z.array(z.string().min(1).max(300)).min(1).max(3), sourceIds: z.array(z.string()).max(3) }).superRefine((feedback, ctx) => {
  if (new Set(feedback.criteria.map(item => item.id)).size !== 4 || feedback.score !== feedback.criteria.reduce((sum, item) => sum + item.score, 0)) ctx.addIssue({ code: 'custom', message: '점수 합계와 평가 기준을 확인해 주세요.' });
});
export const chatAttemptSchema = z.object({ id: z.string().min(1).max(100), scenarioId: scenarioIdSchema, scenarioTitle: z.string().max(100), createdAt: z.iso.datetime(), updatedAt: z.iso.datetime(), status: z.enum(['active', 'completed']), messages: z.array(chatMessageSchema).min(1).max(MAX_CHAT_TURNS * 2 + 1), feedback: feedbackSchema.nullable(), mode: z.enum(['live', 'demo']), sources: z.array(manualSourceSchema).max(3) }).superRefine((attempt, ctx) => {
  if (attempt.messages.some((message, index) => message.role !== (index % 2 ? 'manager' : 'customer')) || (attempt.status === 'completed' && !attempt.feedback)) ctx.addIssue({ code: 'custom', message: '대화 기록 순서를 확인해 주세요.' });
});
export const chatRequestSchema = z.object({ scenarioId: scenarioIdSchema, messages: z.array(chatMessageSchema.pick({ role: true, text: true })).min(2).max(MAX_CHAT_TURNS * 2 + 1), action: z.enum(['reply', 'finish']) }).superRefine((request, ctx) => {
  if (request.messages.some((message, index) => message.role !== (index % 2 ? 'manager' : 'customer')) || (request.action === 'reply' && request.messages.at(-1)?.role !== 'manager')) ctx.addIssue({ code: 'custom', message: '고객과 매니저가 차례대로 대화해 주세요.' });
});
export const chatResponseSchema = z.object({ message: z.string().min(1).max(1200).optional(), shouldFinish: z.boolean().optional().default(false), feedback: feedbackSchema.optional(), mode: z.enum(['live', 'demo']), sources: z.array(manualSourceSchema).max(3), facts: z.array(z.string().max(500)).max(4) });
export type ChatAttempt = z.infer<typeof chatAttemptSchema>;
export type ChatFeedback = z.infer<typeof feedbackSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;
export type ChatScenarioId = z.infer<typeof scenarioIdSchema>;

export function parseChatHistory(raw: string | null): ChatAttempt[] {
  if (!raw) return [];
  try { const value = z.array(chatAttemptSchema).max(100).safeParse(JSON.parse(raw)); return value.success ? value.data : []; } catch { return []; }
}
