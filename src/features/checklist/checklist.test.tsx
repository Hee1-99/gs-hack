import { fireEvent, render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { createLocalStoreRepository } from '@/data/local-store-repository';
import { StoreProvider } from '@/data/store-provider';
import { Checklist } from './checklist';

it('shows each selected status on its card and updates the progress count', () => {
  const repo = createLocalStoreRepository(null);
  render(<StoreProvider initialRepository={repo}><Checklist /></StoreProvider>);
  const item = screen.getByRole('heading', { name: '입고 상품 확인' }).closest('article')!;
  expect(within(item).getByText('대기', { selector: 'span' })).toBeVisible();
  fireEvent.change(screen.getByLabelText('입고 상품 확인 상태'), { target: { value: 'done' } });
  expect(within(item).getByText('완료', { selector: 'span' })).toBeVisible();
  expect(screen.getByRole('progressbar', { name: '업무 완료 현황' })).toHaveAttribute('value', '1');
  fireEvent.change(screen.getByLabelText('입고 상품 확인 상태'), { target: { value: 'needs_manager' } });
  expect(within(item).getByText('경영주 확인 필요', { selector: 'span' })).toBeVisible();
  expect(repo.getSnapshot().checklistProgress[0].status).toBe('needs_manager');
  expect(screen.getByRole('progressbar', { name: '업무 완료 현황' })).toHaveAttribute('value', '0');
});

it('selects a date and keeps that day progress independent from today', () => {
  const repo = createLocalStoreRepository(null);
  render(<StoreProvider initialRepository={repo}><Checklist /></StoreProvider>);
  const date = screen.getByLabelText('체크리스트 날짜');
  expect(date).toHaveAttribute('type', 'date');
  expect(date).toHaveAttribute('max', expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
  fireEvent.change(date, { target: { value: '2026-09-20' } });
  expect(screen.getByRole('heading', { name: /2026년 9월 20일 체크리스트/ })).toBeVisible();
  fireEvent.change(screen.getByLabelText('입고 상품 확인 상태'), { target: { value: 'done' } });
  expect(repo.getSnapshot().checklistProgress).toContainEqual(expect.objectContaining({ itemId: 'stock', date: '2026-09-20', status: 'done' }));
  const today = date.getAttribute('max')!;
  fireEvent.change(date, { target: { value: today } });
  expect(screen.getByLabelText('입고 상품 확인 상태')).toHaveValue('pending');
  fireEvent.change(date, { target: { value: '2026-09-20' } });
  expect(screen.getByLabelText('입고 상품 확인 상태')).toHaveValue('done');
});
