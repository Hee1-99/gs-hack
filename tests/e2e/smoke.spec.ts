import { expect, test } from '@playwright/test';
test('practice-first landing provides test and work tools without owner start mode', async ({ page }, info) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /연습 시작하기/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /테스트 시작하기/ })).toBeVisible();
  await expect(page.getByText('경영주로 시작')).toHaveCount(0);
  await expect(page.getByText(/거래·상품은 합성 데이터/)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: '본문으로 건너뛰기' })).toBeFocused();
  await page.screenshot({ path: `docs/evidence/home-revision-${info.project.name}.png`, fullPage: true });
});
