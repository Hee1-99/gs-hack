import { expect, test } from '@playwright/test';
import { createSeed } from '../../src/domain/seed';
import { startSession } from '../../src/features/simulation/engine';

test('recovers malformed storage and resets only the app after confirmation', async ({ page }) => {
  await page.goto('/crew/checklist');
  await expect(page.getByRole('combobox')).toHaveCount(4);
  await page.evaluate(() => { localStorage.setItem('firstday.zip', '{broken'); localStorage.setItem('other-app', 'keep'); });
  await page.reload();
  await expect(page.getByRole('status').filter({ hasText: '복구했어요' })).toBeVisible();
  await expect(page.getByRole('combobox')).toHaveCount(4);
  await page.getByRole('button', { name: '데모 데이터 초기화', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: '데모 데이터 초기화', exact: true })).toBeFocused();
  await page.getByRole('button', { name: '데모 데이터 초기화', exact: true }).click();
  await page.getByRole('button', { name: '초기화하기', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('progressbar', { name: '업무 완료 현황' })).toHaveAttribute('value', '0');
  expect(await page.evaluate(() => localStorage.getItem('other-app'))).toBe('keep');
});

test('quota failure shows temporary state and no durable-save success', async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('Full', 'QuotaExceededError'); }; });
  await page.goto('/manager/manual');
  await expect(page.getByRole('alert').filter({ hasText: '저장할 수 없어' })).toContainText('임시');
  const form = page.getByRole('form', { name: '행사 문의는 POS 확인 후 안내' });
  await form.getByLabel('규칙 내용').fill('임시 변경');
  await form.getByRole('button', { name: '규칙 저장' }).click();
  await expect(form.getByRole('status')).toContainText('저장하지 못했어요');
  await expect(form.getByRole('status')).not.toContainText('저장했어요');
  await page.reload();
  await expect(form.getByLabel('규칙 내용')).not.toHaveValue('임시 변경');
});

test('recovers legacy session corruption without breaking current screens', async ({ page }) => {
  const state = createSeed();
  const session = startSession(state.scenarios[0], state);
  session.snapshot.products = [];
  state.sessions = [session];
  await page.goto('/crew/checklist');
  await expect(page.getByRole('combobox')).toHaveCount(4);
  await page.evaluate(data => localStorage.setItem('firstday.zip', JSON.stringify(data)), state);
  await page.reload();
  await expect(page.getByRole('status').filter({ hasText: '복구했어요' })).toBeVisible();
  await expect(page.getByRole('combobox')).toHaveCount(4);
});

test('rejects a corrupted quiz result rather than showing an invented score', async ({ page }) => {
  await page.goto('/crew/simulation');
  await page.getByRole('button', { name: '연습 시작하기', exact: true }).click();
  await expect(page.getByRole('heading', { name: '인수인계 확인', exact: true })).toBeVisible();
  await page.evaluate(() => { const data = JSON.parse(localStorage.getItem('firstday-training-v1')!); data.attempts[0].score = 100; localStorage.setItem('firstday-training-v1', JSON.stringify(data)); });
  await page.reload();
  await expect(page.getByRole('status').filter({ hasText: '복구했어요' })).toBeVisible();
  await expect(page.getByRole('button', { name: '이어서 하기' })).toHaveCount(0);
  await page.getByRole('link', { name: '경영주 관리', exact: true }).click();
  await expect(page.getByTestId('training-count')).toHaveText('0회');
  await expect(page.getByTestId('training-average')).toContainText('완료 후 표시');
});
