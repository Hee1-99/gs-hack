import { expect, test } from '@playwright/test';

test('manual answers retain source evidence, uploaded text and unsupported state', async ({ page }, testInfo) => {
  await page.goto('/crew/questions');
  await page.getByRole('button', { name: '상품 검수', exact: true }).click();
  const latest = page.getByTestId('question-log').first();
  await expect(latest).toContainText('실제 입고 수량');
  await latest.getByText('답변 근거 ·', { exact: false }).click();
  await expect(latest.getByRole('link', { name: '상품 검수' })).toHaveAttribute('href', 'https://youtu.be/frVZswofdA0');
  await page.reload();
  await expect(page.getByTestId('question-log')).toHaveCount(1);
  await page.getByText('매뉴얼 업로드 · 자료 안내', { exact: false }).click();
  await page.getByLabel('내 매뉴얼 선택').setInputFiles({ name: 'umbrella.md', mimeType: 'text/markdown', buffer: Buffer.from('# 우산 보관\n고객 우산은 출입문 옆 우산함에 보관한다.', 'utf8') });
  await expect(page.getByText('업로드한 매뉴얼을 다음 질문부터 사용해요.')).toBeVisible();
  await page.reload();
  await expect(page.locator('.manual-active-source')).toContainText('umbrella.md');
  await page.getByLabel('매장에 궁금한 점').fill('우산 보관');
  await page.getByRole('button', { name: '질문하기', exact: true }).click();
  await expect(latest).toContainText('출입문 옆 우산함');
  await page.getByLabel('매장에 궁금한 점').fill('행사 문의는 POS 확인 후 안내');
  await page.getByRole('button', { name: '질문하기', exact: true }).click();
  await expect(latest).toContainText('경영주 확인 필요');
  await expect(latest).not.toContainText('3,000원');
  await page.getByLabel('매장에 궁금한 점').fill('직원 급여 정산 계좌');
  await page.getByRole('button', { name: '질문하기', exact: true }).click();
  await expect(latest).toContainText('경영주 확인 필요');
  await page.screenshot({ path: `docs/evidence/manual-qa-${testInfo.project.name}.png`, fullPage: true });
});

test('manual upload rejects unsupported types and oversized files with a usable explanation', async ({ page }) => {
  await page.goto('/crew/questions');
  await page.getByText('매뉴얼 업로드 · 자료 안내', { exact: false }).click();
  await page.getByLabel('내 매뉴얼 선택').setInputFiles({ name: 'manual.pdf', mimeType: 'application/pdf', buffer: Buffer.from('pdf') });
  await expect(page.getByRole('status')).toContainText('20KB 이하');
  await page.getByLabel('내 매뉴얼 선택').setInputFiles({ name: 'large.txt', mimeType: 'text/plain', buffer: Buffer.alloc(20_001, 'a') });
  await expect(page.getByRole('status')).toContainText('20KB 이하');
  await expect(page.locator('.manual-active-source')).toContainText('58개 자료');
});
