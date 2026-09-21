import { z } from 'zod';
import { ruleSchema } from '@/domain/types';
import { readLimitedJson, routeAiOptions } from '@/ai/route-handler';
import { answerQuestion } from '@/features/qa/answer-question';
import { MAX_UPLOAD_BYTES } from '@/features/manual-reference/upload';
export const runtime = 'nodejs';
const requestSchema = z.object({ question: z.string().trim().min(1).max(500), rules: z.array(ruleSchema).max(50), manual: z.object({ name: z.string().min(1).max(100), text: z.string().trim().min(1).max(MAX_UPLOAD_BYTES).refine(value => new TextEncoder().encode(value).length <= MAX_UPLOAD_BYTES) }).optional() });
export async function POST(request: Request) {
  try {
    const { question, rules, manual } = requestSchema.parse(await readLimitedJson(request));
    const log = await answerQuestion(question, rules, routeAiOptions(), manual);
    return Response.json({ ...log, ruleIds: log.rules.map(rule => rule.id), ruleVersion: Object.fromEntries(log.rules.map(rule => [rule.id, rule.version])), resolutionStatus: log.status }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return Response.json({ error: '질문과 매장 규칙을 확인한 뒤 다시 시도해 주세요.' }, { status: 400 }); }
}
