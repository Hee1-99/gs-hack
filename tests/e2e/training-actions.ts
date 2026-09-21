import { expect, type Page } from '@playwright/test';
import type { TrainingStep } from '../../src/features/training/training-data';

export async function enterTrainingAnswer(page: Page, step: TrainingStep, wrong = false) {
  await expect(page.getByRole('heading', { name: step.title, exact: true })).toBeVisible();
  if (step.kind === 'short-answer') {
    await page.getByLabel('고객에게 할 말', { exact: true }).fill(wrong ? '모르겠어요.' : step.sampleAnswer!);
  } else {
    const choice = step.choices.find(item => wrong ? item.id !== step.correctChoiceId : item.id === step.correctChoiceId)!;
    await page.getByRole('group', { name: 'POS 행동 선택' }).getByRole('button').filter({ hasText: choice.label }).click();
  }
}
