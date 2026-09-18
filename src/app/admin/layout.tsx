'use client';

import { usePathname } from 'next/navigation';
import { AdminGuard } from '@/components/admin-guard';
import { AdminToastProvider } from '@/components/admin-toast';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/admin/login') return <>{children}</>;
  return (
    <AdminGuard>
      <AdminToastProvider>{children}</AdminToastProvider>
    </AdminGuard>
  );
}
