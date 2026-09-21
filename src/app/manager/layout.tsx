import { RoleShell } from '@/components/role-shell';
import { OwnerGate } from '@/features/auth/account-menu';
export default function ManagerLayout({ children }: { children: React.ReactNode }) { return <OwnerGate><RoleShell role="manager">{children}</RoleShell></OwnerGate>; }
