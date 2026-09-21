import { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it } from 'vitest';
import { createLocalStoreRepository, STORAGE_KEY } from './local-store-repository';
import { StoreProvider, useStore } from './store-provider';

function StoreProbe() {
  const store = useStore();
  if (!store) return <p>Loading</p>;
  return <><output data-testid="state">{store.state.checklistProgress[0]?.status ?? 'pending'}</output><button onClick={() => store.repo.setChecklistStatus('stock', 'done')}>Mark done</button></>;
}

beforeEach(() => localStorage.clear());

it('keeps a corruption recovery notice through StrictMode effect replay and continues subscribing', () => {
  localStorage.setItem(STORAGE_KEY, '{broken');
  render(<StrictMode><StoreProvider><StoreProbe /></StoreProvider></StrictMode>);
  expect(screen.getByText('저장된 데이터를 읽지 못해 가상 매장 기본값으로 복구했어요.')).toHaveAttribute('role', 'status');
  expect(screen.getByTestId('state')).toHaveTextContent('pending');
  fireEvent.click(screen.getByRole('button', { name: 'Mark done' }));
  expect(screen.getByTestId('state')).toHaveTextContent('done');
  expect(screen.queryByText(/복구했어요/)).not.toBeInTheDocument();
});

it('uses a changed injected repository and unsubscribes from the previous instance', () => {
  const first = createLocalStoreRepository(null);
  const second = createLocalStoreRepository(null);
  second.setChecklistStatus('stock', 'needs_manager');
  const { rerender } = render(<StrictMode><StoreProvider initialRepository={first}><StoreProbe /></StoreProvider></StrictMode>);
  expect(screen.getByTestId('state')).toHaveTextContent('pending');
  rerender(<StrictMode><StoreProvider initialRepository={second}><StoreProbe /></StoreProvider></StrictMode>);
  expect(screen.getByTestId('state')).toHaveTextContent('needs_manager');
  act(() => { first.setChecklistStatus('stock', 'done'); });
  expect(screen.getByTestId('state')).toHaveTextContent('needs_manager');
  act(() => { second.setChecklistStatus('stock', 'done'); });
  expect(screen.getByTestId('state')).toHaveTextContent('done');
});
