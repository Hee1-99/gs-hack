import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it } from 'vitest';
import { StoreProvider } from '@/data/store-provider';
import { createLocalStoreRepository } from '@/data/local-store-repository';
import { ManualEditor } from './manual-editor';
beforeEach(() => localStorage.clear());
it('saves all editable fields and displays the incremented rule version', async () => {
  const repo = createLocalStoreRepository(localStorage);
  render(<StoreProvider initialRepository={repo}><ManualEditor /></StoreProvider>);
  const user = userEvent.setup();
  const form = within(screen.getByRole('form', { name: '행사 문의는 POS 확인 후 안내' }));
  await user.clear(form.getByLabelText('규칙 내용'));
  await user.type(form.getByLabelText('규칙 내용'), '확인한 행사 조건을 천천히 안내합니다.');
  await user.click(form.getByRole('button', { name: '규칙 저장' }));
  expect(form.getByText('v2')).toBeVisible();
  expect(form.getByRole('status')).toHaveTextContent('저장했어요');
  expect(createLocalStoreRepository(localStorage).listRules()[0].content).toBe('확인한 행사 조건을 천천히 안내합니다.');
});
it('does not report a durable save when storage writes fail', async () => {
  const repo = createLocalStoreRepository({ getItem: () => null, setItem: () => { throw new Error('Quota exceeded'); } });
  render(<StoreProvider initialRepository={repo}><ManualEditor /></StoreProvider>);
  const form = within(screen.getByRole('form', { name: '행사 문의는 POS 확인 후 안내' }));
  await userEvent.click(form.getByRole('button', { name: '규칙 저장' }));
  expect(form.getByRole('status')).toHaveTextContent('저장하지 못했어요');
  expect(form.getByRole('status')).not.toHaveTextContent('저장했어요');
});
it('rejects whitespace-only fields when creating a rule', async () => {
  const repo = createLocalStoreRepository(localStorage);
  render(<StoreProvider initialRepository={repo}><ManualEditor /></StoreProvider>);
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: '새 규칙 추가' }));
  const form = within(screen.getByRole('form', { name: '새 규칙 작성' }));
  for (const label of ['규칙 제목', '분류', '규칙 내용', '예외 처리']) await user.type(form.getByLabelText(label), '   ');
  await user.click(form.getByRole('button', { name: '규칙 등록' }));
  expect(form.getByRole('status')).toHaveTextContent('공백 없이');
  expect(repo.listRules()).toHaveLength(2);
});
