import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { createSeed } from '@/domain/seed';
import { VirtualPos } from './virtual-pos';
it('looks up structured facts and emits the exact product ID', async () => {
  const onLookup = vi.fn();
  render(<VirtualPos snapshot={createSeed()} onLookup={onLookup}/>);
  await userEvent.click(screen.getByRole('button', { name: '캔커피 A 조회' }));
  expect(onLookup).toHaveBeenCalledWith('coffee-a');
  expect(screen.getByRole('status')).toHaveTextContent('1,500원');
  expect(screen.getByRole('status')).toHaveTextContent('12개');
  expect(screen.getByRole('status')).toHaveTextContent('2+1 · 3개 3,000원 · 동일 상품만 적용');
});
