import { readLimitedJson, routeAiOptions } from '@/ai/route-handler';
import { chatRequestSchema } from '@/features/chat-training/types';
import { handleChatTraining } from '@/features/chat-training/server';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const input = chatRequestSchema.parse(await readLimitedJson(request));
    return Response.json(await handleChatTraining(input, routeAiOptions({ maxOutputTokens: input.action === 'finish' ? 2048 : 1024 })), { headers: { 'Cache-Control': 'no-store' } });
  } catch { return Response.json({ error: '대화 내용을 확인한 뒤 다시 시도해 주세요.' }, { status: 400 }); }
}
