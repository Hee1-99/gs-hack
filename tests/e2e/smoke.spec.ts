import { expect, test } from '@playwright/test';
test('shows both demo roles and synthetic-data notice', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /스토어 매니저로 시작/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /경영주로 시작/ })).toBeVisible();
  await expect(page.getByText(/실제 GS25 운영 정보가 아닌/)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: '본문으로 건너뛰기' })).toBeFocused();
  await page.keyboard.press('Tab');
  await page.screenshot({ path: `docs/evidence/home-${testInfo.project.name}.png`, fullPage: true });
});
