import { expect, test } from '@playwright/test';

test('freeform customer chat resumes, evaluates the actual transcript and stores a separate retry', async ({ page }, testInfo) => {
  await page.goto('/crew/chat');
  await page.getByRole('button', { name: /행사 상품 문의/ }).click();
  await expect(page.getByRole('heading', { name: '행사 상품 문의' })).toBeVisible();
  await expect(page.getByRole('log', { name: '고객과의 대화' })).toContainText('캔커피 A');
  await expect(page.getByRole('region', { name: '연습 상황 정보' })).toContainText('1,500원');
  await expect(page.getByRole('region', { name: '연습 상황 정보' })).toContainText('3개 3,000원');
  await expect(page.getByRole('region', { name: '연습 상황 정보' })).toContainText('동일 상품만 적용');
  await page.screenshot({ path: `docs/evidence/chat-briefing-${testInfo.project.name}.png`, fullPage: true });
  await page.getByLabel('고객에게 할 말').fill('안녕하세요. 정확한 행사 조건을 POS에서 확인하고 안내드릴게요. 잠시 기다려 주셔서 감사합니다.');
  await page.getByRole('button', { name: '답변 보내기', exact: true }).click();
  await expect(page.getByRole('log')).toContainText('확인 부탁');
  await expect(page.getByLabel('고객에게 할 말')).toHaveValue('');
  await page.reload();
  await page.getByRole('button', { name: /행사 상품 문의.*이어서 하기/ }).click();
  await expect(page.getByRole('log')).toContainText('정확한 행사 조건');
  await page.getByRole('button', { name: '대화 마치고 피드백 보기' }).click();
  await expect(page.getByRole('heading', { name: '응대 연습을 마쳤어요' })).toBeVisible();
  await expect(page.getByText('데모 · 표현 기반 점검', { exact: true })).toBeVisible();
  await expect(page.getByRole('progressbar')).toHaveCount(4);
  await page.getByText('코칭 근거 ·', { exact: false }).click();
  await expect(page.getByRole('link', { name: '할인·적립 방법', exact: false })).toBeVisible();
  const first = await page.evaluate(() => JSON.parse(localStorage.getItem('gstep-chat-training-v1')!)[0]);
  expect(first.status).toBe('completed'); expect(first.feedback.score).toBeGreaterThan(0);
  await page.screenshot({ path: `docs/evidence/chat-feedback-${testInfo.project.name}.png`, fullPage: true });
  await page.getByRole('button', { name: '같은 상황 다시 연습' }).click();
  await expect(page.getByLabel('고객에게 할 말')).toBeVisible();
  const ids = await page.evaluate(() => JSON.parse(localStorage.getItem('gstep-chat-training-v1')!).map((entry: { id: string }) => entry.id));
  expect(ids).toHaveLength(2); expect(ids[0]).not.toBe(ids[1]);
});

test('customer clarification reveals fictional details without inventing a refund decision', async ({ page }) => {
  await page.goto('/crew/chat');
  await page.getByRole('button', { name: /교환·환불 문의/ }).click();
  await expect(page.getByRole('region', { name: '연습 상황 정보' })).toContainText('교환·환불 가능 여부와 보상 기준은 제공되지 않았어요');
  await page.getByLabel('고객에게 할 말').fill('불편하셨겠어요. 어떤 상품이며 포장 어디가 이상한지 보여 주실 수 있나요?');
  await page.getByRole('button', { name: '답변 보내기', exact: true }).click();
  await expect(page.getByRole('log')).toContainText('봉지 옆면이 벌어져');
  await page.getByLabel('고객에게 할 말').fill('결제 수단과 구매 내역을 확인할 수 있을까요?');
  await page.getByRole('button', { name: '답변 보내기', exact: true }).click();
  await expect(page.getByRole('log')).toContainText('카드 결제 내역은 보여 드릴 수 있어요');
  await expect(page.getByRole('log')).not.toContainText('환불이 가능합니다');
});

