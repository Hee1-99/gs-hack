import { expect, test } from '@playwright/test';
test('new manual rule answers a new question without rewriting unresolved history', async ({ page }) => {
  await page.goto('/crew/questions');
  await page.getByLabel('매장에 궁금한 점').fill('직원 급여 정산 계좌');
  await page.getByRole('button', { name: '질문하기', exact: true }).click();
  await expect(page.getByTestId('question-log')).toContainText('경영주 확인 필요');
  const original = await page.evaluate(() => JSON.parse(localStorage.getItem('firstday.zip')!).questions[0]);
  await page.getByRole('link', { name: '경영주 관리', exact: true }).click();
  await page.getByRole('link', { name: '추가 매장 규칙', exact: true }).click();
  await page.getByRole('button', { name: '새 규칙 추가' }).click();
  const form = page.getByRole('form', { name: '새 규칙 작성' });
  await form.getByLabel('규칙 제목').fill('직원 급여 정산 계좌');
  await form.getByLabel('분류').fill('합성 안내');
  await form.getByLabel('규칙 내용').fill('가상 매장의 급여 문의는 연습용 담당 창구에서 확인해요.');
  await form.getByLabel('예외 처리').fill('추가 문의는 경영주에게 확인해요.');
  await form.getByRole('button', { name: '규칙 등록' }).click();
  await page.goto('/crew/questions');
  await page.locator('summary').filter({ hasText: '매장 추가 규칙' }).click();
  await page.getByRole('button', { name: '직원 급여 정산 계좌', exact: true }).click();
  await expect(page.getByTestId('question-log').first()).toContainText('가상 매장의 급여 문의는 연습용 담당 창구에서 확인해요.');
  await expect(page.getByTestId('question-log').first()).toContainText('v1');
  await expect(page.getByTestId('question-log').last()).toContainText('경영주 확인 필요');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('firstday.zip')!).questions[0])).toEqual(original);
  await page.getByRole('link', { name: '체크리스트', exact: true }).click();
  for (const status of ['done', 'needs_manager', 'pending', 'done']) {
    await page.getByLabel('입고 상품 확인 상태').selectOption(status);
    await page.reload();
    await expect(page.getByLabel('입고 상품 확인 상태')).toHaveValue(status);
  }
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('firstday.zip')!));
  expect(state.checklistProgress).toHaveLength(1);
  expect(state.questions).toHaveLength(2);
  expect(state.questions.filter((question: { status: string }) => question.status === 'unresolved')).toHaveLength(1);
  await expect(page.getByRole('progressbar', { name: '업무 완료 현황' })).toHaveAttribute('value', '1');
  await page.getByRole('link', { name: '경영주 관리', exact: true }).click();
  await expect(page.getByTestId('training-count')).toHaveText('0회');
  await expect(page.getByTestId('training-average')).toHaveText('—완료 후 표시');
});
