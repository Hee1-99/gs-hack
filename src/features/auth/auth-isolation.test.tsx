import { render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import type { User } from '@supabase/supabase-js';
import { StoreProvider, useStore } from '@/data/store-provider';
import { AccountMenu, OwnerGate } from './account-menu';
import { LoginScreen } from './login-screen';
import { useAuth } from './auth-provider';
vi.mock('./auth-provider',()=>({useAuth:vi.fn()}));
const fallback={configured:false,ready:true,user:null,membership:null,client:null,error:'',refreshMembership:vi.fn(),signOut:vi.fn()};
beforeEach(()=>{localStorage.clear();vi.mocked(useAuth).mockReturnValue(fallback);});
function Probe(){const store=useStore();return <p>{store?'local content visible':'no content'}</p>;}
it('clearly explains unconfigured demo access without offering a broken login form',()=>{render(<LoginScreen/>);expect(screen.getByText('지금은 체험 모드예요')).toBeVisible();expect(screen.getByRole('link',{name:'로그인 없이 연습하기'})).toHaveAttribute('href','/crew/simulation');expect(screen.queryByLabelText('비밀번호')).toBeNull();});
it('does not expose guest store data or owner controls when authentication failed',()=>{vi.mocked(useAuth).mockReturnValue({...fallback,configured:true,error:'연결 실패'});render(<StoreProvider><Probe/><OwnerGate><p>owner content</p></OwnerGate><AccountMenu/></StoreProvider>);expect(screen.getByText('no content')).toBeVisible();expect(screen.queryByText('owner content')).toBeNull();expect(screen.queryByRole('link',{name:'경영주 관리'})).toBeNull();});
it('hides owner navigation and prevents a signed-in crew from viewing owner UI',()=>{vi.mocked(useAuth).mockReturnValue({...fallback,configured:true,user:{id:'crew'} as User,membership:{user_id:'crew',store_id:'store',role:'crew',display_name:'직원',store_name:'매장'}});render(<><AccountMenu/><OwnerGate><p>owner content</p></OwnerGate></>);expect(screen.getByText('경영주 전용 화면이에요')).toBeVisible();expect(screen.queryByText('owner content')).toBeNull();expect(screen.queryByRole('link',{name:'경영주 관리'})).toBeNull();});
