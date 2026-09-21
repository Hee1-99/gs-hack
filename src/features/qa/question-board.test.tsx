import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { createLocalStoreRepository } from '@/data/local-store-repository';
import { StoreProvider } from '@/data/store-provider';
import { QuestionBoard } from './question-board';
afterEach(() => vi.unstubAllGlobals());
it('does not resurrect an in-flight question after data reset', async () => {
  localStorage.clear(); const repo = createLocalStoreRepository(localStorage);
  let respond!: (value: Response) => void;
  vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(resolve => { respond = resolve; })));
  render(<StoreProvider initialRepository={repo}><QuestionBoard/></StoreProvider>);
  await userEvent.type(screen.getByLabelText('매장에 궁금한 점'), '택배 문의');
  await userEvent.click(screen.getByRole('button', { name: '질문하기' }));
  act(() => { repo.resetToSeed(); });
  await act(async () => { respond(Response.json({ id: 'q', question: '택배 문의', answer: '확인 필요', rules: [], status: 'unresolved', mode: 'demo', createdAt: new Date().toISOString() })); });
  await waitFor(() => expect(screen.getByLabelText('매장에 궁금한 점')).toBeEnabled());
  expect(repo.getSnapshot().questions).toHaveLength(0);
});
