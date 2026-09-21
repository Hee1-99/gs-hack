import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { legacyTrainingSteps, trainingSteps } from './training-data';

it('gives all 36 stages an explicit speaker and mission instead of repeating narration as speech', () => {
  expect(trainingSteps).toHaveLength(36);
  for (const step of trainingSteps) {
    expect(step.speakerLabel, step.id).toBeTruthy();
    expect(step.mission, step.id).toBeTruthy();
    expect(step.customer, step.id).not.toBe(step.situation);
    expect(step.question, step.id).not.toContain('고객이나 다음 근무자');
    if (step.kind === 'short-answer') {
      expect(step.responseLabel, step.id).toBeTruthy();
      expect(step.answerPlaceholder, step.id).toBeTruthy();
    }
  }
});

it('addresses handover to the next worker and keeps equipment-specific ground in scope', () => {
  for (const id of ['handover-note', 'report']) {
    const step = trainingSteps.find(step => step.id === id)!;
    expect(step.speakerLabel).toBe('다음 근무자');
    expect(step.responseLabel).toBe('다음 근무자에게 전달할 내용');
    expect(step.screen).toBe('report');
  }
  expect(trainingSteps.find(step => step.id === 'hotpot-clean')!.situation).toContain('어묵기');
  expect(trainingSteps.find(step => step.id === 'stock-difference')!.situation).toContain('담배');
});

it('uses only body-confirmed video summaries and preserves all legacy record content', () => {
  const manual = readFileSync('docs/gs25-store-manager-training-map.md', 'utf8');
  const bodies = manual.split(/^#### /m).slice(1);
  for (const step of trainingSteps) {
    const url = new URL(step.source.url);
    const id = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v');
    const body = bodies.find(body => body.split('\n')[0].includes(id!));
    expect(body, step.id).toBeTruthy();
    expect(body!.split('- 내용:')[0], step.id).toContain('본문 요약 확보');
  }
  expect(createHash('sha256').update(JSON.stringify(legacyTrainingSteps)).digest('hex')).toBe('2f4896d3860976e213ac5173c5ff05adf86e155210e9d716115a08b9572201f1');
});
