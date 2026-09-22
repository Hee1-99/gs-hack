export function credentialError(error: { code?: string; status?: number }, mode: 'login' | 'signup'): string {
  if (error.code === 'invalid_credentials') return '아이디 또는 비밀번호가 일치하지 않아요. 비밀번호의 대소문자와 공백을 확인해 주세요.';
  if (error.code === 'email_not_confirmed') return '계정 인증 설정을 확인해 주세요. 운영자가 이메일 확인을 꺼야 아이디로 바로 로그인할 수 있어요.';
  if (error.code === 'user_already_exists' || error.code === 'email_exists') return '이미 가입된 아이디예요. 로그인 탭에서 가입할 때 사용한 비밀번호로 로그인해 주세요.';
  if (error.status === 429 || error.code === 'over_request_rate_limit') return '로그인 요청이 많아요. 잠시 후 다시 시도해 주세요.';
  if (error.code === 'weak_password') return '비밀번호가 너무 간단해요. 영문, 숫자, 기호를 조합해 주세요.';
  if (error.code === 'user_banned') return '이 계정은 이용이 제한되어 있어요. 운영자에게 문의해 주세요.';
  if (error.status === 0 || (error.status && error.status >= 500)) return '로그인 서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.';
  return mode === 'login' ? '로그인을 완료하지 못했어요. 잠시 후 다시 시도해 주세요.' : '가입을 완료하지 못했어요. 잠시 후 다시 시도해 주세요.';
}
