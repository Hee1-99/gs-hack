import { expect, test } from '@playwright/test';
test('production direct routes, refresh and back navigation preserve state without runtime errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.name));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400 && new URL(response.url()).origin === 'http://127.0.0.1:3100') errors.push(`${response.status()} ${new URL(response.url()).pathname}`); });
  const routes = ['/manager/manual', '/manager/checklist', '/manager/dashboard', '/crew', '/crew/checklist', '/crew/questions', '/crew/simulation'];
  for (const route of routes) { await page.goto(route); await expect(page.locator('h1')).toBeVisible(); }
  await page.goto('/crew/support');
  await expect(page).toHaveURL(/\/crew\/questions$/);
  await page.getByRole('button', { name: '행사 문의는 POS 확인 후 안내', exact: true }).click();
  await expect(page.getByTestId('question-log')).toHaveCount(1);
  await page.getByRole('link', { name: '체크리스트', exact: true }).click();
  await page.getByLabel('입고 상품 확인 상태').selectOption('done');
  await page.goBack();
  await expect(page.getByTestId('question-log')).toHaveCount(1);
  await page.goForward();
  await expect(page.getByLabel('입고 상품 확인 상태')).toHaveValue('done');
  await page.reload();
  await expect(page.getByLabel('입고 상품 확인 상태')).toHaveValue('done');
  expect(errors).toEqual([]);
});
