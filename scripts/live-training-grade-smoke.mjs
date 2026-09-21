// One bounded live request. Does not read secrets or log answers, feedback, or raw errors.
import { trainingSteps } from '../src/features/training/training-data.ts';

const base = process.argv[2];
if (!base) throw new Error('Provide the live application base URL.');
const step = trainingSteps.find(item => item.id === 'complaint-reply');
if (!step?.sampleAnswer || !step.rubric?.length) throw new Error('Synthetic training fixture is missing.');

try {
  const response = await fetch(`${base.replace(/\/$/, '')}/api/ai/training-grade`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stepId: step.id, answer: step.sampleAnswer }),
    signal: AbortSignal.timeout(22_000),
  });
  const reply = await response.json();
  const expectedIds = new Set(step.rubric.map(item => item.id));
  const rubricValid = Array.isArray(reply.criteria) && reply.criteria.length === expectedIds.size &&
    new Set(reply.criteria.map(item => item.id)).size === expectedIds.size &&
    reply.criteria.every(item => expectedIds.has(item.id) && [0, 50, 100].includes(item.points));
  const scoreValid = rubricValid && Number.isInteger(reply.score) && reply.score >= 0 && reply.score <= 100 &&
    reply.score === Math.round(reply.criteria.reduce((sum, item) => sum + item.points, 0) / expectedIds.size);
  const feedbackValid = typeof reply.feedback === 'string' && reply.feedback.trim().length > 0 && reply.feedback.length <= 1500;
  const liveVerified = response.ok && reply.mode === 'gemini' && reply.stepId === step.id && rubricValid && scoreValid && feedbackValid;
  console.log(JSON.stringify({ check: 'training-grade', status: response.status, mode: ['gemini','demo'].includes(reply.mode) ? reply.mode : 'invalid', rubricValid, scoreValid, feedbackValid, liveVerified }));
  if (!liveVerified) process.exitCode = 1;
} catch {
  console.log(JSON.stringify({ check: 'training-grade', liveVerified: false, reason: 'request-or-response-unavailable' }));
  process.exitCode = 1;
}
