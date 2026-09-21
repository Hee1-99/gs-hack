import { act, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { resetTrainingData, useTrainingStore } from './training-store';
import { trainingSteps } from './training-data';

afterEach(() => { vi.restoreAllMocks(); act(() => { resetTrainingData(); }); });

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
