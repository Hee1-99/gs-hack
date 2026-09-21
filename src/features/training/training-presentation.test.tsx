import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { TrainingShell } from './training-shell';
import { useTrainingStore } from './training-store';
import { answerTrainingStep, createTrainingAttempt } from './training-engine';
import { trainingSteps } from './training-data';
vi.mock('./training-store', () => ({ useTrainingStore: vi.fn() }));
beforeEach(() => vi.clearAllMocks());
function resumeAt(id: string) {
  let attempt = createTrainingAttempt('practice', '검수');
  for (const step of trainingSteps) {
    if (step.id === id) break;
    attempt = answerTrainingStep(attempt, step.id, step.correctChoiceId, { elapsedMs: 1000, ...(step.kind === 'short-answer' ? { answerText: step.sampleAnswer, accuracyPoints: 100, gradingMode: 'demo' as const } : {}) });
  }
  vi.mocked(useTrainingStore).mockReturnValue({ ready: true, persistence: 'saved', attempts: [attempt], active: attempt, beginStep: vi.fn() } as unknown as ReturnType<typeof useTrainingStore>);
  render(<TrainingShell />);
  fireEvent.click(screen.getByRole('button', { name: '이어서 하기' }));
}
it.each(['handover-note', 'report'])('addresses %s to the next worker throughout the form', id => {
  resumeAt(id);
  expect(screen.getByLabelText('다음 근무자에게 전달할 내용')).toBeVisible();
  expect(screen.queryByLabelText('고객에게 할 말')).toBeNull();
  expect(screen.getByText('다음 근무자', { exact: true })).toBeVisible();
  expect(screen.getByRole('button', { name: '답안 제출하기' })).toBeVisible();
  expect(screen.queryByText(/고객이나 다음 근무자/)).toBeNull();
});
it('uses an action panel rather than claiming a store inspection is a POS operation', () => {
  resumeAt('expiry-register');
  expect(screen.getByRole('region', { name: '업무 행동 선택 화면' })).toBeVisible();
  expect(screen.queryByText('GStep POS')).toBeNull();
  expect(screen.getByText('상황에 맞는 다음 행동을 골라 주세요.')).toBeVisible();
});
it.each(['handover-note', 'complaint-reply'])('keeps the %s input label independent of the entered answer', id => {
  resumeAt(id);
  const step = trainingSteps.find(item => item.id === id)!;
  const input = screen.getByRole('textbox', { name: step.responseLabel }) as HTMLTextAreaElement;
  fireEvent.change(input, { target: { value: step.sampleAnswer } });
  expect(input).toHaveValue(step.sampleAnswer);
  expect(input.labels?.[0].textContent).toBe(step.responseLabel);
  expect(screen.getByLabelText(step.responseLabel!, { exact: true })).toBe(input);
});
