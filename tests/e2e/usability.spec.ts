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
async function type(page: Page, target: Locator, value: string) { await tabTo(page, target); await page.keyboard.press('ControlOrMeta+A'); await page.keyboard.insertText(value); }
test('all primary screens fit and simulation reading order matches the DOM', async ({ page }, info) => {
  const routes = ['/', '/manager/manual', '/manager/checklist', '/crew', '/crew/questions', '/crew/checklist', '/manager/dashboard'];
  for (const route of routes) {
    await page.goto(route); await expect(page.locator('h1')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
    await page.screenshot({ path: `docs/evidence/inspect-${route.replaceAll('/', '-') || 'home'}-${info.project.name}.png`, fullPage: true });
  }
  await page.goto('/crew/simulation');
  await page.getByRole('button', { name: '연습 시작', exact: true }).click();
  await expect(page.getByRole('button', { name: '캔커피 A 조회' })).toBeEnabled();
  await page.screenshot({ path: `docs/evidence/active-simulation-${info.project.name}.png`, fullPage: true });
  expect(await page.locator('.virtual-pos').evaluate(element => getComputedStyle(element).order)).toBe('0');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('both roles can edit, practice, retry, ask and complete work using only the keyboard', async ({ page }, info) => {
  test.setTimeout(60_000);
  await page.goto('/');
  await activate(page, page.getByRole('link', { name: /경영주로 시작/ }));
  const form = page.getByRole('form', { name: '행사 문의는 POS 확인 후 안내' });
  await type(page, form.getByLabel('규칙 내용'), 'POS 조회 후 행사 조건을 안내해요.');
  await activate(page, form.getByRole('button', { name: '규칙 저장' }));
  await expect(form.getByRole('status')).toContainText('저장했어요');
  await activate(page, page.getByRole('link', { name: '스토어 매니저로 전환' }));
  await activate(page, page.getByRole('link', { name: '응대 연습', exact: true }));
  await activate(page, page.getByRole('button', { name: '연습 시작', exact: true }));
  await type(page, page.getByLabel('안내할 총액'), '4500');
  await type(page, page.getByLabel('고객에게 할 말'), '가격을 안내할게요.');
  await activate(page, page.getByRole('button', { name: '답변하고 결과 보기' }));
  await expect(page.getByRole('heading', { name: '확인 순서를 다시 연습해요' })).toBeFocused();
  await activate(page, page.getByRole('button', { name: '같은 상황 다시 연습' }));
  await activate(page, page.getByRole('button', { name: '캔커피 A 조회' }));
  await expect(page.getByRole('status').filter({ hasText: '3,000원' })).toBeVisible();
  await type(page, page.getByLabel('안내할 총액'), '3000');
  await type(page, page.getByLabel('고객에게 할 말'), '조회해서 확인했어요.');
  await activate(page, page.getByRole('button', { name: '답변하고 결과 보기' }));
  await expect(page.getByRole('heading', { name: '확인하고 안내했어요' })).toBeFocused();
  await page.screenshot({ path: `docs/evidence/keyboard-feedback-${info.project.name}.png`, fullPage: true });
  await activate(page, page.getByRole('link', { name: '매장 Q&A', exact: true }));
  await activate(page, page.getByRole('button', { name: '행사 문의는 POS 확인 후 안내', exact: true }));
  await expect(page.getByTestId('question-log')).toContainText('v2');
  await activate(page, page.getByRole('link', { name: '체크리스트', exact: true }));
  await tabTo(page, page.getByLabel('입고 상품 확인 상태'));
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('Tab');
  await expect(page.getByLabel('입고 상품 확인 상태')).toHaveValue('done');
  await activate(page, page.getByRole('button', { name: '데모 데이터 초기화', exact: true }));
  await expect(page.getByRole('button', { name: '취소', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: '데모 데이터 초기화', exact: true })).toBeFocused();
  await activate(page, page.getByRole('link', { name: '경영주로 전환' }));
  await activate(page, page.getByRole('link', { name: '대시보드', exact: true }));
  await expect(page.getByTestId('training-count')).toHaveText('2');
  await expect(page.getByTestId('checklist-count')).toHaveText('1 / 4');
});