test('customer chat automatically moves to feedback after a natural bounded exchange', async ({ page }) => {
  await page.goto('/crew/chat');
  await page.getByRole('button', { name: /행사 상품 문의/ }).click();
  await expect(page.getByText('답변 0 / 3')).toBeVisible();
  await page.getByLabel('고객에게 할 말').fill('안녕하세요. 행사 조건부터 확인해 드릴게요.');
  await page.getByRole('button', { name: '답변 보내기', exact: true }).click();
  await expect(page.getByText('답변 1 / 3')).toBeVisible();
  await page.getByLabel('고객에게 할 말').fill('같은 캔커피 A 세 개에 3,000원이고 다른 음료와 섞으면 적용되지 않아요. 세 개로 준비해 드릴까요?');
  await page.getByRole('button', { name: '답변 보내기', exact: true }).click();
  await expect(page.getByRole('heading', { name: '응대 연습을 마쳤어요' })).toBeVisible();
  await expect(page.getByRole('button', { name: '대화 마치고 피드백 보기' })).toHaveCount(0);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('gstep-chat-training-v1')!)[0]);
  expect(saved.status).toBe('completed');
  expect(saved.messages.filter((message: { role: string }) => message.role === 'manager')).toHaveLength(2);
});

test('customer chat always caps the practice at three manager replies', async ({ page }) => {
  await page.goto('/crew/chat');
  await page.getByRole('button', { name: /행사 상품 문의/ }).click();
  for (const answer of ['행사 조건을 확인해볼게요.', '아직 확인 중입니다. 잠시만 기다려 주세요.', '조금 더 확인한 뒤 안내드릴게요.']) {
    await page.getByLabel('고객에게 할 말').fill(answer);
    await page.getByRole('button', { name: '답변 보내기', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: '응대 연습을 마쳤어요' })).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('gstep-chat-training-v1')!)[0]);
  expect(saved.status).toBe('completed');
  expect(saved.messages.filter((message: { role: string }) => message.role === 'manager')).toHaveLength(3);
});

test('failed and malformed chat responses preserve typed input; pending prevents duplicate submissions', async ({ page }) => {
  await page.goto('/crew/chat');
  await page.getByRole('button', { name: /불편을 겪은 고객/ }).click();
  await page.route('**/api/ai/chat-training', route => route.fulfill({ status: 503, body: 'SYNTHETIC_CHAT_CANARY' }));
  const input = page.getByLabel('고객에게 할 말');
  await input.fill('기다리시게 해서 죄송합니다. 불편하신 상황부터 확인해 드릴게요.');
  await page.getByRole('button', { name: '답변 보내기', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: '고객 답변을 불러오지' })).toContainText('다시 보내');
  await expect(input).toHaveValue('기다리시게 해서 죄송합니다. 불편하신 상황부터 확인해 드릴게요.');
  await expect(page.locator('body')).not.toContainText('SYNTHETIC_CHAT_CANARY');
  await page.unroute('**/api/ai/chat-training');
  await page.route('**/api/ai/chat-training', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: '잘못된 응답', mode: 'live', sources: [{ id: 'invalid' }] }) }));
  await page.getByRole('button', { name: '답변 보내기', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: '고객 답변을 불러오지' })).toBeVisible();
  await expect(input).toHaveValue('기다리시게 해서 죄송합니다. 불편하신 상황부터 확인해 드릴게요.');
  await page.unroute('**/api/ai/chat-training');
  let release!: () => void; let calls = 0;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/ai/chat-training', async route => { calls++; await gate; await route.continue(); });
  await page.getByRole('button', { name: '답변 보내기', exact: true }).click();
  await expect(page.getByRole('button', { name: '답변 보내는 중…' })).toBeDisabled();
  await expect(input).toBeDisabled(); release();
  await expect(input).toHaveValue(''); expect(calls).toBe(1);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('gstep-chat-training-v1')!)[0]);
  expect(saved.messages.filter((message: { role: string }) => message.role === 'manager')).toHaveLength(1);
});
