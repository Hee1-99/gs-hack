import { describe, expect, it } from 'vitest';
import { trainingSteps } from './training-data';
import { answerTrainingStep, createTrainingAttempt, parseTrainingState } from './training-engine';

describe('manual-based quiz', () => {
  it('requires each step in sequence, ignores duplicate submissions and scores only at completion', () => {
    let attempt = createTrainingAttempt('practice', '연습 01');
    const first = trainingSteps[0];
    expect(answerTrainingStep(attempt, trainingSteps[1].id, trainingSteps[1].correctChoiceId)).toEqual(attempt);
    attempt = answerTrainingStep(attempt, first.id, first.correctChoiceId);
    expect(attempt.score).toBeNull();
    expect(answerTrainingStep(attempt, first.id, first.correctChoiceId)).toEqual(attempt);
    for (const step of trainingSteps.slice(1)) attempt = answerTrainingStep(attempt, step.id, step.correctChoiceId);
    expect(attempt).toMatchObject({ status: 'completed', score: 100 });
    expect(attempt.completedAt).toBeTruthy();
    expect(attempt.answers).toHaveLength(trainingSteps.length);
    expect(answerTrainingStep(attempt, first.id, 'wrong')).toEqual(attempt);
  });

  it('preserves incorrect choices and calculates a deterministic final score in test mode', () => {
    let attempt = createTrainingAttempt('test', '지원자 A');
    for (const [index, step] of trainingSteps.entries()) {
      attempt = answerTrainingStep(attempt, step.id, index === 0 ? step.choices.find(choice => choice.id !== step.correctChoiceId)!.id : step.correctChoiceId);
    }
    expect(attempt.score).toBe(Math.round((trainingSteps.length - 1) / trainingSteps.length * 100));
    expect(attempt.answers[0].correct).toBe(false);
    expect(attempt.mode).toBe('test');
  });

  it('rejects unknown choices, invented scores and corrupted history', () => {
    const attempt = createTrainingAttempt('practice', '');
    expect(answerTrainingStep(attempt, trainingSteps[0].id, 'missing')).toEqual(attempt);
    expect(parseTrainingState(JSON.stringify({ version: 1, attempts: [attempt] })).attempts).toHaveLength(1);
    expect(parseTrainingState(JSON.stringify({ version: 1, attempts: [{ ...attempt, score: 100 }] })).attempts).toHaveLength(0);
    expect(parseTrainingState('{oops').attempts).toHaveLength(0);
  });

  it('every question has an explicit confirmed source and exactly one correct choice', () => {
    expect(trainingSteps.length).toBeGreaterThanOrEqual(12);
    for (const step of trainingSteps) {
      expect(step.source.title).toBeTruthy();
      expect(step.source.url).toMatch(/^https:\/\//);
      expect(step.choices.filter(choice => choice.id === step.correctChoiceId)).toHaveLength(1);
      expect(step.explanation).toBeTruthy();
    }
  });
});
