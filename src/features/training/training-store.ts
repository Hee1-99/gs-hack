'use client';
import { useEffect, useState } from 'react';
import { answerTrainingStep, createTrainingAttempt, parseTrainingState, type TrainingState } from './training-engine';
import type { TrainingMode } from './training-data';
export type { TrainingAttempt, TrainingAnswer } from './training-engine';

export const TRAINING_STORAGE_KEY = 'firstday-training-v1';
const TRAINING_EVENT = 'firstday-training-change';
let memory: TrainingState = { version: 1, attempts: [] };
let persistence: 'local' | 'memory' | 'recovered' = 'local';
let initialized = false;

function read(force = false) {
  if (initialized && !force) return memory;
  initialized = true;
  try {
    const raw = window.localStorage.getItem(TRAINING_STORAGE_KEY);
    const next = parseTrainingState(raw);
    persistence = raw && !next.attempts.length && raw !== JSON.stringify({ version: 1, attempts: [] }) ? 'recovered' : 'local';
    memory = next;
  } catch { persistence = 'memory'; }
  return memory;
}
function write(state: TrainingState) {
  memory = state;
  try { window.localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(state)); persistence = 'local'; }
  catch { persistence = 'memory'; }
  window.dispatchEvent(new Event(TRAINING_EVENT));
}

export function resetTrainingData(): boolean { write({ version: 1, attempts: [] }); return persistence === 'local'; }

export function useTrainingStore() {
  const [state, setState] = useState<TrainingState>({ version: 1, attempts: [] });
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<typeof persistence>('local');
  useEffect(() => {
    setState(read()); setStatus(persistence); setReady(true);
    const update = () => { setState(memory); setStatus(persistence); };
    const storage = (event: StorageEvent) => { if (event.key === TRAINING_STORAGE_KEY || event.key === null) { read(true); update(); } };
    window.addEventListener(TRAINING_EVENT, update);
    window.addEventListener('storage', storage);
    return () => { window.removeEventListener(TRAINING_EVENT, update); window.removeEventListener('storage', storage); };
  }, []);

  function start(mode: TrainingMode, name: string) {
    const attempt = createTrainingAttempt(mode, name);
    write({ version: 1, attempts: [...memory.attempts, attempt].slice(-500) });
    return attempt;
  }
  function answer(attemptId: string, stepId: string, choiceId: string) {
    const existing = memory.attempts.find(attempt => attempt.id === attemptId);
    if (!existing) return null;
    const next = answerTrainingStep(existing, stepId, choiceId);
    if (next !== existing) write({ version: 1, attempts: memory.attempts.map(attempt => attempt.id === attemptId ? next : attempt) });
    return next;
  }
  return { ...state, ready, persistence: status, active: [...state.attempts].reverse().find(attempt => attempt.status === 'active') ?? null, start, answer };
}
