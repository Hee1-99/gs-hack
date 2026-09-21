import { expect, it } from 'vitest';
import { summarizeTraining } from './training-summary';

const attempts = [
  { id: 'practice', mode: 'practice' as const, status: 'completed' as const, score: 80, startedAt: '2026-09-21T10:00:00Z' },
  { id: 'test', mode: 'test' as const, status: 'completed' as const, score: 60, startedAt: '2026-09-21T11:00:00Z' },
  { id: 'active', mode: 'test' as const, status: 'active' as const, score: null, startedAt: '2026-09-21T12:00:00Z' },
];

it('summarizes completed practice and tests without treating an unfinished test as a zero score', () => {
  expect(summarizeTraining(attempts)).toMatchObject({ completed: 2, tests: 1, active: 1, averageScore: 70 });
  expect(summarizeTraining(attempts).recent.map(item => item.id)).toEqual(['active', 'test', 'practice']);
});

it('deduplicates by attempt ID and has no invented score before a completion', () => {
  expect(summarizeTraining([attempts[0], attempts[0]])).toMatchObject({ completed: 1, averageScore: 80 });
  expect(summarizeTraining([])).toMatchObject({ completed: 0, tests: 0, active: 0, averageScore: null });
  expect(summarizeTraining([attempts[2]])).toMatchObject({ completed: 0, averageScore: null });
});
