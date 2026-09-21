import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import Home from './page';
it('starts with practice and hiring test, without an owner start mode', () => {
  render(<Home />);
  expect(screen.getByRole('link', { name: /연습 시작하기/ })).toHaveAttribute('href', '/crew/simulation');
  expect(screen.getByRole('link', { name: /테스트 시작하기/ })).toHaveAttribute('href', '/crew/simulation?mode=test');
  expect(screen.queryByText('경영주로 시작')).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: /매장 Q&A/ })).toHaveAttribute('href', '/crew/questions');
});
