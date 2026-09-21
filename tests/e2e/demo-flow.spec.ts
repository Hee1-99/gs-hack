import { expect, test } from '@playwright/test';
import { trainingSteps } from '../../src/features/training/training-data';
import { enterTrainingAnswer } from './training-actions';
test('single browser full demo: rules, quiz failure and retry, Q&A, checklist and owner records', async ({ page }, info) => {
  test.setTimeout(180_000);
  await page.goto('/manager/manual');
  const rule = page.getByRole('form', { name: '행사 문의는 POS 확인 후 안내' });
  await rule.getByLabel('규칙 내용').fill('POS 조회 후 동일 상품 행사 조건을 천천히 안내해요.');
  await rule.getByRole('button', { name: '규칙 저장' }).click();
  await expect(rule).toContainText('v2');
  await page.goto('/crew/simulation');
  await page.getByRole('button', { name: '연습 시작하기', exact: true }).click();
  for (let attempt = 0; attempt < 2; attempt++) {
    for (const [index, step] of trainingSteps.entries()) {
      await enterTrainingAnswer(page, step, attempt === 0 && step.id === 'promotion');
      await page.getByRole('button', { name: '이 행동으로 진행' }).click();
      await page.getByRole('button', { name: index === trainingSteps.length - 1 ? '최종 점수 보기' : '다음 단계', exact: true }).click();
    }
    await expect(page.locator('.score-display')).toContainText(attempt === 0 ? '97' : '100');
    if (attempt === 0) await page.getByRole('button', { name: '다시 연습하기' }).click();
  }
  await page.getByRole('link', { name: '매장 Q&A', exact: true }).click();
  await page.getByText(/매장 추가 규칙 ·/).click();
  await page.getByRole('button', { name: '행사 문의는 POS 확인 후 안내', exact: true }).click();
  await expect(page.getByTestId('question-log').first()).toContainText('천천히 안내해요.');
  await expect(page.getByTestId('question-log').first()).toContainText('v2');
  await page.getByRole('button', { name: '상품 검수', exact: true }).click();
  await expect(page.getByTestId('question-log')).toHaveCount(2);
  await expect(page.getByTestId('question-log').first()).toContainText('매뉴얼 근거 있음');
  await page.getByLabel('매장에 궁금한 점').fill('직원 급여 정산 계좌');
  await page.getByRole('button', { name: '질문하기', exact: true }).click();
  await expect(page.getByTestId('question-log').first()).toContainText('경영주 확인 필요');
  await page.getByRole('link', { name: '체크리스트', exact: true }).click();
  await page.getByLabel('입고 상품 확인 상태').selectOption('done');
  await page.getByLabel('소비기한 확인 상태').selectOption('needs_manager');
  await page.reload();
  await expect(page.getByLabel('입고 상품 확인 상태')).toHaveValue('done');
  await page.getByRole('link', { name: '경영주 관리', exact: true }).click();
  await expect(page.getByTestId('training-count')).toHaveText('2회');
  await expect(page.getByTestId('training-average')).toHaveText('99/ 100');
  await expect(page.getByRole('link', { name: '업무 관리', exact: true })).toHaveCount(0);
  const attempts = await page.evaluate(() => JSON.parse(localStorage.getItem('firstday-training-v1')!).attempts);
  expect(attempts.map((a: { score: number }) => a.score)).toEqual([97, 100]);
  const promotionIndex = trainingSteps.findIndex(step => step.id === 'promotion');
  expect(attempts[0].answers[promotionIndex].correct).toBe(false);
  expect(attempts[1].answers[promotionIndex].correct).toBe(true);
  expect(attempts[1].accuracyScore).toBe(90);
  expect(attempts[1].timeScore).toBe(10);
  await page.screenshot({ path: `docs/evidence/demo-flow-revision-${info.project.name}.png`, fullPage: true });
});
