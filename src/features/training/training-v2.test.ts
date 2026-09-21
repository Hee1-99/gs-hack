import { expect, it } from 'vitest';
import { trainingSteps, legacyTrainingSteps } from './training-data';
import { createTrainingAttempt, answerTrainingStep, getAttemptSteps, parseTrainingState, scoreTimeBonus } from './training-engine';

it('uses a broad version2 course and gives careful correct answers at least90 points', () => {
  let attempt = createTrainingAttempt('practice', '연습');
  expect(trainingSteps).toHaveLength(36);
  expect(new Set(trainingSteps.map(step => step.chapter)).size).toBe(6);
  for (const step of getAttemptSteps(attempt)) attempt = answerTrainingStep(attempt, step.id, step.correctChoiceId, { elapsedMs: 999999, answerText: step.sampleAnswer, accuracyPoints: 100, gradingMode: step.kind === 'short-answer' ? 'demo' : 'objective', feedback: '확인' });
  expect(attempt).toMatchObject({ courseVersion: 2, status: 'completed', accuracyScore: 90, timeScore: 0, score: 90 });
});

it('never awards speed points for wrong answers and caps correct speed bonuses', () => {
  expect(scoreTimeBonus(0, 0)).toBe(0);
  expect(scoreTimeBonus(60, 1000)).toBe(0);
  expect(scoreTimeBonus(100, 1000)).toBe(10);
  expect(scoreTimeBonus(100, 999999)).toBe(0);
});

it('preserves legacy12-step history with its original score while new courses use36', () => {
  const completedAt = new Date().toISOString();
  const legacy = { id: 'legacy-1', mode:'practice',candidateName:'이전 연습',courseVersion:1,startedAt:completedAt,completedAt,status:'completed',score:100,answers:legacyTrainingSteps.map(step=>({stepId:step.id,choiceId:step.correctChoiceId,correct:true,answeredAt:completedAt})) };
  const parsed = parseTrainingState(JSON.stringify({version:1,attempts:[legacy]}));
  expect(parsed.attempts).toHaveLength(1);
  expect(getAttemptSteps(parsed.attempts[0])).toHaveLength(12);
  expect(parsed.attempts[0]).toEqual(legacy);
});

it('supports a selected chapter and preserves the stage timer during refresh', () => {
  const attempt = createTrainingAttempt('test','지원자',trainingSteps[0].chapter);
  expect(getAttemptSteps(attempt)).toHaveLength(6);
  const restored = parseTrainingState(JSON.stringify({version:1,attempts:[attempt]})).attempts[0];
  expect(restored.stageStartedAt).toBe(attempt.stageStartedAt);
  expect(restored.stepIds).toEqual(attempt.stepIds);
});

it('does not erase valid legacy records beside a corrupted newer record', () => {
  const at=new Date().toISOString();
  const legacy={id:'old',mode:'practice',candidateName:'old',courseVersion:1,startedAt:at,completedAt:null,status:'active',score:null,answers:[]};
  const damaged={...createTrainingAttempt('test','new'),score:100};
  expect(parseTrainingState(JSON.stringify({version:1,attempts:[legacy,damaged]})).attempts).toEqual([legacy]);
});
