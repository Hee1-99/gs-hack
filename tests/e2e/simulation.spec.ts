import { expect, test } from '@playwright/test';
import { trainingSteps } from '../../src/features/training/training-data';
import { enterTrainingAnswer, trainingPracticeSubmit, trainingWrittenInput } from './training-actions';
test.setTimeout(120000);
const wrongPosIndex=trainingSteps.findIndex(step=>step.id==='promotion');

async function choose(page: import('@playwright/test').Page, index: number, wrong = false) {
  await enterTrainingAnswer(page, trainingSteps[index], wrong);
}

test('complete quiz keeps an incorrect action and improves the score on a POS retry', async ({ page }, testInfo) => {
  await page.goto('/crew/simulation');
  await page.getByRole('button', { name: '연습 시작하기', exact: true }).click();
  for (let index = 0; index < trainingSteps.length; index++) {
    await choose(page, index, index === wrongPosIndex);
    if (index === wrongPosIndex) await page.screenshot({ path: `docs/evidence/quiz-pos-${testInfo.project.name}.png`, fullPage: true, animations:'disabled' });
    await trainingPracticeSubmit(page, trainingSteps[index]).click();
    await expect(page.getByRole('heading', { name: index === wrongPosIndex ? '이 단계는 다시 기억해 두세요.' : '좋아요, 필요한 행동을 짚었어요!' })).toBeVisible();
    await page.getByRole('button', { name: index === trainingSteps.length - 1 ? '최종 점수 보기' : '다음 단계', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: '끝까지 해냈어요!' })).toBeFocused();
  await expect(page.locator('.score-display')).toHaveText('97/ 100점');
  await page.getByRole('button', { name: '다시 연습하기' }).click();
  for (let index = 0; index < trainingSteps.length; index++) {
    await choose(page, index);
    await trainingPracticeSubmit(page, trainingSteps[index]).click();
    await page.getByRole('button', { name: index === trainingSteps.length - 1 ? '최종 점수 보기' : '다음 단계', exact: true }).click();
  }
  await expect(page.locator('.score-display')).toHaveText('100/ 100점');
  await page.reload();
  await page.getByRole('button', { name: '지난 결과 보기' }).click();
  await expect(page.locator('.score-display')).toHaveText('100/ 100점');
  const attempts = await page.evaluate(() => JSON.parse(localStorage.getItem('firstday-training-v1')!).attempts);
  expect(attempts).toHaveLength(2);
  expect(attempts.map((attempt: { score: number }) => attempt.score)).toEqual([97, 100]);
  await page.screenshot({ path: `docs/evidence/quiz-result-${testInfo.project.name}.png`, fullPage: true, animations:'disabled' });
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
  await expect(page.locator('.score-display')).toHaveText('97/ 100점');
  await expect(page.getByText('지원자 A님의 테스트 결과예요.')).toBeVisible();
  await page.locator('.review-incorrect summary').click();
  await expect(page.getByText(trainingSteps[0].explanation, { exact: true })).toBeVisible();
  const attempts = await page.evaluate(() => JSON.parse(localStorage.getItem('firstday-training-v1')!).attempts);
  expect(attempts).toHaveLength(1);
  expect(attempts[0].answers).toHaveLength(trainingSteps.length);
  expect(attempts[0]).toMatchObject({ mode: 'test', candidateName: '지원자 A', score: 97, status: 'completed' });
});

test('written grading shows pending, preserves failed answers and excludes AI latency from time', async ({page},testInfo)=>{
  await page.clock.install();
  await page.goto('/crew/simulation');
  await page.getByLabel('연습할 업무').selectOption('근무 준비');
  await page.getByRole('button',{name:'연습 시작하기',exact:true}).click();
  for(let index=0;index<5;index++){
    await choose(page,index);await trainingPracticeSubmit(page, trainingSteps[index]).click();await page.getByRole('button',{name:'다음 단계',exact:true}).click();
  }
  const written=trainingSteps[5];
  await trainingWrittenInput(page, written).fill(written.sampleAnswer!);
  await page.route('**/api/ai/training-grade',route=>route.fulfill({status:503,body:'unavailable'}),{times:1});
  await trainingPracticeSubmit(page, written).click();
  await expect(page.getByRole('alert').filter({hasText:'답안은 유지돼요'})).toContainText('다시 제출해 주세요');
  await expect(trainingWrittenInput(page, written)).toHaveValue(written.sampleAnswer!);
  let release!:()=>void;
  const hold=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/api/ai/training-grade',async route=>{await hold;await route.fulfill({json:{stepId:written.id,score:100,feedback:'기본 기준을 확인했어요.',mode:'demo'}});});
  await trainingPracticeSubmit(page, written).click();
  await expect(page.getByRole('status')).toContainText('AI 채점을 요청하고 있어요');
  await expect(page.getByRole('button',{name:'채점 중…'})).toBeDisabled();
  await page.screenshot({path:`docs/evidence/quiz-written-pending-${testInfo.project.name}.png`,fullPage:true,animations:'disabled'});
  // Advance15seconds within the22second client deadline; AI waiting must not enter recorded answer time.
  await page.clock.fastForward(15000);
  release();
  await expect(page.getByText('기본 기준 채점 · 데모 · 100점')).toBeVisible();
  await page.getByRole('button',{name:'최종 점수 보기'}).click();
  const attempt=await page.evaluate(()=>JSON.parse(localStorage.getItem('firstday-training-v1')!).attempts[0]);
  expect(attempt.answers[5].elapsedMs).toBeLessThan(15000);
  expect(attempt.answers[5].gradingMode).toBe('demo');
  expect(attempt.score).toBe(100);
});
