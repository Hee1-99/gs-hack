# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: persistence.spec.ts >> recovers malformed storage and resets only the app after confirmation
- Location: tests\e2e\persistence.spec.ts:2:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('status').filter({ hasText: '복구했어요' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('status').filter({ hasText: '복구했어요' }) with timeout 5000ms
  - waiting for getByRole('status').filter({ hasText: '복구했어요' })

```

```yaml
- link "본문으로 건너뛰기":
  - /url: "#main"
- banner:
  - link "첫날.zip 홈":
    - /url: /
    - text: 첫날 .zip
  - text: 가상 매장 체험
- main:
  - strong: 경영주
  - text: 데모 모드
  - link "스토어 매니저로 전환":
    - /url: /crew
  - navigation "경영주 메뉴":
    - link "매장 매뉴얼":
      - /url: /manager/manual
    - link "업무 관리":
      - /url: /manager/checklist
    - link "대시보드":
      - /url: /manager/dashboard
  - paragraph: MAKE THE NEXT FIRST DAY EASIER
  - heading "우리 매장의 오늘" [level=1]
  - paragraph: GS25 첫날점 · 연습과 업무에서 필요한 도움을 살펴봐요.
  - term: 완료한 연습
  - definition: "0"
  - text: 재도전을 포함한 완료 횟수
  - term: 완료한 업무
  - definition: 0 / 4
  - text: 현재 등록된 업무 기준
  - term: 누적 질문
  - definition: "0"
  - text: 이 브라우저에 남긴 질문
  - term: 확인 필요
  - definition: "0"
  - text: 미해결 질문 + 확인 요청 업무
  - region "매뉴얼에 보완할 질문":
    - heading "매뉴얼에 보완할 질문" [level=2]
    - text: 0개
    - heading "아직 미해결 질문이 없어요" [level=3]
    - paragraph: 규칙에서 답을 찾지 못한 질문이 이곳에 모여요.
  - region "함께 확인할 업무":
    - heading "함께 확인할 업무" [level=2]
    - text: 0개
    - heading "현재 확인 요청이 없어요" [level=3]
    - paragraph: 체크리스트에서 도움이 필요한 항목을 볼 수 있어요.
  - region "최근 연습 기록":
    - heading "최근 연습 기록" [level=2]
    - text: 완료와 진행 상태를 확인해요
    - paragraph: 스토어 매니저가 연습을 시작하면 기록이 나타나요.
  - heading "데모를 처음부터 시작하기" [level=2]
  - paragraph: 이 브라우저의 매뉴얼, 연습, 질문, 업무 기록을 기본값으로 되돌려요.
  - button "데모 데이터 초기화"
  - status
- contentinfo:
  - strong: 연습은 가볍게, 첫날은 든든하게.
  - paragraph: 실제 GS25 운영 정보가 아닌 합성 데이터입니다. 실제 점포 업무에는 사용하지 마세요.
  - text: 로그인 없는 데모용 역할 전환 · 기록은 이 브라우저에 보관
- alert
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | test('recovers malformed storage and resets only the app after confirmation', async ({ page }) => {
  3  |   await page.goto('/');
  4  |   await page.evaluate(() => { localStorage.setItem('firstday.zip', '{broken'); localStorage.setItem('other-app', 'keep'); });
  5  |   await page.goto('/manager/dashboard');
> 6  |   await expect(page.getByRole('status').filter({ hasText: '복구했어요' })).toBeVisible();
     |                                                                       ^ Error: expect(locator).toBeVisible() failed
  7  |   await expect(page.getByTestId('training-count')).toHaveText('0');
  8  |   await page.getByRole('button', { name: '데모 데이터 초기화', exact: true }).click();
  9  |   await page.keyboard.press('Escape');
  10 |   await expect(page.getByRole('button', { name: '데모 데이터 초기화', exact: true })).toBeFocused();
  11 |   await page.getByRole('button', { name: '데모 데이터 초기화', exact: true }).click();
  12 |   await page.getByRole('button', { name: '초기화하기', exact: true }).click();
  13 |   await page.reload();
  14 |   await expect(page.getByTestId('checklist-count')).toHaveText('0 / 4');
  15 |   expect(await page.evaluate(() => localStorage.getItem('other-app'))).toBe('keep');
  16 | });
  17 | test('quota failure shows temporary state and no durable-save success', async ({ page }) => {
  18 |   await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('Full', 'QuotaExceededError'); }; });
  19 |   await page.goto('/manager/manual');
  20 |   await expect(page.getByRole('alert').filter({ hasText: '저장할 수 없어' })).toContainText('임시');
  21 |   const form = page.getByRole('form', { name: '행사 문의는 POS 확인 후 안내' });
  22 |   await form.getByLabel('규칙 내용').fill('임시 변경');
  23 |   await form.getByRole('button', { name: '규칙 저장' }).click();
  24 |   await expect(form.getByRole('status')).toContainText('저장하지 못했어요');
  25 |   await expect(form.getByRole('status')).not.toContainText('저장했어요');
  26 |   await page.reload();
  27 |   await expect(form.getByLabel('규칙 내용')).not.toHaveValue('임시 변경');
  28 | });
  29 | 
```