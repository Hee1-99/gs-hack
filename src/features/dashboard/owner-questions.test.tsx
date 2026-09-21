import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { createLocalStoreRepository } from '@/data/local-store-repository';
import { StoreProvider } from '@/data/store-provider';
import { OwnerQuestions } from './owner-questions';

it('shows the store manager name, question status and answer in owner history', async () => {
  const repo=createLocalStoreRepository(null);
  await repo.saveQuestion({id:'q1',question:'택배 접수는 어디서 확인해요?',answer:'매장 절차를 확인해 주세요.',rules:[],status:'unresolved',mode:'demo',answerKind:'needs_confirmation',createdAt:'2026-09-22T00:00:00.000Z'});
  render(<StoreProvider initialRepository={repo}><OwnerQuestions/></StoreProvider>);
  expect(await screen.findByRole('heading',{name:'스토어 매니저 질문 내역'})).toBeVisible();
  expect(screen.getByText('체험 스토어 매니저')).toBeVisible();
  expect(screen.getByText('택배 접수는 어디서 확인해요?')).toBeVisible();
  expect(screen.getByText('경영주 확인 필요')).toBeVisible();
});
