import { expect, test } from '@playwright/test';
import { trainingSteps } from '../../src/features/training/training-data';

async function choose(page: import('@playwright/test').Page, index: number, wrong = false) {
  const step = trainingSteps[index];
  const choice = step.choices.find(item => wrong ? item.id !== step.correctChoiceId : item.id === step.correctChoiceId)!;
  await page.getByRole('heading', { name: step.title, exact: true }).waitFor();
  await page.getByRole('group', { name: 'POS 행동 선택' }).getByRole('button').filter({ hasText: choice.label }).click();
}

test('complete quiz keeps an incorrect action and improves the score on a POS retry', async ({ page }, testInfo) => {
  await page.goto('/crew/simulation');
  await page.getByRole('button', { name: '연습 시작하기', exact: true }).click();
  for (let index = 0; index < trainingSteps.length; index++) {
    await choose(page, index, index === 3);
    if (index === 3) await page.screenshot({ path: `docs/evidence/quiz-pos-${testInfo.project.name}.png`, fullPage: true });
    await page.getByRole('button', { name: '이 행동으로 진행' }).click();
    await expect(page.getByRole('heading', { name: index === 3 ? '이 단계는 다시 기억해 두세요.' : '좋아요, 정확한 순서예요!' })).toBeVisible();
    await page.getByRole('button', { name: index === trainingSteps.length - 1 ? '최종 점수 보기' : '다음 단계', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: '끝까지 해냈어요!' })).toBeFocused();
  await expect(page.locator('.score-display')).toHaveText('92/ 100점');
  await page.getByRole('button', { name: '다시 연습하기' }).click();
  for (let index = 0; index < trainingSteps.length; index++) {
    await choose(page, index);
    await page.getByRole('button', { name: '이 행동으로 진행' }).click();
    await page.getByRole('button', { name: index === trainingSteps.length - 1 ? '최종 점수 보기' : '다음 단계', exact: true }).click();
  }
  await expect(page.locator('.score-display')).toHaveText('100/ 100점');
  await page.reload();
  await page.getByRole('button', { name: '지난 결과 보기' }).click();
  await expect(page.locator('.score-display')).toHaveText('100/ 100점');
  const attempts = await page.evaluate(() => JSON.parse(localStorage.getItem('firstday-training-v1')!).attempts);
  expect(attempts).toHaveLength(2);
  expect(attempts.map((attempt: { score: number }) => attempt.score)).toEqual([92, 100]);
  await page.screenshot({ path: `docs/evidence/quiz-result-${testInfo.project.name}.png`, fullPage: true });
});

test('hiring test resumes after refresh and hides feedback until the complete result', async ({ page }) => {
  await page.goto('/crew/simulation?mode=test');
  await page.getByLabel('테스트 참여자 별칭').fill('지원자 A');
  await page.getByRole('button', { name: '테스트 시작하기', exact: true }).click();
  for (let index = 0; index < trainingSteps.length; index++) {
    await choose(page, index, index === 0);
    await expect(page.locator('.training-feedback')).toHaveCount(0);
    await expect(page.getByText(trainingSteps[index].explanation, { exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: index === trainingSteps.length - 1 ? '제출하고 점수 보기' : '답 제출하고 다음 단계' }).click();
    if (index === 2) {
      await page.reload();
      await page.getByRole('button', { name: '이어서 하기' }).click();
      await expect(page.getByRole('heading', { name: trainingSteps[3].title, exact: true })).toBeVisible();
    }
  }
  await expect(page.locator('.score-display')).toHaveText('92/ 100점');
  await expect(page.getByText('지원자 A님의 테스트 결과예요.')).toBeVisible();
  await page.locator('.review-incorrect summary').click();
  await expect(page.getByText(trainingSteps[0].explanation, { exact: true })).toBeVisible();
  const attempts = await page.evaluate(() => JSON.parse(localStorage.getItem('firstday-training-v1')!).attempts);
  expect(attempts).toHaveLength(1);
  expect(attempts[0].answers).toHaveLength(12);
  expect(attempts[0]).toMatchObject({ mode: 'test', candidateName: '지원자 A', score: 92, status: 'completed' });
});
