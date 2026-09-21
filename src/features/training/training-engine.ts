import { z } from 'zod';
import { trainingSteps, type TrainingMode } from './training-data';

export type TrainingAnswer = { stepId: string; choiceId: string; correct: boolean; answeredAt: string };
export type TrainingAttempt = {
  id: string;
  mode: TrainingMode;
  candidateName: string;
  courseVersion: 1;
  startedAt: string;
  completedAt: string | null;
  status: 'active' | 'completed';
  answers: TrainingAnswer[];
  score: number | null;
};
export type TrainingState = { version: 1; attempts: TrainingAttempt[] };

export function createTrainingAttempt(mode: TrainingMode, candidateName: string): TrainingAttempt {
  return { id: crypto.randomUUID(), mode, candidateName: candidateName.trim().slice(0, 40) || '스토어 매니저', courseVersion: 1, startedAt: new Date().toISOString(), completedAt: null, status: 'active', answers: [], score: null };
}

export function answerTrainingStep(attempt: TrainingAttempt, stepId: string, choiceId: string): TrainingAttempt {
  const step = trainingSteps[attempt.answers.length];
  if (attempt.status === 'completed' || !step || step.id !== stepId || !step.choices.some(choice => choice.id === choiceId)) return attempt;
  const answers = [...attempt.answers, { stepId, choiceId, correct: choiceId === step.correctChoiceId, answeredAt: new Date().toISOString() }];
  const completed = answers.length === trainingSteps.length;
  return { ...attempt, answers, status: completed ? 'completed' : 'active', completedAt: completed ? new Date().toISOString() : null, score: completed ? Math.round(answers.filter(answer => answer.correct).length / trainingSteps.length * 100) : null };
}

const attemptSchema = z.object({
  id: z.string().min(1), mode: z.enum(['practice', 'test']), candidateName: z.string().min(1).max(40), courseVersion: z.literal(1),
  startedAt: z.iso.datetime(), completedAt: z.iso.datetime().nullable(), status: z.enum(['active', 'completed']), score: z.number().int().min(0).max(100).nullable(),
  answers: z.array(z.object({ stepId: z.string(), choiceId: z.string(), correct: z.boolean(), answeredAt: z.iso.datetime() })).max(trainingSteps.length),
}).refine(attempt => {
  const completed = attempt.answers.length === trainingSteps.length;
  return (attempt.status === 'completed') === completed && (attempt.completedAt !== null) === completed &&
    attempt.score === (completed ? Math.round(attempt.answers.filter(answer => answer.correct).length / trainingSteps.length * 100) : null) &&
    attempt.answers.every((answer, index) => {
      const step = trainingSteps[index];
      return answer.stepId === step.id && step.choices.some(choice => choice.id === answer.choiceId) && answer.correct === (answer.choiceId === step.correctChoiceId);
    });
});
const stateSchema = z.object({ version: z.literal(1), attempts: z.array(attemptSchema).max(500) }).refine(state => new Set(state.attempts.map(attempt => attempt.id)).size === state.attempts.length);

export function parseTrainingState(raw: string | null): TrainingState {
  if (!raw) return { version: 1, attempts: [] };
  try {
    const parsed = stateSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : { version: 1, attempts: [] };
  } catch { return { version: 1, attempts: [] }; }
}
