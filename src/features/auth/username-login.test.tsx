import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { LoginScreen } from './login-screen';
import { useAuth } from './auth-provider';
vi.mock('./auth-provider',()=>({useAuth:vi.fn()}));
const signUp=vi.fn(),signInWithPassword=vi.fn(),refreshMembership=vi.fn();
const client={auth:{signUp,signInWithPassword}} as unknown as SupabaseClient;
const auth={configured:true,ready:true,user:null,membership:null,client,error:'',refreshMembership,signOut:vi.fn()};
beforeEach(()=>{vi.clearAllMocks();vi.mocked(useAuth).mockReturnValue(auth);vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','https://gstep-test.supabase.co');vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY','sb_publishable_test');signInWithPassword.mockResolvedValue({data:{session:{}},error:null});signUp.mockResolvedValue({data:{session:{}},error:null});});
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();});
function fill(username='My_ID'){fireEvent.change(screen.getByLabelText('아이디'),{target:{value:username}});fireEvent.change(screen.getByLabelText('비밀번호'),{target:{value:'test-password-123'}});}
it('normalizes username login to the internal reserved address without showing an email field',async()=>{render(<LoginScreen/>);fill();fireEvent.click(screen.getByRole('button',{name:'아이디로 로그인'}));await waitFor(()=>expect(signInWithPassword).toHaveBeenCalledWith({email:'my_id@id.gstep.invalid',password:'test-password-123'}));expect(screen.queryByLabelText('이메일')).toBeNull();});
it('blocks signup entirely when email confirmation is enabled',async()=>{const fetch=vi.fn().mockResolvedValue({ok:true,json:async()=>({mailer_autoconfirm:false,external:{email:true}})});vi.stubGlobal('fetch',fetch);render(<LoginScreen/>);fireEvent.click(screen.getByRole('button',{name:'회원가입'}));fill();fireEvent.click(screen.getByRole('button',{name:'아이디로 회원가입'}));await screen.findByText(/운영자가 이메일 확인을 꺼야/);expect(fetch).toHaveBeenCalledOnce();expect(signUp).not.toHaveBeenCalled();});
it('signs up only after verifying auto confirmation, with no redirect or email instruction',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({mailer_autoconfirm:true,external:{email:true}})}));render(<LoginScreen/>);fireEvent.click(screen.getByRole('button',{name:'회원가입'}));fill();fireEvent.click(screen.getByRole('button',{name:'아이디로 회원가입'}));await waitFor(()=>expect(signUp).toHaveBeenCalledWith({email:'my_id@id.gstep.invalid',password:'test-password-123'}));expect(screen.queryByText(/확인 메일을 보냈어요/)).toBeNull();});
it('rejects invalid usernames before any authentication request',async()=>{render(<LoginScreen/>);fill('이메일@example.com');fireEvent.submit(screen.getByLabelText('아이디').closest('form')!);await screen.findByText('아이디는 영문, 숫자, 밑줄(_)로 4~24자 입력해 주세요.');expect(signUp).not.toHaveBeenCalled();expect(signInWithPassword).not.toHaveBeenCalled();});
it('shows the account username and never its internal email address',()=>{vi.mocked(useAuth).mockReturnValue({...auth,user:{id:'one',email:'my_id@id.gstep.invalid'} as User});render(<LoginScreen/>);expect(screen.getByText('아이디 my_id')).toBeVisible();expect(screen.queryByText(/@id\.gstep\.invalid/)).toBeNull();});

it('fails closed when the signup settings cannot be verified',async()=>{vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new Error('offline')));render(<LoginScreen/>);fireEvent.click(screen.getByRole('button',{name:'회원가입'}));fill();fireEvent.click(screen.getByRole('button',{name:'아이디로 회원가입'}));await screen.findByText('연결하지 못했어요. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.');expect(signUp).not.toHaveBeenCalled();});
