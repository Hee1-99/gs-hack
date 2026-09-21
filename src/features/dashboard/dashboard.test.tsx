import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, expect, it } from 'vitest';
import { createTrainingAttempt, answerTrainingStep } from '@/features/training/training-engine';
import { trainingSteps } from '@/features/training/training-data';
import { resetTrainingData, TRAINING_STORAGE_KEY } from '@/features/training/training-store';
import { Dashboard } from './dashboard';
import { StoreProvider } from '@/data/store-provider';
import { createLocalStoreRepository } from '@/data/local-store-repository';
import { localDateKey } from '@/domain/types';

beforeEach(() => { resetTrainingData(); localStorage.clear(); });

it('shows a real empty state without an invented score', async () => {
  render(<StoreProvider><Dashboard /></StoreProvider>);
  expect(await screen.findByRole('heading', { name: '아직 연습 기록이 없어요' })).toBeInTheDocument();
  expect(screen.getByTestId('training-average')).toHaveTextContent('—');
  expect(screen.getByRole('link', { name: '시뮬레이터 열기' })).toHaveAttribute('href', '/crew/simulation');
  expect(screen.queryByText('함께 확인할 업무')).not.toBeInTheDocument();
  expect(screen.getByRole('link',{name:/내 계정/})).toHaveAttribute('href','/login');
  expect(screen.getByRole('link',{name:/질문 내역/})).toHaveAttribute('href','/manager/questions');
  expect(screen.getByRole('heading',{name:'체크리스트 완료 현황'})).toBeVisible();
});

it('reads saved test scores and reveals the selected answer and source for every completed step', async () => {
  let completed = createTrainingAttempt('test', '테스트 A');
  for (const [index, step] of trainingSteps.entries()) {
    completed = answerTrainingStep(completed, step.id, index === 0 ? step.choices.find(choice => choice.id !== step.correctChoiceId)!.id : step.correctChoiceId, step.kind === 'short-answer' ? { answerText: step.sampleAnswer, accuracyPoints: 100, gradingMode: 'demo', elapsedMs: 1000 } : { elapsedMs: 1000 });
  }
  const active = createTrainingAttempt('practice', '연습 B');
  localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify({ version: 1, attempts: [completed, active] }));
  render(<StoreProvider><Dashboard /></StoreProvider>);
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
  expect(within(record).getByText(trainingSteps.find(step => step.kind === 'short-answer')!.sampleAnswer!)).toBeInTheDocument();
  expect(within(record).getByText(/정확도 .*응답 시간/)).toBeInTheDocument();
});

it('shows checklist completion only for the date selected by the owner', async () => {
  const repo=createLocalStoreRepository(null);
  const [first,second]=repo.listChecklistItems();
  await repo.setChecklistStatus(first.id,'done','2026-09-20');
  await repo.setChecklistStatus(second.id,'done','2026-09-20');
  await repo.setChecklistStatus(first.id,'done',localDateKey());
  render(<StoreProvider initialRepository={repo}><Dashboard/></StoreProvider>);
  const progress=await screen.findByRole('progressbar',{name:new RegExp(`체험 스토어 매니저 ${localDateKey()}`)});
  expect(progress).toHaveAttribute('value','1');
  fireEvent.change(screen.getByLabelText('확인 날짜'),{target:{value:'2026-09-20'}});
  expect(screen.getByRole('progressbar',{name:/체험 스토어 매니저 2026-09-20/})).toHaveAttribute('value','2');
});
