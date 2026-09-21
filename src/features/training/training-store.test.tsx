import { act, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { resetTrainingData, useTrainingStore, setTrainingScope, mergeTrainingAttempts } from './training-store';
import { trainingSteps } from './training-data';

afterEach(() => { vi.restoreAllMocks(); act(() => { setTrainingScope(null); resetTrainingData(); }); });

it('retains current progress on remount when a storage write failed and reset reports the failure', () => {
  act(() => { resetTrainingData(); });
  const first = renderHook(() => useTrainingStore());
  let id = '';
  act(() => { id = first.result.current.start('practice', '').id; });
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Quota exceeded'); });
  act(() => { first.result.current.answer(id, trainingSteps[0].id, trainingSteps[0].correctChoiceId); });
  expect(first.result.current.persistence).toBe('memory');
  first.unmount();
  const resumed = renderHook(() => useTrainingStore());
  expect(resumed.result.current.active?.answers).toHaveLength(1);
  expect(resumed.result.current.persistence).toBe('memory');
  act(() => { expect(resetTrainingData()).toBe(false); });
  expect(resumed.result.current.attempts).toHaveLength(0);
  resumed.unmount();
});

it('ignores double answer submission and updates another mounted consumer', () => {
  act(() => { resetTrainingData(); });
  const first = renderHook(() => useTrainingStore());
  const manager = renderHook(() => useTrainingStore());
  let id = '';
  act(() => { id = first.result.current.start('test', '지원자 A').id; });
  act(() => {
    first.result.current.answer(id, trainingSteps[0].id, trainingSteps[0].correctChoiceId);
    first.result.current.answer(id, trainingSteps[0].id, trainingSteps[0].correctChoiceId);
  });
  expect(manager.result.current.attempts[0].answers).toHaveLength(1);
  expect(manager.result.current.attempts[0].candidateName).toBe('지원자 A');
  first.unmount(); manager.unmount();
});

it('isolates signed-in scopes from guest history and merges validated cloud records',()=>{
  const hook=renderHook(()=>useTrainingStore());
  act(()=>{resetTrainingData();hook.result.current.start('practice','guest');});
  const guest=hook.result.current.attempts[0];
  act(()=>{setTrainingScope('store:user');resetTrainingData();});
  expect(hook.result.current.attempts).toHaveLength(0);
  act(()=>{mergeTrainingAttempts([guest,{id:'bad'}]);});
  expect(hook.result.current.attempts).toHaveLength(1);
  act(()=>{resetTrainingData();setTrainingScope(null);});
  expect(hook.result.current.attempts[0].candidateName).toBe('guest');
  hook.unmount();
});

it('starts the next-stage clock on explicit advance, never during feedback',()=>{
  vi.useFakeTimers();vi.setSystemTime(new Date('2026-09-21T00:00:00Z'));
  const hook=renderHook(()=>useTrainingStore());let id='';
  act(()=>{resetTrainingData();id=hook.result.current.start('practice','time').id;});
  act(()=>{hook.result.current.answer(id,trainingSteps[0].id,trainingSteps[0].correctChoiceId,{elapsedMs:3000});});
  expect(hook.result.current.active?.stageStartedAt).toBeNull();
  vi.setSystemTime(new Date('2026-09-21T00:15:00Z'));
  act(()=>{hook.result.current.beginStep(id);});
  expect(hook.result.current.active?.stageStartedAt).toBe('2026-09-21T00:15:00.000Z');
  expect(hook.result.current.active?.totalElapsedMs).toBe(3000);
  hook.unmount();vi.useRealTimers();
});
