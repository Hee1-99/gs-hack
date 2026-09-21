import { expect, type Page } from '@playwright/test';
import type { TrainingStep } from '../../src/features/training/training-data';

export function trainingWrittenInput(page: Page, step: TrainingStep) {
  expect(step.kind).toBe('short-answer');
  expect(step.responseLabel).toBeTruthy();
  return page.getByLabel(step.responseLabel!, { exact: true });
}

export function trainingPracticeSubmit(page: Page, step: TrainingStep) {
  return page.getByRole('button', { name: step.kind === 'short-answer' ? '답안 제출하기' : '이 행동으로 진행', exact: true });
}

export async function enterTrainingAnswer(page: Page, step: TrainingStep, wrong = false) {
  await expect(page.getByRole('heading', { name: step.title, exact: true })).toBeVisible();
  if (step.kind === 'short-answer') {
    await trainingWrittenInput(page, step).fill(wrong ? '모르겠어요.' : step.sampleAnswer!);
  } else {
    const choice = step.choices.find(item => wrong ? item.id !== step.correctChoiceId : item.id === step.correctChoiceId)!;
    await page.getByRole('group', { name: '행동 선택', exact: true }).getByRole('button').filter({ hasText: choice.label }).click();
  }
}
