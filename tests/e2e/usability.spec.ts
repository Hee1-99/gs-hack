import { expect, test, type Locator, type Page } from '@playwright/test';
async function tabTo(page: Page, target: Locator) {
  await expect(target).toBeVisible(); await expect(target).toBeEnabled();
  for (let index = 0; index < 100; index++) {
    if (await target.evaluate(element => element === document.activeElement)) {
      await expect(target).toBeFocused();
      expect(await target.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe('none');
      return;
    }
    await page.keyboard.press('Tab');
  }
  throw new Error('Target was not reachable using Tab');
}
async function activate(page: Page, target: Locator) { await tabTo(page, target); await page.keyboard.press('Enter'); }
test('primary pages and active POS fit mobile and desktop without horizontal overflow', async ({ page }, info) => {
  for (const route of ['/', '/manager/manual', '/manager/checklist', '/crew', '/crew/questions', '/crew/checklist', '/manager/dashboard']) {
    await page.goto(route); await expect(page.locator('h1')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
    await page.screenshot({ path: `docs/evidence/revision-${route.replaceAll('/', '-') || 'home'}-${info.project.name}.png`, fullPage: true });
  }
  await page.goto('/crew/simulation');
  await page.getByRole('button', { name: '연습 시작하기', exact: true }).click();
  await expect(page.getByRole('group', { name: 'POS 행동 선택' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `docs/evidence/revision-active-${info.project.name}.png`, fullPage: true });
});
test('keyboard-only quiz, Q&A, checklist and reset focus flow', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('/');
  await activate(page, page.getByRole('link', { name: /연습 시작하기/ }));
  await activate(page, page.getByRole('button', { name: '연습 시작하기', exact: true }));
  await expect(page.getByRole('heading', { name: '인수인계 확인', exact: true })).toBeFocused();
  await activate(page, page.getByRole('button', { name: /시재·처리할 상품·특이사항 함께 확인/ }));
  await activate(page, page.getByRole('button', { name: '이 행동으로 진행' }));
  await activate(page, page.getByRole('button', { name: '다음 단계', exact: true }));
  await expect(page.getByRole('heading', { name: '시재 차이 확인', exact: true })).toBeFocused();
  await activate(page, page.getByRole('link', { name: '매장 Q&A', exact: true }));
  await activate(page, page.getByRole('button', { name: '상품 검수', exact: true }));
  await expect(page.getByTestId('question-log')).toContainText('매뉴얼 근거 있음');
  await activate(page, page.getByRole('link', { name: '체크리스트', exact: true }));
  await tabTo(page, page.getByLabel('입고 상품 확인 상태'));
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('Tab');
  await expect(page.getByLabel('입고 상품 확인 상태')).toHaveValue('done');
  await activate(page, page.getByRole('button', { name: '데모 데이터 초기화', exact: true }));
  await expect(page.getByRole('button', { name: '취소', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: '데모 데이터 초기화', exact: true })).toBeFocused();
  await activate(page, page.getByRole('link', { name: '경영주 관리', exact: true }));
  await expect(page.getByRole('heading', { name: '연습 기록과 점수', exact: true })).toBeVisible();
});
