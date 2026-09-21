type ScoredAttempt = {
  id: string;
  mode: 'practice' | 'test';
  status: 'active' | 'completed';
  score: number | null;
  startedAt: string;
};

export function summarizeTraining<T extends ScoredAttempt>(attempts: T[]) {
  const recent = [...new Map(attempts.map(attempt => [attempt.id, attempt])).values()]
    .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt));
  const completed = recent.filter(attempt => attempt.status === 'completed');
  const scored = completed.filter(attempt => attempt.score !== null);
  return {
    recent,
    completed: completed.length,
    tests: completed.filter(attempt => attempt.mode === 'test').length,
    active: recent.filter(attempt => attempt.status === 'active').length,
    averageScore: scored.length ? Math.round(scored.reduce((sum, attempt) => sum + attempt.score!, 0) / scored.length) : null,
  };
}
