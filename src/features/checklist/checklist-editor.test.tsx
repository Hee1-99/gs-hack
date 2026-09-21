import { fireEvent, render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { StoreProvider } from '@/data/store-provider';
import { createLocalStoreRepository } from '@/data/local-store-repository';
import { ChecklistEditor } from './checklist-editor';

it('opens a checklist item on demand and preserves its existing completion when edited', () => {
  const repo = createLocalStoreRepository(null);
  const item = repo.getSnapshot().checklistItems[0];
  repo.setChecklistStatus(item.id, 'done');
  render(<StoreProvider initialRepository={repo}><ChecklistEditor /></StoreProvider>);
  expect(screen.getByRole('heading', { name: '체크리스트 설정' })).toBeInTheDocument();
  const details = screen.getByText(item.title).closest('details')!;
  expect(details).not.toHaveAttribute('open');
  fireEvent.click(within(details).getByText(item.title));
  fireEvent.change(within(details).getByLabelText('항목 이름'), { target: { value: '출근 후 진열 확인' } });
  fireEvent.submit(within(details).getByRole('form'));
  expect(repo.getSnapshot().checklistItems[0].title).toBe('출근 후 진열 확인');
  expect(repo.getSnapshot().checklistProgress.find(progress => progress.itemId === item.id)?.status).toBe('done');
});
