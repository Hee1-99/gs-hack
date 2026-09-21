import { expect, test } from '@playwright/test';
test('reference app navigation is reachable and never covers checklist controls', async ({ page }, info) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const nav = page.getByRole('navigation', { name: '모바일 메뉴', includeHidden: true });
  if (info.project.use.viewport!.width <= 700) {
    await expect(nav).toBeVisible();
    await expect(nav).toHaveCSS('position', 'fixed');
    const copy = await page.locator('.service-checklist p').boundingBox();
    const art = await page.locator('.service-checklist .friendly-tool-art').boundingBox();
    expect(copy!.y + copy!.height).toBeLessThanOrEqual(art!.y);
    await nav.getByRole('link', { name: '체크리스트', exact: true }).click();
    await expect(page).toHaveURL(/\/crew\/checklist$/);
    await expect(nav.getByRole('link', { name: '체크리스트', exact: true })).toHaveAttribute('aria-current', 'page');
    const control = page.getByLabel('입고 상품 확인 상태');
    await control.selectOption('done');
    await expect(control).toHaveValue('done');
    await page.getByRole('button', { name: '데모 데이터 초기화', exact: true }).scrollIntoViewIfNeeded();
    const button = await page.getByRole('button', { name: '데모 데이터 초기화', exact: true }).boundingBox();
    const bar = await nav.boundingBox();
    expect(button!.y + button!.height).toBeLessThanOrEqual(bar!.y);
    await nav.getByRole('link', { name: '매장 Q&A', exact: true }).click();
    await expect(page.getByRole('heading', { name: '매장 Q&A', exact: true })).toBeVisible();
    await nav.getByRole('link', { name: '시뮬레이터', exact: true }).click();
    await expect(page.getByRole('button', { name: '연습 시작하기', exact: true })).toBeVisible();
  } else {
    await expect(nav).toBeHidden();
    await expect(page.getByRole('link', { name: /테스트 시작하기/ })).toBeVisible();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
