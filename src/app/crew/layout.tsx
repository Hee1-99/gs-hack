import { RoleShell } from '@/components/role-shell';
import { AccountBoundary } from '@/features/auth/account-menu';
export default function CrewLayout({ children }: { children: React.ReactNode }) { return <AccountBoundary><RoleShell role="crew">{children}</RoleShell></AccountBoundary>; }
