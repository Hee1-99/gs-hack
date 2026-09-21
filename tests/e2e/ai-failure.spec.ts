import { expect, test } from '@playwright/test';
import { trainingSteps } from '../../src/features/training/training-data';
import { enterTrainingAnswer, trainingWrittenInput } from './training-actions';
test('HTTP failure retains question and retry resolves once; pending prevents duplicates', async ({ page }) => {
  await page.goto('/crew/questions');
  await page.route('**/api/ai/qa', route => route.fulfill({ status: 503, body: 'SYNTHETIC_ERROR_CANARY' }));
  await page.getByLabel('매장에 궁금한 점').fill('행사 문의는 POS 확인 후 안내');
  await page.getByRole('button', { name: '질문하기', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: '다시 질문' })).toBeVisible();
  await expect(page.getByLabel('매장에 궁금한 점')).toHaveValue('행사 문의는 POS 확인 후 안내');
  await expect(page.locator('body')).not.toContainText('SYNTHETIC_ERROR_CANARY');
  await page.unroute('**/api/ai/qa');
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  let calls = 0;
  await page.route('**/api/ai/qa', async route => { calls++; await gate; await route.continue(); });
  await page.getByRole('button', { name: '질문하기', exact: true }).click();
  await expect(page.getByRole('button', { name: '규칙 확인 중…' })).toBeDisabled();
  await expect(page.getByRole('status').filter({ hasText: '준비하고 있어요' })).toBeVisible();
  release();
  await expect(page.getByTestId('question-log')).toHaveCount(1);
  await expect(page.getByTestId('question-log')).toContainText('데모 모드');
  expect(calls).toBe(1);
});
test('failed AI grading retains the written answer and resumes without leaking provider errors', async ({ page }) => {
  test.setTimeout(90_000);
  let aiCalls = 0;
  let retried = false;
  await page.route('**/api/ai/**', route => { aiCalls++; return route.fulfill({ status: 503, body: 'SYNTHETIC_PROVIDER_CANARY' }); });
  await page.goto('/crew/simulation?mode=test');
  await page.getByRole('button', { name: '테스트 시작하기', exact: true }).click();
  for (const [index, step] of trainingSteps.entries()) {
    await expect(page.getByRole('heading', { name: step.title, exact: true })).toBeVisible();
    await enterTrainingAnswer(page, step);
    const submit = page.getByRole('button', { name: index === trainingSteps.length - 1 ? '제출하고 점수 보기' : '답 제출하고 다음 단계', exact: true });
    await submit.click();
    if (step.kind === 'short-answer' && !retried) {
      await expect(page.getByRole('alert').filter({ hasText: '답안은 유지' })).toBeVisible();
      await expect(trainingWrittenInput(page, step)).toHaveValue(step.sampleAnswer!);
      await expect(page.getByRole('heading', { name: step.title, exact: true })).toBeVisible();
      expect(aiCalls).toBe(1);
      await page.unroute('**/api/ai/**');
      await submit.click();
      retried = true;
    }
  }
  await expect(page.getByRole('heading', { name: '끝까지 해냈어요!' })).toBeVisible();
  await expect(page.locator('.score-display')).toContainText('100');
  expect(retried).toBe(true);
  expect(aiCalls).toBe(1);
  await expect(page.locator('body')).not.toContainText('SYNTHETIC_PROVIDER_CANARY');
});
test('invalid manual requests fail safely without leaking request data', async ({ request }) => {
  const response = await request.post('/api/ai/qa', { data: { question: 'SYNTHETIC_INPUT_CANARY', rules: [], manual: { name: 'bad.txt', text: 'a'.repeat(20_001) } } });
  expect(response.status()).toBe(400);
  expect(await response.text()).not.toContain('SYNTHETIC_INPUT_CANARY');
});
