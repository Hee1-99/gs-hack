import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import Home from './page';
it('offers distinct routes for both demo roles with an honest notice', () => {
  render(<Home />);
  expect(screen.getByRole('link', { name: /스토어 매니저로 시작/ })).toHaveAttribute('href', '/crew');
  expect(screen.getByRole('link', { name: /경영주로 시작/ })).toHaveAttribute('href', '/manager/manual');
  expect(screen.getByText(/데모용 역할 전환/)).toBeVisible();
});
