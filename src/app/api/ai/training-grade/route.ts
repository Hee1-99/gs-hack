import { z } from 'zod';
import { readLimitedJson,routeAiOptions } from '@/ai/route-handler';
import { gradeTrainingAnswer } from '@/features/training/training-grader';
export const runtime='nodejs';
const schema=z.object({stepId:z.string().min(1).max(100),answer:z.string().trim().min(1).max(1500)});
export async function POST(request:Request) {
  try {const body=schema.parse(await readLimitedJson(request));return Response.json(await gradeTrainingAnswer(body.stepId,body.answer,routeAiOptions({maxOutputTokens:2048})),{headers:{'Cache-Control':'no-store'}});}
  catch {return Response.json({error:'답안을 확인하고 다시 제출해 주세요.'},{status:400});}
}
