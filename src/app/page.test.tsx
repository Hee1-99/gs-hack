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
it('explains GStep manual provenance and provides real AI conversation practice', () => {
  render(<Home />);
  expect(screen.getByText('실제 GS25 교육 매뉴얼 기반')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /AI 대화 연습/ })).toHaveAttribute('href', '/crew/chat');
  expect(screen.getByRole('heading', { name: /매뉴얼에서 배우고/ })).toBeInTheDocument();
});
