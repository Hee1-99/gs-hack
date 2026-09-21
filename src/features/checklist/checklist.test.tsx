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
