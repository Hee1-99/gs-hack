import { expect, test } from '@playwright/test';

test('unconfigured login explains demo scope and keeps practice and owner preview reachable',async({page})=>{
  await page.goto('/login');
  await expect(page.getByRole('heading',{name:'지금은 체험 모드예요'})).toBeVisible();
  await expect(page.getByText('로그인 서버 연결을 준비 중이에요. 현재 연습 기록은 이 브라우저에만 저장돼요.')).toBeVisible();
  await expect(page.getByLabel('비밀번호')).toHaveCount(0);
  await page.getByRole('link',{name:'로그인 없이 연습하기'}).click();
  await expect(page).toHaveURL(/\/crew\/simulation$/);
  await page.getByRole('link',{name:'경영주 관리',exact:true}).click();
  await expect(page).toHaveURL(/\/manager\/dashboard$/);
  await expect(page.getByRole('heading',{name:'연습 기록과 점수'})).toBeVisible();
});
