import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, expect, it } from 'vitest';
import { createTrainingAttempt, answerTrainingStep } from '@/features/training/training-engine';
import { trainingSteps } from '@/features/training/training-data';
import { resetTrainingData, TRAINING_STORAGE_KEY } from '@/features/training/training-store';
import { Dashboard } from './dashboard';

beforeEach(() => { resetTrainingData(); localStorage.clear(); });

it('shows a real empty state without an invented score', async () => {
  render(<Dashboard />);
  expect(await screen.findByRole('heading', { name: '아직 연습 기록이 없어요' })).toBeInTheDocument();
  expect(screen.getByTestId('training-average')).toHaveTextContent('—');
  expect(screen.getByRole('link', { name: '시뮬레이터 열기' })).toHaveAttribute('href', '/crew/simulation');
  expect(screen.queryByText('함께 확인할 업무')).not.toBeInTheDocument();
});

it('reads saved test scores and reveals the selected answer and source for every completed step', async () => {
  let completed = createTrainingAttempt('test', '테스트 A');
  for (const [index, step] of trainingSteps.entries()) {
    completed = answerTrainingStep(completed, step.id, index === 0 ? step.choices.find(choice => choice.id !== step.correctChoiceId)!.id : step.correctChoiceId);
  }
  const active = createTrainingAttempt('practice', '연습 B');
  localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify({ version: 1, attempts: [completed, active] }));
  render(<Dashboard />);
  act(() => window.dispatchEvent(new StorageEvent('storage', { key: TRAINING_STORAGE_KEY })));
  expect(await screen.findByText('테스트 A')).toBeInTheDocument();
  expect(screen.getByTestId('training-count')).toHaveTextContent('1회');
  expect(screen.getByTestId('training-average')).toHaveTextContent(`${completed.score}/ 100`);
  fireEvent.click(screen.getByRole('button', { name: '구인 테스트' }));
  expect(screen.queryByText('연습 B')).not.toBeInTheDocument();
  const record = screen.getByText('테스트 A').closest('details')!;
  fireEvent.click(within(record).getByText('테스트 A'));
  expect(within(record).getAllByRole('listitem')).toHaveLength(trainingSteps.length);
  expect(within(record).getByText('오답')).toBeInTheDocument();
  expect(within(record).getAllByRole('link')[0]).toHaveAttribute('href', trainingSteps[0].source.url);
});
