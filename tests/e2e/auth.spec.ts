import { expect, test } from '@playwright/test';

test('login reflects server availability and keeps practice and owner preview reachable',async({page})=>{
  await page.goto('/login');
  const password = page.getByLabel('비밀번호');
  if (await password.count()) {
    await expect(page.getByRole('heading',{name:'로그인',exact:true})).toBeVisible();
    await expect(page.getByLabel('아이디')).toBeVisible();
    await expect(password).toBeVisible();
    await page.getByRole('link',{name:'먼저 체험해 보기'}).click();
  } else {
    await expect(page.getByRole('heading',{name:'지금은 체험 모드예요'})).toBeVisible();
    await expect(page.getByText('로그인 서버 연결을 준비 중이에요. 현재 연습 기록은 이 브라우저에만 저장돼요.')).toBeVisible();
    await page.getByRole('link',{name:'로그인 없이 연습하기'}).click();
  }
  await expect(page).toHaveURL(/\/crew\/simulation$/);
  await page.getByRole('link',{name:'경영주 관리',exact:true}).click();
  await expect(page).toHaveURL(/\/manager\/dashboard$/);
  await expect(page.getByRole('heading',{name:'매장 교육 현황'})).toBeVisible();
});
