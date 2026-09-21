import { expect, test } from '@playwright/test';
test('recovers malformed storage and resets only the app after confirmation', async ({ page }) => {
  await page.goto('/manager/dashboard');
  // Wait for repository hydration before injecting corruption, otherwise the first
  // page can recover it before the reload under parallel worker load.
  await expect(page.getByTestId('training-count')).toHaveText('0');
  await page.evaluate(() => { localStorage.setItem('firstday.zip', '{broken'); localStorage.setItem('other-app', 'keep'); });
  await page.reload();
  await expect(page.getByRole('status').filter({ hasText: '복구했어요' })).toBeVisible();
  await expect(page.getByTestId('training-count')).toHaveText('0');
  await page.getByRole('button', { name: '데모 데이터 초기화', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: '데모 데이터 초기화', exact: true })).toBeFocused();
  await page.getByRole('button', { name: '데모 데이터 초기화', exact: true }).click();
  await page.getByRole('button', { name: '초기화하기', exact: true }).click();
  await page.reload();
  await expect(page.getByTestId('checklist-count')).toHaveText('0 / 4');
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
test('recovers a session whose snapshot product is missing before it can break the flow', async ({ page }) => {
  await page.goto('/crew/simulation');
  await page.getByRole('button', { name: '연습 시작', exact: true }).click();
  await expect(page.getByRole('button', { name: '캔커피 A 조회' })).toBeEnabled();
  await page.evaluate(() => { const data = JSON.parse(localStorage.getItem('firstday.zip')!); data.sessions[0].snapshot.products = []; localStorage.setItem('firstday.zip', JSON.stringify(data)); });
  await page.reload();
  await expect(page.getByRole('status').filter({ hasText: '복구했어요' })).toBeVisible();
  await expect(page.getByRole('button', { name: '연습 시작', exact: true })).toBeVisible();
});
